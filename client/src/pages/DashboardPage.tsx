import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { WelcomeGuide, useFirstTimeUser } from "@/components/WelcomeGuide";
import { useLocation } from "wouter";
import {
  TrendingUp,
  BookOpen,
  Package,
  PoundSterling,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2,
  Loader2,
  Camera,
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
  const { isFirstTime, dismissWelcome } = useFirstTimeUser();
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
      const [userResponse, booksResponse, listingsResponse] = await Promise.all([
        fetch("/api/user/me", { credentials: 'include' }),
        fetch("/api/books", { credentials: 'include' }),
        fetch("/api/listings", { credentials: 'include' }),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserPlan(userData.subscriptionTier || "trial");
      }

      if (booksResponse.ok && listingsResponse.ok) {
        const books = await booksResponse.json();
        const listings = await listingsResponse.json();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const scansThisMonth = books.filter((book: any) =>
          new Date(book.scannedAt) >= startOfMonth
        ).length;

        const listedBooks = listings.filter((l: any) => l.status === "active").length;

        const soldThisMonth = listings.filter((l: any) =>
          l.status === "sold" && new Date(l.listedAt) >= startOfMonth
        ).length;

        const soldListings = listings.filter((l: any) => l.status === "sold");
        const totalRevenue = soldListings.reduce((sum: number, l: any) =>
          sum + parseFloat(l.price || 0), 0
        );

        const totalProfit = books.reduce((sum: number, book: any) =>
          sum + parseFloat(book.profit || 0), 0
        );

        const avgProfit = soldThisMonth > 0 ? totalProfit / soldThisMonth : 0;

        const limits = getSubscriptionLimits(userPlan);

        setStats({
          scansThisMonth,
          totalInventory: books.length,
          listedBooks,
          soldThisMonth,
          totalRevenue,
          totalProfit,
          avgProfit,
        });

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

  const SkeletonCard = () => (
    <Card className="p-4 md:p-5 border-l-4 border-l-muted animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-16 bg-muted rounded skeleton-shimmer" />
        <div className="p-1.5 md:p-2 rounded-full bg-muted" />
      </div>
      <div className="h-8 w-20 bg-muted rounded skeleton-shimmer mb-1" />
      <div className="h-3 w-14 bg-muted rounded skeleton-shimmer" />
    </Card>
  );

  const SkeletonRow = () => (
    <div className="flex items-center gap-3 p-3 border rounded-lg animate-pulse">
      <div className="h-12 w-10 bg-muted rounded skeleton-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-muted rounded skeleton-shimmer" />
        <div className="h-3 w-24 bg-muted rounded skeleton-shimmer" />
      </div>
      <div className="h-6 w-16 bg-muted rounded skeleton-shimmer" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pb-28 bg-background">
        <AppHeader />
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-40 bg-muted rounded skeleton-shimmer" />
              <div className="h-4 w-48 bg-muted rounded skeleton-shimmer" />
            </div>
            <div className="h-10 w-32 bg-muted rounded skeleton-shimmer" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <Card className="p-4 md:p-6">
            <div className="h-6 w-32 bg-muted rounded skeleton-shimmer mb-4" />
            <div className="space-y-2">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-background">
      <AppHeader />
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Your scouting overview
            </p>
          </div>
          <Button 
            onClick={() => setLocation("/app/scan")} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
            data-testid="button-scan-new"
          >
            <Camera className="h-4 w-4" />
            Scan Books
          </Button>
        </div>

        {/* First-time User Welcome */}
        {isFirstTime && stats.scansThisMonth === 0 && (
          <WelcomeGuide 
            onDismiss={dismissWelcome}
            onStartScanning={() => {
              dismissWelcome();
              setLocation("/app/scan");
            }}
          />
        )}

        {/* Stats Grid - Teal Color Scheme */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-4 md:p-5 border-l-4 border-l-emerald-500 card-professional animate-slide-up stagger-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Scans</span>
              <div className="p-1.5 md:p-2 rounded-full bg-emerald-500/10">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold tracking-tight font-data">{stats.scansThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </Card>

          <Card className="p-4 md:p-5 border-l-4 border-l-emerald-400 card-professional animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Inventory</span>
              <div className="p-1.5 md:p-2 rounded-full bg-emerald-400/10">
                <BookOpen className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold tracking-tight font-data">{stats.totalInventory}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.listedBooks} listed
            </p>
          </Card>

          <Card className="p-4 md:p-5 border-l-4 border-l-emerald-600 card-professional animate-slide-up stagger-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Sold</span>
              <div className="p-1.5 md:p-2 rounded-full bg-emerald-600/10">
                <Package className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl font-bold tracking-tight font-data">{stats.soldThisMonth}</span>
              {stats.soldThisMonth > 0 && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-xs dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                  <TrendingUp className="h-3 w-3" />
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </Card>

          <Card className="p-4 md:p-5 border-l-4 border-l-emerald-500 card-professional animate-slide-up stagger-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-muted-foreground">Profit</span>
              <div className="p-1.5 md:p-2 rounded-full bg-emerald-500/10">
                <PoundSterling className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-emerald-600 tracking-tight font-data">
              £{stats.totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-data">
              £{stats.avgProfit.toFixed(2)} avg
            </p>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card className="p-4 md:p-6 animate-slide-up stagger-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight">Recent Scans</h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Latest books and profit analysis
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/app/history")} 
              data-testid="button-view-all"
            >
              View All
            </Button>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <BookOpen className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-base font-semibold mb-1">No scans yet</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
                Start scanning books to track profits and build your inventory
              </p>
              <Button 
                onClick={() => setLocation("/app/scan")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                data-testid="button-first-scan"
              >
                Scan Your First Book
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan, index) => (
                <div
                  key={scan.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer press-effect animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  data-testid={`card-scan-${scan.id}`}
                >
                  <div className="h-12 w-10 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-sm">{scan.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{scan.author}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Amazon</div>
                    <div className="font-semibold text-sm font-data">
                      {scan.amazonPrice ? `£${scan.amazonPrice.toFixed(2)}` : "—"}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">eBay</div>
                    <div className="font-semibold text-sm font-data">
                      {scan.ebayPrice ? `£${scan.ebayPrice.toFixed(2)}` : "—"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Profit</div>
                    <div className="font-bold text-emerald-600 text-sm font-data">
                      {scan.profit ? `£${scan.profit.toFixed(2)}` : "—"}
                    </div>
                  </div>
                  <Badge
                    className={`capitalize text-xs ${
                      scan.status === "profitable" 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" 
                        : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                    }`}
                  >
                    {scan.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions & Categories */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Quick Actions */}
          <Card className="p-4 md:p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-lg md:text-xl font-bold mb-4 tracking-tight">Quick Actions</h2>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-11 text-sm transition-all duration-200"
                onClick={() => setLocation("/app/scan")}
                data-testid="button-quick-scan"
              >
                <Camera className="h-4 w-4 mr-3 text-emerald-600" />
                Scan New Books
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-11 text-sm transition-all duration-200"
                onClick={() => setLocation("/app/history")}
                data-testid="button-quick-history"
              >
                <Clock className="h-4 w-4 mr-3 text-emerald-600" />
                View Scan History
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-11 text-sm transition-all duration-200"
                onClick={() => setLocation("/app/calculator")}
                data-testid="button-quick-calculator"
              >
                <PoundSterling className="h-4 w-4 mr-3 text-emerald-600" />
                Profit Calculator
              </Button>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-0.5">
                    {userPlan === 'trial' ? 'Free Trial Active' : `${userPlan.charAt(0).toUpperCase() + userPlan.slice(1).replace(/_/g, ' ')} Plan`}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Unlimited scans included
                  </p>
                  {userPlan === 'trial' && (
                    <Button 
                      size="sm" 
                      onClick={() => setLocation("/subscription")} 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 shadow-sm"
                      data-testid="button-upgrade"
                    >
                      View Plans
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Top Categories */}
          <Card className="p-4 md:p-6 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 shadow-sm">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-lg md:text-xl font-bold tracking-tight">Top Categories</h2>
            </div>
            <div className="space-y-2">
              {topPerformers.map((category, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border cursor-pointer"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-xs shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{category.category}</div>
                    <div className="text-xs text-muted-foreground">
                      {category.sold} sold
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 text-sm font-data">
                      £{category.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
