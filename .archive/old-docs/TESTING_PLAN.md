# Testing Plan - Day 2

## What We Accomplished Today

### 🐛 Critical Bugs Fixed
1. **Shelf scanning missing images/prices**
   - Root cause: Books with AI-generated ISBNs weren't triggering Google Books search by title+author
   - Fix: `server/routes.ts:1077-1088` - Added detection and search logic

2. **eBay pricing completely broken**
   - Root cause: Was using original `isbn` parameter instead of `bookData.isbn` (which has real ISBN from Google Books)
   - Fix: `server/routes.ts:1128-1129` - Changed to use `bookData.isbn`

3. **eBay pricing missing for common books**
   - Root cause: Many eBay sellers don't include ISBNs in listings
   - Fix: `server/ebay-pricing-service.ts:128-153` - Added title search fallback

4. **AI assessing condition from spine photos**
   - Root cause: Impossible to assess full book condition from just the spine
   - Fix: `server/ai-service.ts:183-197` - Updated prompt to set condition to null for spine photos

### ✨ New Features Added
1. **Amazon Product Advertising API Integration**
   - `server/amazon-pricing-service.ts` - Complete implementation
   - `AMAZON_API_SETUP.md` - Technical setup guide
   - `AMAZON_SETUP_STEPS.md` - Step-by-step user guide
   - `.env.example` - Added required environment variables
   - **Status:** Code ready, needs API credentials before launch

2. **Automated Test Suite**
   - `test-suite.ts` - Comprehensive tests for all major features
   - Tests API integrations (Google Books, eBay, Amazon)
   - Tests database operations
   - Tests book creation flow
   - **To run:** `npx tsx test-suite.ts`

### 🔧 Debugging Tools Created
- `check-latest-scans.ts` - Quick check of recent scans in database
- `fix-latest-3-books.ts` - Retroactive fixer for books missing data
- `fix-new-books.ts` - Another retroactive fixer

## Known Issues

### 🚨 High Priority
1. **Server hot-reload not working reliably**
   - Changes to code don't take effect without manual restart
   - May need to kill processes with `kill -9` and restart
   - Need to investigate tsx/vite hot module replacement

2. **Pricing not fetching during live scans**
   - Works perfectly in retroactive fix scripts
   - Fails when scanning in real-time through app
   - Suggests server isn't loading updated code properly

### ⚠️ Medium Priority
1. **Reflective/metallic text on book spines**
   - OCR can't read silver, gold, or glossy text reliably
   - This is a fundamental limitation of computer vision
   - Solution: Add user guidance, suggest manual entry fallback

2. **PostgreSQL sync errors**
   - Test user doesn't exist in cloud database
   - Foreign key constraint violations during sync
   - Need to either create test user in cloud or disable sync for local testing

### 📝 Low Priority
1. **Many temporary test scripts**
   - Should clean up or organize into `/scripts` folder
   - Some may be useful for future debugging

## Tomorrow's Testing Plan

### Phase 1: Automated Testing (30 min)
Run the automated test suite and verify all tests pass:
```bash
npx tsx test-suite.ts
```

Expected outcome: All tests should pass. If any fail, fix before proceeding.

### Phase 2: Manual Server-Side Testing (1 hour)
Test each feature directly via API/scripts before touching the mobile app:

1. **Book Creation via ISBN**
   - Create script to add book with real ISBN
   - Verify: title, author, thumbnail, eBay price, Amazon price (if configured)

2. **Book Creation with AI-Generated ISBN**
   - Create script to simulate shelf scan result (AI-generated ISBN + title/author)
   - Verify: Google Books search triggers, real ISBN found, thumbnail fetched, pricing works

3. **Google Books Integration**
   - Test various title+author combinations
   - Test obscure books (expect failures)
   - Test common books (expect success)

4. **eBay Pricing**
   - Test with real ISBNs
   - Test with titles (fallback)
   - Test with obscure books (expect failures)

5. **User/Scan Limits**
   - Create test user
   - Verify scan limits work
   - Test paywall trigger at limit

### Phase 3: Mobile App Testing (2 hours)
Only AFTER Phase 2 passes completely:

1. **Single Book Scanning**
   - Scan book with clear ISBN
   - Verify immediate results (image + pricing)

2. **Shelf Scanning**
   - Scan shelf with 3-5 books
   - Verify all books detected
   - Verify images + pricing for each
   - Test with reflective text books (expect failures)

3. **Manual Entry**
   - Add book by ISBN
   - Add book by title/author
   - Verify data fetching works

4. **User Flow**
   - Register new account
   - Test scan limits (0/10 for trial)
   - Use up scans
   - Verify paywall appears
   - Test subscription flow (Stripe)

5. **Session Persistence**
   - Scan books
   - Close app
   - Reopen app
   - Verify books still there
   - Navigate between pages
   - Verify session maintained

6. **Mobile Responsiveness**
   - Test on different screen sizes
   - Test landscape/portrait
   - Test iOS vs Android (if applicable)

### Phase 4: Integration Testing (1 hour)
Test realistic user scenarios:

1. **New User Journey**
   - Sign up → Scan 5 books → View inventory → Edit book → Delete book

2. **Power User Journey**
   - Scan shelf (10+ books) → Export to CSV → Create eBay listing

3. **Error Scenarios**
   - Scan invalid ISBN
   - Scan with no internet
   - Scan obscure book not in any database

## Testing Checklist

Refer to `TEST_DAY_CHECKLIST.md` for the complete checklist. Track progress systematically.

## Pre-Launch Checklist

Before going live:
- [ ] All automated tests passing
- [ ] All manual tests passing
- [ ] Amazon PA-API credentials added
- [ ] Keepa API key added (optional)
- [ ] Stripe payment configured
- [ ] Database properly configured (PostgreSQL cloud)
- [ ] Environment variables set in production
- [ ] Error logging configured
- [ ] User documentation written
- [ ] Known limitations documented
- [ ] Support email/contact set up

## Commands Reference

### Run Tests
```bash
npx tsx test-suite.ts
```

### Check Recent Scans
```bash
npx tsx check-latest-scans.ts
```

### Fix Books Missing Data
```bash
npx tsx fix-latest-3-books.ts
```

### Restart Server
```bash
# Force kill
ps aux | grep "server/index.ts" | grep -v grep | awk '{print $2}' | xargs kill -9

# Restart
npm run dev
```

### Check Server Logs
```bash
tail -f /tmp/server.log
```

## Notes
- Server must be restarted after code changes (hot-reload not reliable)
- Test with REAL mobile app, not just browser DevTools
- Document any new bugs found
- Don't skip steps - systematic testing is critical
