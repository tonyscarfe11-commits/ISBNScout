/**
 * Test eBay Browse API Integration
 * Tests OAuth 2.0 authentication and search functionality
 */

import { config } from 'dotenv';
config();

// Check environment variables
console.log('\n=== eBay Browse API Test ===\n');

const clientId = process.env.EBAY_APP_ID;
const clientSecret = process.env.EBAY_CERT_ID;

console.log('Client ID:', clientId ? clientId.substring(0, 20) + '...' : '❌ MISSING');
console.log('Client Secret:', clientSecret ? clientSecret.substring(0, 20) + '...' : '❌ MISSING');

if (!clientId || !clientSecret) {
  console.error('\n❌ Missing eBay credentials!');
  console.error('Set EBAY_APP_ID and EBAY_CERT_ID in .env file');
  process.exit(1);
}

// Test OAuth token generation
async function testOAuth() {
  console.log('\n--- Testing OAuth Token Generation ---');

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OAuth failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OAuth token acquired');
    console.log('   Token type:', data.token_type);
    console.log('   Expires in:', data.expires_in, 'seconds (2 hours)');
    console.log('   Access token:', data.access_token.substring(0, 30) + '...');

    return data.access_token;
  } catch (error) {
    console.error('❌ OAuth failed:', error.message);
    throw error;
  }
}

// Test Browse API search
async function testSearch(accessToken, isbn = '9780316769488') {
  console.log('\n--- Testing Browse API Search ---');
  console.log('Searching for ISBN:', isbn, '(The Catcher in the Rye)');

  try {
    const url = new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
    url.searchParams.append('q', isbn);
    url.searchParams.append('category_ids', '267'); // Books
    url.searchParams.append('limit', '10');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Browse API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('❌ API Error:', data.errors[0]);
      return;
    }

    const items = data.itemSummaries || [];
    console.log(`✅ Found ${items.length} listings\n`);

    if (items.length > 0) {
      items.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Price: £${item.price?.value || 'N/A'} ${item.price?.currency || ''}`);
        console.log(`   Condition: ${item.condition || 'Unknown'}`);
        console.log(`   URL: ${item.itemWebUrl}`);
        console.log('');
      });

      // Calculate pricing stats
      const prices = items
        .map(item => parseFloat(item.price?.value || '0'))
        .filter(p => p > 0)
        .sort((a, b) => a - b);

      if (prices.length > 0) {
        const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
        console.log('📊 Pricing Statistics:');
        console.log(`   Lowest: £${prices[0].toFixed(2)}`);
        console.log(`   Highest: £${prices[prices.length - 1].toFixed(2)}`);
        console.log(`   Average: £${avg.toFixed(2)}`);
        console.log(`   Total listings: ${prices.length}`);
      }
    } else {
      console.log('⚠️  No listings found for this ISBN');
    }
  } catch (error) {
    console.error('❌ Search failed:', error.message);
    throw error;
  }
}

// Run tests
async function runTests() {
  try {
    const accessToken = await testOAuth();
    await testSearch(accessToken);

    console.log('\n✅ All tests passed!');
    console.log('\n🎉 eBay Browse API integration is working correctly\n');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  }
}

runTests();
