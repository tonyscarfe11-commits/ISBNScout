import { CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface OfflineBannerProps {
  isOnline: boolean;
  pendingCount: number;
  onSync: () => void;
  isSyncing?: boolean;
}

export function OfflineBanner({
  isOnline,
  pendingCount,
  onSync,
  isSyncing = false,
}: OfflineBannerProps) {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`px-4 py-3 ${
        isOnline ? "bg-chart-3/20" : "bg-muted"
      } border-b flex items-center justify-between gap-4`}
      data-testid="banner-offline"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <CloudOff className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium truncate">
          {isOnline
            ? `${pendingCount} book${pendingCount !== 1 ? "s" : ""} pending sync`
            : "Offline Mode - Scans will sync when online"}
        </span>
      </div>
      {isOnline && pendingCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={onSync}
          disabled={isSyncing}
          data-testid="button-sync"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>
      )}
    </div>
  );
}
