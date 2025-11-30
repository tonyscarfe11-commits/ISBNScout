import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { useState } from "react";
import type { BookStatus } from "./BookCard";
import { calculateProfit, calculateProfitAllPlatforms, type Platform, PLATFORM_FEES } from "@/lib/profitCalculator";
import { calculateShippingCost } from "@/lib/shippingCalculator";

export type VelocityRating = 'very_fast' | 'fast' | 'medium' | 'slow' | 'very_slow' | 'unknown';

export interface BookDetails {
  id: string;
  isbn: string;
  title: string;
  author?: string;
  thumbnail?: string;
  amazonPrice?: number;
  ebayPrice?: number;
  yourCost?: number;
  profit?: number;
  status: BookStatus;
  description?: string;
  isPending?: boolean;
  salesRank?: number;
  velocity?: VelocityRating;
  velocityDescription?: string;
  estimatedSalesPerMonth?: string;
  timeToSell?: string;
  buyRecommendation?: 'strong_buy' | 'buy' | 'maybe' | 'skip';
  buyRecommendationReason?: string;
}

export interface BookDetailsModalProps {
  book: BookDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDetailsModal({
  book,
  open,
  onOpenChange,
}: BookDetailsModalProps) {
  const [yourCost, setYourCost] = useState(book?.yourCost?.toString() || "");
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("amazon-fbm");
  const [showComparison, setShowComparison] = useState(false);

  if (!book) return null;

  // Use eBay price if available, otherwise Amazon price
  const salePrice = book.ebayPrice || book.amazonPrice || 0;
  const costValue = parseFloat(yourCost) || 0;

  // Calculate profit for selected platform
  const profitCalc = salePrice && costValue
    ? calculateProfit({
        platform: selectedPlatform,
        salePrice,
        purchaseCost: costValue,
      })
    : null;

  // Calculate for all platforms for comparison
  const allPlatforms = salePrice && costValue
    ? calculateProfitAllPlatforms(salePrice, costValue)
    : null;

  const getStatusConfig = () => {
    switch (book.status) {
      case "profitable":
        return { icon: TrendingUp, color: "text-chart-2" };
      case "break-even":
        return { icon: Minus, color: "text-chart-3" };
      case "loss":
        return { icon: TrendingDown, color: "text-destructive" };
      default:
        return { icon: BookOpen, color: "text-muted-foreground" };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const isProfitable = profitCalc ? profitCalc.netProfit > 0 : false;
  const isGoodDeal = profitCalc ? profitCalc.roi >= 100 : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-book-details">
        <DialogHeader>
          <DialogTitle>Book Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Large Profit Display */}
          {profitCalc && (
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="text-5xl font-bold font-mono text-primary">
                  £{profitCalc.netProfit.toFixed(2)}
                </div>
                {book.buyRecommendation && (
                  <Badge
                    className={`text-lg px-4 py-2 ${
                      book.buyRecommendation === 'strong_buy' || book.buyRecommendation === 'buy'
                        ? 'bg-primary text-primary-foreground'
                        : book.buyRecommendation === 'maybe'
                        ? 'bg-chart-3 text-white'
                        : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {book.buyRecommendation === 'strong_buy' || book.buyRecommendation === 'buy' ? 'BUY' :
                     book.buyRecommendation === 'maybe' ? 'MAYBE' : 'SKIP'}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Profit</p>
            </div>
          )}

          <div className="flex gap-4">
            <div className="w-32 h-48 bg-muted rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
              {book.thumbnail ? (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  style={{
                    maxWidth: '128px',
                    maxHeight: '192px',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                  onError={(e) => {
                    console.error("Image failed to load in modal:", book.thumbnail);
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      e.currentTarget.remove();
                      const icon = document.createElement('div');
                      icon.className = 'w-full h-full flex items-center justify-center';
                      icon.innerHTML = '<svg class="h-12 w-12 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-chart-3" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-2">{book.title}</h2>
              <p className="text-muted-foreground mb-2">{book.author}</p>
              <p className="text-sm font-mono text-muted-foreground mb-4">
                ISBN: {book.isbn}
              </p>
              {book.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {book.description}
                </p>
              )}
            </div>
          </div>

          {/* Platform Comparison */}
          {allPlatforms && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Platform Comparison</Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Amazon FBM */}
                <div className="p-4 bg-card border border-card-border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Amazon FBM</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {book.amazonPrice ? `£${book.amazonPrice.toFixed(2)}` : "-"}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    £{allPlatforms['amazon-fbm'].netProfit.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {allPlatforms['amazon-fbm'].roi.toFixed(0)}% ROI
                  </p>
                </div>

                {/* eBay */}
                <div className="p-4 bg-card border border-card-border rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">eBay UK</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {book.ebayPrice ? `£${book.ebayPrice.toFixed(2)}` : "-"}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    £{allPlatforms['ebay'].netProfit.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {allPlatforms['ebay'].roi.toFixed(0)}% ROI
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="yourCost">Your Cost</Label>
            <Input
              id="yourCost"
              type="number"
              step="0.01"
              placeholder="Enter purchase cost"
              value={yourCost}
              onChange={(e) => setYourCost(e.target.value)}
              data-testid="input-your-cost"
            />
          </div>

          {profitCalc && (
            <div className="space-y-4">
              {/* Sales Velocity */}
              {book.velocity && (
                <div className="p-4 bg-card border border-card-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sales Velocity</p>
                      <p className="text-lg font-semibold">{book.velocityDescription}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {book.estimatedSalesPerMonth && `${book.estimatedSalesPerMonth} sales/month`}
                        {book.timeToSell && ` • ${book.timeToSell}`}
                      </p>
                    </div>
                    {book.salesRank && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">BSR</p>
                        <p className="text-sm font-mono">#{book.salesRank.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Breakdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Info className="h-4 w-4" />
                    {showComparison ? 'Hide' : 'Show'} breakdown & comparison
                  </button>
                </div>

                {showComparison && (
                  <div className="space-y-3 p-3 bg-muted rounded-lg text-sm">
                    {/* Fee Breakdown */}
                    <div>
                      <p className="font-semibold mb-2">Fees:</p>
                      <div className="space-y-1 ml-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commission ({(PLATFORM_FEES[selectedPlatform].commission * 100).toFixed(1)}%):</span>
                          <span className="text-red-600">-£{profitCalc.commissionFee.toFixed(2)}</span>
                        </div>
                        {profitCalc.fulfillmentFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fulfillment:</span>
                            <span className="text-red-600">-£{profitCalc.fulfillmentFee.toFixed(2)}</span>
                          </div>
                        )}
                        {profitCalc.storageFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Storage (avg):</span>
                            <span className="text-red-600">-£{profitCalc.storageFee.toFixed(2)}</span>
                          </div>
                        )}
                        {profitCalc.closingFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Closing fee:</span>
                            <span className="text-red-600">-£{profitCalc.closingFee.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Costs Breakdown */}
                    <div>
                      <p className="font-semibold mb-2">Costs:</p>
                      <div className="space-y-1 ml-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purchase Cost:</span>
                          <span className="text-red-600">-£{profitCalc.purchaseCost.toFixed(2)}</span>
                        </div>
                        {profitCalc.shippingCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Shipping ({calculateShippingCost(0.3, 'royal-mail-2nd').service}):
                            </span>
                            <span className="text-red-600">-£{profitCalc.shippingCost.toFixed(2)}</span>
                          </div>
                        )}
                        {profitCalc.packagingCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Packaging:</span>
                            <span className="text-red-600">-£{profitCalc.packagingCost.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Platform Comparison */}
                    {allPlatforms && (
                      <div>
                        <p className="font-semibold mb-2">Platform Comparison:</p>
                        <div className="space-y-1 ml-2">
                          {Object.entries(allPlatforms).map(([platform, calc]) => (
                            <div key={platform} className="flex justify-between">
                              <span className={`${platform === selectedPlatform ? 'font-semibold' : 'text-muted-foreground'}`}>
                                {PLATFORM_FEES[platform as Platform].name}:
                              </span>
                              <span className={`${calc.netProfit > 0 ? 'text-green-600' : 'text-red-600'} ${platform === selectedPlatform ? 'font-bold' : ''}`}>
                                £{calc.netProfit.toFixed(2)} ({calc.roi.toFixed(0)}% ROI)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-details"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
