import { useState } from "react";
import { OfflineBanner } from "../OfflineBanner";

export default function OfflineBannerExample() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-4">
      <OfflineBanner
        isOnline={false}
        pendingCount={0}
        onSync={handleSync}
        isSyncing={isSyncing}
      />
      
      <OfflineBanner
        isOnline={true}
        pendingCount={5}
        onSync={handleSync}
        isSyncing={isSyncing}
      />
    </div>
  );
}
