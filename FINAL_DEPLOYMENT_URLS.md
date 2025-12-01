# 🌐 Complete Deployment URLs

## ✅ Current Deployment Status

### **Frontend (Already Deployed)**
- **Platform:** Netlify
- **URL:** https://cleanleaf.netlify.app
- **Status:** ✅ Live and Active

### **Backend (To Be Deployed)**
- **Platform:** Railway (Recommended)
- **URL:** `https://your-backend-url.up.railway.app` (after deployment)
- **Status:** ⏳ Pending Deployment

### **Database**
- **Platform:** Supabase
- **URL:** https://wkkclsbaavdlplcqrsyr.supabase.co
- **Status:** ✅ Active

---

## 🚀 Quick Deployment Steps

### **1. Deploy Backend to Railway**

**Option A: Use Automated Script**
1. Double-click `DEPLOY_BACKEND_NOW.bat`
2. Follow the on-screen instructions

**Option B: Manual Deployment**
1. Follow `DEPLOY_BACKEND_COMPLETE.md` guide
2. Or use Railway's web interface

### **2. Get Your Backend URL**

After deploying to Railway:
- Go to Railway dashboard
- Settings → Networking
- Generate domain
- Copy the URL (e.g., `https://portfolio-issue-tracker-production.up.railway.app`)

### **3. Update Frontend Environment Variable**

1. Go to Netlify: https://app.netlify.com
2. Select site: `cleanleaf`
3. Site settings → Environment variables
4. Add: `REACT_APP_API_URL` = `https://your-backend-url.up.railway.app/api`
5. Redeploy frontend

---

## 📋 Complete URLs (After Backend Deployment)

Once backend is deployed, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | https://cleanleaf.netlify.app | Main application |
| **Backend API** | `https://your-backend-url.up.railway.app/api` | API endpoints |
| **API Base** | `https://your-backend-url.up.railway.app` | Backend server |

---

## 🔗 API Endpoints

Once backend is deployed, these endpoints will be available:

- `GET /api/portfolios` - Get all portfolios
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `GET /api/reservations` - Get hour reservations
- `POST /api/reservations` - Create reservation
- And more...

---

## ✅ Testing Your Deployment

### **Test Backend:**
```bash
# Test portfolios endpoint
curl https://your-backend-url.up.railway.app/api/portfolios

# Or visit in browser
https://your-backend-url.up.railway.app/api/portfolios
```

### **Test Frontend:**
1. Visit: https://cleanleaf.netlify.app
2. Open DevTools (F12)
3. Check Console for errors
4. Test all features

---

## 🎯 Final Checklist

- [ ] Backend deployed to Railway
- [ ] Backend URL obtained
- [ ] `REACT_APP_API_URL` set in Netlify
- [ ] Frontend redeployed
- [ ] Backend endpoints tested
- [ ] Frontend tested with backend
- [ ] All features working

---

## 📞 Support

If you need help:
1. Check `DEPLOY_BACKEND_COMPLETE.md` for detailed steps
2. Review Railway logs for backend issues
3. Check Netlify logs for frontend issues
4. Verify environment variables are set correctly

---

## 🎉 You're Done!

Once all steps are complete, your complete application will be live at:

**Frontend:** https://cleanleaf.netlify.app

**Backend:** `https://your-backend-url.up.railway.app`

Share these URLs with your team!

