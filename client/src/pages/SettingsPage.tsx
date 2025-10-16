import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { CloudOff, Database, Bell, Info } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [offlineMode, setOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleClearCache = () => {
    toast({
      title: "Cache cleared",
      description: "Offline data has been removed",
    });
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
