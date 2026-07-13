# 📚 PROJECT CONTEXT - IoT Parts Management System (SIES GST Lab)

## 🎯 Project Overview

**LabInventory** is a comprehensive IoT lab management system designed specifically for SIES GST's IoT Lab. It manages the complete lifecycle of electronic components from procurement to issuance, tracking, and return.

### Purpose
Help lab staff efficiently manage inventory and help students request, borrow, and return IoT components for their projects with full accountability and tracking.

### Production URL
**https://lab-inventory-siesgst.vercel.app**

---

## 👥 USER ROLES (3 ROLES)

### 1. **STUDENT** 👨‍🎓
**Primary Users**: All SIES GST students with Microsoft accounts

**What they can do:**
- Login using Microsoft OAuth (@gst.sies.edu.in email)
- Browse available components inventory (view-only)
- Create component requests with purpose and duration
- View their own request history and status
- View components currently issued to them
- Track upcoming return dates
- Self-onboard by linking their PRN (student ID)

**What they CANNOT do:**
- Approve/reject requests
- Issue or return components physically
- Manage inventory (add/edit/delete components)
- View other students' requests
- Access admin features

**Dashboard Features:**
- Active requests count
- Items currently issued
- Overdue items warning
- Upcoming returns with risk indicators
- Personal reputation score
- Request history


### 2. **LAB_ASSISTANT** 🔧
**Primary Users**: Lab staff members who manage day-to-day operations

**Login Method**: Credentials (Email + Password)
- Email: `lab.staff@sies.edu`
- Password: `lab123`

**What they can do:**
- Login using email/password (credentials-based)
- Approve or reject student component requests
- Issue components to students (physical handover)
- Mark components as returned (physical collection)
- Add new components to inventory
- Update stock levels (when new parts arrive or get damaged)
- Scan student PRN QR codes to look up student info
- Verify student PRNs
- Bulk import student data from CSV
- View all pending requests across all departments
- Generate reports and analytics

**What they CANNOT do:**
- Create component requests (they're staff, not students)
- Change their own role
- Delete organization settings

**Dashboard Features:**
- Pending approvals count
- Total components in inventory
- Low stock alerts
- Recent activity feed
- Quick approval actions


### 3. **HOD** (Head of Department) 👔
**Primary Users**: Department heads/faculty supervisors

**Login Method**: Microsoft OAuth (@gst.sies.edu.in)

**What they can do:**
- Everything a LAB_ASSISTANT can do, PLUS:
- View department-filtered data (only their department's students)
- Approve/reject requests from their department students
- Department-level analytics and reporting
- Oversee lab operations

**Unique Features:**
- Department filtering: HODs only see requests from students in their department (e.g., Computer Engineering HOD only sees CE students' requests)
- Higher-level analytics for their department
- Can verify PRNs and manage users

**Dashboard Features:**
- Department-specific statistics
- Pending approvals from their department
- Department inventory usage trends
- Student activity tracking

---

## 🔐 AUTHENTICATION SYSTEM

### Authentication Methods

#### 1. **Microsoft OAuth (Azure AD SSO)**
**Used by**: STUDENT, HOD

**How it works:**
1. User clicks "Sign in with Microsoft"
2. Redirects to Microsoft login page
3. User enters their @gst.sies.edu.in credentials
4. Microsoft verifies and returns profile (name, email, profile picture)
5. System checks if user exists in database
6. If new user: Auto-create account with role = STUDENT (default)
7. If existing user: Load their profile with stored role
8. Create JWT session token
9. Redirect to appropriate dashboard

**Configuration:**
- Client ID: Microsoft App Registration
- Tenant ID: SIES GST Azure AD tenant
- Scopes: `openid profile email User.Read`


#### 2. **Credentials Authentication (Email + Password)**
**Used by**: LAB_ASSISTANT only

**How it works:**
1. Lab assistant enters email and password on login page
2. System queries database for user with that email
3. Checks if user has a password field (LAB_ASSISTANT accounts only)
4. Verifies password using bcrypt
5. Creates JWT session token
6. Redirects to lab-assistant dashboard

**Security:**
- Passwords hashed with bcryptjs (10 salt rounds)
- No plain-text storage
- Only LAB_ASSISTANT accounts have passwords

**Why separate auth?**
- Lab assistants are staff, not students
- Don't have @gst.sies.edu.in email addresses
- Need independent access not tied to college Microsoft accounts

### Session Management

**Strategy**: JWT (JSON Web Tokens)

**JWT Token Contains:**
```javascript
{
  id: "user_id_here",
  role: "STUDENT" | "LAB_ASSISTANT" | "HOD",
  email: "user@example.com",
  name: "User Name",
  department: "Computer Engineering" | null,
  prn: "2024001" | null,
  isActive: true,
  provider: "microsoft-entra-id" | "credentials"
}
```

**Session Expiry**: 30 days
**Token Refresh**: Automatic on page load if valid


---

## 🔒 AUTHORIZATION & ROUTE PROTECTION

### Middleware (`src/middleware.ts`)

**How it works:**
1. Every page request goes through middleware first
2. Checks if user has valid session (JWT token)
3. If no session → Redirect to `/auth/signin`
4. If session exists → Check if route is allowed for their role
5. If not allowed → Redirect to `/unauthorized`
6. If allowed → Proceed to page

### Route Access Matrix

| Route | STUDENT | LAB_ASSISTANT | HOD |
|-------|---------|---------------|-----|
| `/auth/signin` | ✅ (public) | ✅ (public) | ✅ (public) |
| `/dashboard/student` | ✅ | ❌ | ❌ |
| `/dashboard/lab-assistant` | ❌ | ✅ | ❌ |
| `/dashboard/hod` | ❌ | ❌ | ✅ |
| `/requests/new` | ✅ | ❌ | ❌ |
| `/requests/my-requests` | ✅ | ❌ | ❌ |
| `/requests/all` | ❌ | ✅ | ✅ |
| `/approvals` | ❌ | ✅ | ✅ |
| `/inventory/manage` | ❌ | ✅ | ✅ |
| `/issue-components` | ❌ | ✅ | ✅ |
| `/scanner` | ❌ | ✅ | ✅ |
| `/users` | ❌ | ✅ | ✅ |
| `/parts-issued` | ✅ | ✅ | ✅ |
| `/reports` | ❌ | ✅ | ✅ |

### Automatic Role-Based Redirect

When a user successfully logs in, they're automatically redirected:
- `STUDENT` → `/dashboard/student`
- `LAB_ASSISTANT` → `/dashboard/lab-assistant`
- `HOD` → `/dashboard/hod`

This happens in `middleware.ts`:
```typescript
if (pathname === '/' && session) {
  const userRole = session.user?.role?.toLowerCase().replace('_', '-')
  return NextResponse.redirect(new URL(`/dashboard/${userRole}`, req.url))
}
```


---

## 📦 CORE WORKFLOWS

### 1. **Component Request Workflow** (Student → Lab Assistant)

#### Step 1: Student Creates Request
**Route**: `/requests/new`

**Student Actions:**
1. Browse available components
2. Select a component
3. Enter quantity needed
4. Provide purpose (min 10 characters, e.g., "For IoT project - smart home automation")
5. Specify expected duration (days)
6. Optionally link to a project
7. Submit request

**Backend Validation** (`/api/requests POST`):
- ✅ Check component exists
- ✅ Check sufficient stock available
- ✅ Check student has no overdue items
- ✅ Validate quantity (1-100)
- ✅ Validate purpose length (min 10 chars)
- ✅ Validate duration (1-1095 days)

**If validation passes:**
- Create ComponentRequest with status = `PENDING`
- Send notification to LAB_ASSISTANT role
- Send notification to HOD role
- Create audit log entry
- Return success with request ID

**If validation fails:**
- Return error message (e.g., "Insufficient quantity" or "You have overdue items")


#### Step 2: Lab Assistant Reviews Request
**Route**: `/approvals`

**Lab Assistant sees:**
- List of all pending requests
- Student name, PRN, department
- Component requested
- Quantity requested
- Purpose
- Expected duration
- Request timestamp

**Lab Assistant Actions:**
1. Review request details
2. Check stock availability (shown in real-time)
3. Verify student information
4. Make decision:
   - **APPROVE**: Set status to `APPROVED`
   - **REJECT**: Set status to `REJECTED`, provide rejection reason

**API**: `PATCH /api/requests/[id]`

**If APPROVED:**
- Update request status to `APPROVED`
- Set `approvedAt` timestamp
- Send notification to student
- Request moves to "Ready to Issue" queue

**If REJECTED:**
- Update request status to `REJECTED`
- Store rejection reason
- Send notification to student with reason
- Request is closed


#### Step 3: Lab Assistant Issues Components (Physical Handover)
**Route**: `/issue-components`

**Physical Process:**
1. Student comes to lab with their student ID/PRN
2. Lab assistant scans student PRN or searches manually
3. System shows student's approved requests
4. Lab assistant selects the request to fulfill
5. Physically hands over components to student
6. Student confirms receipt (optional signature/acknowledgment)
7. Lab assistant marks as "Issued" in system

**API**: `POST /api/parts-issued`

**Backend Actions:**
- Create `IssuedComponent` record
- Set `issuedAt` timestamp
- Calculate `expectedReturnDate` (issuedAt + expectedDuration)
- Decrement `component.availableStock` by quantity
- Update request status to `ISSUED`
- Link issued item to original request
- Create audit log
- Send confirmation notification to student

**Database Changes:**
```
ComponentRequest: status APPROVED → ISSUED
Component: availableStock = availableStock - quantity
IssuedComponent: NEW RECORD CREATED
  - studentId
  - componentId
  - quantity
  - issuedAt
  - expectedReturnDate
  - isReturned = false
```


#### Step 4: Student Returns Components
**Route**: `/parts-issued`

**Student View:**
- See all components currently issued to them
- View return deadline for each component
- See "days until due" or "overdue by X days"
- Risk indicators (NONE, LOW, MEDIUM, HIGH)

**Physical Return Process:**
1. Student brings components back to lab before deadline
2. Lab assistant inspects components for damage
3. Lab assistant marks as returned in system
4. System updates stock levels

**API**: `POST /api/returns/mark-returned`

**Backend Actions:**
- Update `IssuedComponent`:
  - `isReturned` = true
  - `actualReturnDate` = current timestamp
  - `returnedCondition` = condition assessed by lab assistant
- Increment `component.availableStock` by returned quantity
- Create audit log
- Update student reputation score
- Send confirmation notification

**Database Changes:**
```
IssuedComponent: 
  isReturned = false → true
  actualReturnDate = NOW
  
Component: 
  availableStock = availableStock + quantity
```

**Student Metrics Updated:**
- If returned on time: Reputation score increases
- If overdue: Reputation score decreases
- Average return time recalculated
- Completion rate updated

