import { Router } from "express";
import { storage } from "../storage";
import { RepricingService } from "../repricing-service";
import { RepricingScheduler } from "../repricing-scheduler";
import { AmazonService } from "../amazon-service";
import { EbayService } from "../ebay-service";

const router = Router();

// Singleton repricing service and scheduler
const repricingService = new RepricingService();
const repricingScheduler = new RepricingScheduler(storage, repricingService);

// Start repricing scheduler
repricingScheduler.start();

// POST /api/repricing/rules - Create a new repricing rule
router.post("/rules", async (req, res) => {
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

    // Register user for automated repricing if rule is active
    if (rule.isActive === "true") {
      repricingScheduler.registerUser(userId);
    }

    res.json(rule);
  } catch (error: any) {
    console.error("[Repricing] Create rule error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/repricing/rules - Get all repricing rules for user
router.get("/rules", async (req, res) => {
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

// GET /api/repricing/rules/:id - Get a specific repricing rule
router.get("/rules/:id", async (req, res) => {
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

// PATCH /api/repricing/rules/:id - Update a repricing rule
router.patch("/rules/:id", async (req, res) => {
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
      if (isNaN(minPriceNum)) {
        return res.status(400).json({ message: "Existing min price is invalid" });
      }
    }

    if (req.body.maxPrice !== undefined) {
      maxPriceNum = typeof req.body.maxPrice === 'number' ? req.body.maxPrice : parseFloat(req.body.maxPrice);
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        return res.status(400).json({ message: "Max price must be a positive number" });
      }
      updates.maxPrice = maxPriceNum.toString();
    } else {
      maxPriceNum = parseFloat(existingRule.maxPrice);
      if (isNaN(maxPriceNum)) {
        return res.status(400).json({ message: "Existing max price is invalid" });
      }
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

    if (!updatedRule) {
      return res.status(404).json({ message: "Repricing rule not found" });
    }

    // Register/unregister user for automated repricing based on isActive status
    if (updatedRule.isActive === "true") {
      repricingScheduler.registerUser(userId);
    } else {
      // Check if user has any other active rules before unregistering
      const allRules = await storage.getRepricingRules(userId);
      const hasOtherActiveRules = allRules.some(r => r.id !== id && r.isActive === "true");
      if (!hasOtherActiveRules) {
        repricingScheduler.unregisterUser(userId);
      }
    }

    res.json(updatedRule);
  } catch (error: any) {
    console.error("[Repricing] Update rule error:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/repricing/rules/:id - Delete a repricing rule
router.delete("/rules/:id", async (req, res) => {
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

    // Unregister user if they have no more active rules
    const allRules = await storage.getRepricingRules(userId);
    const hasActiveRules = allRules.some(r => r.id !== id && r.isActive === "true");
    if (!hasActiveRules) {
      repricingScheduler.unregisterUser(userId);
    }

    res.json({ success: deleted });
  } catch (error: any) {
    console.error("[Repricing] Delete rule error:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/repricing/run - Manually trigger repricing
router.post("/run", async (req, res) => {
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

// GET /api/repricing/history - Get repricing history
router.get("/history", async (req, res) => {
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

export default router;
