/**
 * Test the new EbayPricingService with Browse API
 */

import { config } from 'dotenv';
import { EbayPricingService } from './server/ebay-pricing-service';

config();

async function testService() {
  console.log('\n=== Testing EbayPricingService (TypeScript) ===\n');

  const service = new EbayPricingService();

  // Check if configured
  console.log('Service configured:', service.isConfigured() ? '✅' : '❌');
  console.log('Rate limit info:', service.getRateLimitInfo());

  // Test ISBN lookup
  const testIsbn = '9780316769488'; // The Catcher in the Rye
  console.log(`\nSearching for ISBN: ${testIsbn}`);

  try {
    const priceData = await service.getPriceByISBN(testIsbn);

    if (priceData) {
      console.log('\n✅ Price data retrieved successfully:');
      console.log('   ISBN:', priceData.isbn);
      console.log('   Current Price:', priceData.currentPrice ? `£${priceData.currentPrice.toFixed(2)}` : 'N/A');
      console.log('   Average Price:', priceData.averagePrice ? `£${priceData.averagePrice.toFixed(2)}` : 'N/A');
      console.log('   Min Price:', priceData.minPrice ? `£${priceData.minPrice.toFixed(2)}` : 'N/A');
      console.log('   Max Price:', priceData.maxPrice ? `£${priceData.maxPrice.toFixed(2)}` : 'N/A');
      console.log('   Active Listings:', priceData.activeListings);
      console.log('   Sold Count:', priceData.soldCount, '(always 0 - no longer available)');
      console.log('   Currency:', priceData.currency);
      console.log('   Last Updated:', priceData.lastUpdated);

      if (priceData.listings && priceData.listings.length > 0) {
        console.log(`\n   Top ${priceData.listings.length} Listings:`);
        priceData.listings.forEach((listing, index) => {
          console.log(`   ${index + 1}. ${listing.title}`);
          console.log(`      Price: £${listing.price.toFixed(2)}`);
          console.log(`      Condition: ${listing.condition}`);
          console.log(`      Seller: ${listing.seller}`);
        });
      }

      console.log('\n✅ Service test passed!');
    } else {
      console.log('⚠️  No price data found for ISBN');
    }
  } catch (error: any) {
    console.error('❌ Service test failed:', error.message);
    throw error;
  }

  // Test title search
  console.log('\n\n--- Testing Title Search ---');
  try {
    const results = await service.searchByTitle('Harry Potter', 5);
    console.log(`✅ Found ${results.length} results for "Harry Potter"`);

    if (results.length > 0) {
      results.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   Price: £${item.price.toFixed(2)}`);
        console.log(`   Condition: ${item.condition}`);
      });
    }
  } catch (error: any) {
    console.error('❌ Title search failed:', error.message);
  }

  console.log('\n🎉 All TypeScript service tests completed!\n');
}

testService().catch(console.error);
