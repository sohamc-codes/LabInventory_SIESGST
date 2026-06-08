# Trust, but Verify - Onboarding & Verification System

## Overview

This document describes the "Trust, but Verify" onboarding flow implementation for the IoT Lab Parts Management system. This system allows students who are not in the bulk import list to self-register their PRN, with a verification step by lab staff.

## System Architecture

### Two Paths to PRN Registration

1. **Bulk Import (Verified)** - Lab staff uploads CSV with student data
   - Sets `isPrnVerified: true`
   - Students can immediately issue components
   - Recommended for known students

2. **Self-Service Onboarding (Unverified)** - Students enter their own PRN
   - Sets `isPrnVerified: false`
   - Requires verification by lab staff before issuing components
   - Used for students not in bulk import

## Database Schema

### User Model Fields

```prisma
model User {
  prn            String?   @unique  // Student PRN (8 alphanumeric)
  isPrnVerified  Boolean   @default(false)  // Verification status
  onboardedAt    DateTime?  // When self-onboarding completed
  // ... other fields
}
```

## Implementation Components

### 1. Onboarding Page (`/onboarding`)

**File**: `src/app/onboarding/page.tsx`

**Purpose**: Self-service form for students to enter their PRN, department, and year

**Features**:
- PRN validation (8 alphanumeric characters, e.g., "123A7009")
- Department dropdown (Computer Engineering, IT, Electronics, etc.)
- Academic year dropdown (FE, SE, TE, BE)
- Warning notice about verification requirement
- Auto-redirects if already onboarded or not a student

**Access**: Only STUDENT role with null PRN

### 2. Onboarding API (`/api/users/onboard`)

**File**: `src/app/api/users/onboard/route.ts`

**Method**: POST

**Request Body**:
```json
{
  "prn": "123A7009",
  "department": "Computer Engineering",
  "year": "TE"
}
```

**Validation**:
- PRN must be exactly 8 alphanumeric characters
- PRN must not be taken by another user
- Only students can use this endpoint

**Response**:
```json
{
  "message": "Onboarding completed successfully",
  "user": {
    "id": "...",
    "prn": "123A7009",
    "department": "Computer Engineering",
    "year": "TE",
    "isPrnVerified": false
  }
}
```

**Audit Log**: Creates `SELF_ONBOARD` audit entry

### 3. Onboarding Gatekeeper

**File**: `src/app/(app)/layout.tsx`

**Purpose**: Redirect STUDENT users with null PRN to `/onboarding`

**Logic**:
```typescript
if (session?.user?.role === 'STUDENT' && !session.user.prn) {
  redirect('/onboarding')
}
```

**Effect**: Students cannot access any app pages until they complete onboarding

### 4. Verification API (`/api/users/[id]/verify`)

**File**: `src/app/api/users/[id]/verify/route.ts`

**Method**: POST

**Purpose**: Allow lab staff to verify a student's PRN

**Authorization**: Only LAB_ASSISTANT, HOD, ADMIN, OWNER

**Request**: No body required

**Response**:
```json
{
  "message": "Student verified successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "prn": "123A7009",
    "isPrnVerified": true
  }
}
```

**Validation**:
- User must exist
- User must be a STUDENT
- User must have a PRN
- User must not already be verified

**Audit Log**: Creates `VERIFY_STUDENT_PRN` audit entry with verifier details

### 5. Scanner Student API (`/api/scanner/student`)

**File**: `src/app/api/scanner/student/route.ts`

**Method**: POST

**Purpose**: Look up student by PRN (used by barcode scanner)

**Request Body**:
```json
{
  "prn": "123A7009"
}
```

**Response**:
```json
{
  "student": {
    "id": "...",
    "name": "John Doe",
    "prn": "123A7009",
    "email": "john@sies.edu",
    "department": "Computer Engineering",
    "year": "TE",
    "isPrnVerified": true
  }
}
```

**Authorization**: Only LAB_ASSISTANT, HOD, ADMIN

### 6. User Search API Update

**File**: `src/app/api/users/search/route.ts`

**Change**: Added `isPrnVerified` to response

**Purpose**: Include verification status in manual student search results

### 7. Issue Components Page Update

**File**: `src/app/issue-components/page.tsx`

**Changes**:
- Added `isPrnVerified` to Student interface
- Added verification warning card when `isPrnVerified: false`
- Added "Verify Student" button in warning card
- Added `handleVerify()` function to call verification API

**UI Flow**:
1. Lab assistant scans student ID
2. If unverified, amber warning card appears
3. Lab assistant clicks "Verify Student" button
4. Student is verified, warning disappears
5. Lab assistant can now issue components

### 8. Parts Issued Page Update

**File**: `src/components/parts-issued/parts-issued-client.tsx`

**Changes**:
- Added verification status badge (Verified / Not Verified)
- Added verification warning card when `isPrnVerified: false`
- Added "Verify Student" button in warning card
- Added `handleVerify()` function to call verification API

**UI Flow**:
1. Lab assistant scans student ID for return
2. If unverified, amber warning card appears
3. Lab assistant clicks "Verify Student" button
4. Student is verified, warning disappears
5. Lab assistant can process returns

## User Flows

### Flow 1: Bulk Import (Verified Path)

1. Lab staff uploads CSV with student data
2. API sets `isPrnVerified: true` for all imported students
3. Student logs in with Microsoft SSO
4. Student is NOT redirected to onboarding (PRN already set)
5. Student can immediately request and use components
6. Lab staff can issue components without verification step

### Flow 2: Self-Service Onboarding (Unverified Path)

1. Student logs in with Microsoft SSO (first time)
2. Student has no PRN → redirected to `/onboarding`
3. Student enters PRN, department, year
4. API sets `isPrnVerified: false`
5. Student can now access app and make requests
6. When lab staff scans student ID:
   - Amber warning appears: "PRN Not Verified"
   - Lab staff checks physical ID card
   - Lab staff clicks "Verify Student"
   - Student is now verified (`isPrnVerified: true`)
7. Future transactions require no verification

### Flow 3: Verification During Issue

```
┌─────────────────────────────────────────────────────────────┐
│ Lab Assistant: Issue Components Page                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Scan student ID (PRN: 123A7009)                         │
│ 2. Student card appears                                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ⚠️  PRN Not Verified                                 │   │
│ │                                                       │   │
│ │ This student's PRN has not been verified yet.        │   │
│ │ Please verify their ID card before issuing.          │   │
│ │                                                       │   │
│ │ [✓ Verify Student]                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ 3. Lab assistant checks physical ID card                   │
│ 4. Lab assistant clicks "Verify Student"                   │
│ 5. Warning disappears, student is verified                 │
│ 6. Lab assistant issues component                          │
└─────────────────────────────────────────────────────────────┘
```

### Flow 4: Verification During Return

```
┌─────────────────────────────────────────────────────────────┐
│ Lab Assistant: Parts Issued Page                            │
├─────────────────────────────────────────────────────────────┤
│ 1. Scan student ID (PRN: 123A7009)                         │
│ 2. Student info appears with badge: "Not Verified"         │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ⚠️  PRN Not Verified                                 │   │
│ │                                                       │   │
│ │ This student's PRN has not been verified yet.        │   │
│ │ Please verify their ID card before processing.       │   │
│ │                                                       │   │
│ │ [✓ Verify Student]                                   │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ 3. Lab assistant checks physical ID card                   │
│ 4. Lab assistant clicks "Verify Student"                   │
│ 5. Badge changes to "Verified", warning disappears         │
│ 6. Lab assistant processes return                          │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

### PRN Validation

- **Format**: Exactly 8 alphanumeric characters (e.g., "123A7009")
- **Uniqueness**: PRN must be unique across all users
- **Case**: Converted to uppercase on input

### Authorization

- **Onboarding**: Only STUDENT role can self-onboard
- **Verification**: Only LAB_ASSISTANT, HOD, ADMIN, OWNER can verify
- **Scanner**: Only LAB_ASSISTANT, HOD, ADMIN can scan

### Audit Trail

All actions are logged in the `AuditLog` table:
- `SELF_ONBOARD` - Student completes onboarding
- `VERIFY_STUDENT_PRN` - Lab staff verifies student
- `BULK_IMPORT_PRN` - Lab staff imports student data

## UI Components

### Verification Warning Card

**Appearance**: Amber background with warning icon

**Content**:
- Title: "PRN Not Verified"
- Message: "This student's PRN has not been verified yet. Please verify their ID card before [issuing/processing]."
- Button: "Verify Student"

**Behavior**:
- Only shown when `isPrnVerified: false`
- Button calls `/api/users/[id]/verify`
- On success, updates local state and shows success toast
- Warning disappears after verification

### Verification Status Badge

**Location**: Parts Issued page, next to student name

**Variants**:
- ✓ Verified (green, secondary variant)
- ⚠️ Not Verified (amber, outline variant)

## Testing Scenarios

### Scenario 1: New Student Self-Onboarding

1. Create new Microsoft SSO user (no PRN in database)
2. Login → should redirect to `/onboarding`
3. Enter PRN "123A7009", department "Computer Engineering", year "TE"
4. Submit → should redirect to `/dashboard/student`
5. Check database: `isPrnVerified` should be `false`

### Scenario 2: Lab Staff Verification

1. Login as LAB_ASSISTANT
2. Go to Issue Components page
3. Scan unverified student PRN
4. Verify warning card appears
5. Click "Verify Student"
6. Verify success toast appears
7. Verify warning disappears
8. Check database: `isPrnVerified` should be `true`

### Scenario 3: Bulk Import Verification

1. Login as LAB_ASSISTANT
2. Go to Import PRN List page
3. Upload CSV with student data
4. Check database: `isPrnVerified` should be `true` for all imported students
5. Scan imported student PRN
6. Verify NO warning card appears

### Scenario 4: Duplicate PRN Prevention

1. Login as STUDENT with no PRN
2. Go to onboarding page
3. Enter PRN that already exists
4. Submit → should show error "This PRN is already registered to another user"

## Configuration

### Environment Variables

No additional environment variables required.

### Database Migration

Run Prisma migration to add `isPrnVerified` field:

```bash
npx prisma db push
```

### Dependencies

No additional dependencies required (uses existing packages).

## Troubleshooting

### Issue: Student stuck on onboarding page

**Cause**: Session not updated after onboarding

**Solution**: Call `await update()` in onboarding page after successful API call

### Issue: Verification button not working

**Cause**: Missing authorization or student already verified

**Solution**: Check API response error message, verify user role and student status

### Issue: Warning card not disappearing after verification

**Cause**: Local state not updated

**Solution**: Update student state with `setStudent((prev) => prev ? { ...prev, isPrnVerified: true } : null)`

## Future Enhancements

1. **Batch Verification**: Allow lab staff to verify multiple students at once
2. **Verification History**: Show who verified each student and when
3. **Verification Expiry**: Require re-verification after a certain period
4. **Photo Verification**: Upload photo of student ID card during verification
5. **Notification**: Send email/notification to student when verified

## Related Documentation

- [Bulk PRN Import Guide](./BULK_PRN_IMPORT_GUIDE.md)
- [PRN Linking Solution](./PRN_LINKING_SOLUTION.md)
- [User Roles Guide](./USER_ROLES_GUIDE.md)
- [Barcode Scanning Guide](./BARCODE_SCANNING_GUIDE.md)

## Summary

The "Trust, but Verify" system provides a flexible onboarding flow that:
- ✅ Allows students to self-register when not in bulk import
- ✅ Maintains security through lab staff verification
- ✅ Provides clear visual warnings for unverified students
- ✅ Enables one-click verification during normal workflow
- ✅ Creates comprehensive audit trail
- ✅ Supports both bulk import and self-service paths

This system balances user convenience with security requirements, ensuring that all students can access the system while maintaining verification standards.
