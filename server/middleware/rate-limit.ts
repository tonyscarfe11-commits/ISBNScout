import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/**
 * Generate rate limit key based on user ID (if authenticated) or IP address
 * This prevents users from bypassing limits by switching IPs
 *
 * Note: When falling back to IP, we return undefined to let express-rate-limit
 * use its default IP key generator which properly handles IPv6
 */
function getUserOrIpKey(req: Request): string | undefined {
  const userId = req.session?.userId;
  if (userId) {
    return `user:${userId}`;
  }
  // Return undefined to use default IP-based key generator (handles IPv6 properly)
  return undefined;
}

/**
 * Get rate limit based on subscription tier
 * Trial users get lower limits than paid subscribers
 */
async function getSubscriptionTierLimit(req: Request, baseLimit: number): Promise<number> {
  const userId = req.session?.userId;
  if (!userId) {
    return baseLimit; // Use base limit for unauthenticated users
  }

  try {
    // Import storage dynamically to avoid circular dependency
    const { storage } = await import('../storage');
    const user = await storage.getUser(userId);

    if (!user) {
      return baseLimit;
    }

    // Increase limits for paid tiers
    switch (user.subscriptionTier) {
      case 'elite_monthly':
      case 'elite_yearly':
        return baseLimit * 3; // 3x limit for elite
      case 'pro_monthly':
      case 'pro_yearly':
        return baseLimit * 2; // 2x limit for pro
      case 'trial':
      default:
        return baseLimit; // Standard limit for trial
    }
  } catch (error) {
    console.error('[RateLimit] Error fetching user tier:', error);
    return baseLimit; // Fallback to base limit on error
  }
}

/**
 * Rate limiter for login attempts
 * 5 attempts per 15 minutes per IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for signup attempts
 * 3 signups per hour per IP to prevent spam
 */
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    message: 'Too many accounts created from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for API endpoints
 * User-based with tier multipliers:
 * - Trial: 100 req/min
 * - Pro: 200 req/min
 * - Elite: 300 req/min
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: async (req) => {
    return await getSubscriptionTierLimit(req, 100);
  },
  keyGenerator: getUserOrIpKey,
  message: {
    message: 'Too many requests, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/api/health';
  },
});

/**
 * Strict rate limiter for expensive API operations (pricing lookups)
 * User-based with tier multipliers:
 * - Trial: 20 req/min
 * - Pro: 40 req/min
 * - Elite: 60 req/min
 */
export const pricingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: async (req) => {
    return await getSubscriptionTierLimit(req, 20);
  },
  keyGenerator: getUserOrIpKey,
  message: {
    message: 'Too many pricing requests, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for AI endpoints
 * User-based with tier multipliers:
 * - Trial: 10 req/min
 * - Pro: 20 req/min
 * - Elite: 30 req/min
 */
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: async (req) => {
    return await getSubscriptionTierLimit(req, 10);
  },
  keyGenerator: getUserOrIpKey,
  message: {
    message: 'Too many AI requests, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
