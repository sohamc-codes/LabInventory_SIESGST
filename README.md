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

**LabInventory** is a market-ready SaaS platform for managing IoT components and lab equipment. Built with Next.js 15, it features multi-tenancy, subscription management, real-time notifications, and AI-powered recommendations.

### Perfect For
- 🎓 Educational institutions
- 🔬 Research laboratories  
- 🏢 Corporate R&D departments
- 🏭 Manufacturing facilities
- 🛠️ Maker spaces

## ✨ Key Features

### 🏢 Multi-Tenant SaaS
- Complete organization workspaces with data isolation
- Custom branded URLs for each organization
- Team management with role-based access
- Unlimited organizations support

### 💳 Subscription Management
- 3 pricing tiers: Starter (Free), Professional ($99/mo), Enterprise
- 14-day free trial, no credit card required
- Usage tracking and billing dashboard
- Stripe integration ready

### 🎨 Professional Marketing
- Landing page with hero, features, pricing, testimonials
- Legal pages (privacy, terms)
- Contact forms and support channels
- SEO optimized with meta tags and sitemaps

### 🔐 Enterprise Security
- SSO integration (Microsoft Azure AD, Google)
- Role-based access control (5 roles)
- Audit logs for compliance
- Data encryption at rest and in transit

### 📊 Advanced Features
- QR code tracking and scanning
- Real-time WebSocket notifications
- AI-powered component recommendations
- Analytics dashboard with insights
- Automated return management
- RESTful API for integrations

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

## 💰 Pricing

| Plan | Price | Users | Components | Features |
|------|-------|-------|------------|----------|
| **Starter** | Free | 50 | 500 | Basic analytics, Email support |
| **Professional** | $99/mo | 500 | 5,000 | AI recommendations, API access |
| **Enterprise** | Custom | Unlimited | Unlimited | Custom integrations, SLA |

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

## 📊 What's New in v3.0

- ✅ Multi-tenant architecture
- ✅ Professional marketing website
- ✅ Subscription management
- ✅ Organization workspaces
- ✅ Team collaboration
- ✅ Enhanced SEO
- ✅ Stripe integration ready
- ✅ Production deployment guides

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
