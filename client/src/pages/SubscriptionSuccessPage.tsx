import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function SubscriptionSuccessPage() {
  const [, navigate] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [planName, setPlanName] = useState("Premium");

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      navigate("/subscription");
      return;
    }

    // Verify payment and update subscription
    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/subscription/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          const planNames: Record<string, string> = {
            basic: "Basic",
            pro: "Pro",
            enterprise: "Enterprise",
          };
          setPlanName(planNames[data.planId] || "Premium");

          // Save to localStorage so it persists
          localStorage.setItem('userPlan', data.planId);

          setIsVerifying(false);

          // Redirect to dashboard after 5 seconds
          setTimeout(() => {
            navigate("/app/dashboard");
          }, 5000);
        } else {
          console.error("Failed to verify payment");
          setIsVerifying(false);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="w-20 h-20 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              Verifying Payment...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we activate your subscription
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-background to-green-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-600">
            Payment Successful! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for subscribing to ISBNScout {planName}!
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Your subscription has been activated and you now have access to all premium features.
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium">
              ✓ Payment processed successfully
            </p>
            <p className="text-sm font-medium">
              ✓ Subscription activated
            </p>
            <p className="text-sm font-medium">
              ✓ Receipt sent to your email
            </p>
          </div>

          <div className="pt-4 space-y-2">
            <Button
              onClick={() => navigate("/app/dashboard")}
              className="w-full"
              size="lg"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              Start Scanning Books
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Redirecting to dashboard in 5 seconds...
          </p>
        </div>
      </Card>
    </div>
  );
}
