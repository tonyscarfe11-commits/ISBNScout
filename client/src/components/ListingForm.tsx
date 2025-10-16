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

export interface ListingFormProps {
  bookTitle: string;
  isbn: string;
  suggestedPrice: number;
  onSubmit: (data: ListingFormData) => void;
}

export interface ListingFormData {
  platform: "amazon" | "ebay";
  price: number;
  condition: string;
  description: string;
  quantity: number;
}

export function ListingForm({
  bookTitle,
  isbn,
  suggestedPrice,
  onSubmit,
}: ListingFormProps) {
  const [platform, setPlatform] = useState<"amazon" | "ebay">("amazon");
  const [price, setPrice] = useState(suggestedPrice.toString());
  const [condition, setCondition] = useState("good");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      platform,
      price: parseFloat(price),
      condition,
      description,
      quantity: parseInt(quantity),
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">{bookTitle}</h3>
          <p className="text-sm text-muted-foreground font-mono">ISBN: {isbn}</p>
        </div>

        <Tabs value={platform} onValueChange={(v) => setPlatform(v as "amazon" | "ebay")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="amazon" data-testid="tab-platform-amazon">Amazon</TabsTrigger>
            <TabsTrigger value="ebay" data-testid="tab-platform-ebay">eBay</TabsTrigger>
          </TabsList>

          <TabsContent value="amazon" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
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
                Suggested: ${suggestedPrice.toFixed(2)}
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
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="very-good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
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
              <Label htmlFor="description">Description</Label>
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
                  $
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
                  <SelectItem value="new">Brand New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="very-good">Very Good</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description-ebay">Item Description</Label>
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

        <Button type="submit" className="w-full" data-testid="button-create-listing">
          Create Listing on {platform === "amazon" ? "Amazon" : "eBay"}
        </Button>
      </form>
    </Card>
  );
}
