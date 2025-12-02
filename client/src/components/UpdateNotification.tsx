/**
 * App Update Notification Component
 *
 * Shows when a new version of the PWA is available
 * Prompts user to reload to get the latest version
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, X } from "lucide-react";

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingServiceWorker, setWaitingServiceWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Check for updates
    navigator.serviceWorker.ready.then((registration) => {
      // Check if there's already a waiting service worker
      if (registration.waiting) {
        setWaitingServiceWorker(registration.waiting);
        setShowUpdate(true);
      }

      // Listen for new service worker installation
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and ready to activate
              setWaitingServiceWorker(newWorker);
              setShowUpdate(true);
              console.log('[UpdateNotification] New version available');
            }
          });
        }
      });
    });

    // Listen for service worker taking control (after skipWaiting)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    // Check for updates periodically (every 10 minutes)
    const checkForUpdates = () => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    };

    const updateInterval = setInterval(checkForUpdates, 10 * 60 * 1000);

    return () => {
      clearInterval(updateInterval);
    };
  }, []);

  const handleUpdate = () => {
    if (!waitingServiceWorker) return;

    // Tell the waiting service worker to skip waiting and become active
    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });

    // The page will reload automatically via the controllerchange event
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Show again in 30 minutes
    setTimeout(() => setShowUpdate(true), 30 * 60 * 1000);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 p-4 shadow-lg border-emerald-500 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            Update Available
          </h3>
          <p className="text-xs text-emerald-100 mb-3">
            A new version of ISBNScout is ready. Reload to get the latest features and improvements.
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleUpdate}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Update Now
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-emerald-100 hover:text-white hover:bg-emerald-700"
            >
              Later
            </Button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-emerald-200 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}
