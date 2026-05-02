# Edge Runtime Fix - Split Config Pattern

## Problem

The application was crashing on login with the error:
```
PrismaClient is not configured to run in Edge Runtime
```

This occurred because `middleware.ts` was importing `auth.ts`, which initialized Prisma. Middleware runs in the Edge Runtime, which doesn't support Prisma or Node.js-specific modules like `bcryptjs`.

## Solution: NextAuth v5 Split Config Pattern

We implemented the "Split Config" pattern to separate Edge-compatible code from Node-compatible code.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Edge Runtime                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  middleware.ts                                     │    │
│  │  - Uses auth.config.ts (Edge-compatible)           │    │
│  │  - No Prisma, no bcrypt                            │    │
│  │  - Only JWT token validation                       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Node Runtime                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  auth.ts                                           │    │
│  │  - Uses auth.config.ts + Prisma                    │    │
│  │  - Database queries allowed                        │    │
│  │  - bcrypt password hashing                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  API Routes (/api/auth/[...nextauth])              │    │
│  │  - Uses auth.ts (Node runtime)                     │    │
│  │  - Full database access                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Changes Made

### 1. Created `src/lib/auth.config.ts` (Edge-Compatible)

**Purpose**: Edge-compatible configuration for middleware

**Key Features**:
- ✅ No Prisma imports
- ✅ No database queries
- ✅ No bcrypt (password validation happens in Node runtime)
- ✅ Providers defined (but authorize logic is placeholder)
- ✅ JWT and session callbacks that only use token data
- ✅ `authorized` callback for basic route protection

**What it contains**:
```typescript
- Microsoft Entra ID provider config
- Credentials provider config (placeholder authorize)
- JWT callback (stores user data in token)
- Session callback (maps token to session)
- Authorized callback (basic auth check)
```

### 2. Updated `src/lib/auth.ts` (Node-Compatible)

**Purpose**: Full authentication with database access

**Key Features**:
- ✅ Imports `auth.config.ts` as base
- ✅ Overrides providers with Node-compatible versions
- ✅ Full Prisma database access
- ✅ bcrypt password hashing and validation
- ✅ Auto-creates Microsoft SSO users
- ✅ Fetches fresh user data from database

**What it does**:
```typescript
- Extends auth.config.ts
- Implements real Credentials authorize with Prisma + bcrypt
- Implements signIn callback for Microsoft SSO user creation
- Implements JWT callback to fetch user data from database
- Exports handlers, auth, signIn, signOut for API routes
```

### 3. Updated `src/middleware.ts`

**Purpose**: Use Edge-compatible config

**Key Change**:
```typescript
// Before (caused crash):
import { auth } from '@/lib/auth'

// After (Edge-compatible):
import NextAuth from 'next-auth'
import authConfig from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)
```

**Result**: Middleware now runs in Edge Runtime without Prisma

### 4. API Route Configuration

The API route at `src/app/api/auth/[...nextauth]/route.ts` already has:
```typescript
export const runtime = 'nodejs'
```

This ensures the full `auth.ts` with Prisma runs in Node runtime.

## How It Works

### Login Flow

1. **User visits login page** → Middleware checks auth (Edge Runtime)
   - Uses `auth.config.ts` (no database)
   - Checks JWT token validity only

2. **User submits credentials** → API route handles login (Node Runtime)
   - Uses `auth.ts` (with Prisma)
   - Validates password with bcrypt
   - Queries database for user
   - Creates JWT token with user data

3. **User navigates app** → Middleware validates token (Edge Runtime)
   - Uses `auth.config.ts` (no database)
   - Reads user role from JWT token
   - Enforces route protection

### Microsoft SSO Flow

1. **User clicks "Sign in with Microsoft"** → Redirects to Microsoft
2. **Microsoft callback** → API route handles (Node Runtime)
   - Uses `auth.ts` (with Prisma)
   - Checks if user exists in database
   - Auto-creates user if new
   - Fetches user role from database
   - Creates JWT token with user data
3. **User navigates app** → Middleware validates token (Edge Runtime)

## Benefits

### ✅ Edge Runtime Compatible
- Middleware runs without Prisma
- No "PrismaClient is not configured to run in Edge Runtime" errors
- Faster middleware execution

### ✅ Full Database Access Where Needed
- API routes have full Prisma access
- Password validation with bcrypt
- User creation and updates

### ✅ Secure
- JWT tokens contain user role/data
- No database queries on every request
- Token-based authentication

### ✅ Maintainable
- Clear separation of concerns
- Edge code in `auth.config.ts`
- Node code in `auth.ts`

## Testing

### Test Lab Assistant Login
```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/auth/signin
# Click "Lab Assistant / Staff Login"
# Enter: lab.staff@sies.edu / lab123
# Should login successfully
```

### Test Microsoft SSO
```bash
# Ensure Microsoft credentials in .env
# Navigate to http://localhost:3000/auth/signin
# Click "Sign in with Microsoft"
# Should redirect to Microsoft login
```

### Test Middleware Protection
```bash
# Try accessing /dashboard without login
# Should redirect to /auth/signin

# Login and access /dashboard
# Should work correctly
```

## Verification Checklist

- [x] `auth.config.ts` created (Edge-compatible)
- [x] `auth.ts` updated (Node-compatible)
- [x] `middleware.ts` updated (uses auth.config)
- [x] No Prisma imports in Edge code
- [x] No bcrypt in Edge code
- [x] JWT strategy used (not database sessions)
- [x] API route has `runtime = 'nodejs'`
- [x] TypeScript errors resolved
- [x] Build succeeds

## Files Modified

1. ✅ **Created**: `src/lib/auth.config.ts`
   - Edge-compatible auth configuration
   - No Prisma, no bcrypt

2. ✅ **Modified**: `src/lib/auth.ts`
   - Extends auth.config.ts
   - Adds Prisma and bcrypt support
   - Node runtime only

3. ✅ **Modified**: `src/middleware.ts`
   - Uses auth.config.ts instead of auth.ts
   - Edge Runtime compatible

4. ✅ **Already Set**: `src/app/api/auth/[...nextauth]/route.ts`
   - Has `runtime = 'nodejs'`

## Troubleshooting

### Issue: Still getting Edge Runtime error

**Check**:
1. Middleware imports `auth.config.ts`, not `auth.ts`
2. `auth.config.ts` has no Prisma imports
3. Clear `.next` folder and rebuild

### Issue: Login not working

**Check**:
1. API route uses `auth.ts` (with Prisma)
2. API route has `runtime = 'nodejs'`
3. Database has Lab Assistant with password

### Issue: Microsoft SSO not working

**Check**:
1. `.env` has correct Microsoft credentials
2. `auth.ts` has signIn callback for user creation
3. Azure redirect URI is correct

## Related Documentation

- [NextAuth v5 Split Config](https://authjs.dev/getting-started/migrating-to-v5#edge-compatibility)
- [Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [Hybrid Authentication Setup](./HYBRID_AUTH_SETUP.md)

## Summary

✅ **Problem Solved**: Middleware no longer crashes with Prisma error

✅ **Edge Compatible**: Middleware runs in Edge Runtime

✅ **Full Features**: API routes have full database access

✅ **Secure**: JWT-based authentication with role data

✅ **Production Ready**: Build succeeds, no errors

---

**Status**: ✅ Implementation Complete
**Tested**: Yes
**Production Ready**: Yes
