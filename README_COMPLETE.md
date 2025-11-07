# Portfolio Issue Tracker - Complete Application

## 🎯 Overview
A fully functional Portfolio Issue Tracking and Analysis System with comprehensive features for monitoring, logging, and analyzing issues across multiple portfolios.

## ✨ Features Implemented

### 1. **Dashboard & Portfolio View**
- ✅ Quick Portfolio Reference with 26 portfolio cards
- ✅ Real-time status indicators (No Activity, 1h-3h Inactive, Updated <1h)
- ✅ Clickable portfolio cards to view issues for specific portfolios
- ✅ Color-coded status based on activity timing
- ✅ Current hour display

### 2. **Issue Logging System**
- ✅ Complete form with all fields:
  - Portfolio selection (required)
  - Hour selection (0-23)
  - Site selection (optional, filtered by portfolio)
  - Issue Present (Yes/No)
  - Issue Details (textarea, disabled when "No")
  - Case Number (optional)
  - Monitored By (dropdown with personnel)
  - Issues Missed By (dropdown with personnel)
- ✅ Smart form behavior (auto-fills "No issue present" when issue = No)
- ✅ Real-time validation
- ✅ Success feedback on submission

### 3. **Edit Issue Functionality**
- ✅ Modal popup for editing existing issues
- ✅ All fields editable
- ✅ Site dropdown filtered by selected portfolio
- ✅ Update confirmation
- ✅ Real-time data refresh after update

### 4. **Hourly Coverage Analysis**
- ✅ Interactive bar chart showing coverage by hour
- ✅ Date range filters (Today, Week, Month, Custom)
- ✅ Custom date picker for specific ranges
- ✅ Color-coded bars (Red: 0%, Orange: <50%, Blue: ≥50%)
- ✅ Tooltip showing:
  - Hour
  - Coverage percentage
  - Portfolios checked
  - Total issues logged
- ✅ Visual representation of systemic risk

### 5. **Performance Analytics Tab**
- ✅ Coverage Statistics:
  - Peak Coverage Hour
  - Lowest Coverage Hour
  - Hours with 100% Coverage
- ✅ Performance Score (0-10 with visual gauge)
- ✅ Performance labels (Excellent, Good, Fair, Needs Improvement)
- ✅ 24-Hour Overall Coverage:
  - Circular progress indicator
  - Portfolios checked vs total
  - Unchecked portfolios count
  - Coverage progress bar
  - Informational tooltip
- ✅ Performance Insights:
  - Total Issues Logged
  - Active Hours
  - Portfolios Monitored
  - Coverage Consistency

### 6. **Issues by User Tab**
- ✅ Summary statistics:
  - Total Issues count
  - Missed Issues count
- ✅ Advanced Filtering:
  - Show Missed Issues Only (checkbox)
  - Issues Missed By (search)
  - Monitored By (search)
  - Start Date (date picker)
  - End Date (date picker)
  - Clear Filters button
- ✅ CSV Export functionality
- ✅ Comprehensive table with columns:
  - Date & Time
  - Portfolio
  - Site
  - Issue Present (color-coded badges)
  - Missed By (highlighted)
  - Monitored By
  - Details (truncated)
  - Actions (Edit button)
- ✅ Pagination info
- ✅ Empty state messaging

### 7. **Data Integration**
- ✅ Supabase integration for real-time data
- ✅ Auto-refresh on create/update
- ✅ Proper error handling
- ✅ Loading states

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Supabase account
- npm or yarn

### Installation

1. **Navigate to the client directory**
```bash
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase**
The `.env` file is already configured with:
```
REACT_APP_SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[your-key]
PORT=5002
```

4. **Start the application**
```bash
npm start
```

The application will open at `http://localhost:5002`

## 📊 Database Schema

### Tables Required:

#### 1. portfolios
```sql
- portfolio_id (uuid, primary key)
- name (varchar)
- created_at (timestamp)
```

#### 2. sites
```sql
- site_id (uuid, primary key)
- portfolio_id (uuid, foreign key)
- site_name (varchar)
- created_at (timestamp)
```

#### 3. issues
```sql
- issue_id (uuid, primary key)
- portfolio_id (uuid, foreign key)
- site_id (uuid, foreign key, nullable)
- issue_hour (integer)
- issue_present (varchar)
- issue_details (text)
- case_number (varchar, nullable)
- monitored_by (varchar, nullable)
- issues_missed_by (varchar, nullable)
- entered_by (varchar)
- created_at (timestamp)
- updated_at (timestamp)
```

## 🎨 UI/UX Features

- Clean, modern interface with Tailwind CSS
- Responsive design (mobile, tablet, desktop)
- Color-coded status indicators
- Smooth transitions and hover effects
- Modal dialogs for editing
- Toast notifications for success/error
- Loading spinners
- Empty states with helpful messages
- Accessible form controls

## 📈 Analytics & Reporting

### Coverage Metrics
- Real-time hourly coverage tracking
- Historical coverage trends
- Performance scoring algorithm
- Risk distribution analysis

### Export Capabilities
- CSV export with all issue details
- Filtered data export
- Date range exports
- User-specific exports

## 👥 Personnel Management

Supported monitored personnel:
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

## 📱 Responsive Design

- Desktop: Full layout with all features
- Tablet: Optimized grid layouts
- Mobile: Stacked layouts, touch-friendly

## 🔧 Technical Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **Date Handling**: Native JavaScript Date API

## 📝 Component Structure

```
src/
├── components/
│   ├── SinglePageComplete.js (Main component)
│   ├── EditIssueModal.js (Edit functionality)
│   ├── HourlyCoverageChart.js (Coverage visualization)
│   ├── PerformanceAnalytics.js (Analytics dashboard)
│   └── IssuesByUser.js (User-based filtering)
├── services/
│   └── supabaseClient.js (Database connection)
├── App.js
└── index.js
```

## 🎯 Key Workflows

### 1. Logging a New Issue
1. Click "Log New Issue" button
2. Select portfolio from dropdown
3. Choose hour
4. Select "Yes" or "No" for issue present
5. If "Yes", describe the issue
6. Optionally add case number, monitored by, missed by
7. Click "Update Issue"

### 2. Viewing Portfolio Issues
1. Click on any portfolio card in the dashboard
2. View filtered issues for that portfolio
3. Click "Clear Selection" to return to all issues

### 3. Editing an Issue
1. Click "Edit" button on any issue
2. Modify fields in the modal
3. Click "Update Issue" to save
4. Modal closes and data refreshes

### 4. Analyzing Performance
1. Navigate to "Performance Analytics" tab
2. View coverage statistics
3. Check performance score
4. Review 24-hour coverage metrics
5. Analyze performance insights

### 5. Filtering by User
1. Navigate to "Issues by User" tab
2. Apply desired filters
3. View filtered results
4. Export to CSV if needed

## 🐛 Troubleshooting

### Issue: Data not loading
- Check Supabase connection in browser console
- Verify .env file has correct credentials
- Ensure tables exist in Supabase

### Issue: Charts not displaying
- Ensure recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify data format

### Issue: Edit modal not working
- Check issue object has all required fields
- Verify portfolio_id and site_id relationships
- Check browser console for errors

## 🔐 Security Notes

- Anon key is safe for client-side use
- Row Level Security (RLS) should be configured in Supabase
- Implement authentication for production use
- Validate all inputs server-side

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify database schema matches requirements
3. Ensure all dependencies are installed
4. Check Supabase connection status

## 🎉 Features Summary

✅ Complete Dashboard with 26 portfolios
✅ Real-time status updates
✅ Issue logging with full form
✅ Edit functionality with modal
✅ Hourly coverage charts with filters
✅ Performance analytics with metrics
✅ Issues by user with filtering
✅ CSV export capability
✅ Responsive design
✅ Clean, professional UI
✅ All features from screenshots implemented

## 🚀 Next Steps (Optional Enhancements)

- [ ] Add user authentication
- [ ] Implement role-based access control
- [ ] Add email notifications
- [ ] Create scheduled reports
- [ ] Add dark mode
- [ ] Implement real-time updates with Supabase subscriptions
- [ ] Add more chart types
- [ ] Create mobile app version
- [ ] Add bulk operations
- [ ] Implement issue resolution workflow

---

**Status**: ✅ Fully Functional and Ready for Use!
