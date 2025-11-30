import type { Request, Response, NextFunction } from "express";

// Extend Express session type to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Simple token store (in production, use Redis or database)
const tokenStore = new Map<string, { userId: string; expiresAt: Date }>();

/**
 * Generate a simple auth token for localStorage fallback
 */
export function generateAuthToken(userId: string): string {
  const token = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
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
