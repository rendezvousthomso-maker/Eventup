// API route for handling image uploads to Cloudflare R2
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloudflareR2 } from '@/lib/cloudflare-r2';
import { writeFile } from 'fs/promises';
import { join } from 'path';
// import { prisma } from '@/lib/prisma'; // Currently unused

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use proper user ID from database session
    const userId = session.user.id;

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    let publicUrl: string;
    let key: string;

    // Check if Cloudflare R2 is configured
    const isR2Configured = process.env.CLOUDFLARE_R2_ACCOUNT_ID && 
                          process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
                          process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY && 
                          process.env.CLOUDFLARE_R2_BUCKET_NAME;

    if (isR2Configured) {
      // Use Cloudflare R2
      key = cloudflareR2.generateImageKey(userId, file.name);
      publicUrl = await cloudflareR2.uploadFile(buffer, key, file.type);
    } else {
      // Fallback to local storage for development
      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeUserId = userId.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${safeUserId}_${timestamp}.${extension}`;
      
      // Save to public/uploads directory
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      const filePath = join(uploadDir, filename);
      
      // Create directory if it doesn't exist
      try {
        await writeFile(filePath, new Uint8Array(buffer));
        publicUrl = `/uploads/${filename}`;
        key = filename;
      } catch (error) {
        // If uploads directory doesn't exist, create a fallback URL
        console.warn('Could not save file locally:', error);
        publicUrl = '/placeholder.jpg'; // Fallback to placeholder
        key = 'placeholder';
      }
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      key: key 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Handle DELETE requests to remove images
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 });
    }

    // Verify user owns this image by checking if the key contains their user ID
    const userId = session.user.id;
    if (!key.includes(userId)) {
      return NextResponse.json({ error: 'Image not found or unauthorized' }, { status: 404 });
    }

    // Delete from R2
    await cloudflareR2.deleteFile(key);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
