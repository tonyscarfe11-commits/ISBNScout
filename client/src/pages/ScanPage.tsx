import { useState } from "react";
import { ScannerInterface } from "@/components/ScannerInterface";
import { BookCard } from "@/components/BookCard";
import { BookDetailsModal, type BookDetails } from "@/components/BookDetailsModal";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isOnline] = useState(true); // todo: remove mock functionality
  const [pendingCount] = useState(0); // todo: remove mock functionality
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // todo: remove mock functionality
  const [recentScans, setRecentScans] = useState<BookDetails[]>([]);

  const handleIsbnScan = (isbn: string) => {
    console.log("Scanning ISBN:", isbn);
    
    // todo: remove mock functionality - Simulate API call
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
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        onSync={() => console.log("Syncing...")}
      />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Scan Books</h1>
          <p className="text-sm text-muted-foreground">
            Scan ISBN or capture book cover to get started
          </p>
        </div>

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
