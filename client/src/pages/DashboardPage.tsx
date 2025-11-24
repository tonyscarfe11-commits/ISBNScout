import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Package,
  DollarSign,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSubscriptionLimits } from "@shared/subscription-limits";

interface DashboardStats {
  scansThisMonth: number;
  scansLimit: number;
  totalInventory: number;
  listedBooks: number;
  soldThisMonth: number;
  totalRevenue: number;
  totalProfit: number;
  avgProfit: number;
}

interface RecentScan {
  id: string;
  title: string;
  author?: string;
  isbn: string;
  scannedAt: string;
  amazonPrice?: number;
  ebayPrice?: number;
  yourCost?: number;
  profit?: number;
  status: string;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("basic");
  const [stats, setStats] = useState<DashboardStats>({
    scansThisMonth: 0,
    scansLimit: 100,
    totalInventory: 0,
    listedBooks: 0,
    soldThisMonth: 0,
    totalRevenue: 0,
    totalProfit: 0,
    avgProfit: 0,
  });
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Check localStorage first for subscription tier
      const savedPlan = localStorage.getItem('userPlan');
      if (savedPlan) {
        setUserPlan(savedPlan);
      }

      // Fetch user, books and listings in parallel
      const [userResponse, booksResponse, listingsResponse] = await Promise.all([
        fetch("/api/user/me"),
        fetch("/api/books"),
        fetch("/api/listings"),
      ]);

      // Get user's subscription tier from API (but localStorage takes priority)
      if (userResponse.ok && !savedPlan) {
        const userData = await userResponse.json();
        setUserPlan(userData.subscriptionTier || "free");
      }

      if (booksResponse.ok && listingsResponse.ok) {
        const books = await booksResponse.json();
        const listings = await listingsResponse.json();

        // Calculate stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Scans this month
        const scansThisMonth = books.filter((book: any) =>
          new Date(book.scannedAt) >= startOfMonth
        ).length;

        // Listed books (active listings)
        const listedBooks = listings.filter((l: any) => l.status === "active").length;

        // Sold this month (for now, using sold status listings)
        const soldThisMonth = listings.filter((l: any) =>
          l.status === "sold" && new Date(l.listedAt) >= startOfMonth
        ).length;

        // Calculate revenue and profit from sold listings
        const soldListings = listings.filter((l: any) => l.status === "sold");
        const totalRevenue = soldListings.reduce((sum: number, l: any) =>
          sum + parseFloat(l.price || 0), 0
        );

        // For profit, we'd need the cost data from books
        // For now, estimate based on available data
        const totalProfit = books.reduce((sum: number, book: any) =>
          sum + parseFloat(book.profit || 0), 0
        );

        const avgProfit = soldThisMonth > 0 ? totalProfit / soldThisMonth : 0;

        // Get subscription limits based on user plan
        const limits = getSubscriptionLimits(userPlan);
        const scansLimit = limits.scansPerMonth === -1 ? Infinity : limits.scansPerMonth;

        setStats({
          scansThisMonth,
          scansLimit,
          totalInventory: books.length,
          listedBooks,
          soldThisMonth,
          totalRevenue,
          totalProfit,
          avgProfit,
        });

        // Format recent scans (last 3)
        const recent = books.slice(0, 3).map((book: any) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          scannedAt: formatTimeAgo(book.scannedAt),
          amazonPrice: book.amazonPrice ? parseFloat(book.amazonPrice) : undefined,
          ebayPrice: book.ebayPrice ? parseFloat(book.ebayPrice) : undefined,
          yourCost: book.yourCost ? parseFloat(book.yourCost) : undefined,
          profit: book.profit ? parseFloat(book.profit) : undefined,
          status: book.status,
        }));

        setRecentScans(recent);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  const topPerformers = [
    { category: "Fiction", sold: 0, revenue: 0 },
    { category: "Textbooks", sold: 0, revenue: 0 },
    { category: "Cookbooks", sold: 0, revenue: 0 },
    { category: "Children's Books", sold: 0, revenue: 0 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's your business overview
            </p>
          </div>
          <Button onClick={() => setLocation("/app/scan")}>
            Scan New Book
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Scans This Month</span>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats.scansThisMonth}</span>
              <span className="text-sm text-muted-foreground">/ {stats.scansLimit}</span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${(stats.scansThisMonth / stats.scansLimit) * 100}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Inventory</span>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold">{stats.totalInventory}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.listedBooks} listed
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Sold This Month</span>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{stats.soldThisMonth}</span>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                +12%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              vs last month
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Profit</span>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold text-green-600">
              £{stats.totalProfit.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              £{stats.avgProfit.toFixed(2)} avg per sale
            </p>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Recent Scans</h2>
              <p className="text-sm text-muted-foreground">
                Your latest book scans and profit analysis
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/app/history")}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-16 w-12 bg-primary/10 rounded flex items-center justify-center shrink-0">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{scan.title}</h3>
                  <p className="text-sm text-muted-foreground">{scan.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{scan.scannedAt}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Amazon</div>
                  <div className="font-semibold">
                    {scan.amazonPrice ? `£${scan.amazonPrice.toFixed(2)}` : "-"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">eBay</div>
                  <div className="font-semibold">
                    {scan.ebayPrice ? `£${scan.ebayPrice.toFixed(2)}` : "-"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Profit</div>
                  <div className="font-bold text-green-600">
                    {scan.profit ? `£${scan.profit.toFixed(2)}` : "-"}
                  </div>
                </div>
                <Badge
                  variant={scan.status === "profitable" ? "default" : "secondary"}
                >
                  {scan.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Performers & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Performing Categories */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5" />
              <h2 className="text-xl font-bold">Top Categories</h2>
            </div>
            <div className="space-y-4">
              {topPerformers.map((category, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{category.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.sold} books sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      £{category.revenue.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/app/scan")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Scan New Books
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/app/listings")}
              >
                <Package className="h-4 w-4 mr-2" />
                Manage Listings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/app/history")}
              >
                <Clock className="h-4 w-4 mr-2" />
                View Scan History
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/app/calculator")}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Profit Calculator
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/subscription")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold mb-1">You're on the {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} Plan</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {stats.scansLimit - stats.scansThisMonth} scans remaining this month
                  </p>
                  <Button size="sm" onClick={() => setLocation("/subscription")}>
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
