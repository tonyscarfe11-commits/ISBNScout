import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  emailVerified: text("email_verified").notNull().default("false"), // 'true' or 'false'
  emailVerificationToken: text("email_verification_token"), // Token for email verification
  emailVerificationExpires: timestamp("email_verification_expires"), // When verification token expires
  subscriptionTier: text("subscription_tier").notNull().default("trial"), // 'trial', 'basic', 'pro', 'enterprise'
  subscriptionStatus: text("subscription_status").notNull().default("active"), // 'active', 'cancelled', 'past_due', 'trialing'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  trialStartedAt: timestamp("trial_started_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  referredByAffiliateId: text("referred_by_affiliate_id"), // Affiliate who referred this user
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

// Affiliates - Track affiliate partners
export const affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  referralCode: text("referral_code").notNull().unique(), // Unique code like "JOHN25"
  website: text("website"),
  socialMedia: text("social_media"),
  audience: text("audience"),
  
  // Stats
  totalClicks: text("total_clicks").notNull().default("0"),
  totalConversions: text("total_conversions").notNull().default("0"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0"),
  pendingPayout: decimal("pending_payout", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Commission settings
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull().default("25"), // 25% default
  
  // Status
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'suspended'
  approvedAt: timestamp("approved_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("affiliates_email_idx").on(table.email),
  referralCodeIdx: index("affiliates_referral_code_idx").on(table.referralCode),
  statusIdx: index("affiliates_status_idx").on(table.status),
}));

export const insertAffiliateSchema = createInsertSchema(affiliates).omit({
  id: true,
  totalClicks: true,
  totalConversions: true,
  totalEarnings: true,
  pendingPayout: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAffiliate = z.infer<typeof insertAffiliateSchema>;
export type Affiliate = typeof affiliates.$inferSelect;

// Referral Clicks - Track when someone clicks an affiliate link
export const referralClicks = pgTable("referral_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  clickedAt: timestamp("clicked_at").notNull().defaultNow(),
}, (table) => ({
  affiliateIdIdx: index("referral_clicks_affiliate_id_idx").on(table.affiliateId),
  clickedAtIdx: index("referral_clicks_clicked_at_idx").on(table.clickedAt),
}));

export const insertReferralClickSchema = createInsertSchema(referralClicks).omit({
  id: true,
  clickedAt: true,
});

export type InsertReferralClick = z.infer<typeof insertReferralClickSchema>;
export type ReferralClick = typeof referralClicks.$inferSelect;

// Commissions - Track affiliate earnings from conversions
export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }), // The user who signed up
  
  // Subscription info
  subscriptionTier: text("subscription_tier").notNull(), // 'pro_monthly', 'elite_monthly', etc.
  subscriptionAmount: decimal("subscription_amount", { precision: 10, scale: 2 }).notNull(), // Amount user paid
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).notNull(), // Rate at time of conversion
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(), // Actual commission earned
  
  // Status
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'paid', 'cancelled'
  paidAt: timestamp("paid_at"),
  paypalTransactionId: text("paypal_transaction_id"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  affiliateIdIdx: index("commissions_affiliate_id_idx").on(table.affiliateId),
  userIdIdx: index("commissions_user_id_idx").on(table.userId),
  statusIdx: index("commissions_status_idx").on(table.status),
  createdAtIdx: index("commissions_created_at_idx").on(table.createdAt),
}));

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  paidAt: true,
  paypalTransactionId: true,
  createdAt: true,
});

export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Commission = typeof commissions.$inferSelect;
