import { Router } from "express";
import { requireAuth, getUserId } from "../middleware/auth";
import { storage } from "../storage";
import { EbayService } from "../ebay-service";
import { AmazonService } from "../amazon-service";
import { z } from "zod";

// Validation schema
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

const router = Router();

// Create a listing on eBay or Amazon
router.post("/", requireAuth, async (req, res) => {
  try {
    const listingData = createListingSchema.parse(req.body);
    const userId = getUserId(req);

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
      const userId = getUserId(req);
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
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const listings = await storage.getListings(userId);
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get listings for a specific book
router.get("/book/:bookId", requireAuth, async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = getUserId(req);
    const listings = await storage.getListingsByBook(userId, bookId);
    res.json(listings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
