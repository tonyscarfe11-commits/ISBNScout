# Deployment Guide

Quick guide to deploy ISBNScout to production.

## Pre-Deployment Checklist

### 1. Environment Configuration

Create `.env.production`:
```bash
NODE_ENV=production
PORT=5000
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
DATABASE_URL=postgresql://user:pass@host/db

# Required APIs
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
EBAY_CLIENT_ID=...
EBAY_CLIENT_SECRET=...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info
```

### 2. Update CORS Origins

Edit `server/index.ts` line 28-31:
```typescript
const allowedOrigins = [
  'https://isbnscout.com',      // Your domain
  'https://www.isbnscout.com',
];
```

### 3. Database Setup

```bash
# Run migrations
npm run db:push

# Verify connection
node -e "require('./server/storage').storage.healthCheck()"
```

### 4. Build Application

```bash
npm ci --production=false
npm run build
```

Verify `dist/` folder contains:
- `dist/index.js` (server bundle)
- `dist/public/` (client build)

## Deploy to Replit

1. Push code to GitHub
2. Import repository to Replit
3. Set environment variables in Secrets
4. Run: `npm run build && npm start`
5. Enable "Always On" for production

## Deploy to Vercel/Netlify

```bash
# Install CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables via dashboard
```

## Deploy to VPS (Ubuntu)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone & setup
git clone <repo-url>
cd isbnscout
npm ci
npm run build

# Set up PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name isbnscout
pm2 startup
pm2 save

# Set up Nginx reverse proxy
sudo apt install nginx
# Create /etc/nginx/sites-available/isbnscout
# Point to localhost:5000
```

## Post-Deployment

### 1. Test Critical Paths

```bash
# Health check
curl https://yourdomain.com/api/health

# Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 2. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook secret to env

### 3. Set Up Monitoring

- **Uptime:** UptimeRobot, Pingdom, or StatusCake
- **Errors:** Sentry (already integrated)
- **Logs:** Check `logs/combined.log` and `logs/error.log`

### 4. Enable Backups

```bash
# Daily database backup
crontab -e
0 2 * * * pg_dump $DATABASE_URL > /backup/db-$(date +\%Y\%m\%d).sql

# Keep last 30 days
find /backup -name "db-*.sql" -mtime +30 -delete
```

## Rollback Procedure

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD
git push

# Or rollback to specific version
git checkout <previous-commit>
git push --force  # Only if necessary

# Restart service
pm2 restart isbnscout
```

## Performance Optimization

### 1. Enable Compression
```typescript
import compression from 'compression';
app.use(compression());
```

### 2. CDN for Static Assets
Upload `dist/public/assets/` to CloudFlare, AWS S3, or similar.

### 3. Database Connection Pooling
Already configured in `@neondatabase/serverless`.

## Troubleshooting

### Server won't start
- Check logs: `pm2 logs isbnscout`
- Verify env vars: `printenv | grep NODE`
- Test build: `node dist/index.js`

### Database connection fails
- Check DATABASE_URL format
- Verify firewall allows connections
- Test: `pg_isready -d $DATABASE_URL`

### Stripe webhooks failing
- Verify webhook secret matches
- Check endpoint is publicly accessible
- Test with Stripe CLI: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`

---

Need help? Check logs first: `tail -f logs/error.log`
