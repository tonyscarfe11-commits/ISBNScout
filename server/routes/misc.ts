import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { storage } from "../storage";
import { authService } from "../auth-service";
import { scanLimitService } from "../services/scan-limit-service";
import { z } from "zod";
import { getPriceCache } from "../price-cache";

const router = Router();

// Validation schemas
const saveCredentialsSchema = z.object({
  platform: z.enum(['ebay', 'amazon']),
  credentials: z.record(z.any()),
});

/**
 * Health check endpoint
 */
router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * Get current user info (with optional auth for backwards compatibility)
 * Supports both session cookies and Bearer token auth
 */
router.get("/user/me", async (req, res) => {
  try {
    // Check session first
    let userId = req.session.userId;

    // Fallback: check Authorization header for token
    if (!userId) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { validateAuthToken } = await import("../middleware/auth");
        userId = await validateAuthToken(token) || undefined;
        if (userId) {
          // Store in session for this request
          req.session.userId = userId;
        }
      }
    }

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await authService.getUserById(userId);

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

/**
 * Get trial status for authenticated user
 */
router.get("/user/trial-status", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
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

/**
 * Get scan limit info for authenticated user
 */
router.get("/user/scan-limits", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const limitService = scanLimitService(storage);
    const limitInfo = await limitService.getScanLimitInfo(user);

    res.json(limitInfo);
  } catch (error: any) {
    console.error("Get scan limits error:", error);
    res.status(500).json({
      message: error.message || "Failed to get scan limits",
    });
  }
});

/**
 * Get trial status (works for both anonymous and authenticated)
 */
router.get("/trial/status", async (req, res) => {
  try {
    const { getUserIdentifier } = await import("../fingerprint");
    const { getTrialService } = await import("../trial-service");

    const { userId, fingerprint } = getUserIdentifier(req);
    const trialService = getTrialService((storage as any).local || storage);

    // If authenticated, get subscription info
    if (userId) {
      const user = await authService.getUserById(userId);
      const isPaid = user && user.subscriptionTier && user.subscriptionTier !== 'trial';

      return res.json({
        isAuthenticated: true,
        isPaidSubscriber: isPaid,
        subscriptionTier: user?.subscriptionTier || 'trial',
        // Paid users don't have trial limits
        ...(!isPaid && {
          ...trialService.getTrialStatus(fingerprint)
        })
      });
    }

    // Anonymous user - return trial status
    const trialStatus = trialService.getTrialStatus(fingerprint);
    res.json({
      isAuthenticated: false,
      isPaidSubscriber: false,
      ...trialStatus,
    });
  } catch (error: any) {
    console.error("Get trial status error:", error);
    res.status(500).json({ message: error.message || "Failed to get trial status" });
  }
});

/**
 * Get API credentials for a platform
 */
router.get("/credentials/:platform", requireAuth, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = getUserId(req);

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

/**
 * Save API credentials
 */
router.post("/credentials", requireAuth, async (req, res) => {
  try {
    const { platform, credentials } = saveCredentialsSchema.parse(req.body);
    const userId = getUserId(req);

    await storage.saveApiCredentials(userId, platform, credentials);
    res.json({ success: true, message: "Credentials saved successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request data", errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get API usage statistics
 */
router.get("/usage", async (req, res) => {
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
        today: { ebay: { service: 'ebay', date: today, callCount: 0 } },
        limits: { ebay: { daily: 5000, remaining: 5000 } }
      });
    }
  } catch (error: any) {
    console.error("Get usage error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Sync scans from client (offline queue) to server
 */
router.post("/scans/sync", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { scans } = req.body;

    if (!Array.isArray(scans)) {
      return res.status(400).json({ message: "Scans must be an array" });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    // Process each scan
    for (const scan of scans) {
      try {
        const { isbn, title, author, ...otherData } = scan;

        if (!isbn) {
          results.failed++;
          results.errors.push({ isbn: 'unknown', error: 'ISBN is required' });
          continue;
        }

        // Create or update book scan
        await storage.createBook({
          ...scan,
          userId,
          createdAt: scan.createdAt ? new Date(scan.createdAt) : new Date(),
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          isbn: scan?.isbn || 'unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      synced: results.success,
      failed: results.failed,
      errors: results.errors,
    });
  } catch (error: any) {
    console.error("[Scans] Sync error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get scan history for the user
 */
router.get("/scans/history", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { limit = 100, offset = 0 } = req.query;

    // Get books as scan history
    const books = await storage.getBooks(userId);

    // Sort by scan date (most recent first) and paginate
    const sortedBooks = books.sort((a, b) => {
      const dateA = new Date(a.scannedAt || 0).getTime();
      const dateB = new Date(b.scannedAt || 0).getTime();
      return dateB - dateA;
    });

    const paginatedBooks = sortedBooks.slice(
      Number(offset),
      Number(offset) + Number(limit)
    );

    res.json({
      scans: paginatedBooks,
      total: books.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error: any) {
    console.error("[Scans] History error:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Get sync status (pending operations count, last sync time)
 */
router.get("/sync/status", (req, res) => {
  try {
    // Check if storage has sync queue (only HybridStorage does)
    if (typeof (storage as any).getSyncQueueStatus === 'function') {
      const status = (storage as any).getSyncQueueStatus();
      res.json({
        pendingSync: status.pendingCount || 0,
        lastSync: status.lastSync || null,
      });
    } else {
      // If not using hybrid storage, just return empty status
      res.json({
        pendingSync: 0,
        lastSync: null,
      });
    }
  } catch (error: any) {
    console.error("[Sync] Status error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Manually trigger a sync
 */
router.post("/sync/trigger", async (req, res) => {
  try {
    // Check if storage has sync functionality (only HybridStorage does)
    if (typeof (storage as any).triggerSync === 'function') {
      const result = await (storage as any).triggerSync();
      res.json({
        success: true,
        count: result.syncedCount || 0,
        message: "Sync completed successfully",
      });
    } else {
      // If not using hybrid storage, just return success with 0 count
      res.json({
        success: true,
        count: 0,
        message: "No sync required (not using offline mode)",
      });
    }
  } catch (error: any) {
    console.error("[Sync] Trigger error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Offline price lookup (works with cached data)
 */
router.post("/offline/lookup", async (req, res) => {
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

/**
 * Get cache statistics
 */
router.get("/offline/stats", (req, res) => {
  try {
    const priceCache = getPriceCache();
    const stats = priceCache.getStats();
    res.json(stats);
  } catch (error: any) {
    console.error("[OfflineLookup] Stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Image proxy to avoid CORS issues with Google Books images
 */
router.get("/proxy-image", async (req, res) => {
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

/**
 * Amazon affiliate redirect - adds partner tag securely
 */
router.get("/amazon/redirect", (req, res) => {
  const { isbn, title } = req.query;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;

  // Use ISBN if available, otherwise use title for search
  const searchTerm = isbn || title || '';

  // Build Amazon UK search URL with affiliate tag
  let amazonUrl = `https://www.amazon.co.uk/s?k=${encodeURIComponent(String(searchTerm))}`;

  if (partnerTag) {
    amazonUrl += `&tag=${partnerTag}`;
    console.log(`[Amazon Redirect] Redirecting with affiliate tag: ${partnerTag}`);
  } else {
    console.log('[Amazon Redirect] No partner tag configured');
  }

  res.redirect(amazonUrl);
});

export default router;
