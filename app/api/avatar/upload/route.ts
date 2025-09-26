import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Validate filename
    if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Get the file from the request body
    const file = request.body;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate a unique filename with timestamp and user ID
    const timestamp = Date.now();
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFilename = `avatars/${session.user.id}/${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: 'public',
      contentType: `image/${extension}`,
    });

    return NextResponse.json(blob);

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}

