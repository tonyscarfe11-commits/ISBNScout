import Database from "better-sqlite3";

/**
 * Price Cache System for Offline Book Scanning
 *
 * Caches all price lookups locally so they work offline
 * Builds personal database over time
 * Provides smart fallbacks for unknown books
 */

export interface CachedPrice {
  isbn: string;
  title: string | null;
  author: string | null;
  publisher: string | null;
  thumbnail: string | null;
  ebayPrice: number | null;
  amazonPrice: number | null;
  cachedAt: Date;
  confidence: "high" | "medium" | "low";
  source: "api" | "estimate" | "heuristic";
}

export interface PriceLookupResult {
  isbn: string;
  title: string | null;
  author: string | null;
  publisher: string | null;
  thumbnail: string | null;
  ebayPrice: number | null;
  amazonPrice: number | null;
  estimatedProfit: number | null;
  confidence: "high" | "medium" | "low";
  recommendation: "buy" | "maybe" | "skip" | "unknown";
  reason: string;
  isCached: boolean;
}

export class PriceCache {
  private db: Database.Database;

  // Profitable authors database (works offline!)
  private profitableAuthors = new Set([
    // Fantasy/Sci-Fi
    "j.r.r. tolkien",
    "j.k. rowling",
    "george r.r. martin",
    "terry pratchett",
    "neil gaiman",
    "brandon sanderson",
    "patrick rothfuss",

    // Horror/Thriller
    "stephen king",
    "dean koontz",
    "james patterson",
    "lee child",
    "michael connelly",

    // Classics
    "jane austen",
    "charles dickens",
    "f. scott fitzgerald",
    "ernest hemingway",
    "george orwell",
    "harper lee",
    "mark twain",

    // Modern Fiction
    "dan brown",
    "john grisham",
    "malcolm gladwell",
    "yuval noah harari",
    "gillian flynn",
    "paula hawkins",

    // Children's
    "roald dahl",
    "dr. seuss",
    "jeff kinney",
    "rick riordan",
  ]);

  // Collectible publishers (works offline!)
  private collectiblePublishers = new Set([
    "folio society",
    "franklin library",
    "easton press",
    "limited editions club",
    "heritage press",
    "penguin classics",
    "everyman's library",
  ]);

  constructor(dbPath: string = "isbn-scout.db") {
    this.db = new Database(dbPath);
    this.initCache();
  }

  private initCache() {
    // Price cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS price_cache (
        isbn TEXT PRIMARY KEY,
        title TEXT,
        author TEXT,
        publisher TEXT,
        thumbnail TEXT,
        ebayPrice REAL,
        amazonPrice REAL,
        cachedAt TEXT NOT NULL,
        confidence TEXT NOT NULL,
        source TEXT NOT NULL
      )
    `);
    
    // Add thumbnail column if it doesn't exist (migration for existing DBs)
    try {
      this.db.exec(`ALTER TABLE price_cache ADD COLUMN thumbnail TEXT`);
    } catch (e) {
      // Column already exists, ignore
    }

    // Index for faster lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_price_cache_author ON price_cache(author)
    `);

    console.log("[PriceCache] Initialized");
  }

  /**
   * Cache a price lookup
   */
  cachePrice(data: {
    isbn: string;
    title: string | null;
    author: string | null;
    publisher: string | null;
    thumbnail?: string | null;
    ebayPrice: number | null;
    amazonPrice: number | null;
    source?: "api" | "estimate" | "heuristic";
  }) {
    const now = new Date().toISOString();
    const confidence = data.source === "api" ? "high" : data.source === "estimate" ? "medium" : "low";

    this.db
      .prepare(
        `INSERT OR REPLACE INTO price_cache
         (isbn, title, author, publisher, thumbnail, ebayPrice, amazonPrice, cachedAt, confidence, source)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.isbn,
        data.title,
        data.author,
        data.publisher,
        data.thumbnail || null,
        data.ebayPrice,
        data.amazonPrice,
        now,
        confidence,
        data.source || "api"
      );
  }

  /**
   * Get cached price (works offline!)
   */
  getCachedPrice(isbn: string): CachedPrice | null {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");

    const row = this.db
      .prepare("SELECT * FROM price_cache WHERE isbn = ?")
      .get(cleanIsbn) as any;

    if (!row) return null;

    return {
      isbn: row.isbn,
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      thumbnail: row.thumbnail || null,
      ebayPrice: row.ebayPrice,
      amazonPrice: row.amazonPrice,
      cachedAt: new Date(row.cachedAt),
      confidence: row.confidence,
      source: row.source,
    };
  }

  /**
   * Intelligent offline price lookup
   * Uses cache, heuristics, and author database
   */
  async lookupOffline(
    isbn: string,
    bookData?: {
      title?: string;
      author?: string;
      publisher?: string;
    }
  ): Promise<PriceLookupResult> {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");

    // Step 1: Check cache (best case)
    const cached = this.getCachedPrice(cleanIsbn);
    if (cached) {
      return this.buildResult(cached, bookData, true);
    }

    // Step 2: Check if we have book metadata for heuristics
    if (!bookData?.author) {
      return {
        isbn: cleanIsbn,
        title: bookData?.title || null,
        author: null,
        publisher: null,
        thumbnail: null,
        ebayPrice: null,
        amazonPrice: null,
        estimatedProfit: null,
        confidence: "low",
        recommendation: "unknown",
        reason: "No cached data and no author info available",
        isCached: false,
      };
    }

    // Step 3: Use author heuristics
    const authorLower = bookData.author.toLowerCase();
    const publisherLower = bookData.publisher?.toLowerCase() || "";

    let estimatedPrice: number | null = null;
    let confidence: "high" | "medium" | "low" = "low";
    let recommendation: "buy" | "maybe" | "skip" | "unknown" = "unknown";
    let reason = "";

    // Check profitable authors
    if (this.profitableAuthors.has(authorLower)) {
      estimatedPrice = this.getAuthorAveragePrice(authorLower);
      confidence = "medium";
      recommendation = estimatedPrice && estimatedPrice > 5 ? "buy" : "maybe";
      reason = `Known profitable author. Similar books avg £${estimatedPrice?.toFixed(2) || "8-15"}`;
    }
    // Check collectible publishers
    else if (
      Array.from(this.collectiblePublishers).some((pub) =>
        publisherLower.includes(pub)
      )
    ) {
      estimatedPrice = 15;
      confidence = "medium";
      recommendation = "buy";
      reason = "Collectible publisher - typically valuable";
    }
    // Unknown
    else {
      estimatedPrice = null;
      confidence = "low";
      recommendation = "skip";
      reason = "Unknown author and publisher - risky offline purchase";
    }

    return {
      isbn: cleanIsbn,
      title: bookData.title || null,
      author: bookData.author,
      publisher: bookData.publisher || null,
      thumbnail: null,
      ebayPrice: estimatedPrice,
      amazonPrice: estimatedPrice ? estimatedPrice * 0.9 : null,
      estimatedProfit: estimatedPrice ? estimatedPrice - 1.5 : null, // Assume £1.50 cost
      confidence,
      recommendation,
      reason,
      isCached: false,
    };
  }

  /**
   * Get average price for similar books by this author
   */
  private getAuthorAveragePrice(authorLower: string): number | null {
    const rows = this.db
      .prepare(
        `SELECT AVG(ebayPrice) as avgPrice
         FROM price_cache
         WHERE LOWER(author) = ? AND ebayPrice IS NOT NULL`
      )
      .get(authorLower) as any;

    return rows?.avgPrice || this.getDefaultAuthorPrice(authorLower);
  }

  /**
   * Default price estimates for known authors (fallback)
   */
  private getDefaultAuthorPrice(authorLower: string): number {
    // High-value authors
    if (
      ["j.r.r. tolkien", "j.k. rowling", "stephen king"].includes(authorLower)
    ) {
      return 12;
    }

    // Medium-value authors
    if (this.profitableAuthors.has(authorLower)) {
      return 8;
    }

    // Unknown
    return 5;
  }

  /**
   * Build result from cached data
   */
  private buildResult(
    cached: CachedPrice,
    bookData?: { title?: string; author?: string; publisher?: string },
    isCached: boolean = true
  ): PriceLookupResult {
    const avgPrice = cached.ebayPrice || cached.amazonPrice || 0;
    const assumedCost = 1.5; // £1.50 average cost per book
    const estimatedProfit = avgPrice - assumedCost;

    let recommendation: "buy" | "maybe" | "skip" | "unknown" = "unknown";
    let reason = "";

    if (cached.confidence === "high") {
      if (estimatedProfit > 5) {
        recommendation = "buy";
        reason = `Cached data shows £${estimatedProfit.toFixed(2)} profit`;
      } else if (estimatedProfit > 2) {
        recommendation = "maybe";
        reason = `Modest profit of £${estimatedProfit.toFixed(2)}`;
      } else {
        recommendation = "skip";
        reason = `Low profit (£${estimatedProfit.toFixed(2)})`;
      }
    } else {
      recommendation = "maybe";
      reason = `Estimated data - actual price may vary`;
    }

    return {
      isbn: cached.isbn,
      title: bookData?.title || cached.title,
      author: bookData?.author || cached.author,
      publisher: bookData?.publisher || cached.publisher,
      thumbnail: null,
      ebayPrice: cached.ebayPrice,
      amazonPrice: cached.amazonPrice,
      estimatedProfit,
      confidence: cached.confidence,
      recommendation,
      reason,
      isCached,
    };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.db
      .prepare("SELECT COUNT(*) as count FROM price_cache")
      .get() as any;

    const highConfidence = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM price_cache WHERE confidence = 'high'"
      )
      .get() as any;

    const withPrices = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM price_cache WHERE ebayPrice IS NOT NULL"
      )
      .get() as any;

    const recentCache = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM price_cache WHERE cachedAt > datetime('now', '-7 days')"
      )
      .get() as any;

    return {
      totalCached: total.count,
      highConfidence: highConfidence.count,
      withPrices: withPrices.count,
      cachedLastWeek: recentCache.count,
    };
  }

  /**
   * Clear old cache entries (older than 30 days)
   */
  clearOldCache() {
    const result = this.db
      .prepare(
        "DELETE FROM price_cache WHERE cachedAt < datetime('now', '-30 days')"
      )
      .run();

    console.log(`[PriceCache] Cleared ${result.changes} old entries`);
    return result.changes;
  }

  /**
   * Export cache for backup
   */
  exportCache(): CachedPrice[] {
    const rows = this.db.prepare("SELECT * FROM price_cache").all() as any[];

    return rows.map((row) => ({
      isbn: row.isbn,
      title: row.title,
      author: row.author,
      publisher: row.publisher,
      ebayPrice: row.ebayPrice,
      amazonPrice: row.amazonPrice,
      cachedAt: new Date(row.cachedAt),
      confidence: row.confidence,
      source: row.source,
    }));
  }

  /**
   * Import cache from backup
   */
  importCache(data: CachedPrice[]) {
    const stmt = this.db.prepare(
      `INSERT OR REPLACE INTO price_cache
       (isbn, title, author, publisher, ebayPrice, amazonPrice, cachedAt, confidence, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const transaction = this.db.transaction((items: CachedPrice[]) => {
      for (const item of items) {
        stmt.run(
          item.isbn,
          item.title,
          item.author,
          item.publisher,
          item.ebayPrice,
          item.amazonPrice,
          item.cachedAt.toISOString(),
          item.confidence,
          item.source
        );
      }
    });

    transaction(data);
    console.log(`[PriceCache] Imported ${data.length} entries`);
  }
}

// Global instance
let priceCache: PriceCache | null = null;

export function getPriceCache(dbPath?: string): PriceCache {
  if (!priceCache) {
    priceCache = new PriceCache(dbPath);
  }
  return priceCache;
}
