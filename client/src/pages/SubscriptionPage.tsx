import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const plans = [
  {
    id: "free",
    name: "Starter",
    price: "£0",
    period: "forever",
    icon: Check,
    description: "Test the waters with basic scouting tools",
    features: [
      "10 book scans per month",
      "Basic price comparison (Amazon & eBay)",
      "Manual listing creation",
      "7-day price history",
      "Community forum access",
      "Mobile app access",
    ],
    limitations: [
      "No AI-powered features",
      "No bulk operations",
      "Limited analytics",
    ],
    buttonText: "Current Plan",
    highlighted: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: "£9.99",
    period: "per month",
    icon: Sparkles,
    description: "Perfect for part-time sellers (10-50 books/week)",
    features: [
      "100 scans per month (~25/week)",
      "AI photo recognition",
      "AI keyword optimization",
      "Auto-listing to 1 platform (choose Amazon FBA, FBM, or eBay)",
      "30-day price history & trends",
      "Email support (48hr response)",
      "Basic profit calculator",
      "Offline scanning mode",
    ],
    limitations: [],
    buttonText: "Upgrade to Basic",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "£24.99",
    period: "per month",
    icon: Zap,
    description: "For serious sellers making £2K+/month",
    features: [
      "Unlimited scans (scan as much as you want)",
      "Full AI suite (photo, keywords, descriptions)",
      "AI-generated product descriptions",
      "Auto-list to Amazon (FBA & FBM) + eBay simultaneously",
      "Priority email & chat support (4hr response)",
      "Advanced analytics & reporting dashboard",
      "Bulk upload & operations (up to 100 books)",
      "90-day price history with forecasting",
      "Custom automation rules",
      "Competitor price tracking",
      "Tax report export",
    ],
    limitations: [],
    buttonText: "Upgrade to Pro",
    highlighted: true,
    badge: "Most Popular - Best Value",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "£99.99",
    period: "per month",
    icon: Crown,
    description: "For established businesses & teams",
    features: [
      "Everything in Pro, plus:",
      "Up to 5 team user accounts",
      "Full API access for custom integrations",
      "White-label mobile app option",
      "Dedicated account manager",
      "Custom platform integrations",
      "99.9% uptime SLA guarantee",
      "Onboarding & training session",
      "Quarterly business reviews",
      "Early access to new features",
      "Custom reporting & data exports",
    ],
    limitations: [],
    buttonText: "Contact Sales",
    highlighted: false,
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
        description: "Your subscription has been activated. Welcome aboard!",
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
    if (planId === "enterprise") {
      toast({
        title: "Contact Sales",
        description: "Please email sales@isbnscout.com for Enterprise pricing",
      });
      return;
    }

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
          description: `Upgraded to ${planId} plan!`,
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
            Pricing Plans
          </Badge>
          <h1 className="text-4xl font-bold">
            Choose the Perfect Plan for Your Book Business
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as you grow. All plans include our core scanning
            and pricing features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
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
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period.split(' ')[1] || plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, index) => (
                    <li key={`limit-${index}`} className="flex items-start gap-2 opacity-60">
                      <span className="text-sm line-through">{limitation}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.id === "free" || isLoading === plan.id}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  {isLoading === plan.id
                    ? "Processing..."
                    : plan.id === "free"
                    ? "Current Plan"
                    : plan.buttonText}
                </Button>
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
                <span>Data export</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>All prices in GBP. Cancel anytime. 14-day money-back guarantee.</p>
        </div>
      </div>
    </div>
  );
}
