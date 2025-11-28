import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { CloudOff, Database, Bell, Info, ShoppingCart, Key, Check, Crown, Activity, Clock, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getOfflineDB } from "@/lib/offline-db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [offlineMode, setOfflineMode] = useState(true); // Always enabled now
  const [notifications, setNotifications] = useState(true);
  const [storageStats, setStorageStats] = useState({
    bookCount: 0,
    priceCacheCount: 0,
    imageCount: 0,
    totalSize: "0 MB",
  });
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [hasEbayCredentials, setHasEbayCredentials] = useState(false);
  const [hasAmazonCredentials, setHasAmazonCredentials] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // eBay credentials
  const [ebayAppId, setEbayAppId] = useState("");
  const [ebayCertId, setEbayCertId] = useState("");
  const [ebayDevId, setEbayDevId] = useState("");
  const [ebayAuthToken, setEbayAuthToken] = useState("");

  // Amazon credentials
  const [amazonClientId, setAmazonClientId] = useState("");
  const [amazonClientSecret, setAmazonClientSecret] = useState("");
  const [amazonRefreshToken, setAmazonRefreshToken] = useState("");
  const [amazonAwsAccessKey, setAmazonAwsAccessKey] = useState("");
  const [amazonAwsSecretKey, setAmazonAwsSecretKey] = useState("");
  const [amazonSellerRole, setAmazonSellerRole] = useState("");
  const [amazonRegion, setAmazonRegion] = useState("eu");

  // API usage tracking
  const [apiUsage, setApiUsage] = useState<{
    ebay: { callCount: number; remaining: number };
  } | null>(null);

  // Trial status
  const [trialInfo, setTrialInfo] = useState<{
    tier: string;
    status: string;
    daysRemaining: number;
    trialEndsAt: string | null;
  } | null>(null);

  useEffect(() => {
    // Fetch trial info
    const fetchTrialInfo = async () => {
      try {
        const response = await fetch('/api/user/trial-status', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setTrialInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch trial info:', error);
      }
    };

    fetchTrialInfo();
  }, []);

  useEffect(() => {
    // Fetch API usage on mount and every 30 seconds
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/usage', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setApiUsage({
            ebay: {
              callCount: data.today.ebay.callCount,
              remaining: data.limits.ebay.remaining
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch API usage:', error);
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, []);

  // Load storage stats on mount
  useEffect(() => {
    loadStorageStats();
  }, []);

  const handleClearCache = async () => {
    try {
      const offlineDB = getOfflineDB();
      await offlineDB.clearAllData();

      // Update storage stats
      await loadStorageStats();

      toast({
        title: "✅ Cache Cleared",
        description: "All offline data has been removed",
      });
    } catch (error: any) {
      console.error('[Settings] Failed to clear cache:', error);
      toast({
        title: "Failed to clear cache",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadStorageStats = async () => {
    try {
      const offlineDB = getOfflineDB();
      const stats = await offlineDB.getStorageStats();

      // Estimate size (rough calculation)
      // Assume average book record ~2KB, price cache ~500B, image ~50KB
      const estimatedBytes =
        (stats.bookCount * 2048) +
        (stats.priceCacheCount * 512) +
        (stats.imageCount * 51200);

      const sizeInMB = (estimatedBytes / (1024 * 1024)).toFixed(1);

      setStorageStats({
        ...stats,
        totalSize: `${sizeInMB} MB`,
      });
    } catch (error) {
      console.error('[Settings] Failed to load storage stats:', error);
    }
  };

  const handleSaveEbayCredentials = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "ebay",
          credentials: {
            appId: ebayAppId,
            certId: ebayCertId,
            devId: ebayDevId,
            authToken: ebayAuthToken,
            sandbox: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save credentials");
      }

      setHasEbayCredentials(true);
      toast({
        title: "Success",
        description: "eBay credentials saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save eBay credentials",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAmazonCredentials = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "amazon",
          credentials: {
            region: amazonRegion,
            refresh_token: amazonRefreshToken,
            credentials: {
              SELLING_PARTNER_APP_CLIENT_ID: amazonClientId,
              SELLING_PARTNER_APP_CLIENT_SECRET: amazonClientSecret,
              AWS_ACCESS_KEY_ID: amazonAwsAccessKey,
              AWS_SECRET_ACCESS_KEY: amazonAwsSecretKey,
              AWS_SELLING_PARTNER_ROLE: amazonSellerRole,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save credentials");
      }

      setHasAmazonCredentials(true);
      toast({
        title: "Success",
        description: "Amazon credentials saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save Amazon credentials",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your app preferences
          </p>
        </div>

        <div className="space-y-4">
          {/* Trial Status Card */}
          {trialInfo && (trialInfo.status === 'trialing' || trialInfo.tier === 'trial') && (
            <Card className={`p-4 ${trialInfo.daysRemaining <= 0 ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-primary bg-primary/5'}`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className={`h-5 w-5 ${trialInfo.daysRemaining <= 0 ? 'text-red-600' : 'text-primary'}`} />
                {trialInfo.daysRemaining <= 0 ? 'Trial Expired - Grace Period' : 'Free Trial Active'}
              </h2>
              <div className="space-y-3">
                {trialInfo.daysRemaining <= 0 ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Your trial has ended</p>
                        <p className="text-xs text-muted-foreground">
                          You have 3 days of grace period access
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold font-mono text-red-600">
                          {Math.max(0, 3 + trialInfo.daysRemaining)}
                        </p>
                        <p className="text-xs text-muted-foreground">grace days left</p>
                      </div>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm font-medium text-red-900 dark:text-red-100">
                        🚨 Grace period active
                      </p>
                      <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                        Your access will be blocked in {Math.max(0, 3 + trialInfo.daysRemaining)} {Math.max(0, 3 + trialInfo.daysRemaining) === 1 ? 'day' : 'days'}. Upgrade now to keep full access!
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Trial Status</p>
                      <p className="text-xs text-muted-foreground">
                        {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? 'day' : 'days'} remaining
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold font-mono text-primary">
                        {trialInfo.daysRemaining}
                      </p>
                      <p className="text-xs text-muted-foreground">days left</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Enjoying ISBNScout?</p>
                    <p className="text-xs text-muted-foreground">
                      Upgrade now to keep all features after trial ends
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setLocation('/subscription')}
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade
                  </Button>
                </div>
                {trialInfo.daysRemaining <= 3 && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      ⚠️ Trial ending soon!
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Your trial expires in {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? 'day' : 'days'}. Upgrade to continue using all features.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Quick Links Card */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setLocation('/app/repricing')}
                data-testid="link-repricing"
              >
                <TrendingDown className="h-4 w-4 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Repricing</p>
                  <p className="text-xs text-muted-foreground">Auto-adjust prices to stay competitive</p>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setLocation('/app/alerts')}
              >
                <Bell className="h-4 w-4 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Price Alerts</p>
                  <p className="text-xs text-muted-foreground">Manage notifications for profit opportunities</p>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setLocation('/app/analytics')}
              >
                <Activity className="h-4 w-4 mr-3" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">View your performance dashboard</p>
                </div>
              </Button>
            </div>
          </Card>

          {/* API Usage Card */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API Usage Today
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">eBay API</p>
                  <p className="text-xs text-muted-foreground">
                    {apiUsage ? (
                      <>
                        {apiUsage.ebay.callCount.toLocaleString()} / 5,000 calls used
                      </>
                    ) : (
                      'Loading...'
                    )}
                  </p>
                </div>
                <div className="text-right">
                  {apiUsage && (
                    <>
                      <p className="text-2xl font-bold font-mono">
                        {apiUsage.ebay.remaining.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">remaining</p>
                      {apiUsage.ebay.remaining < 1000 && (
                        <Badge variant="destructive" className="mt-1">
                          Low Limit
                        </Badge>
                      )}
                      {apiUsage.ebay.remaining >= 1000 && apiUsage.ebay.remaining < 2000 && (
                        <Badge variant="secondary" className="mt-1">
                          Warning
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Resets daily at 8:00 AM GMT (midnight PST)
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Marketplace Integrations
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">eBay</p>
                    <p className="text-xs text-muted-foreground">
                      {hasEbayCredentials ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasEbayCredentials && (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amazon (FBA & FBM)</p>
                    <p className="text-xs text-muted-foreground">
                      {hasAmazonCredentials ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasAmazonCredentials && (
                    <Badge variant="default" className="gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>

              <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-2" variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Manage API Credentials
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>API Credentials</DialogTitle>
                    <DialogDescription>
                      Enter your eBay and Amazon (FBA & FBM) API credentials to enable direct listing
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="ebay" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ebay">eBay</TabsTrigger>
                      <TabsTrigger value="amazon">Amazon</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ebay" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="ebay-app-id">App ID (Client ID)</Label>
                        <Input
                          id="ebay-app-id"
                          type="text"
                          value={ebayAppId}
                          onChange={(e) => setEbayAppId(e.target.value)}
                          placeholder="Your eBay App ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ebay-cert-id">Cert ID (Client Secret)</Label>
                        <Input
                          id="ebay-cert-id"
                          type="password"
                          value={ebayCertId}
                          onChange={(e) => setEbayCertId(e.target.value)}
                          placeholder="Your eBay Cert ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ebay-dev-id">Dev ID</Label>
                        <Input
                          id="ebay-dev-id"
                          type="text"
                          value={ebayDevId}
                          onChange={(e) => setEbayDevId(e.target.value)}
                          placeholder="Your eBay Dev ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ebay-auth-token">Auth Token (Optional)</Label>
                        <Input
                          id="ebay-auth-token"
                          type="password"
                          value={ebayAuthToken}
                          onChange={(e) => setEbayAuthToken(e.target.value)}
                          placeholder="Your eBay Auth Token"
                        />
                      </div>
                      <Button
                        onClick={handleSaveEbayCredentials}
                        disabled={isSaving || !ebayAppId || !ebayCertId || !ebayDevId}
                        className="w-full"
                      >
                        {isSaving ? "Saving..." : "Save eBay Credentials"}
                      </Button>
                    </TabsContent>

                    <TabsContent value="amazon" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="amazon-client-id">Client ID</Label>
                        <Input
                          id="amazon-client-id"
                          type="text"
                          value={amazonClientId}
                          onChange={(e) => setAmazonClientId(e.target.value)}
                          placeholder="Your Amazon Client ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amazon-client-secret">Client Secret</Label>
                        <Input
                          id="amazon-client-secret"
                          type="password"
                          value={amazonClientSecret}
                          onChange={(e) => setAmazonClientSecret(e.target.value)}
                          placeholder="Your Amazon Client Secret"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amazon-refresh-token">Refresh Token</Label>
                        <Input
                          id="amazon-refresh-token"
                          type="password"
                          value={amazonRefreshToken}
                          onChange={(e) => setAmazonRefreshToken(e.target.value)}
                          placeholder="Your Amazon Refresh Token"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amazon-aws-access-key">AWS Access Key ID</Label>
                        <Input
                          id="amazon-aws-access-key"
                          type="text"
                          value={amazonAwsAccessKey}
                          onChange={(e) => setAmazonAwsAccessKey(e.target.value)}
                          placeholder="Your AWS Access Key"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amazon-aws-secret-key">AWS Secret Access Key</Label>
                        <Input
                          id="amazon-aws-secret-key"
                          type="password"
                          value={amazonAwsSecretKey}
                          onChange={(e) => setAmazonAwsSecretKey(e.target.value)}
                          placeholder="Your AWS Secret Key"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amazon-seller-role">AWS Selling Partner Role ARN</Label>
                        <Input
                          id="amazon-seller-role"
                          type="text"
                          value={amazonSellerRole}
                          onChange={(e) => setAmazonSellerRole(e.target.value)}
                          placeholder="arn:aws:iam::..."
                        />
                      </div>
                      <Button
                        onClick={handleSaveAmazonCredentials}
                        disabled={
                          isSaving ||
                          !amazonClientId ||
                          !amazonClientSecret ||
                          !amazonRefreshToken ||
                          !amazonAwsAccessKey ||
                          !amazonAwsSecretKey ||
                          !amazonSellerRole
                        }
                        className="w-full"
                      >
                        {isSaving ? "Saving..." : "Save Amazon Credentials"}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Subscription
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                <div>
                  <p className="text-sm font-medium">Current Plan</p>
                  {trialInfo && trialInfo.status === 'trialing' ? (
                    <>
                      <p className="text-xs text-muted-foreground">Free Trial</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? 'day' : 'days'} remaining
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {trialInfo?.tier === 'basic' ? 'Basic Plan' : trialInfo?.tier === 'pro' ? 'Pro Plan' : trialInfo?.tier === 'enterprise' ? 'Enterprise Plan' : 'No Active Plan'}
                      </p>
                    </>
                  )}
                </div>
                {trialInfo && trialInfo.status === 'trialing' ? (
                  <Badge variant="default">Trial Active</Badge>
                ) : (
                  <Badge variant="secondary">{trialInfo?.tier || 'Free'}</Badge>
                )}
              </div>
              <Button
                className="w-full"
                onClick={() => setLocation("/subscription")}
              >
                <Crown className="h-4 w-4 mr-2" />
                View Plans & Upgrade
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CloudOff className="h-5 w-5" />
              Offline Mode
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="offline-mode" className="text-sm font-medium">
                    Offline Mode Active
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scan books, view history, and see prices without internet
                  </p>
                </div>
                <Switch
                  id="offline-mode"
                  checked={offlineMode}
                  disabled={true}
                  data-testid="switch-offline-mode"
                />
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Used</span>
                  <Badge variant="outline">{storageStats.totalSize}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <div className="font-medium text-foreground">{storageStats.bookCount}</div>
                    <div>Books</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{storageStats.priceCacheCount}</div>
                    <div>Prices</div>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{storageStats.imageCount}</div>
                    <div>Images</div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClearCache}
                  data-testid="button-clear-cache"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Clear All Offline Data
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Get notified when books are synced or listed
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label className="text-sm font-medium">Theme</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Toggle between light and dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              About
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Build</span>
                <span className="font-medium">2025.1</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
