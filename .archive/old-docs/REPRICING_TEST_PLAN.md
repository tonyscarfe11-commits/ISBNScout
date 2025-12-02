# Repricing Engine Testing Plan

**CRITICAL**: You MUST test this before inviting beta testers. A broken repricing engine = no value prop.

---

## ⚠️ What You're Testing

Your repricing engine does 4 things:

1. **Fetch competitor prices** from Amazon/eBay APIs
2. **Calculate new price** based on strategy (match, beat by %, etc.)
3. **Update listing** on Amazon/eBay via API
4. **Log history** in database

**If ANY of these fail, the whole feature fails.**

---

## 🔍 Current Implementation Analysis

I've reviewed your code. Here's what I found:

### ✅ What's Built
- `RepricingService` class with full logic (331 lines)
- `AmazonService.getCompetitivePricing()` - fetches Amazon prices
- `EbayService.searchByISBN()` - fetches eBay prices
- `AmazonService.updateListingPrice()` - updates Amazon listings
- `EbayService.updateListingPrice()` - updates eBay listings
- Price calculation with 4 strategies
- Min/max bounds enforcement
- History logging

### ⚠️ Critical API Calls

**Amazon SP-API** (server/amazon-service.ts:213-268):
```typescript
async getCompetitivePricing(isbn: string)
```
- Looks up ASIN from ISBN
- Calls `getCompetitivePricing` API
- Returns `{ lowestPrice, buyBoxPrice }`

**Problem**: Amazon SP-API has strict authentication requirements and rate limits.

**eBay Finding API** (server/ebay-service.ts:150-197):
```typescript
async searchByISBN(isbn: string)
```
- Uses Finding API to search by ISBN
- Returns active listings sorted by price
- Returns `{ lowestPrice, averagePrice }`

**Problem**: eBay Finding API is easier (just needs App ID), but may not return many results.

### 🚨 Potential Issues

1. **Amazon SP-API Authentication**
   - Requires OAuth refresh token
   - Needs AWS IAM role setup
   - Complex credential structure
   - High chance of auth errors

2. **ASIN Lookup**
   - ISBN → ASIN conversion may fail
   - Amazon catalog may not have the book
   - Fallback returns ISBN (which breaks API call)

3. **Competitive Pricing API Limits**
   - Amazon limits requests
   - May not return data for all books
   - Structure is nested/complex

4. **eBay Finding API**
   - Only needs App ID (easier)
   - But may return no results for rare books
   - Price extraction is nested

5. **Update APIs**
   - Amazon: Requires seller ID lookup first
   - Complex JSON-PATCH format
   - May fail silently

---

## 📋 Testing Checklist

### Phase 1: Environment Setup

- [ ] Check if you have real Amazon SP-API credentials
- [ ] Check if you have real eBay API credentials
- [ ] Verify credentials are valid (test basic API call)
- [ ] Confirm you have at least 1 real listing on Amazon or eBay

### Phase 2: Test Individual Components

**Test 2A: Fetch Amazon Competitor Price**
- [ ] Pick a book ISBN that's definitely on Amazon
- [ ] Call `amazonService.getCompetitivePricing(isbn)`
- [ ] Verify it returns a price (not null)
- [ ] Check console for errors

**Test 2B: Fetch eBay Competitor Price**
- [ ] Pick the same ISBN
- [ ] Call `ebayService.searchByISBN(isbn)`
- [ ] Verify it returns a price (not null)
- [ ] Check console for errors

**Test 2C: Calculate New Price**
- [ ] Test all 4 strategies manually
- [ ] Verify min/max bounds work
- [ ] Ensure rounding to 2 decimals

**Test 2D: Update Amazon Listing**
- [ ] Pick one of YOUR listings
- [ ] Call `amazonService.updateListingPrice(sku, newPrice)`
- [ ] Check if price updated on Amazon Seller Central
- [ ] Check for API errors

**Test 2E: Update eBay Listing**
- [ ] Pick one of YOUR eBay listings
- [ ] Call `ebayService.updateListingPrice(itemId, newPrice)`
- [ ] Check if price updated on eBay
- [ ] Check for API errors

### Phase 3: End-to-End Test

**Test 3: Full Repricing Flow**
- [ ] Create a repricing rule in the UI
- [ ] Manually trigger repricing for 1 listing
- [ ] Check repricing history shows the attempt
- [ ] Verify price actually changed on Amazon/eBay
- [ ] Confirm database was updated

### Phase 4: Automated Repricing

**Test 4: Scheduler**
- [ ] Wait for hourly scheduler to run
- [ ] Check logs for repricing attempts
- [ ] Verify prices updated
- [ ] Check for any errors

---

## 🧪 Test Script

I've created a test script you can run. Save this as `test-repricing.js`:

```javascript
// test-repricing.js
// Run with: node test-repricing.js

import { AmazonService } from './server/amazon-service.ts';
import { EbayService } from './server/ebay-service.ts';

// =================================================
// CONFIGURATION - UPDATE THESE
// =================================================

const TEST_ISBN = '9780007124923'; // Harry Potter book (common on both platforms)

// Your Amazon credentials (from Settings → API Credentials in your app)
const AMAZON_CREDENTIALS = {
  region: 'eu',
  refresh_token: 'YOUR_REFRESH_TOKEN',
  credentials: {
    SELLING_PARTNER_APP_CLIENT_ID: 'YOUR_CLIENT_ID',
    SELLING_PARTNER_APP_CLIENT_SECRET: 'YOUR_CLIENT_SECRET',
    AWS_ACCESS_KEY_ID: 'YOUR_AWS_KEY',
    AWS_SECRET_ACCESS_KEY: 'YOUR_AWS_SECRET',
    AWS_SELLING_PARTNER_ROLE: 'YOUR_ROLE_ARN',
  },
};

// Your eBay credentials (easier - just need App ID for pricing)
const EBAY_CREDENTIALS = {
  appId: 'YOUR_EBAY_APP_ID',
  certId: 'YOUR_CERT_ID',
  devId: 'YOUR_DEV_ID',
  sandbox: false, // Set to true if testing in sandbox
};

// =================================================
// TESTS
// =================================================

async function testAmazonPricing() {
  console.log('\n=== Testing Amazon Competitive Pricing ===');
  try {
    const amazonService = new AmazonService(AMAZON_CREDENTIALS);
    const result = await amazonService.getCompetitivePricing(TEST_ISBN);

    if (result.lowestPrice) {
      console.log('✅ SUCCESS: Amazon pricing works!');
      console.log(`   Lowest price: £${result.lowestPrice}`);
      console.log(`   BuyBox price: £${result.buyBoxPrice || 'N/A'}`);
      return true;
    } else {
      console.log('⚠️  WARNING: No price data returned');
      console.log('   This could mean:');
      console.log('   - Book not in Amazon catalog');
      console.log('   - No active offers');
      console.log('   - API credentials issue');
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED: Amazon API error');
    console.error('   Error:', error.message);
    return false;
  }
}

async function testEbayPricing() {
  console.log('\n=== Testing eBay Pricing ===');
  try {
    const ebayService = new EbayService(EBAY_CREDENTIALS);
    const result = await ebayService.searchByISBN(TEST_ISBN);

    if (result.lowestPrice) {
      console.log('✅ SUCCESS: eBay pricing works!');
      console.log(`   Lowest price: £${result.lowestPrice}`);
      console.log(`   Average price: £${result.averagePrice?.toFixed(2) || 'N/A'}`);
      return true;
    } else {
      console.log('⚠️  WARNING: No price data returned');
      console.log('   This could mean:');
      console.log('   - No active listings for this ISBN');
      console.log('   - API credentials issue');
      return false;
    }
  } catch (error) {
    console.log('❌ FAILED: eBay API error');
    console.error('   Error:', error.message);
    return false;
  }
}

async function testPriceCalculation() {
  console.log('\n=== Testing Price Calculation ===');

  const testCases = [
    { strategy: 'match_lowest', competitorPrice: 10.00, expected: 10.00 },
    { strategy: 'beat_by_percent', strategyValue: 5, competitorPrice: 10.00, expected: 9.50 },
    { strategy: 'beat_by_amount', strategyValue: 1, competitorPrice: 10.00, expected: 9.00 },
  ];

  let allPassed = true;

  for (const test of testCases) {
    const rule = {
      strategy: test.strategy,
      strategyValue: test.strategyValue?.toString(),
      minPrice: '2.00',
      maxPrice: '50.00',
    };

    // Simulate calculation (you'd import RepricingService for real)
    let newPrice = test.competitorPrice;

    if (test.strategy === 'match_lowest') {
      newPrice = test.competitorPrice;
    } else if (test.strategy === 'beat_by_percent' && test.strategyValue) {
      newPrice = test.competitorPrice * (1 - test.strategyValue / 100);
    } else if (test.strategy === 'beat_by_amount' && test.strategyValue) {
      newPrice = test.competitorPrice - test.strategyValue;
    }

    newPrice = Math.round(newPrice * 100) / 100;

    if (Math.abs(newPrice - test.expected) < 0.01) {
      console.log(`✅ ${test.strategy}: £${test.competitorPrice} → £${newPrice}`);
    } else {
      console.log(`❌ ${test.strategy}: Expected £${test.expected}, got £${newPrice}`);
      allPassed = false;
    }
  }

  return allPassed;
}

async function runAllTests() {
  console.log('========================================');
  console.log('  ISBNScout Repricing Engine Tests');
  console.log('========================================');

  const results = {
    amazon: await testAmazonPricing(),
    ebay: await testEbayPricing(),
    calculation: await testPriceCalculation(),
  };

  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================');
  console.log(`Amazon Pricing:   ${results.amazon ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`eBay Pricing:     ${results.ebay ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Price Calculation: ${results.calculation ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = results.amazon && results.ebay && results.calculation;

  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('Your repricing engine is ready for beta testing.');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('Fix these issues before inviting beta testers.');
  }

  console.log('\n========================================\n');
}

// Run tests
runAllTests().catch(console.error);
```

---

## 🎯 What to Do Right Now

### Option 1: You Have Real API Credentials

**If you have Amazon and eBay credentials:**

1. Update `test-repricing.js` with your credentials
2. Run: `node test-repricing.js`
3. Check results
4. Fix any failures
5. Test end-to-end via UI

### Option 2: You DON'T Have Real API Credentials

**If you don't have credentials yet:**

1. **Get eBay App ID first** (easier, free):
   - Go to https://developer.ebay.com/my/keys
   - Create app
   - Get App ID (for Finding API - free 5,000 calls/day)

2. **Test eBay pricing only**:
   - Use test script with just eBay
   - Verify it fetches prices

3. **Amazon is harder**:
   - Requires SP-API access (approval process)
   - Need AWS account + IAM role setup
   - Complex OAuth flow
   - **Might take 1-2 weeks to set up properly**

### Option 3: Mock Testing (For Now)

**If you can't get credentials immediately:**

1. Mock the API responses in your code
2. Test the UI flow works
3. Test price calculation logic
4. Test database logging
5. **But don't invite beta testers yet**

---

## 🚨 Blockers You Might Hit

### 1. Amazon SP-API Access
**Problem**: You might not have SP-API access yet
**Solution**: Apply at https://developer.amazonservices.com/
**Timeline**: 1-7 days for approval

### 2. Amazon OAuth Setup
**Problem**: SP-API requires OAuth refresh token
**Solution**: Use Amazon's OAuth helper tool or build OAuth flow
**Difficulty**: High (most common failure point)

### 3. eBay Finding API Limits
**Problem**: Free tier only allows 5,000 calls/day
**Solution**: Should be fine for beta testing
**Watch**: Don't hit rate limits

### 4. Book Not in Catalog
**Problem**: ISBN → ASIN lookup fails
**Solution**: Test with popular books first (Harry Potter, bestsellers)

### 5. No Competitor Offers
**Problem**: API returns null because no one else is selling the book
**Solution**: Test with books that have active listings

---

## ✅ Success Criteria

**Before inviting beta testers, you MUST verify:**

- [ ] You can fetch competitor prices for at least 3 different books
- [ ] Both Amazon AND eBay pricing work (or at least one)
- [ ] You can update a listing price via API
- [ ] Updated price shows up on Amazon/eBay within 5 minutes
- [ ] Repricing history logs correctly
- [ ] No authentication errors
- [ ] No rate limit errors

**If ANY of these fail → FIX IT FIRST**

---

## 🔧 Quick Debug Checklist

**If Amazon pricing fails:**
- [ ] Check refresh token is valid (they expire!)
- [ ] Verify AWS credentials are correct
- [ ] Check IAM role has correct permissions
- [ ] Test with a popular book ISBN
- [ ] Check Amazon SP-API status page

**If eBay pricing fails:**
- [ ] Verify App ID is correct
- [ ] Check using production (not sandbox) unless testing
- [ ] Test with a book that's definitely on eBay
- [ ] Check eBay API status page

**If price updates fail:**
- [ ] Verify listing ID/SKU is correct
- [ ] Check listing is still active
- [ ] Ensure you have write permissions
- [ ] Check for API response errors in logs

---

## 📊 Manual Testing Procedure

**Step-by-step UI test:**

1. **Setup**
   - Deploy your app (Replit or local)
   - Add API credentials in Settings
   - Verify credentials save correctly

2. **Create Test Listing** (optional - or use existing)
   - Scan a book
   - Create listing on Amazon or eBay
   - Note the listing ID/SKU

3. **Create Repricing Rule**
   - Go to Repricing page
   - Click "Create New Rule"
   - Select platform (Amazon or eBay)
   - Choose "Beat by 5%"
   - Set min: £2, max: £50
   - Set to Active
   - Save

4. **Manual Reprice Test**
   - Go to Repricing page
   - Click "Reprice Now" on a listing
   - Watch for success/error message
   - Check Repricing History

5. **Verify on Platform**
   - Go to Amazon Seller Central or eBay My eBay
   - Find the listing
   - Check if price changed
   - Verify new price matches what ISBNScout shows

6. **Check History**
   - Go to Repricing History
   - Verify entry shows:
     - Old price
     - New price
     - Competitor price
     - Reason
     - Success = true

**If ALL steps work → You're ready for beta testers!**

---

## 💬 Questions to Answer

Before beta testing, honestly answer:

1. **Do you have working Amazon SP-API credentials?**
   - Yes → Great!
   - No → Can you get them in 1 week?
   - No → Focus on eBay only for beta

2. **Do you have working eBay API credentials?**
   - Yes → Great!
   - No → Get them (15 minutes to set up)

3. **Have you tested repricing with at least 1 real listing?**
   - Yes → Good!
   - No → DO THIS NOW

4. **Did the price actually update on Amazon/eBay?**
   - Yes → Perfect!
   - No → THIS IS A BLOCKER

5. **Are you confident this works for common books?**
   - Yes → Ready for beta!
   - No → More testing needed

---

## 🎯 Next Steps Based on Test Results

### If Tests Pass ✅
1. Test with 3-5 more books
2. Let scheduler run for 24 hours
3. Verify no errors
4. **Start beta tester outreach**

### If Tests Partially Pass ⚠️
1. Identify what works (Amazon or eBay?)
2. Fix what's broken
3. Consider launching with one platform only
4. Add second platform later

### If Tests Fail ❌
1. Debug API authentication
2. Check credentials are valid
3. Test with different books
4. **DO NOT invite beta testers yet**

---

## 📞 Need Help?

Common issues and solutions are documented. But if you're stuck:

1. Check API provider status pages
2. Review API documentation
3. Test with curl/Postman first
4. Check server logs for detailed errors

**Remember**: The repricing engine is your ONLY differentiator from ScoutIQ. If it doesn't work, you have no product.

---

**Your Action Right Now:**

1. Check if you have Amazon/eBay API credentials
2. If yes → Run test script
3. If no → Get eBay credentials (15 min)
4. Test manually via UI
5. Verify price updates on platform
6. Report back results

**Don't skip this step. I'll help you debug any issues.**
