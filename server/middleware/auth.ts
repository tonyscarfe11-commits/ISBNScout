import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

// Extend Express session type to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Token store (in production, use Redis or database for persistence)
const tokenStore = new Map<string, { userId: string; expiresAt: Date }>();
const affiliateTokenStore = new Map<string, { affiliateId: string; expiresAt: Date }>();

/**
 * Generate a cryptographically secure auth token for localStorage fallback
 * Uses crypto.randomBytes for unpredictable token values
 */
export function generateAuthToken(userId: string): string {
  // Generate a cryptographically secure random token (32 bytes = 256 bits)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  tokenStore.set(token, { userId, expiresAt });
  return token;
}

/**
 * Validate an auth token
 */
export function validateAuthToken(token: string): string | null {
  const data = tokenStore.get(token);
  if (!data) return null;
  if (new Date() > data.expiresAt) {
    tokenStore.delete(token);
    return null;
  }
  return data.userId;
}

/**
 * Remove an auth token (logout)
 */
export function removeAuthToken(token: string): void {
  tokenStore.delete(token);
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
    const userId = validateAuthToken(token);
    if (userId) {
      // Store in session for this request
      req.session.userId = userId;
      return next();
    }
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
 * Generate a cryptographically secure auth token for affiliates
 */
export function generateAffiliateToken(affiliateId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  affiliateTokenStore.set(token, { affiliateId, expiresAt });
  return token;
}

/**
 * Validate an affiliate auth token
 */
export function validateAffiliateToken(token: string): string | null {
  const data = affiliateTokenStore.get(token);
  if (!data) return null;
  if (new Date() > data.expiresAt) {
    affiliateTokenStore.delete(token);
    return null;
  }
  return data.affiliateId;
}

/**
 * Remove an affiliate auth token (logout)
 */
export function removeAffiliateToken(token: string): void {
  affiliateTokenStore.delete(token);
}
