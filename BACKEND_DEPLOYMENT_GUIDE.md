# Backend Deployment Guide - Render.com

## Prerequisites
- Render.com account (free): https://render.com/
- GitHub account (for easier deployment)

## Option 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub

1. **Create a new GitHub repository:**
   - Go to https://github.com/new
   - Name it: `portfolio-issue-tracker`
   - Make it Private
   - Don't initialize with README
   - Click "Create repository"

2. **Push your code:**
   - Open GitHub Desktop (or install from https://desktop.github.com/)
   - Click "Add Existing Repository"
   - Choose this folder: `C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc`
   - Click "Publish repository"
   - Choose your GitHub account
   - Make sure "Keep this code private" is checked
   - Click "Publish Repository"

### Step 2: Deploy to Render

1. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/
   - Sign in (use GitHub to sign in for easy integration)

2. **Create New Web Service:**
   - Click "New +" button → "Web Service"
   - Connect your GitHub repository: `portfolio-issue-tracker`
   - Click "Connect"

3. **Configure the Service:**
   ```
   Name: portfolio-issue-tracker-api
   Region: Oregon (US West)
   Branch: main (or master)
   Root Directory: server
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable":
   
   ```
   PORT = 10000
   NODE_ENV = production
   SUPABASE_URL = https://wkkclsbaavdlplcqrsyr.supabase.co
   SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2xzYmFhdmRscGxjcXJzeXIiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzMwNjQzNzIzLCJleHAiOjIwNDYyMTk3MjN9.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
   JWT_SECRET = your-secure-random-jwt-secret-key
   ```

5. **Create Service:**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Your API will be available at: `https://portfolio-issue-tracker-api.onrender.com`

## Option 2: Manual Deploy (Without GitHub)

### Step 1: Create a Render Account
1. Go to https://render.com/
2. Sign up with email

### Step 2: Deploy via Dashboard
1. Click "New +" → "Web Service"
2. Choose "Deploy an existing image from a registry" OR
3. Choose "Public Git repository" and use this guide:
   - You'll need to first push to GitHub (see Option 1)

## Step 3: Update Frontend to Use Production API

After deployment, update your frontend environment variable:

1. **Update Netlify Environment Variable:**
   - Go to: https://app.netlify.com/sites/portfolio-issue-tracker-hlsc/configuration/env
   - Add new variable:
   ```
   REACT_APP_API_URL = https://portfolio-issue-tracker-api.onrender.com/api
   ```
   - Click "Save"
   - Trigger a new deploy (or it will auto-deploy)

2. **Or add to client/.env:**
   ```
   REACT_APP_API_URL=https://portfolio-issue-tracker-api.onrender.com/api
   ```
   Then rebuild and redeploy frontend.

## Important Notes

⚠️ **SQLite Limitation on Render:**
- Render's free tier uses ephemeral storage
- Your SQLite database will reset on each deployment
- For production, consider:
  1. Using Render's PostgreSQL (paid)
  2. Migrating to Supabase for backend storage (recommended since frontend already uses it)
  3. Using Railway.app instead (better SQLite support)

## Alternative: Deploy to Railway.app (Better for SQLite)

Railway.app has better support for SQLite:

1. **Go to Railway:**
   - Visit: https://railway.app/
   - Sign in with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Choose "server" as root directory

3. **Environment Variables:**
   Add the same environment variables as above

4. **Deploy:**
   - Railway will auto-deploy
   - Your API will be at: `https://[your-app].railway.app`

## Verify Deployment

Test your API:
```bash
curl https://portfolio-issue-tracker-api.onrender.com/api/portfolios
```

Or visit in browser:
```
https://portfolio-issue-tracker-api.onrender.com/api/portfolios
```

## Troubleshooting

1. **Build fails:** Check that `server` folder has package.json
2. **API doesn't respond:** Verify PORT environment variable is set
3. **Database errors:** SQLite won't persist on Render free tier
4. **CORS errors:** Ensure your frontend URL is added to CORS whitelist

## Next Steps

1. ✅ Backend deployed
2. ⬜ Update frontend to use production API URL
3. ⬜ Test all features
4. ⬜ Consider migrating from SQLite to PostgreSQL or Supabase
