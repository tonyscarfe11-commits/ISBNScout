# Test Your Repricing Engine RIGHT NOW

**Time needed**: 15-30 minutes
**Critical**: DO THIS BEFORE beta testing

---

## ⚡ Quick Start (Do This First)

### Step 1: Get eBay API Credentials (15 minutes)

eBay is MUCH easier than Amazon. Start here.

1. Go to https://developer.ebay.com/
2. Sign in (use your eBay seller account)
3. Click "Get API Keys" or "My Keys"
4. Create new application:
   - Name: "ISBNScout"
   - Purpose: "Book repricing tool"
5. Copy your **App ID** (also called "Client ID")
6. You also need **Cert ID** and **Dev ID** for full functionality

### Step 2: Add to Environment

Add to your `.env` file:

```bash
# eBay API (for pricing - FREE 5,000 calls/day)
EBAY_APP_ID=YourAppID-Here-xxxxx
EBAY_CERT_ID=YourCertID-xxxxx  # Optional for just pricing
EBAY_DEV_ID=YourDevID-xxxxx    # Optional for just pricing
```

### Step 3: Run the Test Script

```bash
# 1. Update the credentials in test-repricing-manual.ts
# Set testEbay = true
# Add your EBAY_APP_ID

# 2. Run the test
npx tsx test-repricing-manual.ts
```

### Step 4: Check Results

**If you see ✅ SUCCESS**:
- Great! eBay pricing works
- Move to Step 5

**If you see ❌ FAILED**:
- Check your App ID is correct
- Make sure you're using production (not sandbox)
- Try a different ISBN (popular book)
- Check error message for clues

### Step 5: Test in the UI

1. Run your app: `npm run dev`
2. Go to Repricing page
3. Create a repricing rule (even without real listings)
4. Check the logs for errors

---

## 🎯 Do You Have Amazon API Credentials?

### Option A: Yes, I have Amazon SP-API credentials

**Then test Amazon too:**

1. Update `test-repricing-manual.ts` with your credentials
2. Set `testAmazon = true`
3. Run the test again
4. Verify both platforms work

### Option B: No, I don't have Amazon credentials

**That's okay! Here are your options:**

**Option 1: Get Amazon SP-API Access (1-2 weeks)**
- Apply at https://developer.amazonservices.com/
- Wait for approval (1-7 days typically)
- Set up OAuth flow (complex)
- Set up AWS IAM role (annoying)
- **Time investment**: High
- **Difficulty**: 8/10

**Option 2: Launch with eBay only**
- Test eBay thoroughly
- Start beta with "eBay repricing only"
- Add Amazon later
- **Time investment**: Low
- **Difficulty**: 2/10

**Option 3: Use a third-party service**
- Use Keepa API for Amazon pricing (£16/month)
- Add `KEEPA_API_KEY` to your .env
- Easier than SP-API, but costs money
- **Time investment**: Low
- **Difficulty**: 3/10

**My recommendation**: Option 2 (eBay only for beta)

---

## 📊 What Are You Actually Testing?

Your repricing engine does 4 things:

### 1. Fetch Competitor Prices
**Amazon**: Uses SP-API `getCompetitivePricing`
- Looks up ASIN from ISBN
- Returns lowest price + BuyBox price
- **Complexity**: High (auth is hard)

**eBay**: Uses Finding API `findItemsByProduct`
- Searches active listings by ISBN
- Returns lowest price + average
- **Complexity**: Low (just need App ID)

### 2. Calculate New Price
- Match lowest
- Beat by X%
- Beat by £X
- Enforce min/max bounds
- **Complexity**: Low (pure logic)

### 3. Update Listing
**Amazon**: Uses SP-API `patchListingsItem`
- JSON-PATCH format
- Needs seller ID
- **Complexity**: High

**eBay**: Uses Trading API `ReviseFixedPriceItem`
- Simple item ID + new price
- **Complexity**: Medium

### 4. Log History
- Save to database
- Track old/new prices
- Record success/failure
- **Complexity**: Low

---

## ✅ What "Success" Looks Like

### Minimum Viable Test (eBay only):

- [x] eBay Finding API returns prices for popular book
- [x] Price calculation logic works
- [x] Can create repricing rule in UI
- [x] Manual "Reprice Now" triggers correctly
- [x] History logs the attempt

**This is enough to start beta testing with "eBay only" positioning.**

### Full Success (Both platforms):

- [x] Amazon SP-API returns competitive pricing
- [x] eBay Finding API returns prices
- [x] Price calculation works for all strategies
- [x] Can update prices on both platforms
- [x] Automated scheduler runs hourly
- [x] History logs all attempts

**This is ideal - you can market as "multi-platform repricing."**

---

## 🚨 Common Errors & Fixes

### "Error: Invalid eBay credentials"
**Fix**: Check your App ID is correct, no extra spaces

### "Error: Request failed with status code 401" (Amazon)
**Fix**: Your refresh_token expired. Generate a new one.

### "Error: ASIN not found for ISBN" (Amazon)
**Fix**: Try a different book. Use a bestseller (Harry Potter, etc.)

### "Warning: No listings found" (eBay)
**Fix**: Book might not be on eBay. Try a popular title.

### "Error: Failed to update listing on platform"
**Fix**:
- Verify listing ID/SKU is correct
- Check listing is still active
- Ensure API permissions include "write"

---

## 🎯 Your Decision Tree

```
Do you have eBay App ID?
├─ NO  → Get it now (15 min) → Test eBay
└─ YES → Test eBay now
          ├─ Works? ✅
          │   ├─ Have Amazon credentials?
          │   │   ├─ YES → Test Amazon
          │   │   │   ├─ Works? ✅ → READY FOR BETA!
          │   │   │   └─ Fails? ❌ → Launch with eBay only
          │   │   └─ NO → Launch with eBay only for now
          │   └─ Add Amazon later
          └─ Fails? ❌
              └─ Debug (check credentials, try different ISBN)
```

---

## 📝 Test Results Template

Copy this and fill it out:

```
=== ISBNScout Repricing Test Results ===

Date: [DATE]
Tester: [YOUR NAME]

eBay Pricing Test:
- App ID configured: [ ] Yes [ ] No
- Test ISBN: _______________
- Result: [ ] ✅ Pass [ ] ❌ Fail
- Lowest price returned: £______
- Notes: ____________________

Amazon Pricing Test:
- SP-API configured: [ ] Yes [ ] No
- Test ISBN: _______________
- Result: [ ] ✅ Pass [ ] ❌ Fail [ ] Skipped
- Lowest price returned: £______
- Notes: ____________________

Price Calculation Test:
- Result: [ ] ✅ Pass [ ] ❌ Fail
- Notes: ____________________

Manual Reprice Test (UI):
- Created rule: [ ] Yes [ ] No
- Triggered reprice: [ ] Yes [ ] No
- History logged: [ ] Yes [ ] No
- Price updated on platform: [ ] Yes [ ] No [ ] Didn't test
- Notes: ____________________

Overall Status:
[ ] ✅ Ready for beta testing
[ ] ⚠️  Partially ready (specify what works)
[ ] ❌ Not ready (specify what's broken)

Next steps:
1. ____________________
2. ____________________
3. ____________________
```

---

## 🚀 What to Do After Tests Pass

### If eBay works (Amazon doesn't):

1. Position as "eBay Book Repricing Tool"
2. Target eBay sellers specifically
3. Mention "Amazon coming soon"
4. Start beta testing
5. Add Amazon later

**This is totally fine!** eBay is underserved.

### If both work:

1. Position as "Multi-Platform Repricing"
2. Target sellers on both platforms
3. This is your differentiator
4. Start beta testing immediately

### If neither work:

1. **Don't invite beta testers**
2. Debug API issues first
3. Check API status pages
4. Review credentials
5. Test with curl/Postman
6. Seek help if stuck

---

## ⏱️ Time Budget

**If you have eBay credentials:**
- Testing: 15 minutes
- Ready to beta test: Today

**If you need to get eBay credentials:**
- Get credentials: 15 minutes
- Testing: 15 minutes
- Ready to beta test: Today

**If you want Amazon too:**
- Get SP-API access: 1-7 days (waiting for approval)
- Set up OAuth: 2-4 hours (if new to it)
- Testing: 30 minutes
- Ready to beta test: 1-2 weeks

**Recommendation**: Test eBay today, start beta testing tomorrow.

---

## 📞 I'm Stuck - Help!

**Common scenarios:**

### "I don't have any API credentials yet"
→ Get eBay App ID (15 min)
→ Skip Amazon for now
→ Test with eBay only

### "eBay test passes but I want Amazon too"
→ Apply for Amazon SP-API access
→ Start beta testing with eBay
→ Add Amazon when approved

### "Both tests fail"
→ Share error messages
→ Check REPRICING_TEST_PLAN.md debug section
→ Verify credentials are correct

### "I have credentials but don't know how to use them"
→ Run test-repricing-manual.ts
→ Follow error messages
→ Check credentials format

---

## ✅ Your Action Plan (Next 30 Minutes)

**Right now:**

1. [ ] Get eBay App ID (or use existing)
2. [ ] Add to .env file
3. [ ] Update test-repricing-manual.ts with your App ID
4. [ ] Run: `npx tsx test-repricing-manual.ts`
5. [ ] Check if eBay test passes

**If passes:**

6. [ ] Test via UI (create rule, try manual reprice)
7. [ ] Fill out test results template
8. [ ] Decision: eBay only or wait for Amazon?
9. [ ] If eBay only → Start beta outreach tomorrow

**If fails:**

6. [ ] Check error message
7. [ ] Verify credentials are correct
8. [ ] Try different ISBN
9. [ ] Check REPRICING_TEST_PLAN.md for debugging

---

## 🎯 The Bottom Line

**You need AT LEAST ONE platform working before beta testing.**

- eBay only? **Good enough!**
- Amazon only? **Good enough!**
- Both? **Perfect!**
- Neither? **Not ready yet.**

**Time to test: 15-30 minutes**

**Your turn. Run that test script now.** 🚀
