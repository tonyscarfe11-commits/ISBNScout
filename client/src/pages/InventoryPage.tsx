import { useState, useEffect } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AddPurchaseModal } from "@/components/AddPurchaseModal";
import { RecordSaleModal } from "@/components/RecordSaleModal";
import { EditInventoryModal } from "@/components/EditInventoryModal";
import { LabelGeneratorModal } from "@/components/LabelGeneratorModal";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  DollarSign,
  CheckSquare,
  Download,
  BarChart3,
  AlertTriangle,
  Clock,
  Tag,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string | null;
  thumbnail: string | null;
}

interface InventoryItem {
  id: string;
  userId: string;
  bookId: string;
  listingId: string | null;
  sku: string | null;
  purchaseDate: string;
  purchaseCost: string;
  purchaseSource: string | null;
  condition: string;
  location: string | null;
  soldDate: string | null;
  salePrice: string | null;
  soldPlatform: string | null;
  actualProfit: string | null;
  status: 'in_stock' | 'listed' | 'sold' | 'returned' | 'donated' | 'damaged';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  book?: Book;
}

const statusColors = {
  in_stock: "bg-blue-500",
  listed: "bg-yellow-500",
  sold: "bg-green-500",
  returned: "bg-orange-500",
  donated: "bg-purple-500",
  damaged: "bg-red-500",
};

const statusLabels = {
  in_stock: "In Stock",
  listed: "Listed",
  sold: "Sold",
  returned: "Returned",
  donated: "Donated",
  damaged: "Damaged",
};

export default function InventoryPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [books, setBooks] = useState<Record<string, Book>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [addPurchaseOpen, setAddPurchaseOpen] = useState(false);
  const [recordSaleOpen, setRecordSaleOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [labelGeneratorOpen, setLabelGeneratorOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [labelItemIds, setLabelItemIds] = useState<string[]>([]);

  // Bulk selection states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      // Load inventory items
      const inventoryResponse = await fetch("/api/inventory");
      if (!inventoryResponse.ok) {
        throw new Error("Failed to load inventory");
      }
      const inventoryData = await inventoryResponse.json();

      // Load books
      const booksResponse = await fetch("/api/books");
      if (!booksResponse.ok) {
        throw new Error("Failed to load books");
      }
      const booksData = await booksResponse.json();

      // Create books lookup map
      const booksMap: Record<string, Book> = {};
      booksData.forEach((book: any) => {
        booksMap[book.id] = {
          id: book.id,
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          thumbnail: book.thumbnail,
        };
      });

      setBooks(booksMap);
      setItems(inventoryData);
    } catch (error: any) {
      console.error("Failed to load inventory:", error);
      toast({
        title: "Failed to load inventory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const inStock = items.filter(item => item.status === 'in_stock').length;
    const listed = items.filter(item => item.status === 'listed').length;
    const sold = items.filter(item => item.status === 'sold').length;

    const totalInvested = items
      .filter(item => item.status !== 'sold')
      .reduce((sum, item) => sum + parseFloat(item.purchaseCost), 0);

    const totalRevenue = items
      .filter(item => item.status === 'sold' && item.salePrice)
      .reduce((sum, item) => sum + parseFloat(item.salePrice!), 0);

    const totalProfit = items
      .filter(item => item.status === 'sold' && item.actualProfit)
      .reduce((sum, item) => sum + parseFloat(item.actualProfit!), 0);

    return { inStock, listed, sold, totalInvested, totalRevenue, totalProfit };
  };

  const filteredItems = items.filter((item) => {
    const book = books[item.bookId];
    if (!book) return false;

    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      book.isbn.includes(searchQuery) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      toast({
        title: "Item deleted",
        description: "Inventory item has been removed",
      });

      loadInventory();
    } catch (error: any) {
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Bulk selection handlers
  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const selectAllFiltered = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemIds = Array.from(selectedItems);

      switch (action) {
        case "mark_listed":
          await bulkUpdateStatus(itemIds, "listed");
          break;
        case "mark_in_stock":
          await bulkUpdateStatus(itemIds, "in_stock");
          break;
        case "mark_donated":
          await bulkUpdateStatus(itemIds, "donated");
          break;
        case "mark_damaged":
          await bulkUpdateStatus(itemIds, "damaged");
          break;
        case "delete":
          if (!confirm(`Are you sure you want to delete ${itemIds.length} items?`)) {
            return;
          }
          await bulkDelete(itemIds);
          break;
        case "export":
          exportSelectedItems(itemIds);
          break;
      }

      setSelectedItems(new Set());
      setIsBulkMode(false);
    } catch (error: any) {
      toast({
        title: "Bulk action failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const bulkUpdateStatus = async (ids: string[], status: string) => {
    const promises = ids.map(id =>
      fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    );

    await Promise.all(promises);

    toast({
      title: "Status updated",
      description: `${ids.length} items marked as ${status.replace(/_/g, " ")}`,
    });

    loadInventory();
  };

  const bulkDelete = async (ids: string[]) => {
    const promises = ids.map(id =>
      fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      })
    );

    await Promise.all(promises);

    toast({
      title: "Items deleted",
      description: `${ids.length} inventory items removed`,
    });

    loadInventory();
  };

  const exportSelectedItems = (ids: string[]) => {
    const itemsToExport = items.filter(item => ids.includes(item.id));
    const csv = generateCSV(itemsToExport);
    downloadCSV(csv, `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);

    toast({
      title: "Export complete",
      description: `Exported ${ids.length} items`,
    });
  };

  const generateCSV = (data: InventoryItem[]) => {
    const headers = [
      "ISBN",
      "Title",
      "Author",
      "SKU",
      "Condition",
      "Purchase Date",
      "Purchase Cost",
      "Purchase Source",
      "Location",
      "Status",
      "Sale Price",
      "Sold Date",
      "Sold Platform",
      "Actual Profit",
      "Notes",
    ];

    const rows = data.map(item => {
      const book = books[item.bookId];
      return [
        book?.isbn || "",
        book?.title || "",
        book?.author || "",
        item.sku || "",
        item.condition,
        new Date(item.purchaseDate).toLocaleDateString(),
        item.purchaseCost,
        item.purchaseSource || "",
        item.location || "",
        item.status,
        item.salePrice || "",
        item.soldDate ? new Date(item.soldDate).toLocaleDateString() : "",
        item.soldPlatform || "",
        item.actualProfit || "",
        item.notes || "",
      ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getAgingItems = () => {
    const now = new Date();
    const aging30: Array<InventoryItem & { daysOld: number }> = [];
    const aging60: Array<InventoryItem & { daysOld: number }> = [];
    const aging90: Array<InventoryItem & { daysOld: number }> = [];

    items
      .filter((item) => item.status === "in_stock" || item.status === "listed")
      .forEach((item) => {
        const purchaseDate = new Date(item.purchaseDate);
        const daysOld = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOld >= 90) {
          aging90.push({ ...item, daysOld });
        } else if (daysOld >= 60) {
          aging60.push({ ...item, daysOld });
        } else if (daysOld >= 30) {
          aging30.push({ ...item, daysOld });
        }
      });

    return { aging30, aging60, aging90 };
  };

  const stats = calculateStats();
  const agingItems = getAgingItems();
  const hasAgingItems =
    agingItems.aging30.length > 0 ||
    agingItems.aging60.length > 0 ||
    agingItems.aging90.length > 0;

  return (
    <>
      <AppHeader />
      <div className="min-h-screen bg-background pb-20 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">
              Track your books from purchase to sale
            </p>
          </div>
          <div className="flex gap-2">
            {!isBulkMode ? (
              <>
                <Link href="/app/reports">
                  <Button variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Reports
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setIsBulkMode(true)}
                >
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Bulk Actions
                </Button>
                <Button onClick={() => setAddPurchaseOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Purchase
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBulkMode(false);
                    setSelectedItems(new Set());
                  }}
                >
                  Cancel
                </Button>
                {selectedItems.size > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        Actions ({selectedItems.size})
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkAction("mark_in_stock")}>
                        Mark as In Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("mark_listed")}>
                        Mark as Listed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("mark_donated")}>
                        Mark as Donated
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("mark_damaged")}>
                        Mark as Damaged
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction("delete")}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>

        {/* Aging Inventory Alerts */}
        {hasAgingItems && (
          <Alert variant={agingItems.aging90.length > 0 ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="font-semibold">
              Aging Inventory Detected
            </AlertTitle>
            <AlertDescription>
              <div className="space-y-1 mt-2">
                {agingItems.aging90.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-600">
                      {agingItems.aging90.length} items over 90 days old
                    </span>
                    <span className="text-sm text-muted-foreground">
                      - Consider reducing prices or donating
                    </span>
                  </div>
                )}
                {agingItems.aging60.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-600">
                      {agingItems.aging60.length} items 60-90 days old
                    </span>
                    <span className="text-sm text-muted-foreground">
                      - Review pricing and listings
                    </span>
                  </div>
                )}
                {agingItems.aging30.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-600">
                      {agingItems.aging30.length} items 30-60 days old
                    </span>
                    <span className="text-sm text-muted-foreground">
                      - Monitor performance
                    </span>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inStock}</div>
              <p className="text-xs text-muted-foreground">
                £{stats.totalInvested.toFixed(2)} invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listed</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.listed}</div>
              <p className="text-xs text-muted-foreground">
                Active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sold}</div>
              <p className="text-xs text-muted-foreground">
                £{stats.totalRevenue.toFixed(2)} revenue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                £{stats.totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {stats.sold} sales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              View and manage your book inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, author, ISBN, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="donated">Donated</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || filterStatus !== "all"
                    ? "No inventory items found matching your filters"
                    : "No inventory items yet. Start by adding a purchase!"}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isBulkMode && (
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              filteredItems.length > 0 &&
                              selectedItems.size === filteredItems.length
                            }
                            onCheckedChange={selectAllFiltered}
                          />
                        </TableHead>
                      )}
                      <TableHead>Book</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Status</TableHead>
                      {!isBulkMode && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const book = books[item.bookId];
                      const isSelected = selectedItems.has(item.id);
                      return (
                        <TableRow
                          key={item.id}
                          className={isSelected ? "bg-muted/50" : ""}
                        >
                          {isBulkMode && (
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleItemSelection(item.id)}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {book.thumbnail && (
                                <img
                                  src={book.thumbnail}
                                  alt={book.title}
                                  className="w-10 h-14 object-contain rounded"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {book.title}
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {book.author || "Unknown Author"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {item.sku || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm capitalize">
                              {item.condition.replace(/_/g, " ")}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {new Date(item.purchaseDate).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              £{parseFloat(item.purchaseCost).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.salePrice ? (
                              <span className="font-medium">
                                £{parseFloat(item.salePrice).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.actualProfit ? (
                              <span
                                className={`font-medium ${
                                  parseFloat(item.actualProfit) > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                £{parseFloat(item.actualProfit).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={`${statusColors[item.status]} text-white`}
                            >
                              {statusLabels[item.status]}
                            </Badge>
                          </TableCell>
                          {!isBulkMode && (
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {(item.status === "in_stock" ||
                                  item.status === "listed") && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedItemId(item.id);
                                      setRecordSaleOpen(true);
                                    }}
                                    title="Record Sale"
                                  >
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedItemId(item.id);
                                    setEditModalOpen(true);
                                  }}
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(item.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddPurchaseModal
        open={addPurchaseOpen}
        onOpenChange={setAddPurchaseOpen}
        onSuccess={loadInventory}
      />
      <EditInventoryModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        inventoryItemId={selectedItemId}
        onSuccess={loadInventory}
      />
      <RecordSaleModal
        open={recordSaleOpen}
        onOpenChange={setRecordSaleOpen}
        inventoryItemId={selectedItemId}
        onSuccess={loadInventory}
      />
        </div>
      </div>
    </>
  );
}
