import Database from 'better-sqlite3';

const db = new Database('isbn-scout-offline.db');

// Get the latest 5 books for testuser
const books = db.prepare(`
  SELECT id, isbn, title, author, thumbnail, ebayPrice, amazonPrice, scannedAt
  FROM books
  WHERE userId = 'c25449e9-9111-4da9-9655-66dd25b458df'
  ORDER BY scannedAt DESC
  LIMIT 5
`).all();

console.log('\n=== Latest 5 Scanned Books ===\n');

books.forEach((book: any, idx) => {
  console.log(`Book ${idx + 1} (${new Date(book.scannedAt).toLocaleTimeString()}):`);
  console.log(`  Title: ${book.title}`);
  console.log(`  Author: ${book.author}`);
  console.log(`  ISBN: ${book.isbn}`);
  console.log(`  Thumbnail: ${book.thumbnail ? 'Yes ✅' : 'No ❌'}`);
  console.log(`  eBay Price: ${book.ebayPrice ? '£' + book.ebayPrice + ' ✅' : 'None ❌'}`);
  console.log(`  Amazon Price: ${book.amazonPrice ? '£' + book.amazonPrice : 'None'}`);
  console.log('');
});

db.close();
