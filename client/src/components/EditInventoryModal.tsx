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
import { Loader2 } from "lucide-react";

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string | null;
  thumbnail: string | null;
}

interface InventoryItem {
  id: string;
  userId: string;
  bookId: string;
  listingId: string | null;
  sku: string | null;
  purchaseDate: string;
  purchaseCost: string;
  purchaseSource: string | null;
  condition: string;
  location: string | null;
  soldDate: string | null;
  salePrice: string | null;
  soldPlatform: string | null;
  actualProfit: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EditInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItemId: string | null;
  onSuccess?: () => void;
}

export function EditInventoryModal({
  open,
  onOpenChange,
  inventoryItemId,
  onSuccess,
}: EditInventoryModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(true);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [book, setBook] = useState<Book | null>(null);

  const [formData, setFormData] = useState({
    sku: "",
    purchaseDate: "",
    purchaseCost: "",
    purchaseSource: "",
    condition: "good",
    location: "",
    soldDate: "",
    salePrice: "",
    soldPlatform: "",
    status: "in_stock",
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
      // Load inventory item
      const itemResponse = await fetch(`/api/inventory/${inventoryItemId}`);
      if (!itemResponse.ok) throw new Error("Failed to load item");
      const itemData = await itemResponse.json();
      setItem(itemData);

      // Load book
      const booksResponse = await fetch("/api/books");
      if (booksResponse.ok) {
        const booksData = await booksResponse.json();
        const bookData = booksData.find((b: any) => b.id === itemData.bookId);
        setBook(bookData || null);
      }

      // Populate form
      setFormData({
        sku: itemData.sku || "",
        purchaseDate: itemData.purchaseDate.split("T")[0],
        purchaseCost: parseFloat(itemData.purchaseCost).toFixed(2),
        purchaseSource: itemData.purchaseSource || "",
        condition: itemData.condition,
        location: itemData.location || "",
        soldDate: itemData.soldDate ? itemData.soldDate.split("T")[0] : "",
        salePrice: itemData.salePrice ? parseFloat(itemData.salePrice).toFixed(2) : "",
        soldPlatform: itemData.soldPlatform || "",
        status: itemData.status,
        notes: itemData.notes || "",
      });
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
    if (!formData.salePrice || !formData.purchaseCost) return null;
    const salePrice = parseFloat(formData.salePrice);
    const purchaseCost = parseFloat(formData.purchaseCost);
    // Note: Fees aren't stored separately in edit, using actualProfit if available
    return salePrice - purchaseCost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inventoryItemId || !formData.purchaseCost || !formData.condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updates: any = {
        sku: formData.sku || null,
        purchaseDate: formData.purchaseDate,
        purchaseCost: parseFloat(formData.purchaseCost),
        purchaseSource: formData.purchaseSource || null,
        condition: formData.condition,
        location: formData.location || null,
        status: formData.status,
        notes: formData.notes || null,
      };

      // Add sale data if provided
      if (formData.soldDate) {
        updates.soldDate = formData.soldDate;
      }
      if (formData.salePrice) {
        updates.salePrice = parseFloat(formData.salePrice);
        updates.actualProfit = calculateProfit();
      }
      if (formData.soldPlatform) {
        updates.soldPlatform = formData.soldPlatform;
      }

      const response = await fetch(`/api/inventory/${inventoryItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      toast({
        title: "Item updated",
        description: "Inventory item has been updated successfully",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogDescription>
            Update the details of this inventory item
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
            {/* Book Display (read-only) */}
            <div className="space-y-2">
              <Label>Book</Label>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                {book.thumbnail && (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-12 h-16 object-contain rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-sm">{book.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {book.author || "Unknown Author"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ISBN: {book.isbn}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Purchase Date */}
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">
                  Purchase Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                  required
                />
              </div>

              {/* Purchase Cost */}
              <div className="space-y-2">
                <Label htmlFor="purchaseCost">
                  Purchase Cost (£) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.purchaseCost}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseCost: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Condition */}
              <div className="space-y-2">
                <Label htmlFor="condition">
                  Condition <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    setFormData({ ...formData, condition: value })
                  }
                >
                  <SelectTrigger id="condition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="very_good">Very Good</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="acceptable">Acceptable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Reference</Label>
                <Input
                  id="sku"
                  placeholder="Optional custom identifier"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Purchase Source */}
              <div className="space-y-2">
                <Label htmlFor="purchaseSource">Purchase Source</Label>
                <Input
                  id="purchaseSource"
                  placeholder="e.g., Charity shop, Car boot sale"
                  value={formData.purchaseSource}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseSource: e.target.value })
                  }
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Shelf A3, Box 12"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="donated">Donated</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sale Information (optional) */}
            {(formData.status === "sold" || formData.soldDate || formData.salePrice) && (
              <>
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-3">Sale Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="soldDate">Sale Date</Label>
                      <Input
                        id="soldDate"
                        type="date"
                        value={formData.soldDate}
                        onChange={(e) =>
                          setFormData({ ...formData, soldDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salePrice">Sale Price (£)</Label>
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
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="soldPlatform">Sold Platform</Label>
                    <Select
                      value={formData.soldPlatform}
                      onValueChange={(value) =>
                        setFormData({ ...formData, soldPlatform: value })
                      }
                    >
                      <SelectTrigger id="soldPlatform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ebay">eBay</SelectItem>
                        <SelectItem value="amazon_fba">Amazon FBA</SelectItem>
                        <SelectItem value="amazon_fbm">Amazon FBM</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.salePrice && formData.purchaseCost && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Estimated Profit:
                        </span>
                        <span className={`font-bold ${
                          calculateProfit()! >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}>
                          £{calculateProfit()?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this item..."
                rows={3}
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
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
