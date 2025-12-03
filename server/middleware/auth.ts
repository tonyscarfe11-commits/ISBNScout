import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { storage } from "../storage";

// Extend Express session type to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

/**
 * Generate a cryptographically secure auth token for localStorage fallback
 * Uses crypto.randomBytes for unpredictable token values
 * Tokens are now persisted in database for production reliability
 */
export async function generateAuthToken(userId: string): Promise<string> {
  // Generate a cryptographically secure random token (32 bytes = 256 bits)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await storage.saveAuthToken(token, userId, 'user', expiresAt);
  return token;
}

/**
 * Validate an auth token
 */
export async function validateAuthToken(token: string): Promise<string | null> {
  const data = await storage.getAuthToken(token);
  if (!data) return null;
  if (new Date() > data.expiresAt) {
    await storage.deleteAuthToken(token);
    return null;
  }
  return data.userId;
}

/**
 * Remove an auth token (logout)
 */
export async function removeAuthToken(token: string): Promise<void> {
  await storage.deleteAuthToken(token);
}

/**
 * Middleware to require authentication
 * Checks session first, then Authorization header token as fallback
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // First check session
  if (req.session.userId) {
    return next();
  }

  // Fallback: check Authorization header for token
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    validateAuthToken(token).then(userId => {
      if (userId) {
        // Store in session for this request
        req.session.userId = userId;
        return next();
      }
      return res.status(401).json({ message: "Authentication required" });
    }).catch(err => {
      console.error('Token validation error:', err);
      return res.status(401).json({ message: "Authentication required" });
    });
    return; // Don't fall through to the 401 below
  }

  return res.status(401).json({ message: "Authentication required" });
}

/**
 * Middleware to optionally get user ID
 * Doesn't block the request if not authenticated
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Just continue - req.session.userId will be undefined if not authenticated
  next();
}

/**
 * Helper to get user ID from session, throwing if not present
 */
export function getUserId(req: Request): string {
  const userId = req.session.userId;
  if (!userId) {
    throw new Error("User ID not found in session");
  }
  return userId;
}

/**
 * Helper to get user ID from session or return null
 */
export function getUserIdOrNull(req: Request): string | null {
  return req.session.userId || null;
}

/**
 * Middleware to require admin access
 * Checks if user email is in ADMIN_EMAILS environment variable
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    // Get admin emails from environment
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];

    if (adminEmails.length === 0) {
      console.error('[SECURITY] ADMIN_EMAILS not configured - blocking all admin access');
      return res.status(403).json({
        message: "Admin access not configured",
        code: "ADMIN_NOT_CONFIGURED"
      });
    }

    // Import storage to get user
    const { storage } = await import('../storage');
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Check if user email is in admin list
    if (!adminEmails.includes(user.email.toLowerCase())) {
      console.warn(`[SECURITY] Unauthorized admin access attempt by user ${user.id} (${user.email})`);
      return res.status(403).json({
        message: "Admin access required",
        code: "ADMIN_ACCESS_REQUIRED"
      });
    }

    // Log admin access
    console.log(`[ADMIN] ${user.email} accessed admin endpoint: ${req.method} ${req.path}`);

    next();
  } catch (error) {
    console.error('[SECURITY] Admin middleware error:', error);
    return res.status(500).json({
      message: "Failed to verify admin access",
      code: "ADMIN_CHECK_FAILED"
    });
  }
}

/**
 * Generate a cryptographically secure auth token for affiliates
 */
export async function generateAffiliateToken(affiliateId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await storage.saveAuthToken(token, affiliateId, 'affiliate', expiresAt);
  return token;
}

/**
 * Validate an affiliate auth token
 */
export async function validateAffiliateToken(token: string): Promise<string | null> {
  const data = await storage.getAuthToken(token);
  if (!data) return null;
  if (data.type !== 'affiliate') return null;
  if (new Date() > data.expiresAt) {
    await storage.deleteAuthToken(token);
    return null;
  }
  return data.userId; // This is actually affiliateId for affiliate tokens
}

/**
 * Remove an affiliate auth token (logout)
 */
export async function removeAffiliateToken(token: string): Promise<void> {
  await storage.deleteAuthToken(token);
}
