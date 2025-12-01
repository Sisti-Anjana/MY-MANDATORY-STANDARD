# 🚀 Complete Backend Deployment Guide

## 📋 Current Status

- ✅ **Frontend:** Deployed at https://cleanleaf.netlify.app
- ⏳ **Backend:** Needs deployment
- ✅ **Database:** Supabase (already active)

---

## 🎯 Deployment Platform: Railway (Recommended)

Railway is free, easy to use, and perfect for Node.js backends.

### Why Railway?
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Easy environment variable management
- ✅ Automatic HTTPS
- ✅ No credit card required for free tier

---

## 📝 Step-by-Step Deployment

### **Step 1: Prepare Your Code**

1. **Ensure you're in the project directory:**
   ```bash
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy"
   ```

2. **Update server/index.js to use production database:**
   The server should use `database-production.js` in production. Let's verify the setup.

### **Step 2: Create GitHub Repository**

1. Go to https://github.com/new
2. Repository name: `portfolio-issue-tracker-backend`
3. Description: `Backend API for Portfolio Issue Tracker`
4. Choose **Private** or **Public**
5. **Don't** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### **Step 3: Push Code to GitHub**

**If you don't have Git initialized:**
```bash
git init
git add .
git commit -m "Initial commit for Railway deployment"
```

**Connect to GitHub and push:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/portfolio-issue-tracker-backend.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### **Step 4: Create Railway Account**

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with **GitHub** (recommended)
4. Authorize Railway to access your GitHub

### **Step 5: Deploy to Railway**

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `portfolio-issue-tracker-backend`
4. Railway will automatically detect Node.js

### **Step 6: Configure Railway Service**

1. Click on your deployed service
2. Go to **Settings** tab
3. Configure:
   - **Root Directory:** `server`
   - **Start Command:** `npm start`
   - **Build Command:** `npm install`

### **Step 7: Add Environment Variables**

1. In Railway, go to **Variables** tab
2. Add these environment variables:

| Key | Value |
|-----|-------|
| `PORT` | `5001` |
| `NODE_ENV` | `production` |
| `USE_SUPABASE` | `true` |
| `SUPABASE_URL` | `https://wkkclsbaavdlplcqrsyr.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g` |

**Important:** Railway will automatically redeploy after adding variables.

### **Step 8: Get Your Backend URL**

1. In Railway, go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://portfolio-issue-tracker-backend-production.up.railway.app`)
4. **This is your backend API URL!** 🎉

### **Step 9: Update Frontend to Use Backend**

1. Go to Netlify: https://app.netlify.com
2. Select your site: `cleanleaf`
3. Go to **Site settings** → **Environment variables**
4. Click **"Add variable"**
5. Add:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.up.railway.app/api` (use your actual Railway URL)
   - **Scope:** All scopes
6. Click **"Save"**

### **Step 10: Redeploy Frontend**

1. In Netlify, go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment (2-3 minutes)

---

## ✅ Verification

### **Test Backend:**
Visit in browser:
```
https://your-backend-url.up.railway.app/api/portfolios
```
You should see JSON data with portfolios.

### **Test Frontend:**
1. Visit: https://cleanleaf.netlify.app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Check for any API connection errors
5. Test all features

---

## 📋 Complete URLs After Deployment

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://cleanleaf.netlify.app | ✅ Live |
| **Backend API** | `https://your-backend-url.up.railway.app/api` | ⏳ After deployment |
| **Database** | Supabase (cloud) | ✅ Active |

---

## 🔧 Update Server to Use Production Database

The server needs to use `database-production.js` in production. Let's update `server/index.js`:

**Current:** `const db = require('./database');`

**Should be:** Use production database when `NODE_ENV=production`

Actually, let's check if we need to modify the server code. The `database-production.js` exists but `server/index.js` uses `./database`. We may need to update this.

---

## 🐛 Troubleshooting

### **Backend not starting?**
- Check Railway logs: Service → Deployments → View logs
- Verify all environment variables are set
- Make sure Root Directory is `server`
- Check that `USE_SUPABASE=true` is set

### **Frontend can't connect to backend?**
- Verify `REACT_APP_API_URL` is set in Netlify
- Make sure URL ends with `/api`
- Check CORS settings (should be enabled in backend)
- Redeploy frontend after adding variable

### **CORS errors?**
- Backend already has CORS enabled (`app.use(cors())`)
- Check Railway logs for errors
- Verify backend URL is correct

### **Database connection errors?**
- Verify Supabase credentials are correct
- Check `USE_SUPABASE=true` is set
- Verify `SUPABASE_SERVICE_KEY` is the service role key (not anon key)

---

## 🔄 Updating Backend Code

After making changes:

1. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Update backend code"
   git push
   ```

2. **Railway will automatically redeploy** (if connected to GitHub)

Or manually trigger:
- Go to Railway dashboard
- Click **"Redeploy"** button

---

## 📊 Monitoring

### **Railway Dashboard:**
- View logs in real-time
- Monitor resource usage
- Check deployment status
- View metrics

### **Netlify Dashboard:**
- View frontend logs
- Monitor build status
- Check deployment history

---

## 🎉 You're All Set!

Once deployed, you'll have:

- ✅ Complete full-stack application
- ✅ Frontend on Netlify: https://cleanleaf.netlify.app
- ✅ Backend on Railway: `https://your-backend-url.up.railway.app`
- ✅ Database on Supabase
- ✅ All URLs ready to share!

---

## 📞 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Netlify Docs:** https://docs.netlify.com
- **Supabase Docs:** https://supabase.com/docs

---

## 🚀 Quick Command Reference

```bash
# Initialize Git (if needed)
git init
git add .
git commit -m "Initial commit"

# Connect to GitHub
git remote add origin https://github.com/YOUR_USERNAME/portfolio-issue-tracker-backend.git
git branch -M main
git push -u origin main

# Update and redeploy
git add .
git commit -m "Update backend"
git push
```

