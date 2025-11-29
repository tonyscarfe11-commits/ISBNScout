import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
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
  const [userPlan, setUserPlan] = useState("trial");
  const [stats, setStats] = useState<DashboardStats>({
    scansThisMonth: 0,
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
      // Fetch user, books and listings in parallel
      const [userResponse, booksResponse, listingsResponse] = await Promise.all([
        fetch("/api/user/me", { credentials: 'include' }),
        fetch("/api/books", { credentials: 'include' }),
        fetch("/api/listings", { credentials: 'include' }),
      ]);

      // Get user's subscription tier from API
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserPlan(userData.subscriptionTier || "trial");
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
    <div className="min-h-screen pb-28 bg-background">
      <AppHeader />
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Welcome back! Here's your business overview
            </p>
          </div>
          <Button onClick={() => setLocation("/app/scan")} size="lg" className="shadow-md">
            Scan New Book
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 card-elevated border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Scans This Month</span>
              <div className="p-2 rounded-full bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{stats.scansThisMonth}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Unlimited scans
            </p>
          </Card>

          <Card className="p-6 card-elevated border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Total Inventory</span>
              <div className="p-2 rounded-full bg-purple-500/10">
                <BookOpen className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight">{stats.totalInventory}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.listedBooks} listed
            </p>
          </Card>

          <Card className="p-6 card-elevated border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Sold This Month</span>
              <div className="p-2 rounded-full bg-orange-500/10">
                <Package className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.soldThisMonth}</span>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                +12%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              vs last month
            </p>
          </Card>

          <Card className="p-6 card-elevated border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Total Profit</span>
              <div className="p-2 rounded-full bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600 tracking-tight">
              £{stats.totalProfit.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              £{stats.avgProfit.toFixed(2)} avg per sale
            </p>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card className="p-6 card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent Scans</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your latest book scans and profit analysis
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/app/history")} className="hover-elevate">
              View All
            </Button>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-4">Start scanning books to see them here</p>
              <Button onClick={() => setLocation("/app/scan")}>
                Scan Your First Book
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer"
                >
                  <div className="h-16 w-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-base">{scan.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{scan.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{scan.scannedAt}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Amazon</div>
                    <div className="font-semibold text-lg">
                      {scan.amazonPrice ? `£${scan.amazonPrice.toFixed(2)}` : "-"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-muted-foreground mb-1">eBay</div>
                    <div className="font-semibold text-lg">
                      {scan.ebayPrice ? `£${scan.ebayPrice.toFixed(2)}` : "-"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Profit</div>
                    <div className="font-bold text-green-600 text-lg">
                      {scan.profit ? `£${scan.profit.toFixed(2)}` : "-"}
                    </div>
                  </div>
                  <Badge
                    variant={scan.status === "profitable" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {scan.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Performers & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Performing Categories */}
          <Card className="p-6 card-elevated">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Top Categories</h2>
            </div>
            <div className="space-y-4">
              {topPerformers.map((category, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base">{category.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.sold} books sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">
                      £{category.revenue.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 card-elevated">
            <h2 className="text-2xl font-bold mb-6 tracking-tight">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-base hover-elevate"
                onClick={() => setLocation("/app/scan")}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Scan New Books
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-base hover-elevate"
                onClick={() => setLocation("/app/history")}
              >
                <Clock className="h-5 w-5 mr-3" />
                View Scan History
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-base hover-elevate"
                onClick={() => setLocation("/app/calculator")}
              >
                <DollarSign className="h-5 w-5 mr-3" />
                Profit Calculator
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12 text-base hover-elevate"
                onClick={() => setLocation("/subscription")}
              >
                <TrendingUp className="h-5 w-5 mr-3" />
                View Plans
              </Button>
            </div>

            <div className="mt-6 p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-1">
                    {userPlan === 'trial' ? 'Free Trial Active' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1).replace(/_/g, ' ')} Plan`}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {userPlan === 'trial' ? 'Unlimited scans during trial' : 'Unlimited scans'}
                  </p>
                  {userPlan === 'trial' && (
                    <Button size="sm" onClick={() => setLocation("/subscription")} className="shadow-sm">
                      View Plans
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
