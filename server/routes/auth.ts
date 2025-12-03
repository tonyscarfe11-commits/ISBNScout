import { Router } from "express";
import { authService } from "../auth-service";
import { generateAuthToken, removeAuthToken } from "../middleware/auth";
import { loginLimiter, signupLimiter } from "../middleware/rate-limit";

const router = Router();

// POST /api/auth/signup
router.post("/signup", signupLimiter, async (req, res) => {
  try {
    const { username, email, password, affiliateId } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    const user = await authService.signup(username, email, password);

    // Link to affiliate if referred
    if (affiliateId) {
      try {
        const { AffiliateService } = await import("../affiliate-service");
        await AffiliateService.linkUserToAffiliate(user.id, affiliateId);
        console.log(`[Signup] Linked user ${user.id} to affiliate ${affiliateId}`);
      } catch (error) {
        console.error('[Signup] Failed to link affiliate:', error);
      }
    }

    // Set session
    req.session.userId = user.id;

    // Generate token for localStorage fallback
    const authToken = await generateAuthToken(user.id);

    // Explicitly save session
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ user, authToken, message: "Account created successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await authService.login(email, password);

    // Set session
    req.session.userId = user.id;

    // Generate token for localStorage fallback (for embedded contexts)
    const authToken = await generateAuthToken(user.id);

    // Explicitly save session
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          reject(err);
        } else {
          console.log(`✓ Session saved for user ${user.id}, sessionID: ${req.sessionID}`);
          resolve();
        }
      });
    });

    res.json({ user, authToken, message: "Logged in successfully" });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  // Remove token if provided in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    await removeAuthToken(token);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
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

export default router;
