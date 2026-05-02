# 🚀 Deployment Guide - LabInventory

## Prerequisites

- Node.js 18.17+
- PostgreSQL database
- Domain name (optional but recommended)
- Stripe account (for payments)
- Email service (SendGrid, Resend, etc.)

## Environment Variables

Create a `.env.production` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/labinventory?schema=public"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Microsoft Azure AD (Optional)
AZURE_AD_CLIENT_ID="your-client-id"
AZURE_AD_CLIENT_SECRET="your-client-secret"
AZURE_AD_TENANT_ID="your-tenant-id"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PROFESSIONAL_PRICE_ID="price_..."

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@yourdomain.com"

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

## Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Link Project
```bash
vercel link
```

#### 4. Set Environment Variables
```bash
# Add all environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
# ... add all other variables
```

#### 5. Deploy
```bash
vercel --prod
```

#### 6. Set Up Database
```bash
# Run migrations
npx prisma migrate deploy
```

### Option 2: Docker

#### 1. Build Image
```bash
docker build -t labinventory:latest .
```

#### 2. Run with Docker Compose
```bash
docker-compose up -d
```

#### 3. Run Migrations
```bash
docker-compose exec app npx prisma migrate deploy
```

### Option 3: VPS (DigitalOcean, AWS, etc.)

#### 1. Set Up Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2
```

#### 2. Clone Repository
```bash
git clone https://github.com/yourusername/labinventory.git
cd labinventory
```

#### 3. Install Dependencies
```bash
npm ci --production
```

#### 4. Build Application
```bash
npm run build
```

#### 5. Set Up Database
```bash
npx prisma migrate deploy
```

#### 6. Start with PM2
```bash
pm2 start npm --name "labinventory" -- start
pm2 save
pm2 startup
```

#### 7. Set Up Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 8. Set Up SSL with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Database Setup

### PostgreSQL

#### 1. Create Database
```sql
CREATE DATABASE labinventory;
CREATE USER labinventory_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE labinventory TO labinventory_user;
```

#### 2. Run Migrations
```bash
npx prisma migrate deploy
```

#### 3. Seed Data (Optional)
```bash
npm run demo:seed
```

### Managed Database Services

#### Vercel Postgres
```bash
vercel postgres create
```

#### Supabase
1. Create project at supabase.com
2. Copy connection string
3. Update DATABASE_URL

#### PlanetScale
1. Create database at planetscale.com
2. Create branch
3. Copy connection string
4. Update DATABASE_URL

## Stripe Setup

### 1. Create Products
1. Go to Stripe Dashboard
2. Create "Professional" product
3. Set price to $99/month
4. Copy price ID

### 2. Set Up Webhooks
1. Go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret

### 3. Test Webhooks
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Email Setup

### SendGrid
```bash
# Install
npm install @sendgrid/mail

# Configure
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-api-key"
```

### Resend
```bash
# Install
npm install resend

# Configure
RESEND_API_KEY="re_..."
```

## Monitoring

### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Vercel Analytics
```bash
npm install @vercel/analytics
```

### PostHog (Product Analytics)
```bash
npm install posthog-js
```

## Performance Optimization

### 1. Enable Caching
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['yourdomain.com'],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

### 2. Set Up CDN
- Use Vercel's built-in CDN
- Or configure Cloudflare

### 3. Database Optimization
```sql
-- Add indexes
CREATE INDEX idx_components_org ON components(organizationId);
CREATE INDEX idx_users_org ON users(organizationId);
CREATE INDEX idx_requests_status ON component_requests(status);
```

## Security Checklist

- [ ] Enable HTTPS
- [ ] Set secure environment variables
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up CSP headers
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Review IAM permissions
- [ ] Enable 2FA for admin accounts

## Backup Strategy

### Database Backups
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://your-bucket/backups/
```

### Automated Backups
- Vercel Postgres: Automatic daily backups
- Supabase: Point-in-time recovery
- PlanetScale: Automatic backups

## Scaling

### Horizontal Scaling
- Deploy multiple instances
- Use load balancer
- Enable session persistence

### Database Scaling
- Read replicas
- Connection pooling (PgBouncer)
- Caching layer (Redis)

### CDN
- Static assets on CDN
- Image optimization
- Edge caching

## Monitoring & Alerts

### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' })
}
```

### Uptime Monitoring
- UptimeRobot
- Pingdom
- Better Uptime

### Log Aggregation
- Vercel Logs
- Datadog
- LogRocket

## Post-Deployment

### 1. Verify Deployment
- [ ] Landing page loads
- [ ] Signup flow works
- [ ] Login works
- [ ] Dashboard accessible
- [ ] API endpoints respond
- [ ] WebSocket connects
- [ ] Emails send

### 2. Performance Testing
```bash
# Load testing
npx artillery quick --count 10 --num 100 https://yourdomain.com
```

### 3. Security Scan
```bash
# Run security audit
npm audit
npm audit fix
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
npx prisma db pull
```

### Build Failures
```bash
# Clear cache
rm -rf .next
npm run build
```

### WebSocket Issues
- Check firewall rules
- Verify WebSocket support
- Enable sticky sessions

## Support

- 📧 Email: devops@labinventory.com
- 📖 Docs: docs.labinventory.com
- 💬 Discord: discord.gg/labinventory

---

**Deployment completed successfully! 🎉**
