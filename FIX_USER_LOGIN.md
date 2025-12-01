# 🔧 Fix User Login Issue

## 🔍 Problem

User can't login and functionalities are missing after login.

---

## ✅ Quick Fix: Use Hardcoded Credentials

The app has **hardcoded fallback users** that work without database:

### **Test User Credentials:**

**User 1:**
- Username: `user1`
- Password: `user123`

**User 2:**
- Username: `user2`
- Password: `user123`

**Admin:**
- Username: `admin`
- Password: `admin123`

---

## 🚀 Step 1: Try Hardcoded Login

1. Go to: `https://cleanleaf.netlify.app`
2. Use **User Login** (not Admin)
3. Enter:
   - Username: `user1`
   - Password: `user123`
4. Click **Login**

**This should work immediately** - no database needed!

---

## 🚀 Step 2: Set Up Database Users (Optional)

If hardcoded login doesn't work, set up the database:

1. Go to Supabase: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Run this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Insert default users
INSERT INTO users (username, password_hash, full_name, role) VALUES
    ('admin', 'admin123', 'System Administrator', 'admin'),
    ('user1', 'user123', 'Regular User 1', 'user'),
    ('user2', 'user123', 'Regular User 2', 'user')
ON CONFLICT (username) DO NOTHING;
```

5. Click **Run**

---

## 🔍 Step 3: Check Browser Console

If login still doesn't work:

1. Open your app: `https://cleanleaf.netlify.app`
2. Press **F12** (open DevTools)
3. Go to **Console** tab
4. Try to login
5. Check for any error messages

**Common issues:**
- Supabase connection error
- CORS error
- Session storage error

---

## ✅ Step 4: Clear Browser Data

Sometimes session storage gets corrupted:

1. Press **F12** (DevTools)
2. Go to **Application** tab
3. Click **Session Storage**
4. Click your site URL
5. Right-click → **Clear**
6. Refresh page
7. Try login again

---

## 🎯 Quick Test

**Try these credentials:**

1. **User Login:**
   - Username: `user1`
   - Password: `user123`

2. **Admin Login:**
   - Username: `admin`
   - Password: `admin123`

**Both should work with hardcoded fallback!**

---

## 📋 What Should Work After Login

**As User:**
- ✅ Dashboard with portfolios
- ✅ Log issues
- ✅ View issues
- ✅ Performance analytics
- ✅ Coverage matrix

**As Admin:**
- ✅ Everything users see
- ✅ Admin Panel button
- ✅ User management
- ✅ Portfolio management

---

## 🆘 If Still Not Working

1. **Check browser console** for errors
2. **Clear session storage** (see Step 4)
3. **Try different browser**
4. **Check Supabase connection**

---

## 🎯 Quick Solution

**Just use hardcoded credentials:**
- `user1` / `user123` (for user login)
- `admin` / `admin123` (for admin login)

**These work without any database setup!**

