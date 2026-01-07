# Multi-Tenant Application Architecture Plan
## Complete Guide for Building Your Client Management System

---

## Table of Contents
1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Database Schema Design](#2-database-schema-design)
3. [User Access Flow](#3-user-access-flow)
4. [Application Structure](#4-application-structure)
5. [Technology Stack](#5-technology-stack-recommendation)
6. [Implementation Phases](#6-implementation-phases)
7. [Security & Data Isolation](#7-security--data-isolation)
8. [Request Flow Example](#8-example-how-a-request-flows)
9. [Project Folder Structure](#9-folder-structure)
10. [Features Checklist](#10-key-features-checklist)

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN PORTAL                        │
│                     (Your Management Panel)                      │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Manages
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CENTRAL APPLICATION                         │
│                    (Single Codebase/Database)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Client A │  │ Client B │  │ Client C │  │ Client D │  ...  │
│  │  Tenant  │  │  Tenant  │  │  Tenant  │  │  Tenant  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│       │             │             │             │               │
│       ▼             ▼             ▼             ▼               │
│  [Their Users] [Their Users] [Their Users] [Their Users]       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Overview
- **Single Codebase**: One application serves all clients
- **Single Database**: All data in one place with strict isolation
- **Multi-Tenant Design**: Each client (tenant) has isolated data
- **Centralized Management**: You control everything from super admin panel

---

## 2. Database Schema Design

### Core Tables Structure

#### 📋 TENANTS Table (Clients)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| name | VARCHAR | Client company name (e.g., "ABC Company") |
| subdomain | VARCHAR | Unique subdomain (e.g., "abc" → abc.yourapp.com) |
| logo_url | TEXT | Client's logo |
| status | ENUM | active/inactive/suspended |
| subscription_plan | ENUM | basic/pro/enterprise |
| created_at | TIMESTAMP | Account creation date |
| settings | JSON | Custom configurations per tenant |
| contact_email | VARCHAR | Primary contact email |

#### 👤 USERS Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| tenant_id | UUID | **Foreign Key → TENANTS** ⭐ |
| email | VARCHAR | User email (unique) |
| password_hash | TEXT | Encrypted password |
| role | ENUM | super_admin/tenant_admin/tenant_user |
| full_name | VARCHAR | User's full name |
| status | ENUM | active/inactive |
| created_at | TIMESTAMP | Account creation date |
| last_login | TIMESTAMP | Last login timestamp |

#### 📊 EMPLOYEE_RECORDS Table (Example)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| tenant_id | UUID | **Foreign Key → TENANTS** ⭐ |
| employee_name | VARCHAR | Employee full name |
| employee_code | VARCHAR | Unique employee ID |
| department | VARCHAR | Department name |
| mandatory_status | VARCHAR | Compliance status |
| ... | ... | All other fields from current app |

#### 🔐 SESSIONS Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key → USERS |
| tenant_id | UUID | **Foreign Key → TENANTS** ⭐ |
| token | TEXT | JWT token |
| expires_at | TIMESTAMP | Token expiry |

### 🔑 Key Design Principle
**Every table (except TENANTS) must have a `tenant_id` column for data isolation!**

This ensures:
- Data never leaks between clients
- Easy to query per tenant
- Scalable architecture
- Clear data ownership

---

## 3. User Access Flow

### Access Hierarchy

```
[SUPER ADMIN] (You)
    │
    ├─ Access Level: ALL TENANTS
    ├─ Permissions:
    │   ├─ Create/Delete/Manage all tenants
    │   ├─ View analytics across all clients
    │   ├─ Manage subscriptions & billing
    │   ├─ Access any tenant's data (read-only)
    │   └─ System-wide configurations
    │
    ↓ Creates Tenant
    
[TENANT ADMIN] (Client's Administrator)
    │
    ├─ Access Level: THEIR TENANT ONLY
    ├─ Permissions:
    │   ├─ Manage users in their organization
    │   ├─ Configure tenant settings
    │   ├─ View all data within their tenant
    │   ├─ Generate reports for their org
    │   └─ Cannot see other tenants
    │
    ↓ Creates User
    
[TENANT USER] (Client's Employee)
    │
    ├─ Access Level: LIMITED WITHIN THEIR TENANT
    ├─ Permissions:
    │   ├─ View data based on role
    │   ├─ Perform assigned tasks
    │   ├─ Update specific records
    │   └─ Cannot see admin functions
```

---

## 4. Application Structure

### URL Structure Option 1: Path-Based

```
yourapp.com
    │
    ├── /super-admin          → Your admin panel
    │   ├── /tenants          → Manage all clients
    │   │   ├── /create       → Add new client
    │   │   ├── /edit/:id     → Edit client
    │   │   └── /view/:id     → View client details
    │   ├── /analytics        → Global analytics dashboard
    │   ├── /billing          → Subscription management
    │   └── /settings         → System settings
    │
    ├── /login                → Tenant login page
    │   │                       (System detects tenant from email)
    │   └── /super-admin      → Super admin login
    │
    └── /dashboard            → Tenant-specific dashboard
        ├── /employees        → Employee management
        ├── /reports          → Generate reports
        ├── /settings         → Tenant settings
        └── /users            → User management (admin only)
```

### URL Structure Option 2: Subdomain-Based (Recommended)

```
admin.yourapp.com          → Your super admin panel
    ├── /tenants
    ├── /analytics
    └── /billing

abc.yourapp.com            → Client ABC's portal
    ├── /dashboard
    ├── /employees
    └── /reports

xyz.yourapp.com            → Client XYZ's portal
    ├── /dashboard
    ├── /employees
    └── /reports
```

**Benefits of Subdomain Approach:**
- Better tenant isolation
- Cleaner URLs
- Easy to remember
- Professional appearance
- Can set different configurations per subdomain

---

## 5. Technology Stack Recommendation

### Frontend Stack
| Technology | Purpose | Why? |
|------------|---------|------|
| **React.js / Next.js** | UI Framework | Modern, fast, SEO-friendly |
| **TypeScript** | Type Safety | Catch errors early, better IDE support |
| **Tailwind CSS** | Styling | Quick development, consistent design |
| **Zustand / Redux** | State Management | Handle complex app state |
| **React Query** | Data Fetching | Cache management, automatic refetch |
| **React Router** | Navigation | Client-side routing |

### Backend Stack
| Technology | Purpose | Why? |
|------------|---------|------|
| **Node.js** | Runtime | JavaScript everywhere |
| **Express.js** | Web Framework | Simple, flexible, widely used |
| **TypeScript** | Type Safety | Same as frontend |
| **JWT** | Authentication | Stateless, secure tokens |
| **Supabase SDK** | Database Client | Easy integration |

### Database & Storage
| Technology | Purpose | Why? |
|------------|---------|------|
| **Supabase** | Database (PostgreSQL) | Built-in auth, real-time, storage |
| **PostgreSQL** | Relational Database | Powerful, reliable, ACID compliant |
| **Row Level Security** | Data Isolation | Database-level security |
| **Supabase Storage** | File Storage | Integrated with database |

### DevOps & Deployment
| Technology | Purpose | Why? |
|------------|---------|------|
| **Vercel / Netlify** | Frontend Hosting | Fast CDN, easy deployment |
| **Railway / Render** | Backend Hosting | Easy Node.js deployment |
| **Supabase Cloud** | Database Hosting | Managed PostgreSQL |
| **GitHub Actions** | CI/CD | Automated testing & deployment |

---

## 6. Implementation Phases

### 📅 Phase 1: Foundation (Week 1-2)
**Goal: Setup project infrastructure**

#### Tasks:
- [ ] Initialize project repositories
  - [ ] Create frontend repo (React/Next.js)
  - [ ] Create backend repo (Node.js/Express)
  - [ ] Setup version control
  
- [ ] Setup Supabase project
  - [ ] Create new Supabase project
  - [ ] Configure database
  - [ ] Setup authentication
  
- [ ] Create database schema
  - [ ] Design all tables
  - [ ] Create migrations
  - [ ] Setup Row Level Security policies
  - [ ] Add seed data for testing
  
- [ ] Implement authentication system
  - [ ] JWT token generation
  - [ ] Login/logout endpoints
  - [ ] Password hashing
  - [ ] Token validation middleware
  
- [ ] Build super admin dashboard
  - [ ] Admin login page
  - [ ] Dashboard layout
  - [ ] Navigation menu
  - [ ] Basic tenant list view

**Deliverables:**
- Working dev environment
- Database ready
- Basic admin login functional

---

### 📅 Phase 2: Tenant Management (Week 3)
**Goal: Complete tenant CRUD operations**

#### Tasks:
- [ ] Tenant CRUD operations
  - [ ] Create tenant (with validation)
  - [ ] Read/List all tenants
  - [ ] Update tenant details
  - [ ] Soft delete tenant (status = inactive)
  
- [ ] Tenant registration flow
  - [ ] Admin can add new tenant
  - [ ] Auto-generate subdomain
  - [ ] Send welcome email
  - [ ] Create default tenant admin user
  
- [ ] Subdomain/routing setup
  - [ ] Configure subdomain routing
  - [ ] Detect tenant from subdomain
  - [ ] Fallback to path-based if subdomain unavailable
  
- [ ] Data isolation middleware
  - [ ] Extract tenant_id from token
  - [ ] Validate user belongs to tenant
  - [ ] Auto-append tenant_id to queries
  - [ ] Block cross-tenant access

**Deliverables:**
- Full tenant management
- Subdomain routing working
- Data isolation enforced

---

### 📅 Phase 3: Core Features (Week 4-5)
**Goal: Port existing features to multi-tenant architecture**

#### Tasks:
- [ ] Port employee management features
  - [ ] Add tenant_id to employee tables
  - [ ] Create employee CRUD endpoints
  - [ ] Employee list view (filtered by tenant)
  - [ ] Employee detail page
  - [ ] Import/export functionality
  
- [ ] Add role-based permissions
  - [ ] Define permission matrix
  - [ ] Create permission middleware
  - [ ] Protect routes based on roles
  - [ ] UI shows/hides based on permissions
  
- [ ] Build tenant dashboard
  - [ ] Tenant login page
  - [ ] Main dashboard with stats
  - [ ] Quick actions
  - [ ] Recent activity feed
  
- [ ] Reports per tenant
  - [ ] Design report templates
  - [ ] Generate PDF reports
  - [ ] Filter by date range
  - [ ] Export to Excel/CSV

**Deliverables:**
- Working tenant portal
- All main features ported
- Role-based access working

---

### 📅 Phase 4: Polish & Launch (Week 6)
**Goal: Production-ready application**

#### Tasks:
- [ ] Testing all flows
  - [ ] Unit tests (backend)
  - [ ] Integration tests
  - [ ] E2E tests (frontend)
  - [ ] Security testing
  - [ ] Performance testing
  
- [ ] Security audit
  - [ ] SQL injection prevention
  - [ ] XSS protection
  - [ ] CSRF tokens
  - [ ] Rate limiting
  - [ ] Input validation
  
- [ ] Performance optimization
  - [ ] Database indexing
  - [ ] Query optimization
  - [ ] Frontend bundle size
  - [ ] Image optimization
  - [ ] Caching strategy
  
- [ ] Documentation
  - [ ] API documentation
  - [ ] User guide for tenants
  - [ ] Admin guide
  - [ ] Developer documentation
  - [ ] Deployment guide

**Deliverables:**
- Production-ready application
- All tests passing
- Documentation complete

---

## 7. Security & Data Isolation

### 🔒 Security Layers

#### Layer 1: Authentication
```
User Login → Server validates credentials
    ↓
Generate JWT token with payload:
{
  user_id: "uuid-123",
  tenant_id: "tenant-abc",
  role: "tenant_admin",
  email: "admin@client.com",
  exp: 1234567890
}
    ↓
Return token to client
    ↓
Client stores in localStorage/cookie
    ↓
Every request includes token in header:
Authorization: Bearer <token>
```

#### Layer 2: Backend Middleware
```javascript
// Every API request goes through this
function tenantIsolationMiddleware(req, res, next) {
  // 1. Extract token from header
  const token = req.headers.authorization;
  
  // 2. Verify and decode token
  const decoded = verifyJWT(token);
  
  // 3. Check if user is authenticated
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // 4. Attach tenant_id to request
  req.tenant_id = decoded.tenant_id;
  req.user_id = decoded.user_id;
  req.role = decoded.role;
  
  // 5. Continue to next handler
  next();
}
```

#### Layer 3: Database (Supabase RLS)
```sql
-- Row Level Security Policy
-- Users can only see data from their tenant

CREATE POLICY "tenant_isolation_policy"
ON employees
FOR ALL
USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Super admin bypass
CREATE POLICY "super_admin_access"
ON employees
FOR ALL
USING (
  current_setting('app.user_role') = 'super_admin'
);
```

#### Layer 4: Frontend
```javascript
// Frontend only shows data for logged-in user's tenant
// Never trust frontend - always validate on backend
const currentUser = useAuth(); // { tenant_id, role, etc }

// All API calls automatically include tenant context
api.get('/employees'); // Backend filters by tenant_id
```

### 🛡️ Security Best Practices

1. **Never Trust Client Input**
   - Always validate on backend
   - Sanitize all inputs
   - Use parameterized queries

2. **Token Security**
   - Short expiration time (1-2 hours)
   - Refresh tokens for long sessions
   - Secure HTTP-only cookies

3. **Password Security**
   - bcrypt with salt rounds ≥ 10
   - Minimum password strength
   - Password reset flow

4. **API Security**
   - Rate limiting (prevent brute force)
   - CORS configuration
   - HTTPS only in production

5. **Data Isolation**
   - Always filter by tenant_id
   - Never expose tenant_id in URLs
   - Audit logs for cross-tenant access attempts

---

## 8. Example: How a Request Flows

### Scenario: Client ABC Admin views their employees

```
Step 1: User Logs In
─────────────────────
User: admin@clientabc.com
Password: ********
    ↓
Backend validates credentials
    ↓
Lookup in database:
SELECT * FROM users 
WHERE email = 'admin@clientabc.com' 
AND status = 'active'
    ↓
Found: { user_id: "user-123", tenant_id: "tenant-abc", role: "tenant_admin" }
    ↓
Generate JWT token:
{
  user_id: "user-123",
  tenant_id: "tenant-abc",
  role: "tenant_admin",
  exp: <2 hours from now>
}
    ↓
Return token to frontend
```

```
Step 2: User Requests Employee List
────────────────────────────────────
Frontend calls: GET /api/employees
Headers: { Authorization: "Bearer <token>" }
    ↓
Backend receives request
    ↓
Middleware extracts token
    ↓
Verifies token signature
    ↓
Decodes token → tenant_id = "tenant-abc"
    ↓
Query database:
SELECT * FROM employees 
WHERE tenant_id = 'tenant-abc'
ORDER BY created_at DESC
    ↓
Returns only Client ABC's employees
    ↓
Frontend displays data
```

```
Step 3: User Tries to Access Another Tenant's Data (Attack Attempt)
────────────────────────────────────────────────────────────────────
Malicious request: GET /api/employees?tenant_id=tenant-xyz
    ↓
Backend receives request
    ↓
Middleware extracts tenant_id from TOKEN (not URL parameter)
    ↓
tenant_id from token = "tenant-abc"
    ↓
Query ignores URL parameter:
SELECT * FROM employees 
WHERE tenant_id = 'tenant-abc'  ← From token, not URL!
    ↓
Still returns only Client ABC's data
    ↓
Attack prevented! ✅
```

---

## 9. Folder Structure

```
multi-tenant-app/
│
├── client/                          # Frontend Application
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── pages/                   # Page components
│   │   │   ├── super-admin/         # Super admin pages
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── TenantList.tsx
│   │   │   │   ├── TenantCreate.tsx
│   │   │   │   ├── Analytics.tsx
│   │   │   │   └── Billing.tsx
│   │   │   │
│   │   │   ├── tenant/              # Tenant pages
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Employees.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   └── Settings.tsx
│   │   │   │
│   │   │   └── auth/                # Authentication pages
│   │   │       ├── Login.tsx
│   │   │       ├── Register.tsx
│   │   │       └── ForgotPassword.tsx
│   │   │
│   │   ├── components/              # Reusable components
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── Modal.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   │
│   │   │   └── tenant/
│   │   │       ├── EmployeeCard.tsx
│   │   │       └── StatWidget.tsx
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTenant.ts
│   │   │   └── usePermissions.ts
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── api.ts               # API client
│   │   │   ├── auth.ts              # Auth helpers
│   │   │   └── constants.ts
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   │   ├── user.ts
│   │   │   ├── tenant.ts
│   │   │   └── employee.ts
│   │   │
│   │   ├── App.tsx
│   │   └── index.tsx
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── server/                          # Backend Application
│   ├── src/
│   │   ├── routes/                  # API routes
│   │   │   ├── admin.routes.ts      # Super admin routes
│   │   │   ├── tenant.routes.ts     # Tenant routes
│   │   │   ├── auth.routes.ts       # Authentication routes
│   │   │   ├── employee.routes.ts   # Employee management
│   │   │   └── report.routes.ts     # Reports
│   │   │
│   │   ├── controllers/             # Route handlers
│   │   │   ├── admin.controller.ts
│   │   │   ├── tenant.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── employee.controller.ts
│   │   │
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.middleware.ts         # JWT verification
│   │   │   ├── tenantIsolation.middleware.ts  # ⭐ Key middleware
│   │   │   ├── permission.middleware.ts   # Role-based access
│   │   │   ├── rateLimiter.middleware.ts  # Rate limiting
│   │   │   └── errorHandler.middleware.ts
│   │   │
│   │   ├── services/                # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── tenant.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── employee.service.ts
│   │   │
│   │   ├── models/                  # Database models/types
│   │   │   ├── user.model.ts
│   │   │   ├── tenant.model.ts
│   │   │   └── employee.model.ts
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── jwt.ts               # JWT helpers
│   │   │   ├── password.ts          # Password hashing
│   │   │   ├── validation.ts        # Input validation
│   │   │   └── supabase.ts          # Supabase client
│   │   │
│   │   ├── config/                  # Configuration
│   │   │   ├── database.ts
│   │   │   ├── auth.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                 # Entry point
│   │
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── database/                        # Database related
│   ├── migrations/                  # Supabase migrations
│   │   ├── 001_create_tenants.sql
│   │   ├── 002_create_users.sql
│   │   ├── 003_create_employees.sql
│   │   └── 004_setup_rls.sql
│   │
│   ├── seed/                        # Seed data
│   │   └── dev_data.sql
│   │
│   └── schema.md                    # Database documentation
│
├── docs/                            # Documentation
│   ├── API.md                       # API documentation
│   ├── SETUP.md                     # Setup guide
│   └── DEPLOYMENT.md                # Deployment guide
│
└── README.md                        # Project overview
```

---

## 10. Key Features Checklist

### ✅ For You (Super Admin Portal)

#### Tenant Management
- [ ] View all tenants in a dashboard
- [ ] Add new tenant
  - [ ] Basic info (name, email, etc.)
  - [ ] Generate subdomain
  - [ ] Set subscription plan
  - [ ] Upload logo
- [ ] Edit tenant details
- [ ] Activate/Deactivate tenant
- [ ] Delete tenant (soft delete)
- [ ] View tenant activity logs

#### User Management
- [ ] View all users across all tenants
- [ ] Search/filter users
- [ ] Manually create users for any tenant
- [ ] Reset user passwords
- [ ] Disable user accounts

#### Analytics & Monitoring
- [ ] Total tenants count
- [ ] Active vs. inactive tenants
- [ ] Total users across all tenants
- [ ] Usage statistics per tenant
- [ ] System health metrics
- [ ] Error logs dashboard

#### Subscription & Billing
- [ ] View subscription plans
- [ ] Assign plan to tenant
- [ ] Track billing history
- [ ] Payment status per tenant
- [ ] Generate invoices

#### System Configuration
- [ ] Global settings
- [ ] Email templates
- [ ] Feature flags
- [ ] System announcements

---

### ✅ For Your Clients (Tenant Admin Portal)

#### Dashboard
- [ ] Overview statistics
- [ ] Quick actions
- [ ] Recent activity
- [ ] Pending tasks
- [ ] Notifications

#### User Management (Within Their Org)
- [ ] Add users to their organization
- [ ] Edit user details
- [ ] Assign roles to users
- [ ] Deactivate users
- [ ] Reset user passwords

#### Employee Management
- [ ] View all employees (filtered to their tenant)
- [ ] Add new employee records
- [ ] Edit employee details
- [ ] Import employees (CSV/Excel)
- [ ] Export employees
- [ ] Search and filter

#### Reports
- [ ] Generate custom reports
- [ ] Filter by date range
- [ ] Export to PDF
- [ ] Export to Excel/CSV
- [ ] Schedule automated reports
- [ ] Email reports

#### Settings
- [ ] Update organization profile
- [ ] Upload organization logo
- [ ] Configure preferences
- [ ] Notification settings
- [ ] Custom fields (if applicable)

---

### ✅ For Client's Users (Regular Tenant Users)

#### Authentication
- [ ] Login to their tenant
- [ ] Logout
- [ ] Change password
- [ ] Update profile

#### Dashboard
- [ ] View assigned data
- [ ] Personal statistics
- [ ] Recent activities
- [ ] Notifications

#### Data Access
- [ ] View data based on role
- [ ] Edit allowed records
- [ ] Create new records (if permitted)
- [ ] Download reports (if permitted)

#### Profile
- [ ] View own profile
- [ ] Update personal information
- [ ] Change password

---

## Implementation Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Phase 1: Foundation | 2 weeks | Working dev environment, database ready |
| Phase 2: Tenant Management | 1 week | Full tenant CRUD, data isolation working |
| Phase 3: Core Features | 2 weeks | Tenant portal functional, features ported |
| Phase 4: Polish & Launch | 1 week | Production-ready application |
| **Total** | **6 weeks** | **Complete multi-tenant system** |

---

## Key Success Metrics

### Technical Metrics
- ✅ 100% data isolation between tenants
- ✅ < 200ms average API response time
- ✅ 99.9% uptime
- ✅ All security tests passing
- ✅ Mobile responsive

### Business Metrics
- ✅ Can onboard new client in < 5 minutes
- ✅ Zero cross-tenant data leaks
- ✅ Easy to add new features for all clients
- ✅ Scalable to 100+ tenants

---

## Next Steps

1. **Review this plan** and identify any missing features
2. **Choose deployment platforms** (Vercel, Railway, etc.)
3. **Set up development environment** (Node.js, Git, IDE)
4. **Create Supabase account** and new project
5. **Start with Phase 1** - foundation setup

---

## Important Notes

### Security Reminders
- ⚠️ NEVER expose tenant_id in URLs or client-side code
- ⚠️ ALWAYS validate tenant_id on backend from JWT token
- ⚠️ NEVER trust client input - validate everything
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting on all endpoints
- ⚠️ Regular security audits

### Scalability Considerations
- Plan for 100+ tenants from day one
- Use database indexing on tenant_id columns
- Implement caching for frequently accessed data
- Consider CDN for static assets
- Monitor database performance

### Maintenance
- Keep all dependencies updated
- Regular database backups
- Monitor error logs
- Set up alerts for critical issues
- Document all custom configurations

---

## Contact & Support

For questions during implementation:
- Review this document thoroughly
- Check Supabase documentation
- Refer to framework-specific docs (React, Express, etc.)

---

**Document Version:** 1.0  
**Last Updated:** December 17, 2025  
**Status:** Ready for Implementation

---

## Appendix A: Environment Variables Template

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=2h

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Appendix B: Common Queries

### Get all employees for a tenant
```sql
SELECT * FROM employees 
WHERE tenant_id = $1 
ORDER BY created_at DESC;
```

### Get tenant with user count
```sql
SELECT 
  t.id,
  t.name,
  t.subdomain,
  t.status,
  COUNT(u.id) as user_count
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
GROUP BY t.id;
```

### Check if user belongs to tenant
```sql
SELECT EXISTS(
  SELECT 1 FROM users 
  WHERE id = $1 AND tenant_id = $2
);
```

---

## Appendix C: Complete Feature List from Current "My Mandatory Now" Application

### 📋 **ALL FEATURES TO BE INCLUDED IN NEW MULTI-TENANT APP**

This section documents **every single feature** from your current application that will be migrated to the new multi-tenant architecture.

---

### 📊 **1. Dashboard Features** (Per Tenant)

#### Statistics Cards (7-Column Layout)
- Total Issues Count
- Portfolios with Issues
- Sites with Issues
- Average Issue Hour
- Real-time auto-refresh (every 30 seconds)
- Last updated timestamp

#### Quick Actions Section
- Log New Issue (navigate to issue form)
- View All Issues (navigate to issues table)
- Hourly Coverage (navigate to coverage chart)
- Hover effects and tooltips

#### Visual Components
- Portfolio Status Heat Map (current day status)
- Portfolio Coverage Heat Map by Hour (0-23 hours)
- Issues Coverage Chart (bar/line chart)
- Admin Log Widget (recent 5 admin activities)
- Color-coded status indicators

---

### 📋 **2. Portfolio Management** (Per Tenant)

#### Portfolio CRUD Operations
- View all portfolios (name, subtitle, site range)
- Add new portfolio
  - Portfolio name (required, duplicate check)
  - Subtitle (optional, e.g., "Powertrack", "SolarEdge", "Locus")
  - Site range (optional, e.g., "Sites 1-50", "Sites 1-100")
- Edit portfolio
  - Update name
  - Update subtitle
  - Update site range
- Delete portfolio (with confirmation, cascades to issues)
- Display portfolio ID (UUID)

#### Portfolio Status Tracking ("All Sites Checked")
- Status: Yes / No / Pending
- Track which hour was checked
- Track date of last check
- Sites checked details (text field when "No" selected)
- Visual indicators:
  - Green = All sites checked (Yes)
  - Red = Issues found (No)
  - Gray = Not checked yet (Pending)
- Automatic status calculation based on issues

#### Portfolio Locking/Reservation System
- Lock portfolio when user starts logging issue
- Hour-based locking (user reserves portfolio for specific hour)
- Session-based lock management
- Lock expiration (time-based, auto-cleanup)
- Show lock status per portfolio
- Prevent concurrent editing by multiple users
- Visual lock indicators
- Admin can unlock any portfolio
- Lock release on:
  - Issue successfully logged
  - Session expires
  - Admin manual unlock
  - User cancels action
- Real-time lock updates
- Lock notification tooltips

---

### 🔍 **3. Issue Tracking System** (Per Tenant)

#### Issue Logging Form
- Select Portfolio (dropdown, searchable)
- Select Site (dropdown or text input)
- Issue Hour (auto-filled with current hour, editable 0-23)
- Issue Description (textarea, required)
- Issue Type/Category (optional)
- Severity Level (optional: Low/Medium/High/Critical)
- Monitored By (who found the issue, dropdown)
- Issues Missed By (who missed it, dropdown, multi-select)
- Attachments/Screenshots (optional, file upload)
- Auto-save drafts
- Validation rules:
  - Cannot log duplicate issue (same portfolio + same hour + same day)
  - Required fields validation
  - Hour must be 0-23
- Success confirmation message
- Automatic lock release after successful log

#### Issues Table View
- Columns:
  - Portfolio Name (sortable, filterable)
  - Site Name
  - Issue Hour (0-23)
  - Description (truncated with "..." and expand)
  - Status (Open/In Progress/Resolved/Closed)
  - Monitored By (color-coded per user)
  - Missed By (comma-separated list)
  - Created At (date + time)
  - Action Buttons (View/Edit/Delete)
- Sortable columns (ascending/descending)
- Search functionality:
  - Search by portfolio name
  - Search by site name
  - Search by description
  - Search by monitored person
  - Search by missed person
- Filters:
  - Date range picker (from date → to date)
  - Portfolio filter (dropdown)
  - Status filter (multi-select)
  - Hour range filter (e.g., 0-6, 7-12, etc.)
  - Monitored by filter
  - Missed by filter
- Pagination (10/25/50/100 per page)
- Bulk actions (select multiple, bulk delete)
- Export to Excel/CSV with all filters applied
- Real-time updates (new issues appear automatically)

#### Issue Details View (Modal/Page)
- Full issue information display
- Issue timeline/history
  - Created timestamp
  - Last modified timestamp
  - Status changes log
  - User who made changes
- Edit capability (inline or modal)
- Delete capability (with confirmation)
- Add comments/notes to issue
- Resolve/Close issue button
- Reopen closed issue
- Print issue details
- Share issue link

#### Edit Issue Modal
- Update all fields:
  - Change portfolio
  - Change site
  - Update issue hour
  - Edit description
  - Change status
  - Update monitored by
  - Update missed by
  - Add/remove attachments
- Save changes with validation
- Cancel changes
- Show who last edited and when
- Optimistic UI updates

---

### ⏰ **4. Hourly Coverage & Analytics** (Per Tenant)

#### Hourly Coverage Chart
- Visual bar/line chart showing coverage by hour (0-23)
- Y-axis: Number of portfolios with issues
- X-axis: Hour of day (0-23)
- Color-coded bars:
  - Green = Few issues
  - Yellow = Moderate issues
  - Red = Many issues
- Interactive tooltips on hover
  - Show exact count
  - Show list of affected portfolios
- Real-time updates (auto-refresh)
- Zoom/pan functionality
- Export chart as image (PNG/SVG)

#### Performance Analytics Dashboard
- Issues logged today/this week/this month
- Average response time (time to log after issue occurs)
- Most problematic portfolios (top 10)
- Most active users (who logged most issues)
- Peak issue hours (heatmap)
- Resolution rate (resolved vs total)
- Average time to resolve
- Issue trends (line chart over time)
- Custom date range selection
- Comparison view (this week vs last week)
- Export analytics as PDF report

#### Issues by User Report
- View issues grouped by monitored person
- Count of issues found by each user
- Count of issues missed by each user
- Performance leaderboard:
  - Top issue finders
  - Users needing attention (missed many)
- User activity timeline
- Filter by date range
- Export as Excel/CSV
- Visual charts (pie chart, bar chart)

#### Portfolio Monitoring Matrix
- Grid view: Portfolios (rows) × Hours (columns 0-23)
- Cell indicators:
  - ✅ Green = All sites checked, no issues
  - ❌ Red = Issue logged
  - ⬜ Gray = Not checked yet
- Click cell to view issue details
- Hover tooltip showing:
  - Portfolio name
  - Hour
  - Status
  - Issue description (if any)
  - Monitored by (if any)
- Filter by portfolio (show specific portfolios)
- Filter by date (view historical data)
- Export matrix as Excel (with color coding)
- Print matrix view
- Full-screen mode

#### Coverage Heat Maps

**Portfolio Status Heat Map:**
- Shows all portfolios at a glance
- Current day status for each portfolio
- Color indicators:
  - Green = All sites checked
  - Red = Has issues
  - Gray = Not checked
- Click to drill down to portfolio details
- Hover for quick info tooltip
- Auto-refresh every 30 seconds

**Portfolio Coverage Heat Map (By Hour):**
- Heat map showing coverage intensity
- Darker colors = more portfolios covered
- Hour-by-hour breakdown (0-23)
- Interactive hover tooltips
- Shows total portfolios vs portfolios with issues
- Visual density indicators

---

### 👥 **5. User Management** (Per Tenant)

#### Login Users (Authentication Accounts)

**Create Login User:**
- Username (unique, required)
- Password (min 6 chars, hashed with bcrypt in production)
- Full Name (optional, defaults to username)
- Role (User or Admin)
- Is Active (checkbox, default true)
- Auto-add to monitored personnel list
- Display credentials after creation (for secure sharing)
- Success notification with credentials

**View All Login Users:**
- Table with columns:
  - Username
  - Full Name
  - Role (User/Admin badge)
  - Status (Active/Inactive badge)
  - Last Login (timestamp or "Never")
  - Credentials (copyable textarea)
  - Action buttons (Edit/Activate-Deactivate/Delete)
- Sort by username, role, or last login
- Search/filter users
- Show total count

**Edit Login User:**
- Update username (with duplicate check)
- Update full name
- Change role (User ↔ Admin)
- Reset password (optional, min 6 chars)
- Toggle active/inactive status
- Save changes with validation
- Cancel editing

**Delete Login User:**
- Confirmation dialog (prevent accidental deletion)
- Cannot delete if it's the only admin
- Soft delete option (mark inactive instead of hard delete)

**Additional Features:**
- Color-coded user indicators (each user gets unique color)
- Display last login timestamp
- Show total active sessions per user
- Password strength indicator (when setting password)
- Username validation (no special chars, lowercase)

#### Monitored Personnel (For Dropdowns)

**Purpose:** Names that appear in "Monitored By" and "Issues Missed By" dropdowns

**Add Monitored Person:**
- Name (text input, required)
- Role (default: "monitor")
- Duplicate check (case-insensitive)
- Auto-sync to localStorage (fallback storage)
- Success notification

**View All Monitored Personnel:**
- Grid view (2 columns on desktop)
- Each person shown with:
  - Name
  - Role (if any)
  - Delete button
- Sort alphabetically
- Search/filter names
- Show total count
- Sync status indicator (Supabase or localStorage)

**Delete Monitored Person:**
- Confirmation dialog
- Check if person is referenced in any issues
- Warn if person is actively being used
- Remove from localStorage sync

**Auto-create Monitored Personnel:**
- When a login user is created, automatically add to monitored personnel
- When an issue is logged with a new name, prompt to add to list
- Ensure sync between login users and monitored personnel

**Data Sync:**
- Primary storage: Supabase (`monitored_personnel` table)
- Fallback storage: localStorage (if Supabase fails)
- Auto-sync on page load
- Default personnel list (hardcoded fallback):
  - Anjana, Anita P, Arun V, Bharat Gu, Deepa L
  - jenny, Kumar S, Lakshmi B, Manoj D, Rajesh K
  - Ravi T, Vikram N

---

### 🔐 **6. Authentication System** (Multi-Tenant Aware)

#### User Login Flow
- Login screen with username/password fields
- "Switch to Admin Login" button
- Detect tenant from user (if multi-tenant)
- Validate credentials against Supabase
- Create session (8 hours for regular users)
- Store in sessionStorage:
  - `userAuthenticated` = true
  - `userId` = UUID
  - `username` = username
  - `fullName` = full name
  - `userRole` = "user"
  - `userAuthExpiresAt` = timestamp (8 hours)
- Assign unique color to user (for visual indicators)
- Redirect to main application (SinglePageComplete)
- Success notification

#### Admin Login Flow
- Separate admin login screen
- Username/password validation
- Admin role verification (must have role='admin')
- Create session (2 hours for admins)
- Store in sessionStorage:
  - `adminAuthenticated` = true
  - `adminUsername` = username
  - `userRole` = "admin"
  - `adminAuthExpiresAt` = timestamp (2 hours)
- Access to admin panel enabled
- Redirect to main application with admin privileges
- Success notification

#### Session Management
- Session stored in sessionStorage (cleared on browser close)
- Auto-check session status every 5 minutes
- Grace period for session extension (if lost temporarily)
- Prevent false logouts due to:
  - Browser tab refresh
  - Network interruptions
  - sessionStorage temporarily unavailable
- Session expiry warnings (5 minutes before expiry)
- Auto-logout when session expires
- Logout button (clears all session data)
- Multi-tab session sync (same session across tabs)

#### Session Features
- **Auto-Logout:** After 8 hours (users) or 2 hours (admins)
- **Manual Logout:** Clears all auth data from sessionStorage
- **Session Persistence:** Survives page refreshes
- **Tab Sync:** Same session across multiple tabs
- **Expiry Extension:** User activity extends session
- **Graceful Expiry:** Warns before auto-logout

#### Authentication Security
- Passwords hashed with bcrypt (production)
- Session tokens (consider JWT for multi-tenant)
- HTTPS only in production
- Rate limiting on login attempts (prevent brute force)
- Account lockout after 5 failed attempts
- CSRF protection
- Secure cookie flags (HttpOnly, Secure, SameSite)

---

### 🔧 **7. Admin Panel** (Per Tenant Admin)

The Admin Panel is a comprehensive modal/page with multiple tabs for managing the tenant's data.

#### **Tab 1: Portfolios Management**

**Add New Portfolio Section:**
- Portfolio Name (text input, required)
- Subtitle (text input, optional, e.g., "Powertrack", "SolarEdge")
- Site Range (text input, optional, e.g., "Sites 1-50")
- Add Portfolio button
- Validation:
  - Name cannot be empty
  - Duplicate name check (case-insensitive)
  - Success/error notifications

**Existing Portfolios List:**
- Card/list view for each portfolio
- Display:
  - Portfolio name (bold)
  - Subtitle (if exists)
  - Site range (if exists)
  - Portfolio ID (UUID, small text)
- Action buttons per portfolio:
  - Edit (opens edit modal)
  - Delete (confirmation dialog)
- Edit modal allows updating name, subtitle, site range
- Delete confirmation: warns about cascading deletion of issues

---

#### **Tab 2: Login Users Management**

**Create New Login User Section:**
- Inputs:
  - Username (required, unique check)
  - Password (required, min 6 chars)
  - Full Name (optional)
  - Role (dropdown: User or Admin)
- Create Login User button
- Validation:
  - Username not empty, no duplicates
  - Password min 6 characters
  - Success notification shows credentials (for secure sharing)
- Auto-adds user to monitored personnel list

**Existing Login Users List:**
- Table/card view for each user
- Display:
  - Username
  - Full Name (or "No name provided")
  - Role badge (User/Admin, color-coded)
  - Status badge (Active/Inactive, color-coded)
  - Last Login timestamp
  - Credentials display (copyable textarea with username and password)
- Action buttons per user:
  - Edit (opens edit modal)
  - Activate/Deactivate (toggle status)
  - Delete (confirmation, cannot delete last admin)
- Edit modal allows:
  - Update username (duplicate check)
  - Update full name
  - Change role
  - Reset password (optional, leave blank to keep)
  - Toggle active status
- Success/error notifications for all actions

---

#### **Tab 3: Monitored Personnel Management**

**Add New User Section:**
- Name input (text, required)
- Add User button
- Validation:
  - Name not empty
  - Duplicate check (case-insensitive)
  - Success notification
- Auto-sync to localStorage (fallback)

**Existing Users List:**
- Grid view (2 columns on desktop, 1 on mobile)
- Each user card shows:
  - Name (bold)
  - Role (if any, small text)
  - Delete button
- Alphabetically sorted
- Delete confirmation dialog
- Success/error notifications
- Shows total count of users

**Data Sync Features:**
- Primary: Supabase `monitored_personnel` table
- Fallback: localStorage `monitoredPersonnel` array
- Auto-create user when:
  - Login user created (use their full name)
  - Issue logged with new "monitored by" name
- Ensure no duplicates across sync sources

---

#### **Tab 4: Active Locks Management**

**Active Portfolio Locks Section:**
- Checkbox: "Show expired locks" (toggle to view all locks or only active)
- If no locks: Empty state message with icon
- If locks exist: Table view with columns:
  - Portfolio Name
  - Locked By (username/full name)
  - Hour (which hour is locked)
  - Locked At (timestamp)
  - Expires At (timestamp, red if expired)
  - Action: Unlock button (admin override)

**Unlock Portfolio Feature:**
- Confirmation dialog:
  - Shows portfolio name
  - Shows who locked it
  - Warns that unlock allows others to lock it
- On unlock:
  - Delete reservation from `hour_reservations` table
  - Log admin action to `admin_logs`
  - Refresh locks list immediately
  - Dispatch custom event to notify other components
  - Success notification
- Real-time lock updates (auto-refresh)
- Show expired vs active locks separately

**Lock Information Displayed:**
- Who locked the portfolio (monitored by name)
- Which hour was locked (0-23)
- When it was locked (date + time)
- When it expires (date + time, highlight if expired)
- Lock status (active or expired)

---

#### **Tab 5: Admin Logs**

**Add Admin Log Section:**
- Admin Name (text input, pre-filled with logged-in admin)
- Log Note (textarea, required)
- Add Log button
- Success notification

**Activity Logs List:**
- Card/list view for each log entry
- Display:
  - Action Type badge (color-coded):
    - `portfolio_added` → Green
    - `portfolio_updated` → Blue
    - `portfolio_deleted` → Red
    - `user_added` → Green
    - `user_deleted` → Red
    - `login_user_added` → Green
    - `login_user_updated` → Blue
    - `login_user_deleted` → Red
    - `user_status_changed` → Yellow
    - `portfolio_unlocked` → Purple
    - `custom_note` → Gray
    - `system_alert` → Yellow
  - Admin Name (who performed action)
  - Action Description (full text)
  - Timestamp (formatted: "Dec 17, 2025, 10:30 AM")
- Sorted by most recent first
- Limit to last 50 logs
- Auto-refresh on any admin action
- If no logs: "No logs found. Run ADMIN_LOG_SETUP.sql first."

**Automatic Logging:**
- Every admin action is logged automatically:
  - Portfolio added/updated/deleted
  - User added/deleted
  - Login user added/updated/deleted/status changed
  - Portfolio unlocked by admin
  - Custom admin notes
- Logs stored in `admin_logs` table with:
  - `admin_name`
  - `action_type`
  - `action_description`
  - `related_portfolio_id` (if applicable)
  - `created_at` timestamp

---

#### **Tab 6: Coverage Matrix**

- Reuses `PortfolioMonitoringMatrix` component
- Shows grid: Portfolios × Hours (0-23)
- Visual indicators per cell:
  - ✅ Green = Issue logged for that hour
  - ⬜ Gray = No issue for that hour
- Click cell to view issue details
- Hover tooltip with portfolio + hour info
- Filter by portfolio name
- Filter by date range
- Export matrix to Excel
- Real-time updates (auto-refresh)

---

#### **Admin Panel General Features**

- **Header:**
  - Title: "Admin Panel"
  - Logged in as: [Admin Name]
  - Logout button (admin logout)
  - Close button (X)
- **Tab Navigation:**
  - Portfolios (count)
  - Login Users (count)
  - Monitored Personnel (count)
  - Active Locks (count)
  - Admin Logs (count)
  - Coverage Matrix
- **Loading Spinner:** Shows when fetching data
- **Error Handling:** User-friendly error messages
- **Success Notifications:** Confirms successful actions
- **Confirmation Dialogs:** Prevents accidental deletions
- **Real-time Refresh:** Auto-refreshes data every 30 seconds
- **Responsive Design:** Works on mobile, tablet, desktop
- **Modal Overlay:** Dark background when open
- **Keyboard Shortcuts:** ESC to close, Enter to submit forms
- **Accessibility:** ARIA labels, keyboard navigation

---

### 🚀 **8. Additional Features & UI Components**

#### Ticket Logging Table Component
- Comprehensive issue table view
- Features:
  - Sortable columns (click header to sort)
  - Filterable rows (search box)
  - Inline editing (click to edit)
  - Bulk selection (checkboxes)
  - Bulk actions (bulk delete, bulk export)
  - Column visibility toggle (show/hide columns)
  - Column reordering (drag and drop)
  - Row highlighting on hover
  - Alternating row colors for readability
  - Sticky header (stays visible on scroll)
  - Virtualized scrolling (for large datasets)
  - Export to Excel/CSV (with filters applied)
  - Print view (optimized for printing)

#### Portfolio Hour Session Drawer
- Side drawer component (slides in from right or left)
- Shows current session information:
  - Which portfolio user is working on
  - Which hour is being logged
  - Session timer/countdown (until lock expires)
  - Quick actions (Cancel, Submit Issue, Switch Portfolio)
- Visual indicator:
  - Green = Active session
  - Yellow = Session expiring soon
  - Red = Session expired
- Close button to dismiss
- Auto-hide after issue submitted
- Persistent across page navigation (within session)

#### Action Modal
- Generic modal for quick actions
- Features:
  - Title (dynamic based on action)
  - Content area (dynamic)
  - Action buttons (Cancel, Confirm)
  - Keyboard shortcuts (ESC to cancel, Enter to confirm)
  - Dark overlay background
  - Smooth animations (fade in/out)
  - Responsive (mobile-friendly)
  - Z-index management (stacks properly with other modals)
- Use cases:
  - Quick issue logging
  - Portfolio selection
  - Status updates
  - Confirmation prompts
  - Info displays

#### Visual Indicators & UI Elements

**Color-Coded Status:**
- ✅ Green:
  - All sites checked (no issues)
  - Active/enabled status
  - Success notifications
  - Positive metrics
- ❌ Red:
  - Issues found
  - Errors/failures
  - Inactive/disabled status
  - Critical alerts
- ⬜ Gray:
  - Not checked yet / pending
  - Neutral status
  - Disabled elements
- 🟡 Yellow:
  - Warnings
  - Moderate issues
  - Attention needed
- 🔵 Blue:
  - Information
  - Updates
  - Links/buttons
- 🟣 Purple:
  - Admin actions
  - Special features

**Unique User Colors:**
- Each user assigned a unique color (auto-generated)
- Used in:
  - "Monitored By" badges
  - User activity indicators
  - Charts and graphs (data points colored by user)
- Color generation:
  - Based on username hash (consistent across sessions)
  - High contrast for readability
  - Accessible color palette (WCAG AA compliant)

**Hover Tooltips:**
- Show additional information on hover
- Features:
  - Delay before showing (500ms)
  - Smooth fade in/out
  - Position: top/bottom/left/right (auto-adjust based on screen space)
  - Arrow pointing to target element
  - Max width to prevent overflow
  - Dark background, white text (or light background, dark text based on theme)
  - Z-index above other elements
- Used for:
  - Portfolio cards (show full name if truncated)
  - Lock indicators (show who locked and when)
  - Issue descriptions (show full text if truncated)
  - User names (show full name and role)
  - Chart data points (show exact values)
  - Button hints (show what button does)

**Loading Spinners:**
- Spinner types:
  - Full-page spinner (overlay)
  - Inline spinner (button)
  - Section spinner (specific area)
- Animated CSS spinner (rotating circle)
- Accessible (includes "Loading..." screen reader text)
- Prevents user interaction while loading

**Success/Error Notifications:**
- Toast notifications (bottom-right corner)
- Types:
  - Success (green checkmark icon)
  - Error (red X icon)
  - Warning (yellow exclamation icon)
  - Info (blue i icon)
- Features:
  - Auto-dismiss after 5 seconds (or manual close)
  - Stack multiple notifications
  - Click to dismiss
  - Progress bar (shows time until auto-dismiss)
  - Smooth slide in/out animations
  - Accessible (screen reader announcements)

**Badge Counters:**
- Small numeric badges on tabs/buttons
- Show count of items (e.g., "Portfolios (12)")
- Color-coded based on urgency:
  - Gray = neutral count
  - Red = attention needed (e.g., "Issues (5)" if high priority)
  - Green = positive count
- Auto-update when data changes

---

#### Real-Time Features

**Auto-Refresh Dashboard:**
- Dashboard auto-refreshes every 30 seconds
- Updates:
  - Issue counts
  - Portfolio statuses
  - Heat maps
  - Charts
  - Recent logs
- Visual indicator: "Last updated: 10:45:32 AM (Auto-refreshes every 30 seconds)"
- Pause auto-refresh button (user can toggle)
- Manual refresh button (force refresh immediately)

**Live Lock Status Updates:**
- Portfolio lock status updates in real-time
- Uses:
  - Polling (check every 10 seconds)
  - Or Supabase real-time subscriptions (if enabled)
- Visual feedback:
  - Lock icon appears when portfolio locked
  - Shows who locked it
  - Updates immediately when unlocked

**Portfolio Unlock Events:**
- Custom browser event: `portfolioUnlocked`
- Dispatched when admin unlocks a portfolio
- Listened by:
  - Portfolio cards (re-check lock status)
  - Issue logging form (re-enable portfolio selection)
  - Coverage matrix (refresh cells)
- Allows immediate UI updates without full page refresh

**Hour Change Detection:**
- Detects when system hour changes (e.g., 10:59 → 11:00)
- On hour change:
  - Refresh all data (issues, reservations, statuses)
  - Update "current hour" indicator
  - Unlock portfolios locked for previous hour (if expired)
  - Notify user: "Hour changed to 11. Data refreshed."

**Session Activity Tracking:**
- Tracks user activity (mouse moves, clicks, typing)
- If inactive for 30 minutes: Show warning
- If inactive for 45 minutes: Auto-logout (optional)
- Reset activity timer on any user interaction
- Heartbeat signal to server (keep session alive)

---

#### Search & Filters

**Portfolio Search Bar:**
- Search input above portfolio cards
- Features:
  - Real-time search (as you type)
  - Case-insensitive
  - Searches in:
    - Portfolio name
    - Subtitle
    - Site range
  - Highlight matching text
  - Show count: "Showing 5 of 20 portfolios"
  - Clear button (X icon)
- Debounced (waits 300ms after typing stops)
- Keyboard navigation (arrow keys to navigate results)

**Date Range Picker:**
- Calendar widget for selecting date ranges
- Features:
  - From Date → To Date
  - Quick presets:
    - Today
    - Yesterday
    - Last 7 days
    - Last 30 days
    - This month
    - Last month
    - Custom range
  - Date validation (from date cannot be after to date)
  - Clear button (reset to all time)
  - Apply button (trigger filter)
- Mobile-friendly (responsive calendar)

**User Filter:**
- Dropdown to filter by monitored person
- Features:
  - Multi-select (select multiple users)
  - Checkboxes for each user
  - "Select All" / "Deselect All" options
  - Search within dropdown (filter user list)
  - Show count: "3 users selected"
  - Apply button

**Status Filter:**
- Dropdown to filter by issue status
- Options:
  - All statuses
  - Open
  - In Progress
  - Resolved
  - Closed
- Multi-select checkboxes
- Apply button

**Hour Range Filter:**
- Slider or dropdown for hour range
- Examples:
  - 0-6 (Night shift)
  - 7-12 (Morning)
  - 13-18 (Afternoon)
  - 19-23 (Evening)
  - Custom range (select start hour and end hour)
- Visual range indicator
- Apply button

**Clear Filters Button:**
- Resets all filters to default
- Shows "(Filters active)" indicator when filters applied
- Confirmation: "Clear all filters?"
- Restores original view

---

#### Export Features

**Export Issues to Excel:**
- Export button on issues table
- Features:
  - Exports all filtered/searched issues (respects current filters)
  - Columns included:
    - Portfolio Name
    - Site Name
    - Issue Hour
    - Description
    - Status
    - Monitored By
    - Missed By
    - Created At
    - Last Modified
  - Excel formatting:
    - Bold headers
    - Auto-sized columns
    - Frozen header row
    - Filter dropdowns on each column
    - Alternating row colors
  - Filename: "Issues_Export_[Date].xlsx"
  - Success notification: "Exported 45 issues"

**Export Issues to CSV:**
- CSV export option (simpler format)
- Comma-separated values
- UTF-8 encoding (supports special characters)
- Filename: "Issues_Export_[Date].csv"
- Opens in Excel, Google Sheets, etc.

**Export Coverage Matrix:**
- Export button on coverage matrix
- Features:
  - Exports portfolio × hour grid
  - Excel with color coding:
    - Green cells = Issue logged
    - Gray cells = No issue
  - Includes legend
  - Filename: "Coverage_Matrix_[Date].xlsx"

**Export Analytics Reports:**
- Export button on performance analytics page
- Features:
  - Generates PDF report
  - Includes:
    - Summary statistics
    - Charts (as images)
    - Tables (top portfolios, top users)
    - Date range covered
    - Generated by (user name)
    - Generated at (timestamp)
  - Professional formatting
  - Company logo (if configured)
  - Filename: "Performance_Report_[Date].pdf"

**Custom Export Date Ranges:**
- Before exporting, prompt user:
  - "Export current view?" (respects filters)
  - "Export custom date range?" (select dates)
  - "Export all data?" (no filters)
- Progress indicator for large exports
- Download link when ready

---

#### Mobile Responsiveness

**Responsive Grid Layouts:**
- Desktop: 7-column stats cards
- Tablet: 3-4 column stats cards
- Mobile: 1-2 column stats cards (stacked)
- Flexbox or CSS Grid for adaptive layouts
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

**Touch-Friendly Buttons:**
- Minimum touch target size: 44x44 pixels (iOS guideline)
- Adequate spacing between buttons (min 8px)
- Increase button padding on mobile
- Hover states replaced with active states (tap feedback)

**Mobile-Optimized Forms:**
- Larger input fields (easier to tap)
- Input type="number" for hour fields (shows numeric keyboard on mobile)
- Autocomplete="off" where needed
- Dropdowns converted to native mobile pickers
- Date pickers use native mobile calendars

**Responsive Charts/Heat Maps:**
- Charts scale to container width
- Heat maps:
  - Desktop: Show all 24 hours
  - Mobile: Scroll horizontally or show current 6-hour window
- Touch gestures:
  - Pinch to zoom
  - Swipe to navigate
  - Tap for details

**Mobile Navigation Menu:**
- Hamburger menu (☰) on mobile
- Slide-out navigation drawer
- Close button or swipe to close
- Large, touch-friendly menu items
- Collapsible sub-menus (accordions)

---

#### Accessibility (A11y)

**Keyboard Navigation:**
- All interactive elements accessible via Tab key
- Tab order follows logical flow (top to bottom, left to right)
- Shift+Tab to navigate backwards
- Enter/Space to activate buttons
- Arrow keys to navigate dropdowns/lists
- Escape key to close modals/dropdowns
- Focus visible indicator (outline or highlight)

**Screen Reader Support:**
- ARIA labels on all interactive elements
- ARIA live regions for dynamic content updates (e.g., "Issue logged successfully")
- ARIA roles (button, navigation, main, aside, etc.)
- Alt text on images
- Skip to main content link (for screen reader users)
- Form labels associated with inputs (for and id attributes)
- Error messages read aloud by screen readers

**High Contrast Mode:**
- Supports Windows High Contrast Mode
- Ensures sufficient color contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
- Test with tools like axe DevTools or WAVE

**ARIA Labels:**
- Example: `<button aria-label="Delete portfolio">`
- Provides context for icon-only buttons
- Describes dynamic content (e.g., loading states)

**Focus Indicators:**
- Visible outline on focused elements (not removed with CSS)
- Custom focus styles (colored border, shadow, etc.)
- Ensure focus is not hidden behind modals

---

### 🏢 **9. Super Admin Features** (Your Management Portal)

The Super Admin portal is a separate interface for YOU (the application owner) to manage all tenants.

#### Tenant Management Dashboard

**View All Tenants:**
- Table/card view listing all clients
- Columns:
  - Tenant Name
  - Subdomain (e.g., client1.yourapp.com)
  - Contact Email
  - Status (Active/Inactive/Suspended)
  - Subscription Plan (Basic/Pro/Enterprise)
  - Created Date
  - Last Active (last login by any user in tenant)
  - Total Users
  - Total Issues Logged
  - Action Buttons (View/Edit/Delete/Login As)
- Sort by name, status, created date, last active
- Search tenants by name or subdomain
- Filter by status, subscription plan
- Pagination

**Add New Tenant:**
- Form fields:
  - Company Name (required, unique)
  - Contact Email (required, valid email)
  - Subdomain (auto-generated from company name, editable)
    - Example: "ABC Company" → subdomain: "abc"
    - Validation: lowercase, alphanumeric, no spaces
  - Logo Upload (optional, image file)
  - Subscription Plan (dropdown: Basic/Pro/Enterprise)
  - Status (dropdown: Active/Inactive)
  - Custom Settings (JSON editor or form for tenant-specific configs)
- Validation:
  - All required fields filled
  - Subdomain unique (not already taken)
  - Email format valid
- On submit:
  - Create tenant record in `tenants` table
  - Generate initial admin user for tenant (prompt for username/password)
  - Send welcome email to contact (optional)
  - Success notification: "Tenant [Name] created! Subdomain: [subdomain].yourapp.com"

**Edit Tenant Details:**
- Update all fields (except tenant_id)
- Change subdomain (with warning: "Existing links will break")
- Upload new logo
- Change subscription plan
- Activate/Suspend tenant
- Update custom settings
- Save changes with validation

**Delete Tenant:**
- Confirmation dialog with warnings:
  - "This will permanently delete all data for [Tenant Name]"
  - "Including: [X] users, [Y] portfolios, [Z] issues"
  - "This action cannot be undone!"
- Soft delete option (mark as deleted, but keep data)
- Hard delete option (permanently remove from database)
- Require typing tenant name to confirm (extra safety)

**View Tenant Activity Logs:**
- Shows all activities for a specific tenant:
  - User logins
  - Issues logged
  - Admin actions
  - Data exports
  - System errors
- Filter by activity type, date range, user
- Export logs to CSV

**Login As Tenant (Impersonation):**
- For support/debugging purposes
- Click "Login As" button for a tenant
- Temporarily log in as that tenant's admin
- Banner at top: "You are viewing as [Tenant Name]. Exit Support Mode"
- All actions logged for audit trail
- Exit button to return to super admin view

---

#### Global Analytics Dashboard

**Summary Statistics:**
- Total Tenants (active vs inactive)
- Total Users (across all tenants)
- Total Issues Logged (system-wide)
- Average Issues per Tenant
- Most Active Tenant (by issue count or user activity)
- System Uptime (99.9% SLA)
- Average API Response Time (< 200ms)

**Tenant Activity Over Time:**
- Line chart showing:
  - New tenants added per month
  - Active tenants over time
  - Total issues logged per month (system-wide)
- Date range selector (last 7 days, 30 days, 6 months, 1 year)

**Most Active Tenants:**
- Table showing top 10 tenants by:
  - Most issues logged
  - Most users
  - Most logins
  - Highest activity score
- Click tenant to drill down to their specific analytics

**System Health Metrics:**
- API uptime percentage
- Average API response time
- Database performance (query times)
- Error rate (errors per 1000 requests)
- Storage used (GB)
- Active sessions count
- Real-time charts (updates every minute)

**Revenue/Subscription Overview:**
- Total monthly recurring revenue (MRR)
- Breakdown by subscription plan (Basic, Pro, Enterprise)
- Revenue growth chart
- Churn rate (tenants who cancelled)
- New tenants this month
- Renewals this month

**Growth Charts:**
- User growth over time (line chart)
- Tenant growth over time (line chart)
- Issue volume over time (bar chart)
- Feature usage (which features most used across tenants)

---

#### System Administration

**View All Users Across All Tenants:**
- Table listing every user in the system
- Columns:
  - Username
  - Full Name
  - Tenant Name (which tenant they belong to)
  - Role (User/Admin)
  - Status (Active/Inactive)
  - Last Login
  - Action Buttons (View/Edit/Disable/Delete)
- Search users by name, username, tenant
- Filter by role, status, tenant
- Pagination

**Global Search:**
- Universal search bar (top of super admin interface)
- Searches across:
  - Tenants (by name, subdomain, email)
  - Users (by username, full name)
  - Issues (by description, portfolio name) - if needed for support
- Instant results dropdown (like Spotlight on Mac)
- Shows result type (Tenant, User, Issue)
- Click result to navigate to detail view

**System-Wide Admin Logs:**
- Logs all super admin actions:
  - Tenant created/updated/deleted
  - User modified by super admin
  - System configuration changes
  - Data exports
  - Login impersonations (who logged in as whom)
- Filter by admin user, action type, date range
- Export logs to CSV
- Audit trail for compliance

**Error Logs Dashboard:**
- Lists all application errors
- Columns:
  - Error Message
  - Stack Trace
  - Tenant (which tenant experienced error)
  - User (which user experienced error)
  - Timestamp
  - Status (New/Acknowledged/Resolved)
- Filter by tenant, error type, date range
- Click to view full error details
- Mark as acknowledged/resolved
- Integrate with error tracking services (Sentry, Rollbar, etc.)

**Performance Monitoring:**
- Real-time dashboard showing:
  - Current active users
  - Requests per minute
  - Average response time per endpoint
  - Slow queries (queries taking > 1 second)
  - Database connection pool status
- Historical performance charts
- Set up alerts (email/SMS if response time > 500ms)

**Database Backup/Restore:**
- Schedule automatic backups (daily, weekly)
- On-demand backup button (create backup now)
- List all backups with date/time and size
- Restore from backup (with confirmation)
- Download backup file (SQL dump or compressed)

**System Configuration:**
- Global settings page:
  - Site Title
  - Support Email
  - SMTP Configuration (for sending emails)
  - Default Subscription Plan for new tenants
  - Session timeout durations (user: 8h, admin: 2h)
  - Auto-logout after inactivity (Yes/No)
  - Enable/Disable new tenant signups (if self-service)
  - Maintenance mode toggle (temporarily disable app)
  - Feature flags (enable/disable features globally or per tenant)
  - API rate limits (requests per minute per tenant)
- Save configuration button
- Confirm changes

---

#### Billing & Subscriptions

**View Tenant Subscriptions:**
- Table showing all tenants with subscription details:
  - Tenant Name
  - Subscription Plan (Basic/Pro/Enterprise)
  - Monthly Cost (e.g., $50, $200, $500)
  - Billing Cycle (Monthly/Yearly)
  - Next Billing Date
  - Payment Status (Paid/Pending/Failed)
  - Action Buttons (View Invoice/Edit Plan/Cancel)
- Total MRR displayed at top
- Filter by plan, payment status

**Billing History:**
- List all invoices across all tenants
- Columns:
  - Invoice Number
  - Tenant Name
  - Amount
  - Issue Date
  - Due Date
  - Status (Paid/Unpaid/Overdue)
  - Action Buttons (View/Download PDF/Send Reminder)
- Filter by tenant, date range, status

**Payment Status:**
- Dashboard showing:
  - Paid this month: $10,000
  - Pending: $500
  - Overdue: $200
  - Failed payments: 2 tenants
- Automated payment reminders (email sent 3 days before due date, then on due date, then 3 days after)

**Generate Invoices:**
- Automatically generate monthly invoices for all tenants
- Invoice includes:
  - Tenant details
  - Subscription plan
  - Amount due
  - Payment instructions
  - Itemized breakdown (if multiple services)
  - Tax (if applicable)
- Send invoice via email (PDF attached)
- Downloadable from super admin interface

**Subscription Plan Management:**
- Define subscription plans:
  - Plan Name (Basic, Pro, Enterprise)
  - Price (monthly or yearly)
  - Features included (e.g., Max users, Max issues, Storage limit)
  - Trial period (e.g., 14 days free)
- Edit/Delete plans
- Assign plan to tenant
- Upgrade/Downgrade tenant's plan
- Prorate charges if mid-cycle change

**Usage Limits Per Tenant:**
- Based on subscription plan, enforce limits:
  - Max Users (e.g., Basic: 5, Pro: 20, Enterprise: Unlimited)
  - Max Issues per month (e.g., Basic: 100, Pro: 500, Enterprise: Unlimited)
  - Storage limit (e.g., Basic: 1 GB, Pro: 10 GB, Enterprise: 100 GB)
- Show usage vs limits on tenant dashboard
- Warning when tenant approaches limit (90% used)
- Prompt to upgrade if limit exceeded

---

#### Support & Maintenance

**View Tenant Support Tickets:**
- If integrated with support system (e.g., Zendesk, Freshdesk)
- List all support tickets:
  - Ticket ID
  - Tenant Name
  - Subject
  - Status (Open/In Progress/Resolved/Closed)
  - Priority (Low/Medium/High/Urgent)
  - Created Date
  - Action Buttons (View/Reply/Close)
- Filter by tenant, status, priority
- Click to view full ticket and conversation thread

**Direct Tenant Access (Impersonation):**
- "Login As" feature (mentioned earlier)
- Allows super admin to log in as any tenant's admin
- Used for:
  - Troubleshooting issues reported by tenant
  - Providing hands-on support
  - Verifying features work correctly for specific tenant
- All actions logged with "(Support Mode)" label
- Exit button prominently displayed

**System Announcements:**
- Create announcements visible to all tenants or specific tenants
- Types:
  - Maintenance notification (scheduled downtime)
  - New feature announcement
  - Security update notice
  - Important policy changes
- Display methods:
  - Banner at top of tenant's dashboard
  - Email notification
  - In-app notification bell icon
- Schedule announcements (show from date X to date Y)
- Mark as dismissible or persistent

**Feature Flags:**
- Enable/disable features for specific tenants or globally
- Examples:
  - Enable "Beta Feature X" for Tenant A
  - Disable "Export to PDF" for Basic plan tenants
  - Enable "Dark Mode" for all tenants
- Feature flag interface:
  - List all features
  - Toggle: All Tenants / Specific Tenants / None
  - If specific, select tenants from dropdown
  - Save changes
- Hot-toggle (no deployment needed, changes take effect immediately)
- Use for:
  - A/B testing
  - Gradual rollouts
  - Plan-based feature access

**Maintenance Mode Toggle:**
- Enable maintenance mode (temporarily disable app)
- When enabled:
  - All tenants see "System is under maintenance. We'll be back soon!" message
  - Super admin can still access (to verify updates)
  - Optional: Display estimated downtime (e.g., "Back at 3:00 PM")
- Quick toggle (one-click enable/disable)
- Schedule maintenance (enable at specific time, auto-disable after X hours)

---

### 🔄 **10. Data Migration Features** (For Existing Data)

When migrating from current single-tenant app to new multi-tenant app, need tools to import existing data.

#### Import Tools

**Import Portfolios from Excel/CSV:**
- Upload Excel/CSV file
- Required columns: Name, Subtitle (optional), Site Range (optional)
- Validation:
  - Check for duplicate names
  - Ensure required columns present
  - Validate data types
- Preview import (show first 10 rows)
- Confirm import (insert into `portfolios` table with correct `tenant_id`)
- Success message: "Imported 25 portfolios"
- Error report (if any rows failed, show why)

**Import Issues from Excel/CSV:**
- Upload Excel/CSV file
- Required columns: Portfolio Name, Site Name, Issue Hour, Description, Monitored By, etc.
- Validation:
  - Portfolio must exist (or create new)
  - Hour must be 0-23
  - Date format correct
- Map CSV columns to database columns (if headers different)
- Preview import
- Confirm import
- Success message: "Imported 150 issues"

**Import Users from Excel/CSV:**
- Upload Excel/CSV file (for login users and/or monitored personnel)
- Required columns: Username, Password, Full Name, Role
- Validation:
  - Unique usernames
  - Password min 6 chars
  - Valid roles
- Hash passwords on import
- Preview import
- Confirm import
- Success message: "Imported 10 users"

**Bulk Import with Validation:**
- All imports validate data before inserting
- Show errors per row (e.g., "Row 5: Invalid hour value '25'")
- Option to skip invalid rows or abort entire import
- Transaction-based (rollback if any critical errors)

**Import Error Reporting:**
- After import, show summary:
  - X rows imported successfully
  - Y rows failed
  - Download error report (CSV with failed rows and error messages)
- User can fix errors and re-import failed rows

---

#### Data Synchronization

**Sync from Current App to New Multi-Tenant App:**
- Migration script (Node.js or SQL)
- Steps:
  1. Export all data from current app (portfolios, issues, users)
  2. Add `tenant_id` column to all exported data (assign to first tenant)
  3. Import into new multi-tenant app
  4. Verify data integrity
- Run migration script once (during initial setup)

**Tenant Data Isolation Verification:**
- After migration, verify each tenant can only see their own data
- Test queries with different `tenant_id` values
- Ensure Row Level Security (RLS) policies work correctly

**Data Integrity Checks:**
- Verify foreign keys valid (portfolio_id in issues table matches existing portfolio)
- Check for orphaned records (issues with non-existent portfolio_id)
- Validate data types and formats
- Run SQL checks after migration

**Rollback Capability:**
- Before migration, create full database backup
- If migration fails, rollback to backup
- Provide "Undo Migration" button (if migration was recent)

---

## Implementation Checklist Summary

### ✅ **Current Application Features (100% Included)**

All features from "My Mandatory Now" are fully included in the new multi-tenant architecture:

- ✅ Dashboard with real-time stats and auto-refresh
- ✅ Portfolio management (CRUD with subtitle and site range)
- ✅ Issue tracking (log, view, edit, delete issues)
- ✅ Hourly coverage charts and heat maps
- ✅ User management (login users + monitored personnel)
- ✅ Admin panel (6 tabs: portfolios, login users, monitored personnel, active locks, admin logs, coverage matrix)
- ✅ Portfolio locking/reservation system
- ✅ Admin activity logging
- ✅ "All Sites Checked" status tracking
- ✅ Performance analytics and reports
- ✅ Issues by user analysis
- ✅ Portfolio monitoring matrix (grid view)
- ✅ Multiple visual heat maps
- ✅ Advanced search and filtering
- ✅ Excel/CSV export capabilities
- ✅ Mobile-responsive design
- ✅ Accessibility features
- ✅ Real-time updates and live lock management
- ✅ User authentication (user and admin logins)
- ✅ Session management (8h users, 2h admins)
- ✅ Tooltips, color-coded indicators, and visual feedback
- ✅ Ticket logging table, portfolio hour session drawer, action modals

### 🆕 **New Multi-Tenant Features (Added)**

- 🆕 Tenant management (create, edit, delete clients)
- 🆕 Global analytics (cross-tenant reporting)
- 🆕 Subdomain routing (client1.yourapp.com, client2.yourapp.com)
- 🆕 Super admin portal (manage all tenants)
- 🆕 Tenant data isolation (100% secure separation)
- 🆕 Subscription/billing system (optional)
- 🆕 Tenant-specific customization (logo, settings)
- 🆕 Data import/migration tools

---

**End of Document**

