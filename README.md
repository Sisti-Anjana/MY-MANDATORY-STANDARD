# 📊 Portfolio Issue Tracker

A comprehensive, real-time issue tracking and performance analytics system for monitoring multiple portfolios across 24-hour cycles.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-brightgreen)

## 🎯 Quick Start

### Option 1: Double-Click to Run
Simply double-click `START_APP.bat` in the project root directory.

### Option 2: Manual Start
```bash
cd client
npm install
npm start
```

The application will open automatically at `http://localhost:5002`

## ✨ Key Features

- **📊 Real-Time Dashboard** - 26 portfolios with live status indicators
- **📝 Issue Logging** - Comprehensive form with smart validation
- **✏️ Edit Functionality** - Modal-based editing for all issues
- **📈 Coverage Analytics** - Interactive hourly charts with date filters
- **🎯 Performance Metrics** - Score gauges, coverage circles, and insights
- **👥 User Filtering** - Advanced search and CSV export capabilities
- **🔄 Live Updates** - Real-time data synchronization with Supabase

## 📸 Screenshots

All features match the provided reference screenshots exactly:
- ✅ Edit Issue Modal
- ✅ Main Dashboard with 26 Portfolios
- ✅ Portfolio Issues View
- ✅ Hourly Coverage Chart
- ✅ Ticket Logging System
- ✅ Performance Analytics
- ✅ Issues by User

## 📁 Project Structure

```
portfolio_Issue_Tracking/
├── START_APP.bat                          # Quick start script
├── DATABASE_SETUP.sql                     # Complete database schema
├── COMPLETE_IMPLEMENTATION_SUMMARY.md     # Detailed feature documentation
├── client/                                # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── SinglePageComplete.js    # Main dashboard
│   │   │   ├── EditIssueModal.js        # Edit functionality
│   │   │   ├── HourlyCoverageChart.js   # Coverage charts
│   │   │   ├── PerformanceAnalytics.js  # Analytics dashboard
│   │   │   └── IssuesByUser.js          # User filtering
│   │   └── services/
│   │       └── supabaseClient.js        # Database connection
│   ├── .env                              # Environment variables
│   └── package.json                      # Dependencies
└── server/                                # Backend (optional)
```

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure Supabase
The `.env` file is already configured:
```env
REACT_APP_SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-key>
PORT=5002
```

### 3. Set Up Database
1. Log in to your Supabase project
2. Go to SQL Editor
3. Copy and paste the contents of `DATABASE_SETUP.sql`
4. Run the script to create all tables and sample data

### 4. Start the Application
```bash
npm start
```

## 📚 Documentation

- **[COMPLETE_IMPLEMENTATION_SUMMARY.md](./COMPLETE_IMPLEMENTATION_SUMMARY.md)** - Comprehensive feature documentation with screenshot analysis
- **[DATABASE_SETUP.sql](./DATABASE_SETUP.sql)** - Complete database schema and sample data
- **[README_COMPLETE.md](./README_COMPLETE.md)** - Detailed technical documentation

## 🎨 Technology Stack

- **Frontend**: React 18.2.0
- **Styling**: Tailwind CSS 3.3.0
- **Charts**: Recharts 2.8.0
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **HTTP Client**: Axios 1.6.0

## 📊 Features by Tab

### Dashboard & Log Issues
- 26 portfolio cards with color-coded status
- Real-time activity indicators (No Activity, 1h-3h Inactive, Updated <1h)
- Click-to-view portfolio-specific issues
- Comprehensive issue logging form
- Edit functionality with modal popups
- Hourly coverage analysis chart with date filters

### Performance Analytics
- Coverage statistics (Peak/Lowest hours)
- Performance score gauge (0-10 scale)
- 24-hour overall coverage circle
- Portfolios checked vs total count
- Performance insights dashboard
- Coverage consistency metrics

### Issues by User
- Total and missed issues summary
- Advanced filtering options:
  - Show missed issues only
  - Search by missed by / monitored by
  - Date range selection
- CSV export functionality
- Comprehensive sortable table
- Edit action per row

## 👥 Monitored Personnel

The system supports 12 monitored personnel:
- Anjana, Anita P, Arun V, Bharat Gu, Deepa L, jenny
- Kumar S, Lakshmi B, Manoj D, Rajesh K, Ravi T, Vikram N

## 🔍 Database Schema

### Tables
1. **portfolios** - 26 portfolios (Aurora, BESS & Trimark, etc.)
2. **sites** - Optional sites linked to portfolios
3. **issues** - Complete issue tracking with timestamps

### Key Fields
- Portfolio, Site, Hour (0-23)
- Issue Present (Yes/No), Issue Details
- Case Number, Monitored By, Issues Missed By
- Status, Severity, Resolution Notes
- Created/Updated/Resolved timestamps

## 📈 Analytics Calculations

### Coverage %
```
(Unique Portfolios Checked / 26 Total Portfolios) × 100
```

### Performance Score
```
(Average Hourly Coverage / 10) rounded
```

### Status Indicators
- 🔴 No Activity (4h+)
- 🟠 3h Inactive
- 🟡 2h Inactive
- 🔵 1h Inactive
- 🟢 Updated (<1h)

## 🐛 Troubleshooting

### Application won't start
```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm start
```

### Data not loading
1. Check browser console for errors
2. Verify Supabase credentials in `.env`
3. Ensure database tables exist
4. Check Supabase connection status

### Charts not displaying
```bash
npm install recharts
```

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

The build folder will contain the optimized production build.

## 🔐 Security

- ✅ Environment variables for sensitive data
- ✅ Supabase Row Level Security (RLS) ready
- ✅ Input validation on all forms
- ✅ SQL injection prevention via Supabase
- 🔜 Add authentication for production use

## 📝 License

This project is proprietary and confidential.

## 👨‍💻 Support

For issues or questions:
1. Check `COMPLETE_IMPLEMENTATION_SUMMARY.md` for detailed documentation
2. Review browser console for error messages
3. Verify database schema matches `DATABASE_SETUP.sql`
4. Ensure all dependencies are installed

## 🎉 Status

**✅ FULLY FUNCTIONAL AND READY FOR USE!**

All features from the reference screenshots have been implemented:
- ✅ Dashboard with 26 portfolios
- ✅ Issue logging and editing
- ✅ Hourly coverage charts
- ✅ Performance analytics
- ✅ User-based filtering
- ✅ CSV export
- ✅ Real-time updates
- ✅ Responsive design

---

**Last Updated:** November 7, 2025
**Version:** 1.0.0
**Status:** Production Ready