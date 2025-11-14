import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Pause,
  X,
  Upload,
  PackagePlus,
  CheckCircle2,
  XCircle,
  Loader2,
  ScanBarcode,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface BatchScanResult {
  isbn: string;
  status: "pending" | "processing" | "success" | "error";
  title?: string;
  author?: string;
  ebayPrice?: number;
  amazonPrice?: number;
  error?: string;
}

export interface BatchScannerProps {
  onComplete?: (results: BatchScanResult[]) => void;
}

export function BatchScanner({ onComplete }: BatchScannerProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [inputText, setInputText] = useState("");
  const [queue, setQueue] = useState<BatchScanResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addISBNsFromText = () => {
    const isbns = inputText
      .split(/[\n,;\s]+/)
      .map((isbn) => isbn.trim())
      .filter((isbn) => isbn.length >= 10); // Basic ISBN validation

    if (isbns.length === 0) {
      toast({
        title: "No valid ISBNs found",
        description: "Please enter at least one ISBN",
        variant: "destructive",
      });
      return;
    }

    // Remove duplicates
    const uniqueISBNs = Array.from(new Set(isbns));

    // Add to queue
    const newItems: BatchScanResult[] = uniqueISBNs.map((isbn) => ({
      isbn,
      status: "pending",
    }));

    setQueue([...queue, ...newItems]);
    setInputText("");

    toast({
      title: "ISBNs added to queue",
      description: `Added ${uniqueISBNs.length} ISBN${uniqueISBNs.length !== 1 ? "s" : ""} to scan`,
    });
  };

  const addSingleISBN = (isbn: string) => {
    if (isbn.length < 10) {
      toast({
        title: "Invalid ISBN",
        description: "ISBN must be at least 10 characters",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates
    if (queue.some((item) => item.isbn === isbn)) {
      toast({
        title: "Duplicate ISBN",
        description: "This ISBN is already in the queue",
        variant: "destructive",
      });
      return;
    }

    setQueue([...queue, { isbn, status: "pending" }]);
  };

  const removeFromQueue = (isbn: string) => {
    setQueue(queue.filter((item) => item.isbn !== isbn));
  };

  const clearQueue = () => {
    if (isScanning) {
      toast({
        title: "Cannot clear while scanning",
        description: "Please pause or stop scanning first",
        variant: "destructive",
      });
      return;
    }
    setQueue([]);
    setCurrentIndex(0);
  };

  const startScanning = async () => {
    if (queue.length === 0) {
      toast({
        title: "Queue is empty",
        description: "Add some ISBNs to scan first",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setIsPaused(false);

    // Process queue
    for (let i = currentIndex; i < queue.length; i++) {
      if (isPaused) break;

      const item = queue[i];
      if (item.status === "success") continue; // Skip already processed

      // Update status to processing
      setQueue((prev) =>
        prev.map((q, idx) =>
          idx === i ? { ...q, status: "processing" } : q
        )
      );
      setCurrentIndex(i);

      try {
        // Scan the book
        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isbn: item.isbn, status: "pending" }),
        });

        if (!response.ok) {
          throw new Error("Failed to scan book");
        }

        const bookData = await response.json();

        // Fetch pricing
        let ebayPrice: number | undefined = undefined;
        let amazonPrice: number | undefined = undefined;
        try {
          const priceResponse = await fetch(`/api/books/${item.isbn}/prices`);
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            ebayPrice = priceData.ebayPrice;
            amazonPrice = priceData.amazonPrice;
          }
        } catch (priceError) {
          console.error("Failed to fetch prices:", priceError);
        }

        // Update with success
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: "success",
                  title: bookData.title,
                  author: bookData.author,
                  ebayPrice,
                  amazonPrice,
                }
              : q
          )
        );
      } catch (error: any) {
        console.error("Scan error:", error);
        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: "error",
                  error: error.message || "Failed to scan",
                }
              : q
          )
        );
      }

      // Small delay between scans
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsScanning(false);
    setCurrentIndex(0);

    // Show completion toast
    const successful = queue.filter((q) => q.status === "success").length;
    const failed = queue.filter((q) => q.status === "error").length;

    toast({
      title: "Batch scan complete",
      description: `${successful} successful, ${failed} failed`,
    });

    if (onComplete) {
      onComplete(queue);
    }
  };

  const pauseScanning = () => {
    setIsPaused(true);
    setIsScanning(false);
  };

  const resumeScanning = () => {
    setIsPaused(false);
    startScanning();
  };

  const progress =
    queue.length > 0
      ? (queue.filter((q) => q.status === "success" || q.status === "error")
          .length /
          queue.length) *
        100
      : 0;

  const successCount = queue.filter((q) => q.status === "success").length;
  const errorCount = queue.filter((q) => q.status === "error").length;
  const pendingCount = queue.filter(
    (q) => q.status === "pending" || q.status === "processing"
  ).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <PackagePlus className="h-4 w-4 mr-2" />
          Batch Scan Mode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Batch Scanner</DialogTitle>
          <DialogDescription>
            Scan multiple books at once by entering ISBNs manually or importing
            from a list
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Bar */}
          {queue.length > 0 && (
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">
                    {successCount + errorCount} / {queue.length}
                  </span>
                </div>
                <Progress value={progress} />
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600">
                    <CheckCircle2 className="inline h-3 w-3 mr-1" />
                    {successCount} successful
                  </span>
                  <span className="text-red-600">
                    <XCircle className="inline h-3 w-3 mr-1" />
                    {errorCount} failed
                  </span>
                  <span className="text-muted-foreground">
                    <Loader2 className="inline h-3 w-3 mr-1" />
                    {pendingCount} pending
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Add ISBNs Tabs */}
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                <FileText className="h-4 w-4 mr-2" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="camera">
                <ScanBarcode className="h-4 w-4 mr-2" />
                Camera Scan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-3">
              <Textarea
                placeholder="Enter ISBNs (one per line, or separated by commas, spaces, or semicolons)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                disabled={isScanning}
              />
              <Button
                onClick={addISBNsFromText}
                disabled={isScanning || !inputText.trim()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Add to Queue
              </Button>
            </TabsContent>

            <TabsContent value="camera" className="space-y-3">
              <div className="text-center p-8 border-2 border-dashed rounded-lg">
                <ScanBarcode className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Scan barcodes continuously. Each scanned ISBN will be added to
                  the queue automatically.
                </p>
                <Button variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Queue List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold">
                Queue ({queue.length} items)
              </h3>
              {queue.length > 0 && !isScanning && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearQueue}
                  disabled={isScanning}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <ScrollArea className="h-[300px] border rounded-lg p-2">
              {queue.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <PackagePlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No ISBNs in queue</p>
                  <p className="text-xs">Add ISBNs above to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((item, idx) => (
                    <Card
                      key={idx}
                      className={`p-3 ${item.status === "processing" ? "bg-blue-50 dark:bg-blue-950" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-medium">
                              {item.isbn}
                            </span>
                            {item.status === "success" && (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-600"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Success
                              </Badge>
                            )}
                            {item.status === "error" && (
                              <Badge
                                variant="outline"
                                className="text-red-600 border-red-600"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                            {item.status === "processing" && (
                              <Badge variant="outline" className="text-blue-600">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Processing
                              </Badge>
                            )}
                          </div>
                          {item.title && (
                            <p className="text-sm text-muted-foreground truncate">
                              {item.title}
                              {item.author && ` by ${item.author}`}
                            </p>
                          )}
                          {item.ebayPrice && (
                            <p className="text-sm font-medium text-green-600">
                              £{item.ebayPrice.toFixed(2)} on eBay
                            </p>
                          )}
                          {item.error && (
                            <p className="text-sm text-red-600">{item.error}</p>
                          )}
                        </div>
                        {item.status === "pending" && !isScanning && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromQueue(item.isbn)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isScanning && !isPaused && (
              <Button
                onClick={startScanning}
                disabled={queue.length === 0 || isScanning}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            )}
            {isScanning && (
              <Button onClick={pauseScanning} variant="outline" className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button onClick={resumeScanning} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isScanning}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
