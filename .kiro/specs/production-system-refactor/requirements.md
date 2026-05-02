# Requirements Document

## Introduction

This document specifies the requirements for a 4-phase production refactor of the SIES GST IoT Parts Management System — a Next.js 15 / Prisma / NextAuth 5 application used by students, lab assistants, and HODs to manage IoT component inventory and issuing workflows.

The system currently suffers from four categories of production-blocking problems:
1. **UI/Theming** — Hardcoded light-mode color classes clash with the dark zinc/slate theme, producing unreadable contrast in modals and cards.
2. **Workflow** — The HOD role cannot issue components directly; a QR scanner page exists that is not used; the issuing flow is fragmented across multiple pages.
3. **Dashboard & User Management** — The HOD dashboard mixes real database queries with `Math.random()` dummy data; the user management module referenced in the sidebar does not exist.
4. **Performance** — All pages are Client Components fetching data on the client; no caching layer exists; Prisma queries select full rows where only a few fields are needed.

---

## Glossary

- **System**: The SIES GST IoT Parts Management web application.
- **Design_System**: The set of Tailwind CSS semantic variables (`bg-background`, `text-foreground`, `border-border`, etc.) defined in `globals.css` and consumed by all UI components.
- **Theme_Provider**: The `next-themes` `ThemeProvider` component that applies the `dark` or `light` class to the HTML root.
- **HOD**: Head of Department — a privileged role that approves requests and, after this refactor, may also issue components directly.
- **Lab_Assistant**: A role that manages physical inventory and issues components to students.
- **Issuing_Page**: The consolidated page at `/issue-components` used to hand over physical components to a student.
- **Scanner_Page**: The legacy page at `/scanner` that implements QR-code scanning of physical components — to be removed.
- **Student_Lookup**: The action of finding a student record by scanning a barcode on their ID card (PRN input) or by typing their name/PRN into a search bar.
- **Dashboard**: The role-specific landing page shown after login (`/dashboard/hod`, `/dashboard/lab-assistant`, `/dashboard/student`).
- **Metric**: A single real-time numeric value derived from live database queries with no random or hardcoded fallback.
- **Cache**: A server-side data cache implemented with Next.js `unstable_cache` or React `cache()`.
- **Server_Component**: A React component that runs exclusively on the server and fetches its own data.
- **Client_Component**: A React component marked `'use client'` that runs in the browser and handles interactivity.
- **Prisma_Select**: A Prisma query option that limits the returned fields to only those required by the caller.
- **RBAC**: Role-Based Access Control — the mechanism that restricts API routes and UI actions based on the authenticated user's role.

---

## Requirements

### Requirement 1: Semantic Design System

**User Story:** As a user of the system, I want every page to render with correct, readable contrast in both light and dark mode, so that I can use the application without straining to read text against mismatched backgrounds.

#### Acceptance Criteria

1. THE Design_System SHALL define all color roles exclusively through CSS custom properties (`--background`, `--foreground`, `--card`, `--card-foreground`, `--border`, `--input`, `--ring`, `--primary`, `--primary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`) in `globals.css` for both `:root` (light) and `.dark` (dark) selectors.
2. THE System SHALL apply Tailwind semantic utility classes (`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `border-border`, etc.) to all layout containers, cards, modals, and form elements — replacing any hardcoded color classes such as `bg-white`, `bg-gray-50`, `text-gray-900`, `text-black`, or `bg-zinc-950` used on those elements.
3. WHEN a modal or dialog is rendered, THE System SHALL display its header, body, and footer using `bg-card text-card-foreground` so that the modal background and text are always readable against the page backdrop in both themes.
4. THE Theme_Provider SHALL wrap the application root and default to the `dark` theme, persisting the user's preference in `localStorage`.
5. WHEN the user toggles the theme, THE System SHALL re-render all visible components using the new theme's CSS variable values without a full page reload.
6. THE Design_System SHALL preserve the existing zinc/slate dark-mode palette values already defined in `globals.css` and SHALL NOT introduce new color tokens that conflict with the existing shadcn/ui token names.

---

### Requirement 2: HOD Issuing Privilege

**User Story:** As an HOD, I want to be able to issue approved components directly to students, so that I can handle issuing without requiring a lab assistant to be present.

#### Acceptance Criteria

1. WHEN an authenticated user with role `HOD` calls `POST /api/requests/[id]/issue`, THE System SHALL process the request with the same atomic Prisma transaction used for `LAB_ASSISTANT` — decrementing stock, creating an `IssuedComponent` record, updating request status to `ISSUED`, writing a `StockMovement` audit record, writing an `AuditLog` entry, and notifying the student.
2. THE System SHALL enforce that only users with role `LAB_ASSISTANT` or `HOD` may call `POST /api/requests/[id]/issue`; all other roles SHALL receive a `401 Unauthorized` response.
3. THE Issuing_Page SHALL be accessible to users with role `LAB_ASSISTANT` or `HOD`; users with other roles SHALL be redirected to `/unauthorized`.
4. THE Sidebar SHALL display the "Issue Components" navigation link for both `LAB_ASSISTANT` and `HOD` roles.
5. WHEN an HOD issues a component, THE System SHALL record the HOD's user ID in the `issuedBy` field of the `IssuedComponent` record.

---

### Requirement 3: QR Scanner Removal

**User Story:** As a system administrator, I want all QR-scanning functionality removed from the application, so that the codebase does not contain unused pages, routes, or dependencies that add maintenance burden.

#### Acceptance Criteria

1. THE System SHALL remove the page file at `src/app/scanner/page.tsx` and its containing directory.
2. THE System SHALL remove the API route files at `src/app/api/scanner/component/route.ts` and `src/app/api/scanner/student/route.ts` and their containing directories.
3. THE Sidebar SHALL NOT render a "QR Scanner" navigation link for any role.
4. THE System SHALL remove the `html5-qrcode` package import from any component or page file; the package entry in `package.json` MAY remain but SHALL NOT be imported anywhere in the application source.
5. IF a user navigates directly to `/scanner`, THE System SHALL return a Next.js 404 not-found response.

---

### Requirement 4: Consolidated Student-Focused Issuing Page

**User Story:** As a lab assistant or HOD, I want a single, clean issuing page that lets me find a student by barcode scan or name/PRN search and then issue an approved component to them, so that I can complete the issuing workflow without navigating between multiple pages.

#### Acceptance Criteria

1. THE Issuing_Page SHALL present exactly two Student_Lookup methods: a barcode-scanner input field that accepts keyboard input from a USB barcode scanner (auto-submits on Enter), and a manual search bar that queries the database by student name or PRN.
2. WHEN a student is identified via either lookup method, THE Issuing_Page SHALL display the student's name, PRN, department, and a list of their currently active issued items.
3. WHEN a student is identified, THE Issuing_Page SHALL display a list of that student's `APPROVED` component requests, each showing the component name, requested quantity, and an "Issue" button.
4. WHEN the "Issue" button is clicked for an approved request, THE Issuing_Page SHALL call `POST /api/requests/[id]/issue` and display a success or error toast using Sonner.
5. WHEN a component is successfully issued, THE Issuing_Page SHALL clear the student selection and return focus to the barcode input field, ready for the next transaction.
6. IF no student is found for the given PRN or name query, THE Issuing_Page SHALL display an inline error message without navigating away from the page.
7. THE Issuing_Page SHALL NOT contain any QR-code scanning UI, camera access requests, or references to the removed Scanner_Page.

---

### Requirement 5: Real-Time Dashboard Metrics

**User Story:** As an HOD, I want my dashboard to show four accurate, real-time metrics derived from live database data, so that I can make informed decisions without being misled by placeholder or randomly generated numbers.

#### Acceptance Criteria

1. THE Dashboard SHALL display exactly four Metric cards: Department Efficiency, Budget Utilization, High Priority Requests, and Utilization Rate.
2. THE System SHALL compute Department Efficiency as the percentage of component requests in the HOD's department that were approved within 48 hours of creation, calculated from live `ComponentRequest` records.
3. THE System SHALL compute Budget Utilization as the ratio of the sum of `(IssuedComponent.quantity × Component.cost)` for all currently active issued items in the department to a configurable department budget ceiling, expressed as a percentage; WHERE no `Component.cost` is set, THE System SHALL treat that component's cost as zero.
4. THE System SHALL compute High Priority Requests as the count of `ComponentRequest` records with status `PENDING` that were created more than 48 hours ago in the HOD's department.
5. THE System SHALL compute Utilization Rate as the ratio of `(Component.totalStock − Component.availableStock)` summed across all components in the organization to the sum of `Component.totalStock` across all components, expressed as a percentage.
6. THE Dashboard API SHALL NOT use `Math.random()`, hardcoded numeric literals, or any other non-database source to populate Metric values.
7. WHEN the HOD dashboard data is fetched, THE System SHALL use a Cache with a maximum staleness of 5 minutes so that repeated page loads within that window do not re-query the database.

---

### Requirement 6: Real-Time Dashboard Notifications

**User Story:** As an HOD, I want the dashboard notifications panel to show actual recent system events, so that I am aware of new requests and low-stock alerts without manually checking each page.

#### Acceptance Criteria

1. THE Dashboard SHALL display a notifications panel showing the 10 most recent `Notification` records where `userId` matches the authenticated HOD's ID or `targetRole` equals `HOD`, ordered by `createdAt` descending.
2. WHEN a new `ComponentRequest` is created by a student in the HOD's department, THE System SHALL create a `Notification` record with `targetRole = 'HOD'`, `type = 'INFO'`, and a message identifying the student name and component name.
3. WHEN a `Component`'s `availableStock` falls to zero after an issue transaction, THE System SHALL create a `Notification` record with `targetRole = 'HOD'`, `type = 'WARNING'`, and a message identifying the component name.
4. THE Dashboard notifications panel SHALL display each notification's title, message, type badge, and relative timestamp.
5. WHEN the HOD marks a notification as read, THE System SHALL call `PATCH /api/notifications` and update the `isRead` field to `true` in the database.

---

### Requirement 7: User Management Module

**User Story:** As an HOD or ADMIN, I want a user management page where I can list all users, view their roles, and change a user's role, so that I can maintain correct access control without direct database access.

#### Acceptance Criteria

1. THE System SHALL provide a page at `/users` that lists all `User` records in the organization, displaying each user's name, email, role, department, and `isActive` status.
2. WHEN an authenticated user with role `HOD` or `ADMIN` accesses `/users`, THE System SHALL render the user list; users with other roles SHALL be redirected to `/unauthorized`.
3. THE System SHALL provide an API route `PATCH /api/users/[id]` that accepts a `role` field and updates the target user's role in the database; only users with role `HOD` or `ADMIN` may call this route.
4. WHEN a role change is submitted, THE System SHALL validate that the new role is one of `STUDENT`, `LAB_ASSISTANT`, `HOD`, or `ADMIN` before persisting the change; IF the role is invalid, THE System SHALL return a `400 Bad Request` response.
5. THE Sidebar SHALL display the "User Management" navigation link for `HOD` and `ADMIN` roles.
6. THE System SHALL display a confirmation dialog before applying a role change, showing the user's name, current role, and new role.

---

### Requirement 8: Performance — Server Components and Caching

**User Story:** As a user of the system, I want pages to load quickly, so that I can complete my tasks without waiting for slow data fetches.

#### Acceptance Criteria

1. THE System SHALL convert the HOD dashboard page (`/dashboard/hod`), the inventory browse page (`/inventory/browse`), and the all-requests page (`/requests/all`) from Client Components that fetch data via `useEffect` or TanStack Query to Server_Components that fetch data directly using `async/await` Prisma calls.
2. THE System SHALL wrap all Server_Component data-fetching functions with `unstable_cache` or React `cache()`, specifying a `revalidate` interval of 60 seconds for inventory data and 30 seconds for request data.
3. THE System SHALL add `select` clauses to all Prisma queries used in Server_Component data-fetching functions, limiting returned fields to only those rendered by the component.
4. WHEN a page contains interactive elements (search inputs, filter buttons, modals, action buttons), THE System SHALL extract those elements into dedicated Client_Components that receive pre-fetched data as props from the parent Server_Component.
5. THE System SHALL add `export const dynamic = 'force-dynamic'` to any page that must always reflect the latest database state (e.g., the approvals page) to prevent stale static generation.
6. THE System SHALL add `export const revalidate = 60` to pages whose data changes infrequently (e.g., inventory browse) to enable Incremental Static Regeneration.

---

### Requirement 9: Performance — Prisma Query Optimization

**User Story:** As a system operator, I want Prisma queries to fetch only the data they need, so that database round-trips are fast and API response payloads are small.

#### Acceptance Criteria

1. THE System SHALL add `select` clauses to all `prisma.component.findMany` calls in list-view API routes, returning at minimum `id`, `name`, `category`, `availableStock`, `totalStock`, and `condition`, and omitting large text fields such as `specifications` and `description` unless the route explicitly needs them.
2. THE System SHALL add `select` clauses to all `prisma.user.findMany` calls in list-view API routes, returning at minimum `id`, `name`, `email`, `role`, `department`, `prn`, and `isActive`, and omitting `image` and `settings` fields unless required.
3. THE System SHALL add `select` clauses to all `prisma.componentRequest.findMany` calls in list-view API routes, including nested `select` on the `student` and `component` relations to avoid fetching full user and component rows.
4. WHEN a Prisma query is used inside a Prisma `$transaction`, THE System SHALL use the transaction client (`tx`) for all reads and writes within that transaction to ensure consistency.
5. THE System SHALL add database indexes (via Prisma schema `@@index` directives) on `ComponentRequest.status`, `ComponentRequest.studentId`, and `IssuedComponent.studentId` to accelerate the most frequent query patterns.
