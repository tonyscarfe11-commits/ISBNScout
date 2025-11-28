import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

type BillingPeriod = 'monthly' | 'yearly';

const plans = [
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "£14.99",
    yearlyPrice: "£149",
    icon: Zap,
    description: "Perfect for UK sellers sourcing weekly in charity shops",
    features: [
      "Unlimited scans",
      "Offline mode",
      "Barcode, cover & AI spine recognition",
      "Amazon + eBay UK profit calculator",
      "Royal Mail & Evri postage estimates",
      "Scan history",
    ],
    buttonText: "Start 14-Day Pro Trial",
    highlighted: true,
    badge: "Most Popular",
    yearlySavings: "Save ~2 months",
  },
  {
    id: "elite",
    name: "Elite",
    monthlyPrice: "£19.99",
    yearlyPrice: "£199",
    icon: Crown,
    description: "For professional scouts who need advanced automation and analytics",
    features: [
      "Everything in Pro",
      "Buy / Don't Buy triggers",
      "Custom profit rules",
      "CSV export",
      "Multi-device access",
    ],
    buttonText: "Start 14-Day Elite Trial",
    highlighted: false,
    yearlySavings: "Save ~2½ months",
  },
];

export default function SubscriptionPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check if redirected from successful Stripe checkout
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const cancelled = urlParams.get('cancelled');

    if (sessionId) {
      toast({
        title: "Payment Successful! 🎉",
        description: "Your 14-day free trial has started. Welcome aboard!",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/subscription');
    } else if (cancelled) {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/subscription');
    }
  }, [toast]);

  const handleSubscribe = async (planId: string, period: BillingPeriod) => {
    const fullPlanId = `${planId}_${period}`;
    setIsLoading(fullPlanId);

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: fullPlanId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();

      // Redirect to Stripe checkout
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
    <div className="min-h-screen pb-20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="max-w-7xl mx-auto p-4 pt-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">
            14-Day Free Trial - No Card Required
          </Badge>
          <h1 className="text-4xl font-bold">
            Simple pricing for serious UK book flippers
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try ISBNScout free for 14 days. No nonsense, full access — test it in real charity shops before committing.
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center items-center gap-3 mt-8">
          <span className={`text-sm ${billingPeriod === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="relative w-14 h-8 rounded-full p-0"
          >
            <div className={`absolute w-6 h-6 bg-primary rounded-full transition-transform ${
              billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </Button>
          <span className={`text-sm ${billingPeriod === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {billingPeriod === 'yearly' && (
            <Badge variant="secondary" className="ml-2">
              Save up to £40/year
            </Badge>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const currentPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const fullPlanId = `${plan.id}_${billingPeriod}`;

            return (
              <Card
                key={plan.id}
                className={`relative p-6 flex flex-col ${
                  plan.highlighted
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {plan.badge}
                  </Badge>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    plan.highlighted ? "bg-primary text-primary-foreground" : "bg-primary/10"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{currentPrice}</span>
                    <span className="text-muted-foreground">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.yearlySavings}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id, billingPeriod)}
                  disabled={isLoading === fullPlanId}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  {isLoading === fullPlanId ? "Processing..." : plan.buttonText}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-3">
                  14-day free trial • No card required • Cancel anytime
                </p>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">
              All plans include
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Real-time pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Mobile app</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Offline mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Multi-platform</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Regular updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>UK-specific features</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>All prices in GBP. Try free for 14 days with full access. Cancel anytime during trial.</p>
          <p className="mt-2">After trial: Subscribe to continue scanning or your account will be paused.</p>
        </div>
      </div>
    </div>
  );
}
