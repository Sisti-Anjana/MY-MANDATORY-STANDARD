# 🔧 Fix Netlify Build Error

## ❌ Problem

Netlify is using UI settings instead of `netlify.toml`, causing build to fail.

**Error:** Build command running from wrong directory.

---

## ✅ Solution: Update Netlify UI Settings

### **Step 1: Go to Netlify Site Settings**

1. Go to: https://app.netlify.com
2. Select site: `cleanleaf`
3. Go to **Site settings** (gear icon)
4. Click **"Build & deploy"** in left menu

### **Step 2: Update Build Settings**

**In "Build settings" section:**

1. **Base directory:** `client`
2. **Build command:** `npm install && npm run build`
3. **Publish directory:** `client/build`

**Click "Save"**

### **Step 3: Update Environment Variables**

Go to **"Environment variables"** section:

Make sure these are set:
- `REACT_APP_SUPABASE_URL` = `https://wkkclsbaavdlplcqrsyr.supabase.co`
- `REACT_APP_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8`

### **Step 4: Redeploy**

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes

---

## 📋 Correct Settings

| Setting | Value |
|---------|-------|
| **Base directory** | `client` |
| **Build command** | `npm install && npm run build` |
| **Publish directory** | `client/build` |

---

## ✅ After Fix

Build should succeed and your single URL will work:
```
https://cleanleaf.netlify.app
```

---

## 🆘 Alternative: Use netlify.toml

If you prefer to use `netlify.toml`:

1. In Netlify UI, go to **Build & deploy** settings
2. Scroll to **"Build settings"**
3. Click **"Edit settings"**
4. Select **"Use netlify.toml"** option
5. Save and redeploy

---

**Update the Netlify UI settings and redeploy!** 🚀

