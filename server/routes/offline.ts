import { Router } from "express";
import { getPriceCache } from "../price-cache";

const router = Router();

/**
 * Offline price lookup endpoint
 * Works even without internet by using cached data
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
 * Export cache for backup
 */
router.get("/offline/export", (req, res) => {
  try {
    const priceCache = getPriceCache();
    const cache = priceCache.exportCache();
    res.json({ count: cache.length, data: cache });
  } catch (error: any) {
    console.error("[OfflineLookup] Export error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Import cache from backup
 */
router.post("/offline/import", (req, res) => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid import data" });
    }

    const priceCache = getPriceCache();
    priceCache.importCache(data);

    res.json({ success: true, imported: data.length });
  } catch (error: any) {
    console.error("[OfflineLookup] Import error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Clear old cache entries
 */
router.post("/offline/cleanup", (req, res) => {
  try {
    const priceCache = getPriceCache();
    const deleted = priceCache.clearOldCache();
    res.json({ success: true, deleted });
  } catch (error: any) {
    console.error("[OfflineLookup] Cleanup error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
