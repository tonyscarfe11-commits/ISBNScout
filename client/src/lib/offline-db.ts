/**
 * IndexedDB wrapper for offline book storage
 *
 * Stores complete book data, pricing, and images for offline access
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'isbn-scout-offline';
const DB_VERSION = 1;

interface BookRecord {
  id: string;
  isbn: string;
  title: string;
  author: string;
  thumbnail?: string;
  publisher?: string;
  amazonPrice: number | null;
  ebayPrice: number | null;
  yourCost: number | null;
  profit: number | null;
  status: string;
  scannedAt: string;
  // Velocity/recommendation data
  salesRank?: number;
  velocity?: string;
  velocityDescription?: string;
  buyRecommendation?: string;
  // Cached at timestamp
  cachedAt: number;
}

interface PriceCacheRecord {
  isbn: string;
  ebayPrice: number | null;
  amazonPrice: number | null;
  title: string | null;
  author: string | null;
  publisher: string | null;
  source: 'api' | 'estimate' | 'cache';
  cachedAt: number;
}

interface OfflineDBSchema extends DBSchema {
  books: {
    key: string; // isbn
    value: BookRecord;
    indexes: {
      'by-scanned-at': string;
      'by-status': string;
    };
  };
  priceCache: {
    key: string; // isbn
    value: PriceCacheRecord;
    indexes: {
      'by-cached-at': number;
    };
  };
  images: {
    key: string; // url
    value: {
      url: string;
      blob: Blob;
      cachedAt: number;
    };
  };
}

class OfflineDB {
  private dbPromise: Promise<IDBPDatabase<OfflineDBSchema>>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase<OfflineDBSchema>> {
    return openDB<OfflineDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`[OfflineDB] Upgrading from v${oldVersion} to v${newVersion}`);

        // Books store
        if (!db.objectStoreNames.contains('books')) {
          const bookStore = db.createObjectStore('books', { keyPath: 'isbn' });
          bookStore.createIndex('by-scanned-at', 'scannedAt');
          bookStore.createIndex('by-status', 'status');
          console.log('[OfflineDB] Created books store');
        }

        // Price cache store
        if (!db.objectStoreNames.contains('priceCache')) {
          const priceStore = db.createObjectStore('priceCache', { keyPath: 'isbn' });
          priceStore.createIndex('by-cached-at', 'cachedAt');
          console.log('[OfflineDB] Created priceCache store');
        }

        // Images store
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'url' });
          console.log('[OfflineDB] Created images store');
        }
      },
    });
  }

  // ===== BOOK METHODS =====

  async saveBook(book: Omit<BookRecord, 'cachedAt'>): Promise<void> {
    const db = await this.dbPromise;
    const bookWithCache: BookRecord = {
      ...book,
      cachedAt: Date.now(),
    };
    await db.put('books', bookWithCache);
    console.log(`[OfflineDB] Saved book: ${book.isbn}`);
  }

  async getBook(isbn: string): Promise<BookRecord | undefined> {
    const db = await this.dbPromise;
    return await db.get('books', isbn);
  }

  async getAllBooks(): Promise<BookRecord[]> {
    const db = await this.dbPromise;
    const books = await db.getAllFromIndex('books', 'by-scanned-at');
    return books.reverse(); // Most recent first
  }

  async getRecentBooks(limit: number = 20): Promise<BookRecord[]> {
    const db = await this.dbPromise;
    const books = await db.getAllFromIndex('books', 'by-scanned-at');
    return books.reverse().slice(0, limit);
  }

  async deleteBook(isbn: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('books', isbn);
    console.log(`[OfflineDB] Deleted book: ${isbn}`);
  }

  async clearBooks(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear('books');
    console.log('[OfflineDB] Cleared all books');
  }

  // ===== PRICE CACHE METHODS =====

  async cachePrice(priceData: Omit<PriceCacheRecord, 'cachedAt'>): Promise<void> {
    const db = await this.dbPromise;
    const record: PriceCacheRecord = {
      ...priceData,
      cachedAt: Date.now(),
    };
    await db.put('priceCache', record);
    console.log(`[OfflineDB] Cached price for: ${priceData.isbn}`);
  }

  async getCachedPrice(isbn: string): Promise<PriceCacheRecord | undefined> {
    const db = await this.dbPromise;
    const cached = await db.get('priceCache', isbn);

    // Check if cache is still valid (24 hours)
    if (cached && Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000) {
      return cached;
    }

    // Expired or not found
    if (cached) {
      await db.delete('priceCache', isbn);
    }
    return undefined;
  }

  async clearOldPriceCache(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const db = await this.dbPromise;
    const allPrices = await db.getAll('priceCache');
    const cutoff = Date.now() - maxAgeMs;
    let deleted = 0;

    for (const price of allPrices) {
      if (price.cachedAt < cutoff) {
        await db.delete('priceCache', price.isbn);
        deleted++;
      }
    }

    console.log(`[OfflineDB] Cleared ${deleted} old price cache entries`);
    return deleted;
  }

  // ===== IMAGE CACHE METHODS =====

  async cacheImage(url: string, blob: Blob): Promise<void> {
    const db = await this.dbPromise;
    await db.put('images', {
      url,
      blob,
      cachedAt: Date.now(),
    });
    console.log(`[OfflineDB] Cached image: ${url.substring(0, 50)}...`);
  }

  async getCachedImage(url: string): Promise<Blob | undefined> {
    const db = await this.dbPromise;
    const cached = await db.get('images', url);
    return cached?.blob;
  }

  async clearOldImages(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    const db = await this.dbPromise;
    const allImages = await db.getAll('images');
    const cutoff = Date.now() - maxAgeMs;
    let deleted = 0;

    for (const image of allImages) {
      if (image.cachedAt < cutoff) {
        await db.delete('images', image.url);
        deleted++;
      }
    }

    console.log(`[OfflineDB] Cleared ${deleted} old images`);
    return deleted;
  }

  // ===== UTILITY METHODS =====

  async getStorageStats(): Promise<{
    bookCount: number;
    priceCacheCount: number;
    imageCount: number;
  }> {
    const db = await this.dbPromise;
    const [bookCount, priceCacheCount, imageCount] = await Promise.all([
      db.count('books'),
      db.count('priceCache'),
      db.count('images'),
    ]);

    return { bookCount, priceCacheCount, imageCount };
  }

  async clearAllData(): Promise<void> {
    const db = await this.dbPromise;
    await Promise.all([
      db.clear('books'),
      db.clear('priceCache'),
      db.clear('images'),
    ]);
    console.log('[OfflineDB] Cleared all offline data');
  }
}

// Singleton instance
let offlineDB: OfflineDB | null = null;

export function getOfflineDB(): OfflineDB {
  if (!offlineDB) {
    offlineDB = new OfflineDB();
  }
  return offlineDB;
}

export type { BookRecord, PriceCacheRecord };
