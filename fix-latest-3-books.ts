import 'dotenv/config';
import Database from 'better-sqlite3';
import { GoogleBooksService } from './server/google-books-service';
import { EbayPricingService } from './server/ebay-pricing-service';

const db = new Database('isbn-scout-offline.db');
const googleBooks = new GoogleBooksService();
const ebayPricing = new EbayPricingService();

async function fixLatest3Books() {
  console.log('\n=== Fixing Latest 3 Scanned Books ===\n');

  // Get the latest 3 books (scanned around 7:00 PM)
  const books = db.prepare(`
    SELECT id, isbn, title, author, thumbnail, ebayPrice
    FROM books
    WHERE userId = 'c25449e9-9111-4da9-9655-66dd25b458df'
    ORDER BY scannedAt DESC
    LIMIT 3
  `).all() as any[];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    console.log(`\n${i + 1}. Fixing: ${book.title}`);

    const updates: any = {};
    let realISBN = book.isbn;

    // Check if ISBN is AI-generated
    const isAIGeneratedISBN = book.isbn.startsWith('AI-');

    if (isAIGeneratedISBN) {
      console.log(`   AI-generated ISBN detected, searching Google Books...`);
      try {
        const searchResults = await googleBooks.search(
          `intitle:${book.title} inauthor:${book.author}`,
          1
        );

        if (searchResults.length > 0) {
          const googleData = searchResults[0];
          console.log(`   ✅ Found on Google Books`);
          console.log(`   Real ISBN: ${googleData.isbn || 'N/A'}`);
          console.log(`   Thumbnail: ${googleData.thumbnail ? 'Yes' : 'No'}`);

          if (googleData.isbn) {
            updates.isbn = googleData.isbn;
            realISBN = googleData.isbn;
          }
          if (googleData.thumbnail) {
            updates.thumbnail = googleData.thumbnail;
          }
        } else {
          console.log(`   ❌ Not found on Google Books`);
        }
      } catch (e: any) {
        console.log(`   ❌ Google Books error: ${e.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Try to fetch eBay pricing with the real ISBN
    if (!book.ebayPrice) {
      try {
        console.log(`   Fetching eBay pricing...`);
        const ebayData = await ebayPricing.getPriceByISBN(realISBN, book.title);
        if (ebayData && ebayData.averagePrice) {
          updates.ebayPrice = ebayData.averagePrice;
          console.log(`   ✅ eBay Price: £${ebayData.averagePrice.toFixed(2)}`);
        } else {
          console.log(`   ❌ eBay Price: Not found`);
        }
      } catch (e: any) {
        console.log(`   ❌ eBay error: ${e.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`   Already has eBay price: £${book.ebayPrice}`);
    }

    // Update database
    if (Object.keys(updates).length > 0) {
      const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);

      db.prepare(`
        UPDATE books
        SET ${setClauses}
        WHERE id = ?
      `).run(...values, book.id);

      console.log(`   ✅ Updated in database`);
    } else {
      console.log(`   No updates needed`);
    }
  }

  console.log('\n=== Complete ===\n');
  db.close();
}

fixLatest3Books();
