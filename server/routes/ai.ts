import { Router } from "express";
import { aiService } from "../ai-service";
import { aiLimiter } from "../middleware/rate-limit";

const router = Router();

// Apply rate limiting to all AI routes
router.use(aiLimiter);

// AI: Analyze single book image
router.post("/analyze-image", async (req, res) => {
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

// Multi-book scanning (SHELF SCANNING - killer feature!)
router.post("/analyze-shelf", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    console.log('[Shelf Scan] Starting multi-book analysis...');
    const result = await aiService.analyzeMultipleBooks(imageUrl);

    console.log(`[Shelf Scan] Success! Detected ${result.totalBooksDetected} books`);
    res.json(result);
  } catch (error: any) {
    console.error('[Shelf Scan] Error:', error);
    res.status(500).json({ message: error.message || "Failed to analyze shelf" });
  }
});

// AI: Optimize listing keywords
router.post("/optimize-keywords", async (req, res) => {
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
router.post("/generate-description", async (req, res) => {
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

export default router;
