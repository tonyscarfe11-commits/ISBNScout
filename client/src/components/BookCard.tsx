import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, TrendingUp, TrendingDown, Minus } from "lucide-react";

export type BookStatus = "profitable" | "break-even" | "loss" | "pending";

export interface BookCardProps {
  id: string;
  isbn: string;
  title: string;
  author: string;
  thumbnail?: string;
  amazonPrice?: number;
  ebayPrice?: number;
  yourCost?: number;
  profit?: number;
  status: BookStatus;
  isPending?: boolean;
  onViewDetails: () => void;
  onQuickList: () => void;
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

  return (
    <Card
      className={`p-4 hover-elevate active-elevate-2 cursor-pointer ${
        isPending ? "opacity-60" : ""
      }`}
      onClick={onViewDetails}
      data-testid={`card-book-${isbn}`}
    >
      <div className="flex gap-4">
        <div className="w-16 h-24 bg-muted rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
            <Badge variant={statusConfig.variant} className="flex-shrink-0">
              {statusConfig.badge}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {author}
          </p>
          
          <p className="text-xs font-mono text-muted-foreground mb-3">
            ISBN: {isbn}
          </p>

          {!isPending && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <div className="text-xs text-muted-foreground">Amazon</div>
                <div className="text-sm font-semibold font-mono">
                  {amazonPrice ? `$${amazonPrice.toFixed(2)}` : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">eBay</div>
                <div className="text-sm font-semibold font-mono">
                  {ebayPrice ? `$${ebayPrice.toFixed(2)}` : "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Profit</div>
                <div
                  className={`text-sm font-semibold font-mono flex items-center gap-1 ${statusConfig.color}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {profit !== undefined ? `$${profit.toFixed(2)}` : "-"}
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
            {!isPending && (
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
