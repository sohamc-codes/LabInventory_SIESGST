# Hybrid Authentication System

This document explains the hybrid authentication architecture implemented in the IoT Parts Management System.

## Overview

The system supports two authentication methods:

1. **Microsoft SSO (Single Sign-On)** - For Students and HODs with college email accounts
2. **Email/Password Credentials** - For Lab Assistants who don't have college email accounts

## Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Login Page                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Primary: Sign in with Microsoft (SSO)             │    │
│  │  - For Students with college emails                │    │
│  │  - For HODs with college emails                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Toggle: Lab Assistant / Staff Login               │    │
│  │  - Email/Password form                             │    │
│  │  - For Lab Assistants without college emails       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

The `User` model includes an optional `password` field:

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String?  // Optional: only for Lab Assistants
  role     String   @default("STUDENT")
  // ... other fields
}
```

- **SSO Users (Students/HODs)**: `password` field is `null`
- **Credentials Users (Lab Assistants)**: `password` field contains bcrypt-hashed password

## Configuration

### 1. Environment Variables

Add these to your `.env` file:

```env
# Microsoft Entra ID (Azure AD) Configuration
MICROSOFT_CLIENT_ID="your_microsoft_client_id_here"
MICROSOFT_CLIENT_SECRET="your_microsoft_client_secret_here"
MICROSOFT_TENANT_ID="your_microsoft_tenant_id_here"
```

### 2. Microsoft Azure Setup

To enable Microsoft SSO:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App Registrations**
3. Click **New Registration**
4. Configure:
   - **Name**: IoT Parts Management
   - **Supported account types**: Single tenant
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
5. Copy the **Application (client) ID** → `MICROSOFT_CLIENT_ID`
6. Copy the **Directory (tenant) ID** → `MICROSOFT_TENANT_ID`
7. Go to **Certificates & secrets** > **New client secret**
8. Copy the secret value → `MICROSOFT_CLIENT_SECRET`

For detailed setup instructions, see [MICROSOFT_AUTH_SETUP.md](./MICROSOFT_AUTH_SETUP.md)

## Creating Lab Assistant Accounts

### Method 1: Using the Seed Script (Demo Account)

```bash
node scripts/seed-lab-assistant.js
```

This creates a demo account:
- **Email**: lab.staff@sies.edu
- **Password**: lab123

### Method 2: Using the Interactive Script

```bash
node scripts/create-lab-assistant.js
```

Follow the prompts to create a custom Lab Assistant account.

### Method 3: Programmatically

```javascript
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createLabAssistant() {
  const hashedPassword = await bcrypt.hash('your_password', 10)
  
  const user = await prisma.user.create({
    data: {
      name: 'Lab Assistant Name',
      email: 'lab.assistant@example.com',
      password: hashedPassword,
      role: 'LAB_ASSISTANT',
      department: 'IoT Lab',
      isActive: true,
      emailVerified: new Date(),
    }
  })
  
  return user
}
```

## User Experience

### For Students and HODs

1. Navigate to the login page
2. Click **"Sign in with Microsoft"** (primary button)
3. Authenticate with college Microsoft account
4. Automatically redirected to dashboard

### For Lab Assistants

1. Navigate to the login page
2. Click **"Lab Assistant / Staff Login"** (text link below Microsoft button)
3. Enter email and password
4. Click **"Sign In"**
5. Redirected to Lab Assistant dashboard

## Security Features

### Password Hashing

- Passwords are hashed using **bcrypt** with 10 salt rounds
- Never stored in plain text
- Secure comparison using `bcrypt.compare()`

### Authentication Validation

The credentials provider validates:
1. Email and password are provided
2. User exists in database
3. User has a password (not an SSO user)
4. Password matches the hashed password

### Error Messages

Generic error messages prevent user enumeration:
- ❌ "Invalid email or password" (instead of "User not found")
- ❌ "This account uses Microsoft SSO" (if SSO user tries credentials login)

## Testing

### Test Accounts

**Lab Assistant (Credentials)**:
- Email: `lab.staff@sies.edu`
- Password: `lab123`

**Students/HODs (Microsoft SSO)**:
- Use your college Microsoft account

### Manual Testing

1. **Test Lab Assistant Login**:
   ```bash
   # Start the dev server
   npm run dev
   
   # Navigate to http://localhost:3000/auth/signin
   # Click "Lab Assistant / Staff Login"
   # Enter: lab.staff@sies.edu / lab123
   ```

2. **Test Microsoft SSO**:
   ```bash
   # Ensure Microsoft credentials are in .env
   # Navigate to http://localhost:3000/auth/signin
   # Click "Sign in with Microsoft"
   # Authenticate with college account
   ```

## Troubleshooting

### Issue: "This account uses Microsoft SSO"

**Cause**: Trying to use credentials login for an SSO user

**Solution**: Use the "Sign in with Microsoft" button instead

### Issue: Microsoft SSO not working

**Cause**: Missing or incorrect Microsoft credentials

**Solution**: 
1. Verify `.env` has correct `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`
2. Check Azure App Registration redirect URI matches your callback URL
3. Ensure tenant ID is correct

### Issue: "Invalid email or password"

**Cause**: Incorrect credentials or user doesn't exist

**Solution**:
1. Verify the email is correct
2. Check if the user exists in the database
3. Ensure the password is correct
4. Run seed script to create demo account

## Migration Guide

### Migrating Existing Lab Assistants

If you have existing Lab Assistant users without passwords:

```javascript
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateLabAssistants() {
  const labAssistants = await prisma.user.findMany({
    where: {
      role: 'LAB_ASSISTANT',
      password: null
    }
  })
  
  for (const user of labAssistants) {
    const tempPassword = 'ChangeMe123!' // They should change this
    const hashedPassword = await bcrypt.hash(tempPassword, 10)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    console.log(`Migrated ${user.email} - Temp password: ${tempPassword}`)
  }
}
```

## Best Practices

1. **Password Requirements**: Enforce strong passwords (min 8 chars, mix of letters/numbers/symbols)
2. **Password Reset**: Implement password reset flow for Lab Assistants
3. **Account Lockout**: Consider implementing account lockout after failed attempts
4. **Audit Logging**: Log all authentication attempts
5. **Session Management**: Use secure session tokens with appropriate expiration
6. **HTTPS Only**: Always use HTTPS in production

## Related Documentation

- [Microsoft Auth Setup Guide](./MICROSOFT_AUTH_SETUP.md)
- [Production Setup Guide](./PRODUCTION_SETUP.md)
- [Security Best Practices](./SECURITY.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the related documentation
3. Contact the development team
