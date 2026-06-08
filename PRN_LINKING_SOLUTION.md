# PRN Linking Solution - Complete Guide

## Current Situation Analysis

### What Happens During Microsoft SSO Sign-In

When a student signs in with Microsoft SSO:

```typescript
// auth.ts - signIn callback
async signIn({ user, account, profile }) {
  if (account?.provider === 'microsoft-entra-id') {
    const email = user.email || profile?.email
    
    // Auto-create user if doesn't exist
    await prisma.user.create({
      data: {
        email,                    // ✅ From Microsoft
        name: user.name,          // ✅ From Microsoft
        image: user.image,        // ✅ From Microsoft
        emailVerified: new Date(),
        role: 'STUDENT',          // ✅ Default
        // ❌ PRN is NULL - Not provided by Microsoft!
      },
    })
  }
}
```

### User Data in Database

```prisma
model User {
  id             String    @id @default(cuid())
  name           String?   // ✅ From Microsoft SSO
  email          String    @unique // ✅ From Microsoft SSO
  emailVerified  DateTime? // ✅ Set on first login
  image          String?   // ✅ From Microsoft profile
  role           String    @default("STUDENT")
  prn            String?   @unique // ❌ NULL initially!
  department     String?   // ❌ NULL initially!
  year           String?   // ❌ NULL initially!
  // ...
}
```

### The Problem

1. **Microsoft SSO provides**: Email, Name, Profile Picture
2. **Microsoft SSO does NOT provide**: PRN, Department, Year
3. **PRN is required for**: Barcode scanning, Component issuing, Returns
4. **Current state**: PRN field is `NULL` for all Microsoft SSO users

---

## Why This is Critical

### Barcode Scanning Workflow:
```
1. Lab assistant scans student ID barcode
2. Barcode contains PRN: "123A7009"
3. System searches: WHERE prn = "123A7009"
4. ❌ NO MATCH - PRN is NULL in database!
5. ❌ Cannot issue components
6. ❌ Cannot process returns
```

### Current Workaround:
- Lab assistants search by **name** (slow, error-prone)
- Manual typing of PRN (defeats purpose of scanning)

---

## Solution: PRN Linking System

### Option 1: Admin/HOD Bulk Import (Recommended)

**Concept**: Import student data from college database/Excel

**Steps**:
1. College provides student list with PRN, Name, Email, Department
2. Admin uploads CSV/Excel file
3. System matches by email and updates PRN

**Implementation**:
```typescript
// Bulk import API
POST /api/users/bulk-import
{
  students: [
    {
      email: "sohamscecs123@gst.sies.edu.in",
      prn: "123A7009",
      department: "Electronics and Computer Science",
      year: "2023-2027"
    },
    // ... more students
  ]
}
```

**Advantages**:
- ✅ Fast (import hundreds of students at once)
- ✅ Accurate (from official college data)
- ✅ No student action required
- ✅ Can be done before semester starts

**Disadvantages**:
- ❌ Requires college to provide data
- ❌ One-time setup effort

---

### Option 2: Self-Service PRN Entry

**Concept**: Students enter their PRN on first login

**Flow**:
```
1. Student signs in with Microsoft SSO
2. System detects PRN is NULL
3. Redirect to "/onboarding" page
4. Student enters PRN, Department, Year
5. System validates and saves
6. Student can now use the system
```

**Implementation**:
```typescript
// Onboarding page
<form onSubmit={handleSubmit}>
  <Input 
    label="PRN" 
    placeholder="e.g., 123A7009"
    required 
  />
  <Select label="Department">
    <option>Electronics and Computer Science</option>
    <option>Computer Engineering</option>
    // ...
  </Select>
  <Input label="Year" placeholder="e.g., 2023-2027" />
  <Button>Complete Profile</Button>
</form>
```

**Advantages**:
- ✅ No admin effort
- ✅ Students control their data
- ✅ Always up-to-date

**Disadvantages**:
- ❌ Students might enter wrong PRN
- ❌ Requires validation
- ❌ Extra step for students

---

### Option 3: Admin Manual Entry

**Concept**: Admin/HOD adds PRN for each student manually

**Current Implementation**:
- User Management page exists (`/users`)
- Shows all users with their PRN
- **BUT**: No edit form for PRN!

**What's Missing**:
```typescript
// Current: Can only change role
PATCH /api/users/[id]
{
  role: "STUDENT" | "LAB_ASSISTANT" | "HOD" | "ADMIN"
}

// Needed: Add PRN editing
PATCH /api/users/[id]
{
  prn: "123A7009",
  department: "Electronics and Computer Science",
  year: "2023-2027"
}
```

**Advantages**:
- ✅ Admin has full control
- ✅ Can verify PRN accuracy
- ✅ Simple implementation

**Disadvantages**:
- ❌ Time-consuming for many students
- ❌ Manual data entry errors
- ❌ Doesn't scale well

---

### Option 4: Hybrid Approach (Best Solution)

**Combine all three methods**:

1. **Bulk Import** (Primary method)
   - Admin imports student list at semester start
   - Covers 90% of students

2. **Self-Service** (For new students)
   - New students complete profile on first login
   - Handles mid-semester admissions

3. **Manual Edit** (For corrections)
   - Admin can fix errors
   - Update PRN if student ID changes

---

## Recommended Implementation Plan

### Phase 1: Add PRN Editing to User Management

**Update User Management Page**:

1. Add "Edit" button to user list
2. Create edit dialog with fields:
   - PRN (text input)
   - Department (dropdown)
   - Year (text input)
3. Update API to accept PRN changes

**Code Changes**:
```typescript
// src/app/api/users/[id]/route.ts
const patchSchema = z.object({
  role: z.enum(VALID_ROLES).optional(),
  prn: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
})

// Update user
const updated = await prisma.user.update({
  where: { id },
  data: {
    ...(parsed.data.role && { role: parsed.data.role }),
    ...(parsed.data.prn && { prn: parsed.data.prn }),
    ...(parsed.data.department && { department: parsed.data.department }),
    ...(parsed.data.year && { year: parsed.data.year }),
  },
})
```

### Phase 2: Add Bulk Import Feature

**Create Bulk Import Page** (`/users/import`):

1. Upload CSV/Excel file
2. Preview data before import
3. Match by email
4. Update PRN, Department, Year

**CSV Format**:
```csv
email,prn,department,year
sohamscecs123@gst.sies.edu.in,123A7009,Electronics and Computer Science,2023-2027
student2@gst.sies.edu.in,123A7010,Computer Engineering,2023-2027
```

**API Endpoint**:
```typescript
POST /api/users/bulk-import
{
  students: [
    { email, prn, department, year },
    // ...
  ]
}

// Response:
{
  success: 150,
  failed: 2,
  errors: [
    { email: "invalid@example.com", error: "User not found" }
  ]
}
```

### Phase 3: Add Onboarding Flow (Optional)

**Create Onboarding Page** (`/onboarding`):

1. Check if user has PRN on login
2. If NULL, redirect to onboarding
3. Student fills in PRN, Department, Year
4. Validate PRN format
5. Save and redirect to dashboard

**Middleware Check**:
```typescript
// middleware.ts
if (session.user.role === 'STUDENT' && !session.user.prn) {
  if (pathname !== '/onboarding') {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }
}
```

---

## PRN Validation

### Format Validation:
```typescript
const prnSchema = z.string()
  .regex(/^[0-9]{3}[A-Z][0-9]{4}$/, 'Invalid PRN format (e.g., 123A7009)')
  .length(8, 'PRN must be 8 characters')
```

### Uniqueness Check:
```typescript
// Before saving
const existing = await prisma.user.findUnique({
  where: { prn: newPrn }
})

if (existing && existing.id !== userId) {
  throw new Error('PRN already assigned to another user')
}
```

---

## Email to PRN Mapping Strategy

### Automatic Extraction (If Possible):

Some college emails encode PRN:
```
sohamscecs123@gst.sies.edu.in
         ^^^
         Could be part of PRN?
```

**Check if pattern exists**:
- If email format is predictable, extract PRN automatically
- Example: `{name}{dept}{prn}@gst.sies.edu.in`

### Manual Mapping Table:

Create a mapping table for reference:
```typescript
// Temporary mapping during transition
const emailToPrnMap = {
  "sohamscecs123@gst.sies.edu.in": "123A7009",
  // ... more mappings
}
```

---

## Migration Script

### One-Time Data Import:

```typescript
// scripts/import-student-prns.ts
import { prisma } from '@/lib/prisma'
import { parse } from 'csv-parse/sync'
import fs from 'fs'

async function importPRNs() {
  const csvData = fs.readFileSync('students.csv', 'utf-8')
  const records = parse(csvData, { columns: true })
  
  let updated = 0
  let failed = 0
  
  for (const record of records) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: record.email }
      })
      
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            prn: record.prn,
            department: record.department,
            year: record.year,
          }
        })
        updated++
        console.log(`✅ Updated: ${record.email} → ${record.prn}`)
      } else {
        failed++
        console.log(`❌ Not found: ${record.email}`)
      }
    } catch (error) {
      failed++
      console.error(`❌ Error: ${record.email}`, error)
    }
  }
  
  console.log(`\n✅ Updated: ${updated}`)
  console.log(`❌ Failed: ${failed}`)
}

importPRNs()
```

**Run**:
```bash
npx ts-node scripts/import-student-prns.ts
```

---

## Quick Start Guide

### For Immediate Testing:

**Option A: Manual Database Update** (Quickest):
```sql
-- Update your own account
UPDATE users 
SET prn = '123A7009', 
    department = 'Electronics and Computer Science',
    year = '2023-2027'
WHERE email = 'sohamscecs123@gst.sies.edu.in';
```

**Option B: Use Prisma Studio**:
```bash
npx prisma studio
```
1. Open `User` model
2. Find your user by email
3. Edit PRN field: `123A7009`
4. Save

**Option C: API Call**:
```bash
# Get your user ID first
curl https://your-app.vercel.app/api/users/search?q=soham

# Update PRN (need to implement PATCH endpoint first)
curl -X PATCH https://your-app.vercel.app/api/users/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -d '{"prn": "123A7009", "department": "Electronics and Computer Science"}'
```

---

## Summary

### Current State:
- ❌ PRN is NULL for Microsoft SSO users
- ❌ Barcode scanning won't work
- ❌ No way to link email to PRN automatically

### Solution:
1. ✅ **Phase 1**: Add PRN editing to User Management (2-3 hours)
2. ✅ **Phase 2**: Add bulk import feature (1 day)
3. ✅ **Phase 3**: Add onboarding flow (optional, 1 day)

### Immediate Action:
1. Manually update your PRN in database for testing
2. Implement PRN editing in User Management
3. Get student list from college for bulk import

---

**Status**: 🔴 Critical Issue - Blocks barcode scanning

**Priority**: 🔥 High - Required before deployment

**Estimated Effort**: 2-3 days for complete solution

**Last Updated**: May 2, 2026
