# ISBNScout - Professional Book Scouting Platform

![Production Ready](https://img.shields.io/badge/production-ready-brightgreen)
![Security Score](https://img.shields.io/badge/security-9%2F10-brightgreen)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

**UK's most advanced book scouting app** - AI-powered spine recognition, offline-first architecture, and real-time profitability analysis.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

## 🏗️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend:** Express.js + TypeScript
- **Database:** Hybrid SQLite (offline) + PostgreSQL (production)
- **AI:** OpenAI GPT-4 Vision for cover/spine recognition
- **APIs:** eBay Browse API, Google Books API
- **Mobile:** Capacitor (iOS/Android)

## ✨ Key Features

### 1. **AI Spine Recognition** 🤖
Photograph entire bookshelves - AI identifies books without pulling them out. **Industry first.**

### 2. **Offline-First Architecture** 📱
Works in charity shops with no signal. Syncs automatically when online.

### 3. **Real-Time Profitability** 💰
Instant profit calculations for Amazon FBA/MFN and eBay UK with all fees included.

### 4. **Automated Repricing** 🔄
Set rules to automatically adjust prices based on competition.

### 5. **Professional Security** 🔒
- Rate limiting (brute force protection)
- Helmet.js security headers
- Sentry error tracking
- Winston structured logging
- Session security (httpOnly cookies)

## 📁 Project Structure

```
├── client/src/          # React frontend
│   ├── components/      # Reusable UI components
│   ├── pages/          # Route pages
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities
├── server/             # Express backend
│   ├── routes/         # API routes (modular)
│   ├── middleware/     # Auth, rate limiting, etc.
│   ├── services/       # Business logic
│   └── *.ts           # Core server files
├── shared/            # Shared types/schemas
├── tests/             # Test suites
│   ├── unit/          # Unit tests
│   └── integration/   # Integration tests
└── .github/workflows/ # CI/CD pipelines
```

## 🔐 Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| Rate Limiting | ✅ | 5 different limiters protecting endpoints |
| Security Headers | ✅ | Helmet.js with CSP |
| Error Tracking | ✅ | Sentry integration |
| Structured Logging | ✅ | Winston with log rotation |
| Input Validation | ✅ | Zod schemas |
| SQL Injection | ✅ | Prepared statements |
| XSS Protection | ✅ | httpOnly cookies + CSP |
| CORS | ✅ | Whitelist-based |

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# UI mode
npm run test:ui
```

**Test Coverage:** Unit + Integration tests for auth, pricing, and subscriptions.

## 🚢 Deployment

### Environment Variables Required

```bash
# Core
NODE_ENV=production
PORT=5000
SESSION_SECRET=<generate-random-secret>
DATABASE_URL=<neon-postgresql-url>

# APIs
OPENAI_API_KEY=<your-key>
STRIPE_SECRET_KEY=<your-key>
STRIPE_WEBHOOK_SECRET=<your-key>
EBAY_CLIENT_ID=<your-key>
EBAY_CLIENT_SECRET=<your-key>

# Monitoring
SENTRY_DSN=<your-dsn>
LOG_LEVEL=info
```

### Production Checklist

- [ ] Set all environment variables
- [ ] Update CORS allowed origins in `server/index.ts`
- [ ] Set up Sentry project and add DSN
- [ ] Configure database backups
- [ ] Set up health check monitoring
- [ ] Enable GitHub Actions
- [ ] Test Stripe webhooks

## 📊 API Routes

All routes are organized into logical modules:

- `/api/auth` - Authentication (signup, login, logout)
- `/api/books` - Book scanning and pricing
- `/api/inventory` - Inventory management
- `/api/listings` - Marketplace listings
- `/api/subscriptions` - Stripe subscriptions
- `/api/repricing` - Automated repricing
- `/api/ai` - AI image analysis
- `/api/affiliates` - Affiliate program
- `/api/admin` - Admin panel

See `.github/workflows/ci.yml` for automated testing.

## 🎯 Subscription Tiers

- **Trial:** 10 scans/day (14 days)
- **Basic:** 50 scans/day - £9.99/month
- **Pro:** 500 scans/day - £29.99/month
- **Unlimited:** Unlimited scans - £79.99/month

## 📱 Mobile App

Build for iOS/Android using Capacitor:

```bash
npm run mobile:build
npm run mobile:ios     # Open Xcode
npm run mobile:android # Open Android Studio
```

## 🤝 Contributing

This is a commercial project. For support:
- GitHub Issues: Bug reports only
- Email: support@isbnscout.com

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ for UK book resellers**

[Documentation](./SETUP.md) • [Security](./SECURITY.md) • [Deployment](./DEPLOYMENT.md)
