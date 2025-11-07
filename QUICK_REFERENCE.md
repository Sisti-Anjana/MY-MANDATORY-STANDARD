# 🚀 QUICK REFERENCE GUIDE
## Portfolio Issue Tracker

---

## ⚡ FASTEST START

### Windows
1. Double-click `START_APP.bat`
2. Wait for browser to open
3. Application loads at `http://localhost:5002`

### Manual
```bash
cd client
npm start
```

---

## 📋 COMMON TASKS

### Log a New Issue
1. Click "+ Log New Issue" button
2. Select Portfolio (required)
3. Choose Hour (0-23)
4. Select Issue Present (Yes/No)
5. Fill details if Yes
6. Click "Update Issue"

### Edit an Issue
1. Click "Edit" button on any issue
2. Modify fields in modal
3. Click "Update Issue"

### View Portfolio Issues
1. Click any portfolio card
2. View filtered issues
3. Click "Clear Selection" to reset

### Export Issues
1. Go to "Issues by User" tab
2. Apply filters if needed
3. Click "Export to CSV"

---

## 🎯 NAVIGATION

### Tabs
- **Dashboard & Log Issues** - Main view, logging form
- **Performance Analytics** - Coverage stats, performance score
- **Issues by User** - Filtering, search, export

### Dashboard Elements
- **Portfolio Cards** - 26 portfolios with status
- **Status Colors**:
  - 🟢 Green = Updated (<1h)
  - 🔵 Blue = 1h Inactive
  - 🟡 Yellow = 2h Inactive
  - 🟠 Orange = 3h Inactive
  - 🔴 Red = No Activity (4h+)
- **Current Hour** - Top right corner
- **Admin Panel** - Top right button

---

## 📊 FILTERING

### Issues by User Filters
- ☑️ Show Missed Issues Only
- 🔍 Issues Missed By
- 🔍 Monitored By
- 📅 Start Date
- 📅 End Date

### Chart Date Filters
- Today
- Week
- Month
- Custom (date pickers)

---

## 👥 PERSONNEL LIST

- Anjana
- Anita P
- Arun V
- Bharat Gu
- Deepa L
- jenny
- Kumar S
- Lakshmi B
- Manoj D
- Rajesh K
- Ravi T
- Vikram N

---

## 📈 KEY METRICS

### Coverage Statistics
- **Peak Coverage Hour** - Hour with most portfolios checked
- **Lowest Coverage Hour** - Hour with least portfolios checked
- **Hours with 100% Coverage** - Number of hours with all 26 portfolios

### Performance Score
- **Scale**: 0-10
- **Excellent**: 8-10
- **Good**: 5-7
- **Fair**: 3-4
- **Needs Improvement**: 0-2

### 24-Hour Coverage
- **Formula**: (Unique Portfolios / 26) × 100%
- **Good**: ≥50%
- **Low**: <50%

### Performance Insights
- **Total Issues Logged** - Count across time period
- **Active Hours** - Hours with any activity
- **Portfolios Monitored** - Unique portfolios checked
- **Coverage Consistency** - Hours with ≥70% coverage

---

## 🔧 TROUBLESHOOTING

### Problem: Data not showing
**Solution**: 
1. Check browser console (F12)
2. Verify Supabase connection
3. Refresh page (Ctrl+R)

### Problem: Can't edit issue
**Solution**:
1. Click "Edit" button directly
2. Wait for modal to load
3. Ensure all required fields filled

### Problem: Charts not displaying
**Solution**:
```bash
cd client
npm install recharts
npm start
```

### Problem: Port already in use
**Solution**:
- Edit `client/.env`
- Change `PORT=5002` to `PORT=5003`
- Restart application

---

## 📁 IMPORTANT FILES

| File | Purpose |
|------|---------|
| `START_APP.bat` | Quick launcher |
| `README.md` | Overview |
| `COMPLETE_IMPLEMENTATION_SUMMARY.md` | Full documentation |
| `DATABASE_SETUP.sql` | Database schema |
| `client/.env` | Configuration |

---

## 🔑 KEYBOARD SHORTCUTS

| Action | Shortcut |
|--------|----------|
| Refresh page | Ctrl + R |
| Open console | F12 |
| Close modal | Esc (or click X) |
| Focus search | Ctrl + F |

---

## 💡 TIPS & BEST PRACTICES

1. **Log Issues Hourly** - Keep coverage consistent
2. **Use Case Numbers** - For tracking purposes
3. **Assign Monitored By** - For accountability
4. **Export Data Regularly** - For reporting
5. **Check Analytics Daily** - Monitor performance
6. **Clear Filters** - Reset between searches

---

## 📊 DATABASE QUICK INFO

### Tables
- `portfolios` - 26 portfolios
- `sites` - Optional sites per portfolio
- `issues` - All logged issues

### Required Fields
- Portfolio (dropdown)
- Hour (0-23)
- Issue Present (Yes/No)

### Optional Fields
- Site
- Issue Details
- Case Number
- Monitored By
- Issues Missed By

---

## 🔗 USEFUL LINKS

- Supabase Dashboard: https://wkkclsbaavdlplcqrsyr.supabase.co
- Application: http://localhost:5002
- React Docs: https://react.dev

---

## ⚠️ IMPORTANT NOTES

### DO
✅ Log issues for every hour
✅ Assign monitored personnel
✅ Use descriptive issue details
✅ Export data for records
✅ Check performance metrics

### DON'T
❌ Leave required fields empty
❌ Forget to save changes
❌ Delete issues without backup
❌ Share database credentials
❌ Modify database directly

---

## 📞 NEED HELP?

1. Check `COMPLETE_IMPLEMENTATION_SUMMARY.md`
2. Review browser console for errors
3. Verify database connection
4. Ensure dependencies installed
5. Try restarting application

---

## 📈 TYPICAL WORKFLOW

### Morning
1. Open application
2. Review yesterday's coverage
3. Check performance analytics
4. Log morning issues

### Throughout Day
1. Log issues hourly
2. Edit as needed
3. Assign monitored personnel
4. Track missed issues

### End of Day
1. Review 24-hour coverage
2. Export day's data
3. Check performance score
4. Prepare for next day

---

## ✅ CHECKLIST FOR NEW USERS

- [ ] Database set up (run DATABASE_SETUP.sql)
- [ ] Dependencies installed (npm install)
- [ ] Environment configured (client/.env)
- [ ] Application starts (npm start)
- [ ] Can log an issue
- [ ] Can edit an issue
- [ ] Can view portfolio issues
- [ ] Can filter by user
- [ ] Can export to CSV
- [ ] Understand status colors
- [ ] Know where to find metrics

---

## 🎉 YOU'RE READY!

**Everything you need is at your fingertips!**

For detailed information, see:
- `COMPLETE_IMPLEMENTATION_SUMMARY.md`
- `README.md`

**Happy Tracking! 📊**

---

**Version:** 1.0.0
**Last Updated:** November 7, 2025