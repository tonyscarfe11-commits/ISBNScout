import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, TrendingUp, Users, PoundSterling, MousePointer, LogOut, Eye, EyeOff } from "lucide-react";
import logoImage from "@assets/isbnscout_transparent_512_1763981059394.png";

interface AffiliateStats {
  affiliate: {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    commissionRate: string;
    status: string;
  };
  stats: {
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
    pendingPayout: number;
    conversionRate: string;
  };
  recentClicks: Record<string, number>;
  commissions: {
    pending: number;
    paid: number;
    history: Array<{
      id: string;
      subscriptionTier: string;
      commissionAmount: string;
      status: string;
      createdAt: string;
    }>;
  };
}

export default function AffiliateDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [stats, setStats] = useState<AffiliateStats | null>(null);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    website: "",
    socialMedia: "",
    audience: "",
  });

  useEffect(() => {
    const affiliateId = localStorage.getItem("affiliateId");
    if (affiliateId) {
      fetchDashboardStats(affiliateId);
    }
  }, []);

  const fetchDashboardStats = async (affiliateId: string) => {
    try {
      const response = await fetch("/api/affiliates/dashboard", {
        headers: { "x-affiliate-id": affiliateId },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem("affiliateId");
        localStorage.removeItem("affiliateToken");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/affiliates/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("affiliateId", data.affiliate.id);
      localStorage.setItem("affiliateToken", data.affiliateToken);
      
      await fetchDashboardStats(data.affiliate.id);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.affiliate.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      toast({
        title: "Registration Successful!",
        description: "Your application is pending approval. We'll email you once approved.",
      });
      
      setMode("login");
      setLoginForm({ email: registerForm.email, password: "" });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("affiliateId");
    localStorage.removeItem("affiliateToken");
    setIsLoggedIn(false);
    setStats(null);
    toast({
      title: "Logged out",
      description: "You've been logged out successfully",
    });
  };

  const copyReferralLink = () => {
    if (stats) {
      const link = `${window.location.origin}/?ref=${stats.affiliate.referralCode}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to clipboard",
      });
    }
  };

  if (isLoggedIn && stats) {
    const referralLink = `${window.location.origin}/?ref=${stats.affiliate.referralCode}`;

    return (
      <div className="min-h-screen bg-background">
        <header className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">Affiliate Dashboard</span>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome, {stats.affiliate.name}</h1>
            <p className="text-muted-foreground">Commission Rate: {stats.affiliate.commissionRate}%</p>
          </div>

          <Card className="p-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground mb-1 block">Your Referral Link</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all">
                    {referralLink}
                  </code>
                  <Button
                    onClick={copyReferralLink}
                    size="icon"
                    variant="outline"
                    data-testid="button-copy-link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Badge className="self-start bg-teal-600 text-white">
                Code: {stats.affiliate.referralCode}
              </Badge>
            </div>
          </Card>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <MousePointer className="h-5 w-5 text-teal-500" />
                <span className="text-sm text-muted-foreground">Total Clicks</span>
              </div>
              <p className="text-3xl font-bold" data-testid="text-total-clicks">
                {stats.stats.totalClicks.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-teal-500" />
                <span className="text-sm text-muted-foreground">Conversions</span>
              </div>
              <p className="text-3xl font-bold" data-testid="text-total-conversions">
                {stats.stats.totalConversions.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.stats.conversionRate}% rate
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-teal-500" />
                <span className="text-sm text-muted-foreground">Total Earned</span>
              </div>
              <p className="text-3xl font-bold" data-testid="text-total-earnings">
                £{stats.stats.totalEarnings.toFixed(2)}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <PoundSterling className="h-5 w-5 text-teal-500" />
                <span className="text-sm text-muted-foreground">Pending Payout</span>
              </div>
              <p className="text-3xl font-bold text-teal-600" data-testid="text-pending-payout">
                £{stats.stats.pendingPayout.toFixed(2)}
              </p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Clicks (Last 30 Days)</h2>
              {Object.keys(stats.recentClicks).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.recentClicks)
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 10)
                    .map(([date, count]) => (
                      <div key={date} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <span className="text-sm">{new Date(date).toLocaleDateString('en-GB')}</span>
                        <Badge variant="secondary">{count} clicks</Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No clicks yet. Share your referral link to start earning!
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Commission History</h2>
              {stats.commissions.history.length > 0 ? (
                <div className="space-y-2">
                  {stats.commissions.history.map((commission) => (
                    <div key={commission.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{commission.subscriptionTier}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(commission.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">£{parseFloat(commission.commissionAmount).toFixed(2)}</p>
                        <Badge 
                          variant={commission.status === "paid" ? "default" : "secondary"}
                          className={commission.status === "paid" ? "bg-green-600" : ""}
                        >
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No commissions yet. When your referrals subscribe, you'll earn 25%!
                </p>
              )}
            </Card>
          </div>

          <Card className="mt-8 p-6 bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900">
            <h3 className="font-semibold mb-2">Payout Information</h3>
            <p className="text-sm text-muted-foreground">
              Payouts are processed on the 1st of each month via PayPal. Minimum payout threshold is £10.
              Your pending earnings will be paid out on the next payout date.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="ISBN Scout" className="h-8 w-8" />
            <span className="text-xl font-bold text-white">Affiliate Portal</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {mode === "login" ? "Affiliate Login" : "Become an Affiliate"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "login" 
              ? "Access your dashboard to track earnings" 
              : "Earn 25% commission on every referral"}
          </p>
        </div>

        <Card className="p-6">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="your@email.com"
                  data-testid="input-login-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    data-testid="input-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700"
                data-testid="button-login"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-teal-600 hover:underline font-medium"
                  data-testid="button-switch-register"
                >
                  Register here
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="John Smith"
                  data-testid="input-register-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="your@email.com"
                  data-testid="input-register-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password * (min 8 characters)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                    data-testid="input-register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  value={registerForm.website}
                  onChange={(e) => setRegisterForm({ ...registerForm, website: e.target.value })}
                  placeholder="https://yoursite.com"
                  data-testid="input-register-website"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Tell us about your audience *</Label>
                <Input
                  id="audience"
                  required
                  value={registerForm.audience}
                  onChange={(e) => setRegisterForm({ ...registerForm, audience: e.target.value })}
                  placeholder="e.g., Facebook group, YouTube channel..."
                  data-testid="input-register-audience"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700"
                data-testid="button-register"
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-teal-600 hover:underline font-medium"
                  data-testid="button-switch-login"
                >
                  Login here
                </button>
              </p>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Looking for the old application form?{" "}
          <button
            onClick={() => setLocation("/affiliates")}
            className="text-teal-600 hover:underline"
          >
            Click here
          </button>
        </p>
      </main>
    </div>
  );
}
