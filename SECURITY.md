# Security Documentation

## Critical Security Measures Implemented

### 1. Admin Access Control
- **Middleware**: `requireAdmin` in `server/middleware/auth.ts`
- **Configuration**: `ADMIN_EMAILS` environment variable (comma-separated)
- **Protected Endpoints**: All `/api/admin/*` routes
- **Logging**: All admin access attempts are logged with user email and endpoint

### 2. Session Security
- **Session Secret**: 128-character cryptographically secure random token
- **Cookie Settings**:
  - `httpOnly: true` - Prevents XSS attacks
  - `secure: true` - HTTPS only
  - `sameSite: 'none'` - Required for Replit cross-origin
- **Storage**: PostgreSQL session store (production), Memory store (development)

### 3. CSRF Protection
- **Implementation**: Synchronizer token pattern in `server/middleware/csrf.ts`
- **Token Generation**: 64-byte cryptographically secure random tokens
- **Protected Methods**: POST, PUT, PATCH, DELETE
- **Exemptions**:
  - GET, HEAD, OPTIONS requests
  - Requests with no origin (mobile apps, server-to-server)
  - Webhook endpoints (`/api/webhooks/*`)
  - Login/signup endpoints

### 4. Rate Limiting
- **Strategy**: User-based (not IP-based) to prevent VPN bypass
- **Tier Multipliers**:
  - Trial: 1x base limit
  - Pro: 2x base limit
  - Elite: 3x base limit
- **Limits**:
  - API endpoints: 100/200/300 requests per minute
  - Pricing lookups: 20/40/60 requests per minute
  - AI features: 10/20/30 requests per minute
  - Login attempts: 5 per 15 minutes (IP-based)
  - Signups: 3 per hour (IP-based)

### 5. CORS Policy
- **Development**: Allow all origins
- **Production**: Whitelist only:
  - `https://isbnscout.com`
  - `https://www.isbnscout.com`
  - Requests with no origin (mobile apps, Postman)

---

## Credential Rotation Procedure

### When to Rotate Credentials

**IMMEDIATELY** rotate credentials if:
- Credentials are exposed in public repositories
- A team member with access leaves
- A security breach is suspected
- Credentials are accidentally logged or shared

**REGULARLY** rotate credentials:
- SESSION_SECRET: Every 90 days
- Database passwords: Every 90 days
- API keys: As recommended by provider (typically 90-180 days)

### Rotation Steps

#### 1. Session Secret (Critical)

**Risk if compromised**: Attackers can forge session cookies and impersonate any user

**Steps**:
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Update .env
# SESSION_SECRET=<new-value>

# Restart server
# All existing sessions will be invalidated (users must re-login)
```

**Impact**: All users will be logged out and must re-authenticate

---

#### 2. Database Password (Critical)

**Risk if compromised**: Full access to all user data, ability to modify/delete data

**Steps for Neon PostgreSQL**:
1. Log into Neon console: https://console.neon.tech/
2. Navigate to your project → Settings → Password
3. Click "Reset password" and generate new password
4. Update DATABASE_URL in .env:
   ```
   postgresql://neondb_owner:<NEW-PASSWORD>@<host>/<database>?sslmode=require
   ```
5. Restart server immediately
6. Verify connectivity with health check

**Impact**: Minimal - server restart required, no user impact

---

#### 3. Stripe API Keys (Critical)

**Risk if compromised**: Unauthorized payments, access to customer payment info

**Steps**:
1. Log into Stripe Dashboard: https://dashboard.stripe.com/
2. Go to Developers → API Keys
3. Click "Roll secret key" (creates new key, old key continues working temporarily)
4. Update STRIPE_SECRET_KEY in .env
5. Test payment flow in development
6. Deploy to production
7. Delete old key from Stripe dashboard after verifying new key works

**For Webhook Secret**:
1. Developers → Webhooks → Select your endpoint
2. Click "Roll webhook signing secret"
3. Update STRIPE_WEBHOOK_SECRET in .env
4. Restart server

**Impact**: No downtime if rolled properly (old key works during transition)

---

#### 4. OpenAI API Key (High)

**Risk if compromised**: Unauthorized API usage, potential cost abuse

**Steps**:
1. Log into OpenAI Platform: https://platform.openai.com/
2. Go to API Keys
3. Create new API key
4. Update OPENAI_API_KEY in .env
5. Restart server
6. Revoke old key from OpenAI platform

**Impact**: AI features temporarily unavailable during restart

---

#### 5. Resend API Key (Medium)

**Risk if compromised**: Spam emails sent from your domain, reputation damage

**Steps**:
1. Log into Resend: https://resend.com/
2. Go to API Keys
3. Create new API key
4. Update RESEND_API_KEY in .env
5. Test email sending (trial reminder, welcome email)
6. Delete old API key

**Impact**: Emails cannot be sent during transition

---

#### 6. eBay API Credentials (Medium)

**Risk if compromised**: Unauthorized access to eBay product data

**Steps**:
1. Log into eBay Developer Program: https://developer.ebay.com/
2. Go to My Account → Application Keys
3. Generate new keyset (App ID, Cert ID, Dev ID)
4. Update in .env:
   - EBAY_APP_ID
   - EBAY_CERT_ID
   - EBAY_DEV_ID
5. Test eBay price lookup
6. Delete old keyset

**Impact**: eBay pricing temporarily unavailable during restart

---

#### 7. Google Books API Key (Low)

**Risk if compromised**: Quota abuse, API costs

**Steps**:
1. Log into Google Cloud Console: https://console.cloud.google.com/
2. Go to APIs & Services → Credentials
3. Create new API key
4. Update GOOGLE_BOOKS_API_KEY in .env
5. Restrict new key to Google Books API only
6. Delete old key

**Impact**: Book metadata lookups temporarily unavailable

---

#### 8. PostHog API Key (Low)

**Risk if compromised**: Analytics pollution, privacy data access

**Steps**:
1. Log into PostHog: https://app.posthog.com/
2. Go to Project Settings → API Keys
3. Create new personal API key
4. Update POSTHOG_KEY in .env
5. Update VITE_POSTHOG_KEY if client-side key is compromised
6. Delete old key

**Impact**: Analytics collection temporarily interrupted

---

### Emergency Procedure (Active Breach)

If you suspect an active security breach:

1. **IMMEDIATELY**: Disable all API keys from provider dashboards
2. **Change database password** (takes effect immediately)
3. **Rotate SESSION_SECRET** (logs out all users)
4. **Review logs** for unauthorized access:
   ```bash
   # Check for unauthorized admin access
   grep "SECURITY" logs/* | grep "Unauthorized admin access"

   # Check for suspicious rate limiting
   grep "Too many" logs/*

   # Check for CSRF failures
   grep "Invalid or missing CSRF token" logs/*
   ```
5. **Enable 2FA** for all admin accounts (if available)
6. **Notify users** if payment or personal data was accessed
7. **Update ADMIN_EMAILS** to remove compromised accounts

---

## Monitoring and Alerts

### Key Security Metrics to Monitor

1. **Failed Login Attempts**: > 5 from same IP in 15 minutes
2. **Admin Access Failures**: Any `[SECURITY] Unauthorized admin access attempt`
3. **Rate Limit Hits**: Users hitting limits repeatedly
4. **CSRF Failures**: Sudden spike in CSRF token rejections
5. **Database Connection Failures**: Potential credential issue

### Recommended Alerts (via Sentry)

```javascript
// Alert on unauthorized admin attempts
if (log.includes('[SECURITY] Unauthorized admin access attempt')) {
  Sentry.captureMessage('Unauthorized admin access', 'warning');
}

// Alert on CSRF failures (potential attack)
if (csrfFailures > 10 per minute) {
  Sentry.captureMessage('High CSRF failure rate', 'error');
}
```

---

## Admin Configuration

### Setting Up Admin Users

1. Edit `.env` file:
   ```bash
   ADMIN_EMAILS=admin@isbnscout.com,owner@isbnscout.com
   ```

2. Admin users must create regular accounts first via signup

3. Once their email is added to ADMIN_EMAILS, they can access:
   - `/api/admin/affiliates` - View all affiliates
   - `/api/admin/affiliates/:id/approve` - Approve affiliate applications
   - `/api/admin/affiliates/:id/reject` - Reject affiliate applications
   - `/api/admin/commissions/pending` - View pending commission payments
   - `/api/admin/commissions/:id/pay` - Mark commission as paid

### Admin Access Logging

All admin actions are logged with:
- User email
- Endpoint accessed
- HTTP method
- Timestamp

Check logs:
```bash
grep "\[ADMIN\]" logs/* | tail -20
```

---

## Security Checklist for Deployment

Before deploying to production:

- [ ] Strong SESSION_SECRET generated and set
- [ ] ADMIN_EMAILS configured with real admin emails
- [ ] Database password is strong and not default
- [ ] All API keys are production keys (not test/development)
- [ ] .env file is in .gitignore (not committed to repository)
- [ ] CORS whitelist includes only production domains
- [ ] Stripe is in production mode (EBAY_SANDBOX=false)
- [ ] Email sender domain is verified in Resend
- [ ] PostgreSQL session store is configured (not memory store)
- [ ] HTTPS is enforced (secure: true in session cookies)
- [ ] Rate limiting is enabled for all API endpoints
- [ ] CSRF protection is enabled for state-changing operations
- [ ] Sentry is configured for error tracking
- [ ] Regular backups are scheduled for database

---

## Contact

For security issues or questions:
- Email: security@isbnscout.com
- GitHub Issues: https://github.com/yourusername/isbn-scout/issues (for non-sensitive issues)
