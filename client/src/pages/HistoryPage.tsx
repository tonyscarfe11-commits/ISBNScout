import { useState, useEffect } from "react";
import { BookCard } from "@/components/BookCard";
import { BookDetailsModal, type BookDetails } from "@/components/BookDetailsModal";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Loader2, Download, PackagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportBooks, type ExportableBook, type ExportOptions } from "@/lib/exportUtils";
import { getOfflineDB } from "@/lib/offline-db";

export default function HistoryPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [books, setBooks] = useState<BookDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [exportProfitableOnly, setExportProfitableOnly] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Add to inventory modal state
  const [addToInventoryOpen, setAddToInventoryOpen] = useState(false);
  const [selectedBookForInventory, setSelectedBookForInventory] = useState<string | null>(null);

  // Load books from database on mount
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      // Try loading from server first (when online)
      if (navigator.onLine) {
        try {
          const response = await fetch("/api/books", { credentials: 'include' });
          if (response.ok) {
            const booksData = await response.json();
            // Convert to BookDetails format
            const formattedBooks: BookDetails[] = booksData.map((book: any) => ({
              id: book.id,
              isbn: book.isbn,
              title: book.title,
              author: book.author,
              thumbnail: book.thumbnail,
              amazonPrice: book.amazonPrice ? parseFloat(book.amazonPrice) : undefined,
              ebayPrice: book.ebayPrice ? parseFloat(book.ebayPrice) : undefined,
              yourCost: book.yourCost ? parseFloat(book.yourCost) : undefined,
              profit: book.profit ? parseFloat(book.profit) : undefined,
              status: book.status as any,
              isPending: book.status === "pending",
            }));
            setBooks(formattedBooks);
            console.log('[HistoryPage] Loaded books from server');
            return; // Success - exit early
          }
        } catch (serverError) {
          console.warn('[HistoryPage] Server load failed, trying IndexedDB:', serverError);
        }
      }

      // Fallback to IndexedDB (offline or server failed)
      console.log('[HistoryPage] Loading from IndexedDB...');
      const offlineDB = getOfflineDB();
      const offlineBooks = await offlineDB.getAllBooks();

      if (offlineBooks.length > 0) {
        const formattedBooks: BookDetails[] = offlineBooks.map((book) => ({
          id: book.id,
          isbn: book.isbn,
          title: book.title,
          author: book.author || '',
          thumbnail: book.thumbnail,
          amazonPrice: book.amazonPrice ?? undefined,
          ebayPrice: book.ebayPrice ?? undefined,
          yourCost: book.yourCost ?? undefined,
          profit: book.profit ?? undefined,
          status: book.status as any,
          isPending: book.status === "pending",
        }));
        setBooks(formattedBooks);

        toast({
          title: "📦 Offline Mode",
          description: `Showing ${offlineBooks.length} books from local storage`,
        });
      } else {
        // No data in IndexedDB either
        toast({
          title: "No books found",
          description: navigator.onLine
            ? "Scan some books to see them here"
            : "No offline data available. Connect to internet to sync.",
        });
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      toast({
        title: "Failed to load history",
        description: "Could not retrieve your scanned books",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      book.isbn.includes(searchQuery);

    const matchesFilter =
      filterStatus === "all" || book.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (book: BookDetails) => {
    setSelectedBook(book);
    setDetailsOpen(true);
  };

  const handleQuickList = (book: BookDetails) => {
    toast({
      title: "Quick List",
      description: `Opening listing form for ${book.title}`,
    });
  };

  const handleAddToInventory = (book: BookDetails) => {
    setSelectedBookForInventory(book.id);
    setAddToInventoryOpen(true);
  };

  const handleInventorySuccess = () => {
    toast({
      title: "Added to Inventory",
      description: "Book has been added to your inventory",
    });
    setAddToInventoryOpen(false);
    setSelectedBookForInventory(null);
  };

  const handleListFromModal = (platform: "amazon" | "ebay") => {
    toast({
      title: `Listing to ${platform}`,
      description: "Feature coming soon!",
    });
    setDetailsOpen(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch export data from API
      const response = await fetch('/api/books/export', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch export data');
      }

      const exportData: ExportableBook[] = await response.json();

      if (exportData.length === 0) {
        toast({
          title: "No data to export",
          description: "You haven't scanned any books yet",
          variant: "destructive",
        });
        return;
      }

      // Prepare export options
      const exportOptions: ExportOptions = {
        format: exportFormat,
        includeHeaders: true,
        profitableOnly: exportProfitableOnly,
      };

      // Trigger export
      exportBooks(exportData, exportOptions);

      toast({
        title: "Export successful",
        description: `Downloaded ${exportFormat.toUpperCase()} file with ${exportData.length} book${exportData.length !== 1 ? 's' : ''}`,
      });

      setExportDialogOpen(false);
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Scan History</h1>
            <p className="text-sm text-muted-foreground">
              {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""} scanned
            </p>
          </div>
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Book Data</DialogTitle>
                <DialogDescription>
                  Download your scanned book data as CSV or JSON
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      <SelectItem value="json">JSON (Data)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="profitable-only"
                    checked={exportProfitableOnly}
                    onCheckedChange={(checked) => setExportProfitableOnly(checked as boolean)}
                  />
                  <Label htmlFor="profitable-only" className="text-sm font-normal cursor-pointer">
                    Export profitable books only
                  </Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export {exportFormat.toUpperCase()}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setExportDialogOpen(false)}
                    disabled={isExporting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-history"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]" data-testid="select-filter-status">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="profitable">Profitable</SelectItem>
              <SelectItem value="break-even">Break Even</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No books found</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setFilterStatus("all"); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                {...book}
                onViewDetails={() => handleViewDetails(book)}
                onQuickList={() => handleQuickList(book)}
              />
            ))}
          </div>
        )}
      </div>

      <BookDetailsModal
        book={selectedBook}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
