import 'dotenv/config';
import Database from 'better-sqlite3';
import { GoogleBooksService } from './server/google-books-service';
import { EbayPricingService } from './server/ebay-pricing-service';

const db = new Database('isbn-scout-offline.db');
const googleBooks = new GoogleBooksService();
const ebayPricing = new EbayPricingService();

async function fixNewBooks() {
  console.log('\n=== Fixing The Power of Habit & Leading ===\n');

  const books = [
    { title: 'The Power of Habit', author: 'Charles Duhigg' },
    { title: 'Leading', author: 'Alex Ferguson' }
  ];

  // Get the book IDs from database
  const dbBooks = db.prepare(`
    SELECT id, title, author
    FROM books
    WHERE userId = 'c25449e9-9111-4da9-9655-66dd25b458df'
      AND isbn LIKE 'AI-%'
    ORDER BY scannedAt DESC
    LIMIT 2
  `).all() as any[];

  for (let i = 0; i < dbBooks.length; i++) {
    const dbBook = dbBooks[i];
    console.log(`\n${i + 1}. Fixing: ${dbBook.title}`);

    try {
      // Search Google Books
      const searchResults = await googleBooks.search(
        `intitle:${dbBook.title} inauthor:${dbBook.author}`,
        1
      );

      if (searchResults.length > 0) {
        const googleData = searchResults[0];
        console.log(`   ✅ Found on Google Books`);
        console.log(`   Real ISBN: ${googleData.isbn || 'N/A'}`);
        console.log(`   Thumbnail: ${googleData.thumbnail ? 'Yes' : 'No'}`);

        const updates: any = {
          thumbnail: googleData.thumbnail || null,
        };

        if (googleData.isbn) {
          updates.isbn = googleData.isbn;

          // Try eBay pricing
          try {
            const ebayData = await ebayPricing.getPriceByISBN(googleData.isbn, dbBook.title);
            if (ebayData && ebayData.averagePrice) {
              updates.ebayPrice = ebayData.averagePrice;
              console.log(`   eBay Price: £${ebayData.averagePrice.toFixed(2)}`);
            } else {
              console.log(`   eBay Price: Not found`);
            }
          } catch (e: any) {
            console.log(`   eBay Price: Error - ${e.message}`);
          }
        }

        // Update database
        const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);

        db.prepare(`
          UPDATE books
          SET ${setClauses}
          WHERE id = ?
        `).run(...values, dbBook.id);

        console.log(`   ✅ Updated in database`);
      } else {
        console.log(`   ❌ Not found on Google Books`);
      }
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n=== Complete ===\n');
  db.close();
}

fixNewBooks();
