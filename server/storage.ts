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
  type RepricingRule,
  type InsertRepricingRule,
  type RepricingHistory,
  type InsertRepricingHistory,
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

  // Listings
  createListing(listing: InsertListing): Promise<Listing>;
  getListings(userId: string): Promise<Listing[]>;
  getListingById(id: string): Promise<Listing | undefined>;
  getListingsByBook(userId: string, bookId: string): Promise<Listing[]>;
  updateListingStatus(id: string, status: string, errorMessage?: string): Promise<Listing | undefined>;
  updateListingPrice(id: string, newPrice: string): Promise<Listing | undefined>;

  // Inventory Items
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItems(userId: string): Promise<InventoryItem[]>;
  getInventoryItemById(id: string): Promise<InventoryItem | undefined>;
  getInventoryItemsByBook(userId: string, bookId: string): Promise<InventoryItem[]>;
  updateInventoryItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'userId' | 'createdAt'>>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string): Promise<boolean>;

  // Repricing Rules
  createRepricingRule(rule: InsertRepricingRule): Promise<RepricingRule>;
  getRepricingRules(userId: string): Promise<RepricingRule[]>;
  getRepricingRuleById(id: string): Promise<RepricingRule | undefined>;
  getActiveRulesForListing(userId: string, listingId: string, platform: string): Promise<RepricingRule[]>;
  updateRepricingRule(id: string, updates: Partial<Omit<RepricingRule, 'id' | 'userId' | 'createdAt'>>): Promise<RepricingRule | undefined>;
  deleteRepricingRule(id: string): Promise<boolean>;

  // Repricing History
  createRepricingHistory(history: InsertRepricingHistory): Promise<RepricingHistory>;
  getRepricingHistory(userId: string, listingId?: string): Promise<RepricingHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private apiCredentials: Map<string, ApiCredentials>;
  private books: Map<string, Book>;
  private listings: Map<string, Listing>;
  private inventoryItems: Map<string, InventoryItem>;
  private repricingRules: Map<string, RepricingRule>;
  private repricingHistory: Map<string, RepricingHistory>;

  constructor() {
    this.users = new Map();
    this.apiCredentials = new Map();
    this.books = new Map();
    this.listings = new Map();
    this.inventoryItems = new Map();
    this.repricingRules = new Map();
    this.repricingHistory = new Map();
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

  // Listings
  async createListing(insertListing: InsertListing): Promise<Listing> {
    const id = randomUUID();
    const now = new Date();
    const listing: Listing = {
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
      listedAt: now,
      updatedAt: now,
    };
    this.listings.set(id, listing);
    return listing;
  }

  async getListings(userId: string): Promise<Listing[]> {
    return Array.from(this.listings.values())
      .filter((listing) => listing.userId === userId)
      .sort((a, b) => b.listedAt.getTime() - a.listedAt.getTime());
  }

  async getListingById(id: string): Promise<Listing | undefined> {
    return this.listings.get(id);
  }

  async getListingsByBook(userId: string, bookId: string): Promise<Listing[]> {
    return Array.from(this.listings.values())
      .filter((listing) => listing.userId === userId && listing.bookId === bookId)
      .sort((a, b) => b.listedAt.getTime() - a.listedAt.getTime());
  }

  async updateListingStatus(id: string, status: string, errorMessage?: string): Promise<Listing | undefined> {
    const listing = this.listings.get(id);
    if (listing) {
      listing.status = status;
      listing.errorMessage = errorMessage || null;
      listing.updatedAt = new Date();
    }
    return listing;
  }

  // Inventory Items
  async createInventoryItem(insertItem: InsertInventoryItem): Promise<InventoryItem> {
    const id = randomUUID();
    const now = new Date();
    const item: InventoryItem = {
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
      createdAt: now,
      updatedAt: now,
    };
    this.inventoryItems.set(id, item);
    return item;
  }

  async getInventoryItems(userId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values())
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
    return this.inventoryItems.get(id);
  }

  async getInventoryItemsByBook(userId: string, bookId: string): Promise<InventoryItem[]> {
    return Array.from(this.inventoryItems.values())
      .filter((item) => item.userId === userId && item.bookId === bookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateInventoryItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'userId' | 'createdAt'>>): Promise<InventoryItem | undefined> {
    const item = this.inventoryItems.get(id);
    if (!item) return undefined;

    const updatedItem: InventoryItem = {
      ...item,
      ...updates,
      updatedAt: new Date(),
    };
    this.inventoryItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    return this.inventoryItems.delete(id);
  }

  async updateListingPrice(id: string, newPrice: string): Promise<Listing | undefined> {
    const listing = this.listings.get(id);
    if (!listing) return undefined;

    const updated: Listing = {
      ...listing,
      price: newPrice,
      updatedAt: new Date(),
    };
    this.listings.set(id, updated);
    return updated;
  }

  async createRepricingRule(insertRule: InsertRepricingRule): Promise<RepricingRule> {
    const id = randomUUID();
    const now = new Date();
    const rule: RepricingRule = {
      ...insertRule,
      id,
      listingId: insertRule.listingId || null,
      strategyValue: insertRule.strategyValue || null,
      isActive: insertRule.isActive || "true",
      runFrequency: insertRule.runFrequency || "hourly",
      lastRun: null,
      createdAt: now,
      updatedAt: now,
    };
    this.repricingRules.set(id, rule);
    return rule;
  }

  async getRepricingRules(userId: string): Promise<RepricingRule[]> {
    return Array.from(this.repricingRules.values())
      .filter((rule) => rule.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRepricingRuleById(id: string): Promise<RepricingRule | undefined> {
    return this.repricingRules.get(id);
  }

  async getActiveRulesForListing(
    userId: string,
    listingId: string,
    platform: string
  ): Promise<RepricingRule[]> {
    return Array.from(this.repricingRules.values())
      .filter(
        (rule) =>
          rule.userId === userId &&
          rule.isActive === "true" &&
          (rule.listingId === null || rule.listingId === listingId) &&
          (rule.platform === "all" || rule.platform === platform)
      )
      .sort((a, b) => {
        if (a.listingId && !b.listingId) return -1;
        if (!a.listingId && b.listingId) return 1;
        return 0;
      });
  }

  async updateRepricingRule(
    id: string,
    updates: Partial<Omit<RepricingRule, "id" | "userId" | "createdAt">>
  ): Promise<RepricingRule | undefined> {
    const rule = this.repricingRules.get(id);
    if (!rule) return undefined;

    const updated: RepricingRule = {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    };
    this.repricingRules.set(id, updated);
    return updated;
  }

  async deleteRepricingRule(id: string): Promise<boolean> {
    return this.repricingRules.delete(id);
  }

  async createRepricingHistory(
    insertHistory: InsertRepricingHistory
  ): Promise<RepricingHistory> {
    const id = randomUUID();
    const now = new Date();
    const history: RepricingHistory = {
      ...insertHistory,
      id,
      ruleId: insertHistory.ruleId || null,
      competitorPrice: insertHistory.competitorPrice || null,
      success: insertHistory.success || "true",
      errorMessage: insertHistory.errorMessage || null,
      createdAt: now,
    };
    this.repricingHistory.set(id, history);
    return history;
  }

  async getRepricingHistory(
    userId: string,
    listingId?: string
  ): Promise<RepricingHistory[]> {
    return Array.from(this.repricingHistory.values())
      .filter(
        (history) =>
          history.userId === userId &&
          (!listingId || history.listingId === listingId)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

// Import storage implementations
import { SQLiteStorage } from "./sqlite-storage";
import { PostgresStorage } from "./postgres-storage";
import { HybridStorage } from "./hybrid-storage";

// Use HybridStorage for offline-first with cloud sync
export const storage = new HybridStorage(
  "isbn-scout-offline.db",
  process.env.DATABASE_URL
);

console.log(
  `[Storage] Using HybridStorage - SQLite (offline) ${process.env.DATABASE_URL ? "+ PostgreSQL sync (cloud)" : "(local only)"}`
);
