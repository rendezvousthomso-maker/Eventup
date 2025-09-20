#!/bin/bash

# Script to apply CORS policy to Cloudflare R2 bucket
# Make sure you have wrangler CLI installed: npm install -g wrangler

set -e

BUCKET_NAME="eventup-images"
CORS_FILE="cors-policy.json"

echo "🚀 Applying CORS policy to R2 bucket: $BUCKET_NAME"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI is not installed. Installing..."
    npm install -g wrangler
fi

# Check if CORS file exists
if [ ! -f "$CORS_FILE" ]; then
    echo "❌ CORS policy file not found: $CORS_FILE"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Apply CORS policy
echo "📋 Applying CORS policy from $CORS_FILE..."
wrangler r2 bucket cors put "$BUCKET_NAME" --file "$CORS_FILE"

echo "✅ CORS policy applied successfully!"

# Verify the policy was applied
echo "🔍 Verifying CORS policy..."
echo "Current CORS policy for bucket $BUCKET_NAME:"
wrangler r2 bucket cors get "$BUCKET_NAME"

echo ""
echo "🎉 CORS configuration complete!"
echo "Please wait 2-3 minutes for the changes to propagate."
echo "Then test your image upload functionality."
