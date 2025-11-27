# 🔒 Security Review Report - ISBN Scout

**Date:** 2025-11-27
**Reviewer:** Claude Code Security Review
**Scope:** Authentication, Authorization, API Security, Data Protection

---

## Executive Summary

**Overall Security Status:** ⚠️  **MEDIUM RISK**

The application has **good foundational security** (password hashing, SQL injection protection), but has **3 HIGH-SEVERITY issues** that should be fixed before production launch:

1. CORS allows all origins (major security risk)
2. Session cookies accessible to JavaScript (XSS vulnerability)
3. Missing authentication on critical book update endpoints

**Recommendation:** Fix the 3 high-severity issues before launch. Medium issues can be addressed post-launch.

---

## 🚨 HIGH SEVERITY - FIX BEFORE LAUNCH

### 1. CORS Configuration Allows All Origins
**Location:** `server/index.ts:16`
**Risk:** High - Allows any website to make authenticated requests to your API
**Current Code:**
```typescript
app.use(cors({
  origin: true, // ❌ Allows ALL origins
  credentials: true,
  ...
}));
```

**Impact:**
- Malicious websites can make API calls on behalf of logged-in users
- Session hijacking risk
- CSRF attacks possible

**Fix:**
```typescript
const allowedOrigins = [
  'http://localhost:5000', // Development
  'https://your-production-domain.com', // Production web
  'your-mobile-app-scheme://', // Mobile app
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  ...
}));
```

---

### 2. Session Cookie Accessible to JavaScript
**Location:** `server/index.ts:41`
**Risk:** High - XSS attacks can steal session cookies
**Current Code:**
```typescript
cookie: {
  secure: 'auto',
  httpOnly: false, // ❌ Allows JavaScript access
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'none',
}
```

**Impact:**
- If attacker injects JavaScript (XSS), they can steal session tokens
- Session hijacking becomes trivial
- User accounts can be compromised

**Fix:**
```typescript
cookie: {
  secure: process.env.NODE_ENV === 'production', // true in production
  httpOnly: true, // ✅ Prevent JavaScript access
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'strict', // or 'lax' for mobile app
}
```

**Note:** If mobile app needs cookie access, use token-based auth instead of cookies.

---

### 3. Missing Authentication on Critical Endpoints
**Location:** `server/routes.ts`
**Risk:** High - Unauthorized users can modify data

**Vulnerable Endpoints:**

#### 3a. Update Book (PATCH `/api/books/:isbn`)
**Line:** 1174
**Issue:** No `requireAuth` middleware - anyone can update any book
**Current Code:**
```typescript
app.patch("/api/books/:isbn", async (req, res) => { // ❌ No auth!
```

**Fix:**
```typescript
app.patch("/api/books/:isbn", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  // Verify book belongs to user before updating
```

#### 3b. Get Book Prices (GET `/api/books/:isbn/prices`)
**Line:** 1229
**Issue:** No authentication required
**Risk:** Medium - Public pricing data, but enables reconnaissance

**Fix:** Consider adding `requireAuth` or rate limiting

---

## ⚠️  MEDIUM SEVERITY - SHOULD FIX

### 4. API Credentials Stored Unencrypted
**Location:** `server/sqlite-storage.ts` - api_credentials table
**Risk:** Medium - Database breach exposes API keys
**Current:** Credentials stored as TEXT (JSON string)

**Recommendation:**
- Encrypt credentials at rest using AES-256
- Use environment variable as encryption key
- Decrypt only when needed for API calls

**Example libraries:**
- `crypto` (built-in Node.js)
- `node-crypto-gcm`

---

### 5. No Rate Limiting
**Risk:** Medium - Vulnerable to brute force attacks
**Affected:** All endpoints, especially:
- `/api/auth/login` - Password brute force
- `/api/books/lookup-pricing` - API quota exhaustion
- `/api/auth/signup` - Account spam

**Recommendation:**
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  ...
});
```

---

### 6. Default User with Hardcoded Password
**Location:** `server/sqlite-storage.ts:257`
**Risk:** Medium - If deployed with default user, it's compromised
**Current Code:**
```typescript
"default-user",
"default",
"default@isbnscout.com",
"default-password-change-in-production", // ❌ Hardcoded
```

**Recommendation:**
- Remove default user creation for production
- Or require password change on first login
- Or use environment variable for initial password

---

### 7. Session Secret Defaults
**Location:** `server/index.ts:32`
**Risk:** Medium - Weak session security if not changed
**Current Code:**
```typescript
secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
```

**Recommendation:**
- Require SESSION_SECRET in production (throw error if missing)
- Generate strong random secret (32+ characters)

**Fix:**
```typescript
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET must be set in production');
}

session({
  secret: sessionSecret || "dev-secret-only",
  ...
})
```

---

### 8. Stripe Webhook Handler Duplicate
**Location:** `server/routes.ts:270` and `server/routes.ts:1527`
**Risk:** Low - Code duplication, potential inconsistency
**Recommendation:** Remove one duplicate, keep only one handler

---

## ℹ️  LOW SEVERITY - MONITORING RECOMMENDED

### 9. Trial System Security
**Location:** `server/fingerprint.ts`, `server/trial-service.ts`
**Observation:** Uses fingerprinting for anonymous trial limits
**Risk:** Low - Users can bypass by changing fingerprint
**Mitigation:** Already in place - limits are soft, upgrades encouraged

---

### 10. Image Proxy Restrictions
**Location:** `server/routes.ts:1578-1611`
**Current:** Only allows Google Books images
**Status:** ✅ Good! Prevents proxy abuse
**Recommendation:** Consider adding more trusted sources if needed

---

## ✅ GOOD SECURITY PRACTICES FOUND

### Password Security ✅
**Location:** `server/auth-service.ts`
- Bcrypt with salt rounds = 10 (good)
- Passwords hashed before storage
- Passwords never returned in API responses
- Generic error messages ("Invalid credentials")

### SQL Injection Protection ✅
**Location:** `server/sqlite-storage.ts`
- All queries use prepared statements with parameter binding
- No string concatenation in SQL queries
- Example: `this.db.prepare("SELECT * FROM users WHERE id = ?").get(id)`

### Input Validation ✅
**Location:** `server/routes.ts`
- Zod schemas for complex inputs (listings, credentials)
- Type checking on critical fields
- Could use more validation on other endpoints

### Stripe Webhook Security ✅
**Location:** `server/routes.ts:270-286`
- Signature verification implemented
- Rejects requests without valid signature
- Uses Stripe's SDK for verification

### Database Security ✅
**Location:** `server/sqlite-storage.ts:26`
- Foreign key constraints enabled
- CASCADE deletes for data cleanup
- Proper indexing on sensitive fields

---

## 🎯 Priority Action Items

### Before Launch (CRITICAL):
1. **Fix CORS configuration** - Whitelist specific origins only
2. **Set httpOnly=true on session cookies** - Prevent XSS
3. **Add requireAuth to PATCH /api/books/:isbn** - Prevent unauthorized updates
4. **Add user ownership checks** - Ensure users can only modify their own data
5. **Set up proper SESSION_SECRET** - Generate strong production secret

### Post-Launch (Important):
6. Add rate limiting on auth endpoints
7. Encrypt API credentials at rest
8. Remove or secure default user
9. Add rate limiting on pricing APIs
10. Set up security monitoring/logging

### Nice to Have:
11. Implement Content Security Policy (CSP) headers
12. Add CSRF token protection
13. Set up security headers (Helmet.js)
14. Implement API request logging
15. Add IP-based blocking for repeated failures

---

## Security Testing Checklist

### Manual Tests to Run:
- [ ] Try to update another user's book (should fail)
- [ ] Try to access protected endpoints without login (should 401)
- [ ] Try SQL injection in all text inputs (should be safe)
- [ ] Test CORS from different origins (should be restricted)
- [ ] Attempt to brute force login (should be rate limited)
- [ ] Check if session cookies are httpOnly (should be true)

### Automated Tools:
- [ ] Run OWASP ZAP security scan
- [ ] Use npm audit to check dependencies
- [ ] Run Snyk or similar for vulnerability scanning
- [ ] Use ESLint security plugins

---

## Recommended Security Tools

1. **Helmet.js** - Security headers
   ```typescript
   import helmet from 'helmet';
   app.use(helmet());
   ```

2. **express-rate-limit** - Rate limiting
3. **express-validator** - Input validation
4. **csurf** - CSRF protection
5. **express-session** with secure store (Redis)

---

## Code Review Summary

### Files Reviewed:
1. `server/index.ts` - Server configuration
2. `server/routes.ts` - API endpoints (1995 lines)
3. `server/middleware/auth.ts` - Authentication middleware
4. `server/auth-service.ts` - Authentication service
5. `server/sqlite-storage.ts` - Database layer

### Security Score: 6.5/10

**Breakdown:**
- Password Security: 9/10 ✅
- SQL Injection Protection: 10/10 ✅
- Authentication/Authorization: 5/10 ⚠️ (missing on some endpoints)
- Session Security: 4/10 ⚠️ (httpOnly=false, CORS=all)
- Input Validation: 6/10 ⚠️ (some validation, could be better)
- API Security: 5/10 ⚠️ (no rate limiting)
- Data Protection: 6/10 ⚠️ (credentials unencrypted)

---

## Conclusion

The application has a **solid security foundation** but requires **3 critical fixes** before production launch:

1. Fix CORS configuration
2. Set httpOnly=true on cookies
3. Add authentication to vulnerable endpoints

The good news: **Most security basics are correct** (password hashing, SQL injection protection, Stripe security). The issues found are configuration-related and straightforward to fix.

**Estimated fix time:** 1-2 hours for critical issues.

---

## Next Steps

1. **Immediate:** Fix the 3 high-severity issues
2. **Before launch:** Address medium-severity items (rate limiting, secrets)
3. **Week 1:** Set up monitoring and logging
4. **Ongoing:** Regular security audits and dependency updates

**Would you like me to provide code fixes for the critical issues?**

---

**Report Generated:** 2025-11-27
**Review Tool:** Claude Code Security Analysis
**Next Review:** Recommended after any major changes
