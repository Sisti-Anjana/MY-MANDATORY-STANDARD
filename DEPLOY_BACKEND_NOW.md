# 🚀 Deploy Backend Server - Step by Step

## 📋 Current Status

- ✅ **Frontend:** Deployed at `https://cleanleaf.netlify.app`
- ⏳ **Backend:** Needs deployment
- ✅ **Database:** Supabase (already active)

---

## 🎯 Goal: Deploy Backend to Railway.app

### Why Railway?
- ✅ Free tier available
- ✅ Easy setup
- ✅ Permanent URL
- ✅ Auto-deploys from GitHub

---

## 📝 Step-by-Step Instructions

### Step 1: Create GitHub Repository (5 minutes)

1. **Go to:** https://github.com/new
2. **Repository name:** `portfolio-issue-tracker-backend`
3. **Make it:** Private (recommended)
4. **Don't** check "Initialize with README"
5. **Click:** "Create repository"

#### Upload Your Code:

1. On the GitHub page, scroll down to **"uploading an existing file"**
2. **Drag and drop** your ENTIRE project folder:
   - `C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\Updated deploy`
3. **Wait** for upload (may take 2-3 minutes)
4. **Click:** "Commit changes"
5. **Wait** for upload to complete

---

### Step 2: Create Railway Account (2 minutes)

1. **Go to:** https://railway.app/
2. **Click:** "Start a New Project" or "Login"
3. **Sign in with GitHub** (easiest - use same account as above)
4. **Authorize** Railway to access your GitHub

---

### Step 3: Deploy to Railway (5 minutes)

1. **In Railway, click:** "New Project"
2. **Select:** "Deploy from GitHub repo"
3. **Choose:** `portfolio-issue-tracker-backend` (the repo you just created)
4. **Railway will detect** it's a Node.js app
5. **Click:** "Deploy Now"

---

### Step 4: Configure Deployment (3 minutes)

1. **Click on your deployment/service** (it will have a name like "portfolio-issue-tracker-backend")
2. **Go to:** "Settings" tab
3. **Set these values:**
   - **Root Directory:** `server`
   - **Start Command:** `npm start`
   - **Build Command:** `npm install`

---

### Step 5: Add Environment Variables (5 minutes)

1. **Still in Settings, click:** "Variables" tab
2. **Click:** "New Variable" for each:

   **Variable 1:**
   - **Key:** `PORT`
   - **Value:** `5001`
   - Click **"Add"**

   **Variable 2:**
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - Click **"Add"**

   **Variable 3:**
   - **Key:** `SUPABASE_URL`
   - **Value:** `https://wkkclsbaavdlplcqrsyr.supabase.co`
   - Click **"Add"**

   **Variable 4:**
   - **Key:** `SUPABASE_SERVICE_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2xzYmFhdmRscGxjcXJzeXIiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzMwNjQzNzIzLCJleHAiOjIwNDYyMTk3MjN9.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g`
   - Click **"Add"**

   **Variable 5:**
   - **Key:** `JWT_SECRET`
   - **Value:** `portfolio-issue-tracker-jwt-secret-2024`
   - Click **"Add"**

---

### Step 6: Get Your Backend URL (2 minutes)

1. **Go to:** "Settings" tab
2. **Scroll down** to "Networking" section
3. **Click:** "Generate Domain"
4. **Copy the URL** (it will look like: `https://portfolio-issue-tracker-backend-production.up.railway.app`)
5. **This is your backend URL!** 🎉

---

### Step 7: Update Frontend Environment Variable (3 minutes)

1. **Go to Netlify:** https://app.netlify.com
2. **Click on your site:** `cleanleaf`
3. **Go to:** "Site settings" → "Environment variables"
4. **Click:** "Add variable"
5. **Add:**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.up.railway.app/api` (use the URL from Step 6, add `/api` at the end)
   - **Scope:** All scopes
6. **Click:** "Save"

---

### Step 8: Redeploy Frontend (2 minutes)

1. **In Netlify, go to:** "Deploys" tab
2. **Click:** "Trigger deploy" → "Deploy site"
3. **Wait** for deployment (2-3 minutes)

---

## ✅ Complete URLs After Deployment

### Your Final URLs:

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | `https://cleanleaf.netlify.app` | ✅ Already deployed |
| **Backend API** | `https://your-backend-url.up.railway.app/api` | ⏳ After deployment |
| **Backend Base** | `https://your-backend-url.up.railway.app` | ⏳ After deployment |

---

## 🧪 Test Your Backend

After deployment, test it:

1. **Visit in browser:**
   ```
   https://your-backend-url.up.railway.app/api/portfolios
   ```

2. **You should see:**
   - JSON data (or empty array `[]`)
   - No errors

---

## 📝 Important Notes

- **Backend URL is permanent** (unless you delete the service)
- **Railway free tier:** 500 hours/month
- **Backend may sleep** after inactivity (wakes up on first request)
- **First request** after sleep takes ~30 seconds

---

## 🆘 Troubleshooting

**Backend not starting?**
- Check Railway logs: Service → "Deployments" → View logs
- Verify all environment variables are set
- Make sure Root Directory is `server`

**Frontend can't connect?**
- Verify `REACT_APP_API_URL` is set in Netlify
- Make sure URL ends with `/api`
- Redeploy frontend after adding variable

**Need help?** Check Railway logs for error messages.

---

## 🎉 You're Done!

Once complete, you'll have:
- ✅ Frontend: `https://cleanleaf.netlify.app`
- ✅ Backend: `https://your-backend-url.up.railway.app/api`
- ✅ Complete full-stack application!

