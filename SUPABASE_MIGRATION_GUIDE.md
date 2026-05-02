# Supabase PostgreSQL Migration Guide

## Overview
This guide walks you through migrating your IoT Parts Management application from SQLite to Supabase PostgreSQL with connection pooling.

## Migration Date
May 2, 2026

---

## Changes Made

### 1. **Prisma Schema Updates** (`prisma/schema.prisma`)

#### Datasource Configuration
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled connection via PgBouncer
  directUrl = env("DIRECT_URL")        // Direct connection for migrations
}
```

#### PostgreSQL-Specific Field Types
Added `@db.Text` attribute to fields that may contain large text content:
- `Account.refresh_token`, `access_token`, `id_token`
- `Organization.settings`
- `Component.specifications`, `description`
- `ComponentRequest.purpose`, `rejectionReason`
- `IssuedComponent.notes`, `purpose`
- `AuditLog.details`, `userAgent`
- `Notification.message`, `data`
- `ComponentHistory.purpose`, `notes`
- `SpecialPartRequest.description`, `imageUrls`, `purpose`, `rejectionReason`, `notes`
- `Project.description`

### 2. **Environment Variables** (`.env`)

Updated connection strings for Supabase:
```env
# Supabase PostgreSQL Connection (with connection pooling via PgBouncer)
DATABASE_URL="postgresql://postgres.coguieobbjenxuroqnbb:Bp$i/Kwy$4A.d*t@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection for migrations (bypasses PgBouncer)
DIRECT_URL="postgresql://postgres.coguieobbjenxuroqnbb:Bp$i/Kwy$4A.d*t@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

---

## Migration Steps

### Step 1: Backup Your Current Database
```bash
# Backup your SQLite database
cp prisma/dev.db prisma/dev.db.backup
```

### Step 2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 3: Create Initial Migration
```bash
# This will create the migration files for PostgreSQL
npx prisma migrate dev --name init_postgresql
```

### Step 4: Apply Migration to Supabase
```bash
# This will apply the migration to your Supabase database
npx prisma migrate deploy
```

### Step 5: Verify Database Schema
```bash
# Open Prisma Studio to verify the schema
npx prisma studio
```

---

## Data Migration (Optional)

If you need to migrate existing data from SQLite to PostgreSQL:

### Option 1: Manual Export/Import (Small Datasets)

1. **Export data from SQLite:**
```bash
# Install sqlite3 if not already installed
npm install -g sqlite3

# Export each table to CSV
sqlite3 prisma/dev.db ".mode csv" ".output users.csv" "SELECT * FROM users;"
# Repeat for other tables
```

2. **Import to Supabase:**
   - Use Supabase Dashboard → Table Editor → Import CSV
   - Or use `psql` command-line tool

### Option 2: Using Prisma Script (Recommended for Larger Datasets)

Create a migration script `scripts/migrate-data.ts`:

```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
})

const postgres = new PostgresClient()

async function migrateData() {
  try {
    console.log('Starting data migration...')
    
    // Migrate users
    const users = await sqlite.user.findMany()
    for (const user of users) {
      await postgres.user.create({ data: user })
    }
    console.log(`Migrated ${users.length} users`)
    
    // Migrate organizations
    const orgs = await sqlite.organization.findMany()
    for (const org of orgs) {
      await postgres.organization.create({ data: org })
    }
    console.log(`Migrated ${orgs.length} organizations`)
    
    // Continue for other tables...
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

migrateData()
```

Run the migration:
```bash
npx ts-node scripts/migrate-data.ts
```

---

## Connection Pooling Explained

### PgBouncer Configuration

**DATABASE_URL (Port 6543):**
- Uses PgBouncer for connection pooling
- Optimized for serverless environments (Vercel)
- Handles many concurrent connections efficiently
- Used for application queries

**DIRECT_URL (Port 5432):**
- Direct PostgreSQL connection
- Required for migrations and schema changes
- Bypasses PgBouncer
- Used by `prisma migrate` commands

### Why Two URLs?

Prisma needs:
1. **Pooled connection** (`DATABASE_URL`) for runtime queries
2. **Direct connection** (`DIRECT_URL`) for migrations that require transaction support

---

## Vercel Deployment

### Environment Variables Setup

Add these to your Vercel project:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables



3. Deploy:
```bash
git add .
git commit -m "Migrate to Supabase PostgreSQL"
git push
```

---

## Troubleshooting

### Issue: "Prepared statements are not supported"

**Solution:** Ensure `?pgbouncer=true` is in your `DATABASE_URL`

### Issue: "Migration failed"

**Solution:** Use `DIRECT_URL` for migrations:
```bash
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
```

### Issue: "Connection timeout"

**Solution:** Check Supabase project status and connection limits in Supabase Dashboard

### Issue: "SSL connection error"

**Solution:** Add `?sslmode=require` to connection string:
```
postgresql://...?pgbouncer=true&sslmode=require
```

---

## Performance Optimization

### Connection Pool Settings

Supabase automatically manages connection pooling, but you can optimize:

1. **Prisma Connection Pool:**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  
  // Optional: Configure connection pool
  // connectionLimit = 10
}
```

2. **Supabase Dashboard:**
   - Go to Settings → Database → Connection Pooling
   - Adjust pool size based on your plan

### Query Optimization

1. **Use indexes** for frequently queried fields
2. **Enable query logging** in development:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

3. **Monitor slow queries** in Supabase Dashboard → Database → Query Performance

---

## Security Considerations

### 1. **Rotate Database Credentials**
- Never commit `.env` to version control
- Use Vercel's environment variables for production
- Rotate credentials periodically in Supabase Dashboard

### 2. **Enable Row Level Security (RLS)**
```sql
-- Example: Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
```

### 3. **Use Connection Pooling**
- Always use pooled connection (`DATABASE_URL`) in production
- Limit direct connections to migrations only

---

## Testing

### Local Testing
```bash
# Test database connection
npx prisma db pull

# Test queries
npx prisma studio

# Run your application
npm run dev
```

### Production Testing
1. Deploy to Vercel preview environment
2. Test all CRUD operations
3. Monitor Supabase logs for errors
4. Check connection pool usage

---

## Rollback Plan

If you need to rollback to SQLite:

1. **Restore `.env`:**
```env
DATABASE_URL="file:./dev.db"
```

2. **Restore `schema.prisma`:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

3. **Restore database:**
```bash
cp prisma/dev.db.backup prisma/dev.db
```

4. **Regenerate client:**
```bash
npx prisma generate
```

---

## Next Steps

1. ✅ Schema updated for PostgreSQL
2. ✅ Environment variables configured
3. ⏳ Run migrations: `npx prisma migrate dev --name init_postgresql`
4. ⏳ Test locally with Supabase
5. ⏳ Deploy to Vercel
6. ⏳ Monitor performance and errors

---

## Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Migration Guide](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate)

---

## Support

If you encounter issues:
1. Check Supabase Dashboard → Logs
2. Check Vercel Deployment Logs
3. Review Prisma documentation
4. Contact Supabase support

**Status**: ✅ Configuration Complete - Ready for Migration

**Last Updated**: May 2, 2026
