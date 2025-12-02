#!/usr/bin/env tsx
import Database from 'better-sqlite3';

const db = new Database('isbn_scout.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in isbn_scout.db:', tables);
db.close();
