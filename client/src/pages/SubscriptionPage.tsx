import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";
import { useAnalytics } from "@/lib/analytics";

const plans = [
  {
    id: "pro",
    name: "Pro",
    price: "£14.99",
    period: "/month",
    description: "Perfect for UK sellers sourcing weekly in charity shops",
    features: [
      "Unlimited scans",
      "Offline mode",
      "Barcode, cover & AI spine recognition",
      "Amazon + eBay UK profit calculator",
      "Royal Mail postage estimates",
      "Scan history",
    ],
    buttonText: "Start 14-Day Pro Trial",
    highlighted: true,
    yearlyInfo: "Prefer yearly? £149/year (save 2 months)",
  },
  {
    id: "elite",
    name: "Elite",
    price: "£19.99",
    period: "/month",
    description: "For high-volume sellers who need automation and analytics",
    features: [
      "Everything in Pro",
      "Buy / Don't Buy triggers",
      "Custom profit rules",
      "CSV export",
      "Multi-device access",
    ],
    buttonText: "Start 14-Day Elite Trial",
    highlighted: false,
    yearlyInfo: "Prefer yearly? £199/year (save 2 months)",
  },
];

const trialFeatures = [
  "Full Pro & Elite access",
  "No card required",
  "Cancel anytime",
];

export default function SubscriptionPage() {
  const { toast } = useToast();
  const { track } = useAnalytics();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const cancelled = urlParams.get('cancelled');

    if (sessionId) {
      track('Subscription Created', {
        sessionId,
        source: 'stripe_checkout',
      });
      toast({
        title: "Payment Successful!",
        description: "Your 14-day free trial has started. Welcome aboard!",
      });
      window.history.replaceState({}, '', '/subscription');
    } else if (cancelled) {
      track('Checkout Cancelled', {
        source: 'stripe_checkout',
      });
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/subscription');
    }
  }, [toast]);

  const handleSubscribe = async (planId: string) => {
    setIsLoading(planId);

    // Track checkout initiated
    track('Checkout Started', {
      planId,
      planType: 'monthly',
    });

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: `${planId}_monthly` }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        track('Redirected to Stripe', {
          planId,
        });
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Success",
          description: `Started 14-day trial for ${planId}!`,
        });
      }
    } catch (error: any) {
      track('Checkout Failed', {
        planId,
        error: error.message,
      });
      toast({
        title: "Error",
        description: error.message || "Failed to process subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Matching Landing Page */}
      <nav className="sticky top-0 bg-slate-700 border-b border-slate-600 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/")} 
            className="flex items-center gap-3 text-white hover:text-emerald-400 transition-colors"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
            <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
            <span className="text-lg font-bold">ISBNScout</span>
          </button>
          <Button 
            variant="ghost"
            onClick={() => setLocation("/auth")}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
            data-testid="button-login"
          >
            Log In
          </Button>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold text-slate-700 dark:text-slate-200">
            Simple pricing for serious UK book flippers
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Try ISBNScout free for 14 days. No nonsense, full access — test it in real charity shops before committing.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">14-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Check className="h-5 w-5 text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <Check className="h-5 w-5 text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Trial Info */}
          <div className="space-y-6">
            <div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 mb-3">
                14-DAY FREE TRIAL
              </Badge>
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3">
                Test it during sourcing runs
              </h2>
              <p className="text-sm text-muted-foreground">
                Scan books in charity shops, car-boots, and bargain bins with full features enabled.
              </p>
            </div>

            <ul className="space-y-2">
              {trialFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Pricing Cards */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 flex flex-col ${
                  plan.highlighted
                    ? "border-emerald-600 border-2 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                      {plan.name}
                    </h3>
                    {plan.highlighted && (
                      <Badge className="bg-emerald-600 text-white">POPULAR</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id}
                  className={`w-full mb-3 ${
                    plan.highlighted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : ""
                  }`}
                  data-testid={`button-subscribe-${plan.id}`}
                >
                  {isLoading === plan.id ? "Processing..." : plan.buttonText}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {plan.yearlyInfo}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center gap-2 px-8 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Secure Payments</span>
              <Badge variant="secondary" className="text-xs">Stripe Verified</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              256-bit SSL encryption • PCI compliant
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <section className="mt-16 bg-slate-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to find profitable books faster?
          </h2>
          <p className="text-base text-slate-300">
            Scan shelves, see real profit, and list to Amazon and eBay — even when your phone has no signal.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => handleSubscribe("pro")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-footer-trial"
            >
              Start 14-Day Free Trial
            </Button>
          </div>
          <p className="text-xs text-slate-400">
            No credit card required. Designed for UK sellers.
          </p>
        </div>
      </section>

      {/* Footer - Matching Landing Page */}
      <footer className="bg-slate-700 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ISBN Scout" className="h-6 w-6" />
              <span className="text-white font-semibold">ISBNScout</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button onClick={() => setLocation("/")} className="hover:text-emerald-400">Home</button>
              <button onClick={() => setLocation("/privacy")} className="hover:text-emerald-400">Privacy</button>
              <button onClick={() => setLocation("/terms")} className="hover:text-emerald-400">Terms</button>
              <a href="mailto:support@isbnscout.com" className="hover:text-emerald-400">Support</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-sm">
            <p>© 2025 ISBNScout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
