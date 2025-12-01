# 🚀 Backend Deployment - Step by Step

## 📋 Quick Overview

Deploy your backend to **Railway** (free, easy, recommended)

**Result:**
- Frontend: `https://cleanleaf.netlify.app` (already done ✅)
- Backend: `https://your-backend.railway.app/api` (to deploy)

---

## 🎯 Step-by-Step Guide

### **Step 1: Create GitHub Repository**

1. Go to: https://github.com/new
2. Repository name: `portfolio-issue-tracker-backend`
3. Make it **Private** (recommended) or **Public**
4. **DO NOT** check "Initialize with README"
5. Click **"Create repository"**

---

### **Step 2: Push Code to GitHub**

**Option A: Using Command Line**

```bash
# If not already in Git repo
git init
git add .
git commit -m "Initial commit for Railway deployment"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/portfolio-issue-tracker-backend.git
git branch -M main
git push -u origin main
```

**Option B: Using GitHub Desktop**
1. Download GitHub Desktop: https://desktop.github.com
2. File → Add Local Repository
3. Select your project folder
4. Publish repository to GitHub

---

### **Step 3: Create Railway Account**

1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Sign in with **GitHub** (recommended - easiest)
4. Authorize Railway to access your GitHub

---

### **Step 4: Deploy to Railway**

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `portfolio-issue-tracker-backend`
4. Railway will automatically detect Node.js and start deploying

---

### **Step 5: Configure Railway Service**

1. Click on your deployed service
2. Go to **Settings** tab
3. Configure:
   - **Root Directory:** `server`
   - **Start Command:** `npm start`
   - **Build Command:** `npm install`

---

### **Step 6: Add Environment Variables**

1. In Railway, go to **Variables** tab
2. Click **"New Variable"**
3. Add these variables one by one:

| Key | Value |
|-----|-------|
| `PORT` | `5001` |
| `NODE_ENV` | `production` |
| `USE_SUPABASE` | `true` |
| `SUPABASE_URL` | `https://wkkclsbaavdlplcqrsyr.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g` |

4. Railway will automatically redeploy after adding variables

---

### **Step 7: Get Your Backend URL**

1. In Railway, go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://portfolio-issue-tracker-backend-production.up.railway.app`)
4. **This is your backend URL!** 🎉

**Test it:** Visit `https://your-backend-url.up.railway.app/api/portfolios` in browser
- Should return JSON data ✅

---

### **Step 8: Connect Frontend to Backend**

1. Go to Netlify: https://app.netlify.com
2. Select your site: `cleanleaf`
3. Go to **Site settings** → **Environment variables**
4. Click **"Add variable"**
5. Add:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.up.railway.app/api` (use your actual Railway URL)
   - **Scope:** All scopes
6. Click **"Save"**

---

### **Step 9: Redeploy Frontend**

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
Should return JSON data with portfolios.

### **Test Frontend:**
1. Visit: https://cleanleaf.netlify.app
2. Open DevTools (F12) → Console tab
3. Check for any API connection errors
4. Test all features

---

## 🐛 Troubleshooting

### **Backend not starting?**
- Check Railway logs: Service → Deployments → View logs
- Verify all environment variables are set
- Make sure Root Directory is `server`
- Check that `USE_SUPABASE=true` is set

### **Frontend can't connect?**
- Verify `REACT_APP_API_URL` is set in Netlify
- Make sure URL ends with `/api`
- Check backend URL is correct
- Redeploy frontend after adding variable

### **CORS errors?**
- Backend already has CORS enabled
- Check Railway logs for errors
- Verify backend is running

---

## 📋 Complete URLs After Deployment

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://cleanleaf.netlify.app | ✅ Live |
| **Backend API** | `https://your-backend-url.up.railway.app/api` | ⏳ After deployment |
| **Database** | Supabase (cloud) | ✅ Active |

---

## 🎉 You're Done!

After completing all steps:
- ✅ Backend deployed to Railway
- ✅ Frontend connected to backend
- ✅ Everything working together!

**Your complete application:**
- Frontend: https://cleanleaf.netlify.app
- Backend: `https://your-backend-url.up.railway.app/api`

---

## 📞 Need Help?

- **Railway Docs:** https://docs.railway.app
- **Netlify Docs:** https://docs.netlify.com
- **Check logs:** Railway Dashboard → Your Service → Deployments → View Logs

