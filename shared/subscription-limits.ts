/**
 * Subscription tier limits and features
 */

export interface SubscriptionLimits {
  scansPerMonth: number;
  scansPerDay: number; // Daily fair use limit (-1 = unlimited)
  canAutoList: boolean;
  canUseAI: boolean;
  canUseShelfScan: boolean;
  canUseRepricing: boolean;
  canAccessAPI: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  trial: {
    scansPerMonth: 10,
    scansPerDay: 10, // Can use all 10 in one day if they want
    canAutoList: false,
    canUseAI: false,
    canUseShelfScan: false,
    canUseRepricing: false,
    canAccessAPI: false,
  },
  free: {
    scansPerMonth: 10,
    scansPerDay: 10,
    canAutoList: false,
    canUseAI: false,
    canUseShelfScan: false,
    canUseRepricing: false,
    canAccessAPI: false,
  },
  basic: {
    scansPerMonth: 100,
    scansPerDay: 50, // 50/day = ~100/month (with some days off)
    canAutoList: false,
    canUseAI: false,
    canUseShelfScan: false,
    canUseRepricing: false,
    canAccessAPI: false,
  },
  pro: {
    scansPerMonth: -1, // Unlimited
    scansPerDay: 500, // Fair use limit: 500 scans/day
    canAutoList: true,
    canUseAI: true,
    canUseShelfScan: true,
    canUseRepricing: true,
    canAccessAPI: false,
  },
  enterprise: {
    scansPerMonth: -1, // Unlimited
    scansPerDay: -1, // Truly unlimited (no daily cap)
    canAutoList: true,
    canUseAI: true,
    canUseShelfScan: true,
    canUseRepricing: true,
    canAccessAPI: false, // API not implemented yet
  },
};

/**
 * Get subscription limits for a given tier
 */
export function getSubscriptionLimits(tier: string): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.trial;
}

/**
 * Check if user has reached their monthly scan limit
 */
export function hasReachedScanLimit(
  scansThisMonth: number,
  tier: string
): boolean {
  const limits = getSubscriptionLimits(tier);
  if (limits.scansPerMonth === -1) {
    return false; // Unlimited monthly
  }
  return scansThisMonth >= limits.scansPerMonth;
}

/**
 * Check if user has reached their daily scan limit
 */
export function hasReachedDailyLimit(
  scansToday: number,
  tier: string
): boolean {
  const limits = getSubscriptionLimits(tier);
  if (limits.scansPerDay === -1) {
    return false; // Unlimited daily
  }
  return scansToday >= limits.scansPerDay;
}
