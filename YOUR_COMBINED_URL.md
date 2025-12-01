# 🌐 Your Combined Single URL

## ✅ Configuration Complete!

Your backend is deployed to Render:
- **Backend URL:** `https://hlsc-2uao.onrender.com`

---

## 🎯 Your Single Combined URL

**Everything works on this ONE URL:**

```
https://cleanleaf.netlify.app
```

---

## 📋 How It Works

### **Frontend:**
- URL: `https://cleanleaf.netlify.app`
- Serves your React application

### **Backend API (Proxied):**
- URL: `https://cleanleaf.netlify.app/api/*`
- Automatically proxied to: `https://hlsc-2uao.onrender.com/api/*`
- No CORS issues - same domain!

### **Direct Backend Access:**
- URL: `https://hlsc-2uao.onrender.com`
- Direct access to your Render backend

---

## ✅ What's Configured

1. ✅ `netlify.toml` updated with your Render URL
2. ✅ API proxy configured
3. ✅ Frontend uses relative URLs (`/api`)

---

## 🚀 Next Step: Redeploy Netlify

To activate the single URL, redeploy your Netlify site:

### **Option 1: Git Push (If using Git)**
```bash
git add netlify.toml
git commit -m "Configure Render proxy for single URL"
git push
```
Netlify will auto-deploy.

### **Option 2: Manual Redeploy**
1. Go to: https://app.netlify.com
2. Select site: `cleanleaf`
3. Go to **Deploys** tab
4. Click **"Trigger deploy"** → **"Deploy site"**
5. Wait 2-3 minutes

---

## ✅ After Redeploy

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

### **Test After Redeploy:**

1. **Visit:** `https://cleanleaf.netlify.app`
2. **Open DevTools** (F12) → Network tab
3. **Use the application**
4. **Check API calls** - they should go to `/api/*` (same domain)
5. **No CORS errors!** ✅

### **Test Backend Directly:**
Visit: `https://hlsc-2uao.onrender.com/api/portfolios`
Should return JSON data.

### **Test Through Proxy:**
Visit: `https://cleanleaf.netlify.app/api/portfolios`
Should also return JSON data (proxied through Netlify).

---

## 📋 Complete URLs

| Service | URL |
|---------|-----|
| **Single URL (Everything)** | `https://cleanleaf.netlify.app` ✅ |
| **Backend (Direct)** | `https://hlsc-2uao.onrender.com` |
| **API (Proxied)** | `https://cleanleaf.netlify.app/api/*` |

---

## 🎉 You're Almost Done!

**Just redeploy Netlify and you'll have your single URL!**

1. Go to: https://app.netlify.com
2. Site: `cleanleaf`
3. Deploys → Trigger deploy → Deploy site
4. Wait 2-3 minutes
5. **Done!** Your single URL will be ready! 🚀

---

## 📞 Quick Reference

- **Netlify Dashboard:** https://app.netlify.com
- **Render Dashboard:** https://dashboard.render.com
- **Your Single URL:** `https://cleanleaf.netlify.app` (after redeploy)

---

**Share this ONE URL with your team:**
```
https://cleanleaf.netlify.app
```

Everything works on this single URL! 🎉

