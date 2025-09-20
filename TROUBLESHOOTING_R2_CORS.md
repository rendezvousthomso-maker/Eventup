# Troubleshooting R2 CORS and Upload Issues

## Current Issues Identified

1. **CORS Policy Missing**: Your R2 bucket doesn't have proper CORS configuration
2. **API Errors**: 500 errors when fetching event images
3. **Upload Failures**: Direct uploads to R2 are failing due to CORS

## Step-by-Step Fix

### 1. Configure CORS for R2 Bucket

Use the provided `cors-policy.json` file in the root directory:

```bash
# Install Wrangler CLI if not already installed
npm install -g wrangler

# Apply CORS policy to your bucket
wrangler r2 bucket cors put eventup-images --file cors-policy.json
```

**Alternative: Cloudflare Dashboard**
1. Go to Cloudflare Dashboard → R2 Object Storage
2. Click on your bucket (`eventup-images`)
3. Go to "Settings" tab
4. Find "CORS Policy" section
5. Paste the contents of `cors-policy.json`

### 2. Verify Environment Variables

Make sure these are set in your Vercel deployment:

```bash
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=eventup-images
```

### 3. Check R2 Bucket Permissions

Your R2 API token needs these permissions:
- Object Storage:Read
- Object Storage:Edit
- Zone:Zone Settings:Read (for the domain)

### 4. Verify Public Access (Optional)

If you want direct public access to images:

1. Go to R2 bucket settings
2. Enable "Public access"
3. Set up custom domain (recommended for production)

### 5. Test the Fix

After applying CORS:

1. Wait 2-3 minutes for propagation
2. Try uploading an image in create-event
3. Check browser console for any remaining errors
4. Check server logs for detailed error messages

## Debugging Commands

```bash
# Test CORS configuration
curl -H "Origin: https://eventup-xi.vercel.app" \
     -H "Access-Control-Request-Method: PUT" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://eventup-images.your-account-id.r2.cloudflarestorage.com/

# Check if bucket is accessible
wrangler r2 bucket list

# Verify CORS policy is applied
wrangler r2 bucket cors get eventup-images
```

## Common Issues

### Issue: "No 'Access-Control-Allow-Origin' header"
**Solution**: Apply the CORS policy above

### Issue: "403 Forbidden" on upload
**Solution**: Check R2 API token permissions

### Issue: "500 Internal Server Error" on image fetch
**Solution**: Verify environment variables are set correctly in production

### Issue: Images upload but don't display
**Solution**: Configure public access or custom domain for R2 bucket

## Production Checklist

- [ ] CORS policy applied to R2 bucket
- [ ] Environment variables set in Vercel
- [ ] R2 API token has correct permissions
- [ ] Custom domain configured (recommended)
- [ ] Public access enabled if using direct URLs
- [ ] Test image upload and display

## Alternative Solution: Server-Side Upload

If CORS continues to be problematic, you can modify the upload flow to go through your backend instead of direct R2 upload. This would involve:

1. Upload to your Next.js API route
2. Server processes and uploads to R2
3. Return the public URL

This bypasses CORS entirely but uses more server resources.
