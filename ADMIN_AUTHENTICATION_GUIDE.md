# Admin Authentication Setup Guide

## 🔐 Admin Login Credentials

**Username:** `admin`  
**Password:** `password`

These credentials are **HARDCODED** and **CANNOT BE CHANGED** through the application interface.

---

## ✅ Authentication Features Implemented

### 1. **Hardcoded Credentials**
- Username: `admin`
- Password: `password`
- Stored as constants in `AdminLogin.js`
- Cannot be modified through UI or database
- To change credentials, you must edit the source code directly

### 2. **Session-Based Authentication**
- Uses `sessionStorage` to maintain login state
- Authentication persists only during browser session
- Automatically cleared when browser is closed
- Keys stored:
  - `adminAuthenticated`: 'true' when logged in
  - `adminUsername`: Stores the logged-in username

### 3. **Protected Admin Panel**
- Admin Panel requires authentication to access
- Checks authentication status on mount
- Redirects to login if not authenticated
- Shows "Unauthorized access" alert if accessed directly

### 4. **Admin Button Behavior**
- Clicking "Admin Panel" button checks authentication
- If authenticated: Opens Admin Panel directly
- If not authenticated: Shows login modal first

### 5. **Logout Functionality**
- Logout button in Admin Panel header
- Clears session storage on logout
- Forces re-authentication for next access
- Shows confirmation message

---

## 🔄 Authentication Flow

```
User clicks "Admin Panel" button
         ↓
Is user authenticated?
         ↓
    NO ────→ Show Login Modal
         ↓         ↓
         ↓    Enter credentials
         ↓         ↓
         ↓    Valid credentials?
         ↓         ↓
         ↓    YES → Store in sessionStorage
         ↓         ↓
    YES ←─────────┘
         ↓
Open Admin Panel
         ↓
User clicks Logout
         ↓
Clear sessionStorage
         ↓
Close Admin Panel
```

---

## 📁 Files Modified

### 1. **AdminLogin.js**
- Hardcoded credentials: `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- Authentication validation
- Session storage management
- Updated UI to show correct credentials

### 2. **AdminPanel.js**
- Added authentication check on component mount
- Added logout handler function
- Added logout button in header
- Shows logged-in username in header

### 3. **SinglePageComplete.js**
- Enhanced `handleAdminButtonClick()` to check authentication
- Added `handleLogout()` function
- Ensures login modal shows if not authenticated

---

## 🛠️ How to Change Credentials (Developer Only)

If you need to change the admin credentials in the future:

1. Open `client/src/components/AdminLogin.js`
2. Find these lines:
   ```javascript
   const ADMIN_USERNAME = 'admin';
   const ADMIN_PASSWORD = 'password';
   ```
3. Change the values as needed
4. Update the info box at the bottom of the login modal (line ~148)
5. Save and restart the application

---

## 🔒 Security Notes

### Current Security Level: **Development/Demo**

**For Production Environment, Consider:**

1. **Backend Authentication**
   - Move credentials to server-side
   - Implement proper password hashing (bcrypt, argon2)
   - Use JWT tokens instead of sessionStorage
   - Add rate limiting to prevent brute force attacks

2. **Environment Variables**
   - Store credentials in `.env` files
   - Never commit credentials to Git
   - Use different credentials for dev/staging/prod

3. **Enhanced Security**
   - Implement password complexity requirements
   - Add 2FA/MFA authentication
   - Session timeout after inactivity
   - HTTPS-only cookies for auth tokens
   - Audit logging for all admin actions

4. **Database Security**
   - Use Supabase Row Level Security (RLS)
   - Implement proper role-based access control
   - Regular security audits

---

## 🚀 Testing the Authentication

### Test Case 1: Correct Login
1. Click "Admin Panel" button
2. Enter username: `admin`
3. Enter password: `password`
4. Click "Login"
5. ✅ Should open Admin Panel

### Test Case 2: Incorrect Login
1. Click "Admin Panel" button
2. Enter wrong username/password
3. Click "Login"
4. ❌ Should show error message

### Test Case 3: Direct Access Protection
1. Try to access Admin Panel without login
2. ❌ Should be redirected to login

### Test Case 4: Logout
1. Login to Admin Panel
2. Click "Logout" button
3. ✅ Should clear authentication
4. Try to access Admin Panel again
5. ✅ Should require login again

### Test Case 5: Session Persistence
1. Login to Admin Panel
2. Close Admin Panel (X button)
3. Click "Admin Panel" button again
4. ✅ Should open directly without login
5. Close browser
6. Open application again
7. ✅ Should require login again

---

## 📞 Support

If you encounter any authentication issues:
1. Check browser console for errors
2. Clear sessionStorage: `sessionStorage.clear()`
3. Refresh the page
4. Try logging in again

---

**Last Updated:** November 7, 2025  
**Version:** 1.0.0
