# Phase 1 UI/UX Audit - Feedback & State Consistency

## Audit Date: 2026-07-11
## Status: In Progress

---

## Critical Pages to Audit (Core User Flows)

### 1. **Student Flow Pages**
- [ ] `/requests/new` - Create new request
- [ ] `/requests/my-requests` - View my requests
- [ ] `/dashboard/student` - Student dashboard
- [ ] `/parts-issued` - View issued parts

### 2. **Lab Assistant Flow Pages**
- [ ] `/approvals` - Approve/reject requests
- [ ] `/issue-components` - Issue components to students
- [ ] `/parts-issued` - Mark returns
- [ ] `/inventory/manage` - Manage inventory (Add/Edit/Delete/Adjust Stock)
- [ ] `/dashboard/lab-assistant` - Lab assistant dashboard
- [ ] `/users/import` - Bulk PRN import

### 3. **HOD Flow Pages**
- [ ] `/requests/all` - View all requests
- [ ] `/dashboard/hod` - HOD dashboard
- [ ] `/users` - User management

### 4. **Shared Pages**
- [ ] `/auth/signin` - Login page
- [ ] `/onboarding` - PRN onboarding (now optional)

---

## Phase 1 Checklist Items Per Page

For each page, check:

### A. Loading States
- [ ] Button shows spinner when clicked
- [ ] Button is disabled during async operation
- [ ] Cannot double-click/double-submit
- [ ] Form inputs disabled during submission
- [ ] "Fetching" state for data loads

### B. Toast Notifications
- [ ] Success toast on mutation success (green)
- [ ] Error toast on mutation failure (red)
- [ ] No raw alert() calls
- [ ] Toast shows meaningful message
- [ ] Toast auto-dismisses after 3-5s

### C. Empty States
- [ ] Icon displayed
- [ ] Heading text
- [ ] Subtext/description
- [ ] Optional CTA button
- [ ] Matches design pattern

### D. Error States
- [ ] Network error shows inline message
- [ ] 500 error shows inline message
- [ ] 404 shows inline message
- [ ] Retry button available
- [ ] Never stuck on loading spinner

### E. Confirmation Dialogs
- [ ] Delete actions show confirmation
- [ ] Reject actions show confirmation
- [ ] Destructive actions show warning
- [ ] Cancel button available
- [ ] Clear consequence messaging

---

## Detailed Page-by-Page Audit


### Page 1: `/approvals` - Pending Approvals

**Current State:**
- ✅ Has loading state with spinner
- ✅ Has empty state with icon
- ✅ Issue button shows loading state (`issuingId`)
- ✅ Issue button disabled during operation
- ⚠️ Reject button: NO loading state
- ⚠️ Reject uses raw `alert()` instead of toast
- ⚠️ Reject error handling: no toast
- ✅ Has confirmation modal for Issue
- ⚠️ Reject modal: NO confirmation (just reason input)
- ✅ Toast for issue success/error

**Required Fixes:**
1. Add loading state to Reject button
2. Replace `alert()` with toast notification (line 60)
3. Add toast for reject success
4. Add toast for reject error (line 79)
5. Make reject modal explicitly confirm destructive action
6. Add retry mechanism if network fails

---

