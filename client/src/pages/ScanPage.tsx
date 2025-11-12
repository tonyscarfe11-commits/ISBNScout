import { useState, useEffect } from "react";
import { ScannerInterface } from "@/components/ScannerInterface";
import { BookCard } from "@/components/BookCard";
import { BookDetailsModal, type BookDetails } from "@/components/BookDetailsModal";
import { BookPhotoRecognition, type RecognizedBookData } from "@/components/BookPhotoRecognition";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isOnline] = useState(true);
  const [pendingCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<BookDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load recent scans from database on mount
  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      const response = await fetch("/api/books");
      if (response.ok) {
        const books = await response.json();
        // Convert to BookDetails format and take only the 3 most recent
        const formattedBooks: BookDetails[] = books.slice(0, 3).map((book: any) => ({
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
        }));
        setRecentScans(formattedBooks);
      }
    } catch (error) {
      console.error("Failed to load recent scans:", error);
    }
  };

  const handleIsbnScan = async (isbn: string) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Send ISBN to backend - it will look it up via Google Books API
      const bookData = {
        isbn,
        status: "pending",
      };

      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save book");
      }

      const savedBook = await response.json();

      // Fetch pricing data in the background
      let ebayPrice = undefined;
      let amazonPrice = undefined;

      try {
        const priceResponse = await fetch(`/api/books/${isbn}/prices`);
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          ebayPrice = priceData.ebayPrice;
          amazonPrice = priceData.amazonPrice;
          console.log("Pricing fetched:", { ebayPrice, amazonPrice });
        }
      } catch (priceError) {
        console.error("Failed to fetch prices:", priceError);
        // Continue without prices
      }

      // Convert to BookDetails format
      const bookDetails: BookDetails = {
        id: savedBook.id,
        isbn: savedBook.isbn,
        title: savedBook.title,
        author: savedBook.author,
        thumbnail: savedBook.thumbnail,
        amazonPrice: amazonPrice || (savedBook.amazonPrice ? parseFloat(savedBook.amazonPrice) : undefined),
        ebayPrice: ebayPrice || (savedBook.ebayPrice ? parseFloat(savedBook.ebayPrice) : undefined),
        yourCost: savedBook.yourCost ? parseFloat(savedBook.yourCost) : undefined,
        profit: savedBook.profit ? parseFloat(savedBook.profit) : undefined,
        status: savedBook.status,
      };

      // Add to recent scans at the top
      setRecentScans([bookDetails, ...recentScans.slice(0, 2)]);

      toast({
        title: "Book scanned successfully",
        description: `${bookDetails.title}${ebayPrice ? ` - £${ebayPrice.toFixed(2)} on eBay` : ""}`,
      });
    } catch (error: any) {
      console.error("Failed to scan book:", error);
      toast({
        title: "Scan failed",
        description: error.message || "Failed to save book",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleBookRecognized = async (data: RecognizedBookData) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // If we have ISBN from AI, use it to look up full details
      // Otherwise use the AI-provided data
      const bookData = {
        isbn: data.isbn || "",
        title: data.title,
        author: data.author,
        status: "pending",
      };

      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error("Failed to save recognized book");
      }

      const savedBook = await response.json();

      const bookDetails: BookDetails = {
        id: savedBook.id,
        isbn: savedBook.isbn,
        title: savedBook.title,
        author: savedBook.author,
        thumbnail: savedBook.thumbnail,
        amazonPrice: savedBook.amazonPrice ? parseFloat(savedBook.amazonPrice) : undefined,
        ebayPrice: savedBook.ebayPrice ? parseFloat(savedBook.ebayPrice) : undefined,
        yourCost: savedBook.yourCost ? parseFloat(savedBook.yourCost) : undefined,
        profit: savedBook.profit ? parseFloat(savedBook.profit) : undefined,
        status: savedBook.status,
        description: data.description || undefined,
      };

      setRecentScans([bookDetails, ...recentScans.slice(0, 2)]);

      toast({
        title: "Book recognized and saved",
        description: bookDetails.title,
      });
    } catch (error: any) {
      console.error("Failed to save recognized book:", error);
      toast({
        title: "Failed to save book",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            Scan ISBN, capture book cover, or use AI photo recognition
          </p>
        </div>

        <BookPhotoRecognition onRecognized={handleBookRecognized} />

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
