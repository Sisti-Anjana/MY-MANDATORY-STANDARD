# 🚀 Complete Deployment Guide - Portfolio Issue Tracker

## 📋 Quick Start (Choose One Method)

### **Method 1: Automated Script (Easiest) ⭐**

1. **Double-click `DEPLOY_ALL.bat`**
2. **Choose option 1 (Netlify)** or **option 2 (Vercel)**
3. **Follow the on-screen prompts**
4. **Done!** Your app will be live in minutes

---

### **Method 2: Manual Deployment**

Follow the detailed steps below for your chosen platform.

---

## 🌐 **Option A: Deploy to Netlify (Recommended)**

### Why Netlify?
- ✅ Free tier with generous limits
- ✅ Automatic deployments from Git
- ✅ Easy environment variable management
- ✅ Built-in CDN
- ✅ Simple configuration

### Step-by-Step:

#### **1. Install Prerequisites**
```bash
# Install Node.js (if not already installed)
# Download from: https://nodejs.org/

# Install Netlify CLI globally
npm install -g netlify-cli
```

#### **2. Build the Application**
```bash
cd client
npm install
npm run build
cd ..
```

#### **3. Login to Netlify**
```bash
netlify login
```
This will open a browser for authentication.

#### **4. Deploy**
```bash
# First deployment - creates site
netlify deploy --prod --dir=client/build

# Or use the automated script
DEPLOY_ALL.bat
```

#### **5. Set Environment Variables**

**Via CLI:**
```bash
netlify env:set REACT_APP_SUPABASE_URL "https://wkkclsbaavdlplcqrsyr.supabase.co" --context production
netlify env:set REACT_APP_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8" --context production
```

**Via Dashboard:**
1. Go to https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add:
   - `REACT_APP_SUPABASE_URL` = `https://wkkclsbaavdlplcqrsyr.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8`
5. Click **Save**
6. Go to **Deploys** tab → **Trigger deploy** → **Deploy site**

#### **6. Your App is Live!**
Visit your Netlify URL (shown after deployment or in dashboard)

---

## ⚡ **Option B: Deploy to Vercel**

### Why Vercel?
- ✅ Free tier available
- ✅ Excellent performance
- ✅ Automatic deployments
- ✅ Great for React apps

### Step-by-Step:

#### **1. Install Prerequisites**
```bash
npm install -g vercel
```

#### **2. Login to Vercel**
```bash
vercel login
```

#### **3. Deploy**
```bash
vercel --prod
```

When prompted:
- **Set up and deploy?** → **Y**
- **Project name:** → `portfolio-issue-tracking`
- **In which directory is your code?** → `client`
- **Want to override settings?** → **N**

#### **4. Set Environment Variables**

1. Go to https://vercel.com/dashboard
2. Select your project: `portfolio-issue-tracking`
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `REACT_APP_SUPABASE_URL` = `https://wkkclsbaavdlplcqrsyr.supabase.co`
   - `REACT_APP_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8`
5. Go to **Deployments** tab
6. Click **⋯** (three dots) on latest deployment → **Redeploy**

#### **5. Your App is Live!**
Visit: `https://portfolio-issue-tracking.vercel.app`

---

## 🔧 **Configuration Files**

### **Netlify Configuration** (`netlify.toml`)
Already configured! Located in root directory:
```toml
[build]
  base = "client"
  publish = "build"
  command = "npm install && npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Vercel Configuration** (`vercel.json`)
Already configured! Located in root directory.

---

## ✅ **Post-Deployment Checklist**

After deployment, verify:

- [ ] Application loads at deployment URL
- [ ] No console errors (check browser DevTools)
- [ ] Can view all 26 portfolios
- [ ] Can log new issues
- [ ] Can edit existing issues
- [ ] Dashboard displays correctly
- [ ] Charts render properly
- [ ] User filtering works
- [ ] Admin panel accessible
- [ ] All features functional

---

## 🔐 **Environment Variables**

### Required Variables:
```env
REACT_APP_SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8
```

**Important:** 
- Variables must start with `REACT_APP_` to be accessible in React
- After adding variables, **redeploy** the application
- Variables are case-sensitive

---

## 🐛 **Troubleshooting**

### **Build Fails?**
```bash
cd client
rm -rf node_modules package-lock.json build
npm install
npm run build
```

### **Blank Page After Deployment?**
1. Check browser console (F12) for errors
2. Verify environment variables are set correctly
3. Ensure variables start with `REACT_APP_`
4. Redeploy after adding variables

### **Can't Connect to Database?**
1. Verify Supabase credentials are correct
2. Check Supabase dashboard - ensure project is active
3. Verify CORS settings in Supabase (should allow all origins for anon key)

### **Routes Return 404?**
- Netlify: Check `netlify.toml` has redirects configured (already done)
- Vercel: Check `vercel.json` has routes configured (already done)

### **Environment Variables Not Working?**
1. Ensure they start with `REACT_APP_`
2. Redeploy after adding variables
3. Check for typos in variable names
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## 📊 **Database Setup**

### **Supabase Database**
The application uses Supabase as the database. Ensure:

1. **Database is set up:**
   - Run all SQL migration files in Supabase SQL Editor
   - Key files: `DATABASE_SETUP.sql`, `NORMALIZED_SCHEMA.sql`

2. **Tables exist:**
   - `portfolios`
   - `sites`
   - `issues`
   - `monitored_personnel`
   - `hour_reservations`
   - `users` (for authentication)

3. **CORS is configured:**
   - Supabase automatically handles CORS for anon key
   - No additional configuration needed

---

## 🔄 **Updating Deployment**

### **After Making Code Changes:**

**Netlify:**
```bash
# Rebuild and redeploy
cd client
npm run build
cd ..
netlify deploy --prod --dir=client/build
```

**Vercel:**
```bash
# Just redeploy
vercel --prod
```

**Or use Git:**
- Push changes to GitHub
- Both platforms auto-deploy on push (if connected)

---

## 📱 **Custom Domain (Optional)**

### **Netlify:**
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

### **Vercel:**
1. Go to Project settings → Domains
2. Add your domain
3. Update DNS records as shown

---

## 🎯 **Quick Reference**

### **Deployment URLs:**
- **Netlify:** `https://your-site-name.netlify.app`
- **Vercel:** `https://your-project.vercel.app`

### **Dashboard Links:**
- **Netlify:** https://app.netlify.com
- **Vercel:** https://vercel.com/dashboard

### **Supabase Dashboard:**
- https://supabase.com/dashboard

---

## 🎉 **You're All Set!**

Your Portfolio Issue Tracker is now deployed and ready for production use!

**Need Help?**
- Check troubleshooting section above
- Review platform-specific documentation
- Test thoroughly before sharing with users

---

## 📞 **Support Resources**

- **Netlify Docs:** https://docs.netlify.com
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **React Deployment:** https://create-react-app.dev/docs/deployment

