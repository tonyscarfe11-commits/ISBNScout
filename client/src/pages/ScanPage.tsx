import { useState, useEffect } from "react";
import { ScannerInterface } from "@/components/ScannerInterface";
import { BookCard } from "@/components/BookCard";
import { BookDetailsModal, type BookDetails } from "@/components/BookDetailsModal";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AppHeader } from "@/components/AppHeader";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useBluetoothScanner } from "@/hooks/useBluetoothScanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bluetooth, BluetoothOff } from "lucide-react";

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isOnline] = useState(true);
  const [pendingCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const [recentScans, setRecentScans] = useState<BookDetails[]>([]);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(() => {
    const saved = localStorage.getItem("bluetoothScannerEnabled");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("bluetoothScannerEnabled", bluetoothEnabled.toString());
  }, [bluetoothEnabled]);

  const { isListening, lastScan } = useBluetoothScanner({
    enabled: bluetoothEnabled,
    onScan: (isbn) => {
      handleIsbnScan(isbn);
    },
    validatePattern: /^\d{10,13}$/,
  });

  const handleIsbnScan = (isbn: string) => {
    console.log("Scanning ISBN:", isbn);
    
    const mockBook: BookDetails = {
      id: Date.now().toString(),
      isbn,
      title: "Harry Potter and the Deathly Hallows",
      author: "J.K. Rowling",
      amazonPrice: 24.99,
      ebayPrice: 22.50,
      yourCost: 8.00,
      profit: 16.99,
      status: "profitable",
      description: "The seventh and final adventure in the Harry Potter series.",
    };

    setRecentScans([mockBook, ...recentScans.slice(0, 2)]);
    
    toast({
      title: "Book scanned successfully",
      description: mockBook.title,
    });
  };

  const handleCoverScan = (imageData: string) => {
    console.log("Scanning cover:", imageData);
    toast({
      title: "Processing image...",
      description: "Identifying book from cover photo",
    });
  };

  const handleViewDetails = (book: BookDetails) => {
    setSelectedBook(book);
    setDetailsOpen(true);
  };

  const handleQuickList = (book: BookDetails) => {
    setSelectedBook(book);
    setLocation("/listings/new");
  };

  const handleListFromModal = (platform: "amazon" | "ebay") => {
    toast({
      title: `Listing to ${platform}`,
      description: "Redirecting to listing form...",
    });
    setDetailsOpen(false);
    setLocation("/listings/new");
  };

  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        onSync={() => console.log("Syncing...")}
      />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Scan Books</h1>
            <p className="text-sm text-muted-foreground">
              Scan ISBN or capture book cover to get started
            </p>
          </div>
          <Button
            variant={bluetoothEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
            className="gap-2"
            data-testid="button-bluetooth-toggle"
          >
            {bluetoothEnabled ? (
              <>
                <Bluetooth className="h-4 w-4" />
                <span className="hidden sm:inline">Bluetooth</span>
              </>
            ) : (
              <>
                <BluetoothOff className="h-4 w-4" />
                <span className="hidden sm:inline">Bluetooth</span>
              </>
            )}
          </Button>
        </div>

        {bluetoothEnabled && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-primary/10 border border-primary/20">
            <Bluetooth className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Bluetooth Scanner Active
            </span>
            <Badge variant="outline" className="ml-auto">
              {isListening ? "Listening" : "Standby"}
            </Badge>
          </div>
        )}

        <ScannerInterface
          onIsbnScan={handleIsbnScan}
          onCoverScan={handleCoverScan}
        />

        {recentScans.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Scans</h2>
            {recentScans.map((book) => (
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
        onList={handleListFromModal}
      />
    </div>
  );
}
