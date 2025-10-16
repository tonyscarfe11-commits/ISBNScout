import { useState } from "react";
import { ListingForm, type ListingFormData } from "@/components/ListingForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MockListing {
  id: string;
  bookTitle: string;
  isbn: string;
  platform: "amazon" | "ebay";
  price: number;
  status: "active" | "sold" | "draft";
}

export default function ListingsPage() {
  const { toast } = useToast();
  const [showNewListing, setShowNewListing] = useState(false);

  // todo: remove mock functionality
  const mockListings: MockListing[] = [
    {
      id: "1",
      bookTitle: "Harry Potter and the Deathly Hallows",
      isbn: "9780545010221",
      platform: "amazon",
      price: 24.99,
      status: "active",
    },
    {
      id: "2",
      bookTitle: "The Catcher in the Rye",
      isbn: "9780316769488",
      platform: "ebay",
      price: 12.00,
      status: "sold",
    },
  ];

  const handleCreateListing = (data: ListingFormData) => {
    console.log("Creating listing:", data);
    toast({
      title: "Listing created!",
      description: `Your book has been listed on ${data.platform}`,
    });
    setShowNewListing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "sold":
        return <Badge variant="secondary">Sold</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Listings</h1>
            <p className="text-sm text-muted-foreground">
              {mockListings.length} active listing{mockListings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={() => setShowNewListing(!showNewListing)}
            data-testid="button-new-listing"
          >
            {showNewListing ? "Cancel" : "New Listing"}
          </Button>
        </div>

        {showNewListing && (
          <ListingForm
            bookTitle="Harry Potter and the Deathly Hallows"
            isbn="9780545010221"
            suggestedPrice={24.99}
            onSubmit={handleCreateListing}
          />
        )}

        <div className="space-y-4">
          {mockListings.map((listing) => (
            <Card key={listing.id} className="p-4 hover-elevate" data-testid={`card-listing-${listing.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{listing.bookTitle}</h3>
                    {getStatusBadge(listing.status)}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mb-3">
                    ISBN: {listing.isbn}
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase">Platform</div>
                      <div className="text-sm font-medium capitalize">
                        {listing.platform}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase">Price</div>
                      <div className="text-sm font-semibold font-mono">
                        ${listing.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid={`button-view-listing-${listing.id}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {mockListings.length === 0 && !showNewListing && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No listings yet</p>
              <Button onClick={() => setShowNewListing(true)}>
                Create Your First Listing
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
