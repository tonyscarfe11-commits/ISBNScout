import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, Sparkles } from "lucide-react";

export interface RecognizedBookData {
  title?: string;
  author?: string;
  isbn?: string;
  condition?: string;
  description?: string;
  keywords: string[];
}

export interface BookPhotoRecognitionProps {
  onRecognized: (data: RecognizedBookData) => void;
}

export function BookPhotoRecognition({ onRecognized }: BookPhotoRecognitionProps) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a local URL for the image
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please provide an image URL or upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // If we have a local file, we need to upload it first or use a base64 string
      // For now, we'll work with URLs. In production, you'd upload to a CDN
      let urlToAnalyze = imageUrl;

      // If it's a local blob URL, convert to base64
      if (imageUrl.startsWith('blob:')) {
        if (selectedFile) {
          const base64 = await fileToBase64(selectedFile);
          urlToAnalyze = base64;
        }
      }

      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: urlToAnalyze }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze image");
      }

      toast({
        title: "Book Recognized!",
        description: `Found: ${data.title || 'Unknown book'}`,
      });

      onRecognized(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze image. Make sure OPENAI_API_KEY is set.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Book Recognition</h3>
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-url">Image URL</Label>
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/book-image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or upload image
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-file">Upload Book Photo</Label>
          <div className="flex items-center gap-2">
            <Input
              id="image-file"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
            />
            {selectedFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setImageUrl("");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {imageUrl && (
          <div className="mt-4">
            <img
              src={imageUrl}
              alt="Book preview"
              className="max-h-48 rounded-md mx-auto"
            />
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!imageUrl || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Recognize Book with AI
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          AI will extract book title, author, ISBN, condition, and keywords from the image
        </p>
      </div>
    </Card>
  );
}
