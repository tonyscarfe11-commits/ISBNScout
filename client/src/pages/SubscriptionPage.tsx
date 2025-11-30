import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/AppHeader";
import { Check, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const plans = [
  {
    id: "trial",
    name: "Free Trial",
    price: "£0",
    period: "14 days",
    icon: Zap,
    description: "Full access for 14 days. No credit card required.",
    features: [
      "Unlimited book scans",
      "Offline mode",
      "Barcode & AI recognition",
      "Real-time profit calculations",
      "Both Amazon MFN & eBay support",
      "Full feature access",
    ],
    buttonText: "Start Free Trial",
    highlighted: false,
    badge: null,
  },
  {
    id: "pro",
    name: "Pro",
    price: "£4.99",
    period: "/month",
    icon: Crown,
    description: "Unlimited scouting after trial. Best for serious scouts.",
    features: [
      "Everything in Free Trial",
      "Daily data updates",
      "Both Amazon MFN & eBay support",
      "Offline mode",
      "Scan history & analytics",
      "Priority support",
    ],
    buttonText: "Subscribe Now",
    highlighted: true,
    badge: "Most Popular",
  },
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

  const handleSubscribe = async (planId: string) => {
    setIsLoading(planId);

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
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
          description: `Started ${planId === 'trial' ? 'free trial' : 'subscription'}!`,
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
      <AppHeader />
      <div className="max-w-7xl mx-auto p-4 pt-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="mb-4">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl font-bold">
            Start free. Pay only if you love it.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try ISBNScout completely free for 14 days. Full access, no credit card required. Then just £4.99/month if you want to keep scouting smarter.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <Card
                key={plan.id}
                className={`relative p-8 flex flex-col ${
                  plan.highlighted
                    ? "border-teal-600 border-2 bg-teal-50 dark:bg-teal-950"
                    : "border-teal-200 dark:border-teal-700"
                }`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white">
                    {plan.badge}
                  </Badge>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    plan.highlighted ? "bg-teal-600 text-white" : "bg-teal-100 dark:bg-teal-900"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  {plan.description}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isLoading === plan.id}
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {isLoading === plan.id ? "Processing..." : plan.buttonText}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  {plan.id === 'trial' ? 'No card required • Cancel anytime' : 'Cancel anytime • No long-term contracts'}
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

        <div className="text-center text-sm text-muted-foreground mt-12">
          <p>All prices in GBP. No long-term contracts. Cancel anytime, even during your free trial.</p>
          <p className="mt-2">After your 14-day trial ends, subscribe to keep using ISBNScout or your account will be paused.</p>
        </div>
      </div>
    </div>
  );
}
