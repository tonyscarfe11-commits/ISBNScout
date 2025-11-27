import 'dotenv/config';
import { EbayPricingService } from './server/ebay-pricing-service';

const ebayPricing = new EbayPricingService();

async function testEbayPricing() {
  console.log('\n========================================');
  console.log('💰 PHASE 2.4: Testing eBay Pricing Service');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Popular book with ISBN',
      isbn: '9780735211292',
      title: 'Atomic Habits',
      expectPrice: true,
    },
    {
      name: 'Book with fake ISBN (should fallback to title)',
      isbn: 'FAKE-ISBN-123',
      title: 'Harry Potter',
      expectPrice: true,
    },
    {
      name: 'Very obscure title',
      isbn: 'FAKE-ISBN-456',
      title: 'Extremely Obscure Book That Does Not Exist At All',
      expectPrice: false,
    },
    {
      name: 'Common textbook',
      isbn: '9780134685991',
      title: 'Effective Java',
      expectPrice: true,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\nTest: ${test.name}`);
      console.log(`   ISBN: ${test.isbn}`);
      console.log(`   Title: ${test.title}`);

      const result = await ebayPricing.getPriceByISBN(test.isbn, test.title);

      if (test.expectPrice && result !== null) {
        console.log(`✅ PASS: Pricing found`);
        console.log(`   Average Price: $${result.averagePrice.toFixed(2)}`);
        console.log(`   Median Price: $${result.medianPrice.toFixed(2)}`);
        console.log(`   Min Price: $${result.minPrice.toFixed(2)}`);
        console.log(`   Max Price: $${result.maxPrice.toFixed(2)}`);
        passed++;
      } else if (!test.expectPrice && result === null) {
        console.log('✅ PASS: Correctly returned null for obscure item');
        passed++;
      } else if (test.expectPrice && result === null) {
        console.log('⚠️  FAIL: Expected pricing but got null');
        console.log('   Note: This might be due to eBay API limitations or no active listings');
        failed++;
      } else {
        console.log(`❌ FAIL: Unexpected result`);
        failed++;
      }
    } catch (error: any) {
      console.log(`❌ FAIL: ${error.message}`);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`📊 eBay Pricing Test Results`);
  console.log(`   Passed: ${passed}/${tests.length}`);
  console.log(`   Failed: ${failed}/${tests.length}`);
  console.log(`   Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('✅ PHASE 2.4 PASSED: eBay pricing is working great!\n');
  } else {
    console.log('⚠️  PHASE 2.4: Some tests failed');
    console.log('   Note: eBay pricing can be unreliable for some items\n');
  }
}

testEbayPricing().catch(console.error);
