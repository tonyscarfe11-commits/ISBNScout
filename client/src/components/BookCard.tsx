import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, TrendingUp, TrendingDown, Minus, PackagePlus, Zap, Clock } from "lucide-react";

export type BookStatus = "profitable" | "break-even" | "loss" | "pending";
export type VelocityRating = 'very_fast' | 'fast' | 'medium' | 'slow' | 'very_slow' | 'unknown';

export interface BookCardProps {
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
  isPending?: boolean;
  onViewDetails: () => void;
  onQuickList: () => void;
  onAddToInventory?: () => void;
  salesRank?: number;
  velocity?: VelocityRating;
  velocityDescription?: string;
  estimatedSalesPerMonth?: string;
  timeToSell?: string;
  buyRecommendation?: 'strong_buy' | 'buy' | 'maybe' | 'skip';
}

export function BookCard({
  isbn,
  title,
  author,
  thumbnail,
  amazonPrice,
  ebayPrice,
  yourCost,
  profit,
  status,
  isPending = false,
  onViewDetails,
  onQuickList,
  onAddToInventory,
  salesRank,
  velocity,
  velocityDescription,
  estimatedSalesPerMonth,
  timeToSell,
  buyRecommendation,
}: BookCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "profitable":
        return {
          badge: "Profitable",
          variant: "default" as const,
          icon: TrendingUp,
          color: "text-chart-2",
        };
      case "break-even":
        return {
          badge: "Break Even",
          variant: "secondary" as const,
          icon: Minus,
          color: "text-chart-3",
        };
      case "loss":
        return {
          badge: "Loss",
          variant: "destructive" as const,
          icon: TrendingDown,
          color: "text-destructive",
        };
      default:
        return {
          badge: "Pending Sync",
          variant: "outline" as const,
          icon: BookOpen,
          color: "text-muted-foreground",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const getVelocityConfig = () => {
    switch (velocity) {
      case 'very_fast':
        return { label: 'Very Fast', color: 'bg-green-500/10 text-green-700 border-green-500/20' };
      case 'fast':
        return { label: 'Fast', color: 'bg-green-500/10 text-green-600 border-green-500/20' };
      case 'medium':
        return { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' };
      case 'slow':
        return { label: 'Slow', color: 'bg-orange-500/10 text-orange-700 border-orange-500/20' };
      case 'very_slow':
        return { label: 'Very Slow', color: 'bg-red-500/10 text-red-700 border-red-500/20' };
      default:
        return { label: 'Unknown', color: 'bg-muted text-muted-foreground' };
    }
  };

  const getRecommendationConfig = () => {
    switch (buyRecommendation) {
      case 'strong_buy':
        return { label: 'Strong Buy', color: 'bg-green-500 text-white' };
      case 'buy':
        return { label: 'Buy', color: 'bg-green-600/80 text-white' };
      case 'maybe':
        return { label: 'Maybe', color: 'bg-yellow-500 text-white' };
      case 'skip':
        return { label: 'Skip', color: 'bg-red-500 text-white' };
      default:
        return null;
    }
  };

  const velocityConfig = getVelocityConfig();
  const recommendationConfig = getRecommendationConfig();

  return (
    <Card
      className={`p-4 hover-elevate active-elevate-2 cursor-pointer ${
        isPending ? "opacity-60" : ""
      }`}
      onClick={onViewDetails}
      data-testid={`card-book-${isbn}`}
    >
      <div className="flex gap-4">
        <div className="w-16 h-24 bg-muted rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              style={{
                maxWidth: '64px',
                maxHeight: '96px',
                objectFit: 'contain',
                display: 'block'
              }}
              onError={(e) => {
                console.error("Image failed to load:", thumbnail);
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  e.currentTarget.remove();
                  const icon = document.createElement('div');
                  icon.className = 'w-full h-full flex items-center justify-center';
                  icon.innerHTML = '<svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                  parent.appendChild(icon);
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
            <div className="flex gap-1 flex-shrink-0">
              {recommendationConfig && (
                <Badge className={recommendationConfig.color} data-testid="badge-buy-recommendation">
                  {recommendationConfig.label}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {author}
          </p>
          
          <p className="text-xs font-mono text-muted-foreground mb-2">
            ISBN: {isbn}
          </p>

          {/* Velocity Indicator - Most Important! */}
          {velocity && (
            <div className="mb-3 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${velocityConfig.color} font-medium`} data-testid="badge-velocity">
                  <Zap className="h-3 w-3 mr-1" />
                  {velocityConfig.label}
                </Badge>
                {salesRank && (
                  <span className="text-xs text-muted-foreground">
                    Rank: #{salesRank.toLocaleString()}
                  </span>
                )}
              </div>
              {timeToSell && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Est. time to sell: {timeToSell}
                </div>
              )}
              {velocityDescription && (
                <p className="text-xs text-muted-foreground italic">
                  {velocityDescription}
                </p>
              )}
            </div>
          )}

          {!isPending && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Amazon</div>
                <div className="text-sm font-semibold font-mono">
                  {amazonPrice ? `£${amazonPrice.toFixed(2)}` : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">eBay</div>
                <div className="text-sm font-semibold font-mono">
                  {ebayPrice ? `£${ebayPrice.toFixed(2)}` : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Profit</div>
                <div
                  className={`text-sm font-semibold font-mono flex items-center gap-1 ${statusConfig.color}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {profit !== undefined ? `£${profit.toFixed(2)}` : "-"}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              data-testid={`button-view-details-${isbn}`}
            >
              Details
            </Button>
            {!isPending && onAddToInventory && (
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToInventory();
                }}
                data-testid={`button-add-inventory-${isbn}`}
              >
                <PackagePlus className="h-4 w-4 mr-1" />
                Add to Inventory
              </Button>
            )}
            {!isPending && !onAddToInventory && (
              <Button
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickList();
                }}
                data-testid={`button-quick-list-${isbn}`}
              >
                Quick List
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
