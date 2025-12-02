import { storage } from '../../server/storage';
import Database from 'better-sqlite3';
import fs from 'fs';

/**
 * Clear all test data from the database
 */
export async function clearTestDatabase() {
  // For SQLite, we can delete the database file if it exists
  const dbPath = 'isbn_scout.db';
  
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Generate unique test data to avoid conflicts
 */
export function generateTestEmail() {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(7);
  return 'test-' + timestamp + '-' + random + '@example.com';
}

export function generateTestUsername() {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(7);
  return 'testuser-' + timestamp + '-' + random;
}
