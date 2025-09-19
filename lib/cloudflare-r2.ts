// Cloudflare R2 Storage Service
// S3-compatible storage with free egress and generous free tier

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface CloudflareR2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

class CloudflareR2Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(config: CloudflareR2Config) {
    this.bucketName = config.bucketName;
    
    this.s3Client = new S3Client({
      region: "auto", // Cloudflare R2 uses "auto"
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Upload a file to Cloudflare R2
   */
  async uploadFile(
    file: File | Buffer, 
    key: string, 
    contentType?: string
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType || 'image/jpeg',
        // Note: R2 doesn't support ACL, use bucket-level public access or custom domain
      });

      await this.s3Client.send(command);
      
      // Return the public URL - you need to configure a custom domain or public bucket access
      // For public buckets: https://pub-<bucket-subdomain>.r2.dev/<key>
      // For custom domain: https://your-domain.com/<key>
      return this.getPublicUrl(key);
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Delete a file from Cloudflare R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.error('Error deleting from R2:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Generate a presigned URL for direct upload from frontend
   */
  async getPresignedUploadUrl(
    key: string, 
    contentType: string,
    expiresIn: number = 3600 // 1 hour
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
        // Note: R2 doesn't support ACL in presigned URLs
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  /**
   * Generate filename for uploaded image
   */
  generateImageKey(userId: string, originalFilename: string): string {
    const timestamp = Date.now();
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    return `events/${userId}/${timestamp}.${extension}`;
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    // For public buckets, the URL should include the bucket name
    // First, try the public subdomain format (if bucket has public access enabled)
    const publicSubdomain = process.env.CLOUDFLARE_R2_PUBLIC_SUBDOMAIN;
    if (publicSubdomain) {
      return `https://${publicSubdomain}.r2.dev/${key}`;
    }
    
    // Fallback to a custom domain if configured
    const customDomain = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN;
    if (customDomain) {
      return `${customDomain}/${key}`;
    }
    
    // If no public access is configured, return a placeholder
    // You'll need to enable public access for your bucket in Cloudflare dashboard
    console.warn('No public URL configuration found. Please enable public access for your R2 bucket.');
    return `https://your-bucket-public-url.r2.dev/${key}`;
  }
}

// Create singleton instance
const r2Config: CloudflareR2Config = {
  accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID!,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
};

export const cloudflareR2 = new CloudflareR2Service(r2Config);
export default cloudflareR2;
