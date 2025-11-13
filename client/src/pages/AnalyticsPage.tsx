import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  BookOpen,
  Target,
  Calendar,
  Loader2,
  Award,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  calculateMetrics,
  groupByDate,
  getTopBooks,
  getWorstBooks,
  getProfitDistribution,
  getScanningTrend,
  formatCurrency,
  formatPercentage,
  calculateROI,
  getQuickStats,
  type BookData,
  type TimeSeriesData,
} from "@/lib/analyticsUtils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [books, setBooks] = useState<BookData[]>([]);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/books");
      if (response.ok) {
        const booksData = await response.json();
        setBooks(booksData);
      }
    } catch (error) {
      console.error("Failed to load books:", error);
      toast({
        title: "Failed to load analytics",
        description: "Could not retrieve book data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const metrics = calculateMetrics(books);
  const days = parseInt(timeRange);
  const timeSeriesData = groupByDate(books, days);
  const topBooks = getTopBooks(books, 5);
  const worstBooks = getWorstBooks(books, 5);
  const distribution = getProfitDistribution(books);
  const trend = getScanningTrend(timeSeriesData);
  const roi = calculateROI(books);
  const periodStats = getQuickStats(books, days);

  const distributionChartData = [
    { name: "Very Profitable (>£5)", value: distribution.veryProfitable, fill: "#22c55e" },
    { name: "Profitable (£0-£5)", value: distribution.profitable, fill: "#84cc16" },
    { name: "Break Even", value: distribution.breakEven, fill: "#a3a3a3" },
    { name: "Loss", value: distribution.loss, fill: "#ef4444" },
  ];

  const TrendIcon = trend.trend === 'increasing' ? TrendingUp : trend.trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor = trend.trend === 'increasing' ? 'text-green-600' : trend.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Track your scanning performance and profitability
            </p>
          </div>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{periodStats.totalScans}</p>
                <div className={`flex items-center gap-1 text-xs mt-1 ${trendColor}`}>
                  <TrendIcon className="h-3 w-3" />
                  {trend.percentage.toFixed(0)}% vs previous period
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(periodStats.totalProfit)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {formatCurrency(periodStats.averageProfit)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profitability Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(periodStats.profitabilityRate)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {periodStats.profitableBooks} of {periodStats.totalScans} books
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold">{formatPercentage(roi)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Return on investment
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="top-books">Top Books</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Scanning Activity</h3>
              <ChartContainer
                config={{
                  scans: {
                    label: "Scans",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[300px]"
              >
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profit Over Time</h3>
              <ChartContainer
                config={{
                  profit: {
                    label: "Profit",
                    color: "#22c55e",
                  },
                }}
                className="h-[300px]"
              >
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    tickFormatter={(value) => `£${value}`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`£${Number(value).toFixed(2)}`, "Profit"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ChartContainer>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profit Distribution</h3>
              <ChartContainer
                config={{
                  value: {
                    label: "Books",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[400px]"
              >
                <BarChart data={distributionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Best Profit</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.bestProfit)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Worst Loss</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.worstProfit)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="top-books" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Top 5 Most Profitable Books
              </h3>
              {topBooks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No profitable books yet
                </p>
              ) : (
                <div className="space-y-3">
                  {topBooks.map((book, idx) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-green-600">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {book.author || 'Unknown Author'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-bold text-green-600">
                          {formatCurrency(book.profit || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {worstBooks.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Worst Performing Books
                </h3>
                <div className="space-y-3">
                  {worstBooks.map((book, idx) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-red-600">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{book.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {book.author || 'Unknown Author'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-bold text-red-600">
                          {formatCurrency(book.profit || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
