import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import {
  type User,
  type InsertUser,
  type ApiCredentials,
  type InsertApiCredentials,
  type Book,
  type InsertBook,
  type Listing,
  type InsertListing,
  type InventoryItem,
  type InsertInventoryItem,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class SQLiteStorage implements IStorage {
  private db: Database.Database;

  constructor(dbPath: string = "isbn-scout.db") {
    this.db = new Database(dbPath);
    this.db.pragma("foreign_keys = ON");
    this.initDatabase();
  }

  private initDatabase() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        subscriptionTier TEXT NOT NULL DEFAULT 'trial',
        subscriptionStatus TEXT NOT NULL DEFAULT 'trialing',
        subscriptionExpiresAt TEXT,
        trialStartedAt TEXT,
        trialEndsAt TEXT,
        stripeCustomerId TEXT,
        stripeSubscriptionId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    `);

    // Migration: Add trial fields to existing users table if they don't exist
    const tableInfo = this.db.pragma("table_info(users)");
    const columns = (tableInfo as any[]).map((col: any) => col.name);

    if (!columns.includes("trialStartedAt")) {
      this.db.exec("ALTER TABLE users ADD COLUMN trialStartedAt TEXT");
      console.log("[SQLite] Added trialStartedAt column to users table");
    }

    if (!columns.includes("trialEndsAt")) {
      this.db.exec("ALTER TABLE users ADD COLUMN trialEndsAt TEXT");
      console.log("[SQLite] Added trialEndsAt column to users table");
    }

    // API Credentials table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_credentials (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        platform TEXT NOT NULL,
        credentials TEXT NOT NULL,
        isActive TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(userId, platform)
      )
    `);

    // Books table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        isbn TEXT NOT NULL,
        title TEXT NOT NULL,
        author TEXT,
        thumbnail TEXT,
        amazonPrice TEXT,
        ebayPrice TEXT,
        yourCost TEXT,
        profit TEXT,
        status TEXT NOT NULL,
        scannedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create index on ISBN for faster lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn)
    `);

    // Listings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS listings (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        bookId TEXT NOT NULL,
        platform TEXT NOT NULL,
        platformListingId TEXT,
        price TEXT NOT NULL,
        condition TEXT NOT NULL,
        description TEXT,
        quantity TEXT NOT NULL,
        status TEXT NOT NULL,
        errorMessage TEXT,
        listedAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
      )
    `);

    // Inventory Items table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        bookId TEXT NOT NULL,
        listingId TEXT,
        sku TEXT,
        purchaseDate TEXT NOT NULL,
        purchaseCost TEXT NOT NULL,
        purchaseSource TEXT,
        condition TEXT NOT NULL,
        location TEXT,
        soldDate TEXT,
        salePrice TEXT,
        soldPlatform TEXT,
        actualProfit TEXT,
        status TEXT NOT NULL DEFAULT 'in_stock',
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE SET NULL
      )
    `);

    // Create indices for inventory_items
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(userId)
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_inventory_items_book_id ON inventory_items(bookId)
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status)
    `);
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_inventory_items_listing_id ON inventory_items(listingId)
    `);

    // API Usage tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_usage (
        id TEXT PRIMARY KEY,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        callCount INTEGER NOT NULL DEFAULT 0,
        UNIQUE(service, date)
      )
    `);

    // Create or update default user
    const defaultUser = this.db.prepare("SELECT * FROM users WHERE id = ?").get("default-user");
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    if (!defaultUser) {
      this.db.prepare(`
        INSERT INTO users (
          id, username, email, password, subscriptionTier, subscriptionStatus,
          subscriptionExpiresAt, trialStartedAt, trialEndsAt, stripeCustomerId, stripeSubscriptionId, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        "default-user",
        "default",
        "default@isbnscout.com",
        "default-password-change-in-production",
        "trial",
        "trialing",
        null,
        now.toISOString(),
        trialEnds.toISOString(),
        null,
        null,
        now.toISOString(),
        now.toISOString()
      );
      console.log("[SQLite] Created default user with 14-day trial");
    } else if ((defaultUser as any).subscriptionTier === "free" || !(defaultUser as any).trialEndsAt) {
      // Migrate existing users from free tier to trial
      this.db.prepare(`
        UPDATE users SET
          subscriptionTier = ?,
          subscriptionStatus = ?,
          trialStartedAt = ?,
          trialEndsAt = ?,
          updatedAt = ?
        WHERE id = ?
      `).run(
        "trial",
        "trialing",
        now.toISOString(),
        trialEnds.toISOString(),
        now.toISOString(),
        "default-user"
      );
      console.log("[SQLite] Migrated default user to 14-day trial");
    }

    console.log("[SQLite] Database initialized successfully");
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE id = ?");
    const row = stmt.get(id) as any;
    return row ? this.deserializeUser(row) : undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE username = ?");
    const row = stmt.get(username) as any;
    return row ? this.deserializeUser(row) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE email = ?");
    const row = stmt.get(email) as any;
    return row ? this.deserializeUser(row) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    const user: User = {
      ...insertUser,
      id,
      subscriptionTier: "trial",
      subscriptionStatus: "trialing",
      subscriptionExpiresAt: null,
      trialStartedAt: now,
      trialEndsAt: trialEnds,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, username, email, password, subscriptionTier, subscriptionStatus,
        subscriptionExpiresAt, trialStartedAt, trialEndsAt, stripeCustomerId, stripeSubscriptionId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user.id,
      user.username,
      user.email,
      user.password,
      user.subscriptionTier,
      user.subscriptionStatus,
      user.subscriptionExpiresAt,
      user.trialStartedAt?.toISOString(),
      user.trialEndsAt?.toISOString(),
      user.stripeCustomerId,
      user.stripeSubscriptionId,
      now.toISOString(),
      now.toISOString()
    );

    return user;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE users SET
        username = ?, email = ?, subscriptionTier = ?, subscriptionStatus = ?,
        subscriptionExpiresAt = ?, trialStartedAt = ?, trialEndsAt = ?, stripeCustomerId = ?, stripeSubscriptionId = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedUser.username,
      updatedUser.email,
      updatedUser.subscriptionTier,
      updatedUser.subscriptionStatus,
      updatedUser.subscriptionExpiresAt?.toISOString() || null,
      updatedUser.trialStartedAt?.toISOString() || null,
      updatedUser.trialEndsAt?.toISOString() || null,
      updatedUser.stripeCustomerId,
      updatedUser.stripeSubscriptionId,
      now,
      id
    );

    return updatedUser;
  }

  // API Credentials methods
  async getApiCredentials(userId: string, platform: string): Promise<ApiCredentials | undefined> {
    const stmt = this.db.prepare("SELECT * FROM api_credentials WHERE userId = ? AND platform = ?");
    const row = stmt.get(userId, platform) as any;
    return row ? this.deserializeApiCredentials(row) : undefined;
  }

  async saveApiCredentials(userId: string, platform: string, credentials: any): Promise<ApiCredentials> {
    const existing = await this.getApiCredentials(userId, platform);
    const id = existing?.id || randomUUID();
    const now = new Date().toISOString();

    if (existing) {
      const stmt = this.db.prepare(`
        UPDATE api_credentials SET credentials = ?, updatedAt = ? WHERE id = ?
      `);
      stmt.run(JSON.stringify(credentials), now, id);
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO api_credentials (id, userId, platform, credentials, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, userId, platform, JSON.stringify(credentials), "true", now, now);
    }

    return {
      id,
      userId,
      platform,
      credentials,
      isActive: "true",
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  // Book methods
  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO books (
        id, userId, isbn, title, author, thumbnail, amazonPrice, ebayPrice,
        yourCost, profit, status, scannedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      insertBook.userId,
      insertBook.isbn,
      insertBook.title,
      insertBook.author || null,
      insertBook.thumbnail || null,
      insertBook.amazonPrice || null,
      insertBook.ebayPrice || null,
      insertBook.yourCost || null,
      insertBook.profit || null,
      insertBook.status,
      now
    );

    return {
      id,
      userId: insertBook.userId,
      isbn: insertBook.isbn,
      title: insertBook.title,
      author: insertBook.author || null,
      thumbnail: insertBook.thumbnail || null,
      amazonPrice: insertBook.amazonPrice || null,
      ebayPrice: insertBook.ebayPrice || null,
      yourCost: insertBook.yourCost || null,
      profit: insertBook.profit || null,
      status: insertBook.status,
      scannedAt: new Date(now),
    };
  }

  async getBooks(userId: string): Promise<Book[]> {
    const stmt = this.db.prepare("SELECT * FROM books WHERE userId = ? ORDER BY scannedAt DESC");
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.deserializeBook(row));
  }

  async getBookById(id: string): Promise<Book | undefined> {
    const stmt = this.db.prepare("SELECT * FROM books WHERE id = ?");
    const row = stmt.get(id) as any;
    return row ? this.deserializeBook(row) : undefined;
  }

  async getBookByISBN(isbn: string): Promise<Book | undefined> {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    const stmt = this.db.prepare("SELECT * FROM books WHERE REPLACE(REPLACE(isbn, '-', ''), ' ', '') = ?");
    const row = stmt.get(cleanIsbn) as any;
    return row ? this.deserializeBook(row) : undefined;
  }

  async updateBook(isbn: string, updates: Partial<Omit<Book, 'id' | 'userId' | 'isbn' | 'scannedAt'>>): Promise<Book | undefined> {
    const book = await this.getBookByISBN(isbn);
    if (!book) return undefined;

    const updatedBook = { ...book, ...updates };

    const stmt = this.db.prepare(`
      UPDATE books SET
        title = ?, author = ?, thumbnail = ?, amazonPrice = ?, ebayPrice = ?,
        yourCost = ?, profit = ?, status = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedBook.title,
      updatedBook.author,
      updatedBook.thumbnail,
      updatedBook.amazonPrice,
      updatedBook.ebayPrice,
      updatedBook.yourCost,
      updatedBook.profit,
      updatedBook.status,
      book.id
    );

    return updatedBook;
  }

  // Listing methods
  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO listings (
        id, userId, bookId, platform, platformListingId, price, condition,
        description, quantity, status, errorMessage, listedAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      insertListing.userId,
      insertListing.bookId,
      insertListing.platform,
      insertListing.platformListingId || null,
      insertListing.price,
      insertListing.condition,
      insertListing.description || null,
      insertListing.quantity || "1",
      insertListing.status,
      insertListing.errorMessage || null,
      now,
      now
    );

    return {
      id,
      userId: insertListing.userId,
      bookId: insertListing.bookId,
      platform: insertListing.platform,
      platformListingId: insertListing.platformListingId || null,
      price: insertListing.price,
      condition: insertListing.condition,
      description: insertListing.description || null,
      quantity: insertListing.quantity || "1",
      status: insertListing.status,
      errorMessage: insertListing.errorMessage || null,
      listedAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async getListings(userId: string): Promise<Listing[]> {
    const stmt = this.db.prepare("SELECT * FROM listings WHERE userId = ? ORDER BY listedAt DESC");
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.deserializeListing(row));
  }

  async getListingsByBook(userId: string, bookId: string): Promise<Listing[]> {
    const stmt = this.db.prepare("SELECT * FROM listings WHERE userId = ? AND bookId = ? ORDER BY listedAt DESC");
    const rows = stmt.all(userId, bookId) as any[];
    return rows.map(row => this.deserializeListing(row));
  }

  async updateListingStatus(id: string, status: string, errorMessage?: string): Promise<Listing | undefined> {
    const stmt = this.db.prepare("SELECT * FROM listings WHERE id = ?");
    const row = stmt.get(id) as any;
    if (!row) return undefined;

    const now = new Date().toISOString();
    const updateStmt = this.db.prepare(`
      UPDATE listings SET status = ?, errorMessage = ?, updatedAt = ? WHERE id = ?
    `);
    updateStmt.run(status, errorMessage || null, now, id);

    const listing = this.deserializeListing(row);
    listing.status = status;
    listing.errorMessage = errorMessage || null;
    listing.updatedAt = new Date(now);
    return listing;
  }

  // Helper methods to convert database rows to typed objects
  private deserializeUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      subscriptionTier: row.subscriptionTier,
      subscriptionStatus: row.subscriptionStatus,
      subscriptionExpiresAt: row.subscriptionExpiresAt ? new Date(row.subscriptionExpiresAt) : null,
      trialStartedAt: row.trialStartedAt ? new Date(row.trialStartedAt) : null,
      trialEndsAt: row.trialEndsAt ? new Date(row.trialEndsAt) : null,
      stripeCustomerId: row.stripeCustomerId,
      stripeSubscriptionId: row.stripeSubscriptionId,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private deserializeApiCredentials(row: any): ApiCredentials {
    return {
      id: row.id,
      userId: row.userId,
      platform: row.platform,
      credentials: JSON.parse(row.credentials),
      isActive: row.isActive,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  private deserializeBook(row: any): Book {
    return {
      id: row.id,
      userId: row.userId,
      isbn: row.isbn,
      title: row.title,
      author: row.author,
      thumbnail: row.thumbnail,
      amazonPrice: row.amazonPrice,
      ebayPrice: row.ebayPrice,
      yourCost: row.yourCost,
      profit: row.profit,
      status: row.status,
      scannedAt: new Date(row.scannedAt),
    };
  }

  private deserializeListing(row: any): Listing {
    return {
      id: row.id,
      userId: row.userId,
      bookId: row.bookId,
      platform: row.platform,
      platformListingId: row.platformListingId,
      price: row.price,
      condition: row.condition,
      description: row.description,
      quantity: row.quantity,
      status: row.status,
      errorMessage: row.errorMessage,
      listedAt: new Date(row.listedAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // API Usage tracking methods
  incrementApiCall(service: string): void {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const id = `${service}-${today}`;

    const existing = this.db.prepare("SELECT * FROM api_usage WHERE id = ?").get(id);

    if (existing) {
      this.db.prepare("UPDATE api_usage SET callCount = callCount + 1 WHERE id = ?").run(id);
    } else {
      this.db.prepare(`
        INSERT INTO api_usage (id, service, date, callCount) VALUES (?, ?, ?, ?)
      `).run(id, service, today, 1);
    }
  }

  getApiUsage(service: string, date?: string): { service: string; date: string; callCount: number } | undefined {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const id = `${service}-${targetDate}`;
    const row = this.db.prepare("SELECT * FROM api_usage WHERE id = ?").get(id) as any;

    if (!row) return undefined;

    return {
      service: row.service,
      date: row.date,
      callCount: row.callCount
    };
  }

  getAllApiUsage(): Array<{ service: string; date: string; callCount: number }> {
    const rows = this.db.prepare("SELECT * FROM api_usage ORDER BY date DESC, service").all() as any[];
    return rows.map(row => ({
      service: row.service,
      date: row.date,
      callCount: row.callCount
    }));
  }

  // Inventory Items methods
  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO inventory_items (
        id, userId, bookId, listingId, sku, purchaseDate, purchaseCost,
        purchaseSource, condition, location, soldDate, salePrice,
        soldPlatform, actualProfit, status, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      insertItem.userId,
      insertItem.bookId,
      insertItem.listingId || null,
      insertItem.sku || null,
      insertItem.purchaseDate.toISOString(),
      insertItem.purchaseCost,
      insertItem.purchaseSource || null,
      insertItem.condition,
      insertItem.location || null,
      insertItem.soldDate?.toISOString() || null,
      insertItem.salePrice || null,
      insertItem.soldPlatform || null,
      insertItem.actualProfit || null,
      insertItem.status || "in_stock",
      insertItem.notes || null,
      now,
      now
    );

    return {
      id,
      userId: insertItem.userId,
      bookId: insertItem.bookId,
      listingId: insertItem.listingId || null,
      sku: insertItem.sku || null,
      purchaseDate: insertItem.purchaseDate,
      purchaseCost: insertItem.purchaseCost,
      purchaseSource: insertItem.purchaseSource || null,
      condition: insertItem.condition,
      location: insertItem.location || null,
      soldDate: insertItem.soldDate || null,
      salePrice: insertItem.salePrice || null,
      soldPlatform: insertItem.soldPlatform || null,
      actualProfit: insertItem.actualProfit || null,
      status: insertItem.status || "in_stock",
      notes: insertItem.notes || null,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  async getInventoryItems(userId: string): Promise<InventoryItem[]> {
    const stmt = this.db.prepare("SELECT * FROM inventory_items WHERE userId = ? ORDER BY createdAt DESC");
    const rows = stmt.all(userId) as any[];
    return rows.map(row => this.deserializeInventoryItem(row));
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
    const stmt = this.db.prepare("SELECT * FROM inventory_items WHERE id = ?");
    const row = stmt.get(id) as any;
    return row ? this.deserializeInventoryItem(row) : undefined;
  }

  async getInventoryItemsByBook(userId: string, bookId: string): Promise<InventoryItem[]> {
    const stmt = this.db.prepare("SELECT * FROM inventory_items WHERE userId = ? AND bookId = ? ORDER BY createdAt DESC");
    const rows = stmt.all(userId, bookId) as any[];
    return rows.map(row => this.deserializeInventoryItem(row));
  }

  async updateInventoryItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'userId' | 'createdAt'>>): Promise<InventoryItem | undefined> {
    const item = await this.getInventoryItemById(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...updates };
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE inventory_items SET
        bookId = ?, listingId = ?, sku = ?, purchaseDate = ?, purchaseCost = ?,
        purchaseSource = ?, condition = ?, location = ?, soldDate = ?,
        salePrice = ?, soldPlatform = ?, actualProfit = ?, status = ?,
        notes = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      updatedItem.bookId,
      updatedItem.listingId,
      updatedItem.sku,
      updatedItem.purchaseDate.toISOString(),
      updatedItem.purchaseCost,
      updatedItem.purchaseSource,
      updatedItem.condition,
      updatedItem.location,
      updatedItem.soldDate?.toISOString() || null,
      updatedItem.salePrice,
      updatedItem.soldPlatform,
      updatedItem.actualProfit,
      updatedItem.status,
      updatedItem.notes,
      now,
      id
    );

    updatedItem.updatedAt = new Date(now);
    return updatedItem;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const stmt = this.db.prepare("DELETE FROM inventory_items WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private deserializeInventoryItem(row: any): InventoryItem {
    return {
      id: row.id,
      userId: row.userId,
      bookId: row.bookId,
      listingId: row.listingId,
      sku: row.sku,
      purchaseDate: new Date(row.purchaseDate),
      purchaseCost: row.purchaseCost,
      purchaseSource: row.purchaseSource,
      condition: row.condition,
      location: row.location,
      soldDate: row.soldDate ? new Date(row.soldDate) : null,
      salePrice: row.salePrice,
      soldPlatform: row.soldPlatform,
      actualProfit: row.actualProfit,
      status: row.status,
      notes: row.notes,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }

  // Close database connection
  close() {
    this.db.close();
  }
}
