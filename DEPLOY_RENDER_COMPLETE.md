# 🚀 Deploy Backend to Render + Single URL Setup

## 🎯 Goal: One URL for Everything

Deploy backend to Render and configure Netlify to proxy API requests so everything works on **one URL**!

**Result:**
- Frontend: `https://cleanleaf.netlify.app`
- Backend API: `https://cleanleaf.netlify.app/api/*` (proxied to Render)
- **Everything on ONE URL!** ✅

---

## 📋 Step-by-Step Deployment

### **Step 1: Deploy Backend to Render**

#### **1.1 Create Render Account**
1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub or email
4. **No credit card required!**

#### **1.2 Create Web Service**
1. Click **"New"** → **"Web Service"**
2. Choose deployment method:

   **Option A: Connect GitHub** (if you have Git)
   - Click "Connect GitHub"
   - Authorize Render
   - Select or create repository

   **Option B: Public Git Repository**
   - Select "Public Git repository"
   - You'll need GitHub repo URL

   **Option C: Manual Deploy** (Easiest - No Git!)
   - Select "Manual Deploy"
   - We'll create a ZIP file for you (see below)

#### **1.3 Configure Service**
- **Name:** `portfolio-issue-tracker-backend`
- **Environment:** `Node`
- **Region:** Choose closest to you
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### **1.4 Add Environment Variables**
Click **"Advanced"** → **"Add Environment Variable"**, add:

```
PORT=10000
NODE_ENV=production
USE_SUPABASE=true
SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
```

#### **1.5 Deploy**
1. Click **"Create Web Service"**
2. Wait 2-3 minutes
3. **Copy your Render URL** (e.g., `https://portfolio-issue-tracker-backend.onrender.com`)

---

### **Step 2: Configure Netlify for Single URL**

#### **2.1 Update netlify.toml**

1. Open `netlify.toml` in your project
2. Replace `YOUR_RENDER_URL` with your actual Render URL
3. The file should look like this:

```toml
[build]
  base = "client"
  publish = "build"
  command = "npm install && npm run build"

[build.environment]
  NODE_VERSION = "18"

# Proxy API requests to Render backend
[[redirects]]
  from = "/api/*"
  to = "https://portfolio-issue-tracker-backend.onrender.com/api/:splat"
  status = 200
  force = true

# Redirect all other requests to index.html for React Router
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Important:** Replace `portfolio-issue-tracker-backend.onrender.com` with your actual Render URL!

#### **2.2 Update Frontend API Configuration**

Update `client/src/services/api.js` to use relative URLs:

```javascript
// Use relative URL for same-domain deployment
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
```

This makes API calls go to `/api/*` which Netlify will proxy to Render.

#### **2.3 Commit and Push Changes**

```bash
git add netlify.toml client/src/services/api.js
git commit -m "Configure Netlify proxy for single URL"
git push
```

#### **2.4 Redeploy Netlify**

1. Go to: https://app.netlify.com
2. Select site: `cleanleaf`
3. Go to **Deploys** tab
4. Click **"Trigger deploy"** → **"Deploy site"**
5. Wait 2-3 minutes

---

## ✅ Result: Single URL!

After deployment:

**Your Single URL:**
```
https://cleanleaf.netlify.app
```

**Everything works on this ONE URL:**
- Frontend: `https://cleanleaf.netlify.app` ✅
- API calls: `https://cleanleaf.netlify.app/api/*` ✅ (proxied to Render)
- All features: Same domain ✅

**No CORS issues!** Everything on one domain!

---

## 🧪 Testing

### **Test Frontend:**
1. Visit: `https://cleanleaf.netlify.app`
2. Open DevTools (F12) → Network tab
3. Use the application
4. Check that API calls go to `/api/*` (same domain)

### **Test Backend Directly:**
Visit: `https://your-render-url.onrender.com/api/portfolios`
Should return JSON data.

### **Test Through Proxy:**
Visit: `https://cleanleaf.netlify.app/api/portfolios`
Should also return JSON data (proxied through Netlify).

---

## 📋 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | `https://cleanleaf.netlify.app` | Main application |
| **Backend (Direct)** | `https://your-app.onrender.com` | Direct backend access |
| **Backend (Proxied)** | `https://cleanleaf.netlify.app/api/*` | Proxied through Netlify |
| **Combined URL** | `https://cleanleaf.netlify.app` | **Everything on one URL!** ✅ |

---

## 🐛 Troubleshooting

### **API calls not working?**
- Check `netlify.toml` has correct Render URL
- Verify redirect is BEFORE the catch-all redirect
- Check Netlify deploy logs

### **CORS errors?**
- Shouldn't happen with proxy (same domain)
- Verify `netlify.toml` redirect is configured correctly

### **Backend not responding?**
- Check Render dashboard for service status
- Verify environment variables are set
- Check Render logs

---

## 🎉 You're Done!

**Your complete setup:**
- ✅ Frontend on Netlify: `https://cleanleaf.netlify.app`
- ✅ Backend on Render: `https://your-app.onrender.com`
- ✅ **Single URL:** `https://cleanleaf.netlify.app` (everything works here!)

**Share this ONE URL with your team!** 🚀

---

## 📞 Need Help?

- **Render Docs:** https://render.com/docs
- **Netlify Redirects:** https://docs.netlify.com/routing/redirects/
- **Check logs:** Netlify Dashboard → Deploys → View logs

