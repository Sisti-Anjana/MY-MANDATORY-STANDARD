# 🚀 Render Deployment - Step by Step

## ✅ You're Logged In! Here's What's Next:

---

## 📋 Step-by-Step Instructions

### **STEP 1: Create New Web Service**

1. In Render dashboard, click the **"New +"** button (top right)
2. Select **"Web Service"** from the dropdown

---

### **STEP 2: Connect Your Code**

You have **3 options** - choose the easiest for you:

#### **Option A: Connect GitHub (If you have Git/GitHub)**
1. Click **"Connect GitHub"**
2. Authorize Render to access your GitHub
3. Select your repository (or create new one)
4. Skip to STEP 3

#### **Option B: Public Git Repository**
1. Select **"Public Git repository"**
2. Enter your GitHub repository URL
3. Skip to STEP 3

#### **Option C: Manual Deploy (Easiest - No Git!)**
1. Select **"Manual Deploy"** or **"Upload ZIP"**
2. We'll create a ZIP file for you (see below)
3. Upload the ZIP file
4. Continue to STEP 3

**To create ZIP file for Manual Deploy:**
- I'll create a script to zip your server folder

---

### **STEP 3: Configure Your Service**

Fill in these settings:

- **Name:** `portfolio-issue-tracker-backend`
- **Environment:** Select **"Node"**
- **Region:** Choose closest to you (e.g., "Oregon (US West)")
- **Branch:** `main` (or `master` if that's your branch)
- **Root Directory:** `server` ⚠️ **IMPORTANT!**
- **Build Command:** `npm install`
- **Start Command:** `npm start`

---

### **STEP 4: Add Environment Variables**

1. Click **"Advanced"** button
2. Scroll to **"Environment Variables"** section
3. Click **"Add Environment Variable"** for each:

   **Variable 1:**
   - Key: `PORT`
   - Value: `10000`
   - Click "Save"

   **Variable 2:**
   - Key: `NODE_ENV`
   - Value: `production`
   - Click "Save"

   **Variable 3:**
   - Key: `USE_SUPABASE`
   - Value: `true`
   - Click "Save"

   **Variable 4:**
   - Key: `SUPABASE_URL`
   - Value: `https://wkkclsbaavdlplcqrsyr.supabase.co`
   - Click "Save"

   **Variable 5:**
   - Key: `SUPABASE_SERVICE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g`
   - Click "Save"

---

### **STEP 5: Create and Deploy**

1. Scroll to bottom
2. Click **"Create Web Service"** button
3. Wait 2-3 minutes for deployment
4. Watch the build logs (they'll show progress)

---

### **STEP 6: Get Your Backend URL**

After deployment completes:

1. You'll see your service dashboard
2. At the top, you'll see your **URL**
   - Example: `https://portfolio-issue-tracker-backend.onrender.com`
3. **COPY THIS URL** - you'll need it next!

---

### **STEP 7: Test Your Backend**

1. Open a new browser tab
2. Visit: `https://your-backend-url.onrender.com/api/portfolios`
   (Replace with your actual URL)
3. You should see JSON data ✅

---

### **STEP 8: Update Netlify for Single URL**

Now we'll configure Netlify to proxy API requests:

1. **Run this script:** Double-click `UPDATE_NETLIFY_PROXY.bat`
2. **Paste your Render URL** when prompted
3. **Done!** ✅

Then:
4. Go to: https://app.netlify.com
5. Select site: `cleanleaf`
6. **Deploys** tab → **"Trigger deploy"** → **"Deploy site"**

---

## ✅ After All Steps

**Your Single URL:**
```
https://cleanleaf.netlify.app
```

Everything will work on this ONE URL! 🎉

---

## 🆘 Need Help?

**If you don't have GitHub:**
- Use **Option C: Manual Deploy**
- I'll create a ZIP file for you

**If deployment fails:**
- Check the build logs in Render
- Make sure Root Directory is `server`
- Verify all environment variables are set

**If you get stuck:**
- Check Render logs: Service → Logs tab
- Verify environment variables are correct

---

## 📋 Quick Checklist

- [ ] Created Web Service
- [ ] Connected code (GitHub/Manual)
- [ ] Set Root Directory: `server`
- [ ] Added all 5 environment variables
- [ ] Deployed successfully
- [ ] Copied backend URL
- [ ] Updated Netlify proxy
- [ ] Redeployed Netlify
- [ ] Tested single URL

---

**You're on STEP 1 - Create New Web Service!** 🚀

