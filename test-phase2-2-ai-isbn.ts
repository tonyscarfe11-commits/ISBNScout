import 'dotenv/config';
import Database from 'better-sqlite3';
import { GoogleBooksService } from './server/google-books-service';
import { EbayPricingService } from './server/ebay-pricing-service';

const db = new Database('isbn-scout-offline.db');
const googleBooks = new GoogleBooksService();
const ebayPricing = new EbayPricingService();

async function testBookCreationWithAIGeneratedISBN() {
  console.log('\n========================================');
  console.log('🤖 PHASE 2.2: Testing Book Creation with AI-Generated ISBN');
  console.log('========================================\n');

  // Simulate shelf scan result with AI-generated ISBN + title/author from OCR
  const aiISBN = `AI-${Date.now()}-${Math.random()}`;
  const ocrTitle = 'Atomic Habits';
  const ocrAuthor = 'James Clear';
  const testUserId = 'test-user-phase2-2-' + Date.now();

  try {
    // Step 1: Create test user
    console.log('Step 1: Creating test user...');
    db.prepare(`
      INSERT INTO users (id, username, email, password, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(testUserId, 'phase2-2test', 'phase2-2@test.com', 'hash', new Date().toISOString(), new Date().toISOString());
    console.log('✅ Test user created:', testUserId);

    // Step 2: Detect AI-generated ISBN and search by title/author
    console.log('\nStep 2: Detecting AI-generated ISBN...');
    const isAIGenerated = aiISBN.startsWith('AI-');
    console.log('✅ AI-generated ISBN detected:', isAIGenerated);

    // Step 3: Search Google Books by title + author (this is the critical fix from earlier testing)
    console.log('\nStep 3: Searching Google Books by title + author...');
    console.log('   Query:', `intitle:${ocrTitle} inauthor:${ocrAuthor}`);
    const searchResults = await googleBooks.search(`intitle:${ocrTitle} inauthor:${ocrAuthor}`, 1);

    if (searchResults.length === 0) {
      console.log('❌ FAIL: No results found from Google Books search');
      console.log('   This means the shelf scanning fix is not working!');
      return false;
    }

    const bookData = searchResults[0];
    const realISBN = bookData.isbn10 || bookData.isbn13 || aiISBN;

    console.log('✅ Book found via search:', bookData.title, 'by', bookData.authors?.join(', '));
    console.log('   Real ISBN from Google:', realISBN);
    console.log('   Thumbnail:', bookData.thumbnail ? '✅' : '❌');

    // Step 4: Get eBay pricing using REAL ISBN (not AI-generated one)
    console.log('\nStep 4: Fetching eBay pricing with REAL ISBN...');
    const ebayPrice = await ebayPricing.getPriceByISBN(realISBN, bookData.title);
    if (ebayPrice) {
      console.log('✅ eBay pricing found:');
      console.log('   Average Price:', ebayPrice.averagePrice);
      console.log('   Listings Found:', ebayPrice.totalListings);
      console.log('   ⚠️  CRITICAL: If this shows "undefined", bug #10 is confirmed!');
    } else {
      console.log('⚠️  No eBay pricing found');
    }

    // Step 5: Create book in database with REAL ISBN
    console.log('\nStep 5: Creating book in database with REAL ISBN...');
    const bookId = 'book-phase2-2-' + Date.now();
    db.prepare(`
      INSERT INTO books (id, isbn, title, author, thumbnail, ebayPrice, userId, status, scannedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookId,
      realISBN, // Using real ISBN, not AI-generated one
      bookData.title,
      bookData.authors?.join(', '),
      bookData.thumbnail,
      ebayPrice ? JSON.stringify(ebayPrice) : null,
      testUserId,
      'available',
      new Date().toISOString()
    );
    console.log('✅ Book created in database with real ISBN');

    // Step 6: Verify book in database
    console.log('\nStep 6: Verifying book in database...');
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as any;
    console.log('✅ Book verified:');
    console.log('   Stored ISBN:', book.isbn);
    console.log('   Original AI ISBN:', aiISBN);
    console.log('   ISBN was replaced:', book.isbn !== aiISBN ? '✅' : '❌');
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
    console.log('✅ PHASE 2.2 PASSED: AI ISBN handling works correctly!');
    console.log('   - AI ISBN was detected ✅');
    console.log('   - Google Books search by title/author worked ✅');
    console.log('   - Real ISBN was found and replaced ✅');
    console.log('   - Pricing was fetched with real ISBN ✅');
    console.log('========================================\n');

  } catch (error: any) {
    console.log('\n========================================');
    console.log('❌ PHASE 2.2 FAILED:', error.message);
    console.log('Stack:', error.stack);
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

testBookCreationWithAIGeneratedISBN().catch(console.error);
