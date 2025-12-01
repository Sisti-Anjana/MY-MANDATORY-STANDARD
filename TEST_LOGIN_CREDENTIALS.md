# 🔐 Test Login Credentials

## ✅ Hardcoded Credentials (Work Immediately)

These work **without any database setup**:

### **User Login:**
- **Username:** `user1`
- **Password:** `user123`

OR

- **Username:** `user2`
- **Password:** `user123`

### **Admin Login:**
- **Username:** `admin`
- **Password:** `admin123`

---

## 🎯 Quick Test Steps

1. **Go to:** `https://cleanleaf.netlify.app`
2. **Click "User Login"** (or it should show by default)
3. **Enter:**
   - Username: `user1`
   - Password: `user123`
4. **Click "Login"**
5. **Should see dashboard!** ✅

---

## 🔍 If Login Fails

### **Check 1: Browser Console**
- Press **F12**
- Go to **Console** tab
- Look for errors

### **Check 2: Clear Session Storage**
- Press **F12**
- **Application** tab → **Session Storage**
- Clear all data
- Refresh page
- Try login again

### **Check 3: Try Different Browser**
- Sometimes browser cache causes issues
- Try Chrome, Firefox, or Edge

---

## 📋 What You Should See After Login

**As User:**
- ✅ Portfolio dashboard
- ✅ All 26 portfolios visible
- ✅ "Log New Issue" button
- ✅ All tabs working
- ❌ No "Admin Panel" button (that's correct for users)

**As Admin:**
- ✅ Everything users see
- ✅ **"Admin Panel" button** in header
- ✅ Can manage users and portfolios

---

## 🆘 Still Not Working?

1. **Check Supabase connection:**
   - Go to Supabase dashboard
   - Verify project is active
   - Check API keys are correct

2. **Run SQL to create users table:**
   - Use `SETUP_USERS_TABLE.sql`
   - Run in Supabase SQL Editor

3. **Check environment variables:**
   - In Netlify, verify:
     - `REACT_APP_SUPABASE_URL`
     - `REACT_APP_SUPABASE_ANON_KEY`

---

## ✅ Quick Solution

**Just use:**
- Username: `user1`
- Password: `user123`

**This should work immediately!** 🚀

