import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { storage } from "../storage";

const router = Router();

// POST /api/inventory - Create new inventory item
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
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

// GET /api/inventory - Get all inventory items for user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const items = await storage.getInventoryItems(userId);
    res.json(items);
  } catch (error: any) {
    console.error("[API] Error fetching inventory items:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/inventory/:id - Get specific inventory item by ID
router.get("/:id", async (req, res) => {
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

// GET /api/inventory/book/:bookId - Get inventory items for specific book
router.get("/book/:bookId", requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = getUserId(req);
    const items = await storage.getInventoryItemsByBook(userId, bookId);
    res.json(items);
  } catch (error: any) {
    console.error("[API] Error fetching inventory items for book:", error);
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/inventory/:id - Update inventory item
router.patch("/:id", requireAuth, async (req, res) => {
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

// DELETE /api/inventory/:id - Delete inventory item
router.delete("/:id", requireAuth, async (req, res) => {
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

export default router;
