import type { IStorage } from "../storage";
import { getSubscriptionLimits, hasReachedScanLimit } from "@shared/subscription-limits";
import type { User } from "@shared/schema";

export class ScanLimitService {
  constructor(private storage: IStorage) {}

  /**
   * Count scans for a user in the current month
   */
  async getScansThisMonth(userId: string): Promise<number> {
    const books = await this.storage.getBooks(userId);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return books.filter(book =>
      new Date(book.scannedAt) >= startOfMonth
    ).length;
  }

  /**
   * Check if user can scan (hasn't reached limit)
   */
  async canScan(user: Omit<User, 'password'>): Promise<{
    allowed: boolean;
    scansUsed: number;
    scansLimit: number;
    message?: string;
  }> {
    const scansUsed = await this.getScansThisMonth(user.id);
    const limits = getSubscriptionLimits(user.subscriptionTier);
    const scansLimit = limits.scansPerMonth;

    // Check if unlimited
    if (scansLimit === -1) {
      return {
        allowed: true,
        scansUsed,
        scansLimit: Infinity,
      };
    }

    // Check if limit reached
    const hasReachedLimit = hasReachedScanLimit(scansUsed, user.subscriptionTier);

    if (hasReachedLimit) {
      return {
        allowed: false,
        scansUsed,
        scansLimit,
        message: `You've reached your ${scansLimit} scans/month limit. Upgrade to continue scanning.`,
      };
    }

    return {
      allowed: true,
      scansUsed,
      scansLimit,
    };
  }

  /**
   * Get scan limit info for dashboard display
   */
  async getScanLimitInfo(user: Omit<User, 'password'>): Promise<{
    scansUsed: number;
    scansLimit: number;
    scansRemaining: number;
    percentUsed: number;
    isUnlimited: boolean;
  }> {
    const scansUsed = await this.getScansThisMonth(user.id);
    const limits = getSubscriptionLimits(user.subscriptionTier);
    const scansLimit = limits.scansPerMonth;

    if (scansLimit === -1) {
      return {
        scansUsed,
        scansLimit: Infinity,
        scansRemaining: Infinity,
        percentUsed: 0,
        isUnlimited: true,
      };
    }

    const scansRemaining = Math.max(0, scansLimit - scansUsed);
    const percentUsed = Math.min(100, Math.round((scansUsed / scansLimit) * 100));

    return {
      scansUsed,
      scansLimit,
      scansRemaining,
      percentUsed,
      isUnlimited: false,
    };
  }
}

export const scanLimitService = (storage: IStorage) => new ScanLimitService(storage);
