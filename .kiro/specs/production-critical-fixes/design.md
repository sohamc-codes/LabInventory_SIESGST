# Production Critical Fixes Bugfix Design

## Overview

This design document formalizes the bug conditions and validation approaches for four critical production bugs: duplicate component creation, stock validation race conditions, PRN onboarding bypass, and missing Edit/Delete component UI. Each bug represents a distinct failure mode with specific root causes and requires targeted fixes that preserve existing functionality while closing critical gaps in data integrity, concurrency control, authentication enforcement, and UI completeness.

## Glossary

### Bug 1: Duplicate Component Creation
- **Bug_Condition (C1)**: Component creation request provides a name and category that matches an existing component in the same organization
- **Property (P1)**: The system should update the existing component's stock instead of creating a duplicate
- **Preservation (R1)**: Existing component creation behavior for truly unique components must remain unchanged
- **POST handler**: The async function in `src/app/api/components/route.ts` (~line 118-198) that handles component creation requests
- **uniqueness key**: The combination of (name, category, organizationId) that identifies a unique component type

### Bug 2: Stock Validation Race Condition
- **Bug_Condition (C2)**: Time-of-check-to-time-of-use (TOCTOU) gap between approval-time stock validation and issue-time stock decrement
- **Property (P2)**: Stock validation must occur inside the atomic transaction that decrements stock
- **Preservation (R2)**: Existing issuance workflow and transaction structure must remain unchanged
- **PATCH handler**: The async function in `src/app/api/requests/[id]/route.ts` (~line 100-130) that approves requests
- **POST issue handler**: The async function in `src/app/api/requests/[id]/issue/route.ts` (~line 15-220) that issues components
- **TOCTOU vulnerability**: Time-of-check-to-time-of-use - when validation occurs at time T1 but action occurs at time T2, allowing state changes between T1 and T2

### Bug 3: PRN Onboarding Bypass
- **Bug_Condition (C3)**: OAuth-created STUDENT user without PRN can access protected routes by bypassing layout-level redirect
- **Property (P3)**: All protected routes must enforce PRN validation for STUDENT role before rendering
- **Preservation (R3)**: OAuth authentication flow and session management must remain unchanged
- **signIn callback**: The callback in `src/lib/auth.ts` (line 85) that creates users during Microsoft OAuth
- **layout gatekeeper**: The redirect logic in `src/app/(app)/layout.tsx` (line 12) that checks for missing PRN
- **middleware**: The file `src/middleware.ts` that intercepts all route requests

### Bug 4: Missing Edit/Delete Component UI
- **Bug_Condition (C4)**: User needs to edit or delete component data but UI only provides "Adjust Stock" button
- **Property (P4)**: Inventory Management page must expose Edit and Delete actions that call existing backend APIs
- **Preservation (R4)**: Existing "Adjust Stock" functionality, backend endpoints, and authorization checks must remain unchanged
- **Inventory Management page**: The page at `src/app/inventory/manage/page.tsx` that displays component list and actions
- **PATCH endpoint**: The async function PATCH in `src/app/api/components/[id]/route.ts` (lines 65-135) that updates components
- **DELETE endpoint**: The async function DELETE in `src/app/api/components/[id]/route.ts` (lines 137-200) that soft-deletes components
- **UI implementation gap**: Backend APIs exist and function correctly, but frontend lacks UI components to invoke them

## Bug Details

### Bug 1: Duplicate Component Creation

#### Bug Condition

The bug manifests when a user with appropriate permissions (LAB_ASSISTANT, HOD, or ADMIN) submits a POST request to /api/components with a component name and category that already exists in the organization's inventory. The POST handler creates a new component record unconditionally without checking for existing components, resulting in duplicate rows in the database.

**Formal Specification:**
```
FUNCTION isBugCondition1(input)
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
- `existingComponent(name, category, orgId)` returns the first component matching the name/category in the organization (case-insensitive)
- `duplicateCheckPerformed(input)` returns true if the handler checked for duplicates before creating (currently always false)

#### Examples

**Example 1: Raspberry Pi 5 Duplicate**
- User adds: "Raspberry Pi 5", category: "MICROCONTROLLER", totalStock: 10
- Existing component: "Raspberry Pi 5", category: "MICROCONTROLLER", totalStock: 5
- **Current behavior**: Creates new component with ID `cuid_002`, now two rows exist
- **Expected behavior**: Finds existing component, updates totalStock to 15, availableStock to 15

**Example 2: Case Insensitivity Issue**
- User adds: "raspberry pi 5", category: "MICROCONTROLLER", totalStock: 7
- Existing component: "Raspberry Pi 5", category: "MICROCONTROLLER", totalStock: 5
- **Expected behavior**: Should find existing component with case-insensitive match, update stock to 12

### Bug 2: Stock Validation Race Condition

#### Bug Condition

The bug manifests when there is a time gap between approval-time stock validation and issue-time stock decrement. The approval endpoint checks `availableStock >= quantity` at line 119, but between approval and issuance, other requests can deplete the stock. When the issue endpoint runs, the transaction-protected stock check at line 92 detects insufficient stock and throws an error, but the user already saw the approval succeed.

**Formal Specification:**
```
FUNCTION isBugCondition2(request, timelineEvents)
  INPUT: request of type ComponentRequest
         timelineEvents of type List<Event>
  OUTPUT: boolean
  
  LET approvalTime = findEvent(timelineEvents, "APPROVAL", request.id).timestamp
  LET issueTime = findEvent(timelineEvents, "ISSUE", request.id).timestamp
  LET stockDepletionEvents = filterEvents(timelineEvents, "STOCK_DECREMENT", request.componentId, BETWEEN(approvalTime, issueTime))
  
  RETURN approvalTime < issueTime
         AND stockDepletionEvents IS NOT EMPTY
         AND sumStockDecrements(stockDepletionEvents) >= availableStockAt(request.componentId, approvalTime) - request.quantity
END FUNCTION
```

#### Examples

**Example 1: Basic TOCTOU**
- T0: Component "Arduino Uno" has availableStock = 5
- T1: Request #1 for qty=5 is approved (stock check passes: 5 >= 5)
- T2: Request #2 for qty=3 is approved and issued immediately (stock decrements to 2)
- T3: Request #1 issue attempts, stock check fails: 2 < 5 → throws "Insufficient stock"
- **Current behavior**: User sees error but is confused because approval succeeded
- **Expected behavior**: User understands approval doesn't guarantee availability

### Bug 3: PRN Onboarding Bypass

#### Bug Condition

The bug manifests when a STUDENT user created via Microsoft OAuth (with `prn: null`) directly navigates to a protected route that bypasses the `(app)/layout.tsx` gatekeeper. The layout-level redirect only executes when routes are accessed through the layout, but direct navigation or middleware-allowed routes can skip this check.

**Formal Specification:**
```
FUNCTION isBugCondition3(session, requestedRoute)
  INPUT: session of type NextAuthSession
         requestedRoute of type string
  OUTPUT: boolean
  
  RETURN session.user.role = "STUDENT"
         AND session.user.prn IS NULL
         AND requestedRoute STARTS_WITH "/(app)/"
         AND NOT requestedRoute = "/onboarding"
         AND middlewareAllowsAccess(session, requestedRoute)
         AND layoutRedirectBypassed(requestedRoute)
END FUNCTION
```

#### Examples

**Example 1: OAuth User Bypassing Onboarding**
- User logs in via Microsoft OAuth → creates user with `prn: null`
- User navigates directly to `/return-components`
- Middleware allows access (no PRN enforcement)
- Layout redirect checks `!session.user.prn` → redirects to `/onboarding`
- **BUT** if user navigates before session updates or through non-layout route, bypass occurs
- Return Components page fails: cannot find user by PRN

**Example 2: Direct URL Navigation**
- User logs in → session has `prn: null`
- User bookmarks `/issued-components` and navigates directly
- Middleware doesn't enforce PRN validation
- Page attempts to render before layout redirect triggers
- **Current behavior**: Page may load briefly then redirect, or error occurs
- **Expected behavior**: Middleware catches and redirects before page loads

### Bug 4: Missing Edit/Delete Component UI

#### Bug Condition

The bug manifests when a user with LAB_ASSISTANT, HOD, or ADMIN role needs to edit component details or delete a component but the Inventory Management page only shows "Adjust Stock" button in the Actions column. The backend PATCH and DELETE endpoints exist at `/api/components/[id]` and work correctly, but there are no Edit or Delete buttons or dialogs in the frontend UI to invoke them.

**Formal Specification:**
```
FUNCTION isBugCondition4(action, page)
  INPUT: action of type UserAction (one of: "edit_component", "delete_component")
         page of type string
  OUTPUT: boolean
  
  RETURN action IN ["edit_component", "delete_component"]
         AND page = "/inventory/manage"
         AND backendEndpointExists(action)
         AND NOT uiButtonExists(action)
END FUNCTION
```

Where:
- `UserAction` represents the user's intent to edit or delete a component
- `backendEndpointExists(action)` returns true (PATCH and DELETE endpoints exist and work)
- `uiButtonExists(action)` returns false (no Edit or Delete buttons in the UI)

#### Examples

**Example 1: Edit Component Details**
- User views component "Arduino Uno" with category "MICROCONTROLLER"
- User notices a typo in the manufacturer name: "Arduion" instead of "Arduino"
- User looks for Edit button in Actions column
- **Current behavior**: Only "Adjust Stock" button is visible, no way to edit details via UI
- **Expected behavior**: "Edit" button opens dialog with form to update name, category, manufacturer, specifications, cost, storage location, condition, description

**Example 2: Delete Duplicate Component**
- User sees two components: "Raspberry Pi 5" created by mistake (duplicate entry)
- User wants to remove the duplicate entry
- User looks for Delete button in Actions column
- **Current behavior**: Only "Adjust Stock" button is visible, must contact admin or edit database manually
- **Expected behavior**: "Delete" button shows confirmation dialog, then calls DELETE endpoint to soft-delete (set `isActive: false`)

**Example 3: Update Component Cost**
- User needs to update cost field after supplier pricing changes
- Backend PATCH endpoint supports updating cost field (line 65-135 in route.ts)
- **Current behavior**: No way to update cost via UI
- **Expected behavior**: Edit dialog includes cost field that can be updated

**Example 4: Delete Component with Active Requests**
- User tries to delete a component that has active requests
- Backend DELETE endpoint validates and rejects with error "Cannot delete component with active requests"
- **Expected behavior**: UI shows error toast with backend error message, delete does not proceed

## Expected Behavior

### Bug 1: Duplicate Component Creation

**Preservation Requirements:**

**Unchanged Behaviors:**
- Creation of new components with truly unique name/category combinations must continue to work exactly as before
- Authorization checks (LAB_ASSISTANT, HOD, ADMIN roles) must remain unchanged
- Organization creation logic (create default org if none exists) must remain unchanged
- AuditLog creation for component creation actions must continue to work
- StockMovement record creation for stock tracking must continue to work
- Error handling for validation failures and internal errors must remain unchanged
- API response format (component object with 201 status) must remain unchanged

**Scope:**
All inputs that do NOT involve duplicate name/category combinations should be completely unaffected by this fix.

### Bug 2: Stock Validation Race Condition

**Preservation Requirements:**

**Unchanged Behaviors:**
- Single-request issuance with sufficient stock must continue to work exactly as before
- Transaction-protected stock decrement must remain unchanged (already correct)
- IssuedComponent creation, status updates, StockMovement, AuditLog, and notifications must remain unchanged
- Error handling for transaction failures must remain unchanged
- Success response format must remain unchanged

**Scope:**
The fix focuses on clarifying that approval-time validation is advisory only. The issue-time transaction-protected validation is the source of truth.

### Bug 3: PRN Onboarding Bypass

**Preservation Requirements:**

**Unchanged Behaviors:**
- Students with valid PRN must continue to access all protected routes without redirection
- LAB_ASSISTANT and HOD users must continue to access all routes without PRN validation
- Microsoft OAuth sign-in flow must continue to create users as before
- JWT callback must continue to fetch and populate user data
- Session strategy (JWT) must remain unchanged

**Scope:**
The fix enforces PRN validation in middleware for STUDENT role only, before layout execution.

### Bug 4: Missing Edit/Delete Component UI

**Preservation Requirements:**

**Unchanged Behaviors:**
- "Adjust Stock" button and dialog must continue to work exactly as before
- Add Component button and dialog must continue to work exactly as before
- Component list fetching via GET /api/components must continue to work exactly as before
- Backend PATCH endpoint must continue to validate, authorize, update, and audit exactly as before
- Backend DELETE endpoint must continue to check active requests, soft-delete, and audit exactly as before
- Authorization checks (LAB_ASSISTANT, HOD, ADMIN only) must remain enforced by backend
- Search and filter functionality must remain unchanged
- Stock status badges must remain unchanged

**Scope:**
All existing functionality on the Inventory Management page should be completely unaffected by adding Edit and Delete UI. The fix only adds new UI components that invoke existing backend endpoints.

## Hypothesized Root Cause

### Bug 1: Duplicate Component Creation

**Root Cause**: Missing duplicate check logic in the POST handler (`src/app/api/components/route.ts` lines 118-198).

**Specific Issues:**
1. **No findFirst Query**: Handler does not execute `prisma.component.findFirst()` to check for existing components
2. **No Database Constraint**: Component model lacks unique constraint on (name, category, organizationId)
3. **No Conditional Logic**: Handler lacks branching to decide between update and create
4. **Stock Consolidation Missing**: No logic to add quantities to existing components

### Bug 2: Stock Validation Race Condition

**Root Cause**: Approval-time stock validation is advisory, but users assume it's guaranteed.

**Specific Issues:**
1. **TOCTOU Gap**: Time passes between approval (line 119 validation) and issuance (line 92 validation)
2. **Missing Warning**: Approval endpoint doesn't warn that stock availability isn't guaranteed
3. **Error Message Clarity**: Issue endpoint error doesn't explain that stock was depleted after approval

**NOTE**: The issue endpoint's transaction-protected validation (line 92) is CORRECT and should NOT be changed. The bug is about user expectations, not the transaction logic.

### Bug 3: PRN Onboarding Bypass

**Root Cause**: Layout-level redirect can be bypassed by direct navigation because middleware doesn't enforce PRN validation.

**Specific Issues:**
1. **No Middleware Enforcement**: `src/middleware.ts` doesn't check PRN for STUDENT role
2. **Layout Timing**: Server component redirect may not execute before page attempts to render
3. **Direct Navigation**: Users can bookmark or directly navigate to routes that skip layout redirect
4. **Session Consistency**: OAuth callback completes but session may not update before route access

### Bug 4: Missing Edit/Delete Component UI

**Root Cause**: UI implementation gap - backend APIs are complete but frontend only implemented "Adjust Stock" action.

**Specific Issues:**
1. **Missing Edit Button**: No Edit button in the Actions column of the component table
2. **Missing Edit Dialog**: No dialog component with form fields for editing component details
3. **Missing Delete Button**: No Delete button in the Actions column
4. **Missing Delete Confirmation Dialog**: No confirmation dialog explaining soft delete behavior
5. **No API Integration**: No frontend code calling PATCH or DELETE endpoints despite their existence
6. **Incomplete Feature**: Feature was partially implemented - backend done, frontend incomplete

**NOTE**: The backend endpoints are CORRECT and fully functional. They:
- PATCH: Validates data, enforces authorization, preserves issued quantity when updating totalStock, creates audit logs
- DELETE: Checks for active requests, performs soft delete (sets `isActive: false`), creates audit logs
- The bug is purely a frontend UI gap, not a backend issue

## Correctness Properties

Property 1: Bug Condition - Duplicate Component Detection and Stock Update

_For any_ component creation request where a component with the same name and category already exists in the organization, the fixed POST handler SHALL find the existing component and update its totalStock and availableStock by adding the new quantity, then create a StockMovement record of type "IN" documenting the stock addition.

**Validates: Requirements 2.1, 2.2, 2.3, 2.5**

Property 2: Preservation - Unique Component Creation

_For any_ component creation request where no component with the same name and category exists in the organization, the fixed POST handler SHALL produce exactly the same result as the original handler, creating a new component record with all the provided details and generating the same AuditLog and StockMovement entries.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

Property 3: Bug Condition - Stock Validation Inside Transaction

_For any_ issue request where stock has been depleted between approval and issuance, the fixed issue handler SHALL detect insufficient stock inside the transaction (line 92) and throw an error that rolls back the entire transaction, preventing negative inventory.

**Validates: Requirements 2.6, 2.7, 2.8, 2.9**

Property 4: Preservation - Successful Issuance Flow

_For any_ issue request with sufficient stock available, the fixed system SHALL produce exactly the same result as the original system, completing the transaction successfully with all side effects (stock decrement, IssuedComponent creation, status update, notifications).

**Validates: Requirements 3.8, 3.9, 3.10, 3.11**

Property 5: Bug Condition - PRN Enforcement in Middleware

_For any_ request to a protected route where the session user is STUDENT role with null PRN, the fixed middleware SHALL redirect to `/onboarding` before allowing route access, preventing layout bypass.

**Validates: Requirements 2.11, 2.12, 2.13, 2.14**

Property 6: Preservation - Valid Session Access

_For any_ request to a protected route where the session user is STUDENT with valid PRN, or LAB_ASSISTANT/HOD with any PRN value, the fixed middleware SHALL produce exactly the same result as the original middleware, allowing route access without redirection.

**Validates: Requirements 3.12, 3.13, 3.14, 3.15, 3.16**

Property 7: Bug Condition - Edit Component UI Integration

_For any_ component displayed in the Inventory Management page, the fixed UI SHALL display an "Edit" button that opens a dialog with a form pre-populated with the component's current details, and upon submission SHALL call PATCH `/api/components/[id]` with the updated fields, then show a success toast and refresh the list.

**Validates: Requirements 2.16, 2.17, 2.18, 2.19, 2.24, 2.25**

Property 8: Bug Condition - Delete Component UI Integration

_For any_ component displayed in the Inventory Management page, the fixed UI SHALL display a "Delete" button that opens a confirmation dialog explaining soft delete behavior, and upon confirmation SHALL call DELETE `/api/components/[id]`, then show appropriate success/error toast and refresh the list if successful.

**Validates: Requirements 2.16, 2.20, 2.21, 2.22, 2.23**

Property 9: Preservation - Existing Inventory Management Functionality

_For any_ existing functionality on the Inventory Management page (Adjust Stock, Add Component, search, filter, list display, stock badges), the fixed UI SHALL produce exactly the same result as the original UI, preserving all existing interactions and behaviors.

**Validates: Requirements 3.17, 3.18, 3.19, 3.20, 3.21, 3.22, 3.23, 3.24**

## Fix Implementation

### Bug 1: Duplicate Component Creation

**File**: `src/app/api/components/route.ts`

**Function**: `POST` handler (async function POST)

**Specific Changes**:

1. **Add Duplicate Check Query** (after validation, before creation):
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

2. **Add Conditional Branching**:
   ```typescript
   let component
   if (existingComponent) {
     // Update existing component stock
   } else {
     // Create new component (existing logic)
   }
   ```

3. **Implement Stock Update Logic**:
   ```typescript
   component = await prisma.component.update({
     where: { id: existingComponent.id },
     data: {
       totalStock: existingComponent.totalStock + validatedData.totalStock,
       availableStock: existingComponent.availableStock + validatedData.totalStock,
     },
   })
   ```

4. **Update AuditLog Action**: Change from 'CREATE_COMPONENT' to 'UPDATE_COMPONENT_STOCK' when updating
5. **Update StockMovement Reason**: Change from 'Initial stock' to 'Stock addition' when updating
6. **Preserve All Error Handling**: Maintain try-catch blocks unchanged
7. **Return Component**: Return updated or created component with 201 status

### Bug 2: Stock Validation Race Condition

**File**: `src/app/api/requests/[id]/route.ts`

**Function**: `PATCH` handler (async function PATCH for approval)

**Specific Changes**:

1. **Add Warning Message** (line ~119, after stock validation):
   ```typescript
   if (validatedData.status === 'APPROVED') {
     if (currentRequest.component.availableStock < currentRequest.quantity) {
       return NextResponse.json(
         { error: 'Insufficient quantity available' },
         { status: 400 }
       )
     }
     // ADD: Warning that stock isn't guaranteed until issuance
     console.log('WARNING: Approval-time stock check passed, but availability not guaranteed until issue time')
   }
   ```

**File**: `src/app/api/requests/[id]/issue/route.ts`

**Function**: `POST` handler (async function POST for issuance)

**Specific Changes**:

1. **Improve Error Message** (line ~92, inside transaction):
   ```typescript
   if (component.availableStock < componentRequest.quantity) {
     throw new Error(
       `Insufficient stock: ${component.availableStock} available, ${componentRequest.quantity} requested. ` +
       `Stock may have been depleted since approval time.`
     )
   }
   ```

2. **NO OTHER CHANGES**: The transaction-protected validation is already correct

### Bug 3: PRN Onboarding Bypass

**File**: `src/middleware.ts`

**Function**: Main middleware function

**Specific Changes**:

1. **Add PRN Validation** (before existing route matching):
   ```typescript
   // Enforce PRN requirement for STUDENT role
   if (session?.user?.role === 'STUDENT' && !session.user.prn) {
     const isProtectedRoute = request.nextUrl.pathname.startsWith('/(app)') || 
                             !request.nextUrl.pathname.startsWith('/onboarding')
     
     if (isProtectedRoute && request.nextUrl.pathname !== '/onboarding') {
       return NextResponse.redirect(new URL('/onboarding', request.url))
     }
   }
   ```

2. **Preserve Existing Logic**: All existing middleware rules remain unchanged

**File**: `src/app/(app)/layout.tsx`

**Function**: AppLayout component

**No Changes Required**: Layout-level redirect remains as backup but middleware is primary enforcement

### Bug 4: Missing Edit/Delete Component UI

**File**: `src/app/inventory/manage/page.tsx`

**Function**: ManageInventoryPage component

**Specific Changes**:

1. **Add State for Edit Dialog**:
   ```typescript
   const [showEditDialog, setShowEditDialog] = useState(false)
   const [editFormData, setEditFormData] = useState({
     name: '',
     category: '',
     manufacturer: '',
     specifications: '',
     cost: 0,
     storageLocation: '',
     condition: 'NEW',
     description: '',
   })
   ```

2. **Add State for Delete Confirmation Dialog**:
   ```typescript
   const [showDeleteDialog, setShowDeleteDialog] = useState(false)
   const [componentToDelete, setComponentToDelete] = useState<any>(null)
   ```

3. **Add Delete Mutation Hook** (using existing pattern from useUpdateComponent):
   ```typescript
   const deleteComponentMutation = useDeleteComponent(componentToDelete?.id || '')
   ```

4. **Add Edit Button Handler**:
   ```typescript
   const handleOpenEditDialog = (component: any) => {
     setSelectedComponent(component)
     setEditFormData({
       name: component.name,
       category: component.category,
       manufacturer: component.manufacturer || '',
       specifications: component.specifications || '',
       cost: component.cost || 0,
       storageLocation: component.storageLocation || '',
       condition: component.condition || 'NEW',
       description: component.description || '',
     })
     setShowEditDialog(true)
   }
   ```

5. **Add Edit Submit Handler**:
   ```typescript
   const handleSubmitEdit = async () => {
     try {
       await updateComponentMutation.mutateAsync(editFormData)
       toast.success('Component updated successfully')
       setShowEditDialog(false)
       refetch()
     } catch (error) {
       toast.error('Failed to update component')
     }
   }
   ```

6. **Add Delete Button Handler**:
   ```typescript
   const handleOpenDeleteDialog = (component: any) => {
     setComponentToDelete(component)
     setShowDeleteDialog(true)
   }
   ```

7. **Add Delete Confirm Handler**:
   ```typescript
   const handleConfirmDelete = async () => {
     try {
       await deleteComponentMutation.mutateAsync()
       toast.success('Component deleted successfully')
       setShowDeleteDialog(false)
       setComponentToDelete(null)
       refetch()
     } catch (error: any) {
       toast.error(error?.message || 'Failed to delete component')
     }
   }
   ```

8. **Update Actions Column** (replace single "Adjust Stock" button with three buttons):
   ```typescript
   <TableCell>
     <div className="flex gap-2">
       <Button
         size="sm"
         variant="outline"
         onClick={() => handleOpenEditDialog(component)}
       >
         Edit
       </Button>
       <Button
         size="sm"
         variant="destructive"
         onClick={() => handleOpenDeleteDialog(component)}
       >
         Delete
       </Button>
       <Button
         size="sm"
         onClick={() => {
           setSelectedComponent(component)
           setNewTotalStock(component.totalStock)
           setShowAdjustDialog(true)
         }}
       >
         Adjust Stock
       </Button>
     </div>
   </TableCell>
   ```

9. **Add Edit Dialog Component** (below existing Adjust Stock dialog):
   ```typescript
   <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
     <DialogContent className="w-[95vw] max-w-lg sm:w-full p-4 sm:p-6">
       <DialogHeader>
         <DialogTitle>Edit Component</DialogTitle>
         <DialogDescription>Update component details</DialogDescription>
       </DialogHeader>
       <div className="space-y-4">
         {/* Form fields for name, category, manufacturer, specifications, cost, storageLocation, condition, description */}
         <Button onClick={handleSubmitEdit} className="w-full">
           Save Changes
         </Button>
       </div>
     </DialogContent>
   </Dialog>
   ```

10. **Add Delete Confirmation Dialog**:
    ```typescript
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{componentToDelete?.name}"? 
            This will set the component as inactive (soft delete) and cannot be undone via the UI.
            Components with active requests cannot be deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    ```

**File**: `src/lib/hooks/use-components.ts` (create if doesn't exist, or add to existing hooks file)

**Function**: Add useDeleteComponent hook

**Specific Changes**:

1. **Add Delete Hook**:
   ```typescript
   export function useDeleteComponent(componentId: string) {
     return useMutation({
       mutationFn: async () => {
         const response = await fetch(`/api/components/${componentId}`, {
           method: 'DELETE',
         })
         if (!response.ok) {
           const error = await response.json()
           throw new Error(error.error || 'Failed to delete component')
         }
         return response.json()
       },
     })
   }
   ```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Bug 1: Exploratory Bug Condition Checking

**Goal**: Surface counterexamples demonstrating duplicate component creation BEFORE implementing the fix.

**Test Plan**: Write property-based tests that generate component creation requests with duplicate name/category combinations. Run on UNFIXED code to observe failures.

**Test Cases**:
1. **Duplicate Name and Category**: Create "Raspberry Pi 5" + "MICROCONTROLLER" twice in same org (will create duplicates on unfixed code)
2. **Case Insensitivity**: Create "raspberry pi 5" then "Raspberry Pi 5" with same category (will create duplicates on unfixed code)
3. **Stock Split**: Create same component three times with quantities 5, 10, 15; verify three records exist instead of one with totalStock=30 (will fail on unfixed code)
4. **Same Organization**: Create duplicate in same org, verify both have same organizationId and different IDs (will fail on unfixed code)

**Expected Counterexamples**:
- Multiple component records with identical name and category
- Split stock quantities across duplicate records
- Possible root cause confirmation: No findFirst query executed

### Bug 1: Fix Checking

**Goal**: Verify duplicate detection and stock consolidation works correctly.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition1(input) DO
  result := POST_fixed(input)
  existingComponent := findComponent(input.name, input.category, input.organizationId)
  ASSERT result.id = existingComponent.id
  ASSERT result.totalStock = existingComponent.totalStock + input.totalStock
  ASSERT stockMovementCreated(result.id, "IN", input.totalStock)
END FOR
```

### Bug 1: Preservation Checking

**Goal**: Verify unique component creation unchanged.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition1(input) DO
  ASSERT POST_original(input) = POST_fixed(input)
END FOR
```

**Test Cases**:
1. **Unique Component Creation**: Verify components with unique names/categories create new records
2. **Different Organization Isolation**: Verify same name/category in different orgs creates separate components
3. **Authorization Preservation**: Verify unauthorized users receive 401
4. **AuditLog/StockMovement Preservation**: Verify records created identically

### Bug 2: Exploratory Bug Condition Checking

**Goal**: Surface counterexamples demonstrating TOCTOU race condition BEFORE implementing the fix.

**Test Plan**: Simulate approval followed by stock depletion, then attempt issuance. Run on UNFIXED code.

**Test Cases**:
1. **Sequential Depletion**: Approve request for qty=5 when stock=5, issue another request for qty=3, then attempt original issue (will throw "Insufficient stock" on unfixed code)
2. **Concurrent Approval**: Approve two requests simultaneously when stock only satisfies one (both pass approval validation on unfixed code)
3. **Error Message Clarity**: Verify error message doesn't explain stock was depleted after approval (will be unclear on unfixed code)

**Expected Counterexamples**:
- Approval succeeds but issuance fails with "Insufficient stock"
- Error message doesn't clarify TOCTOU gap
- User confusion about why approved request can't be issued

### Bug 2: Fix Checking

**Goal**: Verify improved error messaging and warning logs.

**Pseudocode:**
```
FOR ALL request WHERE stockDepletedBetweenApprovalAndIssue(request) DO
  result := POST_issue_fixed(request)
  ASSERT result.status = 400
  ASSERT result.error CONTAINS "depleted since approval time"
END FOR
```

### Bug 2: Preservation Checking

**Goal**: Verify successful issuance unchanged.

**Pseudocode:**
```
FOR ALL request WHERE sufficientStockAtIssueTime(request) DO
  ASSERT POST_issue_original(request) = POST_issue_fixed(request)
END FOR
```

**Test Cases**:
1. **Single Request Success**: Verify issuance completes successfully when stock is sufficient
2. **Transaction Rollback**: Verify transaction rolls back correctly on error
3. **Notification Preservation**: Verify student notification sent on success

### Bug 3: Exploratory Bug Condition Checking

**Goal**: Surface counterexamples demonstrating PRN bypass BEFORE implementing the fix.

**Test Plan**: Create OAuth user with null PRN, attempt direct navigation to protected routes. Run on UNFIXED code.

**Test Cases**:
1. **Direct Navigation**: Login via OAuth → navigate directly to `/return-components` (may bypass layout redirect on unfixed code)
2. **Bookmarked URL**: Login → bookmark `/issued-components` → logout → login → use bookmark (may bypass on unfixed code)
3. **Middleware Check**: Verify middleware doesn't enforce PRN validation (will allow access on unfixed code)

**Expected Counterexamples**:
- STUDENT with null PRN can access protected routes briefly before redirect
- Return Components page errors because user.prn is null
- Middleware allows access without PRN validation

### Bug 3: Fix Checking

**Goal**: Verify middleware enforces PRN validation before route access.

**Pseudocode:**
```
FOR ALL request WHERE isBugCondition3(session, route) DO
  result := middleware_fixed(request)
  ASSERT result.type = "REDIRECT"
  ASSERT result.destination = "/onboarding"
END FOR
```

### Bug 3: Preservation Checking

**Goal**: Verify valid session access unchanged.

**Pseudocode:**
```
FOR ALL request WHERE validPrnOrNonStudent(session) DO
  ASSERT middleware_original(request) = middleware_fixed(request)
END FOR
```

**Test Cases**:
1. **Valid PRN Access**: Verify STUDENT with PRN can access all protected routes
2. **Non-Student Access**: Verify LAB_ASSISTANT and HOD can access all routes without PRN
3. **OAuth Flow Preservation**: Verify Microsoft OAuth sign-in creates users as before
4. **Session Management**: Verify JWT callback and session strategy unchanged

### Unit Tests

**Bug 1**:
- Duplicate detection with exact/case-insensitive match
- Stock quantity updates for duplicates
- New component creation for unique inputs
- Organization isolation

**Bug 2**:
- Approval-time stock validation
- Issue-time transaction-protected validation
- Error message clarity

**Bug 3**:
- Middleware PRN enforcement for STUDENT
- Middleware bypass for LAB_ASSISTANT/HOD
- Layout redirect as backup

### Property-Based Tests

**Property 1 (Bug 1)**: Generate random component data with duplicate name/category, verify only one record exists after both creations
**Property 2 (Bug 1)**: Generate random unique components, verify creation produces identical results before/after fix
**Property 3 (Bug 2)**: Generate random request sequences with stock depletion, verify transaction-protected validation catches insufficient stock
**Property 4 (Bug 2)**: Generate random successful issuance scenarios, verify identical behavior before/after fix
**Property 5 (Bug 3)**: Generate random STUDENT sessions with null PRN, verify middleware redirects to onboarding
**Property 6 (Bug 3)**: Generate random valid sessions (PRN present or non-STUDENT), verify middleware allows access

### Integration Tests

**Bug 1**: Create component → Add stock via duplicate creation → Verify consolidated stock
**Bug 2**: Approve request → Deplete stock → Attempt issue → Verify error with clear message
**Bug 3**: OAuth login → Direct navigation → Verify middleware redirect before layout execution
