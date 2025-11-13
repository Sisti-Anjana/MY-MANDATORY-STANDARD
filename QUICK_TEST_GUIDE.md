# Quick Testing Guide - All Priorities

## Before Testing
```bash
# Terminal 1 - Start Backend
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\HLSC IMPORTANT\server"
npm start

# Terminal 2 - Start Frontend
cd "C:\Users\LibsysAdmin\OneDrive - Libsys IT Services Private Limited\Desktop\HLSC IMPORTANT\client"
npm start
```

Access: http://localhost:3000

---

## ✅ Test 1: Monitored By Mandatory Field

**What to Test:**
1. Navigate to "Log Issue" page
2. Fill in Portfolio and Hour but NOT Monitored By
3. Try to submit

**Expected Result:**
- ❌ Form should NOT submit
- Browser validation message appears
- Red asterisk (*) visible on Monitored By label

**Enhancement to Test:**
4. Select Portfolio + Hour + Monitored By
5. Watch the Monitored By label

**Expected Result:**
- 🔄 Shows "Checking..." with spinner
- ✅ Then shows "Reserved for You" (green badge)

---

## ✅ Test 2: Edit Issue - Yes/No Case Fix

**What to Test:**
1. Go to "View Issues" page
2. Find any issue in the table
3. Click the "Edit" button
4. Modal should open with issue data
5. Try changing "Issue Present" from Yes to No (or vice versa)
6. Click "Update Issue"

**Expected Result:**
- ✅ Modal opens successfully
- ✅ Issue Present shows correctly (Yes or No, not yes/YES/no/NO)
- ✅ Can change the value
- ✅ Saves successfully without errors
- ✅ Table refreshes with updated value

**Special Test - Legacy Data:**
If you have old issues with mixed case:
7. Edit an old issue
8. Don't change anything
9. Just click "Update Issue"

**Expected Result:**
- ✅ Updates successfully
- ✅ Issue Present is now normalized to "Yes" or "No"

---

## ✅ Test 3: Dashboard Card Actions

**What to Test:**
1. Navigate to Dashboard (home page)
2. Find the "Manage Issues" card
3. Hover over the card

**Expected Result:**
- Tooltip says "Click for options" in top-right corner
- Card highlights on hover

4. Click the card

**Expected Result:**
- ✅ Modal opens with title "Issue Actions"
- ✅ Two buttons visible:
  - "View Issues" (blue) with eye icon
  - "Log New Issue" (green) with plus icon

5. Click "View Issues"
**Expected:** Takes you to /issues page

6. Go back to Dashboard
7. Click "Manage Issues" card again
8. Click "Log New Issue"
**Expected:** Takes you to /log-issue page

---

## ✅ Test 4: Real-Time Slot Reservation

### Single User Test

**What to Test:**
1. Go to "Log Issue" page
2. Select:
   - Portfolio: Aurora
   - Hour: 10
   - Monitored By: Kumar S

**Expected Result:**
- 🔄 Shows "Checking..." (brief)
- ✅ Shows "Reserved for You" (green badge)
- Dropdown remains enabled

3. Wait 5 seconds

**Expected Result:**
- ✅ Badge still shows "Reserved for You"
- Badge persists

4. Fill in the rest of the form
5. Submit the issue

**Expected Result:**
- ✅ Issue logs successfully
- ✅ Reservation automatically cleared
- ✅ Form resets

---

### Multi-User Test (IMPORTANT!)

**Setup Required:**
- Open TWO browser windows side-by-side
- OR use one normal window + one incognito window
- Both at http://localhost:3000/log-issue

**Window 1 Steps:**
1. Select Portfolio: Aurora
2. Select Hour: 10
3. Select Monitored By: Kumar S

**Expected in Window 1:**
- ✅ "Reserved for You" badge appears

**Window 2 Steps:**
4. In Window 2, try to select the SAME:
   - Portfolio: Aurora
   - Hour: 10
   - Monitored By: Kumar S

**Expected in Window 2:**
- ❌ Alert popup: "This portfolio/hour/monitor combination is currently being used by another user"
- ❌ "In Use" badge (red) appears
- ❌ Cannot proceed with this combination

**Window 2 Alternative:**
5. In Window 2, select DIFFERENT hour or monitor:
   - Portfolio: Aurora
   - Hour: 11 (different!)
   - Monitored By: Kumar S

**Expected in Window 2:**
- ✅ "Reserved for You" badge appears
- ✅ Can proceed

**Window 1 Completion:**
6. In Window 1, complete and submit the form

**Expected:**
- ✅ Issue logs successfully in Window 1

**Window 2 Re-test:**
7. In Window 2, now try the original combination again:
   - Portfolio: Aurora
   - Hour: 10
   - Monitored By: Kumar S

**Expected in Window 2:**
- ✅ Now works! "Reserved for You" badge
- ✅ Can proceed (slot was released after Window 1 submitted)

---

## Common Issues and Solutions

### Issue: "Checking..." never changes
**Solution:**
- Check if backend is running on port 5001
- Check browser console for errors
- Verify network tab shows API calls

### Issue: Edit button does nothing
**Solution:**
- Clear browser cache
- Check browser console for errors
- Verify portfolios are loaded

### Issue: ActionModal doesn't open
**Solution:**
- Already working - make sure you're clicking the "Manage Issues" card
- Not the other cards like "View All Issues"

### Issue: Reservation not working
**Solution:**
- Check session ID in localStorage (F12 → Application → Local Storage)
- Verify backend reservation endpoints are working
- Check database has hour_reservations table

---

## Quick Verification Commands

**Check if servers are running:**
```bash
# Backend should show:
# ✅ Server running on port 5001
# 📡 API available at http://localhost:5001/api

# Frontend should show:
# Compiled successfully!
# webpack compiled with 0 errors
```

**Check reservation table:**
```bash
cd server
sqlite3 database.sqlite
SELECT * FROM hour_reservations;
.exit
```

---

## Success Indicators

### ✅ Priority 1 Success:
- Form blocks submission without Monitored By
- Visual feedback shows reservation status
- Dropdown works correctly

### ✅ Priority 2 Success:
- Edit button opens modal
- Modal shows normalized Yes/No
- Updates save successfully
- No case sensitivity errors

### ✅ Priority 3 Success:
- Card click opens modal
- Both options visible and working
- Navigation works correctly

### ✅ Priority 4 Success:
- Reservations show "Reserved for You"
- Other users see "In Use"
- Conflicts prevented
- Auto-cleanup works

---

## If Everything Passes

🎉 **All Priority Requirements Successfully Implemented!**

You can now:
- Log issues with confidence (mandatory monitoring tracking)
- Edit issues without errors (case-insensitive)
- Quickly access actions from dashboard
- Prevent duplicate entries in real-time

---

## Next Steps

1. Test in your environment
2. Have multiple users test simultaneously
3. Monitor for any edge cases
4. Deploy to production when satisfied

For any issues, refer to PRIORITY_FIXES_COMPLETE.md for detailed implementation info.
