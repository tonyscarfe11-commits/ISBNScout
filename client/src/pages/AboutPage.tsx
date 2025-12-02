import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Play } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function AboutPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Video Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              See ISBNScout in action.
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              A quick 20-30 second walkthrough: shelf scan, spine recognition, instant profit analysis, and buy/skip decision.
            </p>
          </div>

          {/* Video Placeholder */}
          <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center mb-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white/10 rounded-full">
                  <Play className="h-8 w-8 text-white fill-white" />
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Embed your Capcut / YouTube demo here.
              </p>
            </div>
          </div>
        </section>

        {/* CTA to Pricing */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your 14-day free trial today. No credit card required.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/subscription")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-features-trial"
          >
            Start Free Trial
          </Button>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-700 py-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>© 2025 ISBNScout. All rights reserved.</p>
            <div className="flex justify-center gap-6">
              <button onClick={() => setLocation("/subscription")} className="hover:text-emerald-600" data-testid="link-footer-pricing">
                Pricing
              </button>
              <button onClick={() => setLocation("/blog")} className="hover:text-emerald-600" data-testid="link-footer-docs">
                Docs
              </button>
              <button onClick={() => setLocation("/faq")} className="hover:text-emerald-600" data-testid="link-footer-contact">
                Contact
              </button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-emerald-600" data-testid="link-footer-privacy">
                Privacy
              </button>
              <button onClick={() => setLocation("/terms")} className="hover:text-emerald-600" data-testid="link-footer-terms">
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
