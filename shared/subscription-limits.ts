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
  free: {
    scansPerMonth: 100, // Limited free tier
    scansPerDay: 10, // 10 scans per day for free users
    canAutoList: false,
    canUseAI: false, // AI is expensive
    canUseShelfScan: false,
    canUseRepricing: false,
    canAccessAPI: false,
  },
  trial: {
    scansPerMonth: -1, // Unlimited during trial period (time-limited, not scan-limited)
    scansPerDay: -1, // No daily limit during trial
    canAutoList: true,
    canUseAI: true,
    canUseShelfScan: true,
    canUseRepricing: true,
    canAccessAPI: false,
  },
  pro_monthly: {
    scansPerMonth: -1, // Unlimited
    scansPerDay: -1, // Unlimited
    canAutoList: true,
    canUseAI: true,
    canUseShelfScan: true,
    canUseRepricing: true,
    canAccessAPI: false,
  },
  pro_yearly: {
    scansPerMonth: -1, // Unlimited
    scansPerDay: -1, // Unlimited
    canAutoList: true,
    canUseAI: true,
    canUseShelfScan: true,
    canUseRepricing: true,
    canAccessAPI: false,
  },
  elite_monthly: {
    scansPerMonth: -1, // Unlimited
    scansPerDay: -1, // Unlimited
    canAutoList: true,
    canUseAI: true,
    canUseShelfScan: true,
    canUseRepricing: true,
    canAccessAPI: true,
  },
  elite_yearly: {
    scansPerMonth: -1, // Unlimited
    scansPerDay: -1, // Unlimited
    canAutoList: true,
    canUseAI: true,
    canUseShelfScan: true,
    canUseRepricing: true,
    canAccessAPI: true,
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
