import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PoundSterling, Save, RotateCcw } from "lucide-react";

const DEFAULT_COSTS = {
  defaultPurchaseCost: 1.00,
  charityShopCost: 0.50,
  carBootCost: 0.25,
  onlineCost: 3.00,
  estimatedShipping: 2.85,
  feePercentage: 15,
  ebayFeePercentage: 12.8,
  amazonFeePercentage: 15.3,
};

export interface UserCosts {
  defaultPurchaseCost: number;
  charityShopCost: number;
  carBootCost: number;
  onlineCost: number;
  estimatedShipping: number;
  feePercentage: number;
  ebayFeePercentage: number;
  amazonFeePercentage: number;
}

export function getUserCosts(): UserCosts {
  try {
    const saved = localStorage.getItem('userCosts');
    if (saved) {
      return { ...DEFAULT_COSTS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load user costs:', e);
  }
  return DEFAULT_COSTS;
}

export function saveUserCosts(costs: UserCosts): void {
  localStorage.setItem('userCosts', JSON.stringify(costs));
}

interface CostEditorProps {
  open: boolean;
  onClose: () => void;
  currentCost: number;
  onCostChange: (newCost: number) => void;
}

export function CostEditor({ open, onClose, currentCost, onCostChange }: CostEditorProps) {
  const [costs, setCosts] = useState<UserCosts>(getUserCosts);
  const [quickCost, setQuickCost] = useState(currentCost.toString());

  useEffect(() => {
    setQuickCost(currentCost.toString());
  }, [currentCost]);

  const handleQuickCostSave = () => {
    const cost = parseFloat(quickCost) || 0;
    onCostChange(cost);
    onClose();
  };

  const handlePresetClick = (cost: number) => {
    setQuickCost(cost.toFixed(2));
    onCostChange(cost);
  };

  const handleSaveDefaults = () => {
    saveUserCosts(costs);
    onClose();
  };

  const handleReset = () => {
    setCosts(DEFAULT_COSTS);
    setQuickCost(DEFAULT_COSTS.defaultPurchaseCost.toFixed(2));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PoundSterling className="h-5 w-5 text-emerald-600" />
            Set Your Cost
          </DialogTitle>
          <DialogDescription>
            How much are you paying for this book?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Cost Entry */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">£</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={quickCost}
                onChange={(e) => setQuickCost(e.target.value)}
                className="pl-7 text-lg font-data"
                placeholder="0.00"
                data-testid="input-cost"
              />
            </div>
            <Button 
              onClick={handleQuickCostSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              data-testid="button-save-cost"
            >
              <Save className="h-4 w-4" />
              Apply
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Quick Presets</p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(costs.carBootCost)}
                className="text-xs"
              >
                £{costs.carBootCost.toFixed(2)}
                <span className="sr-only">Car boot</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(costs.charityShopCost)}
                className="text-xs"
              >
                £{costs.charityShopCost.toFixed(2)}
                <span className="sr-only">Charity shop</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(1.00)}
                className="text-xs"
              >
                £1.00
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(2.00)}
                className="text-xs"
              >
                £2.00
              </Button>
            </div>
            <div className="flex gap-2 text-[10px] text-muted-foreground">
              <span>Car boot</span>
              <span>|</span>
              <span>Charity</span>
              <span>|</span>
              <span>Common prices</span>
            </div>
          </div>

          {/* Default Settings */}
          <Card className="p-3 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium">Default Cost Settings</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 text-xs gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Charity shop:</span>
                <span className="font-data">£{costs.charityShopCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Car boot:</span>
                <span className="font-data">£{costs.carBootCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="font-data">£{costs.estimatedShipping.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">eBay fees:</span>
                <span className="font-data">{costs.ebayFeePercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amazon fees:</span>
                <span className="font-data">{costs.amazonFeePercentage}%</span>
              </div>
            </div>
          </Card>

          <p className="text-[10px] text-muted-foreground text-center">
            Costs are saved locally and used for profit calculations
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
