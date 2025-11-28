/**
 * Subscription Middleware
 *
 * Simple logic:
 * 1. Trial still active? → allow
 * 2. Subscription active? → allow
 * 3. Else → block scanning
 */

import type { Request, Response, NextFunction } from "express";
import { authService } from "../auth-service";

/**
 * Check if user has active trial OR active subscription
 */
export async function requireActiveSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        error: "authentication_required",
        message: "You must be logged in to scan",
      });
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: "user_not_found",
        message: "User not found",
      });
    }

    const now = new Date();

    // Check if user has active trial
    if (user.subscriptionTier === 'trial') {
      // Trial must have a valid end date and still be active
      if (user.trialEndsAt && new Date(user.trialEndsAt) > now && user.subscriptionStatus === 'active') {
        return next(); // ✅ Trial is active
      }

      // Trial expired
      return res.status(403).json({
        error: "trial_expired",
        message: "Your free trial has ended. Please subscribe to continue scanning.",
        trialEndedAt: user.trialEndsAt,
      });
    }

    // Check if user has active paid subscription
    const isPaidTier = ['pro_monthly', 'pro_yearly', 'elite_monthly', 'elite_yearly'].includes(
      user.subscriptionTier || ''
    );

    if (isPaidTier) {
      // Check subscription status
      if (user.subscriptionStatus !== 'active') {
        return res.status(403).json({
          error: "subscription_inactive",
          message: `Your subscription is ${user.subscriptionStatus}. Please update your payment method.`,
          status: user.subscriptionStatus,
        });
      }

      // Check if subscription hasn't expired
      if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < now) {
        return res.status(403).json({
          error: "subscription_expired",
          message: "Your subscription has expired. Please renew to continue scanning.",
          expiredAt: user.subscriptionExpiresAt,
        });
      }

      return next(); // ✅ Subscription is active
    }

    // Unknown tier or no valid subscription
    return res.status(403).json({
      error: "no_active_subscription",
      message: "No active subscription found. Please subscribe to continue scanning.",
      tier: user.subscriptionTier,
    });
  } catch (error: any) {
    console.error("[Subscription Middleware] Error:", error);
    return res.status(500).json({
      error: "internal_error",
      message: "Failed to verify subscription status",
    });
  }
}

/**
 * Helper function to check subscription status (non-blocking)
 * Returns subscription state for displaying UI
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  hasAccess: boolean;
  tier: string;
  status: string;
  expiresAt: Date | null;
  trialEndsAt: Date | null;
  daysRemaining: number | null;
}> {
  const user = await authService.getUserById(userId);

  if (!user) {
    return {
      hasAccess: false,
      tier: 'none',
      status: 'inactive',
      expiresAt: null,
      trialEndsAt: null,
      daysRemaining: null,
    };
  }

  const now = new Date();

  // Check trial
  if (user.subscriptionTier === 'trial') {
    const isActive = user.trialEndsAt
      && new Date(user.trialEndsAt) > now
      && user.subscriptionStatus === 'active';

    const daysRemaining = user.trialEndsAt
      ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      hasAccess: !!isActive,
      tier: 'trial',
      status: user.subscriptionStatus || 'inactive',
      expiresAt: null,
      trialEndsAt: user.trialEndsAt,
      daysRemaining,
    };
  }

  // Check paid subscription
  const isPaidTier = ['pro_monthly', 'pro_yearly', 'elite_monthly', 'elite_yearly'].includes(
    user.subscriptionTier || ''
  );

  if (isPaidTier) {
    const isActive = user.subscriptionStatus === 'active'
      && (!user.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt) > now);

    const daysRemaining = user.subscriptionExpiresAt
      ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      hasAccess: isActive,
      tier: user.subscriptionTier || 'unknown',
      status: user.subscriptionStatus || 'inactive',
      expiresAt: user.subscriptionExpiresAt,
      trialEndsAt: null,
      daysRemaining,
    };
  }

  // Unknown/invalid tier
  return {
    hasAccess: false,
    tier: user.subscriptionTier || 'unknown',
    status: user.subscriptionStatus || 'inactive',
    expiresAt: null,
    trialEndsAt: null,
    daysRemaining: null,
  };
}
