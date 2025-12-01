# 🔐 Authentication & Hourly Reset Implementation Guide

## Overview
This implementation adds:
1. ✅ **Separate login pages** for Users and Admins
2. ✅ **Role-based access** - Admin Panel only visible to admins
3. ✅ **Hourly automatic reset** of "All sites checked" status
4. ✅ **User authentication** with database-backed user management
5. ✅ **Session management** with automatic expiry

---

## 🚀 Quick Start

### Step 1: Set Up Database

Run the SQL script in Supabase to create the users table:

```sql
-- File: ADD_USERS_TABLE.sql
-- Run this in your Supabase SQL Editor
```

This creates:
- `users` table with username, password, full_name, and role
- Default users:
  - **Admin**: username=`admin`, password=`admin123`
  - **User1**: username=`user1`, password=`user123`
  - **User2**: username=`user2`, password=`user123`

### Step 2: Install & Run

```bash
# No additional packages needed - using existing dependencies

# Start the development server
cd client
npm start
```

---

## 🎯 Features Implemented

### 1. **Separate Login Pages**

#### User Login (`UserLogin.js`)
- Beautiful blue/green gradient design
- Database-backed authentication
- 8-hour session duration
- Shows "Switch to Admin" link

#### Admin Login (`AdminLogin.js`)
- Dark gray/black professional design
- Database-backed authentication  
- 2-hour session duration (shorter for security)
- Shows "Switch to User" link

### 2. **Role-Based Access Control**

```javascript
// In App.js - handles routing
- User login → Access to dashboard (no admin panel button)
- Admin login → Access to dashboard + admin panel button visible
```

**What Users See:**
- ✅ Portfolio dashboard
- ✅ Log issues
- ✅ View issues
- ✅ Performance analytics
- ✅ Coverage matrix
- ❌ Admin Panel (hidden)

**What Admins See:**
- ✅ Everything users see
- ✅ **Admin Panel button** in header
- ✅ Full admin panel access

### 3. **Hourly Reset System**

**How it works:**
```javascript
// Every minute, checks if hour changed
setInterval(() => {
  const newHour = new Date().getHours();
  if (newHour !== lastCheckedHour) {
    // Reset ALL portfolios' "all_sites_checked" status
    resetAllSitesChecked();
    setLastCheckedHour(newHour);
  }
}, 60000);
```

**What gets reset:**
- `all_sites_checked` → `false`
- `all_sites_checked_hour` → `null`
- `all_sites_checked_date` → `null`

**Result:**
- Every hour at :00, all portfolios show "Sites check pending"
- Users must confirm sites again for the new hour

### 4. **Enhanced Header**

```
[Portfolio Issue Tracker]          [👤 Admin - John Smith] [Admin Panel] [Logout] [⏰ 14]
```

**Displays:**
- User role badge (Admin/User)
- Full name from database
- Admin Panel button (admin only)
- Logout button
- Current hour display

---

## 🔑 Login Credentials

### Demo Users

| Role  | Username | Password   | Access Level |
|-------|----------|------------|--------------|
| Admin | admin    | admin123   | Full access + Admin Panel |
| User  | user1    | user123    | Dashboard only |
| User  | user2    | user123    | Dashboard only |

---

## 📋 Database Schema

### Users Table

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),     -- In production, use bcrypt
    full_name VARCHAR(200),
    role VARCHAR(20),               -- 'user' or 'admin'
    is_active BOOLEAN,
    created_at TIMESTAMP,
    last_login TIMESTAMP
);
```

---

## 🛠️ Technical Implementation

### File Changes Made

1. **`ADD_USERS_TABLE.sql`** (NEW)
   - Creates users table
   - Adds default users
   - Sets up indexes

2. **`client/src/components/UserLogin.js`** (NEW)
   - User login page component
   - Blue/green gradient design
   - Database authentication

3. **`client/src/components/AdminLogin.js`** (MODIFIED)
   - Updated to use database authentication
   - Gray/black professional design
   - Maintains admin-specific styling

4. **`client/src/App.js`** (MODIFIED)
   - Routes between login screens and app
   - Handles authentication state
   - Session expiry checking
   - Auto-logout functionality

5. **`client/src/components/SinglePageComplete.js`** (MODIFIED)
   - Added `isAdmin` and `onLogout` props
   - Implemented hourly reset system
   - Updated header with user info and logout
   - Conditional admin panel button
   - Removed old authentication code

---

## 🔄 How Hourly Reset Works

### Automatic Reset Sequence

```
Hour 13:59:50 → Portfolio A: Sites checked ✅
Hour 14:00:00 → AUTOMATIC RESET TRIGGERED
Hour 14:00:01 → Portfolio A: Sites check pending ⏳
Hour 14:00:30 → User clicks "Yes" → Sites checked ✅
Hour 14:59:59 → Still checked ✅
Hour 15:00:00 → AUTOMATIC RESET TRIGGERED
Hour 15:00:01 → Portfolio A: Sites check pending ⏳
```

### Code Flow

```javascript
// 1. Check for hour change (every minute)
const newHour = new Date().getHours();
if (newHour !== lastCheckedHour) {
  
  // 2. Reset all portfolios in database
  await supabase
    .from('portfolios')
    .update({
      all_sites_checked: false,
      all_sites_checked_hour: null,
      all_sites_checked_date: null
    });
  
  // 3. Update local state
  setPortfolios(prev => prev.map(p => ({
    ...p,
    all_sites_checked: false
  })));
  
  // 4. Save new hour
  setLastCheckedHour(newHour);
}
```

---

## 🎨 Visual Design

### User Login Screen
```
╔═══════════════════════════════════════╗
║     [🔵 Blue/Green Gradient]          ║
║                                       ║
║          👤 User Login                ║
║   Portfolio Issue Tracker System      ║
║                                       ║
║  [Username input]                     ║
║  [Password input]                     ║
║  [Sign In Button]                     ║
║                                       ║
║  Are you an admin? Click here        ║
║                                       ║
║  Demo Credentials:                    ║
║  Username: user1 or user2            ║
║  Password: user123                    ║
╚═══════════════════════════════════════╝
```

### Admin Login Screen
```
╔═══════════════════════════════════════╗
║     [⚫ Dark Gray/Black Theme]        ║
║                                       ║
║          🛡️ Admin Login               ║
║     Administrator Access Panel        ║
║                                       ║
║  [Admin Username input]               ║
║  [Admin Password input]               ║
║  [Admin Login Button]                 ║
║                                       ║
║  Regular user? Click here            ║
║                                       ║
║  Demo Admin Credentials:              ║
║  Username: admin                      ║
║  Password: admin123                   ║
╚═══════════════════════════════════════╝
```

---

## 🧪 Testing Guide

### Test 1: User Login
1. Open app
2. Should see **User Login** screen (blue/green)
3. Enter: `user1` / `user123`
4. Click "Sign In"
5. ✅ Dashboard loads
6. ✅ No "Admin Panel" button visible
7. ✅ Shows "User - user1" in header

### Test 2: Admin Login
1. Click "Are you an admin? Click here"
2. Should see **Admin Login** screen (dark)
3. Enter: `admin` / `admin123`
4. Click "Admin Login"
5. ✅ Dashboard loads
6. ✅ "Admin Panel" button IS visible
7. ✅ Shows "Admin - admin" in header

### Test 3: Hourly Reset
1. Log in as any user
2. Click a portfolio card
3. Click "Yes" for "All sites checked"
4. ✅ Shows green "All sites checked" badge
5. **Wait for next hour or change system time**
6. ✅ Badge automatically changes to yellow "Sites check pending"
7. ✅ Console shows: "Hour changed from X to Y. Resetting..."

### Test 4: Session Expiry
1. Log in as user
2. Wait 8+ hours (or manually change sessionStorage expiry)
3. ✅ Automatically logged out
4. ✅ Redirected to login screen

### Test 5: Admin Panel Access
1. Log in as **user**
2. ✅ No admin panel button
3. Logout
4. Log in as **admin**
5. ✅ Admin panel button visible
6. Click admin panel
7. ✅ Admin panel opens

---

## 🔒 Security Notes

### Current Implementation (Development)
- Passwords stored as plain text in database
- Simple string comparison for authentication
- ⚠️ **NOT production-ready**

### For Production
You should implement:

1. **Password Hashing**
```javascript
// Use bcrypt for password hashing
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

2. **JWT Tokens**
```javascript
// Use JWT for stateless authentication
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId, role }, SECRET_KEY);
```

3. **HTTPS Only**
- Force HTTPS in production
- Secure cookies/session storage

4. **Rate Limiting**
- Limit login attempts
- Prevent brute force attacks

---

## 📝 Additional Features to Consider

### User Management (Admin Panel)
- Add user creation form
- Edit user details
- Deactivate users
- Reset passwords

### Audit Logging
- Track login attempts
- Log admin actions
- Monitor data changes

### Password Requirements
- Minimum length
- Complexity requirements
- Password expiry
- Change password flow

---

## 🎉 Summary

### ✅ What Works Now

1. **Separate Login Pages** ✅
   - User login (blue/green theme)
   - Admin login (dark theme)
   - Easy switching between login types

2. **Role-Based Access** ✅
   - Users: Dashboard only
   - Admins: Dashboard + Admin Panel
   - Proper permission enforcement

3. **Hourly Reset** ✅
   - Automatic reset every hour
   - All portfolios reset simultaneously
   - Console logging for debugging

4. **Session Management** ✅
   - User sessions: 8 hours
   - Admin sessions: 2 hours
   - Automatic expiry checking
   - Clean logout functionality

5. **User Experience** ✅
   - Shows user name and role in header
   - Logout button always visible
   - Admin panel button for admins only
   - Clear visual feedback

---

## 🐛 Troubleshooting

### Issue: "Invalid username or password"
- **Check:** Database has users table
- **Check:** Ran ADD_USERS_TABLE.sql
- **Check:** Using correct credentials

### Issue: Hourly reset not working
- **Check:** Console for "Hour changed" messages
- **Check:** Browser time is correct
- **Check:** Database connection active

### Issue: Admin panel button not showing
- **Check:** Logged in as admin role
- **Check:** sessionStorage has userRole='admin'
- **Check:** isAdmin prop passed to SinglePageComplete

### Issue: Session expires immediately
- **Check:** sessionStorage not being cleared by browser
- **Check:** Expiry time calculation correct
- **Check:** No other code clearing session data

---

## 📞 Support

For issues or questions:
1. Check console for error messages
2. Verify database connection
3. Check sessionStorage values
4. Review network requests in DevTools

---

**Implemented by:** Desktop Commander
**Date:** Friday, November 14, 2025
**Version:** 1.0.0
