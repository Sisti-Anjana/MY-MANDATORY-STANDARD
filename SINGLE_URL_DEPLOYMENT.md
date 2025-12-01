# 🌐 Single URL Deployment Guide

## 🎯 Goal: One URL for Frontend + Backend

Deploy both frontend and backend to **Vercel** on a **single URL**:
- **Frontend:** `https://your-app.vercel.app`
- **Backend API:** `https://your-app.vercel.app/api`

---

## ✅ Quick Deployment

### **Method 1: Automated Script (Easiest)**

1. **Double-click:** `DEPLOY_SINGLE_URL.bat`
2. Follow the on-screen prompts
3. Set environment variables in Vercel dashboard
4. **Done!** You'll have one URL for everything

### **Method 2: Manual Deployment**

Follow the steps below.

---

## 📋 Step-by-Step Deployment

### **Step 1: Install Vercel CLI**

```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**

```bash
vercel login
```

This will open a browser for authentication.

### **Step 3: Build Frontend**

```bash
cd client
npm install
npm run build
cd ..
```

### **Step 4: Deploy to Vercel**

```bash
vercel --prod
```

When prompted:
- **Set up and deploy?** → **Y**
- **Project name:** → `portfolio-issue-tracker` (or press Enter)
- **In which directory is your code?** → `.` (current directory)
- **Want to override settings?** → **N** (vercel.json is already configured)

### **Step 5: Set Environment Variables**

1. Go to https://vercel.com/dashboard
2. Select your project: `portfolio-issue-tracker`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Key | Value |
|-----|-------|
| `REACT_APP_SUPABASE_URL` | `https://wkkclsbaavdlplcqrsyr.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8` |
| `USE_SUPABASE` | `true` |
| `SUPABASE_URL` | `https://wkkclsbaavdlplcqrsyr.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g` |
| `NODE_ENV` | `production` |

5. Click **Save**

### **Step 6: Redeploy**

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## 🌐 Your Single URL

After deployment, you'll have:

**Main Application:**
```
https://portfolio-issue-tracker.vercel.app
```

**API Endpoints:**
```
https://portfolio-issue-tracker.vercel.app/api/portfolios
https://portfolio-issue-tracker.vercel.app/api/issues
https://portfolio-issue-tracker.vercel.app/api/reservations
... and all other API endpoints
```

**Everything on ONE domain!** 🎉

---

## ✅ How It Works

### **Vercel Configuration (`vercel.json`)**

The `vercel.json` file is already configured to:
1. Build the React frontend from `client/` directory
2. Deploy the Express backend from `server/` directory
3. Route `/api/*` requests to the backend
4. Route all other requests to the frontend

This gives you a single URL for everything!

---

## 🔧 Configuration Details

### **Frontend API Configuration**

The frontend is configured to use:
- **Production:** Relative URL `/api` (same domain)
- **Development:** `http://localhost:5001/api`

This means in production, the frontend automatically uses the same domain for API calls.

### **Backend Serverless**

The backend is configured as a Vercel serverless function:
- Exports the Express app (no `app.listen()` in serverless mode)
- Automatically handles API routes under `/api/*`
- Uses Supabase in production

---

## ✅ Verification

### **Test Frontend:**
1. Visit: `https://portfolio-issue-tracker.vercel.app`
2. Open DevTools (F12)
3. Check Console for errors
4. Test all features

### **Test Backend API:**
Visit in browser:
```
https://portfolio-issue-tracker.vercel.app/api/portfolios
```
You should see JSON data.

### **Test API from Frontend:**
1. Open DevTools → Network tab
2. Use the application
3. Check that API calls go to `/api/*` (same domain)
4. Verify no CORS errors

---

## 🔄 Updating Your Application

After making code changes:

```bash
# Commit changes
git add .
git commit -m "Update application"

# Deploy
vercel --prod
```

Or connect to GitHub for automatic deployments:
1. Go to Vercel dashboard
2. Settings → Git
3. Connect your GitHub repository
4. Every push will auto-deploy!

---

## 🐛 Troubleshooting

### **Build Fails?**
```bash
# Clean and rebuild
cd client
rm -rf node_modules package-lock.json build
npm install
npm run build
cd ..
```

### **Backend Not Working?**
- Check Vercel function logs
- Verify environment variables are set
- Ensure `USE_SUPABASE=true`
- Check `SUPABASE_SERVICE_KEY` is correct

### **Frontend Can't Connect to API?**
- Verify frontend uses relative URLs (`/api`)
- Check browser console for errors
- Verify backend is deployed correctly
- Check Vercel function logs

### **CORS Errors?**
- Shouldn't happen with same-domain deployment
- If you see CORS errors, check backend CORS configuration
- Verify routes are correct in `vercel.json`

---

## 📊 Benefits of Single URL

✅ **No CORS issues** - Same domain for frontend and backend  
✅ **Simpler configuration** - One URL to manage  
✅ **Better security** - No cross-origin requests  
✅ **Easier deployment** - One platform, one deployment  
✅ **Cost effective** - Free tier covers both  

---

## 🎉 You're Done!

Your complete application is now live at:

**Single URL:** `https://portfolio-issue-tracker.vercel.app`

- Frontend: Same URL
- Backend API: Same URL + `/api`

**Share this ONE URL with your team!** 🚀

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Check logs:** Vercel Dashboard → Your Project → Deployments → View Logs

