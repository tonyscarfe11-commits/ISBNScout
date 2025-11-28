/**
 * PWA Install Prompt Component
 *
 * Shows a banner encouraging users to install the app to their home screen
 * Appears after user has scanned a few books (shows value first)
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[InstallPrompt] App already installed');
      return;
    }

    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        console.log('[InstallPrompt] User dismissed recently');
        return;
      }
    }

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // For iOS, show manual instructions after user scans 3+ books
      const scanCount = parseInt(localStorage.getItem('total-scans') || '0');
      if (scanCount >= 3) {
        setShowPrompt(true);
      }
    } else {
      // For Android/Chrome, listen for beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        const promptEvent = e as BeforeInstallPromptEvent;
        setDeferredPrompt(promptEvent);

        // Show prompt after user has scanned at least 3 books
        const scanCount = parseInt(localStorage.getItem('total-scans') || '0');
        if (scanCount >= 3) {
          setShowPrompt(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[InstallPrompt] User choice: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('[InstallPrompt] User accepted install');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 p-4 shadow-lg border-teal-500 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <Download className="w-5 h-5 text-teal-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">
            Install ISBNScout
          </h3>

          {isIOS ? (
            <p className="text-xs text-slate-300 mb-3">
              Tap the <strong>Share</strong> button below, then <strong>"Add to Home Screen"</strong> for faster access and offline use.
            </p>
          ) : (
            <p className="text-xs text-slate-300 mb-3">
              Add to your home screen for faster access and full offline support. No app store needed!
            </p>
          )}

          <div className="flex gap-2">
            {!isIOS && deferredPrompt && (
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Install Now
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              Maybe Later
            </Button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-slate-400 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
}

/**
 * Hook to track scan count for install prompt timing
 */
export function useTrackScansForInstall() {
  const incrementScanCount = () => {
    const currentCount = parseInt(localStorage.getItem('total-scans') || '0');
    localStorage.setItem('total-scans', (currentCount + 1).toString());
  };

  return { incrementScanCount };
}
