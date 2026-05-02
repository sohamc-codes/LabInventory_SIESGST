# PostgreSQL Migration - Quick Reference

## Summary of Changes

### ✅ Files Modified
1. `prisma/schema.prisma` - Updated datasource and field types
2. `.env` - Added Supabase connection strings

---

## Key Changes

### 1. Datasource Block
**Before (SQLite):**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**After (PostgreSQL):**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection (port 6543)
  directUrl = env("DIRECT_URL")        // Direct connection (port 5432)
}
```

### 2. Environment Variables
**Before:**
```env
DATABASE_URL="file:./dev.db"
```

**After:**
```env
DATABASE_URL="postgresql://postgres.coguieobbjenxuroqnbb:Bp$i/Kwy$4A.d*t@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.coguieobbjenxuroqnbb:Bp$i/Kwy$4A.d*t@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

### 3. Field Type Updates
Added `@db.Text` to fields that may contain large text:

| Model | Fields |
|-------|--------|
| **Account** | `refresh_token`, `access_token`, `id_token` |
| **Organization** | `settings` |
| **Component** | `specifications`, `description` |
| **ComponentRequest** | `purpose`, `rejectionReason` |
| **IssuedComponent** | `notes`, `purpose` |
| **AuditLog** | `details`, `userAgent` |
| **Notification** | `message`, `data` |
| **ComponentHistory** | `purpose`, `notes` |
| **SpecialPartRequest** | `description`, `imageUrls`, `purpose`, `rejectionReason`, `notes` |
| **Project** | `description` |

---

## Next Steps

### 1. Generate Prisma Client
```bash
cd iot_parts_management-main
npx prisma generate
```

### 2. Create Initial Migration
```bash
npx prisma migrate dev --name init_postgresql
```

### 3. Verify Connection
```bash
npx prisma studio
```

### 4. Deploy to Vercel
```bash
# Add environment variables to Vercel Dashboard first
git add .
git commit -m "Migrate to Supabase PostgreSQL"
git push
```

---

## Important Notes

### Connection Pooling
- **Port 6543** (DATABASE_URL): Pooled connection via PgBouncer - use for app queries
- **Port 5432** (DIRECT_URL): Direct connection - use for migrations only

### Why Two URLs?
- **Pooled connection**: Optimized for serverless (Vercel), handles many concurrent connections
- **Direct connection**: Required for migrations that need transaction support

### Security
- ⚠️ **Never commit `.env` to git** - it contains your database credentials
- ✅ Add `.env` to `.gitignore` (should already be there)
- ✅ Use Vercel environment variables for production

---

## Validation Status

✅ **Schema validated successfully** - No syntax errors
✅ **Environment variables configured**
✅ **PostgreSQL-specific types added**
✅ **Connection pooling configured**

---

## Quick Commands

```bash
# Validate schema
npx prisma validate

# Generate client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (development only!)
npx prisma migrate reset
```

---

## Troubleshooting

### "Prepared statements not supported"
✅ Ensure `?pgbouncer=true` is in DATABASE_URL

### "Migration failed"
✅ Use DIRECT_URL for migrations:
```bash
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
```

### "Connection timeout"
✅ Check Supabase project status in dashboard

---

**Status**: ✅ Ready for Migration
**Date**: May 2, 2026
