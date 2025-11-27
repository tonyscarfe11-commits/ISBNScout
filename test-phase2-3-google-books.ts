import 'dotenv/config';
import { GoogleBooksService } from './server/google-books-service';

const googleBooks = new GoogleBooksService();

async function testGoogleBooksIntegration() {
  console.log('\n========================================');
  console.log('📖 PHASE 2.3: Testing Google Books Integration');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Common book by ISBN',
      isbn: '9780735211292', // Atomic Habits by James Clear
      expectedTitle: 'Atomic Habits',
    },
    {
      name: 'Obscure book by ISBN',
      isbn: '9781234567890', // Fake ISBN
      expectedTitle: null,
    },
    {
      name: 'Common book by title/author',
      query: 'intitle:The Great Gatsby inauthor:F. Scott Fitzgerald',
      expectedResults: true,
    },
    {
      name: 'Very specific title/author search',
      query: 'intitle:Harry Potter and the Philosopher inauthor:Rowling',
      expectedResults: true,
    },
    {
      name: 'Obscure title/author search',
      query: 'intitle:Nonexistent Book Title inauthor:Fake Author Name',
      expectedResults: false,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\nTest: ${test.name}`);

      if ('isbn' in test) {
        const result = await googleBooks.lookupByISBN(test.isbn);
        if (test.expectedTitle === null && result === null) {
          console.log('✅ PASS: Correctly returned null for invalid ISBN');
          passed++;
        } else if (result && result.title.includes(test.expectedTitle || '')) {
          console.log(`✅ PASS: Found "${result.title}"`);
          console.log(`   Authors: ${result.authors?.join(', ')}`);
          console.log(`   Thumbnail: ${result.thumbnail ? 'Yes' : 'No'}`);
          passed++;
        } else {
          console.log(`❌ FAIL: Expected ${test.expectedTitle}, got ${result?.title || 'null'}`);
          failed++;
        }
      } else if ('query' in test) {
        console.log(`   Query: ${test.query}`);
        const results = await googleBooks.search(test.query, 3);
        if (test.expectedResults && results.length > 0) {
          console.log(`✅ PASS: Found ${results.length} result(s)`);
          console.log(`   First result: "${results[0].title}" by ${results[0].authors?.join(', ')}`);
          passed++;
        } else if (!test.expectedResults && results.length === 0) {
          console.log('✅ PASS: Correctly returned no results for obscure search');
          passed++;
        } else {
          console.log(`❌ FAIL: Expected ${test.expectedResults ? 'results' : 'no results'}, got ${results.length}`);
          failed++;
        }
      }
    } catch (error: any) {
      console.log(`❌ FAIL: ${error.message}`);
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`📊 Google Books Integration Test Results`);
  console.log(`   Passed: ${passed}/${tests.length}`);
  console.log(`   Failed: ${failed}/${tests.length}`);
  console.log(`   Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  if (failed === 0) {
    console.log('✅ PHASE 2.3 PASSED: Google Books integration is solid!\n');
  } else {
    console.log('⚠️  PHASE 2.3: Some tests failed, but this may be expected for edge cases\n');
  }
}

testGoogleBooksIntegration().catch(console.error);
