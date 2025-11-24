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
import { Zap } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <Zap className="h-8 w-8 text-orange-600" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Scan Limit Reached
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You've used all <strong>{scansLimit}</strong> scans in your{" "}
            <strong>{currentTier}</strong> plan this month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Current Usage</div>
              <div className="text-3xl font-bold text-orange-600">
                {scansUsed} / {scansLimit}
              </div>
              <div className="text-sm text-gray-600 mt-1">scans this month</div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Upgrade to continue scanning:</p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <span className="text-teal-600">✓</span>
                <span><strong>Basic:</strong> 100 scans/month (£9.99/mo)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600">✓</span>
                <span><strong>Pro:</strong> Unlimited scans + AI features (£24.99/mo)</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={handleUpgrade} className="w-full" size="lg">
            <Zap className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
