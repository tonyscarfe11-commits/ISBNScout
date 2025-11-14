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

        // Immediately show camera UI
        setIsCameraActive(true);
        setIsScanning(false);
        console.log("Camera UI now active");

        // Try to play the video
        try {
          await video.play();
          console.log("Video playing!");
        } catch (playErr) {
          console.log("Initial play failed, will retry:", playErr);
        }

        // Start scanning after a brief delay
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
        }, 1000);
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
      onIsbnScan(manualIsbn.trim());
      setManualIsbn("");
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
        videoRef.current.srcObject = stream;

        // Wait for video to be ready before setting active
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            setIsCameraActive(true);
          } catch (err) {
            console.error("Video play error:", err);
            setError("Failed to start video playback");
            setIsScanning(false);
          }
        };
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
            Cover Photo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="isbn" className="space-y-4">
          <Card className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
            {/* Always render video element, but hide when not active */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
            />

            {isCameraActive ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[90%] h-3/4 border-2 border-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={stopCamera}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-sm text-white bg-black/50 px-4 py-2 rounded-full inline-block">
                    Scanning for barcode...
                  </p>
                </div>
              </>
            ) : (
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
                  placeholder="Enter ISBN (10 or 13 digits)"
                  value={manualIsbn}
                  onChange={(e) => setManualIsbn(e.target.value)}
                  pattern="[0-9]{10,13}"
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
            {/* Always render video element, but hide when not active */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
            />

            {isCameraActive ? (
              <>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={stopCamera}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="text-center">
                <Image className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Capture book cover or spine
                </p>
              </div>
            )}
          </Card>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {isCameraActive ? (
            <Button
              size="lg"
              className="w-full"
              onClick={capturePhoto}
              data-testid="button-capture-photo"
            >
              <Camera className="h-5 w-5 mr-2" />
              Capture Photo
            </Button>
          ) : (
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

          <p className="text-xs text-muted-foreground text-center">
            AI will identify the book from the cover image
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
