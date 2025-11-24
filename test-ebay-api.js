// Test eBay Finding API
import 'dotenv/config';

const appId = process.env.EBAY_APP_ID;
console.log('eBay App ID:', appId ? appId.substring(0, 15) + '...' : 'NOT SET');

const isbn = '9780747532699';
const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findItemsByProduct&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${appId}&RESPONSE-DATA-FORMAT=JSON&productId.@type=ISBN&productId=${isbn}&GLOBAL-ID=EBAY-GB`;

console.log('\nTesting eBay API...\n');

try {
  const response = await fetch(url);
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);

  const text = await response.text();
  const data = JSON.parse(text);

  console.log('\nResponse:');
  console.log(JSON.stringify(data, null, 2).substring(0, 1000));

  // Check for errors
  if (data.errorMessage) {
    console.log('\n❌ eBay API Error:');
    console.log(JSON.stringify(data.errorMessage, null, 2));
  }

  // Check for results
  const searchResult = data.findItemsByProductResponse?.[0]?.searchResult?.[0];
  if (searchResult) {
    console.log('\n✅ Search Result:');
    console.log('Count:', searchResult['@count']);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
