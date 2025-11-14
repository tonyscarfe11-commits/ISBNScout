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
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  getListingsByBook(userId: string, bookId: string): Promise<Listing[]>;
  updateListingStatus(id: string, status: string, errorMessage?: string): Promise<Listing | undefined>;

  // Inventory Items
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  getInventoryItems(userId: string): Promise<InventoryItem[]>;
  getInventoryItemById(id: string): Promise<InventoryItem | undefined>;
  getInventoryItemsByBook(userId: string, bookId: string): Promise<InventoryItem[]>;
  updateInventoryItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'userId' | 'createdAt'>>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private apiCredentials: Map<string, ApiCredentials>;
  private books: Map<string, Book>;
  private listings: Map<string, Listing>;
  private inventoryItems: Map<string, InventoryItem>;

  constructor() {
    this.users = new Map();
    this.apiCredentials = new Map();
    this.books = new Map();
    this.listings = new Map();
    this.inventoryItems = new Map();
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      subscriptionTier: "free",
      subscriptionStatus: "active",
      subscriptionExpiresAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
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
}

// Import SQLiteStorage
import { SQLiteStorage } from "./sqlite-storage";

// Use SQLite for persistent storage
export const storage = new SQLiteStorage();
