import Database from 'better-sqlite3';

const db = new Database('isbn-scout-offline.db');

console.log('\n=== USERS TABLE SCHEMA ===');
const usersColumns = db.prepare("PRAGMA table_info(users)").all();
console.table(usersColumns);

console.log('\n=== BOOKS TABLE SCHEMA ===');
const booksColumns = db.prepare("PRAGMA table_info(books)").all();
console.table(booksColumns);

db.close();
