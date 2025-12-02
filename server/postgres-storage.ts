import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import {
  users,
  apiCredentials,
  books,
  listings,
  inventoryItems,
  repricingRules,
  repricingHistory,
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
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  private db;

  constructor(connectionString: string) {
    const sql = neon(connectionString);
    this.db = drizzle(sql);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, stripeCustomerId))
      .limit(1);
    return result[0];
  }

  async getUsersWithTrialExpiringBetween(startDate: Date, endDate: Date): Promise<User[]> {
    const result = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.subscriptionTier, 'trial'),
          gte(users.trialEndsAt, startDate),
          lte(users.trialEndsAt, endDate)
        )
      );
    return result;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    
    const result = await this.db
      .insert(users)
      .values({
        ...insertUser,
        subscriptionTier: "trial",
        subscriptionStatus: "trialing",
        trialStartedAt: now,
        trialEndsAt: trialEnds,
        subscriptionExpiresAt: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      })
      .returning();
    return result[0];
  }

  async updateUser(
    id: string,
    updates: Partial<Omit<User, "id" | "password">>
  ): Promise<User | undefined> {
    const result = await this.db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // API Credentials
  async getApiCredentials(
    userId: string,
    platform: string
  ): Promise<ApiCredentials | undefined> {
    const result = await this.db
      .select()
      .from(apiCredentials)
      .where(
        and(
          eq(apiCredentials.userId, userId),
          eq(apiCredentials.platform, platform),
          eq(apiCredentials.isActive, "true")
        )
      )
      .limit(1);
    return result[0];
  }

  async saveApiCredentials(
    userId: string,
    platform: string,
    credentials: any
  ): Promise<ApiCredentials> {
    // Deactivate existing credentials
    await this.db
      .update(apiCredentials)
      .set({ isActive: "false", updatedAt: new Date() })
      .where(
        and(
          eq(apiCredentials.userId, userId),
          eq(apiCredentials.platform, platform)
        )
      );

    // Insert new credentials
    const result = await this.db
      .insert(apiCredentials)
      .values({
        userId,
        platform,
        credentials,
        isActive: "true",
      })
      .returning();
    return result[0];
  }

  // Books
  async createBook(insertBook: InsertBook): Promise<Book> {
    const result = await this.db.insert(books).values(insertBook).returning();
    return result[0];
  }

  async getBooks(userId: string): Promise<Book[]> {
    try {
      const result = await this.db
        .select()
        .from(books)
        .where(eq(books.userId, userId))
        .orderBy(desc(books.scannedAt));
      return result || [];
    } catch (error) {
      console.error("[PostgresStorage] Error in getBooks:", error);
      return [];
    }
  }

  async getBookById(id: string): Promise<Book | undefined> {
    const result = await this.db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);
    return result[0];
  }

  async getBookByISBN(isbn: string): Promise<Book | undefined> {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    const result = await this.db
      .select()
      .from(books)
      .where(eq(books.isbn, cleanIsbn))
      .limit(1);
    return result[0];
  }

  async updateBook(
    isbn: string,
    updates: Partial<Omit<Book, "id" | "userId" | "isbn" | "scannedAt">>
  ): Promise<Book | undefined> {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    const result = await this.db
      .update(books)
      .set(updates)
      .where(eq(books.isbn, cleanIsbn))
      .returning();
    return result[0];
  }

  // Listings
  async createListing(insertListing: InsertListing): Promise<Listing> {
    const result = await this.db
      .insert(listings)
      .values({
        ...insertListing,
        quantity: insertListing.quantity?.toString() || "1",
      })
      .returning();
    return result[0];
  }

  async getListings(userId: string): Promise<Listing[]> {
    try {
      const result = await this.db
        .select()
        .from(listings)
        .where(eq(listings.userId, userId))
        .orderBy(desc(listings.listedAt));
      return result || [];
    } catch (error) {
      console.error("[PostgresStorage] Error in getListings:", error);
      return [];
    }
  }

  async getListingById(id: string): Promise<Listing | undefined> {
    const result = await this.db
      .select()
      .from(listings)
      .where(eq(listings.id, id))
      .limit(1);
    return result[0];
  }

  async getListingsByBook(
    userId: string,
    bookId: string
  ): Promise<Listing[]> {
    try {
      const result = await this.db
        .select()
        .from(listings)
        .where(and(eq(listings.userId, userId), eq(listings.bookId, bookId)))
        .orderBy(desc(listings.listedAt));
      return result || [];
    } catch (error) {
      console.error("[PostgresStorage] Error in getListingsByBook:", error);
      return [];
    }
  }

  async updateListingStatus(
    id: string,
    status: string,
    errorMessage?: string
  ): Promise<Listing | undefined> {
    const result = await this.db
      .update(listings)
      .set({
        status,
        errorMessage: errorMessage || null,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, id))
      .returning();
    return result[0];
  }

  // Inventory Items
  async createInventoryItem(
    insertItem: InsertInventoryItem
  ): Promise<InventoryItem> {
    const result = await this.db
      .insert(inventoryItems)
      .values({
        ...insertItem,
        status: insertItem.status || "in_stock",
      })
      .returning();
    return result[0];
  }

  async getInventoryItems(userId: string): Promise<InventoryItem[]> {
    try {
      const result = await this.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.userId, userId))
        .orderBy(desc(inventoryItems.createdAt));
      return result || [];
    } catch (error) {
      console.error("[PostgresStorage] Error in getInventoryItems:", error);
      return [];
    }
  }

  async getInventoryItemById(id: string): Promise<InventoryItem | undefined> {
    const result = await this.db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .limit(1);
    return result[0];
  }

  async getInventoryItemsByBook(
    userId: string,
    bookId: string
  ): Promise<InventoryItem[]> {
    try {
      const result = await this.db
        .select()
        .from(inventoryItems)
        .where(
          and(
            eq(inventoryItems.userId, userId),
            eq(inventoryItems.bookId, bookId)
          )
        )
        .orderBy(desc(inventoryItems.createdAt));
      return result || [];
    } catch (error) {
      console.error("[PostgresStorage] Error in getInventoryItemsByBook:", error);
      return [];
    }
  }

  async updateInventoryItem(
    id: string,
    updates: Partial<Omit<InventoryItem, "id" | "userId" | "createdAt">>
  ): Promise<InventoryItem | undefined> {
    const result = await this.db
      .update(inventoryItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventoryItems.id, id))
      .returning();
    return result[0];
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    const result = await this.db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, id))
      .returning();
    return result.length > 0;
  }

  async updateListingPrice(id: string, newPrice: string): Promise<Listing | undefined> {
    const result = await this.db
      .update(listings)
      .set({ price: newPrice, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return result[0];
  }

  async createRepricingRule(rule: InsertRepricingRule): Promise<RepricingRule> {
    const result = await this.db
      .insert(repricingRules)
      .values(rule)
      .returning();
    return result[0];
  }

  async getRepricingRules(userId: string): Promise<RepricingRule[]> {
    const result = await this.db
      .select()
      .from(repricingRules)
      .where(eq(repricingRules.userId, userId))
      .orderBy(desc(repricingRules.createdAt));
    return result || [];
  }

  async getRepricingRuleById(id: string): Promise<RepricingRule | undefined> {
    const result = await this.db
      .select()
      .from(repricingRules)
      .where(eq(repricingRules.id, id))
      .limit(1);
    return result[0];
  }

  async getActiveRulesForListing(userId: string, listingId: string, platform: string): Promise<RepricingRule[]> {
    const result = await this.db
      .select()
      .from(repricingRules)
      .where(
        and(
          eq(repricingRules.userId, userId),
          eq(repricingRules.isActive, "true")
        )
      )
      .orderBy(desc(repricingRules.createdAt));
    
    return result.filter(rule => 
      (rule.listingId === null || rule.listingId === listingId) &&
      (rule.platform === "all" || rule.platform === platform)
    ).sort((a, b) => (a.listingId && !b.listingId) ? -1 : (!a.listingId && b.listingId) ? 1 : 0);
  }

  async updateRepricingRule(
    id: string,
    updates: Partial<Omit<RepricingRule, 'id' | 'userId' | 'createdAt'>>
  ): Promise<RepricingRule | undefined> {
    const result = await this.db
      .update(repricingRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(repricingRules.id, id))
      .returning();
    return result[0];
  }

  async deleteRepricingRule(id: string): Promise<boolean> {
    const result = await this.db
      .delete(repricingRules)
      .where(eq(repricingRules.id, id))
      .returning();
    return result.length > 0;
  }

  async createRepricingHistory(history: InsertRepricingHistory): Promise<RepricingHistory> {
    const result = await this.db
      .insert(repricingHistory)
      .values(history)
      .returning();
    return result[0];
  }

  async getRepricingHistory(userId: string, listingId?: string): Promise<RepricingHistory[]> {
    if (listingId) {
      const result = await this.db
        .select()
        .from(repricingHistory)
        .where(
          and(
            eq(repricingHistory.userId, userId),
            eq(repricingHistory.listingId, listingId)
          )
        )
        .orderBy(desc(repricingHistory.createdAt));
      return result || [];
    } else {
      const result = await this.db
        .select()
        .from(repricingHistory)
        .where(eq(repricingHistory.userId, userId))
        .orderBy(desc(repricingHistory.createdAt));
      return result || [];
    }
  }
}
