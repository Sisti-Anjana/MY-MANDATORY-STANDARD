# 🚀 Deploy Backend Server to Railway.app

## ⚡ Quick Deployment (10 minutes)

### Step 1: Create Railway Account
1. Go to: **https://railway.app/**
2. Click **"Start a New Project"** or **"Login"**
3. Sign in with **GitHub** (easiest) or Email
4. Verify your email if needed

### Step 2: Create New Project
1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. If you don't have a GitHub repo yet, see Step 3 below

### Step 3: Create GitHub Repository (If Needed)

#### Option A: Using GitHub Website
1. Go to: **https://github.com/new**
2. Repository name: `portfolio-issue-tracker-backend`
3. Make it **Private** (recommended)
4. Click **"Create repository"**
5. **DON'T initialize with README**

#### Upload Your Code:
1. On the GitHub page, click **"uploading an existing file"**
2. Drag and drop the **ENTIRE project folder** (or just the `server` folder)
3. Wait for upload
4. Click **"Commit changes"**

#### Option B: Using Git Commands
```bash
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio-issue-tracker-backend.git
git push -u origin main
```

### Step 4: Deploy to Railway
1. Back in Railway, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `portfolio-issue-tracker-backend`
4. Railway will detect it's a Node.js app
5. Click **"Deploy Now"**

### Step 5: Configure the Deployment
1. Click on your deployment/service
2. Go to **"Settings"** tab
3. Set **"Root Directory"** to: `server`
4. Set **"Start Command"** to: `npm start`
5. Set **"Build Command"** to: `npm install`

### Step 6: Add Environment Variables
1. Still in Settings, click **"Variables"** tab
2. Click **"New Variable"** and add each:

   **Variable 1:**
   - Key: `PORT`
   - Value: `5001`
   - Click **"Add"**

   **Variable 2:**
   - Key: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 3:**
   - Key: `SUPABASE_URL`
   - Value: `https://wkkclsbaavdlplcqrsyr.supabase.co`
   - Click **"Add"**

   **Variable 4:**
   - Key: `SUPABASE_SERVICE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2xzYmFhdmRscGxjcXJzeXIiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzMwNjQzNzIzLCJleHAiOjIwNDYyMTk3MjN9.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g`
   - Click **"Add"**

   **Variable 5:**
   - Key: `JWT_SECRET`
   - Value: `portfolio-issue-tracker-jwt-secret-2024`
   - Click **"Add"**

### Step 7: Get Your Backend URL
1. Go to **"Settings"** tab
2. Scroll down to **"Networking"** section
3. Click **"Generate Domain"**
4. Copy the URL (e.g., `https://portfolio-issue-tracker-backend-production.up.railway.app`)
5. **This is your backend server URL!**

### Step 8: Update Frontend to Use Backend
1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site: `cleanleaf`
3. Go to **"Site settings"** → **"Environment variables"**
4. Click **"Add variable"**
5. Add:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.up.railway.app/api` (use the URL from Step 7)
   - Scope: All scopes
6. Click **"Save"**

### Step 9: Redeploy Frontend
1. In Netlify, go to **"Deploys"** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete

---

## ✅ You're Done!

### Your Final URLs:
- **Frontend:** `https://cleanleaf.netlify.app`
- **Backend:** `https://your-backend-url.up.railway.app`
- **API Base:** `https://your-backend-url.up.railway.app/api`

---

## 🧪 Test Your Backend

Visit in browser:
```
https://your-backend-url.up.railway.app/api/portfolios
```

You should see JSON data (or an empty array `[]`).

---

## 📝 Notes

- Railway provides a free tier with 500 hours/month
- Your backend will sleep after inactivity (wakes up on first request)
- You can upgrade to keep it always running
- The backend URL is permanent unless you delete the service

---

## 🆘 Troubleshooting

**Backend not starting?**
- Check Railway logs: Click on your service → "Deployments" → View logs
- Verify environment variables are set correctly
- Make sure Root Directory is set to `server`

**Frontend can't connect?**
- Verify `REACT_APP_API_URL` is set in Netlify
- Check that backend URL includes `/api` at the end
- Redeploy frontend after adding environment variable

**CORS errors?**
- The backend already has CORS enabled
- If issues persist, check Railway logs

