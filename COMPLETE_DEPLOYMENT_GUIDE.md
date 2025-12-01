# 🚀 Complete Deployment Guide - Frontend + Backend

## 📊 Current Status

✅ **Frontend:** Deployed to Netlify  
⏳ **Backend:** Needs deployment  
✅ **Database:** Supabase (already active)

---

## 🎯 Your Final URLs (After Backend Deployment)

Once deployed, you'll have:

1. **Frontend URL:** `https://cleanleaf.netlify.app` ✅ (Already deployed)
2. **Backend URL:** `https://your-backend-url.up.railway.app` ⏳ (To be deployed)
3. **API Base URL:** `https://your-backend-url.up.railway.app/api` ⏳

---

## 🚀 Step-by-Step: Deploy Backend Server

### **RECOMMENDED: Railway.app** (Easiest)

#### Step 1: Create Railway Account
1. Go to: **https://railway.app/**
2. Click **"Start a New Project"**
3. Sign in with **GitHub** (easiest)

#### Step 2: Create GitHub Repository
1. Go to: **https://github.com/new**
2. Repository name: `portfolio-issue-tracker-backend`
3. Make it **Private**
4. Click **"Create repository"**

#### Step 3: Upload Code to GitHub
1. On the GitHub page, click **"uploading an existing file"**
2. Drag and drop your **ENTIRE project folder**
   - Location: `C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy`
3. Wait for upload
4. Click **"Commit changes"**

#### Step 4: Deploy to Railway
1. Back in Railway, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: `portfolio-issue-tracker-backend`
4. Railway will auto-detect Node.js

#### Step 5: Configure Deployment
1. Click on your service
2. Go to **"Settings"** tab
3. Set:
   - **Root Directory:** `server`
   - **Start Command:** `npm start`
   - **Build Command:** `npm install`

#### Step 6: Add Environment Variables
In **Settings** → **Variables**, add:

| Key | Value |
|-----|-------|
| `PORT` | `5001` |
| `NODE_ENV` | `production` |
| `SUPABASE_URL` | `https://wkkclsbaavdlplcqrsyr.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2xzYmFhdmRscGxjcXJzeXIiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzMwNjQzNzIzLCJleHAiOjIwNDYyMTk3MjN9.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g` |
| `JWT_SECRET` | `portfolio-issue-tracker-jwt-secret-2024` |

#### Step 7: Get Your Backend URL
1. In **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://portfolio-issue-tracker-backend-production.up.railway.app`)
4. **This is your backend server URL!** 🎉

#### Step 8: Update Frontend Environment Variable
1. Go to Netlify: https://app.netlify.com
2. Select your site: `cleanleaf`
3. Go to **"Site settings"** → **"Environment variables"**
4. Click **"Add variable"**
5. Add:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.up.railway.app/api` (use your actual URL from Step 7)
   - **Scope:** All scopes
6. Click **"Save"**

#### Step 9: Redeploy Frontend
1. In Netlify, go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment (2-3 minutes)

---

## ✅ Verification

### Test Backend:
Visit in browser:
```
https://your-backend-url.up.railway.app/api/portfolios
```
You should see JSON data.

### Test Frontend:
1. Visit: `https://cleanleaf.netlify.app`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Check for any API connection errors
5. Test all features

---

## 📋 Your Complete Deployment URLs

After completing all steps:

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | `https://cleanleaf.netlify.app` | ✅ Live |
| **Backend API** | `https://your-backend-url.up.railway.app/api` | ⏳ After deployment |
| **Database** | Supabase (cloud) | ✅ Active |

---

## 🆘 Troubleshooting

### Backend not starting?
- Check Railway logs: Service → Deployments → View logs
- Verify all environment variables are set
- Make sure Root Directory is `server`

### Frontend can't connect?
- Verify `REACT_APP_API_URL` is set in Netlify
- Make sure URL ends with `/api`
- Redeploy frontend after adding variable

### CORS errors?
- Backend already has CORS enabled
- Check Railway logs for errors

---

## 📚 Detailed Guides

- **Railway Deployment:** `DEPLOY_BACKEND_TO_RAILWAY.md`
- **Render Deployment:** `DEPLOY_BACKEND_TO_RENDER.md` (Alternative)
- **Quick Helper:** Run `DEPLOY_BACKEND.bat`

---

## 🎉 You're Almost There!

Follow the steps above to deploy your backend server. Once done, you'll have:
- ✅ Complete full-stack application
- ✅ Frontend on Netlify
- ✅ Backend on Railway
- ✅ Database on Supabase
- ✅ All URLs ready to share!

