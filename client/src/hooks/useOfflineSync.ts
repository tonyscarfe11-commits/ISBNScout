import { useState, useEffect } from "react";
import { getOfflineSyncService, type OfflineStatus } from "@/lib/offline-sync";

/**
 * React hook for offline sync status
 *
 * Usage:
 * ```tsx
 * const { isOnline, pendingSync, lastSync, forceSyncNow } = useOfflineSync();
 *
 * {!isOnline && <OfflineBanner />}
 * {pendingSync > 0 && <div>{pendingSync} items waiting to sync</div>}
 * ```
 */
export function useOfflineSync() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    pendingSync: 0,
    lastSync: null,
  });

  useEffect(() => {
    const syncService = getOfflineSyncService();

    // Subscribe to status changes
    const unsubscribe = syncService.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Get initial status
    setStatus(syncService.getStatus());

    return () => {
      unsubscribe();
    };
  }, []);

  const forceSyncNow = async () => {
    const syncService = getOfflineSyncService();
    await syncService.forceSyncNow();
  };

  return {
    isOnline: status.isOnline,
    pendingSync: status.pendingSync,
    lastSync: status.lastSync,
    forceSyncNow,
  };
}
