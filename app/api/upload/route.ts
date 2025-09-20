// API route for handling image uploads to Cloudflare R2
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cloudflareR2 } from '@/lib/cloudflare-r2';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// DEPRECATED: This route is deprecated in favor of pre-signed URL flow
// Use /api/upload/presigned-url instead for new uploads
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This upload method is deprecated. Use /api/upload/presigned-url instead.' 
  }, { status: 400 });
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
