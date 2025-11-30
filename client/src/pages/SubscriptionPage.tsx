import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

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
    yearlyInfo: "Prefer yearly? £189/year (save ~2 months)",
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
    yearlyInfo: "Prefer yearly? £199/year (save ~2½ months)",
  },
];

const trialFeatures = [
  "Full Pro & Elite access",
  "No card required",
  "Cancel anytime",
];

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check if redirected from successful Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const cancelled = urlParams.get('cancelled');

    if (sessionId) {
      toast({
        title: "Payment Successful!",
        description: "Your 14-day free trial has started. Welcome aboard!",
      });
      window.history.replaceState({}, '', '/subscription');
    } else if (cancelled) {
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
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: "Success",
          description: `Started 14-day trial for ${planId}!`,
        });
      }
    } catch (error: any) {
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
      <AppHeader />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold text-foreground">
            Simple pricing for serious UK book flippers
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Try ISBNScout free for 14 days. No nonsense, full access — test it in real charity shops before committing.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Trial Info */}
          <div className="space-y-6">
            <div>
              <Badge className="bg-teal-100 text-teal-800 border-teal-200 mb-3">
                14-DAY FREE TRIAL
              </Badge>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Test it during sourcing runs
              </h2>
              <p className="text-sm text-muted-foreground">
                Scan books in charity shops, car-boots, and bargain bins with full features enabled.
              </p>
            </div>

            <ul className="space-y-2">
              {trialFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
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
                    ? "border-teal-600 border-2 bg-teal-50 dark:bg-teal-950/30"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
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
                      <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id}
                  className={`w-full mb-3 ${
                    plan.highlighted
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
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
      </div>

      {/* Footer CTA */}
      <section className="mt-16 bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to find profitable books faster?
          </h2>
          <p className="text-base opacity-90">
            Scan shelves, see real profit, and list to Amazon and eBay — even when your phone has no signal.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => handleSubscribe("pro")}
              className="bg-teal-600 hover:bg-teal-700 text-white"
              data-testid="button-footer-trial"
            >
              Start 14-Day Free Trial
            </Button>
          </div>
          <p className="text-xs opacity-75">
            No credit card required. Designed for UK sellers.
          </p>
        </div>
      </section>
    </div>
  );
}
