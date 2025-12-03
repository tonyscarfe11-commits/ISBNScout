import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import {
  type User,
  type InsertUser,
  type ApiCredentials,
  type InsertApiCredentials,
  type Book,
  type InsertBook,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class SQLiteStorage implements IStorage {
  public db: Database.Database;

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
        referredByAffiliateId TEXT,
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

    if (!columns.includes("referredByAffiliateId")) {
      this.db.exec("ALTER TABLE users ADD COLUMN referredByAffiliateId TEXT");
      console.log("[SQLite] Added referredByAffiliateId column to users table");
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

    // Auth tokens table for persistent authentication
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        token TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create index for faster token lookups and cleanup
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires ON auth_tokens(expiresAt)
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
    } else if (!(defaultUser as any).trialEndsAt) {
      // Migrate existing users without trial dates
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

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const stmt = this.db.prepare("SELECT * FROM users WHERE stripe_customer_id = ?");
    const row = stmt.get(stripeCustomerId) as any;
    return row ? this.deserializeUser(row) : undefined;
  }

  async getUsersWithTrialExpiringBetween(startDate: Date, endDate: Date): Promise<User[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM users
      WHERE subscription_tier = 'trial'
        AND trial_ends_at >= ?
        AND trial_ends_at <= ?
    `);
    const rows = stmt.all(startDate.toISOString(), endDate.toISOString()) as any[];
    return rows.map(row => this.deserializeUser(row));
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
      referredByAffiliateId: null,
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO users (
        id, username, email, password, subscriptionTier, subscriptionStatus,
        subscriptionExpiresAt, trialStartedAt, trialEndsAt, stripeCustomerId, stripeSubscriptionId, referredByAffiliateId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      user.referredByAffiliateId,
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

  // Deserialize methods - convert SQLite rows to typed objects
  private deserializeUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      subscriptionTier: row.subscriptionTier || row.subscription_tier,
      subscriptionStatus: row.subscriptionStatus || row.subscription_status,
      subscriptionExpiresAt: row.subscriptionExpiresAt || row.subscription_expires_at ? new Date(row.subscriptionExpiresAt || row.subscription_expires_at) : null,
      trialStartedAt: row.trialStartedAt || row.trial_started_at ? new Date(row.trialStartedAt || row.trial_started_at) : null,
      trialEndsAt: row.trialEndsAt || row.trial_ends_at ? new Date(row.trialEndsAt || row.trial_ends_at) : null,
      stripeCustomerId: row.stripeCustomerId || row.stripe_customer_id || null,
      stripeSubscriptionId: row.stripeSubscriptionId || row.stripe_subscription_id || null,
      referredByAffiliateId: row.referredByAffiliateId || row.referred_by_affiliate_id || null,
      createdAt: new Date(row.createdAt || row.created_at),
      updatedAt: new Date(row.updatedAt || row.updated_at),
    };
  }

  private deserializeApiCredentials(row: any): ApiCredentials {
    return {
      id: row.id,
      userId: row.userId || row.user_id,
      platform: row.platform,
      credentials: typeof row.credentials === 'string' ? JSON.parse(row.credentials) : row.credentials,
      isActive: row.isActive || row.is_active,
      createdAt: new Date(row.createdAt || row.created_at),
      updatedAt: new Date(row.updatedAt || row.updated_at),
    };
  }

  private deserializeBook(row: any): Book {
    return {
      id: row.id,
      userId: row.userId || row.user_id,
      isbn: row.isbn,
      title: row.title,
      author: row.author || null,
      thumbnail: row.thumbnail || null,
      amazonPrice: row.amazonPrice || row.amazon_price || null,
      ebayPrice: row.ebayPrice || row.ebay_price || null,
      yourCost: row.yourCost || row.your_cost || null,
      profit: row.profit || null,
      status: row.status,
      scannedAt: new Date(row.scannedAt || row.scanned_at),
    };
  }

  // Auth token methods
  async saveAuthToken(token: string, userId: string, type: 'user' | 'affiliate', expiresAt: Date): Promise<void> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO auth_tokens (token, userId, type, expiresAt, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(token, userId, type, expiresAt.toISOString(), now);
  }

  async getAuthToken(token: string): Promise<{ userId: string; type: string; expiresAt: Date } | null> {
    const stmt = this.db.prepare("SELECT * FROM auth_tokens WHERE token = ?");
    const row = stmt.get(token) as any;
    if (!row) return null;

    return {
      userId: row.userId,
      type: row.type,
      expiresAt: new Date(row.expiresAt),
    };
  }

  async deleteAuthToken(token: string): Promise<void> {
    const stmt = this.db.prepare("DELETE FROM auth_tokens WHERE token = ?");
    stmt.run(token);
  }

  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date().toISOString();
    const stmt = this.db.prepare("DELETE FROM auth_tokens WHERE expiresAt < ?");
    const result = stmt.run(now);
    return result.changes;
  }

  // Close database connection
  close() {
    this.db.close();
  }
}
