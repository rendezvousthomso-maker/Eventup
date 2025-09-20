// Utility functions for handling event images

export interface EventImage {
  key: string;
  filename: string;
  originalName: string;
  publicUrl: string;
  lastModified: Date;
  size: number;
}

export interface EventImageResponse {
  success: boolean;
  images: EventImage[];
  count: number;
}

/**
 * Fetch all images for a specific event
 */
export async function fetchEventImages(eventId: string): Promise<EventImage[]> {
  try {
    const response = await fetch(`/api/events/${eventId}/images`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch event images:', {
        status: response.status,
        statusText: response.statusText,
        eventId
      });
      
      // Try to get error details
      try {
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response');
      }
      
      return [];
    }

    const data: EventImageResponse = await response.json();
    return data.success ? data.images : [];
  } catch (error) {
    console.error('Error fetching event images:', {
      error,
      eventId,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return [];
  }
}

/**
 * Get the primary image for an event (first/most recent image)
 */
export function getPrimaryEventImage(images: EventImage[]): EventImage | null {
  if (images.length === 0) return null;
  
  // Return the first image (newest based on API sorting)
  return images[0];
}

/**
 * Upload an image and associate it with an event
 */
export async function uploadEventImage(
  file: File, 
  eventId: string
): Promise<{ success: boolean; url?: string; key?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Upload failed' };
    }

    return { 
      success: true, 
      url: result.url, 
      key: result.key 
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Upload failed' };
  }
}

/**
 * Generate public URL for an image path using environment variables
 */
export function generatePublicImageUrl(filePath: string): string {
  // Check for R2_PUBLIC_URL environment variable first
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (publicUrl) {
    return `${publicUrl}/${filePath}`;
  }

  // Fallback to public subdomain
  const publicSubdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_SUBDOMAIN;
  if (publicSubdomain) {
    return `https://${publicSubdomain}.r2.dev/${filePath}`;
  }
  
  // Fallback to custom domain
  const customDomain = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_CUSTOM_DOMAIN;
  if (customDomain) {
    return `${customDomain}/${filePath}`;
  }
  
  // Return placeholder if no public URL configured
  return '/placeholder.svg?height=256&width=400&query=event';
}
