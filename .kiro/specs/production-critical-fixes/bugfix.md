# Bugfix Requirements Document

## Introduction

This document specifies the requirements for fixing FIVE critical production bugs in the SIES GST IoT Parts Management System. These issues represent the highest-priority defects that can cause data corruption, security bypasses, race conditions, missing critical UI functionality, and untested features in production.

The system is a Next.js 15 application using TypeScript, Prisma ORM, PostgreSQL (Supabase), and NextAuth.js v5 for authentication. It manages IoT component inventory across three user roles: STUDENT, LAB_ASSISTANT, and HOD.

**Bugs Covered:**
1. **Duplicate Component Creation** - Allows duplicate inventory entries for the same physical component
2. **Stock Validation Race Condition** - TOCTOU vulnerability allows negative inventory
3. **PRN Onboarding Bypass** - OAuth users can access protected routes without completing onboarding
4. **Missing Edit/Delete Component UI** - Backend PATCH/DELETE endpoints exist but no frontend UI to invoke them
5. **Overdue-Block Validation Untested** - Overdue validation feature exists but has never been tested

---

## Bug Analysis

### Current Behavior (Defect)

#### Bug 1: Duplicate Component Creation

1.1 WHEN a user adds a component with a name and category that already exists in the database THEN the system creates a new component record instead of updating the existing one

1.2 WHEN multiple components with identical names and categories are created THEN the system displays multiple rows in the inventory table for the same component type

1.3 WHEN a component is added without uniqueness validation THEN the totalStock and availableStock are split across duplicate records instead of being consolidated

1.4 WHEN a user searches for a component that has duplicates THEN the system returns multiple results for what should be a single component

#### Bug 2: Stock Validation Race Condition

1.5 WHEN a component request is approved THEN the system checks availableStock at line 119 in `/api/requests/[id]/route.ts` PATCH handler

1.6 WHEN time passes between approval and issuance THEN other requests can be issued, depleting the availableStock to zero

1.7 WHEN the original approved request is issued THEN the system checks stock again at line 92 in `/api/requests/[id]/issue/route.ts` inside the transaction

1.8 WHEN the stock check at line 92 detects insufficient stock (availableStock < requested quantity) THEN the transaction throws an error "Insufficient stock"

1.9 WHEN the "Insufficient stock" error is thrown THEN the user sees the error message but the issuance process appears to complete in the UI, causing confusion

#### Bug 3: PRN Onboarding Bypass for OAuth Users

1.10 WHEN a user logs in via Microsoft OAuth for the first time THEN the system creates a user record with `prn: null` (line 103-112 in `/lib/auth.ts`)

1.11 WHEN the OAuth callback completes THEN the JWT callback fetches the user and sets `token.prn = dbUser.prn` which is null (line 133 in `/lib/auth.ts`)

1.12 WHEN the layout component checks `!session.user.prn` for STUDENT role THEN it should redirect to `/onboarding` (line 12 in `/(app)/layout.tsx`)

1.13 WHEN a user directly navigates to a protected route (e.g., `/return-components`) THEN the middleware does not enforce PRN validation, allowing access without onboarding

1.14 WHEN a user without a PRN attempts to return components THEN the Return Components page fails because it cannot find the user by PRN, causing an error

#### Bug 4: Missing Edit/Delete Component UI

1.15 WHEN a user views the Inventory Management page (`/inventory/manage`) THEN the Actions column only shows "Adjust Stock" button (line ~206-217)

1.16 WHEN backend PATCH endpoint exists at `/api/components/[id]` (lines 67-140) supporting updates to name, category, manufacturer, specifications, totalStock, condition, cost, storageLocation, description THEN the UI provides no way to invoke this endpoint

1.17 WHEN backend DELETE endpoint exists at `/api/components/[id]` (lines 142-200) performing soft delete (sets `isActive: false`) THEN the UI provides no way to invoke this endpoint

1.18 WHEN users discover typos in component names or incorrect data after creation THEN they cannot fix these issues via the UI

1.19 WHEN duplicate components are created (Bug #1) THEN users cannot remove the duplicates via the UI even after Bug #1 is fixed

1.20 WHEN users need to update component cost after supplier pricing changes THEN they must manually edit the database

1.21 WHEN users attempt to delete a component THEN there is no UI confirmation dialog or soft-delete explanation

#### Bug 5: Overdue-Block Validation Untested (Missing Test Coverage)

1.22 WHEN a student has an issued component with `expectedReturnDate < NOW()` and `isReturned: false` (overdue item) THEN the backend validation in `/api/requests/route.ts` (lines 128-137) should block new requests

1.23 WHEN the overdue validation code exists and appears correct THEN it has NEVER been tested because no test scenario has created overdue items

1.24 WHEN system documentation claims "students with overdue items cannot create new requests" THEN this feature has never been verified in practice

1.25 WHEN the validation code counts overdue items using Prisma query `issuedComponent.count({ where: { studentId, isReturned: false, expectedReturnDate: { lt: new Date() } } })` THEN this query logic has never been exercised

1.26 WHEN `overdueCount > 0` THEN the system should return 400 error with message "You have overdue items. Please return them first." but this path has never been tested

---

### Expected Behavior (Correct)

#### Bug 1: Duplicate Component Creation

2.1 WHEN a user adds a component with a name and category that already exists in the database THEN the system SHALL find the existing component and update its stock quantities

2.2 WHEN stock is added to an existing component THEN the system SHALL increment both totalStock and availableStock by the added quantity

2.3 WHEN stock is added to an existing component THEN the system SHALL create a StockMovement record with type "IN" documenting the stock addition

2.4 WHEN a component with a unique name and category combination is added THEN the system SHALL create a new component record with the provided details

2.5 WHEN checking for existing components THEN the system SHALL perform a case-insensitive comparison on both name and category within the same organization

#### Bug 2: Stock Validation Race Condition

2.6 WHEN a component request is approved THEN the system SHALL perform only a preliminary stock check to provide user feedback, without guaranteeing stock availability at issue time

2.7 WHEN issuing a component THEN the system SHALL perform the definitive stock validation inside the atomic transaction (line 92 in `/api/requests/[id]/issue/route.ts`)

2.8 WHEN the stock check inside the transaction detects insufficient stock (availableStock < requested quantity) THEN the system SHALL throw an error that rolls back the transaction

2.9 WHEN the transaction throws "Insufficient stock" error THEN the error handler SHALL return a 400 status with the error message, preventing the issuance from completing

2.10 WHEN the approval endpoint validates stock THEN it SHALL include a warning message that stock availability is not guaranteed until issuance

#### Bug 3: PRN Onboarding Bypass for OAuth Users

2.11 WHEN a student without a PRN value attempts to access any protected route under `(app)/` THEN the system SHALL redirect them to `/onboarding` via the layout gatekeeper

2.12 WHEN middleware processes a request to a protected route THEN it SHALL enforce PRN validation for STUDENT role, redirecting to `/onboarding` if PRN is null

2.13 WHEN a student completes the onboarding form and submits a valid PRN THEN the system SHALL update the user record with the PRN value

2.14 WHEN a student with a valid PRN navigates to any protected route THEN the system SHALL allow access without redirection

2.15 WHEN a LAB_ASSISTANT or HOD user accesses protected routes THEN the system SHALL NOT require PRN validation (PRN is STUDENT-only requirement)

#### Bug 4: Missing Edit/Delete Component UI

2.16 WHEN a user with LAB_ASSISTANT, HOD, or ADMIN role views the Inventory Management page THEN the Actions column SHALL display three buttons: "Edit", "Delete", and "Adjust Stock"

2.17 WHEN a user clicks the Edit button THEN the system SHALL open a dialog with a form pre-populated with the component's current details (name, category, manufacturer, specifications, cost, storage location, condition, description)

2.18 WHEN a user modifies component fields in the Edit dialog and submits THEN the system SHALL call PATCH `/api/components/[id]` with the updated fields

2.19 WHEN the PATCH request succeeds THEN the system SHALL show a success toast message and refresh the component list

2.20 WHEN a user clicks the Delete button THEN the system SHALL open a confirmation dialog explaining that this is a soft delete (sets `isActive: false`) and cannot be undone via UI

2.21 WHEN a user confirms deletion THEN the system SHALL call DELETE `/api/components/[id]`

2.22 WHEN the DELETE request succeeds THEN the system SHALL show a success toast message and refresh the component list (hiding the deleted component)

2.23 WHEN the DELETE request fails (e.g., component has active requests) THEN the system SHALL show an error toast with the backend error message

2.24 WHEN editing totalStock and the new value is less than currently issued quantity THEN the backend SHALL reject the update with appropriate error message (already implemented)

#### Bug 5: Overdue-Block Validation Untested (Test Coverage Verification)

2.25 WHEN a test creates an issued component with `expectedReturnDate` set to yesterday THEN the component SHALL be considered overdue

2.26 WHEN a test attempts to create a new request for a student with overdue items THEN the POST /api/requests endpoint SHALL return 400 error with message "You have overdue items. Please return them first."

2.27 WHEN the overdue validation query executes THEN it SHALL correctly count items where `isReturned: false AND expectedReturnDate < NOW()`

2.28 WHEN a student has overdue items but then returns them (sets `isReturned: true`) THEN subsequent requests SHALL be allowed (overdueCount becomes 0)

2.29 WHEN a student has issued items that are NOT overdue (expectedReturnDate > NOW()) THEN requests SHALL be allowed (overdueCount is 0)

---

### Unchanged Behavior (Regression Prevention)

#### Bug 1: Duplicate Component Creation

3.1 WHEN a component with a truly unique name or category is added THEN the system SHALL CONTINUE TO create a new component record as before

3.2 WHEN a component is created or updated THEN the system SHALL CONTINUE TO create an AuditLog entry recording the action

3.3 WHEN a component is created or updated THEN the system SHALL CONTINUE TO create a StockMovement entry tracking the stock change

3.4 WHEN a component is created or updated THEN the system SHALL CONTINUE TO return the complete component object in the API response

3.5 WHEN components are listed via the GET endpoint THEN the system SHALL CONTINUE TO display all components with their current stock levels

3.6 WHEN creating a component fails validation THEN the system SHALL CONTINUE TO return appropriate error responses with validation details

3.7 WHEN a user without proper authorization attempts to create a component THEN the system SHALL CONTINUE TO return a 401 Unauthorized response

#### Bug 2: Stock Validation Race Condition

3.8 WHEN a single issue request is processed with sufficient stock available THEN the system SHALL CONTINUE TO complete the transaction successfully

3.9 WHEN the issue transaction succeeds THEN the system SHALL CONTINUE TO decrement availableStock, create IssuedComponent record, update request status, create StockMovement and AuditLog entries, and send notification

3.10 WHEN the issue transaction completes THEN the system SHALL CONTINUE TO return a success response with the issued component details

3.11 WHEN the approval endpoint rejects a request due to insufficient stock THEN the system SHALL CONTINUE TO return a 400 error with "Insufficient quantity available" message

#### Bug 3: PRN Onboarding Bypass for OAuth Users

3.12 WHEN a student with a valid PRN already set accesses any protected route THEN the system SHALL CONTINUE TO render the requested page without redirecting to onboarding

3.13 WHEN a LAB_ASSISTANT or HOD user accesses protected routes THEN the system SHALL CONTINUE TO allow access without requiring PRN validation

3.14 WHEN Microsoft OAuth sign-in completes THEN the system SHALL CONTINUE TO create user records with role "STUDENT" by default

3.15 WHEN JWT callback processes the token THEN the system SHALL CONTINUE TO fetch user data from the database and populate the token with user properties

3.16 WHEN session is created THEN the system SHALL CONTINUE TO use JWT strategy as configured

#### Bug 4: Missing Edit/Delete Component UI

3.17 WHEN the "Adjust Stock" button is clicked THEN the system SHALL CONTINUE TO open the Adjust Stock dialog and function exactly as before

3.18 WHEN components are listed via GET /api/components THEN the system SHALL CONTINUE TO return all components with their current details

3.19 WHEN the backend PATCH endpoint receives a request THEN it SHALL CONTINUE TO validate data, enforce authorization, update components, and create audit logs exactly as before

3.20 WHEN the backend DELETE endpoint receives a request THEN it SHALL CONTINUE TO check for active requests, perform soft delete, and create audit logs exactly as before

3.21 WHEN a component is created via the Add Component dialog THEN the system SHALL CONTINUE TO function exactly as before

3.22 WHEN components are searched/filtered THEN the system SHALL CONTINUE TO function exactly as before

3.23 WHEN stock status badges are displayed THEN the system SHALL CONTINUE TO show "Out of Stock", "Low Stock", or "In Stock" based on availableStock

3.24 WHEN a user without LAB_ASSISTANT, HOD, or ADMIN role attempts Edit or Delete THEN the backend SHALL CONTINUE TO return 401 Unauthorized (authorization enforcement unchanged)

#### Bug 5: Overdue-Block Validation Untested (Test Coverage Verification)

3.25 WHEN the overdue validation code in `/api/requests/route.ts` (lines 128-137) is tested THEN it SHALL CONTINUE TO function exactly as implemented (no code changes required)

3.26 WHEN a student WITHOUT overdue items creates a request THEN the system SHALL CONTINUE TO process the request normally

3.27 WHEN request creation succeeds THEN the system SHALL CONTINUE TO create ComponentRequest, AuditLog, and Notification records as before

3.28 WHEN request creation validation fails (e.g., insufficient stock) THEN the system SHALL CONTINUE TO return appropriate error messages as before