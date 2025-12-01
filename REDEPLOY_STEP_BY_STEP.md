# 🚀 Step-by-Step Redeployment Guide

## ✅ Quick Redeploy (Easiest Method)

### Method 1: Using the Script (Recommended)

1. **Right-click** on `REDEPLOY.bat`
2. Select **"Run as administrator"**
3. Click **"Yes"** if Windows asks for permission
4. **Wait** for it to complete (3-4 minutes)
5. **Done!** Your changes are live

---

### Method 2: Manual Commands

If the script doesn't work, follow these steps:

#### Step 1: Open Command Prompt
- Press `Windows Key + R`
- Type: `cmd`
- Press **Enter**

#### Step 2: Navigate to Your Project
Copy and paste this command (press Enter after):
```bash
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy"
```

#### Step 3: Build the Application
```bash
cd client
npm run build
```
**Wait** for it to finish (1-2 minutes)
You'll see: `✓ Build complete` or similar

#### Step 4: Go Back to Main Folder
```bash
cd ..
```

#### Step 5: Deploy to Netlify
```bash
netlify deploy --prod
```
**Wait** for it to finish (1-2 minutes)

#### Step 6: Done!
You'll see a message with your live URL: `https://cleanleaf.netlify.app`

---

## 📋 What Happens During Deployment

1. **Building** - Compiles your React app (1-2 min)
2. **Uploading** - Sends files to Netlify (1-2 min)
3. **Deploying** - Makes it live (30 seconds)
4. **Complete** - Your changes are live!

---

## ✅ After Deployment

1. **Visit:** `https://cleanleaf.netlify.app`
2. **Test the fixes:**
   - Portfolio locks should sync within 2-4 seconds
   - Green cards should sync within 3-6 seconds
   - Issues should appear within 3-6 seconds

---

## 🆘 Troubleshooting

### Script Won't Run?
- Right-click → "Run as administrator"
- Or use Method 2 (Manual Commands)

### Build Fails?
- Make sure you're in the correct folder
- Try: `cd client && npm install && npm run build`

### Netlify Not Logged In?
- Run: `netlify login`
- Then try deployment again

### Need Help?
- Check the error message
- Make sure Node.js is installed
- Make sure Netlify CLI is installed

---

## 🎉 You're Ready!

Choose Method 1 (script) or Method 2 (manual) and redeploy!



