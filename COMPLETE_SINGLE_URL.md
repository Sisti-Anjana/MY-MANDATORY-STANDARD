# 🌐 Complete Single URL Deployment

## 🎯 One URL for Everything!

Deploy both **frontend** and **backend** to **Vercel** on a **single URL**.

---

## 🚀 Quick Deploy (3 Steps)

### **Step 1: Run Deployment Script**
```bash
# Double-click this file:
DEPLOY_SINGLE_URL.bat
```

Or manually:
```bash
npm install -g vercel
vercel login
vercel --prod
```

### **Step 2: Set Environment Variables**
Go to Vercel Dashboard → Settings → Environment Variables

Add:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `USE_SUPABASE=true`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `NODE_ENV=production`

### **Step 3: Redeploy**
Vercel Dashboard → Deployments → Redeploy

---

## 🌐 Your Complete Single URL

After deployment, you'll have:

### **Main Application URL:**
```
https://portfolio-issue-tracker.vercel.app
```

### **All Features on Same URL:**
- ✅ **Frontend:** `https://portfolio-issue-tracker.vercel.app`
- ✅ **Backend API:** `https://portfolio-issue-tracker.vercel.app/api`
- ✅ **All Routes:** Same domain

### **API Endpoints:**
```
https://portfolio-issue-tracker.vercel.app/api/portfolios
https://portfolio-issue-tracker.vercel.app/api/issues
https://portfolio-issue-tracker.vercel.app/api/reservations
https://portfolio-issue-tracker.vercel.app/api/stats
https://portfolio-issue-tracker.vercel.app/api/coverage
... and all other endpoints
```

---

## ✅ What Was Configured

### **1. Server Updated**
- ✅ Exports Express app for serverless (Vercel)
- ✅ Uses Supabase in production
- ✅ Works in both serverless and traditional modes

### **2. Frontend Updated**
- ✅ Uses relative API URLs in production (`/api`)
- ✅ Automatically connects to same-domain backend
- ✅ No CORS issues

### **3. Vercel Configuration**
- ✅ `vercel.json` already configured
- ✅ Routes `/api/*` to backend
- ✅ Routes everything else to frontend

---

## 📋 Environment Variables

Copy these to Vercel Dashboard:

```env
REACT_APP_SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8
USE_SUPABASE=true
SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
NODE_ENV=production
```

---

## ✅ Testing

### **Test Frontend:**
1. Visit: `https://portfolio-issue-tracker.vercel.app`
2. Test all features
3. Check browser console (F12) for errors

### **Test Backend:**
Visit: `https://portfolio-issue-tracker.vercel.app/api/portfolios`
Should return JSON data.

### **Test Integration:**
1. Use the application
2. Check Network tab in DevTools
3. Verify API calls go to `/api/*` (same domain)
4. No CORS errors should appear

---

## 🎉 Benefits

✅ **One URL** - Easy to share and remember  
✅ **No CORS** - Same domain for everything  
✅ **Simple** - One deployment, one platform  
✅ **Free** - Vercel free tier covers both  
✅ **Fast** - Global CDN for frontend  
✅ **Scalable** - Serverless backend auto-scales  

---

## 📚 Files Created

- `DEPLOY_SINGLE_URL.bat` - Automated deployment script
- `SINGLE_URL_DEPLOYMENT.md` - Detailed deployment guide
- `COMPLETE_SINGLE_URL.md` - This file

---

## 🚀 Deploy Now!

**Easiest way:**
1. Double-click `DEPLOY_SINGLE_URL.bat`
2. Follow prompts
3. Set environment variables
4. Redeploy
5. **Done!** One URL for everything! 🎉

---

## 📞 Support

- **Detailed Guide:** `SINGLE_URL_DEPLOYMENT.md`
- **Vercel Docs:** https://vercel.com/docs
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 🎯 Final Result

After deployment:

**Your Single URL:**
```
https://portfolio-issue-tracker.vercel.app
```

**Everything works on this ONE URL:**
- Frontend ✅
- Backend API ✅
- All features ✅
- No separate URLs needed ✅

**Share this ONE URL with your team!** 🚀

