# Implementation Plan: Production System Refactor

## Overview

Four-phase refactor of the SIES GST IoT Parts Management System. Phases are ordered by dependency: the design system must land first (all pages depend on it), then the workflow changes (removes scanner, adds HOD issuing), then dashboard analytics and user management (depend on schema and RBAC being correct), and finally performance/caching (converts pages to Server Components, adds indexes and `unstable_cache`).

Stack: Next.js 15 App Router · Prisma ORM (SQLite) · NextAuth 5 beta · Tailwind CSS · shadcn/ui · TanStack Query · Lucide icons · Sonner toasts · fast-check (PBT).

---

## Tasks

### Phase 1 — Enterprise Design System & Theming

- [x] 1. Audit and fix CSS custom property token map in `globals.css`
  - Ensure `:root` and `.dark` blocks both define all 16 required tokens: `--background`, `--foreground`, `--card`, `--card-foreground`, `--border`, `--input`, `--ring`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, and `--popover` / `--popover-foreground`
  - Preserve the existing zinc/slate dark-mode palette values; do not introduce conflicting token names
  - _Requirements: 1.1, 1.6_

- [x] 2. Replace hardcoded color classes across UI components and pages
  - [x] 2.1 Update `src/components/ui/card.tsx` to use `bg-card text-card-foreground` instead of any hardcoded zinc/gray classes
    - Search for `bg-white`, `bg-gray-50`, `text-gray-900`, `text-black`, `bg-zinc-950` in `src/components/ui/` and replace with semantic tokens
    - _Requirements: 1.2, 1.3_

  - [x] 2.2 Update modal and dialog components to use semantic tokens
    - Update `src/components/ui/dialog.tsx` and any custom modal wrappers to use `bg-card text-card-foreground` for header, body, and footer
    - Check `src/app/(app)/` pages for inline hardcoded color classes on layout containers and cards; replace with semantic equivalents
    - _Requirements: 1.2, 1.3_

  - [ ] 2.3 Write unit tests for design system token usage
    - Verify `Card` component renders with `bg-card` class
    - Verify issue confirmation modal renders with `bg-card text-card-foreground`
    - Verify rejection modal in approvals page renders with semantic classes
    - _Requirements: 1.2, 1.3_

- [x] 3. Wire `next-themes` ThemeProvider correctly
  - [x] 3.1 Rewrite `src/components/theme-provider.tsx` to re-export `next-themes` `ThemeProvider`
    - Replace the custom implementation that hard-codes dark mode with a thin wrapper around `NextThemesProvider`
    - _Requirements: 1.4_

  - [x] 3.2 Update `src/components/providers.tsx` to pass `attribute="class"`, `defaultTheme="dark"`, `enableSystem={false}`, `storageKey="iot-parts-theme"` to `ThemeProvider`
    - _Requirements: 1.4, 1.5_

  - [x] 3.3 Create `src/components/layout/theme-toggle.tsx`
    - `'use client'` component using `useTheme` from `next-themes`
    - Renders `Sun` icon when dark, `Moon` icon when light; uses `Button` variant `ghost` size `icon`
    - `aria-label="Toggle theme"`
    - _Requirements: 1.5_

  - [x] 3.4 Mount `ThemeToggle` in `src/components/layout/header.tsx`
    - Import and render `ThemeToggle` in the header action area
    - _Requirements: 1.5_

  - [ ]* 3.5 Write unit tests for ThemeProvider and ThemeToggle
    - Verify `ThemeProvider` mounts with `defaultTheme="dark"`
    - Verify theme preference persists to `localStorage` under key `iot-parts-theme`
    - Verify `ThemeToggle` calls `setTheme` with the opposite value on click
    - _Requirements: 1.4, 1.5_

- [x] 4. Checkpoint — Design system complete
  - Ensure all tests pass. Smoke-check that `globals.css` contains all 16 CSS custom property names in both `:root` and `.dark` blocks. Confirm no `bg-white`, `bg-gray-50`, `text-gray-900`, or `text-black` classes remain on layout containers or cards in `src/components/ui/` or `src/app/`. Ask the user if questions arise.

---

### Phase 2 — Workflow Refactor (Issuing & RBAC)

- [x] 5. Remove QR scanner files and imports
  - [x] 5.1 Delete `src/app/scanner/page.tsx` and its containing `src/app/scanner/` directory
    - _Requirements: 3.1, 3.5_

  - [x] 5.2 Delete `src/app/api/scanner/component/route.ts`, `src/app/api/scanner/student/route.ts`, and their containing `src/app/api/scanner/` directory
    - _Requirements: 3.2_

  - [x] 5.3 Remove all `import ... from 'html5-qrcode'` statements from any file under `src/`
    - Search `src/` for `html5-qrcode` imports and delete those import lines; do not remove the `package.json` entry
    - _Requirements: 3.4_

- [x] 6. Update sidebar navigation for all roles
  - [x] 6.1 Remove the `QR Scanner` nav entry (with `QrCode` icon and `href: '/scanner'`) from the `LAB_ASSISTANT` nav items in `src/components/layout/sidebar.tsx`
    - Remove the `QrCode` import from `lucide-react` if it is no longer used
    - _Requirements: 3.3_

  - [x] 6.2 Add `{ title: 'Issue Components', href: '/issue-components', icon: PackageCheck }` to the `HOD` nav items in `src/components/layout/sidebar.tsx`
    - _Requirements: 2.4_

  - [x] 6.3 Add `{ title: 'User Management', href: '/users', icon: Users }` to both `HOD` and `ADMIN` nav items in `src/components/layout/sidebar.tsx`
    - _Requirements: 7.5_

  - [ ]* 6.4 Write unit tests for sidebar navigation
    - Verify sidebar renders "Issue Components" for `LAB_ASSISTANT` session
    - Verify sidebar renders "Issue Components" for `HOD` session
    - Verify sidebar renders "User Management" for `HOD` session
    - Verify sidebar renders "User Management" for `ADMIN` session
    - Verify sidebar does NOT render "QR Scanner" for any role
    - _Requirements: 2.4, 3.3, 7.5_

- [x] 7. Expand RBAC on the issue API route
  - Modify `src/app/api/requests/[id]/issue/route.ts` to allow both `LAB_ASSISTANT` and `HOD` roles
  - Replace the single-role guard with `const ALLOWED_ROLES = ['LAB_ASSISTANT', 'HOD'] as const` and check `ALLOWED_ROLES.includes(session.user.role)`
  - All transaction steps (stock decrement, `IssuedComponent` creation, status update, `StockMovement`, `AuditLog`, student notification) remain unchanged; `issuedBy` is set to `session.user.id` automatically
  - _Requirements: 2.1, 2.2, 2.5_

- [ ]* 7.1 Write property test for RBAC enforcement on issue endpoint
  - **Property 1: RBAC enforcement on issue endpoint**
  - Generate random role strings; verify that any role not in `['LAB_ASSISTANT', 'HOD']` receives HTTP 401
  - **Validates: Requirements 2.2**

- [ ]* 7.2 Write property test for HOD issue transaction completeness
  - **Property 2: HOD issue transaction completeness**
  - For an `APPROVED` request with sufficient stock, verify that a HOD-issued transaction produces: `ComponentRequest.status = ISSUED`, decremented `availableStock`, an `IssuedComponent` with `issuedBy = hod.userId`, a `StockMovement` of type `OUT`, and a student `Notification`
  - **Validates: Requirements 2.1, 2.5**

- [x] 8. Create `/api/users/search` endpoint
  - Create `src/app/api/users/search/route.ts`
  - `GET /api/users/search?q=<prn_or_name>` — auth guard: `LAB_ASSISTANT | HOD`
  - Query `prisma.user.findMany` where `prn` or `name` contains `q` (case-insensitive); include `activeIssues` via nested `IssuedComponent` select
  - Return `{ users: [{ id, name, prn, department, activeIssues: IssuedComponent[] }] }`
  - Apply `select` to return only required fields (Requirement 9.2)
  - _Requirements: 4.1, 4.2, 9.2_

- [x] 9. Rewrite the consolidated issuing page
  - Rewrite `src/app/issue-components/page.tsx` as a `'use client'` component
  - Remove any calls to the deleted `/api/scanner/student` endpoint
  - Implement `BarcodeInput` — auto-submits on Enter, re-focuses after each issue
  - Implement `ManualSearchBar` — debounced name/PRN search calling `GET /api/users/search`
  - Implement `StudentCard` — displays name, PRN, department, active issued items list
  - Implement `ApprovedRequestsList` with `ApprovedRequestRow` and `IssueButton` — calls `POST /api/requests/[id]/issue`
  - On success: clear student selection, return focus to barcode input, show Sonner `toast.success`
  - On error: show Sonner `toast.error(data.error)`; on network error: `toast.error('Network error — please try again')`
  - If no student found: display inline error below the lookup input without navigating away
  - No QR-code scanning UI, camera access, or references to the removed scanner page
  - _Requirements: 2.3, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 10. Checkpoint — Workflow refactor complete
  - Ensure all tests pass. Verify `src/app/scanner/` and `src/app/api/scanner/` directories no longer exist. Verify no `html5-qrcode` imports remain in `src/`. Ask the user if questions arise.

---

### Phase 3 — Dashboard Analytics & User Management

- [x] 11. Extract pure metric computation functions
  - Create `src/lib/metrics/hod-metrics.ts` exporting four pure functions with no Prisma dependency:
    - `computeDepartmentEfficiency(requests: RequestRecord[]): number`
    - `computeBudgetUtilization(items: IssuedItemRecord[], budgetCeiling: number): number`
    - `computeHighPriorityRequests(requests: RequestRecord[], now: Date): number`
    - `computeUtilizationRate(components: ComponentRecord[]): number`
  - Define the `RequestRecord`, `IssuedItemRecord`, and `ComponentRecord` input types in the same file
  - Implement formulas exactly as specified in the design (no `Math.random()`, no hardcoded fallbacks)
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 11.1 Write property test for Department Efficiency formula
  - **Property 3: Department Efficiency formula correctness**
  - Use fast-check to generate arrays of `RequestRecord` with arbitrary `createdAt` / `approvedAt` pairs; assert `computeDepartmentEfficiency` returns exactly the percentage of records where `approvedAt - createdAt ≤ 48h`, with no random contribution
  - Minimum 100 iterations
  - **Validates: Requirements 5.2, 5.6**

- [ ]* 11.2 Write property test for Budget Utilization formula
  - **Property 4: Budget Utilization formula correctness**
  - Generate arrays of `IssuedItemRecord` with arbitrary `quantity` and nullable `cost` values and a positive `budgetCeiling`; assert `computeBudgetUtilization` returns `(sum(quantity × cost) / budgetCeiling) × 100` treating null cost as 0, capped at 100
  - Minimum 100 iterations
  - **Validates: Requirements 5.3, 5.6**

- [ ]* 11.3 Write property test for High Priority Requests count
  - **Property 5: High Priority Requests count correctness**
  - Generate arrays of `RequestRecord` with varying `status` and `createdAt` values and a reference `now` date; assert `computeHighPriorityRequests` returns exactly the count of records where `status = 'PENDING'` and `createdAt < now - 48h`
  - Minimum 100 iterations
  - **Validates: Requirements 5.4, 5.6**

- [ ]* 11.4 Write property test for Utilization Rate formula
  - **Property 6: Utilization Rate formula correctness**
  - Generate arrays of `ComponentRecord` with arbitrary non-negative `totalStock` and `availableStock` (where `availableStock ≤ totalStock`); assert `computeUtilizationRate` returns `sum(totalStock - availableStock) / sum(totalStock) × 100`, returning 0 when total stock is 0
  - Minimum 100 iterations
  - **Validates: Requirements 5.5, 5.6**

- [x] 12. Build the HOD dashboard metrics API route
  - Create or replace `src/app/api/dashboard/hod/route.ts`
  - `GET /api/dashboard/hod` — auth guard: `HOD`
  - Fetch live `ComponentRequest`, `IssuedComponent`, and `Component` records via Prisma with `select` clauses
  - Call the four pure functions from `src/lib/metrics/hod-metrics.ts` with the fetched data
  - Read `DEPT_BUDGET_CEILING` from `process.env` (default `50000`) for budget utilization
  - Wrap the entire data-fetch in `unstable_cache` with `revalidate: 300` (5 minutes)
  - Return `{ departmentEfficiency, budgetUtilization, highPriorityRequests, utilizationRate }`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 13. Update HOD dashboard page to consume real metrics
  - Update `src/app/dashboard/hod/page.tsx` to call `GET /api/dashboard/hod` (or call the cached Prisma function directly as a Server Component)
  - Remove all `Math.random()` calls and hardcoded numeric literals from the dashboard data layer
  - Extract interactive tabs/charts into a `HodDashboardClient` client component that receives metrics as props
  - Render four metric cards: Department Efficiency, Budget Utilization, High Priority Requests, Utilization Rate
  - _Requirements: 5.1, 5.6, 8.1, 8.4_

  - [ ]* 13.1 Write unit tests for HOD dashboard page
    - Verify the page renders exactly four metric cards
    - Verify no `Math.random` call exists in the dashboard data path
    - _Requirements: 5.1, 5.6_

- [x] 14. Add notification creation triggers
  - [x] 14.1 Add HOD notification on new request creation
    - In `src/app/api/requests/route.ts` (POST handler), after creating the `ComponentRequest`, create a `Notification` record with `targetRole='HOD'`, `type='INFO'`, message identifying student name and component name
    - _Requirements: 6.2_

  - [x] 14.2 Add zero-stock WARNING notification inside the issue transaction
    - In `src/app/api/requests/[id]/issue/route.ts`, inside the Prisma `$transaction`, after decrementing stock: if `availableStock - quantity === 0`, create a `Notification` with `targetRole='HOD'`, `type='WARNING'`, message identifying the component name
    - Use the transaction client (`tx`) for this write
    - _Requirements: 6.3, 9.4_

  - [ ]* 14.3 Write property test for new request HOD notification
    - **Property 8: New request triggers HOD notification**
    - For any new `ComponentRequest` persisted via the POST handler, assert a `Notification` with `targetRole='HOD'` and `type='INFO'` exists in the database
    - **Validates: Requirements 6.2**

  - [ ]* 14.4 Write property test for zero-stock WARNING notification
    - **Property 9: Zero-stock triggers WARNING notification**
    - For any issue transaction that results in `availableStock = 0`, assert a `Notification` with `targetRole='HOD'` and `type='WARNING'` exists after the transaction commits
    - **Validates: Requirements 6.3**

- [x] 15. Build the notifications API and panel
  - [x] 15.1 Create or update `src/app/api/notifications/route.ts` to handle `PATCH /api/notifications`
    - Accept `{ ids: string[] }` in the request body
    - Auth guard: any authenticated user
    - Set `isRead=true` for all notification IDs belonging to the caller
    - _Requirements: 6.5_

  - [x] 15.2 Update the notifications panel component to fetch and display real notifications
    - Query the 10 most recent `Notification` records where `userId = session.user.id` OR `targetRole = 'HOD'`, ordered by `createdAt` descending
    - Render each notification's title, message, type badge, and relative timestamp
    - On click, call `PATCH /api/notifications` and update `isRead` state
    - _Requirements: 6.1, 6.4, 6.5_

  - [ ]* 15.3 Write property test for notification ordering and limit
    - **Property 7: Notification ordering and limit**
    - Generate arrays of `Notification` records with arbitrary `createdAt` values; assert the panel displays at most 10 records and those 10 are the ones with the most recent `createdAt` values in descending order
    - **Validates: Requirements 6.1**

  - [ ]* 15.4 Write property test for notification rendering completeness
    - **Property 10: Notification rendering completeness**
    - Generate arbitrary `Notification` objects; assert the rendered notification item includes the title, message, type badge, and a relative timestamp string
    - **Validates: Requirements 6.4**

  - [ ]* 15.5 Write unit tests for notifications panel
    - Verify panel marks notifications as read on click (calls `PATCH /api/notifications`)
    - _Requirements: 6.5_

- [x] 16. Build the User Management page and API
  - [x] 16.1 Create `src/app/api/users/[id]/route.ts` — `PATCH /api/users/[id]`
    - Auth guard: `HOD | ADMIN`
    - Validate `role` with Zod against `['STUDENT', 'LAB_ASSISTANT', 'HOD', 'ADMIN']`; return 400 if invalid
    - Return 404 if user not found; return 400 if caller tries to demote themselves
    - Update `User.role` in the database; return `{ id, name, email, role }`
    - _Requirements: 7.3, 7.4_

  - [ ]* 16.2 Write property test for invalid role rejection
    - **Property 13: Invalid role rejection**
    - Generate arbitrary strings not in `{STUDENT, LAB_ASSISTANT, HOD, ADMIN}`; assert `PATCH /api/users/[id]` returns HTTP 400
    - **Validates: Requirements 7.4**

  - [ ]* 16.3 Write property test for role update round-trip
    - **Property 12: Role update round-trip**
    - For each valid role value, assert that calling `PATCH /api/users/[id]` results in the database record reflecting the new role and a subsequent GET returns the updated role
    - **Validates: Requirements 7.3**

  - [x] 16.4 Create `src/app/users/page.tsx` as a Server Component
    - Auth guard: redirect non-`HOD`/`ADMIN` roles to `/unauthorized`
    - Pre-fetch all `User` records with `select: { id, name, email, role, department, prn, isActive }` (Requirement 9.2)
    - Pass data to `UsersClient` client component
    - _Requirements: 7.1, 7.2, 8.1_

  - [x] 16.5 Create `src/components/users/users-client.tsx` — `'use client'`
    - Render `UserTable` with a row per user showing name, email, role, department, `isActive`
    - Each row has a `RoleChangeTrigger` that opens `RoleChangeDialog`
    - `RoleChangeDialog` shows user name, current role → new role confirmation; Confirm / Cancel buttons
    - On confirm: call `PATCH /api/users/[id]`, show Sonner toast, update local state
    - _Requirements: 7.1, 7.6_

  - [ ]* 16.6 Write unit tests for user management
    - Verify `PATCH /api/users/[id]` returns 401 for `STUDENT` caller
    - Verify `PATCH /api/users/[id]` returns 401 for `LAB_ASSISTANT` caller
    - Verify `PATCH /api/users/[id]` returns 404 for non-existent user ID
    - Verify `/users` page renders a table row for each user in the dataset
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 17. Checkpoint — Dashboard and user management complete
  - Ensure all tests pass. Verify HOD dashboard renders four metric cards with no `Math.random()` in the data path. Verify `/users` page is accessible to HOD and ADMIN and redirects other roles. Ask the user if questions arise.

---

### Phase 4 — Performance & Caching

- [x] 18. Add Prisma schema indexes
  - Add `@@index([status])` and `@@index([studentId])` to the `ComponentRequest` model in `prisma/schema.prisma`
  - Add `@@index([studentId])` to the `IssuedComponent` model in `prisma/schema.prisma`
  - Run `npx prisma migrate dev --name add-query-indexes` to apply the migration
  - _Requirements: 9.5_

- [x] 19. Convert HOD dashboard page to Server Component with caching
  - Ensure `src/app/dashboard/hod/page.tsx` is a Server Component (no `'use client'` at the top level)
  - Wrap the Prisma data-fetch in `unstable_cache` with `['hod-metrics']` cache key and `revalidate: 300`
  - Add `select` clauses to all Prisma queries: `ComponentRequest` selects `createdAt`, `approvedAt`, `status`, `studentId`; `IssuedComponent` selects `quantity`, `status`, `studentId`; `Component` selects `cost`, `totalStock`, `availableStock`
  - Interactive tabs extracted to `HodDashboardClient` receive metrics as props
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.3_

- [x] 20. Convert inventory browse page to Server Component with ISR
  - Convert `src/app/inventory/browse/page.tsx` to a Server Component
  - Add `export const revalidate = 60` at the top of the file
  - Wrap Prisma `component.findMany` in `unstable_cache` or React `cache()`; add `select: { id, name, category, availableStock, totalStock, condition }` (omit `specifications`, `description`)
  - Extract search/filter UI into `InventoryBrowseClient` client component receiving the pre-fetched list as props
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6, 9.1_

- [x] 21. Convert all-requests page to Server Component with caching
  - Convert `src/app/requests/all/page.tsx` to a Server Component
  - Wrap Prisma `componentRequest.findMany` in `unstable_cache` with `revalidate: 30`
  - Add nested `select` on `student` (`id`, `name`, `prn`, `department`) and `component` (`id`, `name`, `category`) relations
  - Extract issue modal and action buttons into `AllRequestsClient` client component
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.3_

- [x] 22. Add `force-dynamic` to the approvals page
  - Add `export const dynamic = 'force-dynamic'` to `src/app/approvals/page.tsx`
  - Ensure the page fetches `PENDING` requests directly via Prisma (Server Component) with a `select` clause
  - _Requirements: 8.5, 9.3_

- [x] 23. Add `select` clauses to remaining list-view API routes
  - Audit all `prisma.component.findMany` calls in `src/app/api/` list routes; add `select` returning at minimum `id`, `name`, `category`, `availableStock`, `totalStock`, `condition`
  - Audit all `prisma.user.findMany` calls; add `select` returning at minimum `id`, `name`, `email`, `role`, `department`, `prn`, `isActive`
  - Audit all `prisma.componentRequest.findMany` calls; add nested `select` on `student` and `component` relations
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 24. Final checkpoint — Performance phase complete
  - Ensure all tests pass. Verify `export const revalidate = 60` is present on the inventory browse page. Verify `export const dynamic = 'force-dynamic'` is present on the approvals page. Verify `@@index` directives are present in `prisma/schema.prisma` for `ComponentRequest.status`, `ComponentRequest.studentId`, and `IssuedComponent.studentId`. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints at tasks 4, 10, 17, and 24 ensure incremental validation between phases
- Property tests (Properties 3–6) target the four pure metric functions in `src/lib/metrics/hod-metrics.ts` using fast-check; extract these functions before writing the tests
- Unit tests use the existing Jest setup (`jest.config.js`, `jest.setup.js`)
- All Prisma writes inside `$transaction` blocks must use the transaction client (`tx`) — not the global `prisma` instance
- The `html5-qrcode` package entry in `package.json` may remain; only its imports in `src/` must be removed
- `DEPT_BUDGET_CEILING` defaults to `50000` if the environment variable is not set
