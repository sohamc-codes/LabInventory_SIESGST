# Login Guide - How to Access Different Roles

## Current Situation

You're logged in as a **STUDENT** with Microsoft SSO (`sohamscecs123@gst.sies.edu.in`), but you've changed your role to **ADMIN** in Supabase. The session is cached, so you need to refresh it.

---

## Solution 1: Refresh Your Current Account (Recommended)

### Step 1: Sign Out Completely
1. Click on your profile in the top-right corner
2. Click "Sign Out"
3. **Clear browser cache** or use **Incognito/Private mode**

### Step 2: Sign In Again
1. Go to the login page
2. Sign in with Microsoft SSO using `sohamscecs123@gst.sies.edu.in`
3. Your new **ADMIN** role will be loaded from the database

### Why This Works:
NextAuth caches your session. Signing out and back in forces it to fetch the updated role from Supabase.

---

## Solution 2: Use Lab Assistant Credentials

Your application has a **Lab Assistant account** with email/password authentication.

### Default Lab Assistant Credentials:

```
Email: lab.staff@sies.edu
Password: lab123
```

### How to Login as Lab Assistant:

1. Go to the login page
2. Click **"Lab Assistant / Staff Login"** (the link at the bottom)
3. Enter the credentials above
4. You'll be logged in as **LAB_ASSISTANT**

### Create the Lab Assistant Account (If Not Exists):

Run this command in your terminal:

```bash
cd iot_parts_management-main
node scripts/seed-lab-assistant.js
```

This will create the lab assistant account with the default credentials.

---

## Solution 3: Create Custom Staff Accounts

### Create a New Lab Assistant/HOD/Admin Account:

Run the interactive script:

```bash
node scripts/create-lab-assistant.js
```

You'll be prompted to enter:
- Full name
- Email address
- Password
- Department (optional)

The account will be created with **LAB_ASSISTANT** role by default.

### Change Role After Creation:

1. **Option A: Via Supabase Dashboard**
   - Go to Supabase Dashboard → Table Editor → `users` table
   - Find the user by email
   - Change the `role` field to `HOD`, `ADMIN`, or `OWNER`

2. **Option B: Via Prisma Studio**
   ```bash
   npx prisma studio
   ```
   - Open the `User` model
   - Find the user
   - Edit the `role` field

---

## Verify Lab Assistant Accounts

Check if lab assistant accounts exist:

```bash
node scripts/verify-lab-assistant.js
```

This will show:
- All Lab Assistant accounts
- Whether they have passwords set
- Whether they're active

---

## Login Methods by Role

| Role | Microsoft SSO | Email/Password |
|------|---------------|----------------|
| **STUDENT** | ✅ Primary | ❌ Not available |
| **LAB_ASSISTANT** | ✅ Available | ✅ **Recommended** |
| **HOD** | ✅ Available | ✅ Available |
| **ADMIN** | ✅ Available | ✅ Available |
| **OWNER** | ✅ Available | ✅ Available |

---

## Quick Start Guide

### For Your Current Situation:

**Option 1: Use Your ADMIN Account (Microsoft SSO)**
```bash
# 1. Sign out from the application
# 2. Clear browser cache or use incognito mode
# 3. Sign in again with sohamscecs123@gst.sies.edu.in
# 4. You'll now have ADMIN access
```

**Option 2: Use Lab Assistant Account (Email/Password)**
```bash
# 1. Create the lab assistant account
node scripts/seed-lab-assistant.js

# 2. Go to login page
# 3. Click "Lab Assistant / Staff Login"
# 4. Login with:
#    Email: lab.staff@sies.edu
#    Password: lab123
```

---

## Adding Components (Your Goal)

Once logged in as **LAB_ASSISTANT**, **HOD**, or **ADMIN**:

1. Navigate to **"Manage Inventory"** from the sidebar
2. Click **"Add Component"** button
3. Fill in component details:
   - Name
   - Category
   - Total Stock
   - Available Stock
   - Specifications (optional)
   - Storage Location (optional)
4. Click **"Save"**

---

## Troubleshooting

### Issue: "Still seeing Student dashboard after role change"

**Solution:**
1. Sign out completely
2. Clear browser cookies for the site
3. Close all browser tabs
4. Open in incognito/private mode
5. Sign in again

### Issue: "Lab Assistant login not working"

**Solution:**
1. Verify the account exists:
   ```bash
   node scripts/verify-lab-assistant.js
   ```

2. If not found, create it:
   ```bash
   node scripts/seed-lab-assistant.js
   ```

3. Check the password is set correctly

### Issue: "Cannot access Manage Inventory"

**Solution:**
- Verify your role is **LAB_ASSISTANT**, **HOD**, or **ADMIN**
- Check in Supabase Dashboard → `users` table
- Sign out and sign in again to refresh session

---

## Session Management

### How Sessions Work:

1. **Login** → NextAuth creates a session with your user data (including role)
2. **Session is cached** → Stored in browser cookies
3. **Role changes** → Not reflected until you sign out and sign in again

### Force Session Refresh:

```javascript
// In browser console (for debugging)
// This will sign you out
await fetch('/api/auth/signout', { method: 'POST' })
```

---

## Security Notes

### Default Credentials:

⚠️ **IMPORTANT**: Change the default lab assistant password in production!

```bash
# Create a new lab assistant with a strong password
node scripts/create-lab-assistant.js
```

### Password Requirements:

- Minimum 6 characters (recommended: 12+)
- Use a mix of letters, numbers, and symbols
- Don't reuse passwords

---

## Quick Reference

### Default Lab Assistant:
```
Email: lab.staff@sies.edu
Password: lab123
Role: LAB_ASSISTANT
```

### Your Admin Account:
```
Email: sohamscecs123@gst.sies.edu.in
Method: Microsoft SSO
Role: ADMIN (after session refresh)
```

### Scripts:
```bash
# Create lab assistant account
node scripts/seed-lab-assistant.js

# Create custom staff account
node scripts/create-lab-assistant.js

# Verify lab assistant accounts
node scripts/verify-lab-assistant.js

# Open Prisma Studio (edit users)
npx prisma studio
```

---

## Next Steps

1. **Sign out** from your current session
2. **Choose your login method**:
   - Option A: Sign in with Microsoft SSO (as ADMIN)
   - Option B: Create/use Lab Assistant account
3. **Navigate to Manage Inventory**
4. **Start adding components**

---

**Last Updated**: May 2, 2026
