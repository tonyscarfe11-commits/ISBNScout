import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { Zap, Library, BookOpen, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scansUsed: number;
  scansLimit: number;
  currentTier: string;
}

export function UpgradeModal({
  open,
  onOpenChange,
  scansUsed,
  scansLimit,
  currentTier,
}: UpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    onOpenChange(false);
    setLocation("/subscription");
  };

  const isTrial = currentTier === "trial" || currentTier === "free";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-200">
            <Zap className="h-8 w-8 text-orange-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            {isTrial ? "Free Trial Complete!" : "Scan Limit Reached"}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {isTrial ? (
              <>
                You've used all <strong>{scansLimit} free scans</strong>. Upgrade to Pro to keep scanning and unlock powerful features.
              </>
            ) : (
              <>
                You've used all <strong>{scansLimit}</strong> scans in your{" "}
                <strong>{currentTier}</strong> plan this month.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Usage Card */}
          <div className="rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                {isTrial ? "Trial Scans Used" : "Current Usage"}
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {scansUsed} / {scansLimit}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {isTrial ? "free scans" : "scans this month"}
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="space-y-3">
            {/* Pro Plan - Recommended */}
            <div className="rounded-lg border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 p-4 relative">
              <Badge className="absolute -top-2 right-4 bg-gradient-to-r from-orange-500 to-orange-600">
                Most Popular
              </Badge>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg">Pro</h3>
                  <div className="text-3xl font-bold mt-1">£14.99<span className="text-base font-normal text-muted-foreground">/month</span></div>
                  <div className="text-sm text-muted-foreground">or £149/year (save ~2 months)</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Perfect for UK sellers sourcing weekly</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span><strong>Unlimited scans</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span><strong>Barcode, cover & AI spine recognition</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Amazon + eBay UK profit calculator</span>
                </div>
                <div className="flex items-start gap-2">
                  <Library className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>Offline mode & scan history</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-primary/20">
                <p className="text-xs text-center text-primary font-semibold">14-day free trial • No card required</p>
              </div>
            </div>

            {/* Elite Plan */}
            <div className="rounded-lg border-2 border-border bg-background p-4 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-base">Elite</h3>
                  <div className="text-2xl font-bold mt-1">£19.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                  <div className="text-xs text-muted-foreground">or £199/year (save ~2½ months)</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">For high-volume sellers with automation</p>
              <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Buy / Don't Buy triggers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Library className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Custom profit rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>CSV export & multi-device</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-center text-muted-foreground">14-day free trial included</p>
              </div>
            </div>
          </div>

          {isTrial && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Try free for 14 days. Cancel anytime during trial.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            size="lg"
          >
            <Zap className="mr-2 h-4 w-4" />
            {isTrial ? "Choose Your Plan" : "Upgrade Plan"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
            size="sm"
          >
            {isTrial ? "Maybe Later" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
