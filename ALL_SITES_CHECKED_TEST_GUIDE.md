# All Sites Checked Feature - Test Guide

## ✅ What Was Done

The "All Sites Checked" feature has been successfully implemented with the following components:

### 1. **Database Changes** ✅
- Added `all_sites_checked` column (INTEGER, default: 0)
- Added `updated_at` column (DATETIME)
- Created auto-update trigger for `updated_at`

### 2. **Backend API** ✅
- GET `/api/portfolios/:id/status` - Fetch portfolio status
- PUT `/api/portfolios/:id/status` - Update portfolio status
Both endpoints are already implemented in `server/index.js`

### 3. **Frontend Components** ✅
- **ActionModal.js** - Modal with "All Sites Checked" Yes/No buttons
- **PortfolioStatusHeatMap.js** - Portfolio cards with green/red status
- Logic ensures cards only turn green when BOTH conditions are met:
  1. Issues are logged in the last hour
  2. `all_sites_checked` is set to `true` (Yes)

---

## 🧪 How to Test the Feature

### Step 1: Start the Application

1. **Start the backend:**
   ```
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc\server"
   node index.js
   ```

2. **Start the frontend:**
   ```
   cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\3 Hlsc\client"
   npm start
   ```

3. Open browser to: `http://localhost:3000`

---

### Step 2: Test the Feature

#### **Test Case 1: Card Should NOT Turn Green (Default State)**
1. Click on any portfolio card (e.g., "Aurora")
2. Modal appears with "All Sites Checked?" at the top
3. Notice "No" is selected by default (red button)
4. Close the modal
5. **Expected Result:** Card remains RED/ORANGE/YELLOW (not green)
6. **Reason:** Even if you log an issue, the card won't turn green until you select "Yes"

---

#### **Test Case 2: Card Should Still NOT Turn Green (Issue Logged, but No Confirmation)**
1. Click on a portfolio card
2. Keep "All Sites Checked?" set to "No"
3. Click "Log New Issue"
4. Fill out the issue form and submit
5. Return to dashboard
6. **Expected Result:** Card is still RED/ORANGE/YELLOW (not green)
7. **Reason:** You logged an issue, but haven't confirmed all sites are checked

---

#### **Test Case 3: Card SHOULD Turn Green (Issue Logged + Confirmed)**
1. Click on a portfolio card
2. Click "Yes" button for "All Sites Checked?"
3. The "Yes" button should turn green with a checkmark
4. Close the modal or click "Log New Issue" and submit an issue
5. Return to dashboard
6. **Expected Result:** Card turns **GREEN** 
7. **Reason:** Both conditions met:
   - All sites checked = Yes
   - Issue logged within the last hour

---

#### **Test Case 4: Green Card Should Turn Red After 1 Hour**
1. Wait 1 hour (or manually test by changing the database timestamp)
2. Refresh the dashboard
3. **Expected Result:** Card turns back to RED/ORANGE/YELLOW
4. **Reason:** More than 1 hour has passed since the last issue

---

#### **Test Case 5: Multiple Portfolios**
1. Set different portfolios to different states:
   - Portfolio A: Issues logged + All sites checked = Yes → Should be GREEN
   - Portfolio B: Issues logged + All sites checked = No → Should be RED
   - Portfolio C: No issues + All sites checked = Yes → Should be RED
2. **Expected Result:** Only Portfolio A should be green

---

## 🎨 Visual Reference

### Modal Appearance:
```
┌─────────────────────────────────────┐
│ Aurora                          ✕   │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐  │
│ │ ✓ All Sites Checked?           │  │
│ │                                 │  │
│ │ [Yes]  [No]                    │  │
│ │                                 │  │
│ │ ℹ️  The card will only turn     │  │
│ │    green when you select Yes,  │  │
│ │    even if issues are logged.  │  │
│ └───────────────────────────────┘  │
│                                     │
│ What would you like to do?          │
│                                     │
│ [View Issues]                       │
│ [Log New Issue]                     │
└─────────────────────────────────────┘
```

### Card Color Logic:
- **🟢 GREEN** = Issues logged (<1h ago) AND All Sites Checked = Yes
- **🔴 RED** = No issues for 4+ hours OR All Sites Checked = No
- **🟠 ORANGE** = No issues for 3 hours
- **🟡 YELLOW** = No issues for 2 hours
- **⚪ GRAY** = No issues for 1 hour
- **🟣 PURPLE** = Currently logging an issue

---

## 🐛 Troubleshooting

### Issue: Card Turns Green Without Clicking "Yes"
**Solution:** Check the database - `all_sites_checked` might be set to 1 (true)
```sql
SELECT id, name, all_sites_checked FROM portfolios;
```

### Issue: Card Doesn't Turn Green Even After Clicking "Yes"
**Check:**
1. Open browser console (F12) and look for errors
2. Verify the API call is successful:
   ```
   PUT http://localhost:5001/api/portfolios/:id/status
   ```
3. Check if an issue was logged in the last hour

### Issue: Modal Doesn't Show "All Sites Checked" Section
**Solution:** Clear browser cache and refresh, or check `ActionModal.js` for the blue box section

---

## 📝 Technical Notes

### Database Schema
```sql
portfolios
├── id (INTEGER PRIMARY KEY)
├── name (TEXT NOT NULL UNIQUE)
├── created_at (DATETIME)
├── all_sites_checked (INTEGER DEFAULT 0)  ← NEW
└── updated_at (DATETIME)                   ← NEW
```

### API Endpoints
```
GET  /api/portfolios/:id/status
PUT  /api/portfolios/:id/status
Body: { "all_sites_checked": true/false }
```

### Frontend Logic (PortfolioStatusHeatMap.js)
```javascript
const isPortfolioUpdated = (portfolioId) => {
  // Step 1: Check if all_sites_checked is true
  const portfolio = portfolios.find(p => p.portfolio_id === portfolioId);
  if (!portfolio?.all_sites_checked) return false;
  
  // Step 2: Check if issues logged in last hour
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  return issues.some(issue => 
    issue.portfolio_id === portfolioId &&
    new Date(issue.created_at).getTime() > oneHourAgo
  );
}
```

---

## ✨ Success Criteria

Your implementation is working correctly if:
1. ✅ Modal shows "All Sites Checked?" with Yes/No buttons
2. ✅ Yes button turns green when selected, No button turns red
3. ✅ Portfolio cards ONLY turn green when both conditions are met
4. ✅ The modal fetches the current status when opened
5. ✅ Status persists across page refreshes
6. ✅ Multiple portfolios can have different statuses independently

---

## 🎯 Next Steps

If everything works correctly:
1. Delete the test files:
   - `check_and_fix_db.js`
   - `check_db.js`
2. Consider adding this feature to your documentation
3. Train users on how to use the new functionality

If you encounter issues, share the error messages from:
- Browser console (F12)
- Server terminal
- Network tab (F12 → Network → check API calls)
