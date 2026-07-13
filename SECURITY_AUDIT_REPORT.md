# 🔒 API Security Audit Report
**Date:** December 2024  
**Auditor:** Security Analysis  
**Scope:** All API endpoints for authorization flaws (BOLA, BFLA, IDOR)

---

## Executive Summary

A comprehensive security audit was performed on all API endpoints in the IoT Parts Management System. The audit focused on identifying:
- **BOLA** (Broken Object Level Authorization) - users accessing other users' objects
- **BFLA** (Broken Function Level Authorization) - users accessing functions beyond their role
- **IDOR** (Insecure Direct Object References) - predictable IDs without ownership checks

### Overall Security Status: ⚠️ **GOOD with Minor Issues**

**Critical Issues:** 0  
**High Severity:** 2  
**Medium Severity:** 1  
**Low Severity:** 2  

---

## 🔴 HIGH SEVERITY VULNERABILITIES

### 1. Missing Authorization in `/api/returns/mark-returned` (HIGH)

**File:** `src/app/api/returns/mark-returned/route.ts`

**Issue:**  
NO authentication or authorization checks at all! Any unauthenticated user can mark ANY part as returned, potentially manipulating inventory.

**Current Code:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const { partId } = await request.json()
    // ❌ NO auth check!
    // ❌ NO session check!
    // ❌ NO role check!
```

**Impact:**
- Unauthenticated users can mark parts as returned
- Students could return parts without lab assistant verification
- Malicious actors could manipulate inventory counts
- No audit trail of WHO performed the return

**Exploitation:**
```bash
# Anyone can do this without authentication:
curl -X POST https://yourapp.com/api/returns/mark-returned \
  -H "Content-Type: application/json" \
  -d '{"partId":"any-part-id"}'
```

**Fix Required:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // ✅ Add authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ✅ Add role authorization (only lab staff)
    if (!['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { partId } = await request.json()
    // ... rest of code
    
    // ✅ Use actual session user for audit
    const returnedById = session.user.id // instead of finding a random lab assistant
```

---

### 2. Parts-Issued GET Endpoint Leaks All Student Data (HIGH)

**File:** `src/app/api/parts-issued/route.ts`

**Issue:**  
The GET endpoint allows STUDENTS to query issued parts by ANY student's PRN without ownership validation. Students can see what components other students have borrowed.

**Current Code:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // ❌ Any authenticated user can query any PRN!
    
    const { searchParams } = new URL(request.url)
    const prn = searchParams.get('prn')

    const where: any = { status: 'ACTIVE' }
    if (prn) {
      where.student = { prn }  // ❌ No check if this is THEIR PRN
    }
```

**Impact:**
- Student A can query `/api/parts-issued?prn=STUDENT_B_PRN` and see all of Student B's borrowed items
- Privacy violation - students can spy on each other
- Potential for social engineering attacks

**Exploitation:**
```bash
# Student A logged in, querying Student B's data:
GET /api/parts-issued?prn=PRN202412345
# Returns all of Student B's issued components
```

**Fix Required:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const prn = searchParams.get('prn')

    const where: any = { status: 'ACTIVE' }
    
    if (prn) {
      // ✅ If STUDENT role, enforce they can only see their own PRN
      if (session.user.role === 'STUDENT') {
        // Check if the requested PRN matches their own
        const currentUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { prn: true }
        })
        
        if (currentUser?.prn !== prn) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }
      // ✅ Staff can query any PRN
      where.student = { prn }
    } else {
      // ✅ If no PRN specified and user is STUDENT, auto-filter to their data
      if (session.user.role === 'STUDENT') {
        where.studentId = session.user.id
      }
    }
```

---

## 🟡 MEDIUM SEVERITY VULNERABILITIES

### 3. Missing Request ID Ownership Check in GET /api/requests (MEDIUM)

**File:** `src/app/api/requests/route.ts`

**Issue:**  
The `GET /api/requests` endpoint has a `studentId` query parameter that lab assistants can use, but there's potential for privilege escalation if a student modifies the URL.

**Current Code:**
```typescript
// Explicit studentId filter (for issuing page)
if (studentId && ['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
  where.studentId = studentId
}
// ❌ What if a STUDENT sends ?studentId=different-student-id ?
```

**Impact:**
- If a student manually adds `?studentId=another-id` to the URL, they might see filtered data
- Current code only applies the filter IF the role is staff, so students are protected
- However, the logic could be clearer and more defensive

**Current Protection:** ✅ Actually protected because the role check happens BEFORE applying the filter

**Recommendation (Defense in Depth):**
```typescript
// Explicit studentId filter (for issuing page)
if (studentId) {
  // ✅ Explicit denial if student tries to query other students
  if (session.user.role === 'STUDENT' && studentId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // ✅ Staff can filter by any studentId
  if (['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
    where.studentId = studentId
  }
}
```

---

## 🟢 LOW SEVERITY ISSUES

### 4. Component GET Endpoint Returns Sensitive Data to All Users (LOW)

**File:** `src/app/api/components/[id]/route.ts`

**Issue:**  
Any authenticated user (including students) can view detailed component information including cost, stock movements, and request history.

**Current Code:**
```typescript
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ❌ Students can see: cost, stock movements, ALL request history
  
  const component = await prisma.component.findUnique({
    where: { id },
    include: {
      requests: { include: { student: { select: { name: true, prn: true } } } },
      stockMovements: { orderBy: { createdAt: 'desc' }, take: 10 }
    }
  })
```

**Impact:**
- Students can see component costs (possibly sensitive financial data)
- Students can see which other students requested the same component (privacy)
- Students can see stock movement history (operational data)

**Recommendation:**
```typescript
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isStaff = ['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)

  const component = await prisma.component.findUnique({
    where: { id },
    include: {
      // ✅ Only staff see request history
      ...(isStaff && {
        requests: { include: { student: { select: { name: true, prn: true } } } },
        stockMovements: { orderBy: { createdAt: 'desc' }, take: 10 }
      })
    }
  })

  // ✅ Sanitize response for students
  if (!isStaff && component) {
    const { cost, requests, stockMovements, ...publicData } = component
    return NextResponse.json(publicData)
  }

  return NextResponse.json(component)
}
```

---

### 5. User PATCH Allows Lab Assistants to Modify Roles (LOW)

**File:** `src/app/api/users/[id]/route.ts`

**Issue:**  
Lab assistants can modify user roles, potentially escalating privileges.

**Current Code:**
```typescript
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  // ❌ LAB_ASSISTANT can change roles
  if (!session || !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
```

**Impact:**
- Lab assistants could elevate themselves to HOD or ADMIN
- Lab assistants could demote HODs
- Current self-demotion check prevents changing own role, but doesn't prevent lateral escalation

**Recommendation:**
```typescript
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  
  // ✅ Only HOD and ADMIN can change roles
  if (!session || !['HOD', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ✅ Prevent privilege escalation beyond own level
  const target = await prisma.user.findUnique({ where: { id } })
  const roleHierarchy = { STUDENT: 0, LAB_ASSISTANT: 1, HOD: 2, ADMIN: 3 }
  
  if (roleHierarchy[parsed.data.role] > roleHierarchy[session.user.role]) {
    return NextResponse.json(
      { error: 'Cannot assign role higher than your own' },
      { status: 403 }
    )
  }
```

---

## ✅ WELL-PROTECTED ENDPOINTS

The following endpoints have **correct and secure** authorization:

### 1. ✅ `/api/requests/[id]` - GET/PATCH/DELETE
- Students can only access their own requests
- Staff have appropriate permissions
- Ownership checks are correct

### 2. ✅ `/api/projects/[id]` - DELETE
- Ownership check: `if (project.studentId !== session.user.id)`
- Only project owner can delete

### 3. ✅ `/api/special-requests/[id]` - DELETE
- Students can only delete their own pending requests
- Staff can delete any request
- Status check prevents deletion of processed requests

### 4. ✅ `/api/requests/[id]/issue` - POST
- Correct role check (LAB_ASSISTANT, HOD only)
- Transaction-safe with proper locking
- Complete audit trail

### 5. ✅ `/api/dashboard/student` - GET
- Enforces STUDENT role only
- Returns only current student's data
- No ID parameter injection possible

### 6. ✅ Middleware Authorization
- Correct route protection for role-based access
- Proper redirects for unauthorized access
- API route authentication enforced

---

## 📊 Summary Table

| Endpoint | Method | Auth? | Role Check? | Ownership Check? | Severity |
|----------|--------|-------|-------------|------------------|----------|
| `/api/returns/mark-returned` | POST | ❌ NO | ❌ NO | ❌ NO | 🔴 HIGH |
| `/api/parts-issued` | GET | ✅ YES | ⚠️ PARTIAL | ❌ NO | 🔴 HIGH |
| `/api/requests` | GET | ✅ YES | ✅ YES | ⚠️ PARTIAL | 🟡 MEDIUM |
| `/api/components/[id]` | GET | ✅ YES | ⚠️ NO | N/A | 🟢 LOW |
| `/api/users/[id]` | PATCH | ✅ YES | ⚠️ WEAK | ✅ YES | 🟢 LOW |
| `/api/requests/[id]` | ALL | ✅ YES | ✅ YES | ✅ YES | ✅ SECURE |
| `/api/projects/[id]` | DELETE | ✅ YES | ✅ YES | ✅ YES | ✅ SECURE |
| `/api/special-requests/[id]` | DELETE | ✅ YES | ✅ YES | ✅ YES | ✅ SECURE |
| `/api/requests/[id]/issue` | POST | ✅ YES | ✅ YES | ✅ YES | ✅ SECURE |
| `/api/dashboard/student` | GET | ✅ YES | ✅ YES | ✅ YES | ✅ SECURE |

---

## 🛠️ Recommended Fix Priority

### Immediate (Fix Today):
1. **Fix `/api/returns/mark-returned`** - Add authentication and role checks
2. **Fix `/api/parts-issued` GET** - Add student ownership validation

### Short Term (This Week):
3. **Update `/api/users/[id]` PATCH** - Restrict role changes to HOD/ADMIN only
4. **Add defense-in-depth to `/api/requests` GET** - Explicit student filtering

### Nice to Have (Next Sprint):
5. **Sanitize `/api/components/[id]` GET** - Hide sensitive data from students

---

## 🧪 Testing Recommendations

After fixes are applied, test with:

1. **Student Account Tests:**
   - Try accessing `/api/parts-issued?prn=DIFFERENT_STUDENT_PRN`
   - Try calling `/api/returns/mark-returned` without auth
   - Try accessing other students' requests

2. **Role Escalation Tests:**
   - Lab assistant trying to make themselves HOD
   - Student trying to add `?studentId=other-id` to requests

3. **IDOR Tests:**
   - Sequential ID probing for projects, requests, components
   - Verify all ownership checks trigger 403 Forbidden

---

## 📝 Code Review Checklist for Future Endpoints

For every new API endpoint, verify:

- [ ] Authentication check (`await auth()`)
- [ ] Role-based authorization check (if needed)
- [ ] Ownership validation (for user-specific resources)
- [ ] Input validation with Zod schema
- [ ] Audit log creation (for sensitive operations)
- [ ] Transaction usage (for multi-step operations)
- [ ] Error messages don't leak sensitive info
- [ ] Return proper HTTP status codes (401, 403, 404)

---

## 🔗 References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP BOLA/IDOR Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [NextAuth.js Security Best Practices](https://next-auth.js.org/configuration/options#security)

---

**End of Security Audit Report**
