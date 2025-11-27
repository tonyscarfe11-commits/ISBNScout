# 🚀 Production Deployment Checklist

**Purpose:** Ensure safe production deployment
**Use before:** Deploying to production/launching to users

---

## Pre-Deployment (CRITICAL)

### 1. Security Fixes
- [ ] Fix CORS configuration (whitelist specific origins)
- [ ] Set httpOnly=true on session cookies
- [ ] Add requireAuth to vulnerable endpoints
- [ ] Verify user authorization checks on all endpoints
- [ ] Review SECURITY_REVIEW.md and fix HIGH severity issues

### 2. Environment Variables
- [ ] Create `.env.production` file
- [ ] Set `NODE_ENV=production`
- [ ] Set strong `SESSION_SECRET` (32+ random characters)
- [ ] Set `EBAY_APP_ID` and `EBAY_CERT_ID`
- [ ] Set `STRIPE_SECRET_KEY` (if using Stripe)
- [ ] Set `STRIPE_WEBHOOK_SECRET`
- [ ] Set `DATABASE_URL` (if using PostgreSQL)
- [ ] Set `BASE_URL` to production domain
- [ ] Verify NO secrets are in code/git

### 3. Database
- [ ] Run database migrations
- [ ] Create backup of development database
- [ ] Test database connection in production
- [ ] Verify foreign key constraints enabled
- [ ] Check indexes are created
- [ ] Remove or secure default user account

### 4. Testing
- [ ] All automated tests passing (10/10)
- [ ] All Phase 2 manual tests passing
- [ ] Phase 3 mobile app testing complete
- [ ] Phase 4 integration tests passing (2/3 minimum)
- [ ] Security review complete

---

## Configuration

### 5. Server Configuration
- [ ] Port configured correctly (usually 5000 or 3000)
- [ ] SSL/HTTPS certificate installed
- [ ] Firewall rules configured
- [ ] Reverse proxy configured (if using)
- [ ] CORS origins whitelisted
- [ ] Trust proxy settings correct

### 6. Session Configuration
**File:** `server/index.ts`
- [ ] `secure: true` (HTTPS only)
- [ ] `httpOnly: true` (prevent XSS)
- [ ] `sameSite: 'strict'` or 'lax'
- [ ] Strong session secret
- [ ] Session store configured (Redis recommended over MemoryStore)

### 7. Logging Configuration
- [ ] Error logging enabled
- [ ] Access logging enabled
- [ ] Log sensitive data excluded (passwords, tokens)
- [ ] Log rotation configured
- [ ] Log storage configured

---

## API Services

### 8. eBay API
- [ ] Production API credentials configured
- [ ] Sandbox mode disabled (`EBAY_SANDBOX=false`)
- [ ] API limits understood (5000 requests/day)
- [ ] OAuth token caching working
- [ ] Test with real requests

### 9. Google Books API
- [ ] API key configured (if required)
- [ ] Rate limits understood
- [ ] Error handling tested
- [ ] Fallback behavior tested

### 10. Stripe (if using)
- [ ] Production API keys configured
- [ ] Webhook endpoint configured
- [ ] Webhook secret set
- [ ] Test mode disabled
- [ ] Subscription products created
- [ ] Pricing configured
- [ ] Test checkout flow

---

## Build & Deployment

### 11. Build Process
```bash
# Run these commands:
- [ ] npm run build
- [ ] Build completes without errors
- [ ] Build output in dist/ or build/
- [ ] Static assets copied correctly
```

### 12. Dependency Check
```bash
- [ ] npm audit (no critical vulnerabilities)
- [ ] npm audit fix (if safe fixes available)
- [ ] npm outdated (review major updates)
- [ ] package-lock.json committed
```

### 13. Code Quality
- [ ] ESLint passing (no errors)
- [ ] TypeScript compilation successful
- [ ] No console.logs in production code (or wrapped in if(dev))
- [ ] No commented-out code
- [ ] No TODO comments for critical features

---

## Deployment

### 14. Deploy to Staging (if available)
- [ ] Deploy to staging environment
- [ ] Smoke test all features
- [ ] Check logs for errors
- [ ] Monitor for 24 hours
- [ ] Fix any issues found

### 15. Production Deployment
- [ ] Create deployment plan/runbook
- [ ] Schedule maintenance window (if needed)
- [ ] Notify users of downtime (if any)
- [ ] Deploy code to production
- [ ] Run database migrations
- [ ] Restart server/services

### 16. Post-Deployment Verification
**Test immediately after deployment:**
- [ ] Health check endpoint responds (GET /api/health)
- [ ] Home page loads
- [ ] Can sign up new account
- [ ] Can log in
- [ ] Can scan a book
- [ ] Can view inventory
- [ ] Pricing data loads
- [ ] Session persists
- [ ] Mobile app connects successfully

---

## Monitoring & Maintenance

### 17. Monitoring Setup
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Performance monitoring (e.g., New Relic, DataDog)
- [ ] Database monitoring
- [ ] API usage monitoring
- [ ] Alerts configured for critical errors

### 18. Backup Strategy
- [ ] Database backups configured (daily minimum)
- [ ] Backup restoration tested
- [ ] Code repository backed up
- [ ] Environment variables documented securely

### 19. Rollback Plan
- [ ] Previous version tagged in git
- [ ] Rollback procedure documented
- [ ] Database rollback plan (if schema changed)
- [ ] Contact list for emergencies

---

## Documentation

### 20. User Documentation
- [ ] User guide/FAQ created
- [ ] Known limitations documented
- [ ] Support contact information
- [ ] Privacy policy posted
- [ ] Terms of service posted

### 21. Technical Documentation
- [ ] API documentation updated
- [ ] Architecture diagram updated
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created

---

## Legal & Compliance

### 22. Legal Requirements
- [ ] Privacy policy compliant (GDPR, CCPA if applicable)
- [ ] Cookie consent (if EU users)
- [ ] Terms of service finalized
- [ ] Data retention policy defined
- [ ] User data export capability (GDPR)
- [ ] User data deletion capability (GDPR)

### 23. App Store (if mobile app)
- [ ] App store listing created
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Privacy policy URL provided
- [ ] App reviewed and approved

---

## Performance

### 24. Performance Optimization
- [ ] Static assets minified
- [ ] Images optimized
- [ ] Gzip/Brotli compression enabled
- [ ] CDN configured (if applicable)
- [ ] Database queries optimized
- [ ] Caching configured where appropriate

### 25. Load Testing
- [ ] Test with expected peak traffic
- [ ] Database handles load
- [ ] API rate limits won't be hit
- [ ] Server resources adequate
- [ ] Auto-scaling configured (if cloud)

---

## Security (Final Check)

### 26. Security Hardening
- [ ] All HIGH severity issues from SECURITY_REVIEW.md fixed
- [ ] Security headers configured (Helmet.js)
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] SQL injection tested
- [ ] XSS tested
- [ ] CSRF protection enabled (if applicable)
- [ ] Secrets not in code or logs

### 27. Penetration Testing (Recommended)
- [ ] Run OWASP ZAP scan
- [ ] Review findings
- [ ] Fix critical/high issues
- [ ] Or hire security consultant

---

## Launch Day

### 28. Launch Preparation
- [ ] Announce launch time
- [ ] Support team ready
- [ ] Monitoring dashboard open
- [ ] Coffee/energy drinks ready ☕

### 29. During Launch
- [ ] Watch logs for errors
- [ ] Monitor server resources
- [ ] Check user sign-ups working
- [ ] Respond to user feedback quickly
- [ ] Fix critical bugs immediately

### 30. Post-Launch (First 24 Hours)
- [ ] Monitor error rates
- [ ] Check user retention (are they coming back?)
- [ ] Review user feedback
- [ ] Fix any critical bugs
- [ ] Celebrate! 🎉

---

## Weekly Maintenance

### Ongoing Tasks:
- [ ] Review error logs weekly
- [ ] Check API usage/limits
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Backup verification monthly
- [ ] Performance monitoring
- [ ] User feedback review

---

## Emergency Procedures

### If Critical Bug Found:
1. Assess severity (data loss? security breach?)
2. If severe: Roll back to previous version
3. If moderate: Hot-fix and deploy
4. Document incident
5. Post-mortem meeting
6. Update deployment checklist

### If Server Down:
1. Check server status
2. Check logs for errors
3. Restart services if needed
4. Restore from backup if data corruption
5. Communicate with users
6. Document incident

---

## Success Metrics

### Week 1:
- [ ] Uptime > 99%
- [ ] Error rate < 1%
- [ ] User sign-ups: X
- [ ] Active users: Y
- [ ] No critical bugs

### Month 1:
- [ ] User retention > X%
- [ ] Average scans per user: Y
- [ ] Subscription conversions: Z%
- [ ] User satisfaction: Survey results

---

## Checklist Sign-off

**Deployment Lead:** ___________________
**Date:** ___________________

**Pre-Deployment Complete:** ☐ Yes ☐ No

**Ready for Production:** ☐ Yes ☐ No

**Notes:**


---

**Remember:** It's better to delay launch and fix critical issues than to launch with security vulnerabilities or major bugs!

**Good luck with your launch! 🚀📚**
