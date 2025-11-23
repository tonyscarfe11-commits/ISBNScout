/**
 * Simple eBay Finding API Test
 * This bypasses the ebay-api library OAuth issues
 * and tests the Finding API directly with just your App ID
 */

import fetch from 'node-fetch';

const EBAY_APP_ID = process.env.EBAY_APP_ID || '';
const TEST_ISBN = '9780747532699'; // Harry Potter 1 - very common on eBay

async function testEbayFindingAPI() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  Simple eBay Finding API Test');
  console.log('═══════════════════════════════════════════\n');

  if (!EBAY_APP_ID) {
    console.log('❌ ERROR: EBAY_APP_ID not found in .env');
    return;
  }

  console.log(`📋 App ID: ${EBAY_APP_ID.substring(0, 20)}...`);
  console.log(`📖 Test ISBN: ${TEST_ISBN}`);
  console.log('🌐 Testing eBay UK (Site ID 3)\n');

  try {
    // Build Finding API request URL
    const url = 'https://svcs.ebay.com/services/search/FindingService/v1';
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByProduct',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'paginationInput.entriesPerPage': '10',
      'productId.@type': 'ISBN',
      'productId': TEST_ISBN,
      'GLOBAL-ID': 'EBAY-GB', // UK site
    });

    console.log('🔄 Calling eBay Finding API...\n');

    const response = await fetch(`${url}?${params.toString()}`);
    const data = await response.json() as any;

    // Check for errors
    if (data.errorMessage) {
      console.log('❌ eBay API Error:');
      console.log(`   ${data.errorMessage[0].error[0].message[0]}`);
      console.log(`   Error ID: ${data.errorMessage[0].error[0].errorId[0]}`);

      if (data.errorMessage[0].error[0].errorId[0] === '2001') {
        console.log('\n💡 This means your App ID is invalid or not activated for production.');
        console.log('   Check: https://developer.ebay.com/my/keys');
      }
      return;
    }

    // Check if we got results
    const searchResult = data.findItemsByProductResponse?.[0]?.searchResult?.[0];

    if (!searchResult) {
      console.log('⚠️  No search results object found');
      console.log('Raw response:', JSON.stringify(data, null, 2));
      return;
    }

    const count = parseInt(searchResult['@count'] || '0');
    console.log(`📊 Found ${count} active listings\n`);

    if (count === 0) {
      console.log('⚠️  No listings found for this ISBN');
      console.log('   This might be normal - try a different ISBN');
      console.log('   Popular books: 9780747532699 (Harry Potter), 9780261102354 (LOTR)');
      return;
    }

    // Extract prices
    const items = searchResult.item || [];
    const prices: number[] = [];

    console.log('📚 Listings found:\n');

    items.slice(0, 5).forEach((item: any, index: number) => {
      const title = item.title?.[0] || 'Unknown';
      const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0');
      const currency = item.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || '';
      const condition = item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown';

      console.log(`${index + 1}. £${price.toFixed(2)} - ${condition}`);
      console.log(`   ${title.substring(0, 60)}...`);

      if (price > 0) {
        prices.push(price);
      }
    });

    console.log('');

    if (prices.length > 0) {
      const lowestPrice = Math.min(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

      console.log('✅ SUCCESS! eBay Finding API works!\n');
      console.log(`💰 Lowest Price: £${lowestPrice.toFixed(2)}`);
      console.log(`📊 Average Price: £${avgPrice.toFixed(2)}`);
      console.log(`📦 Total Listings: ${count}`);
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('🎉 YOUR EBAY API IS WORKING!');
      console.log('═══════════════════════════════════════════\n');
      console.log('This means:');
      console.log('✅ Your App ID is valid');
      console.log('✅ You can fetch competitor prices');
      console.log('✅ The Finding API is accessible');
      console.log('');
      console.log('⚠️  HOWEVER: There\'s an issue with the ebay-api library');
      console.log('   The library is trying to use OAuth2 which requires Cert ID + Dev ID');
      console.log('   For pricing only, you don\'t need OAuth2');
      console.log('');
      console.log('🔧 FIX NEEDED:');
      console.log('   Modify server/ebay-service.ts to use direct HTTP calls');
      console.log('   instead of the ebay-api library for the searchByISBN function');
      console.log('');
    } else {
      console.log('⚠️  Found listings but couldn\'t extract prices');
      console.log('   This might be a data format issue');
    }

  } catch (error: any) {
    console.log('❌ ERROR:');
    console.error(`   ${error.message}`);

    if (error.code === 'ENOTFOUND') {
      console.log('\n   Network error - check your internet connection');
    }
  }
}

// Run the test
testEbayFindingAPI();
