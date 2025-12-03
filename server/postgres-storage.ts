import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import {
  users,
  apiCredentials,
  books,
  type User,
  type InsertUser,
  type ApiCredentials,
  type InsertApiCredentials,
  type Book,
  type InsertBook,
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

  // Auth token methods - Not implemented for PostgreSQL (tokens are ephemeral and stored in SQLite only)
  async saveAuthToken(token: string, userId: string, type: 'user' | 'affiliate', expiresAt: Date): Promise<void> {
    // Tokens are only stored in local SQLite, not synced to PostgreSQL
    throw new Error("Auth tokens are not synced to PostgreSQL");
  }

  async getAuthToken(token: string): Promise<{ userId: string; type: string; expiresAt: Date } | null> {
    throw new Error("Auth tokens are not synced to PostgreSQL");
  }

  async deleteAuthToken(token: string): Promise<void> {
    throw new Error("Auth tokens are not synced to PostgreSQL");
  }

  async cleanupExpiredTokens(): Promise<number> {
    throw new Error("Auth tokens are not synced to PostgreSQL");
  }
}
