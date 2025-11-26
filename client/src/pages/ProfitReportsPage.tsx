import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Download,
  Loader2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string | null;
}

interface InventoryItem {
  id: string;
  bookId: string;
  purchaseDate: string;
  purchaseCost: string;
  soldDate: string | null;
  salePrice: string | null;
  soldPlatform: string | null;
  actualProfit: string | null;
  status: string;
}

interface SalesData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

interface PlatformData {
  name: string;
  value: number;
  color: string;
}

interface TopBook {
  title: string;
  sales: number;
  revenue: number;
  profit: number;
}

const COLORS = {
  'amazon_fba': '#FF9900',
  'amazon_fbm': '#146EB4',
  'ebay': '#E53238',
  'other': '#64748B',
};

export default function ProfitReportsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [books, setBooks] = useState<Record<string, Book>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30"); // Days

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inventoryRes, booksRes] = await Promise.all([
        fetch("/api/inventory", { credentials: 'include' }),
        fetch("/api/books", { credentials: 'include' }),
      ]);

      if (!inventoryRes.ok || !booksRes.ok) {
        throw new Error("Failed to load data");
      }

      const [inventoryData, booksData] = await Promise.all([
        inventoryRes.json(),
        booksRes.json(),
      ]);

      const booksMap: Record<string, Book> = {};
      booksData.forEach((book: any) => {
        booksMap[book.id] = book;
      });

      setItems(inventoryData);
      setBooks(booksMap);
    } catch (error: any) {
      toast({
        title: "Failed to load data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredSoldItems = () => {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return items.filter(
      (item) =>
        item.status === "sold" &&
        item.soldDate &&
        new Date(item.soldDate) >= cutoffDate
    );
  };

  const calculateStats = () => {
    const soldItems = getFilteredSoldItems();

    const totalRevenue = soldItems.reduce(
      (sum, item) => sum + (item.salePrice ? parseFloat(item.salePrice) : 0),
      0
    );

    const totalCost = soldItems.reduce(
      (sum, item) => sum + parseFloat(item.purchaseCost),
      0
    );

    const totalProfit = soldItems.reduce(
      (sum, item) => sum + (item.actualProfit ? parseFloat(item.actualProfit) : 0),
      0
    );

    const roi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const avgProfit = soldItems.length > 0 ? totalProfit / soldItems.length : 0;

    return {
      totalSales: soldItems.length,
      totalRevenue,
      totalCost,
      totalProfit,
      roi,
      avgProfit,
    };
  };

  const getSalesOverTime = (): SalesData[] => {
    const soldItems = getFilteredSoldItems();
    const dataMap = new Map<string, { revenue: number; cost: number; profit: number }>();

    soldItems.forEach((item) => {
      if (!item.soldDate) return;

      const date = new Date(item.soldDate).toISOString().split("T")[0];
      const existing = dataMap.get(date) || { revenue: 0, cost: 0, profit: 0 };

      existing.revenue += item.salePrice ? parseFloat(item.salePrice) : 0;
      existing.cost += parseFloat(item.purchaseCost);
      existing.profit += item.actualProfit ? parseFloat(item.actualProfit) : 0;

      dataMap.set(date, existing);
    });

    return Array.from(dataMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: parseFloat(data.revenue.toFixed(2)),
        cost: parseFloat(data.cost.toFixed(2)),
        profit: parseFloat(data.profit.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getPlatformBreakdown = (): PlatformData[] => {
    const soldItems = getFilteredSoldItems();
    const platformMap = new Map<string, number>();

    soldItems.forEach((item) => {
      const platform = item.soldPlatform || "other";
      const profit = item.actualProfit ? parseFloat(item.actualProfit) : 0;
      platformMap.set(platform, (platformMap.get(platform) || 0) + profit);
    });

    return Array.from(platformMap.entries()).map(([name, value]) => ({
      name: name.replace(/_/g, " ").toUpperCase(),
      value: parseFloat(value.toFixed(2)),
      color: COLORS[name as keyof typeof COLORS] || COLORS.other,
    }));
  };

  const getTopBooks = (): TopBook[] => {
    const soldItems = getFilteredSoldItems();
    const bookMap = new Map<string, { sales: number; revenue: number; profit: number }>();

    soldItems.forEach((item) => {
      const book = books[item.bookId];
      if (!book) return;

      const title = book.title;
      const existing = bookMap.get(title) || { sales: 0, revenue: 0, profit: 0 };

      existing.sales += 1;
      existing.revenue += item.salePrice ? parseFloat(item.salePrice) : 0;
      existing.profit += item.actualProfit ? parseFloat(item.actualProfit) : 0;

      bookMap.set(title, existing);
    });

    return Array.from(bookMap.entries())
      .map(([title, data]) => ({
        title,
        sales: data.sales,
        revenue: parseFloat(data.revenue.toFixed(2)),
        profit: parseFloat(data.profit.toFixed(2)),
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);
  };

  const exportReport = () => {
    const soldItems = getFilteredSoldItems();
    const headers = [
      "Date",
      "ISBN",
      "Title",
      "Platform",
      "Purchase Cost",
      "Sale Price",
      "Profit",
    ];

    const rows = soldItems.map((item) => {
      const book = books[item.bookId];
      return [
        item.soldDate ? new Date(item.soldDate).toLocaleDateString() : "",
        book?.isbn || "",
        book?.title || "",
        item.soldPlatform || "",
        item.purchaseCost,
        item.salePrice || "",
        item.actualProfit || "",
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report exported",
      description: `Exported ${soldItems.length} sales`,
    });
  };

  const stats = calculateStats();
  const salesData = getSalesOverTime();
  const platformData = getPlatformBreakdown();
  const topBooks = getTopBooks();

  return (
    <div className="min-h-screen bg-background pb-20 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profit Reports</h1>
            <p className="text-muted-foreground">
              Analyze your sales performance and profitability
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportReport} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    Books sold in period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{stats.totalRevenue.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gross income from sales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    £{stats.totalProfit.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After costs and fees
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ROI</CardTitle>
                  {stats.roi >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      stats.roi >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.roi.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Return on investment
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Over Time</CardTitle>
                  <CardDescription>Daily profit and revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number) => `£${value.toFixed(2)}`}
                          labelFormatter={(label) =>
                            new Date(label).toLocaleDateString()
                          }
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="Revenue"
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Profit"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No sales data for selected period
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Profit by Platform</CardTitle>
                  <CardDescription>Distribution across sales channels</CardDescription>
                </CardHeader>
                <CardContent>
                  {platformData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) =>
                            `${name}: £${value.toFixed(0)}`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `£${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No platform data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Books */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Books</CardTitle>
                <CardDescription>
                  Best sellers by profit in selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topBooks.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="text-right">Sales</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topBooks.map((book, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium max-w-md truncate">
                              {book.title}
                            </TableCell>
                            <TableCell className="text-right">
                              {book.sales}
                            </TableCell>
                            <TableCell className="text-right">
                              £{book.revenue.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  book.profit >= 0
                                    ? "text-green-600 font-medium"
                                    : "text-red-600 font-medium"
                                }
                              >
                                £{book.profit.toFixed(2)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No sales data for selected period
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
