import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap, Check } from "lucide-react";
import { useLocation } from "wouter";

export interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: 'trial_expired' | 'feature_locked';
  featureName?: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  reason = 'trial_expired',
  featureName = 'this feature',
}: UpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    onOpenChange(false);
    setLocation('/subscription');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {reason === 'trial_expired' ? 'Your Trial Has Ended' : 'Upgrade to Continue'}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {reason === 'trial_expired'
              ? 'Your 14-day free trial has expired. Upgrade now to continue using ISBNScout.'
              : `Upgrade to a paid plan to access ${featureName}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <p className="text-sm font-semibold">Continue enjoying:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Unlimited book scanning with barcode camera</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Real-time Amazon & eBay pricing</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Advanced profit calculator with platform comparison</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Scan history & profit tracking</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Basic</span>
              </div>
              <p className="text-2xl font-bold">£9.99</p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
            <div className="p-3 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Pro</span>
              </div>
              <p className="text-2xl font-bold">£24.99</p>
              <p className="text-xs text-muted-foreground">per month</p>
              <span className="text-xs text-primary font-semibold">Most Popular</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={handleUpgrade}
              className="w-full"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              View Plans & Upgrade
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
