# LabInventory - Smart Inventory Management SaaS

<div align="center">

![LabInventory](https://img.shields.io/badge/LabInventory-v3.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Production-Ready SaaS Platform for Modern Labs**

[Features](#-key-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

## 🎯 Overview

**LabInventory** is a modern web-based inventory management system for IoT components and lab equipment. Built with Next.js 15, it features multi-tenant architecture, real-time notifications, and AI-powered analytics for educational institutions and research laboratories.

### Perfect For
- 🎓 Educational institutions
- 🔬 Research laboratories  
- 🏢 Corporate R&D departments
- 🏭 Manufacturing facilities
- 🛠️ Maker spaces

## ✨ Key Features

### 🏢 Multi-Tenant Foundation
- Organization-based data isolation
- Scalable architecture for multiple institutions
- Custom organization settings
- Prepared for SaaS expansion

### 🔐 Enterprise Security
- Hybrid authentication (Azure AD SSO, Google OAuth, Credentials)
- Role-based access control (4 roles: Student, Lab Assistant, HOD, Admin)
- Audit logs for compliance
- Data encryption and secure sessions

### 📊 Advanced Features
- QR code tracking and scanning
- Real-time WebSocket notifications
- AI-powered inventory analytics (Google Gemini)
- Analytics dashboard with insights
- Automated return management
- RESTful API for integrations

### 🎨 Professional Interface
- Marketing pages (about, contact, privacy, terms, blog, changelog)
- Mobile-responsive design
- Modern UI with TailwindCSS + shadcn/ui
- SEO optimized

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/labinventory.git
cd labinventory
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Set up database
npm run db:push

# Seed demo data (optional)
npm run demo:seed

# Start development
npm run dev:full
```

Visit `http://localhost:3000` 🎉

## 📚 Documentation

- **[Market-Ready Guide](./docs/MARKET_READY_GUIDE.md)** - Complete feature overview
- **[Quick Start](./docs/QUICKSTART.md)** - Step-by-step setup
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment
- **[SaaS Documentation](./docs/README_SAAS.md)** - Detailed SaaS features
- **[Changelog](./CHANGELOG.md)** - Version history

## 💰 Pricing Structure (Infrastructure Ready)

The system has payment infrastructure configured but not actively billing:

| Plan | Price | Users | Components | Features |
|------|-------|-------|------------|----------|
| **Starter** | Free | 50 | 500 | Basic analytics, Email support |
| **Professional** | $99/mo | 500 | 5,000 | AI recommendations, API access |
| **Enterprise** | Custom | Unlimited | Unlimited | Custom integrations, SLA |

**Note:** Stripe integration is configured (`src/lib/stripe.ts`) but billing workflows are not currently active. System operates as single-organization deployment.

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.6
- **Database**: Prisma ORM + PostgreSQL
- **Auth**: NextAuth.js v5
- **UI**: TailwindCSS + shadcn/ui
- **Real-time**: WebSocket Server
- **Payments**: Stripe (ready to integrate)

## 📁 Project Structure

```
labinventory/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Public pages
│   │   ├── (app)/             # Authenticated app
│   │   ├── auth/              # Auth pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── types/                 # TypeScript types
├── prisma/                    # Database schema
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Docker
```bash
docker-compose up -d
```

### VPS
See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 🔧 Configuration

Key environment variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret"
STRIPE_SECRET_KEY="sk_live_..."
AZURE_AD_CLIENT_ID="your-client-id"
```

See [.env.example](./.env.example) for complete list.

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:coverage # Coverage report
npm run test:watch    # Watch mode
```

## 📊 What's New in v3.1

- ✅ AI-powered inventory analytics with Google Gemini
- ✅ Special parts request system
- ✅ Project management with duration tracking
- ✅ Enhanced request workflow with priorities
- ✅ Real-time WebSocket notifications
- ✅ Multi-tenant architecture foundation
- ✅ Professional marketing pages
- ✅ Payment infrastructure (Stripe configured)
- ✅ Mobile-responsive interface
- ✅ Production deployment ready

See [CHANGELOG.md](./CHANGELOG.md) for details.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see [LICENSE](./LICENSE) file.

## 🙏 Acknowledgments

Built with amazing open-source tools:
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)

## 📞 Support

- 📧 Email: support@labinventory.com
- 💬 Discord: [Join community](https://discord.gg/labinventory)
- 📖 Docs: [docs.labinventory.com](https://docs.labinventory.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/labinventory/issues)

---

<div align="center">

**Built with ❤️ by the LabInventory Team**

[Website](https://labinventory.com) • [Twitter](https://twitter.com/labinventory) • [LinkedIn](https://linkedin.com/company/labinventory)

⭐ Star us on GitHub if you find this useful!

</div>
