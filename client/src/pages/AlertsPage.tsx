import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  Mail,
  MessageSquare,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  type PriceAlert,
  type AlertType,
  type NotificationMethod,
  ALERT_CONDITIONS,
  formatAlertDescription,
  validateAlert,
  createDefaultAlert,
  getActiveAlertsCount,
} from "@/lib/alertUtils";

export default function AlertsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null);

  // Form state
  const [alertType, setAlertType] = useState<AlertType>('profitable');
  const [targetValue, setTargetValue] = useState<string>('');
  const [notificationMethods, setNotificationMethods] = useState<NotificationMethod[]>(['toast']);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      // For now, load from localStorage
      const saved = localStorage.getItem('priceAlerts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAlerts(parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          lastChecked: a.lastChecked ? new Date(a.lastChecked) : undefined,
          triggeredAt: a.triggeredAt ? new Date(a.triggeredAt) : undefined,
        })));
      }
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAlerts = (updatedAlerts: PriceAlert[]) => {
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
    setAlerts(updatedAlerts);
  };

  const handleCreateAlert = () => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      alertType,
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      notificationMethods,
      notes: notes || undefined,
      status: 'active',
      createdAt: new Date(),
    };

    const validation = validateAlert(newAlert);
    if (!validation.valid) {
      toast({
        title: "Invalid alert",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    const updatedAlerts = [...alerts, newAlert];
    saveAlerts(updatedAlerts);

    toast({
      title: "Alert created",
      description: "You'll be notified when conditions are met",
    });

    setCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateAlert = () => {
    if (!editingAlert) return;

    const updatedAlert: PriceAlert = {
      ...editingAlert,
      alertType,
      targetValue: targetValue ? parseFloat(targetValue) : undefined,
      notificationMethods,
      notes: notes || undefined,
    };

    const validation = validateAlert(updatedAlert);
    if (!validation.valid) {
      toast({
        title: "Invalid alert",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    const updatedAlerts = alerts.map(a =>
      a.id === editingAlert.id ? updatedAlert : a
    );
    saveAlerts(updatedAlerts);

    toast({
      title: "Alert updated",
      description: "Changes saved successfully",
    });

    setEditingAlert(null);
    resetForm();
  };

  const handleDeleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(a => a.id !== id);
    saveAlerts(updatedAlerts);

    toast({
      title: "Alert deleted",
      description: "Price alert removed",
    });
  };

  const handleToggleAlert = (id: string, enabled: boolean) => {
    const updatedAlerts = alerts.map(a =>
      a.id === id ? { ...a, status: enabled ? 'active' : 'paused' } : a
    );
    saveAlerts(updatedAlerts);
  };

  const resetForm = () => {
    setAlertType('profitable');
    setTargetValue('');
    setNotificationMethods(['toast']);
    setNotes('');
    setCreateDialogOpen(false);
    setEditingAlert(null);
  };

  const openEditDialog = (alert: PriceAlert) => {
    setEditingAlert(alert);
    setAlertType(alert.alertType);
    setTargetValue(alert.targetValue?.toString() || '');
    setNotificationMethods(alert.notificationMethods);
    setNotes(alert.notes || '');
  };

  const toggleNotificationMethod = (method: NotificationMethod) => {
    if (notificationMethods.includes(method)) {
      setNotificationMethods(notificationMethods.filter(m => m !== method));
    } else {
      setNotificationMethods([...notificationMethods, method]);
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'profitable':
        return DollarSign;
      case 'target_margin':
        return Target;
      case 'price_drop':
        return TrendingDown;
      case 'price_increase':
        return TrendingUp;
    }
  };

  const activeCount = getActiveAlertsCount(alerts);

  const needsTargetValue = alertType !== 'profitable';

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Price Alerts</h1>
            <p className="text-sm text-muted-foreground">
              Get notified when books meet your profit criteria
            </p>
          </div>
          <Dialog open={createDialogOpen || !!editingAlert} onOpenChange={(open) => {
            if (!open) resetForm();
            else setCreateDialogOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAlert ? 'Edit Alert' : 'Create Price Alert'}
                </DialogTitle>
                <DialogDescription>
                  Set up notifications for price changes and profit opportunities
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="alertType">Alert Condition</Label>
                  <Select value={alertType} onValueChange={(v) => setAlertType(v as AlertType)}>
                    <SelectTrigger id="alertType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALERT_CONDITIONS.map(condition => (
                        <SelectItem key={condition.type} value={condition.type}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {ALERT_CONDITIONS.find(c => c.type === alertType)?.description}
                  </p>
                </div>

                {needsTargetValue && (
                  <div className="space-y-2">
                    <Label htmlFor="targetValue">
                      {alertType === 'target_margin' ? 'Target Margin (%)' : 'Price (£)'}
                    </Label>
                    <Input
                      id="targetValue"
                      type="number"
                      min="0"
                      step={alertType === 'target_margin' ? '1' : '0.01'}
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder={alertType === 'target_margin' ? '25' : '10.00'}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Notification Methods</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">In-App Notification</span>
                      </div>
                      <Switch
                        checked={notificationMethods.includes('toast')}
                        onCheckedChange={() => toggleNotificationMethod('toast')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Email</span>
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                      </div>
                      <Switch disabled />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Push Notification</span>
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                      </div>
                      <Switch disabled />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a reminder..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}>
                  {editingAlert ? 'Update Alert' : 'Create Alert'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Triggered</p>
                <p className="text-2xl font-bold">
                  {alerts.filter(a => a.status === 'triggered').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : alerts.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No price alerts yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first alert to get notified about profit opportunities
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map(alert => {
              const AlertIcon = getAlertIcon(alert.alertType);
              const isActive = alert.status === 'active';
              const isTriggered = alert.status === 'triggered';

              return (
                <Card key={alert.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      isTriggered ? 'bg-green-500/10' : isActive ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <AlertIcon className={`h-5 w-5 ${
                        isTriggered ? 'text-green-600' : isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-semibold">
                            {ALERT_CONDITIONS.find(c => c.type === alert.alertType)?.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formatAlertDescription(alert)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={isActive}
                            onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(alert)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {alert.notes && (
                        <p className="text-xs text-muted-foreground mb-2">
                          Note: {alert.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {alert.status}
                        </Badge>
                        {alert.notificationMethods.map(method => (
                          <Badge key={method} variant="outline" className="text-xs">
                            {method === 'toast' && <MessageSquare className="h-3 w-3 mr-1" />}
                            {method === 'email' && <Mail className="h-3 w-3 mr-1" />}
                            {method === 'push' && <Smartphone className="h-3 w-3 mr-1" />}
                            {method}
                          </Badge>
                        ))}
                        {isTriggered && alert.triggeredAt && (
                          <span className="text-xs text-muted-foreground">
                            Triggered {new Date(alert.triggeredAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
