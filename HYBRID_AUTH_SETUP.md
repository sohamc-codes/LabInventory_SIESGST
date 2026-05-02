# Hybrid Authentication - Quick Setup Guide

## ✅ What's Been Implemented

The system now supports **two authentication methods**:

1. **Microsoft SSO** - For Students and HODs with college emails
2. **Email/Password** - For Lab Assistants without college emails

## 🚀 Quick Start

### Step 1: Database Schema (✅ DONE)

The `User` model now has an optional `password` field:
```prisma
password String? // Optional: for Lab Assistants using credentials auth
```

Database has been updated with `npx prisma db push`.

### Step 2: Create a Lab Assistant Account

Run the seed script to create a demo Lab Assistant:

```bash
node scripts/seed-lab-assistant.js
```

**Demo Credentials**:
- Email: `lab.staff@sies.edu`
- Password: `lab123`

### Step 3: Configure Microsoft SSO (Optional)

If you want to enable Microsoft SSO for Students/HODs:

1. Update `.env` with your Microsoft credentials:
```env
MICROSOFT_CLIENT_ID="your_microsoft_client_id_here"
MICROSOFT_CLIENT_SECRET="your_microsoft_client_secret_here"
MICROSOFT_TENANT_ID="your_microsoft_tenant_id_here"
```

2. See [docs/HYBRID_AUTHENTICATION.md](./docs/HYBRID_AUTHENTICATION.md) for detailed Azure setup instructions.

### Step 4: Test the Login Flow

1. Start the development server:
```bash
npm run dev
```

2. Navigate to: `http://localhost:3000/auth/signin`

3. **Test Lab Assistant Login**:
   - Click "Lab Assistant / Staff Login"
   - Enter: `lab.staff@sies.edu` / `lab123`
   - Should redirect to Lab Assistant dashboard

4. **Test Microsoft SSO** (if configured):
   - Click "Sign in with Microsoft"
   - Authenticate with college account
   - Should redirect to appropriate dashboard

## 📋 What Changed

### Files Modified:
1. ✅ `prisma/schema.prisma` - Added optional `password` field
2. ✅ `src/lib/auth.ts` - Added Microsoft SSO + Credentials providers
3. ✅ `src/app/auth/signin/page.tsx` - New UI with toggle between SSO and credentials
4. ✅ `.env` - Added Microsoft configuration variables
5. ✅ `.env.example` - Updated with Microsoft variables

### Files Created:
1. ✅ `scripts/create-lab-assistant.js` - Interactive script to create Lab Assistants
2. ✅ `scripts/seed-lab-assistant.js` - Seed demo Lab Assistant account
3. ✅ `docs/HYBRID_AUTHENTICATION.md` - Comprehensive documentation

## 🎨 UI Changes

### Login Page - Before:
- Demo login with quick-access buttons
- Microsoft SSO toggle

### Login Page - After:
- **Primary**: Large "Sign in with Microsoft" button (for Students/HODs)
- **Secondary**: Subtle "Lab Assistant / Staff Login" link
- **Toggle**: Switches between Microsoft SSO and Email/Password form
- **Back Button**: Returns to Microsoft SSO view

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ Secure password comparison
- ✅ Generic error messages (prevents user enumeration)
- ✅ Validation: SSO users can't use credentials login
- ✅ Validation: Credentials users must have password

## 📝 Creating More Lab Assistants

### Interactive Script:
```bash
node scripts/create-lab-assistant.js
```

### Programmatically:
```javascript
const bcrypt = require('bcryptjs')
const hashedPassword = await bcrypt.hash('password123', 10)

await prisma.user.create({
  data: {
    name: 'Lab Assistant Name',
    email: 'lab.assistant@example.com',
    password: hashedPassword,
    role: 'LAB_ASSISTANT',
    isActive: true,
    emailVerified: new Date(),
  }
})
```

## 🧪 Testing Checklist

- [ ] Lab Assistant can login with email/password
- [ ] Lab Assistant redirects to correct dashboard
- [ ] Microsoft SSO button appears (if configured)
- [ ] Toggle between auth modes works smoothly
- [ ] Error messages display correctly
- [ ] Password visibility toggle works
- [ ] "Back to Student Login" button works

## 📚 Documentation

For detailed information, see:
- [docs/HYBRID_AUTHENTICATION.md](./docs/HYBRID_AUTHENTICATION.md) - Full documentation
- [docs/MICROSOFT_AUTH_SETUP.md](./docs/MICROSOFT_AUTH_SETUP.md) - Azure setup guide

## ⚠️ Important Notes

1. **Microsoft SSO requires Azure configuration** - Without it, the Microsoft button will fail
2. **Lab Assistants MUST have passwords** - Use the seed/create scripts
3. **Students/HODs should NOT have passwords** - They use Microsoft SSO only
4. **In production**: Use HTTPS and strong password requirements

## 🎯 Next Steps

1. ✅ Test Lab Assistant login with demo account
2. ⏳ Configure Microsoft Azure (if needed)
3. ⏳ Create production Lab Assistant accounts
4. ⏳ Implement password reset flow (future enhancement)
5. ⏳ Add account lockout after failed attempts (future enhancement)

## 🐛 Troubleshooting

**Issue**: "Invalid email or password"
- **Solution**: Run `node scripts/seed-lab-assistant.js` to create demo account

**Issue**: Microsoft SSO not working
- **Solution**: Check `.env` has correct Microsoft credentials

**Issue**: "This account uses Microsoft SSO"
- **Solution**: Use "Sign in with Microsoft" button instead

---

**Status**: ✅ Implementation Complete
**Ready for Testing**: Yes
**Production Ready**: After Microsoft Azure configuration
