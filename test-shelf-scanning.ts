/**
 * Test Multi-Book Shelf Scanning
 * Tests the new killer feature - detecting multiple books from one photo
 */

import { config } from 'dotenv';
import { AIService } from './server/ai-service';

config();

async function testShelfScanning() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   TESTING MULTI-BOOK SHELF SCANNING');
  console.log('═══════════════════════════════════════════════════\n');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not set!');
    process.exit(1);
  }

  const aiService = new AIService(apiKey);

  // Test images - you'll need to add your own shelf photos here
  const testImages = [
    {
      name: 'Test 1: Bookshelf with multiple spines',
      url: '', // Add your test image URL here
      expectedBooks: 5,
      description: 'Books arranged spine-out on shelf'
    },
    // Add more test cases as you get images
  ];

  console.log('📸 INSTRUCTIONS:');
  console.log('1. Take a photo of 3-5 books arranged spine-out');
  console.log('2. Upload to imgur.com or similar');
  console.log('3. Add the URL to this test script');
  console.log('4. Run: npx tsx test-shelf-scanning.ts');
  console.log('\n⚠️  No test images configured yet. Add URLs above.\n');

  // If you have test URLs, uncomment this:
  /*
  for (const test of testImages) {
    if (!test.url) {
      console.log(`⏭️  Skipping: ${test.name} (no URL provided)\n`);
      continue;
    }

    console.log('─────────────────────────────────────────────────');
    console.log(`\n📚 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   Expected: ${test.expectedBooks} books\n`);

    try {
      const startTime = Date.now();
      const result = await aiService.analyzeMultipleBooks(test.url);
      const duration = Date.now() - startTime;

      console.log(`✅ Scan complete in ${duration}ms\n`);
      console.log(`📊 Results:`);
      console.log(`   Books detected: ${result.totalBooksDetected}`);
      console.log(`   Image type: ${result.imageType}`);
      console.log('');

      if (result.books.length > 0) {
        console.log('📖 Books found:\n');
        result.books.forEach((book, index) => {
          console.log(`   ${index + 1}. "${book.title || 'Unknown'}"`);
          console.log(`      Author: ${book.author || 'Unknown'}`);
          console.log(`      ISBN: ${book.isbn || 'Not visible'}`);
          console.log(`      Confidence: ${book.confidence || 'N/A'}`);
          console.log(`      Position: ${book.position || 'N/A'}`);
          console.log('');
        });

        // Check accuracy
        const accuracy = (result.totalBooksDetected / test.expectedBooks) * 100;
        if (accuracy >= 80) {
          console.log(`✅ Good detection rate: ${accuracy.toFixed(0)}%`);
        } else if (accuracy >= 50) {
          console.log(`⚠️  Moderate detection rate: ${accuracy.toFixed(0)}%`);
        } else {
          console.log(`❌ Low detection rate: ${accuracy.toFixed(0)}%`);
        }
      } else {
        console.log('❌ No books detected!');
        console.log('   Possible issues:');
        console.log('   - Image quality too low');
        console.log('   - Spines not visible enough');
        console.log('   - Lighting problems');
        console.log('   - Text too small/blurry');
      }

      console.log('');
    } catch (error: any) {
      console.error(`❌ Test failed: ${error.message}\n`);
    }
  }
  */

  console.log('═══════════════════════════════════════════════════');
  console.log('   QUICK TEST GUIDE');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('To test right now:');
  console.log('');
  console.log('1. Line up 3-5 books spine-out');
  console.log('2. Take a clear photo (good lighting)');
  console.log('3. Upload to: https://imgur.com/upload');
  console.log('4. Copy the direct image link');
  console.log('5. Test via API:');
  console.log('');
  console.log('   curl -X POST http://localhost:5000/api/ai/analyze-shelf \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"imageUrl":"YOUR_IMAGE_URL_HERE"}\'');
  console.log('');
  console.log('6. Check if it detects multiple books!');
  console.log('');
  console.log('═══════════════════════════════════════════════════\n');

  // Quick curl test command generator
  console.log('📝 Once you have an image URL, run this:');
  console.log('');
  console.log('IMAGE_URL="https://i.imgur.com/YOUR_IMAGE.jpg"');
  console.log('curl -X POST http://localhost:5000/api/ai/analyze-shelf \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d "{\\"imageUrl\\":\\"$IMAGE_URL\\"}" | jq');
  console.log('');
}

testShelfScanning();
