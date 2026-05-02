# Changelog

All notable changes to LabInventory will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-01-30 - Enhanced Features & Cleanup 🎯

### Added
- **Project Management System**
  - Create and manage projects with flexible date ranges
  - Link component requests to projects
  - Auto-calculate duration from start/end dates
  - Delete projects with verification code protection
  - Project-based priority system (>6 months = High Priority)

- **Special Parts Request Feature**
  - Request parts not in inventory
  - Multiple input methods: Part details OR Product link OR Images
  - Upload up to 5 product images
  - Status tracking: PENDING → UNDER_REVIEW → APPROVED/REJECTED → ORDERED → RECEIVED
  - Students can delete pending requests

- **AI-Powered Inventory Analytics**
  - Google Gemini AI integration for smart insights
  - Utilization rate analysis
  - Stock alerts and predictions
  - Performance metrics and demand trends
  - Risk factor identification

- **Enhanced Request System**
  - Duration in months (6, 12, 18, 24) for projects
  - Start/end date pickers for single parts
  - Auto-calculated duration and priority
  - Purpose field conditional on request type
  - Component availability badges in search

### Changed
- **UI/UX Improvements**
  - Forced dark mode across entire application
  - Removed gamification features from student dashboard
  - Simplified lab assistant dashboard
  - Enhanced component cards with stock indicators
  - Improved request form with better validation

- **Authentication System**
  - Cleaned up auth configuration (removed 200+ lines)
  - Simplified to use actual database user IDs
  - Fixed sign-in provider configuration
  - Enhanced error messages and logging

- **Code Quality**
  - Removed 40+ redundant documentation files
  - Deleted temporary test scripts
  - Consolidated documentation into essential files
  - Cleaned up API routes (260 → 170 lines in requests API)
  - Improved error handling across the board

### Fixed
- Student dashboard authentication errors
- Component creation with organization linking
- Special request submission validation
- Lab assistant credentials verification
- Database schema synchronization

### Removed
- Temporary test files (check-users.js, test-api.js, etc.)
- Redundant documentation files
- Unused gamification components
- Theme toggle (dark mode only now)
- Duplicate logo files

### Documentation
- Updated DEMO_CREDENTIALS.md with all user credentials
- Enhanced QUICKSTART.md with latest features
- Improved PRODUCTION_SETUP.md
- Consolidated feature documentation
- Added AI_INVENTORY_ANALYTICS.md
- Added SPECIAL_PARTS_REQUEST_FEATURE.md
- Added RETURN_SYSTEM_GUIDE.md

## [3.0.0] - 2026-01-26 - Market-Ready Release 🚀

### Added - SaaS Features
- **Multi-Tenancy Architecture**
  - Organization workspaces with complete data isolation
  - Custom organization URLs (slugs)
  - Team management with role-based access
  - Organization settings and configuration

- **Public Marketing Website**
  - Professional landing page with hero, features, pricing
  - About page with company story and values
  - Contact page with multi-channel support
  - Privacy policy and terms of service pages
  - SEO optimization with meta tags and OG images
  - Sitemap and robots.txt for search engines

- **Subscription Management**
  - Three pricing tiers: Starter (Free), Professional ($99/mo), Enterprise (Custom)
  - 14-day free trial for all plans
  - Usage tracking (users, components, API calls)
  - Billing dashboard with invoice history
  - Stripe integration ready (checkout, webhooks, portal)

- **User Onboarding**
  - New signup flow with organization creation
  - Plan selection during signup
  - Automatic owner account setup
  - Email verification (ready to implement)

- **Organization Management**
  - Organization profile settings
  - Team member invitations
  - Role assignment and management
  - Security settings (2FA, SSO)
  - Danger zone for organization deletion

### Changed
- **Branding**
  - Renamed from "IoT Parts Management" to "LabInventory"
  - Updated all UI components with new branding
  - Professional color scheme and design system
  - Improved typography and spacing

- **Database Schema**
  - Added `Organization` model for multi-tenancy
  - Added `OrganizationInvitation` model for team invites
  - Updated `User` model with `organizationId` and `OWNER` role
  - Updated `Component` model with `organizationId` for data isolation
  - Added unique constraints scoped to organizations

- **Routing Structure**
  - Split into `(marketing)` and `(app)` route groups
  - Separate layouts for public and authenticated pages
  - Improved navigation and user flows

- **Metadata & SEO**
  - Enhanced meta tags for better search visibility
  - Added Open Graph images and Twitter cards
  - Implemented dynamic sitemap generation
  - Configured robots.txt for proper indexing

### Enhanced
- **Security**
  - Organization-level data isolation
  - Enhanced role-based access control
  - Audit logging for organization changes
  - Secure environment variable handling

- **Performance**
  - Optimized database queries with proper indexes
  - Improved caching strategies
  - Lazy loading for heavy components
  - Image optimization

- **Developer Experience**
  - Comprehensive documentation
  - Deployment guides for multiple platforms
  - Environment variable examples
  - Docker support

### Documentation
- Added `MARKET_READY_GUIDE.md` - Complete feature overview
- Added `README_SAAS.md` - SaaS-focused documentation
- Added `DEPLOYMENT.md` - Production deployment guide
- Updated `.env.example` with all configuration options
- Added inline code comments for complex logic

### Infrastructure
- Docker configuration for containerized deployment
- Vercel deployment optimization
- Database migration scripts
- Backup and recovery procedures

## [2.0.0] - 2025-12-15 - Enterprise Features

### Added
- Return management system with automated reminders
- Real-time WebSocket notifications
- Background job scheduler
- AI-powered component recommendations
- Advanced analytics dashboard
- Smart search with fuzzy matching
- QR code generation and scanning
- Audit logging system

### Changed
- Upgraded to Next.js 15
- Migrated to App Router
- Improved TypeScript types
- Enhanced error handling

### Fixed
- Performance issues with large datasets
- WebSocket connection stability
- Notification delivery reliability

## [1.0.0] - 2025-06-01 - Initial Release

### Added
- User authentication with Microsoft Azure AD
- Role-based access control (Student, Lab Assistant, HOD, Admin)
- Component inventory management
- Request and approval workflow
- Parts issuance tracking
- Basic analytics and reporting
- Responsive UI with dark mode
- SQLite database with Prisma ORM

---

## Upgrade Guide

### From 2.x to 3.0

1. **Backup your database**
   ```bash
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Update dependencies**
   ```bash
   npm install
   ```

3. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Update environment variables**
   - Add new variables from `.env.example`
   - Configure organization settings
   - Set up Stripe keys (if using payments)

5. **Migrate existing data**
   ```bash
   npm run migrate:organizations
   ```

6. **Test the upgrade**
   - Verify all features work
   - Check data integrity
   - Test authentication flow

### Breaking Changes in 3.0

- **Database Schema**: All models now require `organizationId`
- **Authentication**: Users must belong to an organization
- **API Routes**: Updated to support multi-tenancy
- **Environment Variables**: New required variables for SaaS features

---

## Support

For questions or issues:
- 📧 Email: support@labinventory.com
- 💬 Discord: [Join our community](https://discord.gg/labinventory)
- 🐛 GitHub: [Report an issue](https://github.com/yourusername/labinventory/issues)
