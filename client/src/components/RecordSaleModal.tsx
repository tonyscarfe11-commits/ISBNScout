import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface RecordSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItemId: string | null;
  onSuccess?: () => void;
}

interface InventoryItem {
  id: string;
  bookId: string;
  purchaseCost: string;
  condition: string;
  purchaseDate: string;
}

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string | null;
  thumbnail: string | null;
}

export function RecordSaleModal({
  open,
  onOpenChange,
  inventoryItemId,
  onSuccess,
}: RecordSaleModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [loadingItem, setLoadingItem] = useState(true);

  const [formData, setFormData] = useState({
    soldDate: new Date().toISOString().split("T")[0],
    salePrice: "",
    soldPlatform: "ebay",
    fees: "",
    notes: "",
  });

  useEffect(() => {
    if (open && inventoryItemId) {
      loadItem();
    }
  }, [open, inventoryItemId]);

  const loadItem = async () => {
    if (!inventoryItemId) return;

    setLoadingItem(true);
    try {
      const itemResponse = await fetch(`/api/inventory/${inventoryItemId}`);
      if (!itemResponse.ok) throw new Error("Failed to load item");
      const itemData = await itemResponse.json();
      setItem(itemData);

      const bookResponse = await fetch(`/api/books`);
      if (bookResponse.ok) {
        const booksData = await bookResponse.json();
        const bookData = booksData.find((b: any) => b.id === itemData.bookId);
        setBook(bookData || null);
      }
    } catch (error) {
      console.error("Failed to load item:", error);
      toast({
        title: "Failed to load item",
        description: "Could not retrieve inventory item details",
        variant: "destructive",
      });
    } finally {
      setLoadingItem(false);
    }
  };

  const calculateProfit = () => {
    if (!formData.salePrice || !item) return null;

    const salePrice = parseFloat(formData.salePrice);
    const purchaseCost = parseFloat(item.purchaseCost);
    const fees = formData.fees ? parseFloat(formData.fees) : 0;

    return salePrice - purchaseCost - fees;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inventoryItemId || !formData.salePrice) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const profit = calculateProfit();
    if (profit === null) {
      toast({
        title: "Invalid Data",
        description: "Could not calculate profit",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/inventory/${inventoryItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soldDate: formData.soldDate,
          salePrice: parseFloat(formData.salePrice),
          soldPlatform: formData.soldPlatform,
          actualProfit: profit,
          status: "sold",
          notes: formData.notes
            ? `${item?.notes ? item.notes + "\n" : ""}Sale: ${formData.notes}`
            : item?.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to record sale");
      }

      toast({
        title: "Sale recorded",
        description: `Profit: £${profit.toFixed(2)}`,
      });

      // Reset form
      setFormData({
        soldDate: new Date().toISOString().split("T")[0],
        salePrice: "",
        soldPlatform: "ebay",
        fees: "",
        notes: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Failed to record sale",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const profit = calculateProfit();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
          <DialogDescription>
            Mark this item as sold and record the final profit
          </DialogDescription>
        </DialogHeader>

        {loadingItem ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : !item || !book ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Item not found</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Book Info */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              {book.thumbnail && (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="w-12 h-16 object-contain rounded"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{book.title}</p>
                <p className="text-xs text-muted-foreground">
                  {book.author || "Unknown Author"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Purchase Cost: £{parseFloat(item.purchaseCost).toFixed(2)} •
                  Condition: {item.condition.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Sale Date */}
              <div className="space-y-2">
                <Label htmlFor="soldDate">
                  Sale Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="soldDate"
                  type="date"
                  value={formData.soldDate}
                  onChange={(e) =>
                    setFormData({ ...formData, soldDate: e.target.value })
                  }
                  required
                />
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="soldPlatform">
                  Sold On <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.soldPlatform}
                  onValueChange={(value) =>
                    setFormData({ ...formData, soldPlatform: value })
                  }
                >
                  <SelectTrigger id="soldPlatform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ebay">eBay</SelectItem>
                    <SelectItem value="amazon_fba">Amazon FBA</SelectItem>
                    <SelectItem value="amazon_fbm">Amazon FBM</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Sale Price */}
              <div className="space-y-2">
                <Label htmlFor="salePrice">
                  Sale Price (£) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.salePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, salePrice: e.target.value })
                  }
                  required
                />
              </div>

              {/* Fees */}
              <div className="space-y-2">
                <Label htmlFor="fees">Platform Fees (£)</Label>
                <Input
                  id="fees"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.fees}
                  onChange={(e) =>
                    setFormData({ ...formData, fees: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Profit Display */}
            {profit !== null && (
              <div
                className={`p-4 rounded-md ${
                  profit >= 0 ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Estimated Profit:</span>
                  <div className="flex items-center gap-2">
                    {profit >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span
                      className={`text-xl font-bold ${
                        profit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      £{profit.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sale Price (£{formData.salePrice || "0.00"}) - Purchase Cost
                  (£{parseFloat(item.purchaseCost).toFixed(2)}) - Fees (£
                  {formData.fees || "0.00"})
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Sale Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any notes about this sale..."
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Sale
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
