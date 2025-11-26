/**
 * Trial & Scan Limit Service
 *
 * Handles:
 * - Anonymous trial scans (10 scans total)
 * - Browser fingerprint tracking
 * - Enforcing limits
 * - Converting to paid
 */

import type { SQLiteStorage } from "./sqlite-storage";

export interface TrialStatus {
  scansUsed: number;
  scansLimit: number;
  scansRemaining: number;
  isTrialActive: boolean;
  requiresUpgrade: boolean;
}

export class TrialService {
  private storage: SQLiteStorage;

  // Configurable limits (easy to change later!)
  private readonly TRIAL_SCAN_LIMIT = 10;

  constructor(storage: SQLiteStorage) {
    this.storage = storage;
    this.initTrialTracking();
  }

  private initTrialTracking() {
    // Track anonymous user scans by fingerprint/IP
    this.storage.db.exec(`
      CREATE TABLE IF NOT EXISTS trial_scans (
        fingerprint TEXT PRIMARY KEY,
        scansUsed INTEGER DEFAULT 0,
        firstScanAt TEXT NOT NULL,
        lastScanAt TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('[Trial] Trial tracking initialized');
  }

  /**
   * Check if user can scan (trial or paid)
   * Returns true if allowed, false if limit reached
   */
  async canScan(userId: string | null, fingerprint: string): Promise<boolean> {
    // Paid user: Always allowed (check their subscription limits)
    if (userId) {
      const user = await this.storage.getUser(userId);
      if (user?.subscriptionTier && user.subscriptionTier !== 'trial') {
        return true; // Paid subscribers can scan
      }
    }

    // Anonymous or trial user: Check trial limit
    const trialStatus = this.getTrialStatus(fingerprint);
    return trialStatus.scansRemaining > 0;
  }

  /**
   * Get trial status for anonymous user
   */
  getTrialStatus(fingerprint: string): TrialStatus {
    const row = this.storage.db
      .prepare('SELECT scansUsed FROM trial_scans WHERE fingerprint = ?')
      .get(fingerprint) as any;

    const scansUsed = row?.scansUsed || 0;
    const scansRemaining = Math.max(0, this.TRIAL_SCAN_LIMIT - scansUsed);

    return {
      scansUsed,
      scansLimit: this.TRIAL_SCAN_LIMIT,
      scansRemaining,
      isTrialActive: scansRemaining > 0,
      requiresUpgrade: scansRemaining === 0,
    };
  }

  /**
   * Record a scan for anonymous user
   */
  recordTrialScan(fingerprint: string): void {
    const now = new Date().toISOString();

    const existing = this.storage.db
      .prepare('SELECT scansUsed FROM trial_scans WHERE fingerprint = ?')
      .get(fingerprint) as any;

    if (existing) {
      // Increment scan count
      this.storage.db
        .prepare(`
          UPDATE trial_scans
          SET scansUsed = scansUsed + 1, lastScanAt = ?
          WHERE fingerprint = ?
        `)
        .run(now, fingerprint);
    } else {
      // First scan for this user
      this.storage.db
        .prepare(`
          INSERT INTO trial_scans (fingerprint, scansUsed, firstScanAt, lastScanAt)
          VALUES (?, 1, ?, ?)
        `)
        .run(fingerprint, now, now);
    }

    console.log(`[Trial] Scan recorded for ${fingerprint.substring(0, 8)}...`);
  }

  /**
   * Get stats for monitoring
   */
  getTrialStats() {
    const stats = this.storage.db
      .prepare(`
        SELECT
          COUNT(*) as totalTrialUsers,
          SUM(scansUsed) as totalTrialScans,
          COUNT(CASE WHEN scansUsed >= ? THEN 1 END) as usersHitLimit
        FROM trial_scans
      `)
      .get(this.TRIAL_SCAN_LIMIT) as any;

    return {
      totalTrialUsers: stats.totalTrialUsers || 0,
      totalTrialScans: stats.totalTrialScans || 0,
      usersHitLimit: stats.usersHitLimit || 0,
      conversionOpportunities: stats.usersHitLimit || 0,
    };
  }

  /**
   * Clear old trial data (GDPR cleanup - older than 90 days)
   */
  cleanupOldTrials() {
    const result = this.storage.db
      .prepare(`
        DELETE FROM trial_scans
        WHERE createdAt < datetime('now', '-90 days')
      `)
      .run();

    console.log(`[Trial] Cleaned up ${result.changes} old trial records`);
    return result.changes;
  }
}

// Export singleton
let trialServiceInstance: TrialService | null = null;

export function getTrialService(storage: SQLiteStorage): TrialService {
  if (!trialServiceInstance) {
    trialServiceInstance = new TrialService(storage);
  }
  return trialServiceInstance;
}
