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
    const eventId = searchParams.get('eventId');

    if (!filename || !eventId) {
      return NextResponse.json({ 
        error: 'Filename and eventId are required' 
      }, { status: 400 });
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

    // Generate a unique filename with timestamp and event ID
    const timestamp = Date.now();
    const extension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `events/${eventId}/${timestamp}_${sanitizedFilename}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, file, {
      access: 'public',
      contentType: `image/${extension}`,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: uniqueFilename,
      size: blob.size,
      uploadedAt: blob.uploadedAt
    });

  } catch (error) {
    console.error('Event image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload event image' },
      { status: 500 }
    );
  }
}

