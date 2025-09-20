// API route for generating pre-signed URLs for direct R2 upload
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloudflareR2 } from '@/lib/cloudflare-r2';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename, contentType, eventId } = await request.json();

    if (!filename || !contentType || !eventId) {
      return NextResponse.json({ 
        error: 'Missing required fields: filename, contentType, eventId' 
      }, { status: 400 });
    }

    // Validate content type
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'File must be an image' 
      }, { status: 400 });
    }

    // Check if Cloudflare R2 is configured
    const isR2Configured = process.env.CLOUDFLARE_R2_ACCOUNT_ID && 
                          process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
                          process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY && 
                          process.env.CLOUDFLARE_R2_BUCKET_NAME;

    if (!isR2Configured) {
      return NextResponse.json({ 
        error: 'R2 storage is not configured' 
      }, { status: 500 });
    }

    // Generate unique key for the image
    const key = cloudflareR2.generateImageKey(eventId, filename);

    // Generate pre-signed URL for upload (valid for 1 hour)
    const presignedUrl = await cloudflareR2.getPresignedUploadUrl(key, contentType, 3600);

    // Generate the public URL that will be available after upload
    const publicUrl = cloudflareR2.getPublicUrl(key);

    return NextResponse.json({ 
      success: true,
      presignedUrl,
      publicUrl,
      key
    });

  } catch (error) {
    console.error('Presigned URL generation error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('Environment check:', {
      accountId: !!process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      accessKeyId: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
