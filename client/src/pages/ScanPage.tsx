import { useState, useEffect } from "react";
import { ScannerInterface } from "@/components/ScannerInterface";
import { BookDetailsModal, type BookDetails } from "@/components/BookDetailsModal";
import { OfflineBanner } from "@/components/OfflineBanner";
import { AppHeader } from "@/components/AppHeader";
import { ProfitVerdict, calculateVerdict, type ProfitVerdictData } from "@/components/ProfitVerdict";
import { CostEditor, getUserCosts } from "@/components/CostEditor";
import { OnboardingWizard, useOnboarding } from "@/components/OnboardingWizard";
import { useToast } from "@/hooks/use-toast";
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
  Library
} from "lucide-react";
import { getOfflineSyncService, type OfflineStatus } from "@/lib/offline-sync";
import { getScanQueue } from "@/lib/scan-queue";
import { getOfflineDB } from "@/lib/offline-db";
import { lookupPricing } from "@/lib/offline-pricing";
import { InstallPrompt, useTrackScansForInstall } from "@/components/InstallPrompt";
import { getAuthToken } from "@/lib/queryClient";

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
      const token = getAuthToken();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/books", {
        method: "POST",
        headers,
        body: JSON.stringify({ isbn, ...bookData }),
        credentials: 'include',
      });

      if (response.status === 403) {
        const error = await response.json();
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

    try {
      toast({
        title: "Looking up book...",
        description: offlineStatus.isOnline
          ? "Fetching pricing from marketplaces"
          : "Looking up from offline cache",
      });

      const pricingData = await lookupPricing(isbn);

      const userCosts = getUserCosts();
      const yourCost = currentCost || userCosts.defaultPurchaseCost;
      const lowestPrice = pricingData.lowestPrice || pricingData.ebayPrice || pricingData.amazonPrice || 0;
      const feePercentage = userCosts.feePercentage / 100;
      const fees = lowestPrice * feePercentage;
      const shipping = userCosts.estimatedShipping;
      const profit = lowestPrice - yourCost - fees - shipping;
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
        shipping,
        profit,
        roi,
        verdict,
        reason,
        velocity: "Medium seller",
        timeToSell: "2-4 weeks",
        confidence: pricingData.confidence,
        source: pricingData.source,
      };

      setCurrentVerdict(verdictData);

      const velocityToken = getAuthToken();
      const velocityHeaders: HeadersInit = { "Content-Type": "application/json" };
      if (velocityToken) {
        velocityHeaders['Authorization'] = `Bearer ${velocityToken}`;
      }
      
      fetch("/api/books/calculate-velocity", {
        method: "POST",
        headers: velocityHeaders,
        credentials: 'include',
        body: JSON.stringify({
          salesRank: 15000,
          profit,
          profitMargin: lowestPrice > 0 ? ((profit / lowestPrice) * 100) : 0,
          yourCost,
          category: "Books"
        }),
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
      const aiToken = getAuthToken();
      const aiHeaders: HeadersInit = { "Content-Type": "application/json" };
      if (aiToken) {
        aiHeaders['Authorization'] = `Bearer ${aiToken}`;
      }
      
      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        body: JSON.stringify({ imageUrl: imageData }),
        headers: aiHeaders,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

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

  const handleListFromModal = (platform: "amazon" | "ebay") => {
    toast({
      title: `Listing to ${platform}`,
      description: "Redirecting to listing form...",
    });
    setDetailsOpen(false);
    setLocation("/listings/new");
  };

  const isFreeTier = !scanLimits?.isUnlimited && scanLimits?.tier === 'free';
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Scan Books</h1>
            <p className="text-sm text-muted-foreground">
              Point at barcode or take a photo
            </p>
          </div>
          {!scanLimits?.isUnlimited && scansRemaining !== Infinity && (
            <Badge 
              variant={scansRemaining > 3 ? "secondary" : "destructive"}
              className="gap-1"
            >
              {scansRemaining}/{dailyLimit} scans left
            </Badge>
          )}
        </div>

        {isFreeTier && scansRemaining <= 3 && scansRemaining > 0 && (
          <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {scansRemaining} free scans remaining today
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => setLocation('/subscription')}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                data-testid="button-upgrade"
              >
                Upgrade
              </Button>
            </div>
          </Card>
        )}

        {isFreeTier && scansRemaining === 0 && (
          <Card className="p-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <div className="text-center space-y-3">
              <Crown className="h-8 w-8 text-red-600 mx-auto" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Daily Limit Reached</h3>
                <p className="text-sm text-red-600 dark:text-red-300">
                  You've used all 10 free scans for today. Upgrade for unlimited scanning!
                </p>
              </div>
              <Button
                onClick={() => setLocation('/subscription')}
                className="bg-red-600 hover:bg-red-700 text-white"
                data-testid="button-upgrade-limit"
              >
                Upgrade Now
              </Button>
            </div>
          </Card>
        )}

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
            onList={(platform) => {
              toast({
                title: `Listing to ${platform}`,
                description: "Redirecting to listing form...",
              });
              setLocation("/app/listings/new");
            }}
            onDismiss={() => setCurrentVerdict(null)}
            onEditCost={() => setCostEditorOpen(true)}
          />
        ) : (
          <>
            {isProcessingImage && (
              <Card className="p-6 bg-teal-500/5 border-teal-500/20" data-testid="card-ai-processing">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
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
              const bestPrice = currentVerdict.ebayPrice || currentVerdict.amazonPrice || 0;
              const fees = bestPrice * (userCosts.feePercentage / 100);
              const profit = bestPrice - newCost - fees - userCosts.estimatedShipping;
              const roi = newCost > 0 ? ((profit / newCost) * 100) : 0;
              const { verdict, reason } = calculateVerdict(profit, roi, currentVerdict.confidence);
              
              setCurrentVerdict({
                ...currentVerdict,
                yourCost: newCost,
                fees,
                profit,
                roi,
                verdict,
                reason,
              });
            }
          }}
        />

        {!currentVerdict && (
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
                Advanced Tools
              </span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showAdvanced && (
              <Card className="mt-2 p-4 space-y-3">
                <p className="text-xs text-muted-foreground">Power user features</p>
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
                <p className="text-[10px] text-muted-foreground">
                  Bluetooth scanner and batch mode coming soon
                </p>
              </Card>
            )}
          </div>
        )}

        <Card className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 border-teal-200 dark:border-teal-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 shrink-0">
              <Zap className="h-4 w-4 text-teal-600" />
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
        onList={handleListFromModal}
      />

      <InstallPrompt />
    </div>
  );
}
