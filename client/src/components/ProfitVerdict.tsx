import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  PoundSterling,
  ShoppingCart,
  Package,
  ExternalLink,
  BookOpen,
  Search
} from "lucide-react";
import { SiAmazon, SiEbay } from "react-icons/si";

export interface ProfitVerdictData {
  title: string;
  author: string;
  isbn: string;
  thumbnail?: string;
  yourCost: number;
  ebayPrice: number | null;
  amazonPrice: number | null;
  fees: number;
  shipping: number;
  profit: number;
  roi: number;
  verdict: "BUY" | "SKIP" | "MARGINAL";
  reason: string;
  velocity?: string;
  timeToSell?: string;
  confidence: "high" | "medium" | "low";
  source: string;
}

interface ProfitVerdictProps {
  data: ProfitVerdictData;
  onSave: () => void;
  onDismiss: () => void;
  onEditCost: () => void;
}

function getAmazonSearchUrl(isbn: string, title: string): string {
  // Use ISBN for search, fallback to title
  const searchTerm = isbn.startsWith('AI-') ? encodeURIComponent(title) : isbn;
  // Affiliate tag is added server-side via redirect for security
  return `/api/amazon/redirect?isbn=${encodeURIComponent(searchTerm)}&title=${encodeURIComponent(title)}`;
}

function getEbaySearchUrl(isbn: string, title: string): string {
  // Use ISBN for search, fallback to title
  const searchTerm = isbn.startsWith('AI-') ? title : isbn;
  // Search on eBay UK
  return `https://www.ebay.co.uk/sch/i.html?_nkw=${encodeURIComponent(searchTerm)}&_sacat=267`;
}

export function ProfitVerdict({ data, onSave, onDismiss, onEditCost }: ProfitVerdictProps) {
  const verdictConfig = {
    BUY: {
      icon: ThumbsUp,
      bg: "bg-emerald-500",
      border: "border-emerald-500",
      lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "BUY IT!",
      sublabel: "Good profit potential"
    },
    SKIP: {
      icon: ThumbsDown,
      bg: "bg-red-500",
      border: "border-red-500",
      lightBg: "bg-red-50 dark:bg-red-950/30",
      text: "text-red-700 dark:text-red-300",
      label: "SKIP",
      sublabel: "Not profitable"
    },
    MARGINAL: {
      icon: AlertTriangle,
      bg: "bg-amber-500",
      border: "border-amber-500",
      lightBg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-300",
      label: "MAYBE",
      sublabel: "Thin margins"
    }
  };

  const config = verdictConfig[data.verdict];
  const Icon = config.icon;
  const bestPrice = data.ebayPrice || data.amazonPrice || 0;

  return (
    <Card className={`overflow-hidden animate-scale-in ${config.lightBg} border-2 ${config.border}`}>
      {/* Verdict Banner */}
      <div className={`${config.bg} text-white p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{config.label}</h2>
              <p className="text-white/90 text-sm">{data.reason}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-data">
              {data.profit >= 0 ? "+" : ""}£{data.profit.toFixed(2)}
            </div>
            <div className="text-white/80 text-sm">
              {data.roi.toFixed(0)}% ROI
            </div>
          </div>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4 border-b border-border/50">
        <div className="flex gap-3">
          {data.thumbnail ? (
            <img 
              src={data.thumbnail} 
              alt={data.title}
              className="w-16 h-20 object-cover rounded-md shadow-sm"
            />
          ) : (
            <div className="w-16 h-20 bg-muted rounded-md flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight line-clamp-2">{data.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{data.author}</p>
            <p className="text-xs text-muted-foreground mt-1 font-data">ISBN: {data.isbn}</p>
          </div>
        </div>
      </div>

      {/* Profit Breakdown */}
      <div className="p-4 space-y-3">
        <h4 className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Profit Breakdown</h4>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Selling Price */}
          <div className="bg-background/80 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              Best Price
            </div>
            <div className="text-lg font-bold font-data text-teal-600">
              £{bestPrice.toFixed(2)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {data.ebayPrice && data.amazonPrice 
                ? "eBay & Amazon" 
                : data.ebayPrice ? "eBay" : "Amazon"}
            </div>
          </div>

          {/* Your Cost */}
          <button 
            onClick={onEditCost}
            className="bg-background/80 rounded-lg p-3 text-left hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <ShoppingCart className="h-3 w-3" />
              Your Cost
              <span className="text-[10px] text-teal-600 group-hover:underline">(edit)</span>
            </div>
            <div className="text-lg font-bold font-data text-red-600">
              -£{data.yourCost.toFixed(2)}
            </div>
          </button>

          {/* Fees */}
          <div className="bg-background/80 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <PoundSterling className="h-3 w-3" />
              Fees (15%)
            </div>
            <div className="text-lg font-bold font-data text-orange-600">
              -£{data.fees.toFixed(2)}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-background/80 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Package className="h-3 w-3" />
              Shipping
            </div>
            <div className="text-lg font-bold font-data text-orange-600">
              -£{data.shipping.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Velocity Info */}
        {data.velocity && (
          <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">{data.velocity}</span>
              {data.timeToSell && (
                <span className="text-muted-foreground"> — sells in {data.timeToSell}</span>
              )}
            </span>
          </div>
        )}

        {/* Confidence */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Price confidence:</span>
          <Badge 
            variant="outline" 
            className={`${
              data.confidence === "high" 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" 
                : data.confidence === "medium"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {data.confidence} ({data.source})
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-muted/30 border-t space-y-2">
        {/* Research Links - Amazon & eBay */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            asChild
            className="bg-[#FF9900] hover:bg-[#e88b00] text-black font-semibold gap-1"
            data-testid="button-amazon-affiliate"
          >
            <a 
              href={getAmazonSearchUrl(data.isbn, data.title)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <SiAmazon className="h-4 w-4" />
              Amazon UK
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
          <Button
            asChild
            className="bg-[#0064D2] hover:bg-[#0052ab] text-white font-semibold gap-1"
            data-testid="button-ebay-view"
          >
            <a 
              href={getEbaySearchUrl(data.isbn, data.title)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <SiEbay className="h-4 w-4" />
              eBay UK
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={onSave}
            className="bg-teal-600 hover:bg-teal-700 text-white"
            data-testid="button-save-scan"
          >
            Save to Library
          </Button>
          <Button 
            onClick={onDismiss}
            variant="ghost"
            data-testid="button-scan-another"
          >
            Scan Another
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function calculateVerdict(
  profit: number, 
  roi: number, 
  confidence: string
): { verdict: "BUY" | "SKIP" | "MARGINAL"; reason: string } {
  if (profit >= 5 && roi >= 50) {
    return { verdict: "BUY", reason: "Strong profit with good ROI" };
  } else if (profit >= 3 && roi >= 30) {
    return { verdict: "BUY", reason: "Decent profit margin" };
  } else if (profit > 0 && profit < 3) {
    return { verdict: "MARGINAL", reason: "Low profit - consider volume" };
  } else if (profit <= 0) {
    return { verdict: "SKIP", reason: "No profit at this price" };
  } else if (confidence === "low") {
    return { verdict: "MARGINAL", reason: "Price data uncertain" };
  }
  return { verdict: "MARGINAL", reason: "Review pricing carefully" };
}
