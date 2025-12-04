import { useState, useEffect, useCallback } from "react";
import { ScannerInterface } from "@/components/ScannerInterface";
import { BookDetailsModal, type BookDetails } from "@/components/BookDetailsModal";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AppHeader } from "@/components/AppHeader";
import { ProfitVerdict, calculateVerdict, type ProfitVerdictData } from "@/components/ProfitVerdict";
import { CostEditor, getUserCosts } from "@/components/CostEditor";
import { OnboardingWizard, useOnboarding } from "@/components/OnboardingWizard";
import { useToast } from "@/hooks/use-toast";
import { useBluetoothScanner } from "@/hooks/use-bluetooth-scanner";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Zap,
  Crown,
  Bluetooth,
  BluetoothConnected,
  Library,
  Layers,
  X,
  Check,
  Trash2
} from "lucide-react";
import { getOfflineSyncService, type OfflineStatus } from "@/lib/offline-sync";
import { getScanQueue } from "@/lib/scan-queue";
import { getOfflineDB } from "@/lib/offline-db";
import { lookupPricing } from "@/lib/offline-pricing";
import { InstallPrompt, useTrackScansForInstall } from "@/components/InstallPrompt";
import { apiRequest } from "@/lib/queryClient";

export default function ScanPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { incrementScanCount } = useTrackScansForInstall();
  const { showOnboarding, completeOnboarding } = useOnboarding();
  
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    pendingSync: 0,
    lastSync: null,
  });
  const [selectedBook, setSelectedBook] = useState<BookDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [currentVerdict, setCurrentVerdict] = useState<ProfitVerdictData | null>(null);
  const [costEditorOpen, setCostEditorOpen] = useState(false);
  const [currentCost, setCurrentCost] = useState(() => getUserCosts().defaultPurchaseCost);

  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [shelfMode, setShelfMode] = useState(false);
  const [shelfScans, setShelfScans] = useState<ProfitVerdictData[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const { data: scanLimits } = useQuery<{
    scansUsedToday: number;
    scansUsedMonth: number;
    dailyLimit: number;
    monthlyLimit: number;
    scansRemainingToday: number;
    scansRemainingMonth: number;
    percentUsedToday: number;
    percentUsedMonth: number;
    isUnlimited: boolean;
    tier: string;
  }>({
    queryKey: ['/api/user/scan-limits'],
    refetchInterval: 30000,
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user/me'],
  });

  useEffect(() => {
    const syncService = getOfflineSyncService();
    setOfflineStatus(syncService.getStatus());
    const unsubscribe = syncService.onStatusChange(setOfflineStatus);
    return unsubscribe;
  }, []);

  const { isListening } = useBluetoothScanner({
    onScan: (barcode: string) => {
      console.log("[ScanPage] Bluetooth scanner detected:", barcode);
      if (!shelfMode) {
        toast({
          title: "Barcode Scanned",
          description: `ISBN: ${barcode}`,
        });
      }
      handleIsbnScan(barcode);
    },
    enabled: bluetoothEnabled,
  });

  const saveScan = async (isbn: string, bookData: any) => {
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
      const syncService = getOfflineSyncService();
      setOfflineStatus(syncService.getStatus());
      return true;
    }

    try {
      const response = await apiRequest("POST", "/api/books", { isbn, ...bookData });

      if (response.status === 403) {
        const error = await response.json();
        toast({
          title: "Scan Limit Reached",
          description: error.message || "Upgrade to continue scanning",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error("Save scan error:", error);
      
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
        const syncService = getOfflineSyncService();
        setOfflineStatus(syncService.getStatus());
        return true;
      }

      toast({
        title: "Save Failed",
        description: error.message || "Could not save scan",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleIsbnScan = async (isbn: string) => {
    console.log("Scanning ISBN:", isbn);
    setIsScanning(true);

    try {
      if (!shelfMode) {
        toast({
          title: "Looking up book...",
          description: offlineStatus.isOnline
            ? "Fetching pricing from marketplaces"
            : "Looking up from offline cache",
        });
      }

      const pricingData = await lookupPricing(isbn);

      const userCosts = getUserCosts();
      const yourCost = currentCost || userCosts.defaultPurchaseCost;
      const shipping = userCosts.estimatedShipping;
      
      // Calculate eBay profit (12.8% fee)
      const ebayFeePercent = userCosts.ebayFeePercentage || 12.8;
      const ebayPrice = pricingData.ebayPrice || 0;
      const ebayFees = ebayPrice * (ebayFeePercent / 100);
      const ebayProfit = ebayPrice > 0 ? ebayPrice - yourCost - ebayFees - shipping : 0;
      
      // Calculate Amazon profit (15.3% fee)
      const amazonFeePercent = userCosts.amazonFeePercentage || 15.3;
      const amazonPrice = pricingData.amazonPrice || 0;
      const amazonFees = amazonPrice * (amazonFeePercent / 100);
      const amazonProfit = amazonPrice > 0 ? amazonPrice - yourCost - amazonFees - shipping : 0;
      
      // Best profit for verdict calculation
      const bestProfit = Math.max(ebayProfit, amazonProfit);
      const lowestPrice = pricingData.lowestPrice || pricingData.ebayPrice || pricingData.amazonPrice || 0;
      const feePercentage = userCosts.feePercentage / 100;
      const fees = lowestPrice * feePercentage;
      const profit = bestProfit;
      const roi = yourCost > 0 ? ((profit / yourCost) * 100) : 0;

      const { verdict, reason } = calculateVerdict(profit, roi, pricingData.confidence);

      const verdictData: ProfitVerdictData = {
        title: pricingData.title || `Book with ISBN ${isbn}`,
        author: pricingData.author || "Unknown Author",
        isbn,
        thumbnail: pricingData.thumbnail || undefined,
        yourCost,
        ebayPrice: pricingData.ebayPrice,
        amazonPrice: pricingData.amazonPrice,
        fees,
        ebayFees,
        amazonFees,
        shipping,
        profit,
        ebayProfit,
        amazonProfit,
        roi,
        verdict,
        reason,
        velocity: "Medium seller",
        timeToSell: "2-4 weeks",
        confidence: pricingData.confidence,
        source: pricingData.source,
      };

      if (shelfMode) {
        setShelfScans(prev => [...prev, verdictData]);
        toast({
          title: verdict === "BUY" ? "BUY IT!" : verdict === "SKIP" ? "SKIP" : "MAYBE",
          description: `${pricingData.title?.substring(0, 30) || isbn}... £${profit.toFixed(2)} profit`,
        });
      } else {
        setCurrentVerdict(verdictData);
      }

      apiRequest("POST", "/api/books/calculate-velocity", {
        salesRank: 15000,
        profit,
        profitMargin: lowestPrice > 0 ? ((profit / lowestPrice) * 100) : 0,
        yourCost,
        category: "Books"
      }).then(async (res) => {
        if (res.ok) {
          const velocityData = await res.json();
          setCurrentVerdict(prev => prev ? {
            ...prev,
            velocity: velocityData.velocity.description,
            timeToSell: velocityData.timeToSell,
          } : null);
        }
      }).catch(() => {});

      const saved = await saveScan(isbn, {
        title: pricingData.title,
        author: pricingData.author,
      });

      if (!saved) return;

      try {
        const offlineDB = getOfflineDB();
        await offlineDB.saveBook({
          id: Date.now().toString(),
          isbn,
          title: pricingData.title || `Book with ISBN ${isbn}`,
          author: pricingData.author || "Unknown Author",
          thumbnail: pricingData.thumbnail || undefined,
          amazonPrice: pricingData.amazonPrice,
          ebayPrice: pricingData.ebayPrice,
          yourCost,
          profit,
          status: profit > 5 ? "profitable" : profit > 0 ? "break-even" : "loss",
          scannedAt: new Date().toISOString(),
          salesRank: 15000,
          velocity: "medium",
          velocityDescription: "Steady seller",
          buyRecommendation: verdict.toLowerCase(),
        });
      } catch (dbError) {
        console.error('[ScanPage] Failed to save to IndexedDB:', dbError);
      }

      incrementScanCount();

    } catch (error: any) {
      console.error("Book scan failed:", error);
      toast({
        title: "Scan failed",
        description: error.message || "Could not fetch book pricing",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCoverScan = async (imageData: string) => {
    console.log("Scanning cover/spine photo");
    setIsProcessingImage(true);

    toast({
      title: "AI Recognition Started",
      description: "Analyzing cover or spine photo...",
    });

    try {
      const response = await apiRequest("POST", "/api/ai/analyze-image", { imageUrl: imageData });

      const result = await response.json();

      toast({
        title: "Book Recognized!",
        description: result.title || "Book details extracted",
      });

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


  const scansRemaining = scanLimits?.scansRemainingToday ?? Infinity;
  const dailyLimit = scanLimits?.dailyLimit ?? Infinity;

  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      <OfflineBanner
        isOnline={offlineStatus.isOnline}
        pendingCount={offlineStatus.pendingSync}
        onSync={handleSync}
      />

      <OnboardingWizard 
        open={showOnboarding} 
        onComplete={completeOnboarding} 
      />

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Scan Books</h1>
          <p className="text-sm text-muted-foreground">
            Point at barcode or take a photo
          </p>
        </div>

        {currentVerdict ? (
          <ProfitVerdict
            data={currentVerdict}
            onSave={() => {
              toast({
                title: "Saved to Library",
                description: `${currentVerdict.title} saved successfully`,
              });
              setCurrentVerdict(null);
            }}
            onDismiss={() => setCurrentVerdict(null)}
            onEditCost={() => setCostEditorOpen(true)}
          />
        ) : (
          <>
            {isProcessingImage && (
              <Card className="p-6 bg-emerald-500/5 border-emerald-500/20" data-testid="card-ai-processing">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  <div>
                    <h3 className="font-semibold">AI Recognition in Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Analyzing image for title, author, and ISBN...
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {!isProcessingImage && (scansRemaining > 0 || scansRemaining === Infinity) && (
              <ScannerInterface
                onIsbnScan={handleIsbnScan}
                onCoverScan={handleCoverScan}
              />
            )}
          </>
        )}

        <CostEditor
          open={costEditorOpen}
          onClose={() => setCostEditorOpen(false)}
          currentCost={currentCost}
          onCostChange={(newCost) => {
            setCurrentCost(newCost);
            if (currentVerdict) {
              const userCosts = getUserCosts();
              const shipping = userCosts.estimatedShipping;
              
              // Recalculate eBay profit
              const ebayFeePercent = userCosts.ebayFeePercentage || 12.8;
              const ebayPrice = currentVerdict.ebayPrice || 0;
              const ebayFees = ebayPrice * (ebayFeePercent / 100);
              const ebayProfit = ebayPrice > 0 ? ebayPrice - newCost - ebayFees - shipping : 0;
              
              // Recalculate Amazon profit
              const amazonFeePercent = userCosts.amazonFeePercentage || 15.3;
              const amazonPrice = currentVerdict.amazonPrice || 0;
              const amazonFees = amazonPrice * (amazonFeePercent / 100);
              const amazonProfit = amazonPrice > 0 ? amazonPrice - newCost - amazonFees - shipping : 0;
              
              const bestProfit = Math.max(ebayProfit, amazonProfit);
              const bestPrice = currentVerdict.ebayPrice || currentVerdict.amazonPrice || 0;
              const fees = bestPrice * (userCosts.feePercentage / 100);
              const roi = newCost > 0 ? ((bestProfit / newCost) * 100) : 0;
              const { verdict, reason } = calculateVerdict(bestProfit, roi, currentVerdict.confidence);
              
              setCurrentVerdict({
                ...currentVerdict,
                yourCost: newCost,
                fees,
                ebayFees,
                amazonFees,
                profit: bestProfit,
                ebayProfit,
                amazonProfit,
                roi,
                verdict,
                reason,
              });
            }
          }}
        />

        {/* Bluetooth & Shelf Mode Controls - Always visible when scanning */}
        {!currentVerdict && (
          <div className="flex gap-2">
            <Button
              variant={bluetoothEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setBluetoothEnabled(!bluetoothEnabled);
                toast({
                  title: bluetoothEnabled ? "Bluetooth Scanner Off" : "Bluetooth Scanner On",
                  description: bluetoothEnabled 
                    ? "Switched to camera scanning" 
                    : "Ready to receive barcode input",
                });
              }}
              className={`flex-1 gap-2 ${bluetoothEnabled ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              data-testid="button-bluetooth-toggle"
            >
              {bluetoothEnabled ? (
                <BluetoothConnected className="h-4 w-4" />
              ) : (
                <Bluetooth className="h-4 w-4" />
              )}
              {bluetoothEnabled ? "Scanner On" : "Connect Scanner"}
            </Button>
            <Button
              variant={shelfMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (shelfMode && shelfScans.length > 0) {
                  return;
                }
                setShelfMode(!shelfMode);
                setShelfScans([]);
                toast({
                  title: shelfMode ? "Shelf Mode Off" : "Shelf Mode On",
                  description: shelfMode 
                    ? "Switched to single scan mode" 
                    : "Rapid scan multiple books, review together",
                });
              }}
              className={`flex-1 gap-2 ${shelfMode ? "bg-amber-600 hover:bg-amber-700" : ""}`}
              data-testid="button-shelf-mode"
            >
              <Layers className="h-4 w-4" />
              {shelfMode ? `Shelf (${shelfScans.length})` : "Shelf Mode"}
            </Button>
          </div>
        )}

        {/* Shelf Mode Scans List */}
        {shelfMode && shelfScans.length > 0 && (
          <Card className="overflow-hidden" data-testid="card-shelf-scans">
            <div className="p-3 bg-amber-500/10 border-b flex items-center justify-between">
              <span className="font-semibold text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-600" />
                Shelf Scans ({shelfScans.length})
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShelfScans([]);
                    toast({ title: "Shelf cleared" });
                  }}
                  data-testid="button-clear-shelf"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShelfMode(false);
                    setShelfScans([]);
                    toast({ title: "Shelf mode finished", description: `Scanned ${shelfScans.length} books` });
                  }}
                  data-testid="button-finish-shelf"
                >
                  Done
                </Button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y">
              {shelfScans.map((scan, index) => (
                <div 
                  key={`${scan.isbn}-${index}`}
                  className={`p-3 flex items-center gap-3 ${
                    scan.verdict === "BUY" 
                      ? "bg-emerald-50 dark:bg-emerald-950/20" 
                      : scan.verdict === "SKIP"
                      ? "bg-red-50 dark:bg-red-950/20"
                      : "bg-amber-50 dark:bg-amber-950/20"
                  }`}
                  data-testid={`shelf-scan-${index}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                    scan.verdict === "BUY" ? "bg-emerald-500" : scan.verdict === "SKIP" ? "bg-red-500" : "bg-amber-500"
                  }`}>
                    {scan.verdict === "BUY" ? <Check className="h-4 w-4" /> : scan.verdict === "SKIP" ? <X className="h-4 w-4" /> : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{scan.title}</p>
                    <p className="text-xs text-muted-foreground">
                      £{scan.profit.toFixed(2)} profit • {scan.roi.toFixed(0)}% ROI
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShelfScans(prev => prev.filter((_, i) => i !== index))}
                    data-testid={`button-remove-scan-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className="p-3 bg-muted/50 border-t">
              <div className="flex justify-between text-sm">
                <span>Total BUY: <strong className="text-emerald-600">{shelfScans.filter(s => s.verdict === "BUY").length}</strong></span>
                <span>Total profit: <strong className="text-emerald-600">£{shelfScans.filter(s => s.verdict === "BUY").reduce((sum, s) => sum + s.profit, 0).toFixed(2)}</strong></span>
              </div>
            </div>
          </Card>
        )}

        {!currentVerdict && !shelfMode && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between text-muted-foreground"
              data-testid="button-toggle-advanced"
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                More Options
              </span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showAdvanced && (
              <Card className="mt-2 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation('/app/history')}
                    className="justify-start gap-2"
                    data-testid="button-scan-history"
                  >
                    <Library className="h-4 w-4" />
                    Scan History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCostEditorOpen(true)}
                    className="justify-start gap-2"
                    data-testid="button-edit-costs"
                  >
                    <Zap className="h-4 w-4" />
                    Edit Costs
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        <Card className="p-3 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 shrink-0">
              <Zap className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xs">
              <p className="font-medium">Quick tip</p>
              <p className="text-muted-foreground">
                Scan fast, decide fast. Speed is your competitive advantage!
              </p>
            </div>
          </div>
        </Card>
      </div>

      <BookDetailsModal
        book={selectedBook}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      <InstallPrompt />
    </div>
  );
}
