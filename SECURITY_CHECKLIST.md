# 🔒 Security Checklist for Another Developer

**Purpose:** Quick security audit checklist
**Use:** Give this to another developer to review your code
**Time:** 30-60 minutes

---

## Critical Security Issues (MUST FIX)

### 1. CORS Configuration
**File:** `server/index.ts:16`
**Check:**
- [ ] CORS is NOT set to `origin: true` (allows all origins)
- [ ] Specific origins are whitelisted
- [ ] Mobile app origin is included if needed
- [ ] Credentials are properly configured

**Current Status:** ❌ Allows all origins
**Fix Required:** Whitelist specific domains

---

### 2. Session Cookie Security
**File:** `server/index.ts:39-46`
**Check:**
- [ ] `httpOnly` is set to `true` (prevents JavaScript access)
- [ ] `secure` is `true` in production (HTTPS only)
- [ ] `sameSite` is 'strict' or 'lax' (not 'none' unless necessary)
- [ ] `SESSION_SECRET` is strong and not default

**Current Status:** ❌ httpOnly=false (XSS vulnerability)
**Fix Required:** Set httpOnly=true

---

### 3. Authentication on Endpoints
**File:** `server/routes.ts`
**Check these endpoints have `requireAuth` middleware:**
- [ ] Line 1174: PATCH `/api/books/:isbn` - **MISSING AUTH**
- [ ] Line 1229: GET `/api/books/:isbn/prices` - No auth (consider adding)
- [ ] Line 828: POST `/api/books/lookup-pricing` - Has trial limits, OK
- [ ] All other `/api/*` endpoints that modify data have auth

**Current Status:** ❌ Critical endpoints missing auth
**Fix Required:** Add `requireAuth` middleware

---

### 4. User Authorization Checks
**File:** `server/routes.ts`
**For endpoints that modify user data, check:**
- [ ] User can only access/modify their own data
- [ ] User ID is verified from session, not request body
- [ ] Books: Check `book.userId === session.userId`
- [ ] Listings: Check `listing.userId === session.userId`
- [ ] Inventory: Check `item.userId === session.userId`

**Example to check:**
```typescript
// BAD - trusts userId from request
const userId = req.body.userId;

// GOOD - gets userId from verified session
const userId = getUserId(req); // from middleware
```

---

## High Priority Security

### 5. Password Security
**File:** `server/auth-service.ts`
**Check:**
- [ ] Passwords are hashed with bcrypt (SALT_ROUNDS >= 10)
- [ ] Passwords are NEVER returned in API responses
- [ ] Password reset uses secure tokens (if implemented)
- [ ] Login errors don't reveal if email exists

**Current Status:** ✅ Good!

---

### 6. SQL Injection Prevention
**File:** `server/sqlite-storage.ts`
**Check:**
- [ ] ALL queries use prepared statements with `?` placeholders
- [ ] NO string concatenation in SQL queries
- [ ] NO `db.exec()` with user input

**Example:**
```typescript
// GOOD
this.db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

// BAD
this.db.exec(`SELECT * FROM users WHERE id = '${userId}'`);
```

**Current Status:** ✅ All queries use prepared statements

---

### 7. API Credentials Storage
**File:** `server/sqlite-storage.ts` - api_credentials table
**Check:**
- [ ] Are credentials encrypted at rest?
- [ ] Encryption key stored securely (environment variable)?
- [ ] Credentials only decrypted when needed?

**Current Status:** ⚠️  Stored as plaintext JSON
**Recommendation:** Encrypt sensitive API keys

---

### 8. Rate Limiting
**File:** `server/routes.ts`
**Check these endpoints have rate limiting:**
- [ ] `/api/auth/login` - Prevent brute force
- [ ] `/api/auth/signup` - Prevent spam
- [ ] `/api/books/lookup-pricing` - Prevent quota exhaustion

**Current Status:** ❌ No rate limiting
**Recommendation:** Add express-rate-limit

---

## Medium Priority

### 9. Environment Variables
**Check:**
- [ ] `.env` file exists with all required variables
- [ ] `.env` is in `.gitignore` (not committed)
- [ ] `SESSION_SECRET` is strong (32+ random characters)
- [ ] Production secrets are different from dev
- [ ] All API keys are present (eBay, Stripe, etc.)

---

### 10. Stripe Integration
**File:** `server/routes.ts:270-363`
**Check:**
- [ ] Webhook signature verification is enabled
- [ ] Webhook secret is configured
- [ ] Payment amounts are validated server-side
- [ ] Subscription status is verified before access

**Current Status:** ✅ Signature verification present

---

### 11. Input Validation
**File:** `server/routes.ts`
**Check:**
- [ ] Zod schemas used for complex inputs
- [ ] Email format validated
- [ ] ISBN format validated
- [ ] Price fields validated (positive numbers)
- [ ] String lengths limited (prevent DoS)

**Current Status:** ⚠️  Some validation, could be better

---

### 12. Error Handling
**Check:**
- [ ] Errors don't expose sensitive data
- [ ] Stack traces not sent to client in production
- [ ] Generic error messages for auth failures
- [ ] Errors are logged server-side

---

## Low Priority

### 13. Security Headers
**File:** `server/index.ts`
**Check:**
- [ ] Helmet.js or similar security headers middleware
- [ ] Content-Security-Policy header
- [ ] X-Frame-Options header
- [ ] X-Content-Type-Options header

**Recommendation:** Add helmet.js

---

### 14. HTTPS Configuration
**Check:**
- [ ] HTTPS enforced in production
- [ ] HTTP redirects to HTTPS
- [ ] SSL/TLS certificate valid

---

### 15. Logging & Monitoring
**Check:**
- [ ] Sensitive data not logged (passwords, tokens)
- [ ] Failed auth attempts logged
- [ ] Security events monitored
- [ ] Log retention policy defined

---

## Automated Security Checks

### Run these commands:

```bash
# Check for known vulnerabilities
npm audit

# Fix auto-fixable issues
npm audit fix

# Check for outdated packages
npm outdated

# Security linting
npx eslint . --ext .ts,.tsx --config .eslintrc.security.json
```

---

## Manual Security Tests

### 1. Authentication Bypass
- [ ] Try accessing `/api/books` without login (should 401)
- [ ] Try accessing another user's data (should 403 or 404)
- [ ] Try modifying session cookie (should invalidate)

### 2. SQL Injection
- [ ] Try `' OR '1'='1` in email/username fields
- [ ] Try `; DROP TABLE users;` in text inputs
- [ ] All should be safely escaped

### 3. XSS (Cross-Site Scripting)
- [ ] Try `<script>alert('XSS')</script>` in text fields
- [ ] Check if it executes (it shouldn't)
- [ ] Check if it's escaped in HTML

### 4. CSRF (Cross-Site Request Forgery)
- [ ] Can you make requests from another domain?
- [ ] Are state-changing requests protected?

### 5. Session Security
- [ ] Log out - can you still access protected endpoints?
- [ ] Multiple devices - can both be logged in?
- [ ] Session expires after X time?

---

## Quick Security Scan

Use OWASP ZAP or similar:

```bash
# Install OWASP ZAP
# Point it at http://localhost:5000
# Run automated scan
# Review findings
```

---

## Security Review Sign-off

**Reviewer Name:** ___________________
**Date:** ___________________

### Critical Issues Found:
- [ ] None
- [ ] Found and documented below

### Recommendation:
- [ ] Safe to deploy with fixes
- [ ] Safe to deploy as-is (low risk)
- [ ] NOT safe to deploy (critical issues)

### Notes:


---

**Give this checklist to a developer friend or hire a security consultant to review your code before launch!**
