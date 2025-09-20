import { NextRequest, NextResponse } from 'next/server';
import { cloudflareR2 } from '@/lib/cloudflare-r2';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Check if R2 is configured
    const isR2Configured = process.env.CLOUDFLARE_R2_ACCOUNT_ID && 
                          process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
                          process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY && 
                          process.env.CLOUDFLARE_R2_BUCKET_NAME;

    if (!isR2Configured) {
      return NextResponse.json({ 
        success: true, 
        images: [],
        count: 0,
        message: 'R2 not configured'
      });
    }

    // List all files for this event from R2
    const r2Images = await cloudflareR2.listEventImages(eventId);

    // Generate public URLs for each image
    const imagesWithUrls = r2Images.map(image => {
      const filename = image.key.split('/').pop() || 'unknown';
      const publicUrl = cloudflareR2.getPublicUrl(image.key);
      
      return {
        key: image.key,
        filename,
        publicUrl,
        lastModified: image.lastModified,
        size: image.size,
        // Extract original filename from the key if possible
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

