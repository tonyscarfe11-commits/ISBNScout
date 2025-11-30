import type { IStorage } from "../storage";
import { getSubscriptionLimits, hasReachedScanLimit, hasReachedDailyLimit } from "@shared/subscription-limits";
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
   * Count scans for a user today
   */
  async getScansToday(userId: string): Promise<number> {
    const books = await this.storage.getBooks(userId);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return books.filter(book =>
      new Date(book.scannedAt) >= startOfDay
    ).length;
  }

  /**
   * Check if user can scan (hasn't reached daily or monthly limit)
   */
  async canScan(user: Omit<User, 'password'>): Promise<{
    allowed: boolean;
    scansUsedToday: number;
    scansUsedMonth: number;
    dailyLimit: number;
    monthlyLimit: number;
    message?: string;
  }> {
    const scansUsedToday = await this.getScansToday(user.id);
    const scansUsedMonth = await this.getScansThisMonth(user.id);
    const limits = getSubscriptionLimits(user.subscriptionTier);
    const dailyLimit = limits.scansPerDay;
    const monthlyLimit = limits.scansPerMonth;

    // Check daily limit first
    if (dailyLimit !== -1 && hasReachedDailyLimit(scansUsedToday, user.subscriptionTier)) {
      return {
        allowed: false,
        scansUsedToday,
        scansUsedMonth,
        dailyLimit,
        monthlyLimit,
        message: `You've reached your daily scan limit. Please try again tomorrow or upgrade your plan.`,
      };
    }

    // Check monthly limit
    if (monthlyLimit !== -1 && hasReachedScanLimit(scansUsedMonth, user.subscriptionTier)) {
      return {
        allowed: false,
        scansUsedToday,
        scansUsedMonth,
        dailyLimit,
        monthlyLimit,
        message: `You've reached your ${monthlyLimit} scans/month limit. Upgrade to continue scanning.`,
      };
    }

    return {
      allowed: true,
      scansUsedToday,
      scansUsedMonth,
      dailyLimit: dailyLimit === -1 ? Infinity : dailyLimit,
      monthlyLimit: monthlyLimit === -1 ? Infinity : monthlyLimit,
    };
  }

  /**
   * Get scan limit info for dashboard display
   */
  async getScanLimitInfo(user: Omit<User, 'password'>): Promise<{
    scansUsedToday: number;
    scansUsedMonth: number;
    dailyLimit: number;
    monthlyLimit: number;
    scansRemainingToday: number;
    scansRemainingMonth: number;
    percentUsedToday: number;
    percentUsedMonth: number;
    isUnlimited: boolean;
    tier: string;
  }> {
    const scansUsedToday = await this.getScansToday(user.id);
    const scansUsedMonth = await this.getScansThisMonth(user.id);
    const limits = getSubscriptionLimits(user.subscriptionTier);
    const dailyLimit = limits.scansPerDay;
    const monthlyLimit = limits.scansPerMonth;

    const isUnlimited = dailyLimit === -1 && monthlyLimit === -1;

    if (isUnlimited) {
      return {
        scansUsedToday,
        scansUsedMonth,
        dailyLimit: Infinity,
        monthlyLimit: Infinity,
        scansRemainingToday: Infinity,
        scansRemainingMonth: Infinity,
        percentUsedToday: 0,
        percentUsedMonth: 0,
        isUnlimited: true,
        tier: user.subscriptionTier,
      };
    }

    const scansRemainingToday = dailyLimit === -1 ? Infinity : Math.max(0, dailyLimit - scansUsedToday);
    const scansRemainingMonth = monthlyLimit === -1 ? Infinity : Math.max(0, monthlyLimit - scansUsedMonth);
    const percentUsedToday = dailyLimit === -1 ? 0 : Math.min(100, Math.round((scansUsedToday / dailyLimit) * 100));
    const percentUsedMonth = monthlyLimit === -1 ? 0 : Math.min(100, Math.round((scansUsedMonth / monthlyLimit) * 100));

    return {
      scansUsedToday,
      scansUsedMonth,
      dailyLimit: dailyLimit === -1 ? Infinity : dailyLimit,
      monthlyLimit: monthlyLimit === -1 ? Infinity : monthlyLimit,
      scansRemainingToday,
      scansRemainingMonth,
      percentUsedToday,
      percentUsedMonth,
      isUnlimited: false,
      tier: user.subscriptionTier,
    };
  }
}

export const scanLimitService = (storage: IStorage) => new ScanLimitService(storage);
