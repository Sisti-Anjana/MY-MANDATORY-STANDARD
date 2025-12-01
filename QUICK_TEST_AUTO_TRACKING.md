# 🧪 Quick Testing Guide - Auto User Tracking

## ⚡ 30-Second Test

### Step 1: Login
```
1. Open application
2. Login with username: LibsysAdmin (or any user)
3. Note: Your username is now stored in session
```

### Step 2: Check Auto-Population
```
1. Navigate to "Log New Issue"
2. Look at "Monitored By" dropdown
3. ✅ Should already show "LibsysAdmin" (or your username)
```

### Step 3: Submit Issue
```
1. Select Portfolio: Any
2. Select Hour: Any
3. Issue Present: Yes
4. Click Submit
5. Click "Log Another Issue"
6. ✅ "Monitored By" should STILL show your username
```

---

## 🔍 What to Look For

### ✅ Success Indicators
- [ ] "Monitored By" is pre-filled on page load
- [ ] Username matches your login credentials
- [ ] Field stays populated after submission
- [ ] Field stays populated when changing portfolios

### ❌ Failure Indicators
- [ ] "Monitored By" is empty on load
- [ ] Shows "Select Monitor" instead of username
- [ ] Resets to empty after submission

---

## 🐛 Troubleshooting

### If "Monitored By" is Empty:
1. Open DevTools (F12)
2. Go to: Application → Session Storage
3. Check if these exist:
   - `username` 
   - `fullName`
4. If missing, you may not be properly logged in

### If Shows "LibsysAdmin" but You're Not:
1. Check sessionStorage values
2. Your username might not be saved correctly during login
3. System is using fallback default

---

## 🎯 Expected Console Logs

When form loads, you should see:
```
👤 Auto-setting monitored_by to: LibsysAdmin
```

When portfolio changes:
```
Portfolio changed from [old-id] to [new-id]
```

When submitting:
```
🚀 Submitting issue with data: {...}
✅ Issue created successfully: {...}
```

---

## 📊 Test Scenarios

### Scenario 1: Fresh Login
```
1. Clear all browser data
2. Login as new user
3. Go to Issue Form
4. Result: Should see your username
```

### Scenario 2: Multiple Issues
```
1. Log 5 issues in a row
2. Each time click "Log Another Issue"
3. Result: Username should persist all 5 times
```

### Scenario 3: Portfolio Switching
```
1. Select Portfolio A
2. Select Portfolio B
3. Select Portfolio C
4. Result: Username should remain constant
```

---

## 🚀 Next Steps After Testing

If everything works:
1. ✅ Mark feature as complete
2. 📝 Update your team
3. 🎉 Start using automatic tracking!

If issues found:
1. 🔍 Check console logs
2. 📋 Review sessionStorage
3. 📧 Report specific error messages

---

**Estimated Testing Time**: 2-3 minutes
