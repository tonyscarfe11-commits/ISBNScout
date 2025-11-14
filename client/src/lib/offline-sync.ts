/**
 * Offline Sync Service for Mobile Apps
 *
 * Detects network status and manages background sync
 * Works with HybridStorage on the backend
 */

export class OfflineSyncService {
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(status: OfflineStatus) => void> = [];
  private syncCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupNetworkListeners();
    this.startSyncCheck();
  }

  private setupNetworkListeners() {
    window.addEventListener("online", () => {
      console.log("[OfflineSync] Network connection restored");
      this.isOnline = true;
      this.notifyListeners();
      this.triggerSync();
    });

    window.addEventListener("offline", () => {
      console.log("[OfflineSync] Network connection lost");
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  private startSyncCheck() {
    // Check sync status every 10 seconds
    this.syncCheckInterval = setInterval(() => {
      if (this.isOnline) {
        this.checkSyncStatus();
      }
    }, 10000);
  }

  private async checkSyncStatus() {
    try {
      const response = await fetch("/api/sync/status");
      if (response.ok) {
        const status = await response.json();
        this.notifyListeners(status);
      }
    } catch (error) {
      // Offline or error - ignore
    }
  }

  private async triggerSync() {
    try {
      console.log("[OfflineSync] Triggering background sync...");
      const response = await fetch("/api/sync/trigger", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[OfflineSync] Synced ${result.count} items`);
        this.notifyListeners(result);
      }
    } catch (error) {
      console.warn("[OfflineSync] Sync failed:", error);
    }
  }

  getStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      pendingSync: 0, // Will be updated by server
      lastSync: null,
    };
  }

  onStatusChange(callback: (status: OfflineStatus) => void) {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(serverStatus?: any) {
    const status: OfflineStatus = {
      isOnline: this.isOnline,
      pendingSync: serverStatus?.pendingSync || 0,
      lastSync: serverStatus?.lastSync
        ? new Date(serverStatus.lastSync)
        : null,
    };

    this.listeners.forEach((listener) => listener(status));
  }

  async forceSyncNow(): Promise<void> {
    if (!this.isOnline) {
      throw new Error("Cannot sync while offline");
    }
    await this.triggerSync();
  }

  destroy() {
    if (this.syncCheckInterval) {
      clearInterval(this.syncCheckInterval);
    }
    window.removeEventListener("online", this.setupNetworkListeners);
    window.removeEventListener("offline", this.setupNetworkListeners);
  }
}

export interface OfflineStatus {
  isOnline: boolean;
  pendingSync: number;
  lastSync: Date | null;
}

// Global singleton instance
let syncService: OfflineSyncService | null = null;

export function getOfflineSyncService(): OfflineSyncService {
  if (!syncService) {
    syncService = new OfflineSyncService();
  }
  return syncService;
}
