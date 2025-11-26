/**
 * Browser Fingerprinting for Anonymous User Tracking
 *
 * Uses IP + User-Agent to create semi-persistent identifier
 * Not perfect, but good enough for trial limits
 */

import crypto from 'crypto';
import type { Request } from 'express';

export function getBrowserFingerprint(req: Request): string {
  // Get IP address (handles proxies)
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.headers['x-real-ip']?.toString() ||
    req.socket.remoteAddress ||
    'unknown';

  // Get user agent
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Create hash from IP + UA
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex')
    .substring(0, 16); // First 16 chars is enough

  return fingerprint;
}

/**
 * Check if request is from authenticated user
 */
export function isAuthenticated(req: Request): boolean {
  return !!req.session?.userId;
}

/**
 * Get user ID or fingerprint
 */
export function getUserIdentifier(req: Request): { userId: string | null; fingerprint: string } {
  const userId = req.session?.userId || null;
  const fingerprint = getBrowserFingerprint(req);

  return { userId, fingerprint };
}
