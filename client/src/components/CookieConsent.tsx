import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie, Settings } from "lucide-react";
import { useLocation } from "wouter";

interface CookiePreferences {
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  affiliate: boolean;
}

export function CookieConsent() {
  const [, setLocation] = useLocation();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a cookie choice
    const hasConsented = localStorage.getItem('cookieConsent');
    const hasPreferences = localStorage.getItem('cookiePreferences');

    // Only show banner if they haven't made any choice
    if (!hasConsented && !hasPreferences) {
      // Small delay so it doesn't flash on page load
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      preferences: true,
      analytics: true,
      affiliate: true,
    };

    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    setShowBanner(false);
  };

  const rejectNonEssential = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      preferences: false,
      analytics: false,
      affiliate: false,
    };

    localStorage.setItem('cookieConsent', 'essential-only');
    localStorage.setItem('cookiePreferences', JSON.stringify(essentialOnly));
    setShowBanner(false);
  };

  const goToSettings = () => {
    setLocation('/cookies');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <Card className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-emerald-600 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shrink-0">
              <Cookie className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                We value your privacy
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to improve your experience, remember your preferences, and analyze site usage.
                Essential cookies are required for the site to function. You can customize your preferences anytime.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={acceptAll}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-accept-cookies"
                >
                  Accept All Cookies
                </Button>

                <Button
                  onClick={rejectNonEssential}
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  data-testid="button-reject-cookies"
                >
                  Essential Only
                </Button>

                <Button
                  onClick={goToSettings}
                  variant="ghost"
                  className="gap-2"
                  data-testid="button-cookie-settings"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                By clicking "Accept All Cookies", you agree to our use of cookies as described in our{" "}
                <button
                  onClick={() => setLocation('/cookies')}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  Cookie Policy
                </button>
                .
              </p>
            </div>

            <button
              onClick={rejectNonEssential}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors shrink-0"
              aria-label="Close and use essential cookies only"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
