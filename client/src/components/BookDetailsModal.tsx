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
import { BookOpen, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import type { BookStatus } from "./BookCard";

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
}

export interface BookDetailsModalProps {
  book: BookDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onList: (platform: "amazon" | "ebay") => void;
}

export function BookDetailsModal({
  book,
  open,
  onOpenChange,
  onList,
}: BookDetailsModalProps) {
  const [yourCost, setYourCost] = useState(book?.yourCost?.toString() || "");

  if (!book) return null;

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

  const calculatedProfit = book.amazonPrice && yourCost
    ? book.amazonPrice - parseFloat(yourCost)
    : book.profit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-book-details">
        <DialogHeader>
          <DialogTitle>Book Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                      icon.innerHTML = '<svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                Amazon Price
              </Label>
              <div className="text-2xl font-bold font-mono">
                {book.amazonPrice ? `$${book.amazonPrice.toFixed(2)}` : "-"}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase">
                eBay Price
              </Label>
              <div className="text-2xl font-bold font-mono">
                {book.ebayPrice ? `$${book.ebayPrice.toFixed(2)}` : "-"}
              </div>
            </div>
          </div>

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

          {calculatedProfit !== undefined && (
            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Profit</span>
                <div className={`flex items-center gap-2 text-2xl font-bold font-mono ${statusConfig.color}`}>
                  <StatusIcon className="h-6 w-6" />
                  ${calculatedProfit.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onList("amazon")}
              data-testid="button-list-amazon"
            >
              List to Amazon
            </Button>
            <Button
              className="flex-1"
              onClick={() => onList("ebay")}
              data-testid="button-list-ebay"
            >
              List to eBay
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
