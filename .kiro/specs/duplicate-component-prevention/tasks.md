# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Duplicate Component Detection and Stock Update
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to concrete failing cases:
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

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
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

- [ ] 3. Fix for duplicate component prevention

  - [ ] 3.1 Implement the duplicate check and stock update logic
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
    - _Bug_Condition: isBugCondition(input) where existingComponent(input.name, input.category, input.organizationId) is not null_
    - _Expected_Behavior: Find existing component, update totalStock and availableStock by adding new quantity, create StockMovement with type "IN"_
    - _Preservation: For unique components, create new record with same behavior as before; maintain all error handling, authorization checks, and response formats_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 3.2 Verify bug condition exploration test now passes
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
    - _Requirements: Expected Behavior Properties from design (2.1, 2.2, 2.3, 2.5)_

  - [ ] 3.3 Verify preservation tests still pass
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
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: Preservation Requirements from design (3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7)_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run complete test suite including:
    - Bug condition exploration test (should now pass)
    - Preservation property tests (should still pass)
    - Any existing unit/integration tests for components API
  - Verify no regressions in related functionality:
    - GET /api/components still returns correct component lists
    - Component requests and issuance workflows still work
    - Stock movements are tracked correctly
  - Test edge cases:
    - Concurrent duplicate creation requests
    - Case-insensitive matching works correctly
    - Organization isolation is maintained
  - If any issues arise, document them and ask the user for guidance
  - Ensure all tests pass before marking as complete
