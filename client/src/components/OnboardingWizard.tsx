import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { 
  BookOpen, 
  PoundSterling, 
  Scan, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Target,
  Zap
} from "lucide-react";
import { saveUserCosts, getUserCosts, type UserCosts } from "./CostEditor";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  { id: 1, title: "Welcome", icon: BookOpen },
  { id: 2, title: "Your Costs", icon: PoundSterling },
  { id: 3, title: "How It Works", icon: Scan },
  { id: 4, title: "Ready!", icon: CheckCircle2 },
];

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [costs, setCosts] = useState<UserCosts>(getUserCosts);

  const progress = (step / STEPS.length) * 100;

  const handleNext = () => {
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    saveUserCosts(costs);
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('hasSeenWelcome', 'true');
    onComplete();
  };

  const handleCostChange = (field: keyof UserCosts, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCosts(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Welcome to ISBNScout</DialogTitle>
          <DialogDescription>Set up your book scouting preferences</DialogDescription>
        </VisuallyHidden>
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4">
          <div className="flex items-center justify-between text-white mb-3">
            <span className="text-sm font-medium">Step {step} of {STEPS.length}</span>
            <span className="text-sm opacity-80">{STEPS[step - 1].title}</span>
          </div>
          <Progress value={progress} className="h-2 bg-teal-800" />
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto">
                <BookOpen className="h-10 w-10 text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to ISBNScout</h2>
                <p className="text-muted-foreground">
                  Find profitable books in seconds. Scan, check prices, decide to buy or skip.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
                    <Scan className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-xs font-medium">Scan Barcode</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-medium">See Profit</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-xs font-medium">Buy or Skip</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-3">
                  <PoundSterling className="h-8 w-8 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold mb-1">Set Your Buying Costs</h2>
                <p className="text-sm text-muted-foreground">
                  We use these to calculate your actual profit
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Charity Shop Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={costs.charityShopCost}
                        onChange={(e) => handleCostChange('charityShopCost', e.target.value)}
                        className="pl-7"
                        data-testid="input-charity-cost"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Car Boot Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={costs.carBootCost}
                        onChange={(e) => handleCostChange('carBootCost', e.target.value)}
                        className="pl-7"
                        data-testid="input-carboot-cost"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Shipping Cost
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={costs.estimatedShipping}
                        onChange={(e) => handleCostChange('estimatedShipping', e.target.value)}
                        className="pl-7"
                        data-testid="input-shipping-cost"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Platform Fees %
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="1"
                        value={costs.feePercentage}
                        onChange={(e) => handleCostChange('feePercentage', e.target.value)}
                        className="pr-7"
                        data-testid="input-fee-percentage"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                You can change these anytime in Settings
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-3">
                  <Scan className="h-8 w-8 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold mb-1">How to Scout</h2>
                <p className="text-sm text-muted-foreground">
                  It's as simple as 1-2-3
                </p>
              </div>

              <div className="space-y-3">
                <Card className="p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Scan the barcode</p>
                    <p className="text-xs text-muted-foreground">Point camera at ISBN barcode on back of book</p>
                  </div>
                </Card>

                <Card className="p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">See the verdict</p>
                    <p className="text-xs text-muted-foreground">BUY (green), SKIP (red), or MAYBE (yellow)</p>
                  </div>
                </Card>

                <Card className="p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Decide & move on</p>
                    <p className="text-xs text-muted-foreground">Buy it or put it back - then scan the next one!</p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <Sparkles className="h-10 w-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
                <p className="text-muted-foreground">
                  Start scanning books and finding profitable deals.
                </p>
              </div>
              <Card className="p-4 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800">
                <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
                  Pro Tip: Scan fast, decide fast. Speed is your advantage!
                </p>
              </Card>
            </div>
          )}
        </div>

        <div className="p-4 bg-muted/30 border-t flex justify-between">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              data-testid="button-onboarding-back"
            >
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={handleNext}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
            data-testid="button-onboarding-next"
          >
            {step === STEPS.length ? "Start Scanning" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboardingCompleted');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('hasSeenWelcome');
    setShowOnboarding(true);
  };

  return { showOnboarding, completeOnboarding, resetOnboarding };
}
