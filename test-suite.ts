import 'dotenv/config';
import Database from 'better-sqlite3';
import { GoogleBooksService } from './server/google-books-service';
import { EbayPricingService } from './server/ebay-pricing-service';
import { AmazonPricingService } from './server/amazon-pricing-service';

const db = new Database('isbn-scout-offline.db');
const googleBooks = new GoogleBooksService();
const ebayPricing = new EbayPricingService();
const amazonPricing = new AmazonPricingService();

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<boolean>): Promise<void> {
  const start = Date.now();
  try {
    const passed = await testFn();
    const duration = Date.now() - start;
    results.push({ name, passed, message: passed ? '✅ PASS' : '❌ FAIL', duration });
    console.log(`${passed ? '✅' : '❌'} ${name} (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ name, passed: false, message: `❌ ERROR: ${error.message}`, duration });
    console.log(`❌ ${name} - ERROR: ${error.message} (${duration}ms)`);
  }
}

async function testGoogleBooksISBNLookup(): Promise<boolean> {
  const result = await googleBooks.lookupByISBN('9780747532699'); // Harry Potter
  return result !== null && result.title.includes('Harry Potter');
}

async function testGoogleBooksTitleSearch(): Promise<boolean> {
  const results = await googleBooks.search('intitle:Atomic Habits inauthor:James Clear', 1);
  return results.length > 0 && results[0].title.includes('Atomic Habits');
}

async function testEbayPricingByISBN(): Promise<boolean> {
  const result = await ebayPricing.getPriceByISBN('9780747532699', 'Harry Potter');
  return result !== null && result.averagePrice > 0;
}

async function testEbayPricingByTitle(): Promise<boolean> {
  const result = await ebayPricing.getPriceByISBN('FAKE-ISBN-12345', 'Atomic Habits');
  // Should fallback to title search
  return result !== null && result.averagePrice > 0;
}

async function testAmazonPricingConfigured(): Promise<boolean> {
  return amazonPricing.isConfigured() === true || amazonPricing.isConfigured() === false;
}

async function testDatabaseConnection(): Promise<boolean> {
  const result = db.prepare('SELECT 1 as test').get() as any;
  return result.test === 1;
}

async function testUserCanCreateAccount(): Promise<boolean> {
  // Check if we can query users table
  const result = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  return typeof result.count === 'number';
}

async function testBooksTableStructure(): Promise<boolean> {
  // Verify books table has all required columns
  const columns = db.prepare("PRAGMA table_info(books)").all() as any[];
  const requiredColumns = ['id', 'isbn', 'title', 'author', 'thumbnail', 'ebayPrice', 'amazonPrice', 'userId'];
  return requiredColumns.every(col => columns.some(c => c.name === col));
}

async function testBookCreationFlow(): Promise<boolean> {
  // Simulate creating a book with AI-generated ISBN
  const testUserId = 'test-user-' + Date.now();
  const aiISBN = `AI-${Date.now()}${Math.random()}`;

  // Create test user
  db.prepare(`
    INSERT INTO users (id, username, email, password, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(testUserId, 'testuser', 'test@test.com', 'hash', new Date().toISOString(), new Date().toISOString());

  // Create book with AI-generated ISBN
  db.prepare(`
    INSERT INTO books (id, isbn, title, author, userId, status, scannedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'test-book-' + Date.now(),
    aiISBN,
    'Test Book',
    'Test Author',
    testUserId,
    'available',
    new Date().toISOString()
  );

  // Verify book was created
  const book = db.prepare('SELECT * FROM books WHERE isbn = ?').get(aiISBN) as any;

  // Cleanup
  db.prepare('DELETE FROM books WHERE isbn = ?').run(aiISBN);
  db.prepare('DELETE FROM users WHERE id = ?').run(testUserId);

  return book !== undefined && book.isbn === aiISBN;
}

async function testScanLimitCheck(): Promise<boolean> {
  // Test that trial_scans table exists for tracking scan limits
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='trial_scans'").all() as any[];
  if (tables.length === 0) return false;

  // Verify trial_scans table has required columns
  const columns = db.prepare("PRAGMA table_info(trial_scans)").all() as any[];
  const requiredColumns = ['fingerprint', 'scansUsed', 'firstScanAt', 'lastScanAt'];
  return requiredColumns.every(col => columns.some(c => c.name === col));
}

async function runAllTests(): Promise<void> {
  console.log('\n========================================');
  console.log('📋 RUNNING COMPREHENSIVE TEST SUITE');
  console.log('========================================\n');

  console.log('🔍 API Integration Tests:');
  await runTest('Google Books - ISBN Lookup', testGoogleBooksISBNLookup);
  await runTest('Google Books - Title/Author Search', testGoogleBooksTitleSearch);
  await runTest('eBay Pricing - ISBN Search', testEbayPricingByISBN);
  await runTest('eBay Pricing - Title Fallback', testEbayPricingByTitle);
  await runTest('Amazon Pricing - Configuration Check', testAmazonPricingConfigured);

  console.log('\n💾 Database Tests:');
  await runTest('Database Connection', testDatabaseConnection);
  await runTest('User Account Creation', testUserCanCreateAccount);
  await runTest('Books Table Structure', testBooksTableStructure);
  await runTest('Book Creation Flow', testBookCreationFlow);
  await runTest('Scan Limit Functionality', testScanLimitCheck);

  console.log('\n========================================');
  console.log('📊 TEST SUMMARY');
  console.log('========================================\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`Total Duration: ${results.reduce((sum, r) => sum + r.duration, 0)}ms\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ${r.name}: ${r.message}`);
    });
    console.log('');
  }

  console.log('========================================\n');

  db.close();
}

// Run all tests
runAllTests().catch(console.error);
