# Test Commands for Your R2 Bucket

## Your R2 Configuration
- **Account ID**: `29b6e7fbdfbc9a0a14049d51ca871fea`
- **Bucket Name**: `eventup-images`
- **Endpoint**: `https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com`

## Required Environment Variables

Create a `.env.local` file with:
```bash
CLOUDFLARE_R2_ACCOUNT_ID=29b6e7fbdfbc9a0a14049d51ca871fea
CLOUDFLARE_R2_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME=eventup-images
```

## Test Commands

### 1. Test with AWS CLI

```bash
# Configure AWS CLI (one time setup)
aws configure set aws_access_key_id YOUR_R2_ACCESS_KEY_ID
aws configure set aws_secret_access_key YOUR_R2_SECRET_ACCESS_KEY
aws configure set region auto

# Test upload
aws s3 cp test-image.jpg \
  s3://eventup-images/test/test-image.jpg \
  --endpoint-url https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com

# List files in bucket
aws s3 ls s3://eventup-images/ \
  --endpoint-url https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com

# Test download
aws s3 cp s3://eventup-images/test/test-image.jpg downloaded-image.jpg \
  --endpoint-url https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com
```

### 2. Test Your Next.js API

```bash
# Test your upload endpoint (make sure your app is running on localhost:3000)
curl -X POST "http://localhost:3000/api/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.jpg"
```

### 3. Direct HTTP Upload (Advanced)

For direct HTTP uploads, you need to generate AWS Signature Version 4. Here's a Node.js script to test:

```javascript
// test-r2-upload.js
const { AwsClient } = require('aws4fetch');
const fs = require('fs');

async function testR2Upload() {
  const aws = new AwsClient({
    accessKeyId: 'YOUR_R2_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_R2_SECRET_ACCESS_KEY',
    region: 'auto',
    service: 's3',
  });

  const fileBuffer = fs.readFileSync('test-image.jpg');
  const objectKey = 'test/direct-upload.jpg';
  
  try {
    const response = await aws.fetch(
      `https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com/eventup-images/${objectKey}`,
      {
        method: 'PUT',
        body: fileBuffer,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      }
    );

    if (response.ok) {
      console.log('Upload successful!');
      console.log('File URL:', `https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com/eventup-images/${objectKey}`);
    } else {
      console.error('Upload failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testR2Upload();
```

Run it with:
```bash
npm install aws4fetch
node test-r2-upload.js
```

## Setting Up Public Access

To make your uploaded files publicly accessible, you need to:

1. **Go to Cloudflare Dashboard** → R2 → Your `eventup-images` bucket
2. **Enable Public Access**:
   - Click on your bucket
   - Go to Settings → Public access
   - Enable "Allow access"
   - Note the public URL domain (usually like `https://pub-xxxxxxxx.r2.dev`)

3. **Update your environment variables**:
```bash
# Add this to your .env.local
CLOUDFLARE_R2_PUBLIC_DOMAIN=https://pub-xxxxxxxx.r2.dev
```

## Troubleshooting

### Common Errors:

1. **403 Forbidden**: Check your access keys and permissions
2. **404 Not Found**: Verify bucket name and account ID
3. **InvalidEndpoint**: Ensure endpoint URL is correct
4. **Files not publicly accessible**: Enable public access in bucket settings

### Verify Setup:

```bash
# Check if bucket exists and is accessible
aws s3 ls s3://eventup-images/ \
  --endpoint-url https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com
```

This should list the contents of your bucket if everything is configured correctly.
