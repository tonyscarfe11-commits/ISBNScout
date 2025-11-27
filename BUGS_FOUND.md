# Bugs Found - Testing Day 3

## Date: 2025-11-27

## Phase 1: Automated Testing Results

### Test Suite Summary
- **Total Tests:** 10
- **Passed:** 10
- **Failed:** 0
- **Pass Rate:** 100%
- **Duration:** 2041ms

### Tests Passed
1. ✅ Google Books - ISBN Lookup (273ms)
2. ✅ Google Books - Title/Author Search (254ms)
3. ✅ eBay Pricing - ISBN Search (648ms)
4. ✅ eBay Pricing - Title Fallback (773ms)
5. ✅ Amazon Pricing - Configuration Check (0ms)
6. ✅ Database Connection (0ms)
7. ✅ User Account Creation (0ms)
8. ✅ Books Table Structure (0ms)
9. ✅ Book Creation Flow (93ms)
10. ✅ Scan Limit Functionality (0ms)

### Bugs Fixed During Automated Testing

#### 1. Test Suite Schema Mismatch (FIXED)
- **Severity:** Low (test-only issue)
- **Issue:** Test suite was using `passwordHash` column name, but database uses `password`
- **Location:** `test-suite.ts:85`
- **Fix:** Updated INSERT statement to use correct column name `password` and added missing `updatedAt` field
- **Status:** ✅ FIXED

#### 2. Test Suite Scan Limit Check (FIXED)
- **Severity:** Low (test-only issue)
- **Issue:** Test was checking for non-existent `scansUsed` column in users table
- **Root Cause:** Scan limits are tracked in separate `trial_scans` table, not in users table
- **Location:** `test-suite.ts:113-117`
- **Fix:** Updated test to check for `trial_scans` table and its required columns instead
- **Status:** ✅ FIXED

### Known Issues (Not Blocking)

#### 3. PostgreSQL Sync Errors
- **Severity:** Medium (dev environment only)
- **Issue:** Foreign key constraint violations when syncing test data to cloud PostgreSQL
- **Root Cause:** Test users don't exist in cloud database
- **Impact:** Only affects local testing, doesn't impact production
- **Workaround:** Sync errors are logged but don't break functionality
- **Priority:** Medium - should be addressed before production launch
- **Recommendation:** Either disable cloud sync for test users or ensure test users exist in cloud DB

#### 4. Amazon PA-API Not Configured
- **Severity:** Medium
- **Issue:** Amazon pricing service initialized without credentials
- **Status:** Expected - requires manual API key setup before launch
- **Action Required:** Add Amazon PA-API credentials per `AMAZON_SETUP_STEPS.md`
- **Blocking Launch:** No (eBay pricing works as fallback)

### Previous Bugs (From Earlier Testing Days)

#### 5. Shelf Scanning Missing Images/Prices (FIXED)
- **Status:** ✅ FIXED in previous testing day
- **Fix:** `server/routes.ts:1077-1088`

#### 6. eBay Pricing Completely Broken (FIXED)
- **Status:** ✅ FIXED in previous testing day
- **Fix:** `server/routes.ts:1128-1129`

#### 7. eBay Pricing Missing for Common Books (FIXED)
- **Status:** ✅ FIXED in previous testing day
- **Fix:** `server/ebay-pricing-service.ts:128-153`

#### 8. AI Assessing Condition from Spine Photos (FIXED)
- **Status:** ✅ FIXED in previous testing day
- **Fix:** `server/ai-service.ts:183-197`

### Outstanding Known Issues (From TESTING_PLAN.md)

#### 9. Server Hot-Reload Not Working Reliably
- **Severity:** High (dev experience)
- **Issue:** Changes to code don't take effect without manual restart
- **Workaround:** Kill processes with `kill -9` and restart manually
- **Priority:** High - investigate tsx/vite hot module replacement

#### 10. Pricing Not Fetching During Live Scans
- **Severity:** Critical
- **Issue:** Pricing works in retroactive scripts but fails during real-time scanning
- **Likely Cause:** Server not loading updated code (related to issue #9)
- **Priority:** Critical - must fix before launch
- **Next Step:** Test during Phase 2 server-side manual tests

#### 11. Reflective/Metallic Text on Book Spines
- **Severity:** Low (fundamental limitation)
- **Issue:** OCR can't read silver, gold, or glossy text
- **Solution:** Add user guidance, suggest manual entry fallback
- **Priority:** Low - document limitation

## Next Steps

1. **Phase 2: Server-Side Manual Testing**
   - Test book creation via ISBN
   - Test book creation with AI-generated ISBN
   - Test Google Books integration
   - Test eBay pricing
   - Test scan limits

2. **Phase 3: Mobile App Testing**
   - Test single book scanning
   - Test shelf scanning
   - Test manual entry
   - Test user flow
   - Test session persistence

3. **Phase 4: Integration Testing**
   - Test realistic user scenarios
   - Test error scenarios

## Critical Blockers for Launch

- ❌ Issue #10: Pricing not fetching during live scans (must verify/fix)
- ⚠️ Issue #9: Server hot-reload issues (should fix)
- ⚠️ Issue #3: PostgreSQL sync errors (should address)
- ⚠️ Issue #4: Amazon PA-API setup (optional but recommended)

## Summary

Phase 1 automated testing completed successfully with 100% pass rate. Fixed 2 test suite issues. Identified 11 total issues, with 6 already fixed from previous testing days. Moving forward to Phase 2 server-side manual testing to verify critical issue #10.
