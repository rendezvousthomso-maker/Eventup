import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // List all blobs with the event prefix
    const { blobs } = await list({
      prefix: `events/${eventId}/`,
    });

    // Transform blobs to match the expected format
    const imagesWithUrls = blobs.map(blob => {
      const filename = blob.pathname.split('/').pop() || 'unknown';
      
      return {
        key: blob.pathname,
        filename,
        publicUrl: blob.url,
        lastModified: new Date(blob.uploadedAt),
        size: blob.size,
        // Extract original filename from the pathname if possible
        originalName: filename.includes('_') ? filename.split('_').slice(1).join('_') : filename
      };
    });

    // Sort by last modified (newest first)
    imagesWithUrls.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    return NextResponse.json({ 
      success: true, 
      images: imagesWithUrls,
      count: imagesWithUrls.length
    });

  } catch (error) {
    console.error('Error fetching event images:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        eventId: params.id
      },
      { status: 500 }
    );
  }
}

