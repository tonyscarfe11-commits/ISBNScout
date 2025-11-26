import { useState, useEffect } from "react";
import { ListingForm } from "@/components/ListingForm";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  bookId: string;
  platform: "amazon" | "ebay";
  price: string;
  condition: string;
  status: string;
  platformListingId?: string | null;
  errorMessage?: string | null;
  listedAt: string;
}

export default function ListingsPage() {
  const { toast } = useToast();
  const [showNewListing, setShowNewListing] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const response = await fetch("/api/listings", { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      }
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleListingSuccess = () => {
    setShowNewListing(false);
    fetchListings();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "sold":
        return <Badge variant="secondary">Sold</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Listings</h1>
            <p className="text-sm text-muted-foreground">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}
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
            bookId="demo-book-id"
            bookTitle="Harry Potter and the Deathly Hallows"
            author="J.K. Rowling"
            isbn="9780545010221"
            suggestedPrice={24.99}
            onSuccess={handleListingSuccess}
          />
        )}

        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="p-4 hover-elevate" data-testid={`card-listing-${listing.id}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">Listing #{listing.id.slice(0, 8)}</h3>
                    {getStatusBadge(listing.status)}
                  </div>
                  {listing.platformListingId && (
                    <p className="text-xs font-mono text-muted-foreground mb-3">
                      Platform ID: {listing.platformListingId}
                    </p>
                  )}
                  {listing.errorMessage && (
                    <p className="text-xs text-destructive mb-3">
                      Error: {listing.errorMessage}
                    </p>
                  )}
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
                        £{parseFloat(listing.price).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase">Condition</div>
                      <div className="text-sm font-medium capitalize">
                        {listing.condition.replace("-", " ")}
                      </div>
                    </div>
                  </div>
                </div>
                {listing.platformListingId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid={`button-view-listing-${listing.id}`}
                    title="View on platform"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {listings.length === 0 && !showNewListing && (
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
