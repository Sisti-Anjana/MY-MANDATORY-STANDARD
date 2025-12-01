# 🚀 Deploy Backend Server to Render.com

## ⚡ Quick Deployment (10 minutes)

### Step 1: Create Render Account
1. Go to: **https://render.com/**
2. Click **"Get Started for Free"**
3. Sign in with **GitHub** (easiest) or Email
4. Verify your email if needed

### Step 2: Create GitHub Repository (If Needed)
1. Go to: **https://github.com/new**
2. Repository name: `portfolio-issue-tracker-backend`
3. Make it **Private** (recommended)
4. Click **"Create repository"**

#### Upload Your Code:
1. On the GitHub page, click **"uploading an existing file"**
2. Drag and drop the **ENTIRE project folder**
3. Wait for upload
4. Click **"Commit changes"**

### Step 3: Create New Web Service
1. In Render dashboard, click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub repository: `portfolio-issue-tracker-backend`
4. Click **"Connect"**

### Step 4: Configure the Service
Fill in the form:

- **Name:** `portfolio-issue-tracker-api`
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main` (or `master`)
- **Root Directory:** `server`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free`

### Step 5: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"** for each:

1. **PORT** = `10000` (Render uses port 10000)
2. **NODE_ENV** = `production`
3. **SUPABASE_URL** = `https://wkkclsbaavdlplcqrsyr.supabase.co`
4. **SUPABASE_SERVICE_KEY** = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2xzYmFhdmRscGxjcXJzeXIiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzMwNjQzNzIzLCJleHAiOjIwNDYyMTk3MjN9.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g`
5. **JWT_SECRET** = `portfolio-issue-tracker-jwt-secret-2024`

### Step 6: Create Service
1. Click **"Create Web Service"**
2. Wait for deployment (takes 3-5 minutes)
3. Your backend URL will be: `https://portfolio-issue-tracker-api.onrender.com`

### Step 7: Update Frontend
1. Go to Netlify: https://app.netlify.com
2. Select your site: `cleanleaf`
3. Go to **"Site settings"** → **"Environment variables"**
4. Add:
   - Key: `REACT_APP_API_URL`
   - Value: `https://portfolio-issue-tracker-api.onrender.com/api`
5. Click **"Save"**

### Step 8: Redeploy Frontend
1. In Netlify, go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

---

## ✅ You're Done!

### Your Final URLs:
- **Frontend:** `https://cleanleaf.netlify.app`
- **Backend:** `https://portfolio-issue-tracker-api.onrender.com`
- **API Base:** `https://portfolio-issue-tracker-api.onrender.com/api`

---

## 📝 Notes

- Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Upgrade to paid plan to keep it always running

