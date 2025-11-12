import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Calculator, TrendingUp, TrendingDown, AlertCircle, Check } from "lucide-react";

export default function ProfitCalculatorPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [platform, setPlatform] = useState<string>("amazon-fba");
  const [salePrice, setSalePrice] = useState<string>("20.00");
  const [purchaseCost, setPurchaseCost] = useState<string>("3.00");
  const [shippingCost, setShippingCost] = useState<string>("0.00");
  const [packagingCost, setPackagingCost] = useState<string>("0.50");
  const [inboundShippingCost, setInboundShippingCost] = useState<string>("0.20");

  // Platform fee structures
  const platformFees = {
    "amazon-fba": {
      name: "Amazon FBA",
      commission: 0.15, // 15%
      fulfillment: 2.50,
      storage: 0.50,
      closingFee: 0,
      description: "15% commission + fulfillment + storage fees",
    },
    "amazon-fbm": {
      name: "Amazon FBM",
      commission: 0.15, // 15%
      fulfillment: 0,
      storage: 0,
      closingFee: 0,
      description: "15% commission only",
    },
    "ebay": {
      name: "eBay",
      commission: 0.128, // 12.8%
      fulfillment: 0,
      storage: 0,
      closingFee: 0.30,
      description: "12.8% commission + £0.30 per sale",
    },
  };

  // Calculate all fees and profit
  const calculateProfit = () => {
    const price = parseFloat(salePrice) || 0;
    const cost = parseFloat(purchaseCost) || 0;
    // For FBA, shipping and packaging to customer are included in fulfillment fee
    const shipping = platform === "amazon-fba" ? 0 : (parseFloat(shippingCost) || 0);
    const packaging = platform === "amazon-fba" ? 0 : (parseFloat(packagingCost) || 0);
    // For FBA, add inbound shipping cost (sending to Amazon warehouse)
    const inboundShipping = platform === "amazon-fba" ? (parseFloat(inboundShippingCost) || 0) : 0;

    const fees = platformFees[platform as keyof typeof platformFees];

    const commissionFee = price * fees.commission;
    const fulfillmentFee = fees.fulfillment;
    const storageFee = fees.storage;
    const closingFee = fees.closingFee;

    const totalFees = commissionFee + fulfillmentFee + storageFee + closingFee;
    const totalCosts = cost + shipping + packaging + inboundShipping;
    const netProfit = price - totalFees - totalCosts;
    const profitMargin = price > 0 ? (netProfit / price) * 100 : 0;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

    return {
      salePrice: price,
      commissionFee,
      fulfillmentFee,
      storageFee,
      closingFee,
      totalFees,
      purchaseCost: cost,
      shippingCost: shipping,
      packagingCost: packaging,
      inboundShippingCost: inboundShipping,
      totalCosts,
      netProfit,
      profitMargin,
      roi,
    };
  };

  const calc = calculateProfit();
  const isProfitable = calc.netProfit > 0;
  const isGoodDeal = calc.roi >= 100; // 100% ROI or better

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profit Calculator</h1>
            <p className="text-muted-foreground">
              Calculate your profit margins across all platforms
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Book Details</h2>

            <div className="space-y-4">
              {/* Platform Selection */}
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon-fba">Amazon FBA</SelectItem>
                    <SelectItem value="amazon-fbm">Amazon FBM</SelectItem>
                    <SelectItem value="ebay">eBay</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {platformFees[platform as keyof typeof platformFees].description}
                </p>
              </div>

              {/* Sale Price */}
              <div className="space-y-2">
                <Label htmlFor="sale-price">Expected Sale Price (£)</Label>
                <Input
                  id="sale-price"
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="20.00"
                />
              </div>

              {/* Purchase Cost */}
              <div className="space-y-2">
                <Label htmlFor="purchase-cost">Purchase Cost (£)</Label>
                <Input
                  id="purchase-cost"
                  type="number"
                  step="0.01"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  placeholder="3.00"
                />
                <p className="text-xs text-muted-foreground">
                  What you paid for the book
                </p>
              </div>

              {/* Inbound Shipping (for FBA only) */}
              {platform === "amazon-fba" && (
                <div className="space-y-2">
                  <Label htmlFor="inbound-shipping">Shipping to Amazon (£/book)</Label>
                  <Input
                    id="inbound-shipping"
                    type="number"
                    step="0.01"
                    value={inboundShippingCost}
                    onChange={(e) => setInboundShippingCost(e.target.value)}
                    placeholder="0.20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cost per book to ship to Amazon warehouse (e.g. £10 for 50 books = £0.20)
                  </p>
                </div>
              )}

              {/* Shipping Cost (for FBM/eBay) */}
              {platform !== "amazon-fba" && (
                <div className="space-y-2">
                  <Label htmlFor="shipping-cost">Shipping Cost (£)</Label>
                  <Input
                    id="shipping-cost"
                    type="number"
                    step="0.01"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Royal Mail or courier fees
                  </p>
                </div>
              )}

              {/* Packaging Cost (only for FBM/eBay) */}
              {platform !== "amazon-fba" && (
                <div className="space-y-2">
                  <Label htmlFor="packaging-cost">Packaging Cost (£)</Label>
                  <Input
                    id="packaging-cost"
                    type="number"
                    step="0.01"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(e.target.value)}
                    placeholder="0.50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Boxes, bubble wrap, labels (Amazon FBA includes this)
                  </p>
                </div>
              )}

              <Button
                className="w-full mt-4"
                onClick={() => {
                  // Reset to defaults
                  setSalePrice("20.00");
                  setPurchaseCost("3.00");
                  setShippingCost("0.00");
                  setPackagingCost("0.50");
                }}
                variant="outline"
              >
                Reset Calculator
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Profit Summary */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Profit Summary</h2>
                <Badge
                  variant={isProfitable ? "default" : "destructive"}
                  className="gap-1"
                >
                  {isProfitable ? (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      Profitable
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3" />
                      Loss
                    </>
                  )}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Net Profit */}
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Net Profit</div>
                  <div className={`text-4xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                    £{calc.netProfit.toFixed(2)}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Profit Margin</div>
                    <div className="text-2xl font-bold">
                      {calc.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">ROI</div>
                    <div className="text-2xl font-bold">
                      {calc.roi.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-lg border-2 ${
                  isGoodDeal
                    ? 'bg-green-50 border-green-500 dark:bg-green-950'
                    : isProfitable
                    ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-950'
                    : 'bg-red-50 border-red-500 dark:bg-red-950'
                }`}>
                  <div className="flex items-start gap-2">
                    {isGoodDeal ? (
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold mb-1">
                        {isGoodDeal
                          ? "Excellent Deal!"
                          : isProfitable
                          ? "Marginal Profit"
                          : "Not Profitable"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isGoodDeal
                          ? "This book exceeds the 100% ROI threshold. Great find!"
                          : isProfitable
                          ? "Profitable but below the recommended 100% ROI. Consider negotiating a lower price."
                          : "This book will result in a loss. Don't buy unless it's part of a bundle."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Detailed Breakdown */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Detailed Breakdown</h2>

              <div className="space-y-3">
                {/* Revenue */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sale Price</span>
                  <span className="font-semibold">£{calc.salePrice.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">Platform Fees</div>
                  <div className="space-y-2 ml-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Commission ({(platformFees[platform as keyof typeof platformFees].commission * 100).toFixed(1)}%)</span>
                      <span className="text-red-600">-£{calc.commissionFee.toFixed(2)}</span>
                    </div>
                    {calc.fulfillmentFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Fulfillment</span>
                        <span className="text-red-600">-£{calc.fulfillmentFee.toFixed(2)}</span>
                      </div>
                    )}
                    {calc.storageFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Storage (avg)</span>
                        <span className="text-red-600">-£{calc.storageFee.toFixed(2)}</span>
                      </div>
                    )}
                    {calc.closingFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Closing Fee</span>
                        <span className="text-red-600">-£{calc.closingFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">Your Costs</div>
                  <div className="space-y-2 ml-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Purchase Cost</span>
                      <span className="text-red-600">-£{calc.purchaseCost.toFixed(2)}</span>
                    </div>
                    {calc.shippingCost > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-red-600">-£{calc.shippingCost.toFixed(2)}</span>
                      </div>
                    )}
                    {calc.packagingCost > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Packaging</span>
                        <span className="text-red-600">-£{calc.packagingCost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total Fees & Costs</span>
                    <span className="text-red-600">-£{(calc.totalFees + calc.totalCosts).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Net Profit</span>
                    <span className={isProfitable ? 'text-green-600' : 'text-red-600'}>
                      £{calc.netProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Pro Tips */}
            <Card className="p-6 bg-primary/5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Pro Tips
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Aim for at least 100% ROI (£3 profit on £3 cost)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Higher-value books (£15+) work better on Amazon FBA</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Lower-value books (£5-10) profit more on eBay</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Factor in time spent - £8 profit in 5 mins beats £12 in 30 mins</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
