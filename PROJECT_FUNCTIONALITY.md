# IoT Parts Management System - Complete Functionality Guide

## 🎯 Project Overview

**Name:** IoT Lab Parts Management System  
**Institution:** SIES GST IoT Lab  
**Purpose:** Complete inventory management system for tracking IoT components, managing student requests, and monitoring component issuing/returns  
**Tech Stack:** Next.js 15, TypeScript, Prisma, PostgreSQL (Supabase), NextAuth.js  
**Production URL:** https://lab-inventory-siesgst.vercel.app

---

## 👥 User Roles & Access Levels

The system has **3 distinct user roles** with hierarchical permissions:

### 1. **STUDENT** (Basic User)
**Authentication:** Microsoft Azure AD OAuth (`@gst.sies.edu.in` domain)  
**Primary Functions:**
- View their own dashboard with statistics
- Request components for projects
- View status of their requests
- See issued components and return dates
- Track upcoming returns with risk indicators
- Self-onboard with PRN verification

**Cannot Do:**
- Approve/reject requests
- Manage inventory
- Issue components
- Access admin features

### 2. **LAB_ASSISTANT** (Staff)
**Authentication:** Credentials (email + password)  
**Credentials:** `lab.staff@sies.edu` / `lab123`  
**Primary Functions:**
- Issue components to students
- Accept returns and mark items as returned
- Approve/reject component requests
- Manage inventory (add, edit, adjust stock)
- Scan student PRNs
- Verify student PRNs
- Bulk import student data (CSV)
- View all requests and issued items
- Generate reports

**Special Features:**
- Can see ALL requests across all departments
- Full inventory CRUD operations
- Direct issuing without approval requirement

### 3. **HOD** (Head of Department)
**Authentication:** Microsoft Azure AD OAuth  
**Primary Functions:**
- All Lab Assistant capabilities
- **Department-filtered view** - only sees students from their department
- Approve/reject requests for their department
- Department-specific analytics

**Special Features:**
- Automatic department filtering in all views
- Department-level oversight

---

## 🔐 Authentication Flow

### Microsoft OAuth Flow (Students & HODs)
1. User clicks "Sign in with Microsoft"
2. Redirected to Microsoft login (`login.microsoftonline.com`)
3. User enters `@gst.sies.edu.in` credentials
4. Microsoft validates and returns user profile
5. System checks if user exists in database:
   - **If exists:** Load existing user data
   - **If new:** Auto-create user with STUDENT role
6. User redirected to appropriate dashboard based on role

### Credentials Flow (Lab Assistant)
1. User enters email and password
2. System validates against hashed password in database (bcrypt)
3. Session created with JWT token
4. User redirected to Lab Assistant dashboard

### Session Management
- **Strategy:** JWT (JSON Web Tokens)
- **Token Contains:** userId, role, department, PRN, isActive
- **Security:** HttpOnly cookies, CSRF protection
- **Expiration:** Session-based (expires on browser close)

---

## 📊 Core Workflows

### WORKFLOW 1: Student Requests Component

**Step-by-Step:**

1. **Student Login**
   - Student signs in with Microsoft account
   - Redirected to `/dashboard/student`

2. **View Available Inventory**
   - Browse components at `/inventory/browse`
   - Search by name, filter by category
   - See available stock in real-time

3. **Create Request**
   - Click "New Request" → `/requests/new`
   - Select component from dropdown
   - Enter:
     - Quantity (validated against available stock)
     - Purpose (minimum 10 characters)
     - Expected duration (1-1095 days)
     - Optional: Project association
     - Optional: Start/End dates
   - Submit request

4. **System Validations**
   - ✅ Check if student has overdue items
   - ✅ Verify component exists and has sufficient stock
   - ✅ Validate duration is reasonable
   - ❌ Block if student has overdue items
   - ❌ Block if insufficient stock

5. **Request Created**
   - Status: PENDING
   - Notifications sent to:
     - All HODs
     - All Lab Assistants
   - Request appears in `/approvals` for staff

6. **Track Request**
   - Student sees request in "Recent Requests" on dashboard
   - Status updates shown: PENDING → APPROVED → ISSUED
   - Or: PENDING → REJECTED (with reason)

### WORKFLOW 2: Lab Assistant Approves & Issues Component

**Step-by-Step:**

1. **Lab Assistant Login**
   - Login with credentials: `lab.staff@sies.edu` / `lab123`
   - Redirected to `/dashboard/lab-assistant`

2. **View Pending Requests**
   - Navigate to `/approvals`
   - See all PENDING requests across all departments
   - View student details (name, PRN, department, year)
   - View component details (name, category, available stock)

3. **Review Request**
   - Check purpose/justification
   - Verify student credibility
   - Confirm stock availability
   - Decision: Approve or Reject

4. **If Rejecting:**
   - Click "Reject"
   - Provide rejection reason (required)
   - Status changes to: REJECTED
   - Student notified

5. **If Approving:**
   - Click "Approve"
   - Status changes to: APPROVED
   - Component reserved (not yet issued)

6. **Issue Component**
   - Navigate to `/issue-components`
   - Select approved request OR scan student PRN
   - Confirm issuing details:
     - Component name & quantity
     - Expected return date (calculated from duration)
     - Optional: Notes/instructions
   - Click "Issue"

7. **System Actions on Issuing:**
   - Create `IssuedComponent` record
   - Update component `availableStock` (decrease)
   - Update request status: ISSUED
   - Set `expectedReturnDate`
   - Log audit trail
   - Notify student

8. **Generate Documentation**
   - Optional: Print issuing receipt
   - QR code generated for tracking

### WORKFLOW 3: Component Return Process

**Step-by-Step:**

1. **Student Brings Component Back**
   - Student comes to lab with component
   - Lab Assistant verifies physical condition

2. **Lab Assistant Marks Return**
   - Navigate to `/parts-issued`
   - Find issued item by:
     - Student PRN search
     - Component serial number
     - Manual lookup
   - Click "Mark as Returned"

3. **System Actions:**
   - Set `isReturned: true`
   - Record `actualReturnDate`
   - Update component `availableStock` (increase)
   - Calculate if return was on-time or late
   - Update student reputation score
   - Log audit trail

4. **Overdue Handling**
   - If returned late:
     - Flag in student record
     - Affects reputation score
     - May trigger warning for future requests
   - If still overdue:
     - Student cannot create new requests
     - Automated reminder notifications

### WORKFLOW 4: Inventory Management

**Adding New Component:**

1. **Lab Assistant Access**
   - Navigate to `/inventory/manage`
   - Click "Add Component"

2. **Enter Component Details:**
   - Name (required)
   - Category (dropdown or custom)
   - Manufacturer (optional)
   - Initial stock quantity (required)
   - Specifications (optional)
   - Purchase date (optional)
   - Cost (optional)
   - Storage location (optional)

3. **System Actions:**
   - Create component in database
   - Set `totalStock = availableStock` initially
   - Generate unique component ID
   - Optional: Generate QR code
   - Create stock movement record (type: IN)
   - Log audit trail

**Adjusting Stock:**

1. **Scenario:** New shipment arrived or components damaged
2. **Lab Assistant:**
   - Go to `/inventory/manage`
   - Find component
   - Click "Adjust Stock"
   - Enter new total stock number
   - System recalculates `availableStock`
   - Log stock movement (IN or OUT)

### WORKFLOW 5: PRN Verification & Bulk Import

**Single PRN Verification:**

1. **Lab Assistant scans student card**
2. **System lookup:** Find user by PRN
3. **Display student info:** Name, email, department, year
4. **Lab Assistant clicks "Verify PRN"**
5. **System sets:** `isPrnVerified: true`
6. **Student now has full access** to request components

**Bulk CSV Import:**

1. **HOD/Admin uploads CSV** with columns:
   - Name, Email, PRN, Department, Year
2. **System validates** each row
3. **Creates/updates users** in bulk
4. **Verification status** set to false (manual verification needed)
5. **Report generated:** Success count, errors, duplicates

### WORKFLOW 6: Scanner & QR Code System

**Student Scanning:**

1. **Lab Assistant navigates to** `/scanner`
2. **Scans student ID card** (QR code contains PRN)
3. **API call:** POST `/api/scanner/student` with PRN
4. **System returns:** Student profile with current status
5. **Display:**
   - Current issued items
   - Pending requests
   - Overdue status
   - Return due dates

**Component Scanning:**

1. **Scan component QR code**
2. **System displays:**
   - Component details
   - Current stock
   - Issued to whom (if issued)
   - Expected return date

---

## 📈 Dashboard Features

### Student Dashboard (`/dashboard/student`)

**Quick Stats Cards:**
- **Active Requests:** Count of PENDING/APPROVED requests
- **Items Issued:** Currently borrowed components
- **Overdue Items:** Components past return date
- **Upcoming Returns:** Next 5 items to return

**Recent Requests Section:**
- Last 10 requests with status
- Priority indicators (HIGH if >48hrs old)
- Quick view of approval status
- Link to full request details

**Upcoming Returns Section:**
- Items sorted by return date (ascending)
- **Risk Assessment:**
  - 🔴 HIGH: Overdue
  - 🟡 MEDIUM: Due within 2 days
  - 🔵 LOW: Due within 7 days
  - 🟢 NONE: Due after 7 days
- Days until due calculation
- Quick action buttons

**Activity Summary:**
- Total requests (all time)
- Average return time (days)
- Total projects completed
- Reputation score (0-5.0)
- Month-over-month trends

**Reputation Score Calculation:**
```
Score = (onTimeReturnRate * 0.6) + (noOverdueBonus * 0.2) + (completionRate * 0.2)
- onTimeReturnRate: % of returns on-time
- noOverdueBonus: 0.2 if no overdue items, else 0
- completionRate: % of approved requests completed
```

### Lab Assistant Dashboard (`/dashboard/lab-assistant`)

**Real-time Stats:**
- Pending approvals count
- Low stock alerts
- Overdue items count
- Today's issuances

**Quick Actions:**
- Approve requests
- Issue components
- Scan student
- Manage inventory

**Recent Activity Feed:**
- Latest requests
- Recent issuances
- Recent returns

### HOD Dashboard (`/dashboard/hod`)

**Department-Filtered View:**
- All stats filtered by HOD's department
- Department student list
- Department request analytics
- Component usage by department

---

## 🔔 Notification System

**Trigger Events:**

1. **New Request Created**
   - Notify: All HODs, All Lab Assistants
   - Message: "{StudentName} requested {Quantity}× {ComponentName}"

2. **Request Approved**
   - Notify: Student
   - Message: "Your request for {ComponentName} has been approved"

3. **Request Rejected**
   - Notify: Student
   - Message: "Your request was rejected. Reason: {RejectionReason}"

4. **Component Issued**
   - Notify: Student
   - Message: "Components issued. Return by {ReturnDate}"

5. **Return Reminder** (2 days before due)
   - Notify: Student
   - Message: "Reminder: Return {ComponentName} by {ReturnDate}"

6. **Overdue Alert** (1 day after due)
   - Notify: Student, Lab Assistant, HOD
   - Message: "{StudentName} has overdue items: {ComponentList}"

7. **Low Stock Alert**
   - Notify: Lab Assistants
   - Message: "{ComponentName} stock is low: {AvailableStock} remaining"

---

## 📊 Analytics & Reports

### Available Reports:

1. **Component Usage Report**
   - Most requested components
   - Utilization rate (issued/total)
   - Category-wise distribution

2. **Student Activity Report**
   - Top requesters
   - Average borrow duration
   - On-time return rates
   - Reputation rankings

3. **Inventory Health Report**
   - Low stock items
   - Never-requested components
   - Components with high demand

4. **Department Analytics**
   - Requests by department
   - Component preferences
   - Return compliance rates

5. **Trend Analysis**
   - Month-over-month request trends
   - Seasonal patterns
   - Peak usage periods

### Export Formats:
- CSV
- Excel (XLSX)
- PDF (reports with charts)

---

## 🎨 Special Features

### 1. **Risk Assessment Algorithm**

For upcoming returns, system calculates risk level:

```typescript
function determineRisk(daysUntilDue: number, isOverdue: boolean): Risk {
  if (isOverdue) return 'HIGH'        // Red: Already late
  if (daysUntilDue <= 2) return 'MEDIUM'  // Yellow: Due very soon
  if (daysUntilDue <= 7) return 'LOW'     // Blue: Due this week
  return 'NONE'                            // Green: Not urgent
}
```

### 2. **Priority Calculation**

For pending requests, system assigns priority:

```typescript
function determinePriority(createdAt: Date): Priority {
  const hoursOld = (now - createdAt) / (1000 * 60 * 60)
  
  if (hoursOld > 48) return 'HIGH'    // Waiting over 2 days
  if (hoursOld > 24) return 'MEDIUM'  // Waiting over 1 day
  return 'LOW'                        // Recent request
}
```

### 3. **Stock Status Badges**

Visual indicators for inventory health:

- 🔴 **Out of Stock**: availableStock = 0
- 🟡 **Low Stock**: availableStock <= 2
- 🟢 **In Stock**: availableStock > 2

### 4. **Audit Logging**

Every critical action is logged:

```typescript
interface AuditLog {
  userId: string
  action: 'CREATE_REQUEST' | 'APPROVE_REQUEST' | 'ISSUE_COMPONENT' | 'RETURN_COMPONENT' | 'CREATE_COMPONENT' | 'UPDATE_STOCK'
  resource: 'COMPONENT_REQUEST' | 'COMPONENT' | 'ISSUED_COMPONENT' | 'USER'
  details: JSON // Complete action details
  timestamp: DateTime
  ipAddress: string
  userAgent: string
}
```

### 5. **Overdue Prevention**

Before creating new request, system checks:

```typescript
const overdueCount = await prisma.issuedComponent.count({
  where: {
    studentId: session.user.id,
    isReturned: false,
    expectedReturnDate: { lt: new Date() }
  }
})

if (overdueCount > 0) {
  throw new Error('You have overdue items. Please return them first.')
}
```

---

## 🔒 Security Features

### 1. **Role-Based Access Control (RBAC)**

Every API endpoint checks:
```typescript
const session = await auth()
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

if (!ALLOWED_ROLES.includes(session.user.role)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### 2. **Input Validation**

Using Zod schemas:
```typescript
const createRequestSchema = z.object({
  componentId: z.string().min(1),
  quantity: z.number().min(1).max(100),
  purpose: z.string().min(10),
  expectedDuration: z.number().min(1).max(1095)
})
```

### 3. **SQL Injection Prevention**

Prisma ORM provides automatic parameterized queries:
```typescript
// Safe - Prisma prevents SQL injection
await prisma.component.findMany({
  where: { 
    name: { contains: userInput, mode: 'insensitive' } 
  }
})
```

### 4. **XSS Prevention**

React automatically escapes output:
```tsx
<p>{component.name}</p> // Safe - automatically escaped
```

### 5. **CSRF Protection**

NextAuth.js provides built-in CSRF tokens for all mutations.

---

## 🛠️ Technical Architecture

### Database Schema (Key Tables)

**User:**
```
id, name, email, role, prn, department, year, 
isPrnVerified, isActive, password (hashed)
```

**Component:**
```
id, name, category, manufacturer, totalStock, 
availableStock, condition, serialNumber, qrCode, 
cost, storageLocation, imageUrl, isActive
```

**ComponentRequest:**
```
id, studentId, componentId, quantity, purpose, 
expectedDuration, status (PENDING/APPROVED/ISSUED/REJECTED),
startDate, endDate, rejectionReason, approvedAt
```

**IssuedComponent:**
```
id, requestId, studentId, componentId, quantity,
issuedAt, expectedReturnDate, actualReturnDate,
isReturned, status, issuedBy, notes
```

**StockMovement:**
```
id, componentId, type (IN/OUT), quantity, 
reason, performedBy, timestamp
```

**AuditLog:**
```
id, userId, action, resource, details (JSON),
timestamp, ipAddress, userAgent
```

**Notification:**
```
id, userId, targetRole, title, message, type,
isRead, readAt, createdAt
```

### API Routes Structure

```
/api/
├── auth/
│   └── [...nextauth]/route.ts    # NextAuth handler
├── dashboard/
│   ├── student/route.ts          # Student dashboard data
│   ├── lab-assistant/route.ts    # Lab assistant dashboard
│   └── hod/route.ts              # HOD dashboard
├── components/
│   ├── route.ts                  # GET (list), POST (create)
│   └── [id]/route.ts             # GET, PATCH, DELETE
├── requests/
│   ├── route.ts                  # GET (list), POST (create)
│   └── [id]/
│       ├── route.ts              # PATCH (approve/reject)
│       └── issue/route.ts        # POST (issue component)
├── parts-issued/
│   └── route.ts                  # GET (list issued items)
├── scanner/
│   ├── student/route.ts          # POST (lookup student by PRN)
│   └── component/route.ts        # POST (lookup component)
├── users/
│   ├── route.ts                  # GET (list users)
│   ├── [id]/
│   │   ├── route.ts              # GET, PATCH (update role)
│   │   └── verify/route.ts       # POST (verify PRN)
│   ├── bulk-import/route.ts      # POST (CSV import)
│   └── search/route.ts           # GET (search users)
├── returns/
│   ├── mark-returned/route.ts    # POST (mark as returned)
│   ├── schedule/route.ts         # GET (upcoming returns)
│   └── notifications/route.ts    # POST (send reminders)
├── analytics/route.ts            # GET (statistics)
├── export/route.ts               # GET (export data)
└── cron/
    └── keep-alive/route.ts       # GET (prevent DB auto-pause)
```

---

## 🚀 Deployment & Environment

### Production Environment:

- **Hosting:** Vercel (Serverless)
- **Database:** Supabase PostgreSQL (pooled connection)
- **Auth:** NextAuth.js v5
- **Domain:** lab-inventory-siesgst.vercel.app

### Environment Variables:

```env
DATABASE_URL="postgresql://..." # Supabase pooled (port 6543)
DIRECT_URL="postgresql://..."   # Supabase direct (port 5432)
NEXTAUTH_URL="https://lab-inventory-siesgst.vercel.app"
NEXTAUTH_SECRET="..."
MICROSOFT_CLIENT_ID="..."       # Azure AD app
MICROSOFT_CLIENT_SECRET="..."
MICROSOFT_TENANT_ID="..."       # SIES GST tenant
CRON_SECRET="..."               # For keep-alive endpoint
```

### Database Connection:

- **Pooled (for app):** Port 6543 via PgBouncer
- **Direct (for migrations):** Port 5432
- **Auto-pause prevention:** Cron job hits `/api/cron/keep-alive` every 5 days

---

## 📱 Mobile Responsiveness

- Fully responsive design (Tailwind CSS)
- Mobile-optimized navigation
- Touch-friendly interfaces
- Collapsible sidebars on mobile
- Responsive tables with horizontal scroll
- Mobile-friendly forms with large touch targets

---

## 🎯 Business Rules Summary

1. **Students cannot request components if they have overdue items**
2. **Quantity requested cannot exceed available stock**
3. **Request purpose must be at least 10 characters**
4. **Duration must be between 1-1095 days (3 years max)**
5. **HODs only see requests from their department**
6. **Lab Assistants see all requests across all departments**
7. **Available stock = Total stock - Currently issued**
8. **Reputation score affects future request priority**
9. **Overdue items affect student's ability to create new requests**
10. **All critical actions are audit logged**

---

## 🔄 Data Flow Examples

### Example 1: Creating a Request

```
Student (Web) → POST /api/requests
                    ↓
              [Validate Session]
                    ↓
              [Check Overdue Items]
                    ↓
              [Verify Stock Available]
                    ↓
              [Create ComponentRequest]
                    ↓
         [Create Notifications for HOD/Lab]
                    ↓
              [Return Response]
                    ↓
           Student sees "Request Created"
```

### Example 2: Issuing a Component

```
Lab Assistant → POST /api/requests/[id]/issue
                        ↓
                 [Validate Session & Role]
                        ↓
                 [Check Request is APPROVED]
                        ↓
                 [Create IssuedComponent record]
                        ↓
                 [Decrease availableStock]
                        ↓
                 [Update Request status to ISSUED]
                        ↓
                 [Calculate expectedReturnDate]
                        ↓
                 [Create Audit Log]
                        ↓
                 [Notify Student]
                        ↓
                 [Return Response]
```

---

## 💡 Key Differentiators

1. **Real-time Dashboard Updates:** Auto-refresh every 30 seconds
2. **Comprehensive Analytics:** Trend analysis, reputation scoring
3. **Smart Risk Assessment:** Proactive return reminders
4. **Department Filtering:** HOD sees only their department
5. **Audit Trail:** Complete tracking of all actions
6. **Overdue Prevention:** Blocks new requests if items overdue
7. **Stock Intelligence:** Auto-calculation of available vs total stock
8. **Flexible Duration:** Support for short-term and long-term borrows
9. **Microsoft SSO Integration:** Seamless authentication for students
10. **Professional UI/UX:** Dark mode, responsive, accessible

---

## 🎓 Educational Value

This project demonstrates:

- **Full-stack development** with modern tech stack
- **Authentication & Authorization** with multiple providers
- **Role-based access control** implementation
- **Database design** with complex relationships
- **API design** following REST principles
- **Real-time features** with auto-refresh
- **Data validation** at multiple layers
- **Security best practices** (hashing, CSRF, SQL injection prevention)
- **Audit logging** for compliance
- **Analytics & reporting** implementation
- **Responsive design** principles
- **Production deployment** on modern platforms

---

**Document Version:** 1.0  
**Last Updated:** July 10, 2026  
**Status:** Production-Ready  
**Demo Date:** July 11, 2026
