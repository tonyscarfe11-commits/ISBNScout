import type { Request, Response, NextFunction } from "express";

// Extend Express session type to include userId
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
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
