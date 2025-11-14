import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, TrendingDown, Clock, DollarSign, Edit, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface RepricingRule {
  id: string;
  listingId: string | null;
  platform: string;
  strategy: string;
  strategyValue: string | null;
  minPrice: string;
  maxPrice: string;
  isActive: string;
  runFrequency: string;
  lastRun: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RepricingHistory {
  id: string;
  listingId: string;
  ruleId: string | null;
  oldPrice: string;
  newPrice: string;
  competitorPrice: string | null;
  reason: string;
  success: string;
  errorMessage: string | null;
  createdAt: string;
}

interface Listing {
  id: string;
  platform: string;
  price: string;
  status: string;
}

export default function RepricingPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<RepricingRule[]>([]);
  const [history, setHistory] = useState<RepricingHistory[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRule, setShowNewRule] = useState(false);
  const [editingRule, setEditingRule] = useState<RepricingRule | null>(null);
  const [isRepricingNow, setIsRepricingNow] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    listingId: "",
    platform: "all",
    strategy: "match_lowest",
    strategyValue: "",
    minPrice: "",
    maxPrice: "",
    isActive: true,
    runFrequency: "hourly",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, historyRes, listingsRes] = await Promise.all([
        fetch("/api/repricing/rules"),
        fetch("/api/repricing/history"),
        fetch("/api/listings"),
      ]);

      if (rulesRes.ok) {
        const rulesData = await rulesRes.json();
        setRules(rulesData);
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.slice(0, 20));
      }

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData.filter((l: Listing) => l.status === "active"));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.minPrice || !formData.maxPrice) {
      toast({
        title: "Validation Error",
        description: "Min and max prices are required",
        variant: "destructive",
      });
      return;
    }

    const minPrice = parseFloat(formData.minPrice);
    const maxPrice = parseFloat(formData.maxPrice);

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      toast({
        title: "Validation Error",
        description: "Min and max prices must be valid numbers",
        variant: "destructive",
      });
      return;
    }

    if (minPrice >= maxPrice) {
      toast({
        title: "Validation Error",
        description: "Min price must be less than max price",
        variant: "destructive",
      });
      return;
    }

    const requiresStrategyValue = 
      formData.strategy === "beat_by_percent" ||
      formData.strategy === "beat_by_amount";

    if (requiresStrategyValue && !formData.strategyValue) {
      toast({
        title: "Validation Error",
        description: "Strategy value is required for this pricing strategy",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        listingId: formData.listingId || null,
        strategyValue: formData.strategyValue || null,
        minPrice,
        maxPrice,
        isActive: formData.isActive,
      };

      const url = editingRule
        ? `/api/repricing/rules/${editingRule.id}`
        : "/api/repricing/rules";

      const method = editingRule ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: editingRule ? "Rule Updated" : "Rule Created",
        description: editingRule
          ? "Repricing rule has been updated successfully"
          : "New repricing rule has been created",
      });

      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save repricing rule",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rule: RepricingRule) => {
    setEditingRule(rule);
    setFormData({
      listingId: rule.listingId || "",
      platform: rule.platform,
      strategy: rule.strategy,
      strategyValue: rule.strategyValue || "",
      minPrice: rule.minPrice,
      maxPrice: rule.maxPrice,
      isActive: rule.isActive === "true",
      runFrequency: rule.runFrequency,
    });
    setShowNewRule(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this repricing rule?")) {
      return;
    }

    try {
      const response = await fetch(`/api/repricing/rules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete rule");
      }

      toast({
        title: "Rule Deleted",
        description: "Repricing rule has been removed",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete rule",
        variant: "destructive",
      });
    }
  };

  const handleManualReprice = async (listingId: string) => {
    setIsRepricingNow(listingId);

    try {
      const response = await fetch("/api/repricing/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();

      toast({
        title: result.success ? "Repricing Complete" : "Repricing Failed",
        description: result.reason,
        variant: result.success ? "default" : "destructive",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reprice listing",
        variant: "destructive",
      });
    } finally {
      setIsRepricingNow(null);
    }
  };

  const resetForm = () => {
    setFormData({
      listingId: "",
      platform: "all",
      strategy: "match_lowest",
      strategyValue: "",
      minPrice: "",
      maxPrice: "",
      isActive: true,
      runFrequency: "hourly",
    });
    setEditingRule(null);
    setShowNewRule(false);
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case "match_lowest":
        return "Match Lowest";
      case "beat_by_percent":
        return "Beat by %";
      case "beat_by_amount":
        return "Beat by Amount";
      case "target_margin":
        return "Target Margin";
      default:
        return strategy;
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
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Repricing Rules</h1>
            <p className="text-sm text-muted-foreground">
              Auto-adjust your listing prices to stay competitive
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowNewRule(!showNewRule);
            }}
            data-testid="button-new-rule"
          >
            {showNewRule ? "Cancel" : "New Rule"}
          </Button>
        </div>

        {showNewRule && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingRule ? "Edit Rule" : "Create New Rule"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="listing">Apply to Listing (Optional)</Label>
                  <Select
                    value={formData.listingId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, listingId: value })
                    }
                  >
                    <SelectTrigger id="listing" data-testid="select-listing">
                      <SelectValue placeholder="All listings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All listings</SelectItem>
                      {listings.map((listing) => (
                        <SelectItem key={listing.id} value={listing.id}>
                          {listing.platform.toUpperCase()} - £{listing.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) =>
                      setFormData({ ...formData, platform: value })
                    }
                  >
                    <SelectTrigger id="platform" data-testid="select-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="ebay">eBay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select
                    value={formData.strategy}
                    onValueChange={(value) =>
                      setFormData({ ...formData, strategy: value })
                    }
                  >
                    <SelectTrigger id="strategy" data-testid="select-strategy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match_lowest">Match Lowest Price</SelectItem>
                      <SelectItem value="beat_by_percent">Beat by Percentage</SelectItem>
                      <SelectItem value="beat_by_amount">Beat by Amount</SelectItem>
                      <SelectItem value="target_margin">Target Margin %</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.strategy === "beat_by_percent" ||
                  formData.strategy === "beat_by_amount" ||
                  formData.strategy === "target_margin") && (
                  <div className="space-y-2">
                    <Label htmlFor="strategyValue">
                      {formData.strategy === "beat_by_amount"
                        ? "Amount (£)"
                        : "Percentage (%)"}
                    </Label>
                    <Input
                      id="strategyValue"
                      type="number"
                      step="0.01"
                      value={formData.strategyValue}
                      onChange={(e) =>
                        setFormData({ ...formData, strategyValue: e.target.value })
                      }
                      data-testid="input-strategy-value"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="minPrice">Min Price (£)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    step="0.01"
                    required
                    value={formData.minPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, minPrice: e.target.value })
                    }
                    data-testid="input-min-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPrice">Max Price (£)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    step="0.01"
                    required
                    value={formData.maxPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, maxPrice: e.target.value })
                    }
                    data-testid="input-max-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="runFrequency">Run Frequency</Label>
                  <Select
                    value={formData.runFrequency}
                    onValueChange={(value) =>
                      setFormData({ ...formData, runFrequency: value })
                    }
                  >
                    <SelectTrigger id="runFrequency" data-testid="select-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                    data-testid="switch-active"
                  />
                  <Label htmlFor="isActive">Rule is Active</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" data-testid="button-save-rule">
                  {editingRule ? "Update Rule" : "Create Rule"}
                </Button>
                {editingRule && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">Active Rules</h2>
          {rules.length === 0 ? (
            <Card className="p-8 text-center">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No Repricing Rules</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first rule to start auto-adjusting prices
              </p>
              <Button onClick={() => setShowNewRule(true)} data-testid="button-create-first-rule">
                Create Rule
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card key={rule.id} className="p-4 hover-elevate" data-testid={`card-rule-${rule.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {getStrategyLabel(rule.strategy)}
                        </h3>
                        <Badge variant={rule.isActive === "true" ? "default" : "outline"}>
                          {rule.isActive === "true" ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="secondary">{rule.platform.toUpperCase()}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Range:</span> £{rule.minPrice} - £
                          {rule.maxPrice}
                        </div>
                        <div>
                          <span className="font-medium">Frequency:</span>{" "}
                          {rule.runFrequency}
                        </div>
                        {rule.lastRun && (
                          <div className="col-span-2">
                            <span className="font-medium">Last run:</span>{" "}
                            {formatDistanceToNow(new Date(rule.lastRun), {
                              addSuffix: true,
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(rule)}
                        data-testid={`button-edit-${rule.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                        data-testid={`button-delete-${rule.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Manual Repricing</h2>
          {listings.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No active listings available for manual repricing
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {listings.slice(0, 5).map((listing) => (
                <Card key={listing.id} className="p-4 hover-elevate" data-testid={`card-listing-${listing.id}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">
                          {listing.platform.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">£{listing.price}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Listing #{listing.id.slice(0, 8)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManualReprice(listing.id)}
                      disabled={isRepricingNow === listing.id}
                      data-testid={`button-reprice-${listing.id}`}
                    >
                      {isRepricingNow === listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Reprice Now
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Recent History</h2>
          {history.length === 0 ? (
            <Card className="p-6 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No repricing history yet
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Card key={item.id} className="p-4" data-testid={`history-${item.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={item.success === "true" ? "default" : "destructive"}>
                          {item.success === "true" ? "Success" : "Failed"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <span className="text-muted-foreground">£{item.oldPrice}</span>
                        <span>→</span>
                        <span className="font-semibold text-primary">
                          £{item.newPrice}
                        </span>
                        {item.competitorPrice && (
                          <span className="text-xs text-muted-foreground">
                            (competitor: £{item.competitorPrice})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                      {item.errorMessage && (
                        <p className="text-xs text-destructive mt-1">
                          Error: {item.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
