import 'dotenv/config';
import Database from 'better-sqlite3';
import { GoogleBooksService } from './server/google-books-service';
import { EbayPricingService } from './server/ebay-pricing-service';
import { AmazonPricingService } from './server/amazon-pricing-service';

const db = new Database('isbn-scout-offline.db');
const googleBooks = new GoogleBooksService();
const ebayPricing = new EbayPricingService();
const amazonPricing = new AmazonPricingService();

async function testBookCreationWithRealISBN() {
  console.log('\n========================================');
  console.log('📚 PHASE 2.1: Testing Book Creation with Real ISBN');
  console.log('========================================\n');

  const testISBN = '9780747532699'; // Harry Potter and the Philosopher's Stone
  const testUserId = 'test-user-phase2-' + Date.now();

  try {
    // Step 1: Create test user
    console.log('Step 1: Creating test user...');
    db.prepare(`
      INSERT INTO users (id, username, email, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(testUserId, 'phase2test', 'phase2@test.com', 'hash', new Date().toISOString(), new Date().toISOString());
    console.log('✅ Test user created:', testUserId);

    // Step 2: Lookup book by ISBN
    console.log('\nStep 2: Looking up book by ISBN...');
    const bookData = await googleBooks.lookupByISBN(testISBN);
    if (!bookData) {
      console.log('❌ FAIL: Could not find book by ISBN');
      return false;
    }
    console.log('✅ Book found:', bookData.title, 'by', bookData.authors?.join(', '));
    console.log('   Thumbnail:', bookData.thumbnail ? '✅' : '❌');

    // Step 3: Get eBay pricing
    console.log('\nStep 3: Fetching eBay pricing...');
    const ebayPrice = await ebayPricing.getPriceByISBN(testISBN, bookData.title);
    if (ebayPrice) {
      console.log('✅ eBay pricing found:');
      console.log('   Average Price:', ebayPrice.averagePrice);
      console.log('   Listings Found:', ebayPrice.totalListings);
    } else {
      console.log('⚠️  No eBay pricing found (not necessarily an error)');
    }

    // Step 4: Get Amazon pricing (if configured)
    console.log('\nStep 4: Checking Amazon pricing...');
    if (amazonPricing.isConfigured()) {
      const amazonPrice = await amazonPricing.getPriceByISBN(testISBN);
      if (amazonPrice) {
        console.log('✅ Amazon pricing found:', amazonPrice);
      } else {
        console.log('⚠️  No Amazon pricing found');
      }
    } else {
      console.log('⚠️  Amazon PA-API not configured (expected)');
    }

    // Step 5: Create book in database
    console.log('\nStep 5: Creating book in database...');
    const bookId = 'book-phase2-' + Date.now();
    db.prepare(`
      INSERT INTO books (id, isbn, title, author, thumbnail, ebayPrice, amazonPrice, userId, status, scannedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookId,
      testISBN,
      bookData.title,
      bookData.authors?.join(', '),
      bookData.thumbnail,
      ebayPrice ? JSON.stringify(ebayPrice) : null,
      null,
      testUserId,
      'available',
      new Date().toISOString()
    );
    console.log('✅ Book created in database');

    // Step 6: Verify book in database
    console.log('\nStep 6: Verifying book in database...');
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as any;
    console.log('✅ Book verified:');
    console.log('   ISBN:', book.isbn);
    console.log('   Title:', book.title);
    console.log('   Author:', book.author);
    console.log('   Thumbnail:', book.thumbnail ? '✅' : '❌');
    console.log('   eBay Price:', book.ebayPrice ? '✅' : '❌');

    // Cleanup
    console.log('\nStep 7: Cleaning up...');
    db.prepare('DELETE FROM books WHERE id = ?').run(bookId);
    db.prepare('DELETE FROM users WHERE id = ?').run(testUserId);
    console.log('✅ Cleanup complete');

    console.log('\n========================================');
    console.log('✅ PHASE 2.1 PASSED: Book creation with real ISBN works!');
    console.log('========================================\n');

  } catch (error: any) {
    console.log('\n========================================');
    console.log('❌ PHASE 2.1 FAILED:', error.message);
    console.log('========================================\n');

    // Cleanup on error
    try {
      db.prepare('DELETE FROM books WHERE userId = ?').run(testUserId);
      db.prepare('DELETE FROM users WHERE id = ?').run(testUserId);
    } catch {}
  } finally {
    db.close();
  }
}

testBookCreationWithRealISBN().catch(console.error);
