import { useState, useRef, useEffect } from "react";
import { Camera, Hash, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { 
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHintALLOption,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation
} from "@capacitor/barcode-scanner";
import { Capacitor } from "@capacitor/core";

export interface ScannerInterfaceProps {
  onIsbnScan: (isbn: string) => void;
  onCoverScan: (imageData: string) => void;
}

export function ScannerInterface({ onIsbnScan, onCoverScan }: ScannerInterfaceProps) {
  const [manualIsbn, setManualIsbn] = useState("");
  const [scanMode, setScanMode] = useState<"isbn" | "cover">("isbn");
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isProcessingRef = useRef(false);

  // Initialize barcode reader
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (e) {
        // Ignore reset errors
      }
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsScanning(false);
    isProcessingRef.current = false;
  };

  const startBarcodeScanning = async () => {
    setError(null);
    setIsScanning(true);

    // Check if running on native mobile platform (iOS or Android)
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      // Use native Capacitor barcode scanner
      try {
        console.log("Using native Capacitor barcode scanner...");

        const result = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHintALLOption.ALL,
          scanInstructions: "Position the barcode in the frame",
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.ADAPTIVE,
        });

        setIsScanning(false);

        if (result.ScanResult) {
          console.log("Native barcode detected:", result.ScanResult);
          const cleanedText = result.ScanResult.replace(/[-\s]/g, "");

          // Validate ISBN format (10 or 13 digits)
          if (/^\d{10}(\d{3})?$/.test(cleanedText)) {
            console.log("Valid ISBN found:", cleanedText);
            onIsbnScan(cleanedText);
          } else {
            setError("Scanned code is not a valid ISBN. Please scan a book barcode.");
          }
        }
      } catch (err: any) {
        console.error("Native barcode scan error:", err);
        setError(
          err.message || "Failed to scan barcode. Please try again."
        );
        setIsScanning(false);
      }
    } else {
      // Use web-based ZXing scanner for browsers
      try {
        console.log("Using web-based ZXing scanner...");

        // Detect if mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isMobile ? { facingMode: "environment" } : true
        });

        console.log("Camera stream obtained:", stream.getVideoTracks());
        streamRef.current = stream;

        if (!videoRef.current) {
          throw new Error("Video element not found");
        }

        console.log("Setting video srcObject...");
        const video = videoRef.current;
        video.srcObject = stream;

        // Wait for video to be ready before showing UI
        const handleLoadedMetadata = async () => {
          try {
            await video.play();
            console.log("Video playing!");
            setIsCameraActive(true);
            setIsScanning(false);
            console.log("Camera UI now active");

            // Start barcode detection after video is playing
            setTimeout(() => {
              if (codeReaderRef.current && videoRef.current) {
                console.log("Starting barcode detection...");
                codeReaderRef.current.decodeFromVideoDevice(
                  null,
                  videoRef.current,
                  (result, err) => {
                    if (result && !isProcessingRef.current) {
                      const text = result.getText();
                      console.log("Barcode detected:", text);
                      const cleanedText = text.replace(/[-\s]/g, "");
                      if (/^\d{10}(\d{3})?$/.test(cleanedText)) {
                        console.log("Valid ISBN found:", cleanedText);

                        // IMMEDIATELY set processing flag and stop camera
                        isProcessingRef.current = true;

                        // Stop camera immediately to prevent re-scanning
                        if (codeReaderRef.current) {
                          try {
                            codeReaderRef.current.reset();
                          } catch (e) {
                            // Ignore
                          }
                        }

                        stopCamera();

                        // Then notify parent with small delay to ensure camera is stopped
                        setTimeout(() => {
                          onIsbnScan(cleanedText);
                        }, 100);
                      }
                    }
                    if (err && !(err instanceof NotFoundException)) {
                      console.error("Barcode scan error:", err);
                    }
                  }
                );
              }
            }, 500);
          } catch (playErr) {
            console.error("Video play failed:", playErr);
            setError("Failed to start video playback");
            setIsScanning(false);
            stopCamera();
          }
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      } catch (err: any) {
        console.error("Camera error:", err);
        setError(err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : `Failed to access camera: ${err.message}`
        );
        setIsScanning(false);
        setIsCameraActive(false);
      }
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageData = canvas.toDataURL("image/jpeg");
      onCoverScan(imageData);
      stopCamera();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIsbn.trim()) {
      // Clean ISBN: remove spaces, hyphens, and other non-digits
      const cleanedIsbn = manualIsbn.replace(/[-\s]/g, "");

      // Validate it's 10 or 13 digits
      if (/^\d{10}$/.test(cleanedIsbn) || /^\d{13}$/.test(cleanedIsbn)) {
        onIsbnScan(cleanedIsbn);
        setManualIsbn("");
        setError(null);
      } else {
        setError("Please enter a valid 10 or 13 digit ISBN");
      }
    }
  };

  const handleCameraCapture = () => {
    if (scanMode === "isbn") {
      startBarcodeScanning();
    } else {
      startPhotoCapture();
    }
  };

  const startPhotoCapture = async () => {
    setError(null);
    setIsScanning(true);

    try {
      // Detect if mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: isMobile ? { facingMode: "environment" } : true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        // Wait for video to be ready before setting active
        const handleLoadedMetadata = async () => {
          try {
            await video.play();
            setIsCameraActive(true);
            setIsScanning(false);
          } catch (err) {
            console.error("Video play error:", err);
            setError("Failed to start video playback");
            setIsScanning(false);
          }
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setError(err.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access."
        : "Failed to access camera. Please check your device settings."
      );
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video element - always rendered but hidden unless camera active */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={isCameraActive ? "fixed inset-0 z-50 w-full h-full object-cover" : "hidden"}
      />

      {/* Full-screen camera overlay UI */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Scanner overlay for ISBN mode */}
          {scanMode === "isbn" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Scanning frame */}
              <div className="w-[85%] max-w-md aspect-[3/4] border-4 border-primary rounded-2xl relative">
                <div className="absolute -top-1 -left-1 w-12 h-12 border-t-[6px] border-l-[6px] border-primary rounded-tl-2xl"></div>
                <div className="absolute -top-1 -right-1 w-12 h-12 border-t-[6px] border-r-[6px] border-primary rounded-tr-2xl"></div>
                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-[6px] border-l-[6px] border-primary rounded-bl-2xl"></div>
                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-[6px] border-r-[6px] border-primary rounded-br-2xl"></div>
              </div>
            </div>
          )}

          {/* Top controls */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-medium">
                  {scanMode === "isbn" ? "Scanning Barcode" : "Capture Photo"}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 pointer-events-auto"
                onClick={stopCamera}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
            <div className="text-center space-y-4">
              <p className="text-white text-sm">
                {scanMode === "isbn"
                  ? "Position barcode within the frame"
                  : "Frame the book cover or spine"}
              </p>

              {/* Capture button for cover mode */}
              {scanMode === "cover" && (
                <Button
                  size="lg"
                  className="pointer-events-auto w-20 h-20 rounded-full bg-white hover:bg-gray-200 shadow-xl"
                  onClick={capturePhoto}
                  data-testid="button-capture-photo"
                >
                  <Camera className="h-8 w-8 text-black" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Tabs value={scanMode} onValueChange={(v) => {
        setScanMode(v as "isbn" | "cover");
        if (isCameraActive) stopCamera();
      }}>
        <TabsList className="grid w-full grid-cols-2" data-testid="tabs-scan-mode">
          <TabsTrigger value="isbn" data-testid="tab-isbn-scan" disabled={isCameraActive}>
            <Hash className="h-4 w-4 mr-2" />
            ISBN Scan
          </TabsTrigger>
          <TabsTrigger value="cover" data-testid="tab-cover-scan" disabled={isCameraActive}>
            <Image className="h-4 w-4 mr-2" />
            Cover/Spine AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="isbn" className="space-y-4">
          <Card className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
            {!isCameraActive && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[90%] h-3/4 border-2 border-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  </div>
                </div>
                <div className="text-center z-10">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Position barcode in frame
                  </p>
                </div>
              </>
            )}
          </Card>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!isCameraActive && (
            <>
              <Button
                size="lg"
                className="w-full"
                onClick={handleCameraCapture}
                disabled={isScanning}
                data-testid="button-scan-barcode"
              >
                <Camera className="h-5 w-5 mr-2" />
                {isScanning ? "Starting Camera..." : "Scan Barcode"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter manually
                  </span>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter ISBN (e.g., 978-0-123-45678-9)"
                  value={manualIsbn}
                  onChange={(e) => setManualIsbn(e.target.value)}
                  data-testid="input-manual-isbn"
                />
                <Button type="submit" data-testid="button-submit-isbn">
                  Submit
                </Button>
              </form>
            </>
          )}
        </TabsContent>

        <TabsContent value="cover" className="space-y-4">
          <Card className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
            {!isCameraActive && (
              <div className="text-center p-4">
                <Image className="h-12 w-12 mb-3 mx-auto text-muted-foreground" />
                <p className="font-semibold mb-1">AI Cover & Spine Recognition</p>
                <p className="text-sm text-muted-foreground">
                  Capture book cover OR spine photo
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Our AI reads vertical spine text - no barcode needed!
                </p>
              </div>
            )}
          </Card>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!isCameraActive && (
            <Button
              size="lg"
              className="w-full"
              onClick={handleCameraCapture}
              disabled={isScanning}
              data-testid="button-scan-cover"
            >
              <Camera className="h-5 w-5 mr-2" />
              {isScanning ? "Starting Camera..." : "Take Photo"}
            </Button>
          )}

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p className="font-medium">Revolutionary AI Recognition</p>
            <p>Works with cover photos AND spine photos (even vertical text!)</p>
            <p className="text-[10px]">No competitor can do this</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
