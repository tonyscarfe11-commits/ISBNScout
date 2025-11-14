import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  subscriptionTier: text("subscription_tier").notNull().default("trial"), // 'trial', 'basic', 'pro', 'enterprise'
  subscriptionStatus: text("subscription_status").notNull().default("active"), // 'active', 'cancelled', 'past_due', 'trialing'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  trialStartedAt: timestamp("trial_started_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// API Credentials storage
export const apiCredentials = pgTable("api_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // 'ebay' or 'amazon'
  credentials: jsonb("credentials").notNull(), // encrypted credentials object
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("api_credentials_user_id_idx").on(table.userId),
  platformIdx: index("api_credentials_platform_idx").on(table.platform),
}));

export const insertApiCredentialsSchema = createInsertSchema(apiCredentials).pick({
  userId: true,
  platform: true,
  credentials: true,
});

export type InsertApiCredentials = z.infer<typeof insertApiCredentialsSchema>;
export type ApiCredentials = typeof apiCredentials.$inferSelect;

// Book scans and pricing data
export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isbn: text("isbn").notNull(),
  title: text("title").notNull(),
  author: text("author"),
  thumbnail: text("thumbnail"),
  amazonPrice: decimal("amazon_price", { precision: 10, scale: 2 }),
  ebayPrice: decimal("ebay_price", { precision: 10, scale: 2 }),
  yourCost: decimal("your_cost", { precision: 10, scale: 2 }),
  profit: decimal("profit", { precision: 10, scale: 2 }),
  status: text("status").notNull(), // 'profitable', 'break-even', 'loss', 'pending'
  scannedAt: timestamp("scanned_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("books_user_id_idx").on(table.userId),
  isbnIdx: index("books_isbn_idx").on(table.isbn),
}));

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  scannedAt: true,
});

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

// Listings to track what's been listed on each platform
export const listings = pgTable("listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // 'ebay' or 'amazon'
  platformListingId: text("platform_listing_id"), // ID from eBay/Amazon
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  condition: text("condition").notNull(),
  description: text("description"),
  quantity: text("quantity").notNull().default("1"),
  status: text("status").notNull(), // 'draft', 'pending', 'active', 'sold', 'failed', 'cancelled'
  errorMessage: text("error_message"),
  listedAt: timestamp("listed_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("listings_user_id_idx").on(table.userId),
  bookIdIdx: index("listings_book_id_idx").on(table.bookId),
  platformIdx: index("listings_platform_idx").on(table.platform),
  statusIdx: index("listings_status_idx").on(table.status),
}));

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  listedAt: true,
  updatedAt: true,
});

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

// Inventory Items - Track actual physical inventory lifecycle
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  listingId: varchar("listing_id").references(() => listings.id, { onDelete: "set null" }), // Linked when listed

  // Purchase info
  sku: text("sku"), // Optional custom SKU/identifier
  purchaseDate: timestamp("purchase_date").notNull(),
  purchaseCost: decimal("purchase_cost", { precision: 10, scale: 2 }).notNull(),
  purchaseSource: text("purchase_source"), // e.g., 'charity shop', 'car boot sale', 'online'
  condition: text("condition").notNull(), // 'new', 'like_new', 'very_good', 'good', 'acceptable'
  location: text("location"), // Storage location/bin

  // Sale info (populated when sold)
  soldDate: timestamp("sold_date"),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  soldPlatform: text("sold_platform"), // 'ebay', 'amazon', 'other'
  actualProfit: decimal("actual_profit", { precision: 10, scale: 2 }), // Calculated: salePrice - purchaseCost - fees

  // Status tracking
  status: text("status").notNull().default("in_stock"), // 'in_stock', 'listed', 'sold', 'returned', 'donated', 'damaged'
  notes: text("notes"), // User notes about this item

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("inventory_items_user_id_idx").on(table.userId),
  bookIdIdx: index("inventory_items_book_id_idx").on(table.bookId),
  statusIdx: index("inventory_items_status_idx").on(table.status),
  listingIdIdx: index("inventory_items_listing_id_idx").on(table.listingId),
}));

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
