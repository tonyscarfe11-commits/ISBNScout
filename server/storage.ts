import {
  type User,
  type InsertUser,
  type ApiCredentials,
  type InsertApiCredentials,
  type Book,
  type InsertBook,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUsersWithTrialExpiringBetween(startDate: Date, endDate: Date): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<User | undefined>;

  // API Credentials
  getApiCredentials(userId: string, platform: string): Promise<ApiCredentials | undefined>;
  saveApiCredentials(userId: string, platform: string, credentials: any): Promise<ApiCredentials>;

  // Books
  createBook(book: InsertBook): Promise<Book>;
  getBooks(userId: string): Promise<Book[]>;
  getBookById(id: string): Promise<Book | undefined>;
  getBookByISBN(isbn: string): Promise<Book | undefined>;
  updateBook(isbn: string, updates: Partial<Omit<Book, 'id' | 'userId' | 'isbn' | 'scannedAt'>>): Promise<Book | undefined>;

  // Auth tokens
  saveAuthToken(token: string, userId: string, type: 'user' | 'affiliate', expiresAt: Date): Promise<void>;
  getAuthToken(token: string): Promise<{ userId: string; type: string; expiresAt: Date } | null>;
  deleteAuthToken(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private apiCredentials: Map<string, ApiCredentials>;
  private books: Map<string, Book>;
  private authTokens: Map<string, { userId: string; type: 'user' | 'affiliate'; expiresAt: Date }>;

  constructor() {
    this.users = new Map();
    this.apiCredentials = new Map();
    this.books = new Map();
    this.authTokens = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stripeCustomerId === stripeCustomerId,
    );
  }

  async getUsersWithTrialExpiringBetween(startDate: Date, endDate: Date): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.subscriptionTier === 'trial' &&
                user.trialEndsAt &&
                user.trialEndsAt >= startDate &&
                user.trialEndsAt <= endDate
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      subscriptionTier: "trial",
      subscriptionStatus: "active",
      subscriptionExpiresAt: null,
      trialStartedAt: now,
      trialEndsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      referredByAffiliateId: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // API Credentials
  async getApiCredentials(userId: string, platform: string): Promise<ApiCredentials | undefined> {
    return Array.from(this.apiCredentials.values()).find(
      (cred) => cred.userId === userId && cred.platform === platform && cred.isActive === "true",
    );
  }

  async saveApiCredentials(userId: string, platform: string, credentials: any): Promise<ApiCredentials> {
    // Deactivate existing credentials for this platform
    Array.from(this.apiCredentials.values())
      .filter((cred) => cred.userId === userId && cred.platform === platform)
      .forEach((cred) => {
        cred.isActive = "false";
      });

    const id = randomUUID();
    const now = new Date();
    const apiCred: ApiCredentials = {
      id,
      userId,
      platform,
      credentials,
      isActive: "true",
      createdAt: now,
      updatedAt: now,
    };
    this.apiCredentials.set(id, apiCred);
    return apiCred;
  }

  // Books
  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const book: Book = {
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
      scannedAt: new Date(),
    };
    this.books.set(id, book);
    return book;
  }

  async getBooks(userId: string): Promise<Book[]> {
    return Array.from(this.books.values())
      .filter((book) => book.userId === userId)
      .sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }

  async getBookById(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBookByISBN(isbn: string): Promise<Book | undefined> {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    return Array.from(this.books.values()).find(
      (book) => book.isbn.replace(/[-\s]/g, "") === cleanIsbn
    );
  }

  async updateBook(isbn: string, updates: Partial<Omit<Book, 'id' | 'userId' | 'isbn' | 'scannedAt'>>): Promise<Book | undefined> {
    const book = await this.getBookByISBN(isbn);
    if (!book) {
      return undefined;
    }

    const updatedBook: Book = {
      ...book,
      ...updates,
    };

    this.books.set(book.id, updatedBook);
    return updatedBook;
  }

  // Auth token methods
  async saveAuthToken(token: string, userId: string, type: 'user' | 'affiliate', expiresAt: Date): Promise<void> {
    this.authTokens.set(token, { userId, type, expiresAt });
  }

  async getAuthToken(token: string): Promise<{ userId: string; type: string; expiresAt: Date } | null> {
    const data = this.authTokens.get(token);
    if (!data) return null;
    if (new Date() > data.expiresAt) {
      this.authTokens.delete(token);
      return null;
    }
    return data;
  }

  async deleteAuthToken(token: string): Promise<void> {
    this.authTokens.delete(token);
  }

  async cleanupExpiredTokens(): Promise<number> {
    const now = new Date();
    let count = 0;
    const entries = Array.from(this.authTokens.entries());
    for (const [token, data] of entries) {
      if (now > data.expiresAt) {
        this.authTokens.delete(token);
        count++;
      }
    }
    return count;
  }
}

// Import storage implementations
import { SQLiteStorage } from "./sqlite-storage";
import { PostgresStorage } from "./postgres-storage";
import { HybridStorage } from "./hybrid-storage";

// Use HybridStorage for offline-first with cloud sync
// Use simple MemStorage for tests to avoid async sync issues
export const storage = process.env.NODE_ENV === 'test'
  ? new MemStorage()
  : new HybridStorage(
      "isbn-scout-offline.db",
      process.env.DATABASE_URL
    );

if (process.env.NODE_ENV === 'test') {
  console.log('[Storage] Using MemStorage for tests (in-memory, no sync)');
} else {
  console.log(
    `[Storage] Using HybridStorage - SQLite (offline) ${process.env.DATABASE_URL ? "+ PostgreSQL sync (cloud)" : "(local only)"}`
  );
}
