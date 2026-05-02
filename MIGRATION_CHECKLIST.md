# Supabase PostgreSQL Migration Checklist

## Pre-Migration Checklist

- [x] ✅ Backup SQLite database (`prisma/dev.db`)
- [x] ✅ Update `prisma/schema.prisma` datasource to PostgreSQL
- [x] ✅ Add PostgreSQL-specific field types (`@db.Text`)
- [x] ✅ Update `.env` with Supabase connection strings
- [x] ✅ Validate Prisma schema (no syntax errors)
- [x] ✅ Verify `.env` is in `.gitignore`

## Migration Steps

### Step 1: Local Setup
- [ ] Generate Prisma Client
  ```bash
  cd iot_parts_management-main
  npx prisma generate
  ```

### Step 2: Create Migration
- [ ] Create initial PostgreSQL migration
  ```bash
  npx prisma migrate dev --name init_postgresql
  ```
  
- [ ] Review generated migration files in `prisma/migrations/`

### Step 3: Verify Schema
- [ ] Open Prisma Studio to verify tables
  ```bash
  npx prisma studio
  ```
  
- [ ] Check all tables are created correctly
- [ ] Verify indexes are in place

### Step 4: Test Locally
- [ ] Start development server
  ```bash
  npm run dev
  ```
  
- [ ] Test key features:
  - [ ] User authentication
  - [ ] Component requests
  - [ ] Inventory management
  - [ ] Dashboard loading
  - [ ] Parts issued/returned

### Step 5: Data Migration (Optional)
- [ ] Export data from SQLite (if needed)
- [ ] Import data to PostgreSQL
- [ ] Verify data integrity

### Step 6: Vercel Deployment
- [ ] Add environment variables to Vercel:
  - [ ] `DATABASE_URL`
  - [ ] `DIRECT_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `NEXTAUTH_URL`
  - [ ] `MICROSOFT_CLIENT_ID`
  - [ ] `MICROSOFT_CLIENT_SECRET`
  - [ ] `MICROSOFT_TENANT_ID`

- [ ] Deploy to Vercel
  ```bash
  git add .
  git commit -m "Migrate to Supabase PostgreSQL with connection pooling"
  git push
  ```

### Step 7: Production Verification
- [ ] Check Vercel deployment logs
- [ ] Test production application
- [ ] Monitor Supabase dashboard for:
  - [ ] Connection pool usage
  - [ ] Query performance
  - [ ] Error logs

## Post-Migration Checklist

### Performance Monitoring
- [ ] Check query performance in Supabase Dashboard
- [ ] Monitor connection pool usage
- [ ] Review slow query logs
- [ ] Set up alerts for errors

### Security Review
- [ ] Verify `.env` is not committed to git
- [ ] Confirm environment variables are set in Vercel
- [ ] Consider enabling Row Level Security (RLS) in Supabase
- [ ] Review database access logs

### Documentation
- [ ] Update README with new setup instructions
- [ ] Document any schema changes
- [ ] Update deployment guide
- [ ] Share migration guide with team

### Optimization (Optional)
- [ ] Add database indexes for frequently queried fields
- [ ] Enable query caching if needed
- [ ] Configure connection pool limits
- [ ] Set up database backups in Supabase

## Rollback Plan (If Needed)

If something goes wrong:

1. **Restore SQLite Configuration**
   ```bash
   # Restore .env
   echo 'DATABASE_URL="file:./dev.db"' > .env
   
   # Restore schema.prisma datasource
   # Change provider back to "sqlite"
   
   # Restore database
   cp prisma/dev.db.backup prisma/dev.db
   
   # Regenerate client
   npx prisma generate
   ```

2. **Redeploy Previous Version**
   ```bash
   git revert HEAD
   git push
   ```

## Common Issues & Solutions

### Issue: "Prepared statements not supported"
**Solution:** Ensure `?pgbouncer=true` is in `DATABASE_URL`

### Issue: "Migration failed"
**Solution:** Use `DIRECT_URL` for migrations:
```bash
DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
```

### Issue: "Connection timeout"
**Solution:** 
- Check Supabase project status
- Verify connection strings are correct
- Check firewall/network settings

### Issue: "SSL connection error"
**Solution:** Add SSL mode to connection string:
```
?pgbouncer=true&sslmode=require
```

## Success Criteria

✅ All migrations applied successfully
✅ Application runs without errors locally
✅ Application deployed to Vercel successfully
✅ All features working in production
✅ No connection pool errors
✅ Query performance acceptable
✅ Data integrity verified

## Timeline

- **Configuration**: ✅ Complete (May 2, 2026)
- **Local Migration**: ⏳ Pending
- **Testing**: ⏳ Pending
- **Production Deployment**: ⏳ Pending
- **Monitoring**: ⏳ Pending

## Notes

### Connection Strings
- **Pooled (6543)**: For application queries (Vercel)
- **Direct (5432)**: For migrations only

### Important Files
- `prisma/schema.prisma` - Database schema
- `.env` - Local environment variables (not committed)
- `SUPABASE_MIGRATION_GUIDE.md` - Detailed migration guide
- `POSTGRESQL_CHANGES_SUMMARY.md` - Quick reference

### Support Resources
- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Current Status**: ✅ Configuration Complete - Ready to Run Migrations

**Next Action**: Run `npx prisma generate` and `npx prisma migrate dev --name init_postgresql`

**Last Updated**: May 2, 2026
