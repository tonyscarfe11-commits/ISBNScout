import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Printer, Download } from "lucide-react";
import QRCode from "qrcode.react";

interface Book {
  id: string;
  title: string;
  isbn: string;
}

interface InventoryItem {
  id: string;
  bookId: string;
  sku: string | null;
  condition: string;
}

interface LabelGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemIds: string[];
}

export function LabelGeneratorModal({
  open,
  onOpenChange,
  itemIds,
}: LabelGeneratorModalProps) {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [books, setBooks] = useState<Record<string, Book>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && itemIds.length > 0) {
      loadItems();
    }
  }, [open, itemIds]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      // Load all inventory items
      const inventoryRes = await fetch("/api/inventory");
      if (!inventoryRes.ok) throw new Error("Failed to load inventory");
      const allItems = await inventoryRes.json();

      // Filter to selected items
      const selectedItems = allItems.filter((item: InventoryItem) =>
        itemIds.includes(item.id)
      );

      // Load books
      const booksRes = await fetch("/api/books");
      if (!booksRes.ok) throw new Error("Failed to load books");
      const booksData = await booksRes.json();

      const booksMap: Record<string, Book> = {};
      booksData.forEach((book: any) => {
        booksMap[book.id] = book;
      });

      setItems(selectedItems);
      setBooks(booksMap);
    } catch (error: any) {
      toast({
        title: "Failed to load items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Print dialog opened",
      description: `Printing ${items.length} label(s)`,
    });
  };

  const handleDownloadPDF = () => {
    // Note: For a production app, you'd want to use a library like jsPDF
    // For now, we'll just trigger the print dialog which can save as PDF
    toast({
      title: "Tip",
      description: "Use your browser's print dialog to save as PDF",
    });
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Labels</DialogTitle>
          <DialogDescription>
            Print QR code labels for {items.length} inventory item(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Print Actions */}
          <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print Labels
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Save as PDF
            </Button>
          </div>

          {/* Labels Preview/Print Area */}
          <div
            ref={printRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3"
          >
            {isLoading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading labels...
              </div>
            ) : items.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No items selected
              </div>
            ) : (
              items.map((item) => {
                const book = books[item.bookId];
                const labelData = JSON.stringify({
                  sku: item.sku || item.id,
                  isbn: book?.isbn,
                  title: book?.title,
                });

                return (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 flex flex-col items-center justify-center space-y-2 bg-white print:break-inside-avoid"
                  >
                    {/* QR Code */}
                    <QRCode
                      value={labelData}
                      size={128}
                      level="M"
                      includeMargin={true}
                    />

                    {/* SKU */}
                    <div className="text-center space-y-1">
                      <div className="font-bold text-lg">
                        {item.sku || `ID: ${item.id.slice(0, 8)}`}
                      </div>

                      {/* Book Info */}
                      <div className="text-xs text-muted-foreground max-w-[200px]">
                        <div className="truncate font-medium">
                          {book?.title || "Unknown Title"}
                        </div>
                        <div>ISBN: {book?.isbn || "N/A"}</div>
                        <div className="capitalize">
                          Condition: {item.condition.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground border-t pt-4 print:hidden">
            <p className="font-medium mb-2">Printing Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use adhesive label sheets (2" x 2" or 3" x 3" works best)</li>
              <li>Set printer to "Actual Size" or "100%" scale</li>
              <li>For best results, use a laser printer</li>
              <li>QR codes contain SKU, ISBN, and title for easy scanning</li>
            </ul>
          </div>
        </div>
      </DialogContent>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          ${printRef.current ? `
            #print-area,
            #print-area * {
              visibility: visible;
            }

            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          ` : ''}

          .print\\:hidden {
            display: none !important;
          }

          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </Dialog>
  );
}
