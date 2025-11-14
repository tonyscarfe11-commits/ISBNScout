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
import { Card } from "@/components/ui/card";
import { Bluetooth, BluetoothOff, Loader2, CheckCircle2, BookOpen, User, Hash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isOnline] = useState(true);
  const [pendingCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const [recentScans, setRecentScans] = useState<BookDetails[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
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

  const handleCoverScan = async (imageData: string) => {
    console.log("Scanning cover/spine photo");
    setIsProcessingImage(true);
    setRecognitionResult(null);

    toast({
      title: "🤖 AI Recognition Started",
      description: "Analyzing cover or spine photo...",
    });

    try {
      const result = await apiRequest<{
        title?: string;
        author?: string;
        isbn?: string;
        publisher?: string;
        series?: string;
        condition?: string;
        description?: string;
        keywords: string[];
        imageType?: 'cover' | 'spine' | 'unknown';
      }>("/api/ai/analyze-image", {
        method: "POST",
        body: JSON.stringify({ imageUrl: imageData }),
        headers: { "Content-Type": "application/json" },
      });

      setRecognitionResult(result);

      const imageTypeLabel = result.imageType === 'spine' ? '📚 Spine' : 
                            result.imageType === 'cover' ? '📖 Cover' : '📄 Book';

      toast({
        title: `✨ ${imageTypeLabel} Recognized!`,
        description: result.title || "Book details extracted",
      });

      // If we got an ISBN, also scan it
      if (result.isbn) {
        handleIsbnScan(result.isbn);
      }
    } catch (error: any) {
      console.error("AI recognition failed:", error);
      toast({
        title: "Recognition Failed",
        description: error.message || "Could not analyze the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingImage(false);
    }
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

        {/* AI Recognition Status */}
        {isProcessingImage && (
          <Card className="p-6 bg-primary/5 border-primary/20" data-testid="card-ai-processing">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <h3 className="font-semibold">AI Recognition in Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing image for title, author, ISBN, and condition...
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* AI Recognition Results */}
        {recognitionResult && !isProcessingImage && (
          <Card className="p-6 bg-green-500/5 border-green-500/20" data-testid="card-ai-result">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">
                  {recognitionResult.imageType === 'spine' ? '📚 Spine Recognized' : 
                   recognitionResult.imageType === 'cover' ? '📖 Cover Recognized' : 
                   '✨ Book Recognized'}
                </h3>
              </div>

              <div className="grid gap-3">
                {recognitionResult.title && (
                  <div className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="font-medium" data-testid="text-recognized-title">{recognitionResult.title}</p>
                    </div>
                  </div>
                )}

                {recognitionResult.author && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Author</p>
                      <p className="font-medium" data-testid="text-recognized-author">{recognitionResult.author}</p>
                    </div>
                  </div>
                )}

                {recognitionResult.isbn && (
                  <div className="flex items-start gap-2">
                    <Hash className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">ISBN</p>
                      <p className="font-mono text-sm" data-testid="text-recognized-isbn">{recognitionResult.isbn}</p>
                    </div>
                  </div>
                )}

                {recognitionResult.publisher && (
                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Publisher</p>
                      <p className="text-sm" data-testid="text-recognized-publisher">{recognitionResult.publisher}</p>
                    </div>
                  </div>
                )}

                {recognitionResult.condition && (
                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Condition</p>
                      <Badge variant="secondary" data-testid="badge-recognized-condition">
                        {recognitionResult.condition}
                      </Badge>
                    </div>
                  </div>
                )}

                {recognitionResult.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Physical Condition</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-recognized-description">
                      {recognitionResult.description}
                    </p>
                  </div>
                )}

                {recognitionResult.keywords && recognitionResult.keywords.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {recognitionResult.keywords.map((keyword: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs" data-testid={`badge-keyword-${i}`}>
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => setRecognitionResult(null)} 
                variant="outline" 
                size="sm"
                className="w-full"
                data-testid="button-clear-result"
              >
                Scan Another
              </Button>
            </div>
          </Card>
        )}

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
