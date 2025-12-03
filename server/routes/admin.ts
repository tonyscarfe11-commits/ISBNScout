import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Admin: Get all affiliates
router.get("/api/admin/affiliates", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { AffiliateService } = await import("../affiliate-service");
    const affiliates = await AffiliateService.getAllAffiliates();
    res.json(affiliates);
  } catch (error: any) {
    console.error("[Admin Get Affiliates] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Approve affiliate
router.post("/api/admin/affiliates/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { AffiliateService } = await import("../affiliate-service");
    const { id } = req.params;

    const affiliate = await AffiliateService.approveAffiliate(id);
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    res.json({ success: true, affiliate });
  } catch (error: any) {
    console.error("[Admin Approve Affiliate] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Reject affiliate
router.post("/api/admin/affiliates/:id/reject", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { AffiliateService } = await import("../affiliate-service");
    const { id } = req.params;

    const affiliate = await AffiliateService.rejectAffiliate(id);
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    res.json({ success: true, affiliate });
  } catch (error: any) {
    console.error("[Admin Reject Affiliate] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get pending commissions
router.get("/api/admin/commissions/pending", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { AffiliateService } = await import("../affiliate-service");
    const commissions = await AffiliateService.getPendingCommissions();
    res.json(commissions);
  } catch (error: any) {
    console.error("[Admin Get Pending Commissions] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Mark commission as paid
router.post("/api/admin/commissions/:id/pay", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { AffiliateService } = await import("../affiliate-service");
    const { id } = req.params;
    const { paypalTransactionId } = req.body;

    const commission = await AffiliateService.markCommissionPaid(id, paypalTransactionId);
    if (!commission) {
      return res.status(404).json({ message: "Commission not found" });
    }

    res.json({ success: true, commission });
  } catch (error: any) {
    console.error("[Admin Pay Commission] Error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
