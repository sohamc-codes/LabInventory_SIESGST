# User Roles & Permissions Guide

## Overview
The IoT Parts Management system has **5 user roles** with different levels of access and permissions.

---

## User Roles

### 1. 👨‍🎓 **STUDENT** (Default Role)
**Description**: Students who request and use components for their projects.

**Permissions**:
- ✅ Create component requests
- ✅ View their own requests
- ✅ View their issued components
- ✅ Track upcoming returns
- ✅ Create special part requests
- ✅ View their own dashboard
- ✅ Search for available components
- ❌ Cannot approve requests
- ❌ Cannot issue components
- ❌ Cannot manage inventory
- ❌ Cannot view other students' data

**Access**:
- Dashboard: `/dashboard/student`
- My Requests: `/requests/my-requests`
- New Request: `/requests/new`
- Special Requests: `/special-requests`
- Smart Search: Available

**Data Scope**: Can only see their own data (requests, issued items, projects)

---

### 2. 🔬 **LAB_ASSISTANT**
**Description**: Lab staff who manage day-to-day operations, issue components, and handle returns.

**Permissions**:
- ✅ View all component requests
- ✅ Issue approved components to students
- ✅ Process component returns
- ✅ Scan student PRN for returns
- ✅ Manage inventory (add/edit components)
- ✅ View low stock alerts
- ✅ Create/edit components
- ✅ View all students' requests
- ✅ Track pending approvals
- ✅ View analytics and reports
- ❌ Cannot approve/reject requests (HOD only)
- ❌ Cannot manage users

**Access**:
- Dashboard: `/dashboard/lab-assistant`
- All Requests: `/requests/all`
- Manage Inventory: `/inventory/manage`
- Return Components: `/parts-issued`
- Bulk Import: `/bulk-import`
- Reports: `/reports`
- Activity Log: `/activity`

**Data Scope**: Can see all requests and components across the organization

**Special Features**:
- PRN scanning for quick student lookup
- Bulk component import
- Stock movement tracking
- Return deadline management

---

### 3. 👔 **HOD** (Head of Department)
**Description**: Department heads who approve requests and oversee department operations.

**Permissions**:
- ✅ **Approve or reject** component requests
- ✅ Bulk approve multiple requests
- ✅ View department-specific requests
- ✅ View all components and inventory
- ✅ Manage users (add/edit/deactivate)
- ✅ View department efficiency metrics
- ✅ View high-priority requests
- ✅ Access advanced analytics
- ✅ Review special part requests
- ✅ Issue components (same as Lab Assistant)
- ❌ Cannot manage organization settings (OWNER/ADMIN only)

**Access**:
- Dashboard: `/dashboard/hod`
- Approvals: `/approvals`
- All Requests: `/requests/all`
- User Management: `/users`
- Manage Inventory: `/inventory/manage`
- Reports: `/reports`
- System Health: `/admin/system-health`

**Data Scope**: 
- Can see all requests from their department
- Can approve requests department-wide
- Can view organization-wide inventory

**Special Features**:
- Bulk approval workflow
- Department efficiency tracking
- High-priority request alerts
- Rejection reason tracking

---

### 4. 🛡️ **ADMIN**
**Description**: System administrators with full access to all features and settings.

**Permissions**:
- ✅ **All HOD permissions**
- ✅ **All LAB_ASSISTANT permissions**
- ✅ Manage all users across organization
- ✅ View system health metrics
- ✅ Access audit logs
- ✅ Configure system settings
- ✅ Manage integrations
- ✅ View all analytics
- ✅ Access billing information
- ✅ Manage organization settings
- ❌ Cannot delete organization (OWNER only)

**Access**:
- All pages and features
- Admin Panel: `/admin/system-health`
- Settings: `/settings/organization`
- Billing: `/settings/billing`
- Integrations: `/integrations`
- Audit Logs: Full access

**Data Scope**: Full access to all data across the organization

**Special Features**:
- System health monitoring
- Audit log access
- Integration management
- Advanced configuration

---

### 5. 👑 **OWNER**
**Description**: Organization owner with ultimate control (created during signup).

**Permissions**:
- ✅ **All ADMIN permissions**
- ✅ Delete organization
- ✅ Transfer ownership
- ✅ Manage billing and subscriptions
- ✅ Invite organization members
- ✅ Configure organization-wide settings
- ✅ Access all features

**Access**:
- All pages and features
- Organization Settings: Full control
- Billing Management: Full control
- Member Invitations: Can invite and remove

**Data Scope**: Full access to all data and settings

**Special Features**:
- Organization deletion
- Ownership transfer
- Subscription management
- Member invitation system

**Note**: Only one OWNER per organization (created during signup)

---

## Role Hierarchy

```
OWNER (Highest Authority)
  ↓
ADMIN (System Administration)
  ↓
HOD (Department Management & Approvals)
  ↓
LAB_ASSISTANT (Operations & Inventory)
  ↓
STUDENT (Component Users)
```

---

## Permission Matrix

| Feature | STUDENT | LAB_ASSISTANT | HOD | ADMIN | OWNER |
|---------|---------|---------------|-----|-------|-------|
| **Requests** |
| Create Request | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Requests | ✅ | ✅ | ✅ | ✅ | ✅ |
| View All Requests | ❌ | ✅ | ✅ (Dept) | ✅ | ✅ |
| Approve/Reject | ❌ | ❌ | ✅ | ✅ | ✅ |
| Bulk Approve | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Inventory** |
| View Components | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add/Edit Components | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delete Components | ❌ | ✅ | ✅ | ✅ | ✅ |
| Bulk Import | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Issuing** |
| Issue Components | ❌ | ✅ | ✅ | ✅ | ✅ |
| Process Returns | ❌ | ✅ | ✅ | ✅ | ✅ |
| Scan PRN | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Users** |
| View Users | ❌ | ❌ | ✅ | ✅ | ✅ |
| Add/Edit Users | ❌ | ❌ | ✅ | ✅ | ✅ |
| Deactivate Users | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Analytics** |
| View Own Stats | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Reports | ❌ | ✅ | ✅ | ✅ | ✅ |
| View Analytics | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Administration** |
| System Health | ❌ | ❌ | ✅ | ✅ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ✅ | ✅ |
| Integrations | ❌ | ❌ | ❌ | ✅ | ✅ |
| Org Settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Billing | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete Org | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Dashboard Views

### Student Dashboard
- Active requests count
- Items issued count
- Recent requests list
- Upcoming returns with risk assessment
- Quick actions (New Request, My Requests, Issued Items)

### Lab Assistant Dashboard
- Pending requests count
- Low stock alerts
- Recent activity
- Quick issue components
- Return management

### HOD Dashboard
- Department efficiency metrics
- High-priority requests
- Pending approvals with bulk actions
- Low stock alerts
- Utilization rate

---

## Role Assignment

### Default Role
- New users are assigned **STUDENT** role by default

### Role Assignment Methods

1. **During Signup** (OWNER only):
   ```typescript
   // First user becomes OWNER
   role: 'OWNER'
   ```

2. **Via User Management** (HOD/ADMIN/OWNER):
   - Navigate to `/users`
   - Edit user
   - Select role from dropdown

3. **Via API** (Programmatic):
   ```typescript
   await prisma.user.update({
     where: { id: userId },
     data: { role: 'LAB_ASSISTANT' }
   })
   ```

---

## Authentication Methods by Role

| Role | Microsoft SSO | Email/Password |
|------|---------------|----------------|
| STUDENT | ✅ | ❌ |
| LAB_ASSISTANT | ✅ | ✅ |
| HOD | ✅ | ✅ |
| ADMIN | ✅ | ✅ |
| OWNER | ✅ | ✅ |

**Note**: Students typically use Microsoft SSO (organizational accounts), while staff can use either method.

---

## Role-Based Routing

### Protected Routes

```typescript
// Student-only routes
/dashboard/student
/requests/my-requests

// Lab Assistant+ routes
/dashboard/lab-assistant
/parts-issued
/bulk-import

// HOD+ routes
/dashboard/hod
/approvals
/users

// Admin+ routes
/admin/system-health
/settings/organization
/settings/billing
/integrations
```

### Redirect Logic
- Students accessing `/parts-issued` → Redirected to `/dashboard/student`
- Unauthenticated users → Redirected to `/auth/signin`
- Wrong role for page → Redirected to appropriate dashboard

---

## Best Practices

### For Administrators

1. **Assign Roles Carefully**
   - Only assign LAB_ASSISTANT to trusted staff
   - HOD role should match actual department heads
   - Limit ADMIN role to IT staff

2. **Regular Audits**
   - Review user roles quarterly
   - Deactivate users who leave
   - Check audit logs for suspicious activity

3. **Principle of Least Privilege**
   - Start with STUDENT role
   - Upgrade only when necessary
   - Downgrade when responsibilities change

### For Users

1. **Students**
   - Request components responsibly
   - Return items on time
   - Keep PRN updated

2. **Lab Assistants**
   - Verify student identity before issuing
   - Check component condition on return
   - Update stock levels promptly

3. **HODs**
   - Review requests within 48 hours
   - Provide clear rejection reasons
   - Monitor department efficiency

---

## Security Considerations

### Role Verification
- All API routes verify user role
- Frontend hides unauthorized features
- Backend enforces permissions

### Data Isolation
- Students see only their data
- HODs see department data
- Admins see all data

### Audit Trail
- All role changes logged
- Permission checks logged
- Failed access attempts tracked

---

## Common Scenarios

### Scenario 1: New Student Joins
1. Student signs up with Microsoft SSO
2. Automatically assigned STUDENT role
3. Can immediately create requests
4. HOD approves first request

### Scenario 2: Lab Assistant Hired
1. Admin creates user account
2. Assigns LAB_ASSISTANT role
3. Sets up credentials authentication
4. Lab assistant can issue components

### Scenario 3: HOD Promotion
1. Admin/Owner edits user
2. Changes role from LAB_ASSISTANT to HOD
3. User gains approval permissions
4. Can now approve department requests

### Scenario 4: Student Graduates
1. Admin deactivates user account
2. User loses access
3. Historical data preserved
4. Can be reactivated if needed

---

## Troubleshooting

### "Access Denied" Error
- Check user role in database
- Verify route permissions
- Check session validity

### Wrong Dashboard Displayed
- Clear browser cache
- Re-login
- Check role assignment

### Cannot Approve Requests
- Verify HOD role assigned
- Check department match
- Ensure request is PENDING

---

## API Role Checks

### Example: Request Approval
```typescript
// Only HOD, ADMIN, OWNER can approve
if (!['HOD', 'ADMIN', 'OWNER'].includes(session.user.role)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

### Example: View All Requests
```typescript
// Students see only their requests
if (session.user.role === 'STUDENT') {
  where.studentId = session.user.id
}
// HODs see department requests
else if (session.user.role === 'HOD') {
  where.student = { department: session.user.department }
}
// Admins see all requests
```

---

## Summary

**5 Roles**:
1. **STUDENT** - Request and use components
2. **LAB_ASSISTANT** - Issue components and manage inventory
3. **HOD** - Approve requests and manage department
4. **ADMIN** - Full system administration
5. **OWNER** - Organization owner with ultimate control

**Key Principle**: Each role builds upon the previous one, with increasing levels of access and responsibility.

---

**Last Updated**: May 2, 2026
