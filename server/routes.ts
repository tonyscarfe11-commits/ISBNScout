import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { EbayService } from "./ebay-service";
import { AmazonService } from "./amazon-service";
import { aiService } from "./ai-service";
import { salesVelocityService } from "./sales-velocity-service";
import { authService } from "./auth-service";
import { googleBooksService } from "./google-books-service";
import { ebayPricingService } from "./ebay-pricing-service";
import { stripeService } from "./stripe-service";
import { getPriceCache } from "./price-cache";
import { RepricingService } from "./repricing-service";
import { z } from "zod";
import express from "express";
import Stripe from "stripe";

// Validation schemas
const createListingSchema = z.object({
  bookId: z.string(),
  platform: z.enum(['ebay', 'amazon']),
  price: z.number().positive(),
  condition: z.string(),
  description: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  isbn: z.string(),
  title: z.string(),
  sku: z.string().optional(),
  fulfillmentChannel: z.enum(['MFN', 'AFN']).optional(),
  inventoryItemId: z.string().optional().nullable(),
});

const saveCredentialsSchema = z.object({
  platform: z.enum(['ebay', 'amazon']),
  credentials: z.record(z.any()),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email and password are required" });
      }

      const user = await authService.signup(username, email, password);

      // Set session
      req.session.userId = user.id;

      res.json({ user, message: "Account created successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await authService.login(email, password);

      // Set session
      req.session.userId = user.id;

      res.json({ user, message: "Logged in successfully" });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session.userId;

      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Subscription checkout
  app.post("/api/subscription/checkout", async (req, res) => {
    try {
      const userId = req.session.userId || "default-user";
      const { planId } = req.body;

      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }

      // Check if Stripe is configured
      if (!stripeService.isConfigured()) {
        return res.status(503).json({
          message: "Payment processing not configured. Set STRIPE_SECRET_KEY environment variable.",
          success: false,
        });
      }

      // Get user's Stripe customer ID from database
      const user = await authService.getUserById(userId);
      const stripeCustomerId = user?.stripeCustomerId || null;

      // Create Stripe checkout session
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const { url, sessionId } = await stripeService.createCheckoutSession(
        planId,
        stripeCustomerId,
        `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/subscription?cancelled=true`
      );

      res.json({
        success: true,
        checkoutUrl: url,
        sessionId,
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      res.status(500).json({
        message: error.message || "Failed to create checkout session",
        success: false,
      });
    }
  });

  // Verify Stripe checkout session and update subscription
  app.post("/api/subscription/verify", async (req, res) => {
    try {
      let userId = req.session.userId;

      // If no session, try to find the default user
      if (!userId) {
        const defaultUser = await storage.getUserByUsername("default");
        if (defaultUser) {
          userId = defaultUser.id;
          req.session.userId = userId;
        }
      }

      const { sessionId } = req.body;

      console.log('[Stripe Verify] Session ID:', sessionId);
      console.log('[Stripe Verify] User ID:', userId);

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      if (!stripeService.isConfigured()) {
        return res.status(503).json({
          message: "Payment processing not configured.",
          success: false,
        });
      }

      // Get the Stripe checkout session
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      console.log('[Stripe Verify] Payment status:', session.payment_status);
      console.log('[Stripe Verify] Metadata:', session.metadata);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({
          message: "Payment not completed",
          success: false,
        });
      }

      // Get the plan ID from session metadata
      const planId = session.metadata?.planId || 'basic';
      console.log('[Stripe Verify] Plan ID:', planId);

      // Update user's subscription in database
      if (userId) {
        const user = await authService.getUserById(userId);
        console.log('[Stripe Verify] Current user:', user?.subscriptionTier);

        if (user) {
          const updatedUser = await authService.updateUser(userId, {
            subscriptionTier: planId,
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer as string,
          });
          console.log('[Stripe Verify] Updated user:', updatedUser?.subscriptionTier);
        }
      }

      res.json({
        success: true,
        planId,
        status: 'active',
      });
    } catch (error: any) {
      console.error("Subscription verification error:", error);
      res.status(500).json({
        message: error.message || "Failed to verify subscription",
        success: false,
      });
    }
  });

  // Get current user info
  app.get("/api/user/me", async (req, res) => {
    try {
      let userId = req.session.userId || "default-user";

      // Get or create default user with fixed ID
      let user = await authService.getUserById(userId);

      if (!user) {
        // Get user by username if ID doesn't work
        const defaultUser = await storage.getUserByUsername("default");

        if (defaultUser) {
          // Found existing default user, update session
          req.session.userId = defaultUser.id;
          user = defaultUser;
        } else {
          // Create new default user with fixed ID
          const newUser = await storage.createUser({
            username: "default",
            email: "default@isbnscout.com",
            password: "unused",
          });
          // Set the user ID to the fixed ID in storage
          req.session.userId = newUser.id;
          userId = newUser.id;
          user = { ...newUser };
          delete (user as any).password;
        }
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({
        message: error.message || "Failed to get user",
      });
    }
  });

  // Get trial status
  app.get("/api/user/trial-status", async (req, res) => {
    try {
      let userId = req.session.userId || "default-user";
      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Calculate days remaining if on trial
      let daysRemaining = 0;
      if (user.trialEndsAt) {
        const now = new Date();
        const trialEnd = new Date(user.trialEndsAt);
        const diffTime = trialEnd.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      res.json({
        tier: user.subscriptionTier,
        status: user.subscriptionStatus,
        daysRemaining,
        trialEndsAt: user.trialEndsAt?.toISOString() || null,
      });
    } catch (error: any) {
      console.error("Get trial status error:", error);
      res.status(500).json({
        message: error.message || "Failed to get trial status",
      });
    }
  });

  // Get API credentials for a platform
  app.get("/api/credentials/:platform", async (req, res) => {
    try {
      const { platform } = req.params;
      const userId = "default-user"; // TODO: Get from session

      const credentials = await storage.getApiCredentials(userId, platform);

      if (!credentials) {
        return res.status(404).json({ message: "Credentials not found" });
      }

      // Don't send sensitive credentials to client, just confirm they exist
      res.json({
        hasCredentials: true,
        platform: credentials.platform,
        isActive: credentials.isActive,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Save API credentials
  app.post("/api/credentials", async (req, res) => {
    try {
      const { platform, credentials } = saveCredentialsSchema.parse(req.body);
      const userId = "default-user"; // TODO: Get from session

      await storage.saveApiCredentials(userId, platform, credentials);
      res.json({ success: true, message: "Credentials saved successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get API usage statistics
  app.get("/api/usage", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if storage supports API usage tracking (only SQLite has these methods)
      if (typeof (storage as any).getAllApiUsage === 'function') {
        const usage = (storage as any).getAllApiUsage();
        const ebayUsageToday = (storage as any).getApiUsage('ebay', today);

        res.json({
          all: usage,
          today: {
            ebay: ebayUsageToday || { service: 'ebay', date: today, callCount: 0 }
          },
          limits: {
            ebay: { daily: 5000, remaining: 5000 - (ebayUsageToday?.callCount || 0) }
          }
        });
      } else {
        // Return empty usage data for PostgreSQL (not yet implemented)
        res.json({
          all: [],
          today: {
            ebay: { service: 'ebay', date: today, callCount: 0 }
          },
          limits: {
            ebay: { daily: 5000, remaining: 5000 }
          }
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a listing on eBay or Amazon
  app.post("/api/listings", async (req, res) => {
    try {
      const listingData = createListingSchema.parse(req.body);
      const userId = "default-user"; // TODO: Get from session

      // Get credentials for the platform
      const credentials = await storage.getApiCredentials(userId, listingData.platform);

      if (!credentials) {
        return res.status(400).json({
          message: `No ${listingData.platform} credentials found. Please add your API credentials in Settings.`
        });
      }

      let platformListingId: string;
      let success: boolean;

      // Create listing based on platform
      if (listingData.platform === 'ebay') {
        const ebayService = new EbayService(credentials.credentials as any);
        const result = await ebayService.createListing({
          isbn: listingData.isbn,
          title: listingData.title,
          description: listingData.description || '',
          price: listingData.price,
          quantity: listingData.quantity,
          condition: listingData.condition,
        });
        platformListingId = result.listingId;
        success = result.success;
      } else {
        // Amazon
        const amazonService = new AmazonService(credentials.credentials as any);
        const sku = listingData.sku || `ISBN-${listingData.isbn}-${Date.now()}`;
        const result = await amazonService.createListing({
          isbn: listingData.isbn,
          sku,
          title: listingData.title,
          description: listingData.description || '',
          price: listingData.price,
          quantity: listingData.quantity,
          condition: listingData.condition,
          fulfillmentChannel: listingData.fulfillmentChannel || 'AFN',
        });
        platformListingId = result.listingId;
        success = result.success;
      }

      // Save listing to database
      const listing = await storage.createListing({
        userId,
        bookId: listingData.bookId,
        platform: listingData.platform,
        platformListingId,
        price: listingData.price.toString(),
        condition: listingData.condition,
        description: listingData.description,
        quantity: listingData.quantity.toString(),
        status: success ? 'active' : 'failed',
      });

      // If inventoryItemId is provided, link it to the listing and update status
      if (listingData.inventoryItemId) {
        try {
          await storage.updateInventoryItem(listingData.inventoryItemId, {
            listingId: listing.id,
            status: success ? 'listed' : 'in_stock', // Only mark as listed if listing succeeded
          });
          console.log(`[API] Linked inventory item ${listingData.inventoryItemId} to listing ${listing.id}`);
        } catch (invError) {
          console.error('[API] Failed to link inventory item:', invError);
          // Don't fail the entire request if inventory update fails
        }
      }

      res.json({
        success: true,
        listing,
        message: `Successfully listed on ${listingData.platform}!`,
      });
    } catch (error: any) {
      console.error('Listing creation error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }

      // Save failed listing attempt
      try {
        const listingData = req.body;
        const userId = "default-user";
        await storage.createListing({
          userId,
          bookId: listingData.bookId,
          platform: listingData.platform,
          platformListingId: null,
          price: listingData.price.toString(),
          condition: listingData.condition,
          description: listingData.description,
          quantity: (listingData.quantity || 1).toString(),
          status: 'failed',
          errorMessage: error.message,
        });
      } catch (dbError) {
        console.error('Failed to save error listing:', dbError);
      }

      res.status(500).json({ message: error.message || 'Failed to create listing' });
    }
  });

  // Get all listings
  app.get("/api/listings", async (req, res) => {
    try {
      const userId = "default-user"; // TODO: Get from session
      const listings = await storage.getListings(userId);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get listings for a specific book
  app.get("/api/listings/book/:bookId", async (req, res) => {
    try {
      const { bookId } = req.params;
      const userId = "default-user"; // TODO: Get from session
      const listings = await storage.getListingsByBook(userId, bookId);
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Inventory Items routes
  app.post("/api/inventory", async (req, res) => {
    try {
      const userId = "default-user"; // TODO: Get from session
      const data = req.body;

      if (!data.bookId || !data.purchaseDate || !data.purchaseCost || !data.condition) {
        return res.status(400).json({
          message: "bookId, purchaseDate, purchaseCost, and condition are required"
        });
      }

      const item = await storage.createInventoryItem({
        userId,
        bookId: data.bookId,
        listingId: data.listingId || null,
        sku: data.sku || null,
        purchaseDate: new Date(data.purchaseDate),
        purchaseCost: data.purchaseCost.toString(),
        purchaseSource: data.purchaseSource || null,
        condition: data.condition,
        location: data.location || null,
        soldDate: data.soldDate ? new Date(data.soldDate) : null,
        salePrice: data.salePrice?.toString() || null,
        soldPlatform: data.soldPlatform || null,
        actualProfit: data.actualProfit?.toString() || null,
        status: data.status || "in_stock",
        notes: data.notes || null,
      });

      res.json(item);
    } catch (error: any) {
      console.error("[API] Error creating inventory item:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory", async (req, res) => {
    try {
      const userId = "default-user"; // TODO: Get from session
      const items = await storage.getInventoryItems(userId);
      res.json(items);
    } catch (error: any) {
      console.error("[API] Error fetching inventory items:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getInventoryItemById(id);

      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.json(item);
    } catch (error: any) {
      console.error("[API] Error fetching inventory item:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/inventory/book/:bookId", async (req, res) => {
    try {
      const { bookId } = req.params;
      const userId = "default-user"; // TODO: Get from session
      const items = await storage.getInventoryItemsByBook(userId, bookId);
      res.json(items);
    } catch (error: any) {
      console.error("[API] Error fetching inventory items for book:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Convert date strings to Date objects
      if (updates.purchaseDate) {
        updates.purchaseDate = new Date(updates.purchaseDate);
      }
      if (updates.soldDate) {
        updates.soldDate = new Date(updates.soldDate);
      }

      // Convert numeric fields to strings for storage
      if (updates.purchaseCost !== undefined) {
        updates.purchaseCost = updates.purchaseCost.toString();
      }
      if (updates.salePrice !== undefined) {
        updates.salePrice = updates.salePrice.toString();
      }
      if (updates.actualProfit !== undefined) {
        updates.actualProfit = updates.actualProfit.toString();
      }

      const item = await storage.updateInventoryItem(id, updates);

      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.json(item);
    } catch (error: any) {
      console.error("[API] Error updating inventory item:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteInventoryItem(id);

      if (!success) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.json({ message: "Inventory item deleted successfully" });
    } catch (error: any) {
      console.error("[API] Error deleting inventory item:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Create or update a book scan
  app.post("/api/books", async (req, res) => {
    try {
      const userId = "default-user"; // TODO: Get from session
      const { isbn, title, author, ...otherData } = req.body;

      if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
      }

      // Try to fetch book data from Google Books if we don't have title
      let bookData = { isbn, title, author, ...otherData };

      if (!title || title === `Book with ISBN ${isbn}`) {
        try {
          console.log(`Looking up ISBN ${isbn} in Google Books...`);
          const googleBookData = await googleBooksService.lookupByISBN(isbn);

          if (googleBookData) {
            console.log(`Found book: ${googleBookData.title}`);
            bookData = {
              isbn: googleBookData.isbn,
              title: googleBookData.title,
              author: googleBookData.author || author || "Unknown Author",
              thumbnail: googleBookData.thumbnail,
              ...otherData,
            };
          } else {
            console.log(`No results found for ISBN ${isbn}`);
            // Keep the provided data or use defaults
            if (!title) {
              bookData.title = `Book with ISBN ${isbn}`;
            }
            if (!author) {
              bookData.author = "Unknown Author";
            }
          }
        } catch (googleError: any) {
          console.error("Google Books API error:", googleError.message);
          // Continue with provided data if Google Books fails
          if (!title) {
            bookData.title = `Book with ISBN ${isbn}`;
          }
          if (!author) {
            bookData.author = "Unknown Author";
          }
        }
      }

      // Try to fetch eBay pricing data
      try {
        console.log(`Looking up eBay pricing for ISBN ${isbn}...`);
        const ebayData = await ebayPricingService.getPriceByISBN(isbn);

        if (ebayData && ebayData.averagePrice) {
          console.log(`Found eBay average price: £${ebayData.averagePrice}`);
          bookData.ebayPrice = ebayData.averagePrice;
        } else {
          console.log(`No eBay pricing found for ISBN ${isbn}`);
        }
      } catch (ebayError: any) {
        console.error("eBay pricing error:", ebayError.message);
        // Continue without eBay pricing if it fails
      }

      // Set default status if not provided
      if (!bookData.status) {
        bookData.status = "pending";
      }

      const book = await storage.createBook({ ...bookData, userId });
      res.json(book);
    } catch (error: any) {
      console.error("Book creation error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update book prices
  app.patch("/api/books/:isbn", async (req, res) => {
    try {
      const { isbn } = req.params;
      const updates = req.body;

      const updatedBook = await storage.updateBook(isbn, updates);

      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.json(updatedBook);
    } catch (error: any) {
      console.error("Book update error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get all books
  app.get("/api/books", async (req, res) => {
    try {
      const userId = "default-user"; // TODO: Get from session
      const books = await storage.getBooks(userId);
      res.json(books);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export books data
  app.get("/api/books/export", async (req, res) => {
    try {
      const userId = "default-user"; // TODO: Get from session
      const books = await storage.getBooks(userId);

      // Convert to exportable format
      const exportData = books.map((book: any) => ({
        isbn: book.isbn,
        title: book.title,
        author: book.author || 'Unknown',
        amazonPrice: book.amazonPrice ? parseFloat(book.amazonPrice) : undefined,
        ebayPrice: book.ebayPrice ? parseFloat(book.ebayPrice) : undefined,
        yourCost: book.yourCost ? parseFloat(book.yourCost) : undefined,
        profit: book.profit ? parseFloat(book.profit) : undefined,
        status: book.status,
        scannedAt: book.createdAt,
      }));

      res.json(exportData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get pricing for a book by ISBN
  app.get("/api/books/:isbn/prices", async (req, res) => {
    try {
      const { isbn } = req.params;

      if (!isbn) {
        return res.status(400).json({ message: "ISBN is required" });
      }

      // Check if eBay pricing service is configured
      const isEbayConfigured = ebayPricingService.isConfigured();
      if (!isEbayConfigured) {
        console.log("eBay API not configured, will use mock prices");
      }

      try {
        console.log(`Fetching prices for ISBN ${isbn}...`);

        let ebayPricing = null;

        // Try real eBay API if configured
        if (isEbayConfigured) {
          try {
            // Fetch eBay pricing by ISBN first
            ebayPricing = await ebayPricingService.getPriceByISBN(isbn);
          } catch (ebayError: any) {
            console.log("eBay API failed, will use mock data:", ebayError.message);
            // Continue to mock data below
          }

          // If no results by ISBN, try searching by title
          if (!ebayPricing) {
            console.log(`No eBay results by ISBN, trying title search...`);

            // Get book details from database
            const book = await storage.getBookByISBN(isbn);

            if (book && book.title) {
              // Search eBay by title
              const titleQuery = book.author ? `${book.title} ${book.author}` : book.title;
              console.log(`Searching eBay for: "${titleQuery}"`);

              try {
                const titleResults = await ebayPricingService.searchByTitle(titleQuery, 10);

                if (titleResults.length > 0) {
                  // Calculate average price from title search results
                  const prices = titleResults.map(listing => listing.price).filter(p => p > 0);
                  const averagePrice = prices.length > 0
                    ? prices.reduce((sum, p) => sum + p, 0) / prices.length
                    : undefined;

                  ebayPricing = {
                    isbn,
                    currentPrice: titleResults[0]?.price,
                    averagePrice,
                    minPrice: prices.length > 0 ? Math.min(...prices) : undefined,
                    maxPrice: prices.length > 0 ? Math.max(...prices) : undefined,
                    soldCount: 0,
                    activeListings: titleResults.length,
                    currency: "GBP",
                    lastUpdated: new Date(),
                    listings: titleResults.slice(0, 5),
                  };
                }
              } catch (titleSearchError: any) {
                console.log("eBay title search failed, will use mock data:", titleSearchError.message);
                // Continue to mock data below
              }
            }
          }
        }

        // If eBay API not configured or no results, generate mock prices
        if (!ebayPricing) {
          console.log("Using mock eBay prices for testing");
          const book = await storage.getBookByISBN(isbn);

          if (book) {
            // Generate realistic mock prices based on hash of ISBN
            const hash = isbn.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const basePrice = 3 + (hash % 15); // £3-£18
            const variation = 0.5 + (hash % 5) * 0.2; // ±£0.50-£1.50

            ebayPricing = {
              isbn,
              currentPrice: parseFloat((basePrice + variation).toFixed(2)),
              averagePrice: parseFloat(basePrice.toFixed(2)),
              minPrice: parseFloat((basePrice - variation * 1.5).toFixed(2)),
              maxPrice: parseFloat((basePrice + variation * 2).toFixed(2)),
              soldCount: 15 + (hash % 30),
              activeListings: 8 + (hash % 20),
              currency: "GBP",
              lastUpdated: new Date(),
              listings: [
                {
                  title: `${book.title} - Good Condition`,
                  price: parseFloat((basePrice + variation * 0.5).toFixed(2)),
                  condition: "Good",
                  listingUrl: `https://ebay.co.uk/itm/mock-${isbn}`,
                  seller: "bookdeals_uk",
                  location: "London, UK",
                  shipping: 2.95
                },
                {
                  title: `${book.title} - Very Good`,
                  price: parseFloat((basePrice + variation * 1.2).toFixed(2)),
                  condition: "Very Good",
                  listingUrl: `https://ebay.co.uk/itm/mock-${isbn}-2`,
                  seller: "rareBooks123",
                  location: "Manchester, UK",
                  shipping: 0
                }
              ]
            };
          }
        }

        // TODO: Fetch Amazon pricing from Keepa when integrated
        const amazonPrice = null;

        if (!ebayPricing && !amazonPrice) {
          return res.json({
            message: "No pricing found for this book",
            ebayPrice: null,
            amazonPrice: null,
          });
        }

        // Cache the pricing data for offline use
        try {
          const book = await storage.getBookByISBN(isbn);
          const priceCache = getPriceCache();

          priceCache.cachePrice({
            isbn,
            title: book?.title || null,
            author: book?.author || null,
            publisher: null, // TODO: Add publisher to book schema
            ebayPrice: ebayPricing?.currentPrice || ebayPricing?.averagePrice || null,
            amazonPrice,
            source: "api",
          });

          console.log(`[PriceCache] Cached pricing for ISBN ${isbn}`);
        } catch (cacheError: any) {
          console.warn("[PriceCache] Failed to cache price:", cacheError.message);
          // Don't fail the request if caching fails
        }

        res.json({
          ebayPrice: ebayPricing?.currentPrice || ebayPricing?.averagePrice,
          ebayData: ebayPricing,
          amazonPrice, // null for now
          currency: "GBP",
          lastUpdated: new Date(),
        });
      } catch (pricingError: any) {
        console.error("Pricing lookup error:", pricingError);
        // Return partial data if one service fails
        res.json({
          message: pricingError.message,
          ebayPrice: null,
          amazonPrice: null,
        });
      }
    } catch (error: any) {
      console.error("Price endpoint error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // AI: Analyze book image
  // Sales velocity calculation endpoint
  app.post("/api/books/calculate-velocity", async (req, res) => {
    try {
      const { salesRank, profit, profitMargin, yourCost, category } = req.body;

      if (!salesRank || salesRank < 1) {
        return res.status(400).json({ error: "Valid sales rank is required" });
      }

      // Calculate velocity analysis
      const analysis = salesVelocityService.calculateVelocity(salesRank, category || 'Books');
      const timeToSell = salesVelocityService.getTimeToSell(analysis.velocity.rating);
      
      // Calculate buy recommendation if profit data provided
      let buyRecommendation = analysis.velocity.buyRecommendation;
      if (profit !== undefined && profitMargin !== undefined && yourCost !== undefined) {
        buyRecommendation = salesVelocityService.shouldBuy(
          analysis.velocity.rating,
          profit,
          profitMargin,
          yourCost
        ).recommendation;
      }

      const recommendation = salesVelocityService.shouldBuy(
        analysis.velocity.rating,
        profit || 0,
        profitMargin || 0,
        yourCost || 0
      );

      res.json({
        velocity: analysis.velocity,
        rankCategory: analysis.rankCategory,
        competitiveLevel: analysis.competitiveLevel,
        timeToSell,
        buyRecommendation: recommendation,
      });
    } catch (error: any) {
      console.error("Velocity calculation failed:", error);
      res.status(500).json({ error: error.message || "Failed to calculate velocity" });
    }
  });

  app.post("/api/ai/analyze-image", async (req, res) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      const result = await aiService.analyzeBookImage(imageUrl);
      res.json(result);
    } catch (error: any) {
      console.error('Image analysis error:', error);
      res.status(500).json({ message: error.message || "Failed to analyze image" });
    }
  });

  // AI: Optimize listing keywords
  app.post("/api/ai/optimize-keywords", async (req, res) => {
    try {
      const { title, author, isbn, condition, platform } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Book title is required" });
      }

      const result = await aiService.optimizeListingKeywords(
        title,
        author,
        isbn,
        condition,
        platform
      );
      res.json(result);
    } catch (error: any) {
      console.error('Keyword optimization error:', error);
      res.status(500).json({ message: error.message || "Failed to optimize keywords" });
    }
  });

  // AI: Generate listing description
  app.post("/api/ai/generate-description", async (req, res) => {
    try {
      const { title, author, condition, additionalNotes } = req.body;

      if (!title) {
        return res.status(400).json({ message: "Book title is required" });
      }

      const description = await aiService.generateListingDescription(
        title,
        author,
        condition,
        additionalNotes
      );
      res.json({ description });
    } catch (error: any) {
      console.error('Description generation error:', error);
      res.status(500).json({ message: error.message || "Failed to generate description" });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ message: 'No signature provided' });
    }

    try {
      // Verify and parse webhook event
      const event = stripeService.constructWebhookEvent(req.body, signature as string);
      const result = await stripeService.handleWebhookEvent(event);

      console.log('Webhook event processed:', result.type);

      // Handle different event types
      switch (result.type) {
        case 'subscription_created':
          // TODO: Update user's subscription in database
          console.log('New subscription created:', result.data);
          break;

        case 'subscription_updated':
          // TODO: Update user's subscription status
          console.log('Subscription updated:', result.data);
          break;

        case 'subscription_cancelled':
          // TODO: Cancel user's subscription
          console.log('Subscription cancelled:', result.data);
          break;

        case 'payment_succeeded':
          console.log('Payment succeeded:', result.data);
          break;

        case 'payment_failed':
          console.log('Payment failed:', result.data);
          break;

        default:
          console.log('Unhandled event type:', result.type);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Image proxy to avoid CORS issues with Google Books images
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const { url } = req.query;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "Image URL is required" });
      }

      // Only allow Google Books images for security
      if (!url.startsWith('https://books.google.com/')) {
        return res.status(403).json({ message: "Only Google Books images are allowed" });
      }

      const response = await fetch(url);

      if (!response.ok) {
        return res.status(response.status).json({ message: "Failed to fetch image" });
      }

      const contentType = response.headers.get('content-type');
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      // Cache for 24 hours
      res.setHeader('Cache-Control', 'public, max-age=86400');

      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error: any) {
      console.error('Image proxy error:', error);
      res.status(500).json({ message: "Failed to proxy image" });
    }
  });

  // ======= OFFLINE PRICE LOOKUP ENDPOINTS =======

  // Offline price lookup (works with cached data)
  app.post("/api/offline/lookup", async (req, res) => {
    try {
      const { isbn, title, author, publisher } = req.body;

      if (!isbn) {
        return res.status(400).json({ error: "ISBN required" });
      }

      const priceCache = getPriceCache();
      const result = await priceCache.lookupOffline(isbn, {
        title,
        author,
        publisher,
      });

      res.json(result);
    } catch (error: any) {
      console.error("[OfflineLookup] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get cache statistics
  app.get("/api/offline/stats", (req, res) => {
    try {
      const priceCache = getPriceCache();
      const stats = priceCache.getStats();
      res.json(stats);
    } catch (error: any) {
      console.error("[OfflineLookup] Stats error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ======= REPRICING ENDPOINTS =======

  // Create a repricing rule
  app.post("/api/repricing/rules", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { listingId, platform, strategy, strategyValue, minPrice, maxPrice, isActive, runFrequency } = req.body;

      if (!platform || !strategy || minPrice === undefined || maxPrice === undefined) {
        return res.status(400).json({ message: "Platform, strategy, minPrice, and maxPrice are required" });
      }

      const minPriceNum = typeof minPrice === 'number' ? minPrice : parseFloat(minPrice);
      const maxPriceNum = typeof maxPrice === 'number' ? maxPrice : parseFloat(maxPrice);

      if (isNaN(minPriceNum) || isNaN(maxPriceNum)) {
        return res.status(400).json({ message: "Min and max prices must be valid numbers" });
      }

      if (minPriceNum < 0 || maxPriceNum < 0) {
        return res.status(400).json({ message: "Prices cannot be negative" });
      }

      if (minPriceNum >= maxPriceNum) {
        return res.status(400).json({ message: "Min price must be less than max price" });
      }

      // Validate strategyValue based on strategy
      const requiresStrategyValue = strategy === 'beat_by_percent' || strategy === 'beat_by_amount';
      
      if (requiresStrategyValue && (strategyValue === undefined || strategyValue === null || strategyValue === '')) {
        return res.status(400).json({ message: "Strategy value is required for this pricing strategy" });
      }
      
      if (strategyValue != null && strategyValue !== '') {
        const strategyValueNum = parseFloat(strategyValue);
        if (isNaN(strategyValueNum) || strategyValueNum < 0) {
          return res.status(400).json({ message: "Strategy value must be a positive number" });
        }
      }

      const rule = await storage.createRepricingRule({
        userId,
        listingId: listingId || null,
        platform,
        strategy,
        strategyValue: strategyValue != null && strategyValue !== '' ? String(strategyValue) : null,
        minPrice: minPriceNum.toString(),
        maxPrice: maxPriceNum.toString(),
        isActive: isActive !== undefined ? String(isActive) : "true",
        runFrequency: runFrequency || "hourly",
      });

      res.json(rule);
    } catch (error: any) {
      console.error("[Repricing] Create rule error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get all repricing rules for user
  app.get("/api/repricing/rules", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const rules = await storage.getRepricingRules(userId);
      res.json(rules);
    } catch (error: any) {
      console.error("[Repricing] Get rules error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get a specific repricing rule
  app.get("/api/repricing/rules/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const rule = await storage.getRepricingRuleById(id);

      if (!rule || rule.userId !== userId) {
        return res.status(404).json({ message: "Rule not found" });
      }

      res.json(rule);
    } catch (error: any) {
      console.error("[Repricing] Get rule error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update a repricing rule
  app.patch("/api/repricing/rules/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const existingRule = await storage.getRepricingRuleById(id);

      if (!existingRule || existingRule.userId !== userId) {
        return res.status(404).json({ message: "Rule not found" });
      }

      // Validate updated values
      const updates: any = {};
      if (req.body.listingId !== undefined) updates.listingId = req.body.listingId;
      if (req.body.platform !== undefined) updates.platform = req.body.platform;
      
      const strategy = req.body.strategy || existingRule.strategy;
      if (req.body.strategy !== undefined) updates.strategy = req.body.strategy;

      // Validate minPrice and maxPrice
      let minPriceNum: number;
      let maxPriceNum: number;
      
      if (req.body.minPrice !== undefined) {
        minPriceNum = typeof req.body.minPrice === 'number' ? req.body.minPrice : parseFloat(req.body.minPrice);
        if (isNaN(minPriceNum) || minPriceNum < 0) {
          return res.status(400).json({ message: "Min price must be a positive number" });
        }
        updates.minPrice = minPriceNum.toString();
      } else {
        minPriceNum = parseFloat(existingRule.minPrice);
      }

      if (req.body.maxPrice !== undefined) {
        maxPriceNum = typeof req.body.maxPrice === 'number' ? req.body.maxPrice : parseFloat(req.body.maxPrice);
        if (isNaN(maxPriceNum) || maxPriceNum < 0) {
          return res.status(400).json({ message: "Max price must be a positive number" });
        }
        updates.maxPrice = maxPriceNum.toString();
      } else {
        maxPriceNum = parseFloat(existingRule.maxPrice);
      }

      if (minPriceNum >= maxPriceNum) {
        return res.status(400).json({ message: "Min price must be less than max price" });
      }

      // Validate strategyValue based on strategy
      if (req.body.strategyValue !== undefined) {
        const requiresStrategyValue = strategy === 'beat_by_percent' || strategy === 'beat_by_amount';
        const strategyValue = req.body.strategyValue;
        
        if (requiresStrategyValue && (strategyValue === undefined || strategyValue === null || strategyValue === '')) {
          return res.status(400).json({ message: "Strategy value is required for this pricing strategy" });
        }
        
        if (strategyValue != null && strategyValue !== '') {
          const strategyValueNum = parseFloat(strategyValue);
          if (isNaN(strategyValueNum) || strategyValueNum < 0) {
            return res.status(400).json({ message: "Strategy value must be a positive number" });
          }
        }
        
        updates.strategyValue = strategyValue != null && strategyValue !== '' ? String(strategyValue) : null;
      }
      
      if (req.body.isActive !== undefined) updates.isActive = String(req.body.isActive);
      if (req.body.runFrequency !== undefined) updates.runFrequency = req.body.runFrequency;

      const updatedRule = await storage.updateRepricingRule(id, updates);
      res.json(updatedRule);
    } catch (error: any) {
      console.error("[Repricing] Update rule error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete a repricing rule
  app.delete("/api/repricing/rules/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const existingRule = await storage.getRepricingRuleById(id);

      if (!existingRule || existingRule.userId !== userId) {
        return res.status(404).json({ message: "Rule not found" });
      }

      const deleted = await storage.deleteRepricingRule(id);
      res.json({ success: deleted });
    } catch (error: any) {
      console.error("[Repricing] Delete rule error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Manually trigger repricing
  app.post("/api/repricing/run", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { listingId } = req.body;
      
      if (!listingId) {
        return res.status(400).json({ message: "listingId is required" });
      }

      const listing = await storage.getListingById(listingId);
      if (!listing || listing.userId !== userId) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Get active rules for this listing
      const rules = await storage.getActiveRulesForListing(userId, listing.id, listing.platform);
      if (rules.length === 0) {
        return res.status(400).json({ message: "No active repricing rules found for this listing" });
      }

      // Use the first (most specific) rule
      const rule = rules[0];

      // Get credentials
      const amazonCreds = await storage.getApiCredentials(userId, 'amazon');
      const ebayCreds = await storage.getApiCredentials(userId, 'ebay');

      let amazonService: AmazonService | undefined;
      let ebayService: EbayService | undefined;

      if (amazonCreds) {
        try {
          amazonService = new AmazonService(JSON.parse(amazonCreds.credentials as any));
        } catch (error) {
          console.error('[Repricing] Failed to initialize Amazon service:', error);
        }
      }

      if (ebayCreds) {
        try {
          ebayService = new EbayService(JSON.parse(ebayCreds.credentials as any));
        } catch (error) {
          console.error('[Repricing] Failed to initialize eBay service:', error);
        }
      }

      // Reprice the listing
      const repricingService = new RepricingService();
      const result = await repricingService.repriceListing(
        listing,
        rule,
        amazonService,
        ebayService
      );

      // Record history
      await storage.createRepricingHistory({
        userId,
        listingId: listing.id,
        ruleId: rule.id,
        oldPrice: result.oldPrice.toString(),
        newPrice: result.newPrice.toString(),
        competitorPrice: result.competitorPrice?.toString() || null,
        reason: result.reason,
        success: result.success ? "true" : "false",
        errorMessage: result.errorMessage || null,
      });

      // Update rule's lastRun timestamp
      await storage.updateRepricingRule(rule.id, { lastRun: new Date() });

      res.json(result);
    } catch (error: any) {
      console.error("[Repricing] Run error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get repricing history
  app.get("/api/repricing/history", async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { listingId } = req.query;
      const history = await storage.getRepricingHistory(userId, listingId as string | undefined);
      res.json(history);
    } catch (error: any) {
      console.error("[Repricing] Get history error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
