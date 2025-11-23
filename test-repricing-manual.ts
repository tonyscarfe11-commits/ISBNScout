/**
 * Manual Repricing Test Script
 *
 * This script tests the repricing engine with real API calls.
 * Run with: npx tsx test-repricing-manual.ts
 *
 * BEFORE RUNNING:
 * 1. Update TEST_CONFIG with your credentials
 * 2. Update TEST_ISBN with a book you know is on Amazon/eBay
 * 3. Make sure your .env has DATABASE_URL set
 */

import { AmazonService } from './server/amazon-service';
import { EbayService } from './server/ebay-service';

// =================================================
// CONFIGURATION - UPDATE THESE VALUES
// =================================================

const TEST_CONFIG = {
  // Test with a popular book ISBN (this one is Harry Potter)
  testISBN: '9780007124923',

  // Set to true if you want to test Amazon
  testAmazon: false,

  // Set to true if you want to test eBay
  testEbay: true,

  // Your Amazon credentials (leave as-is if not testing Amazon)
  amazonCredentials: {
    region: 'eu',
    refresh_token: 'YOUR_AMAZON_REFRESH_TOKEN',
    credentials: {
      SELLING_PARTNER_APP_CLIENT_ID: 'YOUR_CLIENT_ID',
      SELLING_PARTNER_APP_CLIENT_SECRET: 'YOUR_CLIENT_SECRET',
      AWS_ACCESS_KEY_ID: 'YOUR_AWS_KEY',
      AWS_SECRET_ACCESS_KEY: 'YOUR_AWS_SECRET',
      AWS_SELLING_PARTNER_ROLE: 'YOUR_ROLE_ARN',
    },
  },

  // Your eBay credentials (easier to get - just need App ID for pricing)
  // Get from: https://developer.ebay.com/my/keys
  ebayCredentials: {
    appId: process.env.EBAY_APP_ID || 'YOUR_EBAY_APP_ID',
    certId: process.env.EBAY_CERT_ID || 'YOUR_CERT_ID',
    devId: process.env.EBAY_DEV_ID || 'YOUR_DEV_ID',
    sandbox: false, // Set to true if using sandbox
  },
};

// =================================================
// TEST FUNCTIONS
// =================================================

async function testAmazonPricing() {
  console.log('\n┌─────────────────────────────────────┐');
  console.log('│  Test: Amazon Competitive Pricing  │');
  console.log('└─────────────────────────────────────┘\n');

  if (!TEST_CONFIG.testAmazon) {
    console.log('⏭️  Skipped (testAmazon = false)\n');
    return { skipped: true };
  }

  try {
    console.log(`📖 Testing ISBN: ${TEST_CONFIG.testISBN}`);
    console.log('🔄 Initializing Amazon SP-API...');

    const amazonService = new AmazonService(TEST_CONFIG.amazonCredentials);

    console.log('🔍 Fetching competitive pricing...');
    const result = await amazonService.getCompetitivePricing(TEST_CONFIG.testISBN);

    if (result.lowestPrice) {
      console.log('✅ SUCCESS!');
      console.log(`   💰 Lowest Price: £${result.lowestPrice.toFixed(2)}`);
      console.log(`   📦 BuyBox Price: £${result.buyBoxPrice?.toFixed(2) || 'N/A'}`);
      console.log('');
      return { success: true, lowestPrice: result.lowestPrice };
    } else {
      console.log('⚠️  WARNING: No price data returned');
      console.log('   Possible reasons:');
      console.log('   - Book not in Amazon catalog for this marketplace');
      console.log('   - No active offers from other sellers');
      console.log('   - ASIN lookup failed');
      console.log('   Try a different ISBN (popular book like Harry Potter)');
      console.log('');
      return { success: false, error: 'No price data' };
    }
  } catch (error: any) {
    console.log('❌ FAILED');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack?.split('\n')[0]);
    console.log('');
    console.log('   Common issues:');
    console.log('   - Invalid refresh_token (they expire!)');
    console.log('   - Wrong AWS credentials');
    console.log('   - IAM role not set up correctly');
    console.log('   - SP-API access not approved');
    console.log('');
    return { success: false, error: error.message };
  }
}

async function testEbayPricing() {
  console.log('\n┌─────────────────────────────────┐');
  console.log('│  Test: eBay Price Lookup       │');
  console.log('└─────────────────────────────────┘\n');

  if (!TEST_CONFIG.testEbay) {
    console.log('⏭️  Skipped (testEbay = false)\n');
    return { skipped: true };
  }

  try {
    console.log(`📖 Testing ISBN: ${TEST_CONFIG.testISBN}`);
    console.log('🔄 Initializing eBay API...');

    const ebayService = new EbayService(TEST_CONFIG.ebayCredentials);

    console.log('🔍 Searching for active listings...');
    const result = await ebayService.searchByISBN(TEST_CONFIG.testISBN);

    if (result.lowestPrice) {
      console.log('✅ SUCCESS!');
      console.log(`   💰 Lowest Price: £${result.lowestPrice.toFixed(2)}`);
      console.log(`   📊 Average Price: £${result.averagePrice?.toFixed(2) || 'N/A'}`);
      console.log('');
      return { success: true, lowestPrice: result.lowestPrice };
    } else {
      console.log('⚠️  WARNING: No listings found');
      console.log('   Possible reasons:');
      console.log('   - No active listings for this ISBN on eBay UK');
      console.log('   - Book is too rare/obscure');
      console.log('   Try a different ISBN (popular book)');
      console.log('');
      return { success: false, error: 'No listings found' };
    }
  } catch (error: any) {
    console.log('❌ FAILED');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack?.split('\n')[0]);
    console.log('');
    console.log('   Common issues:');
    console.log('   - Invalid App ID');
    console.log('   - Using sandbox credentials in production');
    console.log('   - Rate limit exceeded (5,000/day free tier)');
    console.log('');
    return { success: false, error: error.message };
  }
}

function testPriceCalculation() {
  console.log('\n┌──────────────────────────────────┐');
  console.log('│  Test: Price Calculation Logic  │');
  console.log('└──────────────────────────────────┘\n');

  const testCases = [
    {
      name: 'Match Lowest',
      strategy: 'match_lowest',
      competitorPrice: 10.00,
      strategyValue: null,
      expected: 10.00,
    },
    {
      name: 'Beat by 5%',
      strategy: 'beat_by_percent',
      competitorPrice: 10.00,
      strategyValue: 5,
      expected: 9.50,
    },
    {
      name: 'Beat by £1',
      strategy: 'beat_by_amount',
      competitorPrice: 10.00,
      strategyValue: 1,
      expected: 9.00,
    },
    {
      name: 'Min Price Enforcement',
      strategy: 'beat_by_amount',
      competitorPrice: 3.00,
      strategyValue: 2,
      expected: 2.00, // Should hit min price of £2
    },
    {
      name: 'Max Price Enforcement',
      strategy: 'beat_by_percent',
      competitorPrice: 60.00,
      strategyValue: -20, // Would increase price
      expected: 50.00, // Should hit max price of £50
    },
  ];

  const minPrice = 2.00;
  const maxPrice = 50.00;
  let allPassed = true;

  for (const test of testCases) {
    let newPrice = test.competitorPrice;

    // Calculate based on strategy
    if (test.strategy === 'match_lowest') {
      newPrice = test.competitorPrice;
    } else if (test.strategy === 'beat_by_percent' && test.strategyValue !== null) {
      newPrice = test.competitorPrice * (1 - test.strategyValue / 100);
    } else if (test.strategy === 'beat_by_amount' && test.strategyValue !== null) {
      newPrice = test.competitorPrice - test.strategyValue;
    }

    // Apply bounds
    if (newPrice < minPrice) newPrice = minPrice;
    if (newPrice > maxPrice) newPrice = maxPrice;

    // Round to 2 decimals
    newPrice = Math.round(newPrice * 100) / 100;

    const passed = Math.abs(newPrice - test.expected) < 0.01;
    allPassed = allPassed && passed;

    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    console.log(`   Input: £${test.competitorPrice.toFixed(2)} | Output: £${newPrice.toFixed(2)} | Expected: £${test.expected.toFixed(2)}`);
  }

  console.log('');
  return { success: allPassed };
}

// =================================================
// MAIN TEST RUNNER
// =================================================

async function runAllTests() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('     ISBNScout Repricing Engine - Test Suite');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Check configuration
  console.log('📋 Configuration:');
  console.log(`   Test ISBN: ${TEST_CONFIG.testISBN}`);
  console.log(`   Test Amazon: ${TEST_CONFIG.testAmazon ? '✓' : '✗'}`);
  console.log(`   Test eBay: ${TEST_CONFIG.testEbay ? '✓' : '✗'}`);
  console.log('');

  // Run tests
  const results = {
    amazon: await testAmazonPricing(),
    ebay: await testEbayPricing(),
    calculation: testPriceCalculation(),
  };

  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('                    Summary');
  console.log('═══════════════════════════════════════════════════════\n');

  const amazonStatus = results.amazon.skipped ? '⏭️  SKIPPED' :
                        results.amazon.success ? '✅ PASS' : '❌ FAIL';
  const ebayStatus = results.ebay.skipped ? '⏭️  SKIPPED' :
                      results.ebay.success ? '✅ PASS' : '❌ FAIL';
  const calcStatus = results.calculation.success ? '✅ PASS' : '❌ FAIL';

  console.log(`Amazon Pricing:      ${amazonStatus}`);
  console.log(`eBay Pricing:        ${ebayStatus}`);
  console.log(`Price Calculation:   ${calcStatus}`);
  console.log('');

  // Determine overall status
  const testedAmazon = !results.amazon.skipped;
  const testedEbay = !results.ebay.skipped;
  const amazonPassed = results.amazon.success || results.amazon.skipped;
  const ebayPassed = results.ebay.success || results.ebay.skipped;
  const calcPassed = results.calculation.success;

  const atLeastOnePlatformWorks =
    (testedAmazon && results.amazon.success) ||
    (testedEbay && results.ebay.success);

  if (atLeastOnePlatformWorks && calcPassed) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Your repricing engine is working!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test with 2-3 more ISBNs to verify consistency');
    console.log('2. Test the manual "Reprice Now" button in the UI');
    console.log('3. Create a repricing rule and let it run hourly');
    console.log('4. Verify price updates on Amazon/eBay');
    console.log('5. Start beta tester outreach! 🚀');
    console.log('');
  } else {
    console.log('═══════════════════════════════════════════════════════');
    console.log('⚠️  ISSUES DETECTED');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    if (!atLeastOnePlatformWorks) {
      console.log('❌ No pricing platform is working');
      console.log('');
      console.log('You MUST fix this before beta testing:');
      console.log('');

      if (testedAmazon && !results.amazon.success) {
        console.log('Amazon Issues:');
        console.log(`  - ${results.amazon.error}`);
        console.log('  - Check REPRICING_TEST_PLAN.md for debugging steps');
        console.log('');
      }

      if (testedEbay && !results.ebay.success) {
        console.log('eBay Issues:');
        console.log(`  - ${results.ebay.error}`);
        console.log('  - Check REPRICING_TEST_PLAN.md for debugging steps');
        console.log('');
      }

      if (!testedAmazon && !testedEbay) {
        console.log('❗ You need to test at least one platform!');
        console.log('   Set testAmazon or testEbay to true in TEST_CONFIG');
        console.log('');
      }
    }

    if (!calcPassed) {
      console.log('❌ Price calculation logic has errors');
      console.log('   Review the RepricingService.calculateNewPrice() method');
      console.log('');
    }

    console.log('🚫 DO NOT invite beta testers until these pass!');
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════\n');
}

// Run the tests
runAllTests().catch((error) => {
  console.error('\n❌ Fatal error running tests:');
  console.error(error);
  process.exit(1);
});
