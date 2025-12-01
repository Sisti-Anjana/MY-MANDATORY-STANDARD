# 🌐 Single URL Setup - Complete Guide

## 🎯 Goal

Deploy backend to Render and configure everything to work on **ONE URL**:
```
https://cleanleaf.netlify.app
```

---

## ✅ What's Already Done

- ✅ Frontend deployed to Netlify: `https://cleanleaf.netlify.app`
- ✅ `netlify.toml` configured for API proxy
- ✅ Frontend code updated to use relative URLs

---

## 🚀 Quick Deployment Steps

### **Step 1: Deploy Backend to Render**

1. **Go to Render:** https://render.com (should be open)
2. **Sign up** (free, no credit card)
3. **Create Web Service:**
   - Click "New" → "Web Service"
   - Choose deployment method (GitHub or Manual)
4. **Configure:**
   - Name: `portfolio-issue-tracker-backend`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables:**
   ```
   PORT=10000
   NODE_ENV=production
   USE_SUPABASE=true
   SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
   ```
6. **Deploy** and **copy your Render URL**

---

### **Step 2: Update netlify.toml with Render URL**

**Option A: Automated (Easiest)**
1. Run: `UPDATE_NETLIFY_PROXY.bat`
2. Enter your Render URL when prompted
3. Done! ✅

**Option B: Manual**
1. Open `netlify.toml`
2. Find: `YOUR_RENDER_URL`
3. Replace with your actual Render URL
4. Save

---

### **Step 3: Redeploy Netlify**

**Option A: Git Push (if using Git)**
```bash
git add netlify.toml
git commit -m "Configure Render proxy for single URL"
git push
```
Netlify will auto-deploy.

**Option B: Manual Redeploy**
1. Go to: https://app.netlify.com
2. Select site: `cleanleaf`
3. **Deploys** tab → **"Trigger deploy"** → **"Deploy site"**

---

## ✅ Result: Single URL!

After redeploy:

**Your Single URL:**
```
https://cleanleaf.netlify.app
```

**Everything works here:**
- ✅ Frontend: `https://cleanleaf.netlify.app`
- ✅ API: `https://cleanleaf.netlify.app/api/*` (proxied to Render)
- ✅ All features on ONE domain!

---

## 🧪 Testing

1. **Visit:** `https://cleanleaf.netlify.app`
2. **Open DevTools** (F12) → Network tab
3. **Use the application**
4. **Check API calls** - they should go to `/api/*` (same domain)
5. **No CORS errors!** ✅

---

## 📋 Complete URLs

| What | URL |
|------|-----|
| **Single URL (Everything)** | `https://cleanleaf.netlify.app` ✅ |
| **Backend (Direct)** | `https://your-app.onrender.com` |
| **API (Proxied)** | `https://cleanleaf.netlify.app/api/*` |

---

## 🎉 You're Done!

**Share this ONE URL:**
```
https://cleanleaf.netlify.app
```

Everything works on this single URL! 🚀

---

## 📞 Files Created

- `DEPLOY_BACKEND_RENDER.bat` - Deployment script
- `DEPLOY_RENDER_COMPLETE.md` - Detailed guide
- `UPDATE_NETLIFY_PROXY.bat` - Auto-update proxy config
- `SINGLE_URL_SETUP.md` - This file

---

## 🆘 Need Help?

- **Render Dashboard:** https://dashboard.render.com
- **Netlify Dashboard:** https://app.netlify.com
- **Check logs:** Both platforms show deployment logs

