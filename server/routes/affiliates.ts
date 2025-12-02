import { Router } from "express";
import { requireAuth, getUserId, generateAffiliateToken, validateAffiliateToken, removeAffiliateToken } from "../middleware/auth";
import { storage } from "../storage";
import { AffiliateService } from "../affiliate-service";

const router = Router();

// Affiliate signup/registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, website, socialMedia, audience } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const affiliate = await AffiliateService.createAffiliate({
      name,
      email,
      password,
      website,
      socialMedia,
      audience,
    });

    console.log("[Affiliate Registration]", { id: affiliate.id, name: affiliate.name, email: affiliate.email });

    res.json({
      success: true,
      message: "Registration successful! Your application is pending approval. We'll email you once approved.",
      referralCode: affiliate.referralCode
    });
  } catch (error: any) {
    console.error("[Affiliate Registration] Error:", error);
    if (error.message?.includes("unique constraint")) {
      return res.status(400).json({ message: "An affiliate with this email already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Affiliate login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await AffiliateService.authenticateAffiliate(email, password);

    if (!result) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if ('error' in result && result.error === "pending") {
      return res.status(403).json({
        message: `Your account is ${result.affiliate.status}. Please wait for approval.`,
        status: result.affiliate.status
      });
    }

    const affiliateToken = generateAffiliateToken(result.affiliate.id);

    res.json({
      success: true,
      affiliateToken,
      affiliate: {
        id: result.affiliate.id,
        name: result.affiliate.name,
        email: result.affiliate.email,
        referralCode: result.affiliate.referralCode,
        commissionRate: result.affiliate.commissionRate,
      }
    });
  } catch (error: any) {
    console.error("[Affiliate Login] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Track referral click (from ?ref=CODE on landing page)
router.post("/track-click", async (req, res) => {
  try {
    const { referralCode, landingPage } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required" });
    }

    const affiliate = await AffiliateService.getAffiliateByReferralCode(referralCode);
    if (!affiliate || affiliate.status !== "approved") {
      return res.status(404).json({ message: "Invalid referral code" });
    }

    const click = await AffiliateService.trackReferralClick(affiliate.id, {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      referrer: req.headers.referer,
      landingPage,
    });

    res.json({
      success: true,
      affiliateId: affiliate.id,
      clickId: click.id
    });
  } catch (error: any) {
    console.error("[Track Referral Click] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get affiliate dashboard stats
router.get("/dashboard", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.substring(7);
    const affiliateId = validateAffiliateToken(token);

    if (!affiliateId) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const stats = await AffiliateService.getAffiliateStats(affiliateId);
    if (!stats) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    res.json(stats);
  } catch (error: any) {
    console.error("[Affiliate Dashboard] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Validate referral code (for cookie tracking)
router.get("/validate/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const affiliate = await AffiliateService.getAffiliateByReferralCode(code);
    if (!affiliate || affiliate.status !== "approved") {
      return res.status(404).json({ valid: false });
    }

    res.json({
      valid: true,
      affiliateId: affiliate.id,
      referralCode: affiliate.referralCode
    });
  } catch (error: any) {
    console.error("[Validate Referral Code] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Legacy affiliate application endpoint (for compatibility)
router.post("/apply", async (req, res) => {
  try {
    const { name, email, website, socialMedia, audience, howDidYouHear } = req.body;

    if (!name || !email || !audience) {
      return res.status(400).json({ message: "Name, email, and audience description are required" });
    }

    const sanitize = (str: string | undefined, maxLen: number = 500): string => {
      if (!str) return '';
      return String(str)
        .replace(/<[^>]*>/g, '')
        .replace(/[<>'"&]/g, '')
        .trim()
        .slice(0, maxLen);
    };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const sanitizedData = {
      name: sanitize(name, 100),
      email: sanitize(email, 255),
      website: sanitize(website, 255),
      socialMedia: sanitize(socialMedia, 255),
      audience: sanitize(audience, 1000),
      howDidYouHear: sanitize(howDidYouHear, 255),
      appliedAt: new Date().toISOString(),
    };

    console.log("[Affiliate Application]", sanitizedData);

    res.json({
      success: true,
      message: "Application received! We'll be in touch within 48 hours."
    });
  } catch (error: any) {
    console.error("[Affiliate Application] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
