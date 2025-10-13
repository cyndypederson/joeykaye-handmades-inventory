# 🚀 Joey Kaye Handmades - Quick Deployment Guide

## ✅ What's Already Done:

1. ✅ Project created and configured
2. ✅ Yarn tracking fields added (color & amount)
3. ✅ Port set to 3003 for localhost
4. ✅ Default password set to `password2025`
5. ✅ Dependencies installed
6. ✅ Git initialized and committed
7. ✅ MongoDB configured (will use same cluster as Embroidery project)
8. ✅ GitHub remote added

## 📋 What You Need to Do:

### STEP 1: Create GitHub Repository (Browser is already open)

In the GitHub page that just opened (https://github.com/new):

1. Repository name: **joeykaye-handmades-inventory**
2. Set to: **Private** (recommended)
3. Do NOT check "Initialize with README" (we have one)
4. Click "**Create repository**"

### STEP 2: Push to GitHub

After creating the repository, run this command:

```bash
cd /Users/cyndyp/Desktop/Projects/JoeyKayeHandmades
git push -u origin main
```

### STEP 3: Deploy to Vercel

1. Go to: **https://vercel.com/new**
2. Click "**Import Git Repository**"
3. Select: **joeykaye-handmades-inventory**
4. Click "**Import**"
5. In "**Environment Variables**", add these:

```
MONGODB_URI=mongodb+srv://cyndypstitchcraft_db_user:4G2vcEQSjAvJoUxY@embroider-inventory.2x57teq.mongodb.net/?retryWrites=true&w=majority&appName=embroider-inventory

ADMIN_USERNAME=admin

ADMIN_PASSWORD=password2025

SESSION_SECRET=joeykaye-secret-key-2025

NODE_ENV=production
```

6. Click "**Deploy**"

## 🎉 Testing

### Local Testing (Right Now!)
```bash
cd /Users/cyndyp/Desktop/Projects/JoeyKayeHandmades
npm run pm2:start
```

Then visit: **http://localhost:3003**
- Username: `admin`
- Password: `password2025`

### After Vercel Deployment
Your live site will be at: **https://joeykaye-handmades-inventory.vercel.app**

## 🗄️ MongoDB Database

- The app uses the same MongoDB Atlas cluster as your Embroidery project
- It automatically creates a separate database: **joeykaye_handmades**
- Your Embroidery data is in: **embroidery_inventory** (completely separate)
- No additional MongoDB setup needed!

## 🎨 Yarn Tracking Feature

When adding projects, you'll see these new fields:
- **Yarn Color**: e.g., "Navy Blue", "Forest Green"
- **Yarn Amount**: e.g., "3 skeins", "200g", "2 balls"

These display with nice icons in the project lists!

## 📱 Running Both Apps Together

You can run both apps simultaneously:
- **Embroidery App**: http://localhost:3002
- **Joey Kaye App**: http://localhost:3003

Both use different ports and different MongoDB databases!

