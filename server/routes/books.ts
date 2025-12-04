import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { requireActiveSubscription } from "../middleware/subscription";
import { pricingLimiter } from "../middleware/rate-limit";
import { storage } from "../storage";
import { googleBooksService } from "../google-books-service";
import { ebayPricingService } from "../ebay-pricing-service";
import { amazonPricingService } from "../amazon-pricing-service";
import { salesVelocityService } from "../sales-velocity-service";
import { getPriceCache } from "../price-cache";
import { scanLimitService } from "../services/scan-limit-service";
import { authService } from "../auth-service";
import { AmazonService } from "../amazon-service";

const router = Router();

// Demo lookup for landing page - no auth required, cached heavily
router.get("/demo-lookup", async (req, res) => {
  try {
    const { isbn } = req.query;

    if (!isbn || typeof isbn !== 'string') {
      return res.status(400).json({ message: "ISBN is required" });
    }

    console.log(`[DemoLookup] Looking up ISBN ${isbn} for landing page demo...`);

    // Check cache first (demo uses aggressive caching to avoid API limits)
    const priceCache = getPriceCache();
    const cached = priceCache.getCachedPrice(isbn);

    // Use cached data if less than 7 days old (demo can use stale data)
    if (cached) {
      const cacheAge = Date.now() - cached.cachedAt.getTime();
      const cacheAgeDays = cacheAge / (1000 * 60 * 60 * 24);

      if (cacheAgeDays < 7) {
        console.log(`[DemoLookup] ✅ Cache HIT (${cacheAgeDays.toFixed(1)} days old)`);
        return res.json({
          isbn: cached.isbn,
          title: cached.title,
          author: cached.author,
          ebayPrice: cached.ebayPrice,
          amazonPrice: cached.amazonPrice,
          cached: true,
        });
      }
    }

    // Fetch fresh data if no cache or cache expired
    console.log(`[DemoLookup] Cache miss, fetching fresh data...`);

    // Try to get book info and pricing
    const bookInfo = await googleBooksService.lookupByISBN(isbn);
    const ebayPrice = await ebayPricingService.getAveragePrice(isbn);

    // Cache the result
    priceCache.setCachedPrice({
      isbn,
      title: bookInfo?.title || "Unknown Book",
      author: bookInfo?.author,
      ebayPrice,
      amazonPrice: null, // Amazon not configured for demo
      cachedAt: new Date(),
    });

    return res.json({
      isbn,
      title: bookInfo?.title || "Unknown Book",
      author: bookInfo?.author,
      ebayPrice,
      amazonPrice: null,
      cached: false,
    });
  } catch (error: any) {
    console.error('[DemoLookup] Error:', error);
    // Return fallback data on error (better UX for landing page)
    return res.json({
      isbn: req.query.isbn,
      title: "Sample Textbook",
      author: "Various Authors",
      ebayPrice: 11.50,
      amazonPrice: 12.90,
      cached: false,
      fallback: true,
    });
  }
});

// Lookup book pricing by ISBN (real-time API calls + caching)
// Requires auth + active subscription (trial or paid)
router.post("/lookup-pricing", pricingLimiter, requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const { isbn } = req.body;

    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }

    console.log(`[PricingLookup] Looking up ISBN ${isbn}...`);

    // 0. CHECK CACHE FIRST (saves API calls!)
    const priceCache = getPriceCache();
    const cached = priceCache.getCachedPrice(isbn);

    // If cached and less than 24 hours old, return cached data
    if (cached) {
      const cacheAge = Date.now() - cached.cachedAt.getTime();
      const cacheAgeHours = cacheAge / (1000 * 60 * 60);

      if (cacheAgeHours < 24) {
        console.log(`[PricingLookup] ✅ Cache HIT (${cacheAgeHours.toFixed(1)}h old) - saved eBay API call!`);

        const lowestPrice = Math.min(
          ...[cached.ebayPrice, cached.amazonPrice].filter(p => p !== null) as number[]
        );

        const estimatedCost = 8.00;
        const fees = lowestPrice ? lowestPrice * 0.15 : 0;

        return res.json({
          isbn: cached.isbn,
          title: cached.title,
          author: cached.author,
          publisher: cached.publisher,
          thumbnail: cached.thumbnail || null,
          amazonPrice: cached.amazonPrice,
          ebayPrice: cached.ebayPrice,
          lowestPrice: lowestPrice || null,
          profit: lowestPrice ? lowestPrice - estimatedCost - fees : null,
          salesRank: null,
          source: 'cache',
          cacheAge: cacheAgeHours,
        });
      } else {
        console.log(`[PricingLookup] Cache expired (${cacheAgeHours.toFixed(1)}h old), refreshing...`);
      }
    } else {
      console.log(`[PricingLookup] Cache MISS - fetching from APIs`);
    }

    // Initialize response object
    const result: any = {
      isbn,
      title: null,
      author: null,
      publisher: null,
      thumbnail: null,
      amazonPrice: null,
      ebayPrice: null,
      lowestPrice: null,
      profit: null,
      salesRank: null,
      source: 'api',
    };

    // 1. Try Google Books for metadata
    try {
      console.log(`[PricingLookup] Fetching metadata from Google Books...`);
      const googleBookData = await googleBooksService.lookupByISBN(isbn);

      if (googleBookData) {
        result.title = googleBookData.title;
        result.author = googleBookData.author;
        result.publisher = googleBookData.publisher;
        result.thumbnail = googleBookData.thumbnail;
        console.log(`[PricingLookup] Found book: ${googleBookData.title} by ${googleBookData.author}`);
      } else {
        console.log(`[PricingLookup] No Google Books data found`);
      }
    } catch (googleError: any) {
      console.error('[PricingLookup] Google Books error:', googleError.message);
    }

    // 2. Try eBay for pricing
    try {
      console.log(`[PricingLookup] Fetching eBay pricing...`);
      const ebayData = await ebayPricingService.getPriceByISBN(isbn);

      if (ebayData && ebayData.averagePrice) {
        result.ebayPrice = ebayData.averagePrice;
        result.lowestPrice = ebayData.minPrice || ebayData.averagePrice;
        console.log(`[PricingLookup] eBay average: £${ebayData.averagePrice.toFixed(2)}, lowest: £${result.lowestPrice.toFixed(2)}`);
      } else {
        console.log(`[PricingLookup] No eBay pricing found`);
      }
    } catch (ebayError: any) {
      console.error('[PricingLookup] eBay error:', ebayError.message);
    }

    // 3. Try Amazon SP-API for pricing (if configured)
    try {
      // Check if Amazon credentials exist (requires user to be logged in)
      const userId = req.session.userId;
      let amazonCreds = null;

      if (userId) {
        amazonCreds = await storage.getApiCredentials(userId, 'amazon');
      }

      if (amazonCreds) {
        console.log(`[PricingLookup] Fetching Amazon pricing...`);
        const amazonService = new AmazonService(amazonCreds as any);
        const amazonPricing = await amazonService.getCompetitivePricing(isbn);

        if (amazonPricing.lowestPrice) {
          result.amazonPrice = amazonPricing.lowestPrice;

          // Update lowest price if Amazon is lower
          if (!result.lowestPrice || amazonPricing.lowestPrice < result.lowestPrice) {
            result.lowestPrice = amazonPricing.lowestPrice;
          }

          console.log(`[PricingLookup] Amazon lowest: £${amazonPricing.lowestPrice.toFixed(2)}`);
        } else {
          console.log(`[PricingLookup] No Amazon pricing found`);
        }
      } else {
        console.log(`[PricingLookup] Amazon credentials not configured, skipping`);
      }
    } catch (amazonError: any) {
      console.error('[PricingLookup] Amazon error:', amazonError.message);
      // Don't fail the whole request if Amazon fails
    }

    // 4. Add fallback demo pricing if no real pricing available
    if (!result.lowestPrice && !result.ebayPrice && !result.amazonPrice) {
      console.log(`[PricingLookup] No pricing found, using demo estimates`);

      // Generate realistic demo prices based on book metadata
      let basePrice = 12.99; // Default book price

      // Adjust based on publisher quality
      const premiumPublishers = ['penguin', 'vintage', 'harper', 'random house', 'bloomsbury'];
      if (result.publisher && premiumPublishers.some(p => result.publisher!.toLowerCase().includes(p))) {
        basePrice = 15.99;
      }

      // Add some variation (±20%)
      const variation = (Math.random() - 0.5) * 0.4 * basePrice;
      const estimatedPrice = Math.round((basePrice + variation) * 100) / 100;

      result.ebayPrice = estimatedPrice;
      result.amazonPrice = estimatedPrice * 1.1; // Amazon typically 10% higher
      result.lowestPrice = estimatedPrice;
      result.source = 'demo'; // Mark as demo data

      console.log(`[PricingLookup] Demo prices: eBay £${result.ebayPrice}, Amazon £${result.amazonPrice}`);
    }

    // 5. Calculate profit estimate
    if (result.lowestPrice) {
      const estimatedCost = 8.00;
      const fees = result.lowestPrice * 0.15; // 15% marketplace fees
      const shipping = 2.15; // Royal Mail 2nd Class Large Letter (typical book 300-500g)
      result.profit = result.lowestPrice - estimatedCost - fees - shipping;
    }

    // 6. Cache the result for offline use (24 hour TTL)
    priceCache.cachePrice({
      isbn: result.isbn,
      title: result.title,
      author: result.author,
      publisher: result.publisher,
      thumbnail: result.thumbnail,
      ebayPrice: result.ebayPrice,
      amazonPrice: result.amazonPrice,
      source: result.source === 'demo' ? 'estimate' : 'api',
    });

    console.log(`[PricingLookup] ✅ Cached for 24h (source: ${result.source})`);

    res.json(result);
  } catch (error: any) {
    console.error('[PricingLookup] Error:', error);
    res.status(500).json({ message: error.message || 'Failed to lookup pricing' });
  }
});

// Create or update a book scan
router.post("/", requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const userId = getUserId(req);

    // Check scan limits before allowing the scan
    const user = await authService.getUserById(userId);
    if (user) {
      const limitService = scanLimitService(storage);
      const canScanResult = await limitService.canScan(user);

      if (!canScanResult.allowed) {
        return res.status(403).json({
          message: canScanResult.message,
          scansUsedToday: canScanResult.scansUsedToday,
          dailyLimit: canScanResult.dailyLimit,
        });
      }
    }

    const { isbn, title, author, ...otherData } = req.body;

    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }

    // Try to fetch book data from Google Books
    let bookData = { isbn, title, author, ...otherData };

    // Check if ISBN is fake (AI-generated)
    const isAIGeneratedISBN = isbn.startsWith('AI-');

    if (!title || title === `Book with ISBN ${isbn}` || isAIGeneratedISBN) {
      try {
        let googleBookData = null;

        if (isAIGeneratedISBN && title && author) {
          // Search by title + author for AI-generated ISBNs
          console.log(`AI-generated ISBN detected. Searching Google Books by title+author: "${title}" by ${author}`);
          const searchResults = await googleBooksService.search(`intitle:${title} inauthor:${author}`, 1);
          if (searchResults.length > 0) {
            googleBookData = searchResults[0];
            console.log(`Found book via search: ${googleBookData.title}`);
            // Update ISBN with real one if found
            if (googleBookData.isbn) {
              bookData.isbn = googleBookData.isbn;
            }
          }
        } else if (!isAIGeneratedISBN) {
          // Normal ISBN lookup
          console.log(`Looking up ISBN ${isbn} in Google Books...`);
          googleBookData = await googleBooksService.lookupByISBN(isbn);
        }

        if (googleBookData) {
          console.log(`Found book: ${googleBookData.title}`);
          bookData = {
            ...bookData,
            title: googleBookData.title,
            author: googleBookData.author || author || "Unknown Author",
            thumbnail: googleBookData.thumbnail,
            ...otherData,
          };
        } else {
          console.log(`No results found for ${isAIGeneratedISBN ? 'title+author' : 'ISBN'}`);
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
      console.log(`Looking up eBay pricing for ISBN ${bookData.isbn}...`);
      const ebayData = await ebayPricingService.getPriceByISBN(bookData.isbn, bookData.title);

      if (ebayData && ebayData.averagePrice) {
        console.log(`Found eBay average price: £${ebayData.averagePrice}`);
        bookData.ebayPrice = ebayData.averagePrice;
      } else {
        console.log(`No eBay pricing found for ISBN ${bookData.isbn}`);
      }
    } catch (ebayError: any) {
      console.error("eBay pricing error:", ebayError.message);
      // Continue without eBay pricing if it fails
    }

    // Try to fetch Amazon pricing data
    try {
      if (amazonPricingService.isConfigured()) {
        console.log(`Looking up Amazon pricing for ISBN ${bookData.isbn}...`);
        const amazonData = await amazonPricingService.getPriceByISBN(bookData.isbn);

        if (amazonData && amazonData.price) {
          console.log(`Found Amazon price: £${amazonData.price}`);
          bookData.amazonPrice = amazonData.price;
        } else {
          console.log(`No Amazon pricing found for ISBN ${bookData.isbn}`);
        }
      }
    } catch (amazonError: any) {
      console.error("Amazon pricing error:", amazonError.message);
      // Continue without Amazon pricing if it fails
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
router.patch("/:isbn", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { isbn } = req.params;
    const updates = req.body;

    // Find the book first to verify ownership
    const existingBook = await storage.getBookByISBN(isbn);

    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    // ✅ SECURITY: Verify user owns this book
    if (existingBook.userId !== userId) {
      return res.status(403).json({ message: "You do not have permission to update this book" });
    }

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
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const books = await storage.getBooks(userId);
    res.json(books);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Export books data
router.get("/export", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
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
router.get("/:isbn/prices", async (req, res) => {
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

// Sales velocity calculation endpoint
router.post("/calculate-velocity", async (req, res) => {
  try {
    const { salesRank, profit, profitMargin, yourCost, category } = req.body;

    if (!salesRank || salesRank < 1) {
      return res.status(400).json({ error: "Valid sales rank is required" });
    }

    // Calculate velocity analysis with profit-aware recommendations
    const profitData = (profit !== undefined && profitMargin !== undefined && yourCost !== undefined)
      ? { profit, profitMargin, purchaseCost: yourCost }
      : undefined;

    const analysis = salesVelocityService.calculateVelocity(
      salesRank,
      category || 'Books',
      profitData
    );
    const timeToSell = salesVelocityService.getTimeToSell(analysis.velocity.rating);

    // Get detailed recommendation with scoring
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

export default router;
