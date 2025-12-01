# 🚀 Continue Backend Deployment

## ✅ What's Done

- ✅ Railway CLI installed
- ✅ Ready to deploy

## 🎯 Next Steps (Interactive Process)

Since Railway requires browser authentication, follow these steps:

### **Step 1: Login to Railway**

1. **Run this command:**
   ```bash
   cd server
   railway login
   ```

2. **Browser will open** - Sign in with GitHub (or create account)

3. **After login**, continue to Step 2

---

### **Step 2: Initialize Project**

```bash
railway init
```

When prompted:
- Create new project? → **Yes**
- Project name: → `portfolio-issue-tracker-backend` (or press Enter)

---

### **Step 3: Set Environment Variables**

```bash
railway variables set PORT=5001
railway variables set NODE_ENV=production
railway variables set USE_SUPABASE=true
railway variables set SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
railway variables set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
```

---

### **Step 4: Deploy**

```bash
railway up
```

This will:
- Upload your code
- Build the application
- Deploy to Railway
- Takes 2-3 minutes

---

### **Step 5: Get Your Backend URL**

```bash
railway domain
```

**Copy the URL shown** - this is your backend URL!

Example: `https://portfolio-issue-tracker-backend-production.up.railway.app`

---

### **Step 6: Update Netlify**

1. Go to: https://app.netlify.com
2. Select site: `cleanleaf`
3. **Site settings** → **Environment variables**
4. Click **"Add variable"**
5. Add:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-url.up.railway.app/api` (use your actual URL from Step 5)
   - **Scope:** All scopes
6. Click **"Save"**

---

### **Step 7: Redeploy Frontend**

1. In Netlify, go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes

---

## 🎯 Quick Command Reference

Run these commands in order (from the `server` directory):

```bash
cd server
railway login
railway init
railway variables set PORT=5001
railway variables set NODE_ENV=production
railway variables set USE_SUPABASE=true
railway variables set SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
railway variables set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
railway up
railway domain
```

---

## ✅ Verification

After deployment:

1. **Test Backend:**
   Visit: `https://your-backend-url.up.railway.app/api/portfolios`
   Should return JSON data ✅

2. **Test Frontend:**
   Visit: https://cleanleaf.netlify.app
   Should connect to backend ✅

---

## 🆘 Troubleshooting

### **Login fails?**
- Make sure you have a Railway account
- Sign up at: https://railway.app

### **Deployment fails?**
- Check Railway logs: `railway logs`
- Verify environment variables are set: `railway variables`

### **Can't get domain?**
- Go to Railway dashboard
- Settings → Networking → Generate Domain

---

## 🎉 You're Almost There!

Follow the steps above and your backend will be deployed!

