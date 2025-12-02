# Production Infrastructure Setup Guide

**Status:** Ready to Deploy
**Date:** January 14, 2025

This guide walks you through deploying ISBNScout to production with Neon PostgreSQL and Railway/Fly.io hosting.

---

## 🎯 Architecture Overview

**Current (Development):**
- Frontend: Vite dev server (localhost:5173)
- Backend: Express on localhost:5000
- Database: SQLite (local file)
- Mobile: Capacitor builds connect to localhost

**Target (Production):**
- Frontend: Static build served by backend
- Backend: Express on Railway/Fly.io
- Database: Neon PostgreSQL (serverless)
- Mobile: Capacitor builds connect to production API

---

## 📋 Pre-Deployment Checklist

**Code Status:**
- ✅ PostgreSQL storage implementation complete
- ✅ Database schema defined (Drizzle ORM)
- ✅ Migration config ready (`drizzle.config.ts`)
- ✅ Environment variable switching (`DATABASE_URL`)
- ✅ Build scripts configured

**Accounts Needed:**
- [ ] Neon Database account (free tier: 0.5GB storage)
- [ ] Railway account OR Fly.io account (free tier available)
- [ ] Domain (optional - can use provided subdomain)

---

## Step 1: Create Neon PostgreSQL Database

### 1.1 Sign Up for Neon

1. Go to https://neon.tech/
2. Click "Sign Up" (free tier: no credit card required)
3. Sign in with GitHub, Google, or email
4. Verify your email

### 1.2 Create Your Project

1. Click "Create Project"
2. **Project Name:** `isbnscout-prod`
3. **Region:** Choose closest to your users (EU for UK, US-East for USA)
4. **PostgreSQL Version:** 16 (default)
5. Click "Create Project"

### 1.3 Get Database Connection String

1. After creation, you'll see the connection details
2. Copy the **Connection String** (looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. Save this securely - you'll need it for both local testing and deployment

### 1.4 Configure Database for Drizzle

Neon provides a connection string, but we're using `@neondatabase/serverless` which is already configured in `server/postgres-storage.ts`. No additional setup needed!

---

## Step 2: Push Database Schema to Neon

### 2.1 Set DATABASE_URL Locally

Update your `.env` file:

```bash
# Replace the placeholder with your actual Neon connection string
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### 2.2 Push Schema to Database

Run the Drizzle push command:

```bash
npm run db:push
```

**Expected Output:**
```
✓ Pulling schema from database...
✓ Pushing schema to database...
✓ Successfully pushed schema changes!
```

This will create all tables:
- ✅ `users`
- ✅ `api_credentials`
- ✅ `books`
- ✅ `listings`
- ✅ `inventory_items`

### 2.3 Verify Tables Created

1. Go back to Neon console
2. Navigate to "Tables" tab
3. You should see all 5 tables listed
4. Click on `users` to see the schema

---

## Step 3: Deploy Backend to Railway (Option A)

### 3.1 Install Railway CLI

```bash
npm install -g @railway/cli
```

### 3.2 Login to Railway

```bash
railway login
```

This opens your browser for authentication.

### 3.3 Initialize Project

```bash
railway init
```

- **Project Name:** isbnscout
- **Start from:** Existing code

### 3.4 Add Environment Variables

```bash
# Database
railway variables set DATABASE_URL="your-neon-connection-string"

# Session Secret (generate a new one!)
railway variables set SESSION_SECRET="$(openssl rand -base64 32)"

# Google Books API
railway variables set GOOGLE_BOOKS_API_KEY="your-api-key"

# OpenAI API
railway variables set OPENAI_API_KEY="your-api-key"

# eBay API
railway variables set EBAY_APP_ID="your-app-id"
railway variables set EBAY_CERT_ID="your-cert-id"
railway variables set EBAY_DEV_ID="your-dev-id"
railway variables set EBAY_SITE_ID="3"
railway variables set EBAY_SANDBOX="false"

# Stripe (optional)
railway variables set STRIPE_SECRET_KEY="your-stripe-key"
railway variables set STRIPE_PUBLISHABLE_KEY="your-stripe-pub-key"

# Base URL (will be provided by Railway)
railway variables set BASE_URL="https://isbnscout-production.up.railway.app"
```

### 3.5 Deploy

```bash
railway up
```

Railway will:
1. Build your application (`npm run build`)
2. Deploy to their infrastructure
3. Provide a URL (e.g., `https://isbnscout-production.up.railway.app`)

### 3.6 Set Custom Domain (Optional)

1. Go to Railway dashboard
2. Click your project → Settings
3. Add custom domain (e.g., `api.isbnscout.com`)
4. Update DNS records as instructed
5. Update `BASE_URL` environment variable

---

## Step 3: Deploy Backend to Fly.io (Option B)

### 3.1 Install Fly CLI

**macOS:**
```bash
brew install flyctl
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### 3.2 Sign Up and Login

```bash
fly auth signup
# or if you have an account:
fly auth login
```

### 3.3 Launch App

```bash
fly launch
```

**Prompts:**
- **App name:** isbnscout-prod
- **Region:** Choose closest to your users
- **Would you like to set up a Postgresql database?** No (we're using Neon)
- **Would you like to deploy now?** No (need to set env vars first)

This creates `fly.toml` configuration file.

### 3.4 Set Environment Variables

```bash
# Database
fly secrets set DATABASE_URL="your-neon-connection-string"

# Session Secret
fly secrets set SESSION_SECRET="$(openssl rand -base64 32)"

# APIs (same as Railway above)
fly secrets set GOOGLE_BOOKS_API_KEY="your-key"
fly secrets set OPENAI_API_KEY="your-key"
# ... (add all other env vars)
```

### 3.5 Deploy

```bash
fly deploy
```

Your app will be available at: `https://isbnscout-prod.fly.dev`

---

## Step 4: Update Mobile App Configuration

### 4.1 Update API URL in Capacitor Config

Edit `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.isbnscout.app',
  appName: 'ISBNScout',
  webDir: 'dist',
  server: {
    // PRODUCTION: Use your deployed backend URL
    url: 'https://isbnscout-production.up.railway.app',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
```

### 4.2 Rebuild Mobile Apps

```bash
# Build frontend and sync to mobile
npm run mobile:build

# Test on iOS
npm run mobile:ios

# Test on Android
npm run mobile:android
```

---

## Step 5: Test Production Deployment

### 5.1 Test Backend API

```bash
# Health check
curl https://your-production-url.com/

# Create test user
curl -X POST https://your-production-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Test book lookup
curl https://your-production-url.com/api/books/9780141439518
```

### 5.2 Test Database Connection

Check logs for successful connection:

**Railway:**
```bash
railway logs
```

**Fly.io:**
```bash
fly logs
```

Look for:
```
[Storage] Using PostgreSQL (Neon)
✓ Database connected successfully
```

### 5.3 Test Mobile App

1. Build and install app on test device
2. Register new account
3. Scan a book barcode
4. Verify data saves to Neon database
5. Check Neon console to see new records

---

## Step 6: Configure Production Environment

### 6.1 Security Checklist

**Environment Variables:**
- [ ] `SESSION_SECRET` is a strong random string (not default)
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`)
- [ ] API keys are production keys (not test keys)
- [ ] Stripe webhook secret configured (if using Stripe)

**Database:**
- [ ] Neon database has automatic backups enabled
- [ ] Connection pooling configured (Neon handles this)
- [ ] SSL/TLS enforced for connections

**API Security:**
- [ ] Rate limiting enabled (add `express-rate-limit` if needed)
- [ ] CORS configured properly
- [ ] Helmet.js for security headers (add if needed)
- [ ] Input validation on all endpoints

### 6.2 Monitoring Setup

**Railway:**
- Dashboard shows CPU, memory, and request metrics automatically
- Set up alerts for downtime or high usage

**Fly.io:**
- Use `fly dashboard` for metrics
- Set up log forwarding to external service (optional)

**Neon:**
- Monitor database usage in Neon console
- Set up alerts for storage limits (free tier: 0.5GB)

---

## Step 7: Performance Optimization

### 7.1 Database Optimization

**Indexes (Already configured in schema):**
- ✅ User lookups: username, email
- ✅ Book lookups: ISBN, userId
- ✅ Inventory queries: status, userId
- ✅ Listing queries: platform, status

**Connection Pooling:**
Neon's serverless driver handles this automatically. No additional config needed!

### 7.2 API Caching

Consider adding Redis for:
- Book pricing data (cache for 1 hour)
- Google Books API responses
- eBay/Amazon API responses

**For later:** Add Redis via Railway/Fly.io add-ons.

### 7.3 CDN for Static Assets

**Railway/Fly.io includes CDN** - static files are automatically cached at edge locations.

For additional performance, consider:
- Cloudflare (free tier)
- Vercel Edge Network
- AWS CloudFront

---

## 📊 Cost Breakdown

### Free Tier (Starting Out)

| Service | Free Tier | Paid After |
|---------|-----------|------------|
| **Neon PostgreSQL** | 0.5 GB storage, 1 project | $19/month (Pro) |
| **Railway** | $5/month credit | $0.000463/GB-s |
| **Fly.io** | 3 shared VMs, 3GB storage | ~$2/month/VM |
| **Total** | **$0-5/month** | Scales with usage |

### Expected Monthly Cost (1,000 users)

| Service | Usage | Cost |
|---------|-------|------|
| **Database** | ~2GB storage | $19/month (Pro tier) |
| **Hosting** | ~5GB RAM, 50GB bandwidth | $10-20/month |
| **APIs** | Google Books, OpenAI, eBay | $50-100/month |
| **Total** | | **$80-140/month** |

**Revenue Target:** 100 paid users @ $10/month = $1,000/month
**Profit Margin:** ~85% ($860/month)

---

## 🚦 Deployment Checklist

**Before Deploying:**
- [ ] All environment variables documented
- [ ] Database schema tested locally with Neon
- [ ] Mobile app connects to production API
- [ ] Test user accounts work end-to-end
- [ ] Error monitoring configured

**First Deployment:**
- [ ] Backend deployed to Railway/Fly.io
- [ ] Database schema pushed to Neon
- [ ] Environment variables configured
- [ ] Health check endpoint returns 200 OK
- [ ] Logs show successful startup

**After Deployment:**
- [ ] Test all API endpoints
- [ ] Test mobile app registration/login
- [ ] Test book scanning and pricing
- [ ] Test inventory management
- [ ] Monitor logs for errors

**Ongoing:**
- [ ] Monitor Neon database usage
- [ ] Monitor hosting costs
- [ ] Set up alerts for downtime
- [ ] Regular database backups (Neon auto-backup)
- [ ] Update mobile apps when API changes

---

## 🐛 Troubleshooting

### Database Connection Errors

**Error:** `Error: connect ECONNREFUSED`
- Check DATABASE_URL is correct
- Verify Neon database is active (not paused)
- Check SSL mode is set: `?sslmode=require`

**Error:** `SSL SYSCALL error: EOF detected`
- Neon connection pooling issue
- Add `?sslmode=require&connect_timeout=10` to connection string

### Deployment Failures

**Railway "Build Failed":**
- Check `package.json` scripts
- Verify all dependencies are in `dependencies` (not `devDependencies`)
- Check logs: `railway logs`

**Fly.io "Health Check Failed":**
- Verify app listens on `0.0.0.0` (not `localhost`)
- Check `PORT` environment variable is respected
- Increase health check timeout in `fly.toml`

### Mobile App Connection Issues

**Error:** "Network request failed"
- Check Capacitor config has correct URL
- Verify backend is accessible from mobile network
- Check CORS headers allow mobile origin
- Test with Postman/curl from mobile network

**Error:** "SSL certificate error"
- Railway/Fly.io provide valid SSL certificates
- If using custom domain, verify SSL is configured
- Check mobile app allows cleartext (for testing only)

---

## 📚 Additional Resources

**Neon Documentation:**
- https://neon.tech/docs/introduction
- https://neon.tech/docs/connect/connect-from-any-app

**Railway Documentation:**
- https://docs.railway.app/
- https://docs.railway.app/deploy/deployments

**Fly.io Documentation:**
- https://fly.io/docs/
- https://fly.io/docs/languages-and-frameworks/node/

**Drizzle ORM:**
- https://orm.drizzle.team/docs/overview
- https://orm.drizzle.team/docs/get-started-postgresql

---

## 🎯 Next Steps After Deployment

1. **Beta Testing**
   - Deploy to TestFlight (iOS) and Google Play Beta
   - Recruit 5-10 beta testers
   - Gather feedback on real devices

2. **Monitoring & Analytics**
   - Set up error tracking (Sentry, Rollbar)
   - Add analytics (PostHog, Mixpanel)
   - Monitor API performance (New Relic, Datadog)

3. **Feature Development**
   - Label generator for inventory
   - Receipt photo upload
   - Advanced analytics dashboard
   - Price alerts and notifications

4. **App Store Submission**
   - Prepare app store listings
   - Screenshots and promo materials
   - Submit to App Store and Google Play
   - Launch marketing campaign

---

## ✅ Production Readiness Status

**Infrastructure:** 🟡 Partially Ready (code ready, needs deployment)
**Database:** 🟡 Partially Ready (schema ready, needs Neon setup)
**Mobile App:** 🟡 Partially Ready (needs production API URL)
**Testing:** 🔴 Not Started (needs device testing)
**Monitoring:** 🔴 Not Started (needs setup)

**Overall:** **60% Ready for Production**

**Critical Path to 100%:**
1. Set up Neon database (30 minutes)
2. Deploy to Railway/Fly.io (1 hour)
3. Test on real devices (2-4 hours)
4. Fix critical bugs (varies)
5. Set up monitoring (1 hour)

**Estimated Time to Production:** 1-2 days of focused work

---

**You're almost there! The code is production-ready. Just need to provision the infrastructure and test.** 🚀
