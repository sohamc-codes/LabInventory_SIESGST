# Implementation Plan

## Bug 1: Duplicate Component Creation

- [ ] 1. Write bug condition exploration test for Bug 1
  - **Property 1: Bug Condition** - Duplicate Component Detection and Stock Update
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the duplicate creation bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases:
    - Create "Raspberry Pi 5" with category "MICROCONTROLLER" and totalStock 10
    - Create "Raspberry Pi 5" with category "MICROCONTROLLER" and totalStock 5 again
    - Verify that two separate component records exist in the database (bug condition)
  - Test implementation details from Bug Condition in design:
    - Use Prisma client to create component twice with same name/category/organizationId
    - Query database for components matching name="Raspberry Pi 5" and category="MICROCONTROLLER"
    - Assert that query returns 2 records instead of 1 (current buggy behavior)
    - Assert that totalStock values are split (10 and 5) instead of consolidated (15)
  - The test assertions should match the Expected Behavior Properties from design:
    - After fix: should find only 1 component record
    - After fix: totalStock should be 15 (consolidated)
    - After fix: StockMovement records should show two "IN" entries
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause:
    - Record the two component IDs created
    - Record the split stock quantities
    - Verify no findFirst query was executed before second create
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Write preservation property tests for Bug 1 (BEFORE implementing fix)
  - **Property 2: Preservation** - Unique Component Creation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - Test 1: Create component with unique name "Arduino Mega", category "MICROCONTROLLER" → observe new component created
    - Test 2: Create component with existing name "Arduino Uno" but different category "MODULE" → observe new component created
    - Test 3: Create component with same name/category in different organization → observe separate components created
    - Test 4: Attempt component creation without proper role (e.g., STUDENT role) → observe 401 Unauthorized
    - Test 5: Attempt component creation with invalid data (missing name) → observe 400 Validation Error
    - Test 6: Create valid component → observe AuditLog entry with action "CREATE_COMPONENT"
    - Test 7: Create valid component → observe StockMovement entry with type "IN" and reason "Initial stock"
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - Property: For all components with unique name OR unique category OR different organizationId, creation produces new component record
    - Property: For all authorization failures, response is 401 with "Unauthorized" error
    - Property: For all validation failures, response is 400 with validation error details
    - Property: For all successful creations, AuditLog entry exists with CREATE_COMPONENT action
    - Property: For all successful creations, StockMovement entry exists with type "IN"
  - Property-based testing generates many test cases for stronger guarantees:
    - Generate random unique component names (e.g., "Component_" + random_id)
    - Generate random categories from valid enum values
    - Generate random stock quantities (0 to 1000)
    - Verify each creation produces a new unique component ID
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 3. Fix for Bug 1 - duplicate component prevention

  - [ ] 3.1 Implement the duplicate check and stock update logic
    - File: `src/app/api/components/route.ts`
    - Add duplicate check query after validation and organization setup:
      ```typescript
      const existingComponent = await prisma.component.findFirst({
        where: {
          name: { equals: validatedData.name, mode: 'insensitive' },
          category: { equals: validatedData.category, mode: 'insensitive' },
          organizationId: organization.id,
          isActive: true,
        },
      })
      ```
    - Add conditional branching to decide between update and create:
      ```typescript
      let component
      if (existingComponent) {
        // Update existing component stock
      } else {
        // Create new component (existing logic)
      }
      ```
    - Implement stock update logic for existing components:
      ```typescript
      component = await prisma.component.update({
        where: { id: existingComponent.id },
        data: {
          totalStock: existingComponent.totalStock + validatedData.totalStock,
          availableStock: existingComponent.availableStock + validatedData.totalStock,
        },
      })
      ```
    - Update AuditLog action to differentiate between create and update:
      ```typescript
      action: existingComponent ? 'UPDATE_COMPONENT_STOCK' : 'CREATE_COMPONENT'
      ```
    - Update StockMovement reason for clarity:
      ```typescript
      reason: existingComponent ? 'Stock addition' : 'Initial stock'
      ```
    - Preserve all existing error handling (try-catch blocks for audit logs and stock movements)
    - Return the component (updated or created) with 201 status
    - _Bug_Condition: isBugCondition1(input) where existingComponent(input.name, input.category, input.organizationId) is not null_
    - _Expected_Behavior: Find existing component, update totalStock and availableStock by adding new quantity, create StockMovement with type "IN"_
    - _Preservation: For unique components, create new record with same behavior as before; maintain all error handling, authorization checks, and response formats_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 3.2 Verify bug condition exploration test now passes for Bug 1
    - **Property 1: Expected Behavior** - Duplicate Component Detection and Stock Update
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify test assertions:
      - Only 1 component record exists for "Raspberry Pi 5" + "MICROCONTROLLER"
      - totalStock equals 15 (10 + 5 consolidated)
      - availableStock equals 15 (10 + 5 consolidated)
      - Two StockMovement records exist with type "IN" (one for initial 10, one for addition of 5)
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ] 3.3 Verify preservation tests still pass for Bug 1
    - **Property 2: Preservation** - Unique Component Creation
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify all preservation test assertions:
      - Unique components still create new records
      - Different categories still create separate components
      - Different organizations maintain separate inventories
      - Authorization failures still return 401
      - Validation failures still return 400
      - AuditLog entries still created correctly
      - StockMovement entries still created correctly
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

---

## Bug 2: Stock Validation Race Condition

- [ ] 4. Write bug condition exploration test for Bug 2
  - **Property 3: Bug Condition** - Stock Validation TOCTOU Race Condition
  - **CRITICAL**: This test MUST demonstrate the TOCTOU gap on unfixed code
  - **DO NOT attempt to fix the test or the code when it demonstrates the race condition**
  - **NOTE**: This test encodes the expected behavior - clear error messaging when stock depleted after approval
  - **GOAL**: Surface counterexamples demonstrating TOCTOU vulnerability
  - **Test Approach**: Simulate sequential stock depletion scenario:
    - Setup: Create component "Arduino Uno" with availableStock = 5
    - Step 1: Create and approve request #1 for qty=5 (approval passes: 5 >= 5)
    - Step 2: Create and immediately issue request #2 for qty=3 (stock decrements to 2)
    - Step 3: Attempt to issue request #1 (stock check fails: 2 < 5)
    - **EXPECTED OUTCOME on UNFIXED code**: 
      - Issue endpoint throws "Insufficient stock: 2 available, 5 requested"
      - Error message does NOT mention "depleted since approval time"
      - User is confused why approved request can't be issued
  - Test implementation details:
    - Use Prisma client to create component and requests
    - Call PATCH /api/requests/[id] with status=APPROVED for both requests
    - Call POST /api/requests/[id2]/issue immediately for request #2
    - Call POST /api/requests/[id1]/issue for request #1
    - Assert that issue call returns 400 error
    - Verify error message clarity (on unfixed code, message won't explain TOCTOU)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test demonstrates TOCTOU gap and unclear error messaging
  - Document findings:
    - Record that approval succeeded but issuance failed
    - Record that error message doesn't explain stock was depleted after approval
    - Verify transaction correctly prevented negative inventory (this part is already working)
  - Mark task complete when test is written, run, and TOCTOU gap is documented
  - _Requirements: 1.5, 1.6, 1.7, 1.8, 1.9_

- [ ] 5. Write preservation property tests for Bug 2 (BEFORE implementing fix)
  - **Property 4: Preservation** - Successful Issuance Flow
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for successful issuance scenarios:
    - Test 1: Create component with availableStock=10, approve request for qty=5, issue immediately → observe successful issuance
    - Test 2: Verify availableStock decremented by 5 (10 → 5)
    - Test 3: Verify IssuedComponent record created with correct quantity
    - Test 4: Verify ComponentRequest status updated to ISSUED
    - Test 5: Verify StockMovement record created with type "OUT"
    - Test 6: Verify AuditLog entry created with action "ISSUE_COMPONENT"
    - Test 7: Verify student notification sent with success message
    - Test 8: Verify response has 200 status with success: true
  - Write property-based tests capturing successful issuance behavior:
    - Property: For all requests with sufficient stock at issue time, issuance completes successfully
    - Property: For all successful issuances, stock decrements correctly
    - Property: For all successful issuances, all side effects occur (IssuedComponent, status update, notifications)
    - Property: For all successful issuances, transaction commits atomically
  - Property-based testing generates many scenarios:
    - Generate random component stock levels (10 to 100)
    - Generate random request quantities (1 to 10)
    - Verify issuance succeeds when quantity <= availableStock
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline successful issuance behavior)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.8, 3.9, 3.10, 3.11_

- [ ] 6. Fix for Bug 2 - improve TOCTOU error messaging

  - [ ] 6.1 Improve error message clarity in issue endpoint
    - File: `src/app/api/requests/[id]/issue/route.ts`
    - Locate the stock validation inside transaction (line ~92)
    - Update error message to clarify TOCTOU scenario:
      ```typescript
      if (component.availableStock < componentRequest.quantity) {
        throw new Error(
          `Insufficient stock: ${component.availableStock} available, ${componentRequest.quantity} requested. ` +
          `Stock may have been depleted since approval time.`
        )
      }
      ```
    - **DO NOT CHANGE** the transaction structure or validation logic - it is already correct
    - The fix is purely about error message clarity
    - _Bug_Condition: isBugCondition2(request, timeline) where stock depleted between approval and issuance_
    - _Expected_Behavior: Transaction-protected validation catches insufficient stock and throws clear error explaining TOCTOU_
    - _Preservation: Successful issuance flow with sufficient stock unchanged; transaction rollback behavior unchanged_
    - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 3.8, 3.9, 3.10, 3.11_

  - [ ] 6.2 Add warning log in approval endpoint
    - File: `src/app/api/requests/[id]/route.ts`
    - Locate the approval-time stock validation (line ~119)
    - Add warning log after stock check passes:
      ```typescript
      if (validatedData.status === 'APPROVED') {
        if (currentRequest.component.availableStock < currentRequest.quantity) {
          return NextResponse.json(
            { error: 'Insufficient quantity available' },
            { status: 400 }
          )
        }
        // ADD: Warning that stock isn't guaranteed until issuance
        console.log(`WARNING: Approved request ${id} - stock available now but not guaranteed until issue time`)
      }
      ```
    - This helps developers understand the TOCTOU gap exists by design
    - _Requirements: 2.6, 2.10_

  - [ ] 6.3 Verify bug condition exploration test behavior improves for Bug 2
    - **Property 3: Expected Behavior** - Clear TOCTOU Error Messaging
    - **IMPORTANT**: Re-run the SAME test from task 4 - do NOT write a new test
    - The test from task 4 demonstrates the TOCTOU scenario
    - When this test runs with the fix, verify improved error messaging
    - Run bug condition exploration test from step 4
    - **EXPECTED OUTCOME**: Test still demonstrates TOCTOU gap (by design) BUT error message is clearer
    - Verify test outcomes:
      - Issue endpoint still returns 400 error (correct behavior)
      - Error message now contains "Stock may have been depleted since approval time"
      - Transaction still correctly rolls back (prevents negative inventory)
      - User understands why approved request can't be issued
    - **NOTE**: The TOCTOU gap is not eliminated - it's a fundamental characteristic of the two-phase workflow
    - The fix is about clarity, not eliminating the gap
    - _Requirements: 2.6, 2.7, 2.8, 2.9_

  - [ ] 6.4 Verify preservation tests still pass for Bug 2
    - **Property 4: Preservation** - Successful Issuance Flow
    - **IMPORTANT**: Re-run the SAME tests from task 5 - do NOT write new tests
    - Run preservation property tests from step 5
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify all preservation test assertions:
      - Issuance with sufficient stock still completes successfully
      - Stock still decrements correctly
      - IssuedComponent still created with correct data
      - Request status still updates to ISSUED
      - StockMovement and AuditLog still created
      - Notifications still sent
      - Response format still unchanged
    - _Requirements: 3.8, 3.9, 3.10, 3.11_

---

## Bug 3: PRN Onboarding Bypass

- [ ] 7. Write bug condition exploration test for Bug 3
  - **Property 5: Bug Condition** - PRN Enforcement in Middleware
  - **CRITICAL**: This test MUST demonstrate the onboarding bypass on unfixed code
  - **DO NOT attempt to fix the test or the code when it demonstrates the bypass**
  - **NOTE**: This test encodes the expected behavior - middleware should redirect before route access
  - **GOAL**: Surface counterexamples demonstrating PRN onboarding bypass
  - **Test Approach**: Simulate OAuth user with null PRN attempting direct navigation:
    - Setup: Create STUDENT user with prn=null (simulating OAuth creation)
    - Create session with user.role="STUDENT" and user.prn=null
    - Step 1: Mock a request to protected route `/return-components`
    - Step 2: Verify middleware behavior (on unfixed code, middleware may not redirect)
    - Step 3: Verify layout redirect behavior (may execute too late)
    - **EXPECTED OUTCOME on UNFIXED code**:
      - Middleware allows request through without PRN validation
      - Layout redirect may trigger but only after page starts rendering
      - Page may error because user.prn is null
  - Test implementation details:
    - Create test user with prn=null via Prisma
    - Mock NextAuth session with this user
    - Make request to `/return-components` or other protected route
    - Verify middleware doesn't enforce PRN validation (on unfixed code)
    - Verify layout redirect exists but may be bypassed
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test demonstrates middleware bypass
  - Document findings:
    - Record that middleware allows access without PRN
    - Record that layout redirect is reactive, not proactive
    - Verify that OAuth user creation sets prn=null (this is correct and expected)
  - Mark task complete when test is written, run, and bypass is documented
  - _Requirements: 1.10, 1.11, 1.12, 1.13, 1.14_

- [ ] 8. Write preservation property tests for Bug 3 (BEFORE implementing fix)
  - **Property 6: Preservation** - Valid Session Access
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for valid session access:
    - Test 1: Create STUDENT user with prn="2023001" → verify access to all protected routes allowed
    - Test 2: Create LAB_ASSISTANT user with prn=null → verify access allowed (PRN not required for LAB_ASSISTANT)
    - Test 3: Create HOD user with prn=null → verify access allowed (PRN not required for HOD)
    - Test 4: Verify Microsoft OAuth flow creates user with prn=null (expected behavior)
    - Test 5: Verify JWT callback fetches user data and populates token (expected behavior)
    - Test 6: Verify session strategy is JWT (expected behavior)
  - Write property-based tests capturing valid access behavior:
    - Property: For all STUDENT users with valid PRN, all protected routes allow access
    - Property: For all LAB_ASSISTANT/HOD users, all protected routes allow access regardless of PRN
    - Property: For all OAuth sign-ins, user record is created with correct default values
    - Property: For all sessions, JWT callback populates token correctly
  - Property-based testing generates many scenarios:
    - Generate random PRN values (valid format)
    - Generate random user roles
    - Generate random protected route paths
    - Verify access allowed for valid sessions
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline valid access behavior)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.12, 3.13, 3.14, 3.15, 3.16_

- [ ] 9. Fix for Bug 3 - enforce PRN validation in middleware

  - [ ] 9.1 Add PRN enforcement to middleware
    - File: `src/middleware.ts`
    - Add PRN validation logic before existing route matching:
      ```typescript
      // Enforce PRN requirement for STUDENT role
      if (session?.user?.role === 'STUDENT' && !session.user.prn) {
        // Check if this is a protected route
        const isProtectedRoute = 
          request.nextUrl.pathname.startsWith('/(app)') || 
          (!request.nextUrl.pathname.startsWith('/onboarding') && 
           !request.nextUrl.pathname.startsWith('/api') &&
           !request.nextUrl.pathname.startsWith('/_next'))
        
        if (isProtectedRoute && request.nextUrl.pathname !== '/onboarding') {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      }
      ```
    - Preserve all existing middleware logic unchanged
    - This makes middleware the primary PRN enforcement point
    - Layout redirect remains as a backup but middleware prevents bypass
    - _Bug_Condition: isBugCondition3(session, route) where session.user.role="STUDENT" and session.user.prn=null_
    - _Expected_Behavior: Middleware redirects to /onboarding before route renders_
    - _Preservation: Valid sessions (PRN present or non-STUDENT) continue to access routes normally; OAuth flow unchanged; JWT callback unchanged_
    - _Requirements: 2.11, 2.12, 2.13, 2.14, 2.15, 3.12, 3.13, 3.14, 3.15, 3.16_

  - [ ] 9.2 Verify bug condition exploration test now passes for Bug 3
    - **Property 5: Expected Behavior** - PRN Enforcement in Middleware
    - **IMPORTANT**: Re-run the SAME test from task 7 - do NOT write a new test
    - The test from task 7 attempts to access protected routes with null PRN
    - When this test runs with the fix, verify middleware redirect occurs
    - Run bug condition exploration test from step 7
    - **EXPECTED OUTCOME**: Test shows middleware redirect prevents route access
    - Verify test outcomes:
      - Middleware intercepts request before route renders
      - Response is redirect (302 or 307) to /onboarding
      - Protected route never executes
      - User cannot bypass onboarding by direct navigation
    - _Requirements: 2.11, 2.12, 2.13, 2.14_

  - [ ] 9.3 Verify preservation tests still pass for Bug 3
    - **Property 6: Preservation** - Valid Session Access
    - **IMPORTANT**: Re-run the SAME tests from task 8 - do NOT write new tests
    - Run preservation property tests from step 8
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify all preservation test assertions:
      - STUDENT with valid PRN still accesses all protected routes
      - LAB_ASSISTANT still accesses all routes without PRN requirement
      - HOD still accesses all routes without PRN requirement
      - OAuth flow still creates users correctly
      - JWT callback still populates token correctly
      - Session strategy still uses JWT
    - _Requirements: 3.12, 3.13, 3.14, 3.15, 3.16_

---

## Final Checkpoint

- [ ] 10. Ensure all tests pass for all three bugs
  - Run complete test suite including:
    - Bug 1: Duplicate component exploration and preservation tests
    - Bug 2: Stock validation TOCTOU exploration and preservation tests
    - Bug 3: PRN onboarding exploration and preservation tests
  - Verify no regressions in related functionality:
    - GET /api/components still returns correct component lists
    - Component requests and issuance workflows still work
    - Stock movements are tracked correctly
    - OAuth authentication flow still works
    - Session management still functions correctly
  - Test edge cases:
    - Bug 1: Concurrent duplicate creation requests
    - Bug 1: Case-insensitive matching works correctly
    - Bug 2: Multiple concurrent issuance requests to same component
    - Bug 2: Error messages are clear and helpful
    - Bug 3: Direct navigation, bookmarked URLs, middleware timing
    - Bug 3: All three roles (STUDENT, LAB_ASSISTANT, HOD) access works
  - If any issues arise, document them and ask the user for guidance
  - Ensure all tests pass before marking as complete
