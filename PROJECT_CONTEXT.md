# IoT Lab Parts Management System - Complete Project Context

## 📋 Project Overview

**Project Name**: SIES GST IoT Lab Inventory Management System  
**Type**: Full-stack SaaS Web Application  
**Purpose**: Smart inventory management platform for educational IoT labs with multi-tenant support, hybrid authentication, and real-time tracking  
**GitHub**: https://github.com/sohamc-codes/LabInventory_SIESGST  
**Production URL**: https://lab-inventory-siesgst-vercel.app

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
- **Framework**: Next.js 15.0.3 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 3.4.14
- **UI Components**: 
  - Radix UI (Dialog, Dropdown, Select, Switch, Tabs, Toast, Tooltip)
  - Shadcn/ui component library
  - Lucide React icons
- **State Management**: 
  - TanStack React Query 5.59.16
  - React Hook Form 7.53.1 with Zod validation
- **Animations**: Framer Motion 11.11.17
- **Charts**: Recharts 2.12.7
- **Themes**: next-themes 0.4.4

### **Backend**
- **Runtime**: Node.js >=18.17.0
- **Framework**: Next.js API Routes (App Router)
- **Authentication**: 
  - NextAuth.js 5.0.0-beta.30
  - Microsoft Entra ID (Azure AD) OAuth
  - Credentials provider for lab staff
- **Database ORM**: Prisma 5.22.0
- **Database**: 
  - **Production**: Supabase PostgreSQL with PgBouncer connection pooling
  - **Development**: SQLite (prisma/dev.db)
- **Validation**: Zod 3.23.8
- **Password Hashing**: bcryptjs 3.0.3

### **Deployment & Infrastructure**
- **Hosting**: Vercel
- **Database**: Supabase PostgreSQL
- **Version Control**: Git + GitHub
- **CI/CD**: Vercel automatic deployments

### **Additional Libraries**
- **CSV Parsing**: Papaparse 5.5.3
- **QR Codes**: qrcode 1.5.4, html5-qrcode 2.3.8
- **Date Handling**: date-fns 4.1.0
- **Utilities**: clsx, tailwind-merge, use-debounce
- **WebSockets**: ws 8.18.0
- **AI Integration**: @google/generative-ai 0.24.1
- **Payments**: Stripe 20.3.1, @stripe/stripe-js 8.7.0

---

## 🗂️ Project Structure

```
iot_parts_management-main/
├── .kiro/                          # Kiro AI configuration
├── .next/                          # Next.js build output
├── node_modules/                   # Dependencies
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── dev.db                     # SQLite database (dev)
├── public/                        # Static assets
├── scripts/                       # Utility scripts
│   ├── seed-demo-data.js
│   ├── seed-lab-assistant.js
│   └── setup.js
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (app)/                # Authenticated app layout
│   │   │   ├── activity/         # Activity logs
│   │   │   ├── admin/            # Admin panel
│   │   │   ├── approvals/        # Request approvals
│   │   │   ├── bulk-import/      # CSV import
│   │   │   ├── dashboard/        # Role-based dashboards
│   │   │   ├── integrations/     # Integrations
│   │   │   ├── inventory/        # Inventory management
│   │   │   ├── projects/         # Student projects
│   │   │   ├── reports/          # Analytics reports
│   │   │   ├── requests/         # Component requests
│   │   │   ├── settings/         # Settings
│   │   │   └── users/            # User management
│   │   ├── (marketing)/          # Public marketing pages
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             # Authentication
│   │   │   ├── components/       # Component CRUD
│   │   │   ├── requests/         # Request management
│   │   │   ├── returns/          # Return processing
│   │   │   ├── scanner/          # Barcode scanning
│   │   │   └── users/            # User management
│   │   │       ├── bulk-import/  # Bulk PRN import
│   │   │       ├── onboard/      # Student onboarding
│   │   │       ├── search/       # User search
│   │   │       └── [id]/verify/  # PRN verification
│   │   ├── auth/                 # Auth pages
│   │   ├── issue-components/     # Issue components page
│   │   ├── onboarding/           # Student onboarding
│   │   ├── parts-issued/         # Parts return page
│   │   └── users/import/         # Bulk import page
│   ├── components/               # React components
│   │   ├── features/            # Feature-specific components
│   │   ├── layout/              # Layout components
│   │   ├── parts-issued/        # Return components
│   │   ├── ui/                  # UI primitives (Shadcn)
│   │   └── users/               # User-related components
│   ├── contexts/                # React contexts
│   ├── lib/                     # Utility libraries
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── auth.config.ts      # Auth config
│   │   ├── prisma.ts           # Prisma client
│   │   └── utils.ts            # Utility functions
│   ├── styles/                 # Global styles
│   └── types/                  # TypeScript types
├── .env                        # Environment variables
├── .env.example               # Example env file
├── .gitignore
├── .vercelignore              # Vercel ignore rules
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment config
└── Documentation files:
    ├── README.md
    ├── BARCODE_SCANNING_GUIDE.md
    ├── BULK_PRN_IMPORT_GUIDE.md
    ├── BULK_PRN_IMPORT_IMPLEMENTATION.md
    ├── CATEGORY_VALIDATION_FIX.md
    ├── LOGIN_GUIDE.md
    ├── PRN_LINKING_SOLUTION.md
    ├── TRUST_BUT_VERIFY_IMPLEMENTATION.md
    └── USER_ROLES_GUIDE.md
```

---

## 📊 Database Schema

### **Core Models**

#### **User**
```prisma
model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  image          String?
  password       String?   // For lab staff credentials auth
  role           String    @default("STUDENT") // STUDENT, LAB_ASSISTANT, HOD, ADMIN, OWNER
  organizationId String?
  prn            String?   @unique // Student PRN (8 alphanumeric)
  department     String?
  year           String?
  isActive       Boolean   @default(true)
  isPrnVerified  Boolean   @default(false) // PRN verified status
  lastActivity   DateTime?
  onboardedAt    DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

#### **Component**
```prisma
model Component {
  id                String   @id @default(cuid())
  organizationId    String
  serialNumber      String?
  qrCode            String?
  name              String
  category          String   // Accepts any string (custom categories allowed)
  manufacturer      String?
  model             String?
  specifications    String?  @db.Text
  totalStock        Int
  availableStock    Int
  condition         String   @default("NEW")
  purchaseDate      DateTime?
  cost              Float?
  storageLocation   String?
  imageUrl          String?
  description       String?  @db.Text
  isActive          Boolean  @default(true)
  lastScanned       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### **ComponentRequest**
```prisma
model ComponentRequest {
  id              String   @id @default(cuid())
  studentId       String
  componentId     String
  projectId       String?
  quantity        Int
  purpose         String   @db.Text
  expectedDuration Int     // in days
  startDate       DateTime?
  endDate         DateTime?
  status          String   @default("PENDING") // PENDING, APPROVED, REJECTED, ISSUED, RETURNED, OVERDUE, CLOSED
  approvedBy      String?
  approvedAt      DateTime?
  rejectionReason String?  @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### **IssuedComponent**
```prisma
model IssuedComponent {
  id              String   @id @default(cuid())
  requestId       String?  @unique
  studentId       String
  componentId     String
  quantity        Int
  issuedBy        String?
  issuedAt        DateTime @default(now())
  expectedReturnDate DateTime
  actualReturnDate DateTime?
  returnedQuantity Int?
  conditionOnIssue String
  conditionOnReturn String?
  notes           String?  @db.Text
  isReturned      Boolean  @default(false)
  status          String   @default("ACTIVE") // ACTIVE, RETURNED
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### **AuditLog**
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // BULK_IMPORT_PRN, SELF_ONBOARD, VERIFY_STUDENT_PRN, etc.
  resource  String
  details   String?  @db.Text // JSON string
  ipAddress String?
  userAgent String?  @db.Text
  createdAt DateTime @default(now())
}
```

### **Supporting Models**
- Organization (multi-tenant support)
- OrganizationInvitation
- Account (NextAuth)
- Session (NextAuth)
- Project
- StockMovement
- Notification
- ComponentHistory
- SpecialPartRequest

---

## 🔐 Authentication & Authorization

### **Authentication Methods**

1. **Microsoft Entra ID (Azure AD) OAuth**
   - For students and HODs
   - Provides: Email, Name, Profile Picture
   - Does NOT provide: PRN, Department, Year (linked separately)

2. **Credentials Authentication**
   - For lab assistants
   - Email + Password
   - Password hashed with bcryptjs

### **User Roles**

| Role | Access Level | Key Permissions |
|------|--------------|----------------|
| **STUDENT** | Basic | Request components, view own requests, manage projects |
| **LAB_ASSISTANT** | Staff | Issue/return components, manage inventory, verify students |
| **HOD** | Manager | Approve requests, manage users, view reports, verify students |
| **ADMIN** | System Admin | Full system access, manage all users, system health |
| **OWNER** | Organization Owner | Organization settings, billing, delete organization |

### **Default Lab Assistant Credentials**
- Email: `lab.staff@sies.edu`
- Password: `lab123`
- Created via: `scripts/seed-lab-assistant.js`

---

## 🎯 Key Features

### **1. Inventory Management**
- Real-time stock tracking
- Component lifecycle management
- Barcode/QR code scanning
- Custom categories support
- Storage location tracking
- Condition monitoring

### **2. Request Workflow**
```
Student Request → HOD Approval → Lab Assistant Issues → Student Returns → Lab Assistant Confirms
```

- Request creation with purpose and duration
- Multi-level approval system
- Email notifications
- Overdue tracking
- Return scheduling

### **3. Bulk PRN Import System** ✨ (NEW)
- CSV file upload with validation
- Client-side parsing (Papaparse)
- Batch processing
- Duplicate detection
- Error reporting
- Sets `isPrnVerified: true`
- Audit logging
- Role-based access (LAB_ASSISTANT, HOD, ADMIN, OWNER)

**CSV Format**:
```csv
email,prn,department,year
student@sies.edu,123A7001,Computer Engineering,TE
```

### **4. Trust-but-Verify Onboarding** ✨ (NEW)
- Self-service student registration
- PRN format validation (8 alphanumeric)
- Department and year selection
- Sets `isPrnVerified: false` (requires verification)
- Onboarding gatekeeper redirects students without PRN
- Lab staff verification UI
- One-click verification during scanning
- Visual warnings for unverified students

**Flow**:
```
New Student Login → Onboarding Form → Enter PRN → 
First Scan → Lab Staff Sees Warning → Verify Student → 
Future Scans (No Warning)
```

### **5. Barcode Scanning**
- USB barcode scanner support (acts as keyboard)
- QR code scanning
- PRN-based student lookup
- Component tracking
- Mobile camera scanning (planned)

### **6. Dashboard & Analytics**
- Role-specific dashboards
- Real-time metrics
- Component usage analytics
- Overdue tracking
- Activity logs

### **7. Multi-Tenant Architecture**
- Organization-based isolation
- Custom organization settings
- User invitations
- Role management per organization

---

## 🔧 Environment Variables

### **Required Variables**

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.vercel.app"  # Production URL

# Microsoft OAuth (Azure AD)
MICROSOFT_CLIENT_ID="7ecdc423-fa1c-457e-ab9b-5873f6bfd087"
MICROSOFT_CLIENT_SECRET="your-secret-here"
MICROSOFT_TENANT_ID="405ddc34-d660-46e5-b52d-bfd0be156bb5"
```

### **Azure Redirect URIs**
```
http://localhost:3000/api/auth/callback/microsoft-entra-id  (Development)
https://lab-inventory-siesgst-vercel.app/api/auth/callback/microsoft-entra-id  (Production)
```

---

## 📝 API Routes

### **Authentication**
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `POST /api/auth/callback/microsoft-entra-id` - OAuth callback

### **Users**
- `GET /api/users/search` - Search students (with `isPrnVerified` flag)
- `POST /api/users/bulk-import` - Bulk import student PRNs
- `POST /api/users/onboard` - Student self-onboarding
- `POST /api/users/[id]/verify` - Verify student PRN

### **Components**
- `GET /api/components` - List components
- `POST /api/components` - Create component
- `PUT /api/components/[id]` - Update component
- `DELETE /api/components/[id]` - Delete component

### **Requests**
- `GET /api/requests` - List requests (with filters)
- `POST /api/requests` - Create request
- `POST /api/requests/[id]/approve` - Approve request
- `POST /api/requests/[id]/reject` - Reject request
- `POST /api/requests/[id]/issue` - Issue component

### **Scanner**
- `POST /api/scanner/student` - Look up student by PRN (includes `isPrnVerified`)

### **Returns**
- `GET /api/parts-issued` - Get issued parts by PRN
- `POST /api/returns/mark-returned` - Mark component as returned

---

## 🚀 Deployment Configuration

### **vercel.json**
```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### **.vercelignore**
```
.env
.env.local
node_modules
.next
*.log
.DS_Store
prisma/dev.db
coverage
.vscode
__tests__
```

---

## 📱 User Interface

### **Design System**
- **Colors**: Tailwind CSS default palette with custom primary colors
- **Typography**: Geist Sans and Geist Mono fonts
- **Components**: Shadcn/ui component library
- **Dark Mode**: Supported via next-themes
- **Responsive**: Mobile-first design

### **Key Pages**

1. **Dashboard** (`/dashboard/[role]`)
   - Role-specific views
   - Quick stats cards
   - Recent activity
   - Shortcuts

2. **Inventory Management** (`/inventory/manage`)
   - Component list with search/filter
   - Add/edit/delete components
   - Stock level indicators
   - Barcode scanning

3. **Issue Components** (`/issue-components`)
   - Student lookup (barcode or manual)
   - Verification warning for unverified students
   - Approved requests list
   - One-click issue

4. **Parts Issued** (`/parts-issued`)
   - Student lookup by PRN
   - Verification status badge
   - Active checkouts list
   - One-click return

5. **Bulk Import** (`/users/import`)
   - CSV file upload
   - Preview table
   - Validation errors
   - Batch import

6. **Onboarding** (`/onboarding`)
   - PRN entry form
   - Department selection
   - Year selection
   - Verification notice

---

## 🧪 Testing & Quality

### **Commands**
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm test             # Jest tests
```

### **Database Commands**
```bash
npx prisma generate     # Generate Prisma client
npx prisma db push      # Push schema to database
npx prisma studio       # Open Prisma Studio
npx prisma migrate dev  # Create migration
```

---

## 📚 Documentation Files

1. **BARCODE_SCANNING_GUIDE.md** - Barcode scanning implementation
2. **BULK_PRN_IMPORT_GUIDE.md** - User guide for bulk import
3. **BULK_PRN_IMPORT_IMPLEMENTATION.md** - Technical implementation details
4. **TRUST_BUT_VERIFY_IMPLEMENTATION.md** - Onboarding system docs
5. **PRN_LINKING_SOLUTION.md** - PRN linking analysis
6. **USER_ROLES_GUIDE.md** - Complete role permissions matrix
7. **LOGIN_GUIDE.md** - Login instructions for different roles
8. **CATEGORY_VALIDATION_FIX.md** - Custom category support

---

## 🔄 Recent Implementation (Latest Commits)

### **Commit: 507688c** - "chore: Add Vercel deployment configuration"
- Added `vercel.json` with build settings
- Added `.vercelignore` for deployment optimization
- Configured Prisma generation in build command
- Set API function timeout to 30s

### **Commit: f0cd660** - "feat: Add Bulk PRN Import and Trust-but-Verify Onboarding System"
- Implemented bulk PRN import from CSV
- Created self-service student onboarding
- Added PRN verification system
- Updated scanner APIs to include verification status
- Added visual warnings for unverified students
- Created comprehensive documentation

**Statistics**:
- 20 files changed
- 3,401 lines added
- 7 new API endpoints
- 5 documentation files

---

## 🐛 Known Issues & Current Status

### **Deployment Status**
- ❌ **Vercel deployments failing** (investigating)
- ✅ All environment variables configured
- ✅ Azure OAuth redirect URIs configured
- ✅ Database schema migrated to PostgreSQL
- ✅ Code compiled with zero TypeScript errors

### **Potential Issues**
1. Build command execution
2. Prisma client generation on Vercel
3. Edge runtime compatibility
4. Memory/timeout during build

---

## 🎯 Future Enhancements

1. **Mobile App** - React Native companion app
2. **Advanced Analytics** - AI-powered insights
3. **Email Notifications** - Automated reminders
4. **Mobile Camera Scanning** - QR code scanning via phone
5. **Excel Import** - Support .xlsx files
6. **Batch Verification** - Verify multiple students at once
7. **Photo Upload** - ID card photo during verification
8. **Rollback Feature** - Undo bulk imports
9. **Export Feature** - Export data to CSV
10. **Verification History** - Track who verified whom

---

## 📞 Support & Contacts

- **GitHub**: https://github.com/sohamc-codes/LabInventory_SIESGST
- **Issues**: Submit via GitHub Issues
- **Email**: lab.staff@sies.edu (Lab Assistant account)

---

## 📄 License

Private project for SIES Graduate School of Technology

---

## 📊 Project Statistics

- **Total Files**: 100+
- **Total Lines of Code**: ~15,000+
- **Components**: 50+
- **API Routes**: 30+
- **Database Tables**: 14
- **Dependencies**: 60+
- **Development Time**: 3+ months
- **Team Size**: 1 developer

---

**Last Updated**: June 10, 2026  
**Version**: 3.0.0  
**Status**: Production-ready (deployment in progress)
