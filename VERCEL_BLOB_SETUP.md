# Vercel Blob Storage Setup Guide

## Overview
This guide explains how to use Vercel Blob for file uploads in your EventUp application. Vercel Blob is a simple, fast, and reliable storage solution that works seamlessly with Vercel deployments.

## Features
- ✅ Simple API with no complex configuration
- ✅ Automatic CDN distribution
- ✅ Built-in image optimization
- ✅ No CORS issues
- ✅ Generous free tier
- ✅ Works automatically on Vercel

## Setup

### 1. Install Dependencies
```bash
npm install @vercel/blob
# or
pnpm add @vercel/blob
# or
yarn add @vercel/blob
```

### 2. Environment Variables
No additional environment variables are needed! Vercel Blob works automatically when deployed to Vercel.

For local development, you can:
- Use Vercel CLI: `vercel dev`
- Or deploy to Vercel for testing

### 3. API Routes
The following API routes are available:

#### Avatar Upload
```
POST /api/avatar/upload?filename=image.jpg
```

#### Event Image Upload
```
POST /api/events/upload?filename=image.jpg&eventId=event-id
```

#### List Event Images
```
GET /api/events/[id]/images
```

## Usage Examples

### Upload Avatar
```javascript
const response = await fetch(
  `/api/avatar/upload?filename=${file.name}`,
  {
    method: 'POST',
    body: file,
  },
);

const blob = await response.json();
console.log('Uploaded to:', blob.url);
```

### Upload Event Image
```javascript
const response = await fetch(
  `/api/events/upload?filename=${file.name}&eventId=${eventId}`,
  {
    method: 'POST',
    body: file,
  },
);

const result = await response.json();
console.log('Uploaded to:', result.url);
```

## File Organization
- Avatars: `avatars/{userId}/{timestamp}.{ext}`
- Event Images: `events/{eventId}/{timestamp}_{filename}`

## Benefits over R2
- ✅ No CORS configuration needed
- ✅ No pre-signed URLs required
- ✅ Simpler API
- ✅ Better integration with Vercel
- ✅ Automatic CDN
- ✅ Built-in image optimization

## Migration from R2
All R2-related code has been removed and replaced with Vercel Blob:
- ✅ Removed `lib/cloudflare-r2.ts`
- ✅ Removed R2 API routes
- ✅ Updated image upload components
- ✅ Updated event forms
- ✅ Updated image listing API

## Troubleshooting

### Local Development
If you encounter issues in local development:
1. Use `vercel dev` instead of `next dev`
2. Or deploy to Vercel for testing

### File Size Limits
- Maximum file size: 4.5MB per file
- Supported formats: JPG, PNG, GIF, WebP

### Rate Limits
- Free tier: 1,000 uploads per month
- Paid plans available for higher limits

## Support
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Blob API Reference](https://vercel.com/docs/storage/vercel-blob/using-the-sdk)

