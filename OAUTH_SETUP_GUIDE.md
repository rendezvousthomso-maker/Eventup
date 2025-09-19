# 🔐 Google OAuth Setup Guide for EventUp

## 🚨 **Current Issue: OAuth Callback Error**

You're experiencing a **Google OAuth callback error** during authentication. This is typically caused by a **redirect URI mismatch** between your Google Cloud Console settings and your deployed application.

## 🔧 **Quick Fix Steps**

### 1. **Update Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Find your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://eventup-dkzsjweqk-rendezvousthomso-7506s-projects.vercel.app/api/auth/callback/google
   ```
   
   **⚠️ Important**: The URL must match EXACTLY with your Vercel deployment URL.

### 2. **Environment Variables Setup**

Create a `.env.local` file in your project root with:

```bash
# Database
DATABASE_URL="your-postgresql-url"

# NextAuth
NEXTAUTH_URL="https://your-vercel-deployment-url.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret-32-chars-long"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. **Vercel Environment Variables**

In your Vercel dashboard:
1. Go to **Settings > Environment Variables**
2. Add all the variables from above
3. **Redeploy** your application

## 🔍 **Troubleshooting the Current Error**

The error you're seeing indicates:

```
JavaScript chunk loading error from: 
https://eventup-dkzsjweqk-rendezvousthomso-7506s-projects.vercel.app/_next/static/chunks/715-03de6f7ebd048a01.js
```

This happens when:
1. **Redirect URI mismatch** - Google can't callback properly
2. **Environment variables missing** - OAuth configuration incomplete
3. **NEXTAUTH_URL mismatch** - Base URL doesn't match deployment

## ✅ **What I've Fixed**

1. **Improved error handling** in OAuth callbacks
2. **Better redirect logic** with try-catch blocks
3. **Enhanced error page** with specific OAuth error messages
4. **Reduced console logging** (only in development)
5. **Added security headers** for auth endpoints

## 🚀 **Next Steps**

1. **Update Google OAuth settings** with correct redirect URI
2. **Set environment variables** in Vercel
3. **Redeploy** the application
4. **Test OAuth flow** again

## 📋 **Required Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Your application URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random 32+ character string | `your-secret-here` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `305802835438-abc...` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `GOCSPX-abc...` |

## 🆘 **Still Having Issues?**

If you continue to experience problems:

1. Check the **browser console** for specific error messages
2. Verify **Google Cloud Console** redirect URIs match exactly
3. Ensure **environment variables** are set in Vercel
4. Try **incognito mode** to avoid cached authentication states
5. Check the **Vercel deployment logs** for server-side errors

The OAuth flow should work properly once the redirect URI configuration is corrected in Google Cloud Console.
