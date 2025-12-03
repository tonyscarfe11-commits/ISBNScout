import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 *
 * Since we use sameSite='none' for cross-origin support (Replit webview, PWA),
 * we need additional CSRF protection for state-changing operations.
 *
 * This implements a synchronizer token pattern:
 * 1. Server generates a token and stores it in the session
 * 2. Client includes token in X-CSRF-Token header or _csrf body field
 * 3. Server validates token matches session token
 */

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}

/**
 * Generate a CSRF token for the current session
 */
export function generateCsrfToken(req: Request): string {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

/**
 * Middleware to provide CSRF token to client
 * Add this to routes that render forms or need CSRF tokens
 */
export function provideCsrfToken(req: Request, res: Response, next: NextFunction): void {
  const token = generateCsrfToken(req);
  res.locals.csrfToken = token;
  // Also send in header for SPA convenience
  res.setHeader('X-CSRF-Token', token);
  next();
}

/**
 * Validate CSRF token from request
 */
function validateCsrfToken(req: Request): boolean {
  const sessionToken = req.session.csrfToken;
  if (!sessionToken) {
    return false;
  }

  // Check X-CSRF-Token header (preferred for SPAs)
  const headerToken = req.headers['x-csrf-token'];
  if (headerToken && headerToken === sessionToken) {
    return true;
  }

  // Check _csrf in body (for form submissions)
  const bodyToken = req.body?._csrf;
  if (bodyToken && bodyToken === sessionToken) {
    return true;
  }

  // Check _csrf in query (last resort, less secure)
  const queryToken = req.query?._csrf;
  if (queryToken && queryToken === sessionToken) {
    return true;
  }

  return false;
}

/**
 * Middleware to require CSRF token on state-changing operations
 * Apply this to POST, PUT, PATCH, DELETE routes that modify data
 *
 * Exemptions:
 * - Requests with no origin (mobile apps, curl, Postman)
 * - Webhook endpoints (authenticated differently)
 * - Auth endpoints (login/signup use other protection)
 */
export function requireCsrfToken(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF check for requests with no origin (mobile apps, server-to-server)
  // These requests can't be forged by a malicious website
  const origin = req.headers.origin || req.headers.referer;
  if (!origin) {
    return next();
  }

  // Skip CSRF check for webhook endpoints (they use other auth)
  if (req.path.startsWith('/api/webhooks/')) {
    return next();
  }

  // Skip CSRF check for auth endpoints (login/signup have rate limiting)
  if (req.path.startsWith('/api/auth/login') || req.path.startsWith('/api/auth/signup')) {
    return next();
  }

  // Require CSRF token for all other state-changing operations
  if (!validateCsrfToken(req)) {
    console.warn(`[CSRF] Rejected request from ${req.ip} to ${req.path} - invalid or missing token`);
    return res.status(403).json({
      message: 'Invalid or missing CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  next();
}

/**
 * Optional: Stricter CSRF protection that doesn't exempt no-origin requests
 * Use this for highly sensitive operations
 */
export function requireStrictCsrfToken(req: Request, res: Response, next: NextFunction): void {
  // Skip CSRF check for safe methods only
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Require CSRF token for ALL state-changing operations
  if (!validateCsrfToken(req)) {
    console.warn(`[CSRF] Strict mode: Rejected request from ${req.ip} to ${req.path} - invalid or missing token`);
    return res.status(403).json({
      message: 'Invalid or missing CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  next();
}
