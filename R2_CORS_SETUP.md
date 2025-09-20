# Cloudflare R2 CORS Configuration

## The Problem
You're getting a CORS error because R2 buckets don't allow cross-origin requests by default. The frontend can't upload directly to R2 without proper CORS configuration.

## Solution: Configure CORS for your R2 Bucket

### Method 1: Using Cloudflare Dashboard

1. Go to Cloudflare Dashboard → R2 Object Storage
2. Click on your bucket (`eventup-images`)
3. Go to "Settings" tab
4. Find "CORS Policy" section
5. Add this CORS configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://eventup-xi.vercel.app"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### Method 2: Using Wrangler CLI

1. Install Wrangler if you haven't:
```bash
npm install -g wrangler
```

2. Create a CORS policy file `cors-policy.json`:
```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://eventup-xi.vercel.app"
    ],
    "AllowedMethods": [
      "GET",
      "PUT", 
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

3. Apply the CORS policy:
```bash
wrangler r2 bucket cors put eventup-images --file cors-policy.json
```

### Method 3: Using AWS CLI (if configured)

```bash
aws s3api put-bucket-cors \
  --bucket eventup-images \
  --cors-configuration file://cors-policy.json \
  --endpoint-url https://29b6e7fbdfbc9a0a14049d51ca871fea.r2.cloudflarestorage.com
```

## Important Notes

1. **Replace domains**: Update `"https://eventup-xi.vercel.app"` with your actual production domain
2. **Security**: For production, be more specific with allowed origins instead of using wildcards
3. **Verification**: After applying, wait a few minutes for changes to propagate

## Verify CORS Configuration

You can verify the CORS configuration is working by:

1. Opening browser dev tools
2. Going to Network tab
3. Trying the upload again
4. You should see the OPTIONS preflight request succeed

## Alternative: Server-Side Upload (Fallback)

If CORS configuration is problematic, you can fallback to server-side uploads by reverting to the old upload flow through your backend.
