# 🔐 Microsoft Authentication Setup Guide

## Overview

Your IoT Parts Management System is already configured to use Microsoft Azure AD authentication. This guide will walk you through setting up the Azure AD application and configuring the environment variables.

## 🚀 Quick Setup Steps

### 1. Create Azure AD Application

1. **Go to Azure Portal**
   - Visit: https://portal.azure.com
   - Sign in with your Microsoft account (preferably your college/organization account)

2. **Navigate to Azure Active Directory**
   - Search for "Azure Active Directory" in the top search bar
   - Click on "Azure Active Directory"

3. **Register a New Application**
   - Click on "App registrations" in the left sidebar
   - Click "New registration"
   - Fill in the details:
     - **Name**: `IoT Parts Management System`
     - **Supported account types**: 
       - Choose "Accounts in this organizational directory only" (for single tenant)
       - OR "Accounts in any organizational directory" (for multi-tenant)
     - **Redirect URI**: 
       - Type: `Web`
       - URL: `http://localhost:3000/api/auth/callback/azure-ad`

4. **Click "Register"**

### 2. Configure Application Settings

After registration, you'll be on the app overview page:

1. **Copy Application Details**
   - **Application (client) ID**: Copy this value
   - **Directory (tenant) ID**: Copy this value

2. **Create Client Secret**
   - Go to "Certificates & secrets" in the left sidebar
   - Click "New client secret"
   - Description: `IoT Parts Management System Secret`
   - Expires: Choose your preferred duration (12 months recommended)
   - Click "Add"
   - **IMPORTANT**: Copy the secret value immediately (it won't be shown again)

3. **Configure API Permissions**
   - Go to "API permissions" in the left sidebar
   - Click "Add a permission"
   - Choose "Microsoft Graph"
   - Select "Delegated permissions"
   - Add these permissions:
     - `openid`
     - `profile` 
     - `email`
     - `User.Read`
   - Click "Add permissions"
   - Click "Grant admin consent" (if you have admin rights)

4. **Configure Authentication**
   - Go to "Authentication" in the left sidebar
   - Under "Redirect URIs", ensure you have:
     - `http://localhost:3000/api/auth/callback/azure-ad` (for development)
     - `https://yourdomain.com/api/auth/callback/azure-ad` (for production)
   - Under "Implicit grant and hybrid flows":
     - Check "ID tokens"
   - Click "Save"

### 3. Configure Environment Variables

1. **Copy `.env.example` to `.env`**
   ```bash
   copy .env.example .env
   ```

2. **Update the `.env` file with your Azure AD details**:
   ```env
   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"

   # Microsoft Azure AD
   AZURE_AD_CLIENT_ID="your-application-client-id"
   AZURE_AD_CLIENT_SECRET="your-client-secret-value"
   AZURE_AD_TENANT_ID="your-directory-tenant-id"

   # College Domain (restrict access to your organization)
   COLLEGE_DOMAIN="yourcollege.edu"
   ```

3. **Generate a secure NEXTAUTH_SECRET**:
   ```bash
   # Option 1: Use OpenSSL
   openssl rand -base64 32

   # Option 2: Use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### 4. Test the Setup

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the application**:
   - Go to: http://localhost:3000
   - Click "Sign In with Microsoft"
   - You should be redirected to Microsoft login

3. **Sign in with your Microsoft account**:
   - Use an account from your organization domain
   - Grant permissions when prompted
   - You should be redirected back to the application

## 🔧 Advanced Configuration

### Domain Restriction

The system is configured to only allow users from your college domain:

```typescript
// In src/lib/auth.ts
const collegeDomain = process.env.COLLEGE_DOMAIN || 'college.edu'

if (!user.email?.endsWith(`@${collegeDomain}`)) {
  return false
}
```

### Role Assignment

Users are automatically assigned roles based on their email patterns:

- **HOD**: Emails containing 'hod' or 'head'
- **LAB_ASSISTANT**: Emails containing 'lab' or 'assistant'  
- **STUDENT**: Default role for all other users

### Production Configuration

For production deployment, update these settings:

1. **Azure AD Redirect URIs**:
   - Add your production domain: `https://yourdomain.com/api/auth/callback/azure-ad`

2. **Environment Variables**:
   ```env
   NEXTAUTH_URL="https://yourdomain.com"
   NODE_ENV="production"
   ```

3. **Database**:
   - Switch from SQLite to PostgreSQL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/iot_parts_db"
   ```

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Azure AD matches exactly: `http://localhost:3000/api/auth/callback/azure-ad`
   - Check for trailing slashes or typos

2. **"Access denied" error**
   - Check if the user's email domain matches `COLLEGE_DOMAIN`
   - Verify API permissions are granted in Azure AD

3. **"Client secret expired" error**
   - Generate a new client secret in Azure AD
   - Update the `AZURE_AD_CLIENT_SECRET` in your `.env` file

4. **"Invalid client" error**
   - Verify `AZURE_AD_CLIENT_ID` is correct
   - Check if the application is enabled in Azure AD

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
NEXTAUTH_DEBUG=true
```

### Test Without Domain Restriction

For development testing, the domain restriction is disabled when `NODE_ENV=development`.

## 📋 Checklist

- [ ] Azure AD application created
- [ ] Client ID and secret copied
- [ ] Redirect URIs configured
- [ ] API permissions granted
- [ ] Environment variables set
- [ ] NEXTAUTH_SECRET generated
- [ ] College domain configured
- [ ] Application tested locally

## 🎯 Next Steps

After successful authentication setup:

1. **Set up the database**: Run `npm run db:push`
2. **Create admin users**: Manually assign HOD role to administrators
3. **Configure email notifications**: Set up SMTP settings
4. **Deploy to production**: Update production environment variables

## 🔒 Security Best Practices

1. **Keep secrets secure**: Never commit `.env` files to version control
2. **Use strong secrets**: Generate random NEXTAUTH_SECRET
3. **Limit permissions**: Only grant necessary API permissions
4. **Regular rotation**: Rotate client secrets periodically
5. **Monitor access**: Review Azure AD sign-in logs regularly

---

**Your Microsoft authentication is now ready! 🚀**

The system will automatically create user accounts on first sign-in and assign appropriate roles based on email patterns.