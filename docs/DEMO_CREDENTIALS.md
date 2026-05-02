# Demo Credentials - IoT Parts Management System

## ✅ Verified Working Credentials

All users have been verified to exist in the database and are active.

### 1. Student Account
```
Email: demo.student@sies.edu
Password: student123
Role: STUDENT
Department: Computer Engineering
```

**Access:**
- Dashboard
- My Projects
- Inventory (Browse)
- Requests (View/Create)
- Special Requests
- Parts Issued

### 2. Lab Assistant Account
```
Email: lab.assistant@sies.edu
Password: lab123
Role: LAB_ASSISTANT
Department: Computer Engineering
```

**Access:**
- Dashboard
- Browse Inventory
- Manage Inventory
- Issue Components
- QR Scanner
- All Requests
- Approve/Reject Requests

### 3. HOD (Head of Department) Account
```
Email: hod@sies.edu
Password: hod123
Role: HOD
Department: Computer Engineering
```

**Access:**
- Dashboard
- Pending Approvals
- Browse Inventory
- Manage Inventory
- All Requests
- User Management
- Full System Access

## Sign In Instructions

### Method 1: Direct Sign In
1. Go to: `http://localhost:3000/auth/signin`
2. Enter email and password
3. Click "Sign In"

### Method 2: From Home Page
1. Go to: `http://localhost:3000`
2. Click "Sign In" button
3. Enter credentials

## Troubleshooting

### Issue: "Invalid credentials" error

**Solution 1: Check Email Format**
- Make sure email is exactly as shown (case-sensitive)
- Include `@sies.edu` domain
- No extra spaces

**Solution 2: Check Password**
- Passwords are case-sensitive
- student123 (all lowercase)
- lab123 (all lowercase)
- hod123 (all lowercase)

**Solution 3: Clear Browser Data**
```
1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Refresh page
5. Try signing in again
```

**Solution 4: Check Database**
Run this command to verify users exist:
```bash
node check-users.js
```

### Issue: Redirected to error page

**Check:**
1. Server is running: `npm run dev`
2. Database is accessible
3. Environment variables are set (`.env` file exists)

### Issue: "Unauthorized" after sign in

**Possible causes:**
- Session not being created properly
- JWT token issue
- Database connection problem

**Solution:**
1. Stop the server (Ctrl+C)
2. Clear `.next` folder: `rmdir /s /q .next` (Windows) or `rm -rf .next` (Mac/Linux)
3. Restart server: `npm run dev`
4. Try signing in again

## Testing All Accounts

### Quick Test Script
```bash
# Check all users exist
node check-users.js

# Should show:
# ✅ Lab Assistant user exists!
# ✅ Student user exists!
# ✅ HOD user exists!
```

## Password Reset (Development Only)

If you need to reset passwords, edit `src/lib/auth.ts`:

```typescript
const validPasswords: Record<string, string> = {
  'hod@sies.edu': 'hod123',
  'lab.assistant@sies.edu': 'lab123',
  'demo.student@sies.edu': 'student123',
}
```

Change the password values, save, and restart the server.

## Common Mistakes

❌ **Wrong:** `Lab.Assistant@sies.edu` (capital L)
✅ **Correct:** `lab.assistant@sies.edu` (all lowercase)

❌ **Wrong:** `lab.assistant@sies.edu.in`
✅ **Correct:** `lab.assistant@sies.edu`

❌ **Wrong:** `Lab123` (capital L)
✅ **Correct:** `lab123` (all lowercase)

❌ **Wrong:** Extra spaces in email or password
✅ **Correct:** No spaces before or after

## Role-Based Access

| Feature | Student | Lab Assistant | HOD |
|---------|---------|---------------|-----|
| View Inventory | ✅ | ✅ | ✅ |
| Request Components | ✅ | ❌ | ❌ |
| Issue Components | ❌ | ✅ | ✅ |
| Approve Requests | ❌ | ✅ | ✅ |
| Manage Inventory | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |
| QR Scanner | ❌ | ✅ | ✅ |
| Special Requests | ✅ | ❌ | ❌ |

## Need Help?

1. **Check server logs** - Look for authentication errors
2. **Check browser console** (F12) - Look for JavaScript errors
3. **Verify database** - Run `node check-users.js`
4. **Clear cache** - Clear browser data and restart
5. **Restart server** - Stop and start `npm run dev`

## Status
✅ All demo accounts verified and working
✅ Passwords confirmed in auth configuration
✅ Database records confirmed
✅ Ready for testing
