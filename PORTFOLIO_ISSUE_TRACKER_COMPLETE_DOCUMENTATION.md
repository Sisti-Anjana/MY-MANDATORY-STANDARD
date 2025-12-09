# PORTFOLIO ISSUE TRACKER - COMPLETE APPLICATION DOCUMENTATION

**Document Version:** 1.0  
**Date:** January 2025  
**Application Name:** Portfolio Issue Tracker  
**Purpose:** Complete technical documentation for presentation and reference

---

## TABLE OF CONTENTS

1. [Application Overview](#1-application-overview)
2. [Frontend Details](#2-frontend-details)
3. [Backend Details](#3-backend-details)
4. [Database (Supabase) Details](#4-database-supabase-details)
5. [API Endpoints](#5-api-endpoints)
6. [Authentication & Credentials](#6-authentication--credentials)
7. [Environment Variables](#7-environment-variables)
8. [Deployment Information](#8-deployment-information)
9. [Technical Stack](#9-technical-stack)
10. [Key Features](#10-key-features)

---

## 1. APPLICATION OVERVIEW

### Application Name
**Portfolio Issue Tracker**

### Description
A web-based application for tracking and managing portfolio issues with real-time monitoring, hour-based locking system, and comprehensive analytics. The application allows users to log issues for different portfolios, track coverage, and manage portfolios efficiently.

### Main Purpose
- Track issues across multiple portfolios
- Monitor portfolio coverage by hour
- Manage user access and permissions
- Generate reports and analytics
- Admin panel for user and portfolio management

---

## 2. FRONTEND DETAILS

### Platform
**Netlify**

### Frontend URL
```
https://standardsolarhlsc.netlify.app
```

### Status
✅ **LIVE AND ACTIVE**

### Technology Stack
- **Framework:** React 18.2.0
- **Routing:** React Router DOM 6.8.1
- **Charts:** Recharts 2.8.0
- **HTTP Client:** Axios 1.6.0
- **Database Client:** @supabase/supabase-js 2.38.0
- **Styling:** Tailwind CSS 3.3.0

### Build Configuration
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `build`
- **Base Directory:** `client`
- **Node Version:** 18

### Frontend Features
- User authentication (User and Admin login)
- Portfolio dashboard with cards
- Issue logging interface
- Real-time portfolio locking system
- Session sheet for multiple issue logging
- Performance analytics and charts
- Coverage matrix visualization
- CSV export functionality
- Admin panel for management
- Responsive design

### Frontend Environment Variables (Netlify)
```
REACT_APP_SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8
```

---

## 3. BACKEND DETAILS

### Platform
**Render**

### Backend URL
```
https://my-mandatory-standard.onrender.com
```

### API Base URL
```
https://my-mandatory-standard.onrender.com/api
```

### Status
✅ **DEPLOYED AND ACTIVE**

### Technology Stack
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18.2
- **Database:** Supabase (PostgreSQL)
- **Session Management:** UUID-based sessions
- **CORS:** Enabled for cross-origin requests

### Backend Configuration
- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Port:** 10000 (Render default)

### Backend Dependencies
- express: ^4.18.2
- cors: ^2.8.5
- body-parser: ^1.20.2
- @supabase/supabase-js: ^2.38.0
- uuid: ^9.0.1
- sqlite3: ^5.1.7 (fallback for local development)

### Backend Environment Variables (Render)
```
PORT=10000
NODE_ENV=production
USE_SUPABASE=true
SUPABASE_URL=https://wkkclsbaavdlplcqrsyr.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
```

---

## 4. DATABASE (SUPABASE) DETAILS

### Platform
**Supabase (PostgreSQL)**

### Supabase Project URL
```
https://wkkclsbaavdlplcqrsyr.supabase.co
```

### Status
✅ **ACTIVE**

### Database Type
PostgreSQL (managed by Supabase)

### Supabase Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8
```

### Supabase Service Key (Private - Backend Only)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g
```

### Database Tables
1. **portfolios** - Portfolio information
2. **sites** - Site details linked to portfolios
3. **issues** - Issue tracking records
4. **users** - User accounts and authentication
5. **hour_reservations** - Portfolio locking system

### Database Access
- **Dashboard:** https://supabase.com/dashboard
- **SQL Editor:** Available in Supabase dashboard
- **API Access:** Via Supabase REST API or JavaScript client

---

## 5. API ENDPOINTS

### Base URL
```
https://my-mandatory-standard.onrender.com/api
```

### Portfolio Endpoints

#### Get All Portfolios
```
GET /api/portfolios
```
**Response:** Array of portfolio objects

#### Create Portfolio (Admin)
```
POST /api/portfolios
Body: { "name": "Portfolio Name" }
```

#### Delete Portfolio
```
DELETE /api/portfolios/:id
```

#### Get Portfolio Status
```
GET /api/portfolios/:id/status
```

#### Update Portfolio Status
```
PUT /api/portfolios/:id/status
Body: { "all_sites_checked": true/false }
```

#### Get Sites by Portfolio
```
GET /api/portfolios/:portfolioId/sites
```

---

### Issue Endpoints

#### Get All Issues
```
GET /api/issues
Query Parameters:
  - search: Search term
  - portfolio_id: Filter by portfolio
```

#### Create Issue
```
POST /api/issues
Body: {
  "portfolio_id": "uuid",
  "issue_hour": 1-24,
  "issue_present": "Yes" or "No",
  "issue_details": "Details text",
  "case_number": "Case number",
  "monitored_by": "User name",
  "issues_missed_by": "Name"
}
```

#### Update Issue
```
PUT /api/issues/:id
Body: Same as create issue
```

#### Delete Issue
```
DELETE /api/issues/:id
```

#### Get Issues by Portfolio
```
GET /api/portfolios/:portfolioId/issues
```

---

### Site Endpoints

#### Get All Sites
```
GET /api/sites
```

---

### User Endpoints

#### Get All Users
```
GET /api/users
```

#### Create User
```
POST /api/users
Body: {
  "name": "User Name",
  "role": "user" or "admin"
}
```

#### Delete User
```
DELETE /api/users/:id
```

---

### Reservation (Locking) Endpoints

#### Create Reservation
```
POST /api/reservations
Body: {
  "portfolio_id": "uuid",
  "issue_hour": 1-24,
  "monitored_by": "User name"
}
```

#### Check Reservation Status
```
GET /api/reservations/check
Query Parameters:
  - portfolio_id
  - issue_hour
  - monitored_by
```

#### Get All Active Reservations (Current Session)
```
GET /api/reservations
```

#### Get All Active Reservations (All Users)
```
GET /api/reservations/all
```

#### Release Reservation
```
DELETE /api/reservations/:id
```

---

### Analytics Endpoints

#### Get Coverage Data
```
GET /api/coverage
Response: Coverage percentage by hour
```

#### Get Statistics
```
GET /api/stats
Response: Total issues, portfolios with issues, average hour, etc.
```

---

## 6. AUTHENTICATION & CREDENTIALS

### Admin Credentials

#### Hardcoded Admin (Primary)
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator
- **Access:** Full admin panel access

#### Database Admin (If configured)
- **Username:** `admin`
- **Password:** `admin123` (or as set in database)
- **Role:** admin

### User Credentials

#### Test User 1
- **Username:** `user1`
- **Password:** `user123`
- **Role:** User
- **Access:** Standard user features

#### Test User 2
- **Username:** `user2`
- **Password:** `user123`
- **Role:** User
- **Access:** Standard user features

### Authentication Method
- **Frontend:** Session-based authentication using `sessionStorage`
- **Backend:** Session ID passed via `x-session-id` header
- **Admin Panel:** Protected route requiring authentication
- **Session Duration:** 2 hours for admin, session-based for users

### Login URLs
- **User Login:** `https://standardsolarhlsc.netlify.app/` (default)
- **Admin Login:** Same URL, select "Admin Login" option

---

## 7. ENVIRONMENT VARIABLES

### Frontend Environment Variables (Netlify)

| Variable Name | Value |
|--------------|-------|
| `REACT_APP_SUPABASE_URL` | `https://wkkclsbaavdlplcqrsyr.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8` |

### Backend Environment Variables (Render)

| Variable Name | Value |
|--------------|-------|
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `USE_SUPABASE` | `true` |
| `SUPABASE_URL` | `https://wkkclsbaavdlplcqrsyr.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.tL6KYs3_-_zxJ3-RJ0DQm8fEQz3vWmBGhKXCl9_Dw6g` |

---

## 8. DEPLOYMENT INFORMATION

### Frontend Deployment (Netlify)

**Platform:** Netlify  
**URL:** https://standardsolarhlsc.netlify.app  
**Build Settings:**
- Base Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Node Version: 18

**Proxy Configuration:**
- All `/api/*` requests are proxied to Render backend
- Configured in `netlify.toml`

### Backend Deployment (Render)

**Platform:** Render  
**URL:** https://my-mandatory-standard.onrender.com  
**Configuration:**
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: Node
- Region: Oregon (or as configured)

### Single URL Setup

The application uses Netlify's proxy feature to route API requests:
- Frontend: `https://standardsolarhlsc.netlify.app`
- API calls: `https://standardsolarhlsc.netlify.app/api/*` (proxied to Render)

This provides a **single URL** for the entire application.

---

## 9. TECHNICAL STACK

### Frontend Technologies
- **React** 18.2.0 - UI framework
- **React Router DOM** 6.8.1 - Client-side routing
- **Recharts** 2.8.0 - Data visualization
- **Axios** 1.6.0 - HTTP client
- **Supabase JS** 2.38.0 - Database client
- **Tailwind CSS** 3.3.0 - Styling framework

### Backend Technologies
- **Node.js** 18+ - Runtime environment
- **Express.js** 4.18.2 - Web framework
- **CORS** 2.8.5 - Cross-origin resource sharing
- **Body Parser** 1.20.2 - Request body parsing
- **UUID** 9.0.1 - Unique identifier generation
- **Supabase JS** 2.38.0 - Database client

### Database
- **PostgreSQL** (via Supabase)
- **Supabase** - Database hosting and management

### Deployment Platforms
- **Netlify** - Frontend hosting
- **Render** - Backend hosting
- **Supabase** - Database hosting

---

## 10. KEY FEATURES

### Portfolio Management
- View all portfolios in dashboard
- Portfolio cards with status indicators
- Green status for completed portfolios
- Purple border for locked portfolios
- "All Sites Checked" functionality

### Issue Logging
- Log issues for specific portfolios
- Hour-based issue tracking (1-24 hours)
- Issue details and case number tracking
- "Issue Present" (Yes/No) tracking
- Multiple issues per portfolio lock

### Locking System
- Hour-based portfolio locking
- One user per portfolio per hour
- Automatic lock release at hour change
- Lock release after "All Sites Checked" = Yes
- Visual indicators (purple border) for locked portfolios

### Session Management
- Session-based authentication
- Session ID tracking via headers
- Multiple issue logging per session
- Session sheet for batch logging

### Analytics & Reporting
- Performance analytics dashboard
- Coverage matrix by hour
- Statistics and metrics
- CSV export with date filters
- Charts and visualizations

### Admin Features
- User management (create, delete users)
- Portfolio management (create, delete portfolios)
- Admin panel access control
- System administration tools

### User Features
- Dashboard access
- Issue logging
- View issues and details
- Portfolio status tracking
- CSV export functionality

---

## QUICK REFERENCE

### Main Application URL
```
https://standardsolarhlsc.netlify.app
```

### Backend API URL
```
https://my-mandatory-standard.onrender.com/api
```

### Database URL
```
https://wkkclsbaavdlplcqrsyr.supabase.co
```

### Admin Login
- Username: `admin`
- Password: `admin123`

### Test User Login
- Username: `user1` or `user2`
- Password: `user123`

---

## SECURITY NOTES

⚠️ **IMPORTANT SECURITY INFORMATION:**

1. **Admin Credentials:** The admin credentials (`admin`/`admin123`) are hardcoded in the application. For production use, implement proper password hashing and database-based authentication.

2. **API Keys:** The Supabase keys provided in this document are:
   - **Anon Key:** Public key, safe to expose in frontend
   - **Service Key:** Private key, should only be used in backend (never expose in frontend)

3. **Session Management:** Sessions are managed via `sessionStorage` and session IDs. For production, consider implementing more secure session management.

4. **CORS:** CORS is enabled for all origins. Consider restricting this in production.

---

## SUPPORT & MAINTENANCE

### Access Points
- **Netlify Dashboard:** https://app.netlify.com
- **Render Dashboard:** https://dashboard.render.com
- **Supabase Dashboard:** https://supabase.com/dashboard

### Logs & Monitoring
- **Netlify Logs:** Available in Netlify dashboard under Deploys
- **Render Logs:** Available in Render dashboard under Service logs
- **Supabase Logs:** Available in Supabase dashboard under Logs

### Backup & Recovery
- **Database:** Supabase provides automatic backups
- **Code:** Version controlled (Git repository)
- **Environment Variables:** Stored in deployment platforms

---

## DOCUMENT CONTROL

**Document Created:** January 2025  
**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Current

---

**END OF DOCUMENTATION**


