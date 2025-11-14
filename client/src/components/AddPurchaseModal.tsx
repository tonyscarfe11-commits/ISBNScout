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

interface AddPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preselectedBookId?: string;
}

export function AddPurchaseModal({
  open,
  onOpenChange,
  onSuccess,
  preselectedBookId,
}: AddPurchaseModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  const [formData, setFormData] = useState({
    bookId: preselectedBookId || "",
    sku: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchaseCost: "",
    purchaseSource: "",
    condition: "good",
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadBooks();
    }
  }, [open]);

  useEffect(() => {
    if (preselectedBookId) {
      setFormData((prev) => ({ ...prev, bookId: preselectedBookId }));
    }
  }, [preselectedBookId]);

  const loadBooks = async () => {
    setLoadingBooks(true);
    try {
      const response = await fetch("/api/books");
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bookId || !formData.purchaseCost || !formData.condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: formData.bookId,
          sku: formData.sku || null,
          purchaseDate: formData.purchaseDate,
          purchaseCost: parseFloat(formData.purchaseCost),
          purchaseSource: formData.purchaseSource || null,
          condition: formData.condition,
          location: formData.location || null,
          notes: formData.notes || null,
          status: "in_stock",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add purchase");
      }

      toast({
        title: "Purchase added",
        description: "Item has been added to your inventory",
      });

      // Reset form
      setFormData({
        bookId: preselectedBookId || "",
        sku: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        purchaseCost: "",
        purchaseSource: "",
        condition: "good",
        location: "",
        notes: "",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Failed to add purchase",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBook = books.find((b) => b.id === formData.bookId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Purchase to Inventory</DialogTitle>
          <DialogDescription>
            Record a book purchase to track your inventory and profit
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Book Selection */}
          <div className="space-y-2">
            <Label htmlFor="book">
              Book <span className="text-destructive">*</span>
            </Label>
            {loadingBooks ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <Select
                value={formData.bookId}
                onValueChange={(value) =>
                  setFormData({ ...formData, bookId: value })
                }
              >
                <SelectTrigger id="book">
                  <SelectValue placeholder="Select a book" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} {book.author ? `- ${book.author}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedBook && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                {selectedBook.thumbnail && (
                  <img
                    src={selectedBook.thumbnail}
                    alt={selectedBook.title}
                    className="w-12 h-16 object-contain rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-sm">{selectedBook.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedBook.author || "Unknown Author"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ISBN: {selectedBook.isbn}
                  </p>
                </div>
              </div>
            )}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this purchase..."
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
              Add to Inventory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
