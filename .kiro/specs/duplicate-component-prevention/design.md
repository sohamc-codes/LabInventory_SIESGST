# Duplicate Component Prevention Bugfix Design

## Overview

This design document formalizes the bug condition and validation approach for preventing duplicate component records in the inventory system. The bug occurs when the POST /api/components endpoint creates new component records without checking for existing components with the same name and category combination. The fix implements a "find-or-create" pattern: check for existing components first, and either update the existing component's stock or create a new one. This ensures the fix is targeted, minimal, and doesn't introduce regressions to the existing component creation workflow.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a component creation request provides a name and category that matches an existing component in the same organization
- **Property (P)**: The desired behavior when the bug condition is met - the system should update the existing component's stock instead of creating a duplicate
- **Preservation**: Existing component creation behavior for truly unique components must remain unchanged by the fix
- **POST handler**: The async function in `src/app/api/components/route.ts` (lines ~118-198) that handles component creation requests
- **uniqueness key**: The combination of (name, category, organizationId) that identifies a unique component type
- **findFirst query**: A Prisma operation that searches for an existing component matching the uniqueness key
- **stock consolidation**: The process of adding new stock quantities to an existing component's totalStock and availableStock fields

## Bug Details

### Bug Condition

The bug manifests when a user with appropriate permissions (LAB_ASSISTANT, HOD, or ADMIN) submits a POST request to /api/components with a component name and category that already exists in the organization's inventory. The POST handler creates a new component record unconditionally without checking for existing components, resulting in duplicate rows in the database.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ComponentCreationRequest
  OUTPUT: boolean
  
  RETURN input.name IS NOT NULL
         AND input.category IS NOT NULL
         AND existingComponent(input.name, input.category, input.organizationId) IS NOT NULL
         AND NOT duplicateCheckPerformed(input)
END FUNCTION
```

Where:
- `ComponentCreationRequest` has fields: name, category, manufacturer, specifications, totalStock, condition, etc.
- `existingComponent(name, category, orgId)` returns the first component matching the name/category in the organization
- `duplicateCheckPerformed(input)` returns true if the handler checked for duplicates before creating (currently always false)

### Examples

**Example 1: Raspberry Pi 5 Duplicate**
- User adds: "Raspberry Pi 5", category: "MICROCONTROLLER", totalStock: 10
- Existing component: "Raspberry Pi 5", category: "MICROCONTROLLER", totalStock: 5
- **Current behavior**: Creates new component with ID `cuid_002`, now two rows exist
- **Expected behavior**: Finds existing component, updates totalStock to 15, availableStock to 15

**Example 2: Arduino Uno with Different Category**
- User adds: "Arduino Uno", category: "MICROCONTROLLER", totalStock: 8
- Existing component: "Arduino Uno", category: "MODULE", totalStock: 3
- **Expected behavior**: Creates new component (different category = different component type)

**Example 3: Case Sensitivity Issue**
- User adds: "raspberry pi 5", category: "MICROCONTROLLER", totalStock: 7
- Existing component: "Raspberry Pi 5", category: "MICROCONTROLLER", totalStock: 5
- **Expected behavior**: Should find existing component with case-insensitive match, update stock to 12

**Example 4: Different Organization**
- User adds: "Raspberry Pi 5", category: "MICROCONTROLLER", organizationId: "org_002", totalStock: 10
- Existing component: "Raspberry Pi 5", category: "MICROCONTROLLER", organizationId: "org_001", totalStock: 5
- **Expected behavior**: Creates new component (different organization = separate inventory)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Creation of new components with truly unique name/category combinations must continue to work exactly as before
- Authorization checks (LAB_ASSISTANT, HOD, ADMIN roles) must remain unchanged
- Organization creation logic (create default org if none exists) must remain unchanged
- AuditLog creation for component creation actions must continue to work
- StockMovement record creation for stock tracking must continue to work
- Error handling for validation failures and internal errors must remain unchanged
- API response format (component object with 201 status) must remain unchanged

**Scope:**
All inputs that do NOT involve duplicate name/category combinations should be completely unaffected by this fix. This includes:
- Creation of components with new unique names
- Creation of components with existing names but different categories
- Creation of components in different organizations
- Authorization failures (unauthorized users)
- Validation failures (invalid input data)
- Database errors and edge cases

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is:

**Missing Duplicate Check Logic**: The POST handler in `src/app/api/components/route.ts` (lines 118-198) directly creates a new component after validation without checking if a component with the same name and category already exists in the organization's inventory.

**Specific Issues:**

1. **No findFirst Query**: The handler does not execute a `prisma.component.findFirst()` query to check for existing components before calling `prisma.component.create()`

2. **No Database-Level Constraint**: The Component model in `prisma/schema.prisma` does not have a unique constraint on the (name, category, organizationId) combination, allowing the database to accept duplicate entries

3. **No Conditional Logic**: The handler lacks the conditional branching to decide between:
   - Update existing component (when duplicate exists)
   - Create new component (when no duplicate exists)

4. **Stock Consolidation Missing**: When a duplicate is detected, there's no logic to:
   - Add the new totalStock to existing totalStock
   - Add the new quantity to availableStock
   - Create appropriate "IN" type StockMovement records

## Correctness Properties

Property 1: Bug Condition - Duplicate Component Detection and Stock Update

_For any_ component creation request where a component with the same name and category already exists in the organization, the fixed POST handler SHALL find the existing component and update its totalStock and availableStock by adding the new quantity, then create a StockMovement record of type "IN" documenting the stock addition.

**Validates: Requirements 2.1, 2.2, 2.3, 2.5**

Property 2: Preservation - Unique Component Creation

_For any_ component creation request where no component with the same name and category exists in the organization, the fixed POST handler SHALL produce exactly the same result as the original handler, creating a new component record with all the provided details and generating the same AuditLog and StockMovement entries.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/app/api/components/route.ts`

**Function**: `POST` handler (async function POST)

**Specific Changes**:

1. **Add Duplicate Check Query**: After validation and organization setup, before component creation:
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

2. **Add Conditional Branching**: Replace the direct `prisma.component.create()` call with conditional logic:
   - IF `existingComponent` exists THEN update stock
   - ELSE create new component

3. **Implement Stock Update Logic**: For existing components:
   ```typescript
   const updatedComponent = await prisma.component.update({
     where: { id: existingComponent.id },
     data: {
       totalStock: existingComponent.totalStock + validatedData.totalStock,
       availableStock: existingComponent.availableStock + validatedData.totalStock,
     },
   })
   ```

4. **Update AuditLog Action**: Change audit log action from 'CREATE_COMPONENT' to 'UPDATE_COMPONENT_STOCK' when updating existing component

5. **Update StockMovement Reason**: Change stock movement reason from 'Initial stock' to 'Stock addition' or similar when updating existing component

6. **Preserve All Existing Error Handling**: Ensure try-catch blocks for audit logs and stock movements remain unchanged

7. **Return Appropriate Component**: Return the updated or created component with 201 status (existing behavior for create, maintain same status for update)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write property-based tests that generate component creation requests with duplicate name/category combinations and verify that the POST handler creates duplicate database records. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Duplicate Name and Category Test**: Create "Raspberry Pi 5" with category "MICROCONTROLLER" twice in same organization (will create duplicates on unfixed code)
2. **Case Insensitivity Test**: Create "raspberry pi 5" then "Raspberry Pi 5" with same category (will create duplicates on unfixed code)
3. **Stock Split Test**: Create same component three times with quantities 5, 10, 15; verify three separate records exist instead of one with totalStock=30 (will fail on unfixed code)
4. **Same Organization Test**: Create duplicate component in same organization twice, verify both have same organizationId and different component IDs (will fail on unfixed code)

**Expected Counterexamples**:
- Database contains multiple component records with identical name and category
- totalStock and availableStock are split across duplicate records
- Component queries return multiple results for the same component type
- Possible root cause confirmation: No findFirst query executed before component.create()

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := POST_fixed(input)
  existingComponent := findComponent(input.name, input.category, input.organizationId)
  ASSERT result.id = existingComponent.id
  ASSERT result.totalStock = existingComponent.totalStock + input.totalStock
  ASSERT result.availableStock = existingComponent.availableStock + input.totalStock
  ASSERT stockMovementCreated(result.id, "IN", input.totalStock)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT POST_original(input) = POST_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for unique component creation, authorization failures, and validation errors, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Unique Component Creation**: Observe that creating components with unique names or categories works correctly on unfixed code, then write test to verify this continues after fix
2. **Different Organization Isolation**: Observe that components with same name/category in different organizations are separate on unfixed code, then write test to verify this continues after fix
3. **Authorization Preservation**: Observe that unauthorized users receive 401 responses on unfixed code, then write test to verify this continues after fix
4. **Validation Error Preservation**: Observe that invalid input data receives 400 responses on unfixed code, then write test to verify this continues after fix
5. **AuditLog Creation Preservation**: Observe that AuditLog entries are created on unfixed code, then write test to verify this continues after fix
6. **StockMovement Creation Preservation**: Observe that StockMovement entries are created on unfixed code, then write test to verify this continues after fix

### Unit Tests

- Test duplicate detection with exact name/category match
- Test case-insensitive duplicate detection
- Test stock quantity updates when duplicate is found
- Test new component creation when no duplicate exists
- Test organization isolation (same name/category in different orgs creates separate components)
- Test that AuditLog action changes appropriately (CREATE vs UPDATE_STOCK)
- Test that StockMovement reason changes appropriately (Initial stock vs Stock addition)

### Property-Based Tests

**Property 1: Bug Condition - Duplicate Detection and Stock Update**
- Generate random component names, categories, and stock quantities
- For each input, create component twice with same name/category
- Verify only one component record exists in database after both creations
- Verify totalStock equals sum of both quantities
- Verify StockMovement records exist for both additions

**Property 2: Preservation - Unique Component Creation**
- Generate random component data with unique name/category combinations
- Verify component creation produces identical results before and after fix
- Verify AuditLog and StockMovement records are created identically
- Verify response format and status codes remain unchanged

### Integration Tests

- Test full workflow: Create component → Add stock via duplicate creation → Verify consolidated stock
- Test multi-organization scenario: Same component name/category in two organizations should remain separate
- Test concurrent duplicate creation: Multiple simultaneous requests should handle race conditions gracefully
- Test that GET /api/components returns deduplicated results after fix
