# Deployment Quick Start - TL;DR Version

**Time Required:** 1-2 hours
**Cost:** $0-5/month to start

---

## Step 1: Neon Database (10 minutes)

```bash
# 1. Go to https://neon.tech/ and sign up (free)
# 2. Create project: "isbnscout-prod"
# 3. Copy connection string

# 4. Update .env
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# 5. Push schema
npm run db:push
```

---

## Step 2: Deploy to Railway (20 minutes)

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Set environment variables (copy from .env)
railway variables set DATABASE_URL="your-neon-url"
railway variables set SESSION_SECRET="$(openssl rand -base64 32)"
railway variables set GOOGLE_BOOKS_API_KEY="your-key"
railway variables set OPENAI_API_KEY="your-key"
railway variables set EBAY_APP_ID="your-app-id"
railway variables set EBAY_CERT_ID="your-cert-id"
railway variables set EBAY_DEV_ID="your-dev-id"
railway variables set EBAY_SITE_ID="3"
railway variables set EBAY_SANDBOX="false"
railway variables set STRIPE_SECRET_KEY="your-key"
railway variables set STRIPE_PUBLISHABLE_KEY="your-key"

# Deploy
railway up

# Get your URL
railway open
```

---

## Step 3: Update Mobile App (5 minutes)

Edit `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.isbnscout.app',
  appName: 'ISBNScout',
  webDir: 'dist',
  server: {
    url: 'https://your-app.up.railway.app', // Your Railway URL
    cleartext: true,
  },
};
```

Rebuild mobile apps:

```bash
npm run mobile:build
npm run mobile:ios      # Test on iOS
npm run mobile:android  # Test on Android
```

---

## Step 4: Test (30 minutes)

```bash
# Health check
curl https://your-app.up.railway.app/

# Check logs
railway logs

# Test on mobile device
# - Install app
# - Register account
# - Scan a book
# - Verify data in Neon console
```

---

## Alternative: Deploy to Fly.io

```bash
# Install CLI
curl -L https://fly.io/install.sh | sh  # Mac/Linux
# or: brew install flyctl

# Login
fly auth login

# Launch
fly launch
# Answer prompts, choose region

# Set secrets
fly secrets set DATABASE_URL="your-neon-url"
fly secrets set SESSION_SECRET="$(openssl rand -base64 32)"
# ... (set all other env vars)

# Deploy
fly deploy

# Your app: https://isbnscout-prod.fly.dev
```

---

## Verification Checklist

```bash
# Backend health
curl https://your-url.com/
# Expected: "ISBNScout API" or similar response

# Database connection
railway logs | grep "Storage"
# Expected: "[Storage] Using PostgreSQL (Neon)"

# API test
curl -X POST https://your-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123"}'
# Expected: User created successfully

# Mobile app
# Install on device, scan book, check Neon console for new records
```

---

## Troubleshooting

**"Cannot connect to database"**
```bash
# Check DATABASE_URL has ?sslmode=require
# Verify Neon project is active (not paused)
```

**"Build failed on Railway"**
```bash
# Check logs
railway logs

# Common fixes:
# - Ensure NODE_ENV not set (or set to production)
# - Check all dependencies in package.json
```

**"Mobile app can't connect"**
```bash
# Test from mobile network (not localhost)
curl -I https://your-url.com

# Update capacitor.config.ts with production URL
# Rebuild: npm run mobile:build
```

---

## Cost Monitoring

**First Month (Free Tier):**
- Neon: 0.5GB free
- Railway: $5 credit
- Total: $0

**Growing (100-1000 users):**
- Neon: $19/month (Pro tier)
- Railway: $10-20/month
- APIs: $50-100/month
- Total: ~$80-140/month

**Revenue (100 paid users @ $10/month):** $1,000/month
**Profit:** ~$860/month (86% margin)

---

## Next Actions After Deployment

1. **Test on devices** (iOS + Android)
2. **Recruit beta testers** (5-10 people)
3. **Set up monitoring** (Sentry for errors)
4. **Submit to app stores** (TestFlight + Google Play Beta)
5. **Launch!** 🚀

---

**All code is ready. Just need to run these commands.** ✅
