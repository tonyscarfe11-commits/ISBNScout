import { useState, useEffect } from "react";
import { ScannerInterface } from "@/components/ScannerInterface";
import { BatchScanner } from "@/components/BatchScanner";
import { BookCard } from "@/components/BookCard";
import { BookDetailsModal, type BookDetails } from "@/components/BookDetailsModal";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AppHeader } from "@/components/AppHeader";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useBluetoothScanner } from "@/hooks/useBluetoothScanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bluetooth, BluetoothOff, Loader2, CheckCircle2, BookOpen, User, Hash, Zap, Library, Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getOfflineSyncService, type OfflineStatus } from "@/lib/offline-sync";
import { getScanQueue } from "@/lib/scan-queue";

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    pendingSync: 0,
    lastSync: null,
  });
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [recentScans, setRecentScans] = useState<BookDetails[]>([]);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(() => {
    const saved = localStorage.getItem("bluetoothScannerEnabled");
    return saved === "true";
  });

  // Shelf scanning mode state
  const [scanMode, setScanMode] = useState<"single" | "shelf">("single");
  const [shelfResults, setShelfResults] = useState<any[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());

  // Scan limit state
  const [scanLimits, setScanLimits] = useState({
    scansUsed: 0,
    scansLimit: 10,
    scansRemaining: 10,
    percentUsed: 0,
    isUnlimited: false,
  });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [currentTier, setCurrentTier] = useState("trial");

  // Set up offline sync service
  useEffect(() => {
    const syncService = getOfflineSyncService();

    // Update status immediately
    setOfflineStatus(syncService.getStatus());

    // Subscribe to status changes
    const unsubscribe = syncService.onStatusChange((status) => {
      setOfflineStatus(status);
    });

    // Cleanup on unmount
    return unsubscribe;
  }, []);

  useEffect(() => {
    localStorage.setItem("bluetoothScannerEnabled", bluetoothEnabled.toString());
  }, [bluetoothEnabled]);

  // Fetch scan limits on mount
  useEffect(() => {
    const fetchScanLimits = async () => {
      try {
        const [limitsResponse, userResponse] = await Promise.all([
          fetch("/api/user/scan-limits", { credentials: 'include' }),
          fetch("/api/user/me", { credentials: 'include' }),
        ]);

        if (limitsResponse.ok) {
          const limits = await limitsResponse.json();
          setScanLimits(limits);
        }

        if (userResponse.ok) {
          const user = await userResponse.json();
          setCurrentTier(user.subscriptionTier || "trial");
        }
      } catch (error) {
        console.error("Failed to fetch scan limits:", error);
      }
    };

    fetchScanLimits();
  }, []);

  // Helper to refresh scan limits
  const refreshScanLimits = async () => {
    try {
      const response = await fetch("/api/user/scan-limits", { credentials: 'include' });
      if (response.ok) {
        const limits = await response.json();
        setScanLimits(limits);
      }
    } catch (error) {
      console.error("Failed to refresh scan limits:", error);
    }
  };

  // Helper to save scan and handle limit errors
  const saveScan = async (isbn: string, bookData: any) => {
    // If offline, queue the scan instead
    if (!offlineStatus.isOnline) {
      const scanQueue = getScanQueue();
      scanQueue.enqueue({
        isbn,
        title: bookData.title || `Book with ISBN ${isbn}`,
        author: bookData.author || "Unknown Author",
      });

      toast({
        title: "Scan Queued",
        description: "Will sync when back online",
      });

      // Update offline status to reflect new queue count
      const syncService = getOfflineSyncService();
      setOfflineStatus(syncService.getStatus());

      return true; // Return true so the UI updates
    }

    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn, ...bookData }),
        credentials: 'include', // Send cookies with request
      });

      if (response.status === 403) {
        // Scan limit reached
        const error = await response.json();
        setUpgradeModalOpen(true);
        toast({
          title: "Scan Limit Reached",
          description: error.message || "Upgrade to continue scanning",
          variant: "destructive",
        });
        return false;
      }

      if (!response.ok) {
        throw new Error("Failed to save scan");
      }

      // Refresh scan limits after successful scan
      await refreshScanLimits();
      return true;
    } catch (error: any) {
      console.error("Save scan error:", error);

      // If save failed due to network error, queue it instead
      if (!navigator.onLine || error.message.includes('fetch')) {
        const scanQueue = getScanQueue();
        scanQueue.enqueue({
          isbn,
          title: bookData.title || `Book with ISBN ${isbn}`,
          author: bookData.author || "Unknown Author",
        });

        toast({
          title: "Scan Queued",
          description: "Network error - will sync when connection restored",
        });

        // Update offline status
        const syncService = getOfflineSyncService();
        setOfflineStatus(syncService.getStatus());

        return true; // Return true so the UI updates
      }

      toast({
        title: "Save Failed",
        description: error.message || "Could not save scan",
        variant: "destructive",
      });
      return false;
    }
  };

  const { isListening, lastScan } = useBluetoothScanner({
    enabled: bluetoothEnabled,
    onScan: (isbn) => {
      handleIsbnScan(isbn);
    },
    validatePattern: /^\d{10,13}$/,
  });

  const handleIsbnScan = async (isbn: string) => {
    console.log("Scanning ISBN:", isbn);

    try {
      // 1. Fetch real pricing data from API
      toast({
        title: "Looking up book...",
        description: "Fetching pricing from Amazon and eBay",
      });

      const pricingResponse = await fetch("/api/books/lookup-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn }),
      });

      if (!pricingResponse.ok) {
        throw new Error("Failed to fetch pricing data");
      }

      const pricingData = await pricingResponse.json();

      // Show toast indicating data source
      if (pricingData.source === 'demo') {
        toast({
          title: "Using demo pricing",
          description: "Real eBay API hit rate limit - showing estimated prices",
        });
      }

      // 2. Calculate velocity based on real data
      const yourCost = 8.00;
      const lowestPrice = pricingData.lowestPrice || pricingData.ebayPrice || pricingData.amazonPrice || 0;
      const fees = lowestPrice * 0.15; // 15% marketplace fees
      const profit = lowestPrice - yourCost - fees;
      const profitMargin = lowestPrice > 0 ? ((profit / lowestPrice) * 100) : 0;
      const salesRank = 15000; // Default for now - could come from Amazon API

      const velocityResponse = await fetch("/api/books/calculate-velocity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salesRank,
          profit,
          profitMargin,
          yourCost,
          category: "Books"
        }),
      });

      let velocityData;
      if (velocityResponse.ok) {
        velocityData = await velocityResponse.json();
      } else {
        velocityData = {
          velocity: { rating: 'medium', description: 'Steady seller', estimatedSalesPerMonth: '3-10' },
          timeToSell: '2-4 weeks',
          buyRecommendation: { recommendation: 'buy', reason: 'Good profit potential' }
        };
      }

      // 3. Build book object with REAL data
      const book: BookDetails = {
        id: Date.now().toString(),
        isbn,
        title: pricingData.title || `Book with ISBN ${isbn}`,
        author: pricingData.author || "Unknown Author",
        thumbnail: pricingData.thumbnail || undefined,
        amazonPrice: pricingData.amazonPrice || null,
        ebayPrice: pricingData.ebayPrice || null,
        yourCost,
        profit,
        status: profit > 5 ? "profitable" : profit > 0 ? "break-even" : "loss",
        description: pricingData.publisher ? `Published by ${pricingData.publisher}` : undefined,
        salesRank,
        velocity: velocityData.velocity.rating,
        velocityDescription: velocityData.velocity.description,
        estimatedSalesPerMonth: velocityData.velocity.estimatedSalesPerMonth,
        timeToSell: velocityData.timeToSell,
        buyRecommendation: velocityData.buyRecommendation.recommendation,
        buyRecommendationReason: velocityData.buyRecommendation.reason,
      };

      // 4. Save scan and check limits
      const saved = await saveScan(isbn, {
        title: book.title,
        author: book.author,
      });

      if (!saved) {
        // Scan limit reached, modal will be shown
        return;
      }

      // 5. Update UI
      setRecentScans([book, ...recentScans.slice(0, 2)]);

      toast({
        title: "Book scanned successfully",
        description: `${book.title} - ${velocityData.velocity.description}`,
      });
    } catch (error: any) {
      console.error("Book scan failed:", error);
      toast({
        title: "Scan failed",
        description: error.message || "Could not fetch book pricing",
        variant: "destructive",
      });
    }
  };

  const handleCoverScan = async (imageData: string) => {
    // Route to shelf scanning if in shelf mode
    if (scanMode === "shelf") {
      return handleShelfScan(imageData);
    }

    console.log("Scanning cover/spine photo");
    setIsProcessingImage(true);
    setRecognitionResult(null);

    toast({
      title: "🤖 AI Recognition Started",
      description: "Analyzing cover or spine photo...",
    });

    try {
      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        body: JSON.stringify({ imageUrl: imageData }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const result = await response.json() as {
        title?: string;
        author?: string;
        isbn?: string;
        publisher?: string;
        series?: string;
        condition?: string;
        description?: string;
        keywords: string[];
        imageType?: 'cover' | 'spine' | 'unknown';
      };

      setRecognitionResult(result);

      const imageTypeLabel = result.imageType === 'spine' ? '📚 Spine' :
                            result.imageType === 'cover' ? '📖 Cover' : '📄 Book';

      toast({
        title: `✨ ${imageTypeLabel} Recognized!`,
        description: result.title || "Book details extracted",
      });

      // If we got an ISBN, fetch full pricing data
      if (result.isbn) {
        handleIsbnScan(result.isbn);
      } else if (result.title) {
        // No ISBN but we have title/author - save it anyway
        console.log("No ISBN found, saving book with AI-extracted data only");

        const book: BookDetails = {
          id: Date.now().toString(),
          isbn: "AI-" + Date.now(), // Fake ISBN for books without barcode
          scannedAt: new Date().toISOString(),
          title: result.title,
          author: result.author || "Unknown Author",
          amazonPrice: null,
          ebayPrice: null,
          yourCost: null,
          profit: null,
          status: "unknown",
          description: result.description,
          condition: result.condition,
        };

        // Save to database
        const saved = await saveScan(book.isbn, {
          title: book.title,
          author: book.author,
        });

        if (saved) {
          // Add to recent scans
          setRecentScans([book, ...recentScans.slice(0, 2)]);

          toast({
            title: "Book Saved",
            description: "Recognition saved to history (no pricing data without ISBN)",
          });
        }
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

  const handleShelfScan = async (imageData: string) => {
    console.log("Scanning shelf with multiple books");
    setIsProcessingImage(true);
    setShelfResults([]);
    setSelectedBooks(new Set());

    toast({
      title: "📚 Shelf Scanning Started",
      description: "Detecting multiple books from your photo...",
    });

    try {
      const response = await fetch("/api/ai/analyze-shelf", {
        method: "POST",
        body: JSON.stringify({ imageUrl: imageData }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to analyze shelf");
      }

      const result = await response.json();
      const books = result.books || [];

      setShelfResults(books);

      // Auto-select high confidence books
      const highConfidenceIndices = new Set(
        books
          .map((book: any, idx: number) => ({ book, idx }))
          .filter(({ book }: any) => book.confidence === "high")
          .map(({ idx }: any) => idx)
      );
      setSelectedBooks(highConfidenceIndices);

      toast({
        title: `✨ Found ${books.length} Books!`,
        description: `Detected ${books.length} book${books.length !== 1 ? 's' : ''} from your shelf photo`,
      });
    } catch (error: any) {
      console.error("Shelf scanning failed:", error);
      toast({
        title: "Shelf Scan Failed",
        description: error.message || "Could not detect books from the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSaveSelectedBooks = async () => {
    const booksToSave = shelfResults.filter((_, idx) => selectedBooks.has(idx));

    if (booksToSave.length === 0) {
      toast({
        title: "No Books Selected",
        description: "Please select at least one book to save",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Saving Books...",
      description: `Saving ${booksToSave.length} book${booksToSave.length !== 1 ? 's' : ''}...`,
    });

    let savedCount = 0;
    for (const book of booksToSave) {
      const bookData: BookDetails = {
        id: Date.now().toString() + Math.random(),
        isbn: book.isbn || "AI-" + Date.now() + Math.random(),
        scannedAt: new Date().toISOString(),
        title: book.title,
        author: book.author || "Unknown Author",
        amazonPrice: null,
        ebayPrice: null,
        yourCost: null,
        profit: null,
        status: "unknown",
        description: book.publisher ? `Published by ${book.publisher}` : undefined,
        condition: book.condition,
      };

      const saved = await saveScan(bookData.isbn, {
        title: bookData.title,
        author: bookData.author,
      });

      if (saved) {
        savedCount++;
        setRecentScans(prev => [bookData, ...prev.slice(0, 2)]);
      } else {
        // Scan limit reached
        break;
      }
    }

    if (savedCount > 0) {
      toast({
        title: "Books Saved!",
        description: `Successfully saved ${savedCount} book${savedCount !== 1 ? 's' : ''} to your library`,
      });

      // Clear shelf results
      setShelfResults([]);
      setSelectedBooks(new Set());
    }
  };

  const toggleBookSelection = (index: number) => {
    const newSelected = new Set(selectedBooks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedBooks(newSelected);
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

  // Handle manual sync trigger
  const handleSync = async () => {
    const syncService = getOfflineSyncService();
    try {
      await syncService.forceSyncNow();
      toast({
        title: "Sync Complete",
        description: `Synced ${offlineStatus.pendingSync} items`,
      });
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      <OfflineBanner
        isOnline={offlineStatus.isOnline}
        pendingCount={offlineStatus.pendingSync}
        onSync={handleSync}
      />

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Scan Books</h1>
            <p className="text-sm text-muted-foreground">
              {scanMode === "single"
                ? "Scan ISBN or capture book cover/spine to get started"
                : "Capture multiple books from your shelf at once"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={scanMode === "shelf" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setScanMode(scanMode === "single" ? "shelf" : "single");
                setShelfResults([]);
                setRecognitionResult(null);
              }}
              className="gap-2"
              data-testid="button-mode-toggle"
            >
              {scanMode === "shelf" ? (
                <>
                  <Library className="h-4 w-4" />
                  <span className="hidden sm:inline">Shelf</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  <span className="hidden sm:inline">Single</span>
                </>
              )}
            </Button>
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

        {/* Scan Counter Banner */}
        {!scanLimits.isUnlimited && currentTier !== "pro" && currentTier !== "enterprise" && (
          <Card
            className={`p-4 transition-colors ${
              scanLimits.percentUsed >= 90
                ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50'
                : scanLimits.percentUsed >= 70
                ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50'
                : 'border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  scanLimits.percentUsed >= 90
                    ? 'bg-red-100'
                    : scanLimits.percentUsed >= 70
                    ? 'bg-orange-100'
                    : 'bg-primary/10'
                }`}>
                  <Zap className={`h-5 w-5 ${
                    scanLimits.percentUsed >= 90
                      ? 'text-red-600'
                      : scanLimits.percentUsed >= 70
                      ? 'text-orange-600'
                      : 'text-primary'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-lg font-bold">
                      {scanLimits.scansRemaining}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {currentTier === "trial" || currentTier === "free"
                        ? "free scans remaining"
                        : currentTier === "basic"
                        ? "scans remaining (ISBN only)"
                        : "scans remaining this month"}
                    </span>
                  </div>
                  <Progress
                    value={scanLimits.percentUsed}
                    className={`h-2 ${
                      scanLimits.percentUsed >= 90 ? 'bg-red-200' :
                      scanLimits.percentUsed >= 70 ? 'bg-orange-200' : ''
                    }`}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {scanLimits.scansUsed} of {scanLimits.scansLimit} scans used
                    {(currentTier === "trial" || currentTier === "free") && scanLimits.percentUsed >= 50 && (
                      <span className="ml-1">
                        • <button
                          onClick={() => setLocation("/subscription")}
                          className="text-primary font-medium underline hover:text-primary/80"
                        >
                          Upgrade to Pro for unlimited scans + AI
                        </button>
                      </span>
                    )}
                    {currentTier === "basic" && scanLimits.percentUsed >= 70 && (
                      <span className="ml-1">
                        • <button
                          onClick={() => setLocation("/subscription")}
                          className="text-primary font-medium underline hover:text-primary/80"
                        >
                          Upgrade to Pro for unlimited scans + AI
                        </button>
                      </span>
                    )}
                  </p>
                </div>
              </div>
              {(scanLimits.percentUsed >= 70 || currentTier === "trial" || currentTier === "free" || currentTier === "basic") && (
                <Button
                  onClick={() => setLocation("/subscription")}
                  size="sm"
                  variant={scanLimits.percentUsed >= 90 ? "destructive" : "default"}
                  className={scanLimits.percentUsed < 90 ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700" : ""}
                >
                  {currentTier === "trial" || currentTier === "free"
                    ? "Upgrade"
                    : currentTier === "basic"
                    ? "Upgrade to Pro"
                    : "Get More"}
                </Button>
              )}
            </div>
          </Card>
        )}

        <ScannerInterface
          onIsbnScan={handleIsbnScan}
          onCoverScan={handleCoverScan}
        />

        {/* Batch Scanner */}
        <BatchScanner
          onComplete={(results) => {
            // Add successful scans to recent scans
            const successfulBooks = results
              .filter(r => r.status === 'success' && r.title)
              .map(r => ({
                id: 0,
                isbn: r.isbn,
                title: r.title || 'Unknown',
                author: r.author || 'Unknown',
                ebayPrice: r.ebayPrice,
                amazonPrice: r.amazonPrice,
                status: 'pending' as const,
              }));

            if (successfulBooks.length > 0) {
              setRecentScans(prev => [...successfulBooks, ...prev].slice(0, 10));
              refreshScanLimits(); // Refresh limits after batch scan

              toast({
                title: "Batch scan complete",
                description: `Added ${successfulBooks.length} books to your library`,
              });
            }
          }}
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

        {/* Shelf Scanning Results */}
        {shelfResults.length > 0 && !isProcessingImage && (
          <Card className="p-6 bg-blue-500/5 border-blue-500/20" data-testid="card-shelf-results">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Library className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">
                    Detected {shelfResults.length} Book{shelfResults.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                <Badge variant="secondary">
                  {selectedBooks.size} selected
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                Select the books you want to save. High confidence books are pre-selected.
              </p>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {shelfResults.map((book: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedBooks.has(index)
                        ? 'bg-primary/5 border-primary'
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                    onClick={() => toggleBookSelection(index)}
                    data-testid={`shelf-book-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedBooks.has(index)}
                        onChange={() => toggleBookSelection(index)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate" data-testid={`shelf-book-title-${index}`}>
                              {book.title || "Unknown Title"}
                            </p>
                            {book.author && (
                              <p className="text-sm text-muted-foreground truncate">
                                {book.author}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant={
                                book.confidence === "high"
                                  ? "default"
                                  : book.confidence === "medium"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {book.confidence || "low"}
                            </Badge>
                            {book.position && (
                              <span className="text-xs text-muted-foreground">
                                Pos #{book.position}
                              </span>
                            )}
                          </div>
                        </div>
                        {book.isbn && (
                          <p className="text-xs text-muted-foreground font-mono mt-1">
                            ISBN: {book.isbn}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSelectedBooks}
                  disabled={selectedBooks.size === 0}
                  className="flex-1"
                  data-testid="button-save-selected"
                >
                  Save {selectedBooks.size} Book{selectedBooks.size !== 1 ? 's' : ''}
                </Button>
                <Button
                  onClick={() => {
                    setShelfResults([]);
                    setSelectedBooks(new Set());
                  }}
                  variant="outline"
                  data-testid="button-scan-another-shelf"
                >
                  Scan Again
                </Button>
              </div>
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

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        scansUsed={scanLimits.scansUsed}
        scansLimit={scanLimits.scansLimit}
        currentTier={currentTier}
      />
    </div>
  );
}
