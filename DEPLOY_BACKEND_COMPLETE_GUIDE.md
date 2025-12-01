# 🚀 BACKEND DEPLOYMENT - STEP-BY-STEP GUIDE

## ✅ EASIEST METHOD: Railway.app (Recommended for SQLite)

Follow these exact steps - should take 10 minutes:

### Step 1: Create Railway Account
1. Open browser and go to: **https://railway.app/**
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with **GitHub** (easiest) or Email
4. Verify your email if needed

### Step 2: Create New Project
1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. If asked to connect GitHub:
   - Click "Configure GitHub App"
   - Give Railway access to your repositories
4. Select your repository (you'll need to create one first - see below)

### Step 3A: If You Don't Have GitHub Repo Yet

#### Quick GitHub Setup:
1. Go to: **https://github.com/new**
2. Repository name: `portfolio-issue-tracker`
3. Make it **Private**
4. Click **"Create repository"**
5. **DON'T close this page yet!**

#### Upload Your Code:
1. On the GitHub page, click **"uploading an existing file"**
2. Drag and drop the ENTIRE **"3 Hlsc"** folder
3. Wait for upload (may take a minute)
4. Click **"Commit changes"**
5. **Now return to Railway.app**

### Step 3B: Continue Railway Setup
1. Back in Railway, select your newly created **"portfolio-issue-tracker"** repository
2. Railway will detect it's a Node.js app
3. Click **"Deploy Now"**

### Step 4: Configure the Deployment
1. Click on your deployment
2. Go to **"Settings"** tab
3. Set **"Root Directory"** to: `server`
4. Set **"Start Command"** to: `npm start`

### Step 5: Add Environment Variables
1. Still in Settings, click **"Variables"** tab
2. Click **"New Variable"** for each:

```
PORT = 5001
NODE_ENV = production
SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2xzYmFhdmRscGxjcXJzeXIiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzMwNjQzNzIzLCJleHAiOjIwNDYyMTk3MjN9.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
JWT_SECRET = portfolio-issue-tracker-jwt-secret-2024
```

3. Click **"Deploy"** or it will auto-deploy

### Step 6: Get Your API URL
1. Go to **"Settings"** → **"Domains"**
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://portfolio-issue-tracker-api-production.up.railway.app`
4. **COPY THIS URL!**

### Step 7: Update Frontend to Use New Backend
1. Go to your Netlify dashboard: https://app.netlify.com/sites/portfolio-issue-tracker-hlsc/configuration/env
2. Add new environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://YOUR-RAILWAY-URL.up.railway.app/api` (use your URL from Step 6)
3. Click **"Save"**
4. Go to **"Deploys"** tab
5. Click **"Trigger deploy"** → **"Deploy site"**

### Step 8: Test Your Backend
1. Open browser
2. Visit: `https://YOUR-RAILWAY-URL.up.railway.app/api/portfolios`
3. You should see JSON data with your portfolios!

---

## 🎯 ALTERNATIVE METHOD: Render.com

If Railway doesn't work, try Render:

### Quick Render Deploy:
1. Go to: **https://render.com/**
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - **Name**: portfolio-issue-tracker-api
   - **Root Directory**: server
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Plan**: Free
6. Add same environment variables as above
7. Click **"Create Web Service"**

⚠️ **Note**: Render's free tier may have SQLite limitations (ephemeral storage)

---

## 📱 Need Help?

If you get stuck:
1. Make sure your server/package.json exists
2. Check that environment variables are set correctly
3. Look at deployment logs for errors
4. Verify your frontend URL is allowed in CORS

## ✅ Success Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Got API URL
- [ ] Updated Netlify environment variable
- [ ] Redeployed frontend
- [ ] Tested API endpoint
- [ ] Verified frontend can connect to backend

---

Your full stack app will be deployed at:
- **Frontend**: https://portfolio-issue-tracker-hlsc.netlify.app
- **Backend**: https://[your-railway-url].up.railway.app

🎉 **You're done!**
