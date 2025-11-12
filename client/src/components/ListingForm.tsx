import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ListingFormProps {
  bookId: string;
  bookTitle: string;
  isbn: string;
  author?: string;
  suggestedPrice: number;
  onSubmit?: (data: ListingFormData) => void;
  onSuccess?: () => void;
}

export interface ListingFormData {
  platform: "amazon" | "ebay";
  price: number;
  condition: string;
  description: string;
  quantity: number;
  fulfillmentChannel?: "MFN" | "AFN";
}

export function ListingForm({
  bookId,
  bookTitle,
  isbn,
  author,
  suggestedPrice,
  onSubmit,
  onSuccess,
}: ListingFormProps) {
  const { toast } = useToast();
  const [platform, setPlatform] = useState<"amazon" | "ebay">("amazon");
  const [price, setPrice] = useState(suggestedPrice.toString());
  const [condition, setCondition] = useState("good");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [fulfillmentChannel, setFulfillmentChannel] = useState<"MFN" | "AFN">("AFN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [optimizedTitle, setOptimizedTitle] = useState("");

  const handleOptimizeWithAI = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/ai/optimize-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bookTitle,
          author,
          isbn,
          condition,
          platform,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to optimize listing");
      }

      setKeywords(data.keywords || []);
      setOptimizedTitle(data.optimizedTitle || bookTitle);
      setDescription(data.optimizedDescription || description);

      toast({
        title: "AI Optimization Complete!",
        description: "Your listing has been optimized with keywords and description.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to optimize with AI. Make sure OPENAI_API_KEY is set.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateDescription = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bookTitle,
          author,
          condition,
          additionalNotes: description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate description");
      }

      setDescription(data.description);

      toast({
        title: "Description Generated!",
        description: "AI has created a compelling description for your listing.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate description.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const listingData: ListingFormData = {
      platform,
      price: parseFloat(price),
      condition,
      description,
      quantity: parseInt(quantity),
      fulfillmentChannel: platform === "amazon" ? fulfillmentChannel : undefined,
    };

    // Call the optional onSubmit callback if provided
    if (onSubmit) {
      onSubmit(listingData);
      return;
    }

    // Otherwise, handle submission via API
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          isbn,
          title: optimizedTitle || bookTitle,
          ...listingData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create listing");
      }

      toast({
        title: "Success!",
        description: data.message || `Successfully listed on ${platform}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please check your API credentials in Settings.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{optimizedTitle || bookTitle}</h3>
              {author && <p className="text-sm text-muted-foreground">by {author}</p>}
              <p className="text-sm text-muted-foreground font-mono">ISBN: {isbn}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOptimizeWithAI}
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Optimize
                </>
              )}
            </Button>
          </div>

          {keywords.length > 0 && (
            <div className="mb-4">
              <Label className="text-xs text-muted-foreground mb-2">AI Keywords</Label>
              <div className="flex flex-wrap gap-1">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tabs value={platform} onValueChange={(v) => setPlatform(v as "amazon" | "ebay")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="amazon" data-testid="tab-platform-amazon">Amazon</TabsTrigger>
            <TabsTrigger value="ebay" data-testid="tab-platform-ebay">eBay</TabsTrigger>
          </TabsList>

          <TabsContent value="amazon" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fulfillment">Fulfillment Method *</Label>
              <Select value={fulfillmentChannel} onValueChange={(v) => setFulfillmentChannel(v as "MFN" | "AFN")}>
                <SelectTrigger data-testid="select-fulfillment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AFN">FBA (Fulfilled by Amazon)</SelectItem>
                  <SelectItem value="MFN">FBM (Fulfilled by Merchant)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                FBA items are shipped to Amazon's warehouse for fulfillment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  £
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-7"
                  data-testid="input-price"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Suggested: £{suggestedPrice.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger data-testid="select-condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="as-new">As New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="collectable">Collectable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                data-testid="input-quantity"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isOptimizing}
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Generate with AI
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Add any additional notes about the book's condition..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                data-testid="input-description"
              />
            </div>
          </TabsContent>

          <TabsContent value="ebay" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="price-ebay">Starting Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  £
                </span>
                <Input
                  id="price-ebay"
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-7"
                  data-testid="input-price-ebay"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition-ebay">Condition *</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger data-testid="select-condition-ebay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="as-new">As New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="collectable">Collectable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description-ebay">Item Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isOptimizing}
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Generate with AI
                </Button>
              </div>
              <Textarea
                id="description-ebay"
                placeholder="Describe the book's condition, shipping details, etc..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                data-testid="input-description-ebay"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Button type="submit" className="w-full" data-testid="button-create-listing" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Listing...
            </>
          ) : (
            `Create Listing on ${platform === "amazon" ? "Amazon" : "eBay"}`
          )}
        </Button>
      </form>
    </Card>
  );
}
