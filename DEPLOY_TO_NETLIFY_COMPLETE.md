# 🚀 Complete Netlify Deployment Guide

## 📋 Pre-Deployment Checklist

- ✅ Supabase database is set up and running
- ✅ All SQL migrations have been run in Supabase
- ✅ Application works locally
- ✅ You have a Netlify account (free at https://app.netlify.com)

---

## 🎯 **METHOD 1: Deploy via Netlify CLI (Recommended)**

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Build the Application
```bash
cd client
npm install
npm run build
cd ..
```

### Step 3: Login to Netlify
```bash
netlify login
```
This will open a browser window for authentication.

### Step 4: Initialize Netlify in Your Project
```bash
netlify init
```

Follow the prompts:
- **Create & configure a new site?** → **Yes**
- **Team:** Choose your team
- **Site name:** `portfolio-issue-tracking` (or your preferred name)
- **Build command:** `cd client && npm install && npm run build`
- **Directory to deploy:** `client/build`
- **Netlify functions folder:** (leave empty, press Enter)

### Step 5: Set Environment Variables
```bash
netlify env:set REACT_APP_SUPABASE_URL "https://wkkclsbaavdlplcqrsyr.supabase.co"
netlify env:set REACT_APP_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8"
```

### Step 6: Deploy to Production
```bash
netlify deploy --prod
```

**Your app will be live at:** `https://portfolio-issue-tracking.netlify.app` (or your chosen name)

---

## 🎯 **METHOD 2: Deploy via Netlify Dashboard (Easier)**

### Step 1: Build the Application Locally
```bash
cd client
npm install
npm run build
cd ..
```

### Step 2: Go to Netlify Dashboard
1. Visit: https://app.netlify.com
2. Sign in or create a free account

### Step 3: Deploy Manually
1. Click **"Add new site"** → **"Deploy manually"**
2. Drag and drop the `client/build` folder
3. Wait for deployment to complete

### Step 4: Configure Site Settings
1. Go to **Site settings** → **Build & deploy**
2. Set **Base directory:** `client`
3. Set **Build command:** `npm install && npm run build`
4. Set **Publish directory:** `client/build`

### Step 5: Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Click **"Add variable"** and add:

   **Variable 1:**
   - Key: `REACT_APP_SUPABASE_URL`
   - Value: `https://wkkclsbaavdlplcqrsyr.supabase.co`
   - Scopes: All scopes

   **Variable 2:**
   - Key: `REACT_APP_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8`
   - Scopes: All scopes

3. Click **"Save"**

### Step 6: Trigger a New Deploy
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the build to complete

---

## 🎯 **METHOD 3: Deploy via GitHub (Best for Continuous Deployment)**

### Step 1: Push Code to GitHub
1. Create a new repository on GitHub
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/portfolio-issue-tracking.git
   git push -u origin main
   ```

### Step 2: Connect to Netlify
1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your repository: `portfolio-issue-tracking`

### Step 3: Configure Build Settings
- **Base directory:** `client`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `client/build`
- Click **"Deploy site"**

### Step 4: Add Environment Variables
1. Go to **Site settings** → **Environment variables**
2. Add the two variables as described in Method 2, Step 5
3. Go to **Deploys** → **Trigger deploy** → **Deploy site**

---

## ✅ Post-Deployment Checklist

After deployment, verify:
- [ ] App loads at your Netlify URL
- [ ] Can log in as user
- [ ] Can log in as admin
- [ ] Dashboard shows all portfolios
- [ ] Can log new issues
- [ ] Can edit existing issues
- [ ] Charts display correctly
- [ ] No console errors
- [ ] Site ranges show in hover tooltips
- [ ] Portfolio cards display correctly

---

## 🔧 Troubleshooting

### Build Fails?
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Blank Page After Deployment?
1. Check browser console for errors
2. Verify environment variables are set correctly
3. Check Netlify build logs
4. Ensure `netlify.toml` is in the root directory

### Can't Connect to Supabase?
1. Verify environment variables in Netlify dashboard
2. Check Supabase project is active
3. Review Supabase logs

### Environment Variables Not Working?
- Make sure variable names start with `REACT_APP_`
- Redeploy after adding variables
- Check build logs for variable injection

---

## 📝 Important Notes

1. **Environment Variables:** Must be set in Netlify dashboard for production
2. **Build Directory:** Netlify will build from `client` folder
3. **Publish Directory:** Must be `client/build`
4. **React Router:** The `netlify.toml` includes redirects for client-side routing

---

## 🎉 You're Done!

Your application is now live on Netlify! 🚀

**Next Steps:**
- Set up a custom domain (optional)
- Enable HTTPS (automatic with Netlify)
- Set up continuous deployment from GitHub (recommended)

