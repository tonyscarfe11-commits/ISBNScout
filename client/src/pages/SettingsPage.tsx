import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { CloudOff, Database, Bell, Info, ShoppingCart, Key, Check, Crown } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
  const [offlineMode, setOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
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

  const handleClearCache = () => {
    toast({
      title: "Cache cleared",
      description: "Offline data has been removed",
    });
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
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your app preferences
          </p>
        </div>

        <div className="space-y-4">
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
                  <p className="text-xs text-muted-foreground">Starter (Free)</p>
                  <p className="text-xs text-muted-foreground mt-1">10 scans per month</p>
                </div>
                <Badge variant="secondary">Free</Badge>
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
                    Enable Offline Mode
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Continue scanning books without internet connection
                  </p>
                </div>
                <Switch
                  id="offline-mode"
                  checked={offlineMode}
                  onCheckedChange={setOfflineMode}
                  data-testid="switch-offline-mode"
                />
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Storage Used</span>
                  <Badge variant="outline">2.3 MB</Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClearCache}
                  data-testid="button-clear-cache"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Clear Offline Cache
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
