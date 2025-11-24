/**
 * Subscription tier limits and features
 */

export interface SubscriptionLimits {
  scansPerMonth: number;
  canAutoList: boolean;
  canUseAI: boolean;
  canUseRepricing: boolean;
  canAccessAPI: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<string, SubscriptionLimits> = {
  trial: {
    scansPerMonth: 10,
    canAutoList: false,
    canUseAI: false,
    canUseRepricing: false,
    canAccessAPI: false,
  },
  free: {
    scansPerMonth: 10,
    canAutoList: false,
    canUseAI: false,
    canUseRepricing: false,
    canAccessAPI: false,
  },
  basic: {
    scansPerMonth: 100,
    canAutoList: false,
    canUseAI: false,
    canUseRepricing: false,
    canAccessAPI: false,
  },
  pro: {
    scansPerMonth: -1, // Unlimited
    canAutoList: true,
    canUseAI: true,
    canUseRepricing: true,
    canAccessAPI: false,
  },
  enterprise: {
    scansPerMonth: -1, // Unlimited
    canAutoList: true,
    canUseAI: true,
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
 * Check if user has reached their scan limit
 */
export function hasReachedScanLimit(
  scansThisMonth: number,
  tier: string
): boolean {
  const limits = getSubscriptionLimits(tier);
  if (limits.scansPerMonth === -1) {
    return false; // Unlimited
  }
  return scansThisMonth >= limits.scansPerMonth;
}
