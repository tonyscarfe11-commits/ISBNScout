import { useState } from "react";
import { Camera, Hash, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export interface ScannerInterfaceProps {
  onIsbnScan: (isbn: string) => void;
  onCoverScan: (imageData: string) => void;
}

export function ScannerInterface({ onIsbnScan, onCoverScan }: ScannerInterfaceProps) {
  const [manualIsbn, setManualIsbn] = useState("");
  const [scanMode, setScanMode] = useState<"isbn" | "cover">("isbn");

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIsbn.trim()) {
      onIsbnScan(manualIsbn.trim());
      setManualIsbn("");
    }
  };

  const handleCameraCapture = () => {
    if (scanMode === "isbn") {
      console.log("Opening camera for ISBN barcode scan");
      // todo: remove mock functionality - Simulate ISBN scan
      onIsbnScan("9780545010221");
    } else {
      console.log("Opening camera for cover photo");
      // todo: remove mock functionality - Simulate cover scan
      onCoverScan("mock-image-data");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={scanMode} onValueChange={(v) => setScanMode(v as "isbn" | "cover")}>
        <TabsList className="grid w-full grid-cols-2" data-testid="tabs-scan-mode">
          <TabsTrigger value="isbn" data-testid="tab-isbn-scan">
            <Hash className="h-4 w-4 mr-2" />
            ISBN Scan
          </TabsTrigger>
          <TabsTrigger value="cover" data-testid="tab-cover-scan">
            <Image className="h-4 w-4 mr-2" />
            Cover Photo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="isbn" className="space-y-4">
          <Card className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-1/2 border-2 border-primary rounded-lg relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              </div>
            </div>
            <div className="text-center z-10">
              <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Position barcode in frame
              </p>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleCameraCapture}
            data-testid="button-scan-barcode"
          >
            <Camera className="h-5 w-5 mr-2" />
            Scan Barcode
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
        </TabsContent>

        <TabsContent value="cover" className="space-y-4">
          <Card className="aspect-video bg-muted flex items-center justify-center">
            <div className="text-center">
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Capture book cover or spine
              </p>
            </div>
          </Card>

          <Button
            size="lg"
            className="w-full"
            onClick={handleCameraCapture}
            data-testid="button-scan-cover"
          >
            <Camera className="h-5 w-5 mr-2" />
            Take Photo
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            AI will identify the book from the cover image
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
