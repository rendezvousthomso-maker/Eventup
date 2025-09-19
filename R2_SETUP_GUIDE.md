# Cloudflare R2 Setup Guide

## Overview
This guide explains how to set up Cloudflare R2 for file uploads in your EventUp application and how to test the API using curl.

## Environment Variables Setup

Add the following environment variables to your `.env.local` file:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=29b6e7fbdfbc9a0a14049d51ca871fea
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_BUCKET_NAME=eventup-images

# Optional: For public file access (choose one)
CLOUDFLARE_R2_PUBLIC_DOMAIN=https://pub-xxxxxxxxxxxx.r2.dev
# OR
CLOUDFLARE_R2_CUSTOM_DOMAIN=files.yourdomain.com
```

## How to Get R2 Credentials

1. **Access Cloudflare Dashboard:**
   - Go to [Cloudflare Dashboard > R2](https://dash.cloudflare.com/?to=/:account/r2)

2. **Create API Token:**
   - Click "Manage API tokens"
   - Choose "Create Account API token" or "Create User API token"
   - Under Permissions:
     - For full access: Select "Admin Read & Write"
     - For bucket-specific: Select "Object Read & Write" and scope to your bucket
   - Click "Create API token"

3. **Save Credentials:**
   - Copy the **Access Key ID** and **Secret Access Key**
   - Find your **Account ID** in the dashboard sidebar

4. **Create R2 Bucket:**
   - Go to R2 > Create bucket
   - Choose a unique bucket name
   - Select your region

5. **Configure Public Access (Optional):**
   - In your bucket settings, enable "Public Access" if you want direct public URLs
   - Or set up a custom domain for better performance

## API Endpoints

### Upload File via Your Next.js API
```bash
POST /api/upload
Content-Type: multipart/form-data
```

### Direct R2 S3-Compatible API
```bash
PUT https://{account_id}.r2.cloudflarestorage.com/{bucket_name}/{object_key}
```

## Testing with curl

### 1. Test Your Next.js Upload API

```bash
# Replace with your actual file and auth token
curl -X POST "http://localhost:3000/api/upload" \
  -H "Cookie: next-auth.session-token=your_session_token" \
  -F "file=@/path/to/your/image.jpg"
```

### 2. Direct R2 Upload (Advanced)

For direct R2 uploads, you need to generate AWS Signature Version 4. Here's a simplified example using AWS CLI (which handles signatures automatically):

```bash
# First, configure AWS CLI with your R2 credentials
aws configure set aws_access_key_id YOUR_R2_ACCESS_KEY_ID
aws configure set aws_secret_access_key YOUR_R2_SECRET_ACCESS_KEY
aws configure set region auto

# Upload using AWS CLI with R2 endpoint
aws s3 cp /path/to/your/file.jpg \
  s3://eventup-images/test-file.jpg \
  --endpoint-url https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com
```

### 3. Using aws4fetch for Browser/Node.js

For programmatic uploads with proper AWS v4 signatures:

```javascript
import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  region: 'auto',
  service: 's3',
});

const response = await aws.fetch(
  `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${objectKey}`,
  {
    method: 'PUT',
    body: fileBuffer,
    headers: {
      'Content-Type': 'image/jpeg',
    },
  }
);
```

## Common Issues and Solutions

### 1. ACL Not Supported
**Error:** `ACL not supported`
**Solution:** R2 doesn't support object-level ACLs. Use bucket-level public access instead.

### 2. Files Not Publicly Accessible
**Error:** Files uploaded but not accessible via public URL
**Solution:** 
- Enable public access in your R2 bucket settings
- Set up a custom domain
- Configure `CLOUDFLARE_R2_PUBLIC_DOMAIN` or `CLOUDFLARE_R2_CUSTOM_DOMAIN`

### 3. CORS Issues
**Error:** CORS errors when uploading from browser
**Solution:** Configure CORS in your R2 bucket:
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 4. Invalid Endpoint
**Error:** `InvalidEndpoint` or connection errors
**Solution:** Ensure your endpoint URL is correct:
- Standard: `https://{account_id}.r2.cloudflarestorage.com`
- EU: `https://{account_id}.eu.r2.cloudflarestorage.com`
- FedRAMP: `https://{account_id}.fedramp.r2.cloudflarestorage.com`

## Production Considerations

1. **Custom Domain:** Set up a custom domain for better performance and branding
2. **CDN:** Use Cloudflare's CDN for better global performance
3. **Image Optimization:** Consider Cloudflare Images for automatic optimization
4. **Security:** Use presigned URLs for direct uploads to avoid exposing credentials
5. **Monitoring:** Set up monitoring for upload failures and storage usage

## Cost Optimization

- R2 offers free egress (bandwidth) unlike other S3-compatible services
- First 10GB of storage per month is free
- Put/Delete operations: First 1 million per month free
- Class A operations (List, etc.): First 10,000 per month free

## Links

- [R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
