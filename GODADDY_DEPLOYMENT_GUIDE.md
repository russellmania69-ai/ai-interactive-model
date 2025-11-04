# GoDaddy Deployment Guide

## Step 1: Build Your Application

Run this command in your project directory:
```bash
npm run build
```

This creates a `dist` folder with your production files.

## Step 2: Upload to GoDaddy

### Option A: File Manager (Recommended for beginners)
1. Log in to your GoDaddy account
2. Go to "My Products" → "Web Hosting" → "Manage"
3. Click "File Manager" or "cPanel"
4. Navigate to `public_html` folder (or your domain's root)
5. Delete default files (index.html, etc.)
6. Upload ALL files from your `dist` folder
7. The `.htaccess` file is already in `public` folder and will be copied to `dist`

### Option B: FTP (Recommended for faster uploads)
1. Get FTP credentials from GoDaddy (Hosting → Manage → FTP)
2. Use FileZilla or any FTP client
3. Connect to your GoDaddy server
4. Navigate to `public_html`
5. Upload all files from `dist` folder

## Step 3: Verify .htaccess File

The `.htaccess` file should be in your `public_html` directory. It contains:
- SPA routing rules (redirects all routes to index.html)
- Security headers
- Compression settings

## Step 4: Test Your Site

Visit your domain: `https://www.ai-interactive-model.com`

Test these URLs:
- Homepage: `https://www.ai-interactive-model.com`
- About: `https://www.ai-interactive-model.com/about`
- Contact: `https://www.ai-interactive-model.com/contact`
- Admin Dashboard: `https://www.ai-interactive-model.com/admin`

All should work without 404 errors!

## Step 5: Configure Environment Variables (IMPORTANT!)

Your Supabase configuration needs production keys:

1. In GoDaddy cPanel, look for "Environment Variables" or add to `.htaccess`:
   ```
   SetEnv VITE_SUPABASE_URL "your-production-supabase-url"
   SetEnv VITE_SUPABASE_ANON_KEY "your-production-supabase-key"
   ```

2. Or update `src/lib/supabase.ts` with your production Supabase credentials before building

All should work without 404 errors!

## Troubleshooting

**500 Error?** 
- Check if .htaccess uploaded correctly
- Contact GoDaddy support to enable mod_rewrite

**404 on refresh?**
- Verify .htaccess is in public_html
- Check file permissions (644 for .htaccess)

**Blank page?**
- Check browser console for errors
- Verify all files uploaded from dist folder
