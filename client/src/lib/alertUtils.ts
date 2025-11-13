// Price alert utilities

export type AlertType = 'profitable' | 'target_margin' | 'price_drop' | 'price_increase';
export type AlertStatus = 'active' | 'triggered' | 'paused' | 'expired';
export type NotificationMethod = 'toast' | 'email' | 'push';

export interface PriceAlert {
  id: string;
  bookId?: string; // If set, only for specific book. If null, applies to all books
  isbn?: string;
  alertType: AlertType;
  targetValue?: number; // For target_margin, this is the margin %; for price changes, the price point
  notificationMethods: NotificationMethod[];
  status: AlertStatus;
  createdAt: Date;
  lastChecked?: Date;
  triggeredAt?: Date;
  notes?: string;
}

export interface AlertCondition {
  type: AlertType;
  value?: number;
  label: string;
  description: string;
}

export const ALERT_CONDITIONS: AlertCondition[] = [
  {
    type: 'profitable',
    label: 'Becomes Profitable',
    description: 'Alert when any book becomes profitable (profit > £0)',
  },
  {
    type: 'target_margin',
    label: 'Hits Target Margin',
    description: 'Alert when profit margin reaches your target percentage',
  },
  {
    type: 'price_drop',
    label: 'Price Drops Below',
    description: 'Alert when market price drops below a certain amount',
  },
  {
    type: 'price_increase',
    label: 'Price Increases Above',
    description: 'Alert when market price rises above a certain amount',
  },
];

/**
 * Check if a book meets alert conditions
 */
export function checkAlertCondition(
  alert: PriceAlert,
  bookData: {
    profit?: number;
    profitMargin?: number;
    currentPrice?: number;
    previousPrice?: number;
  }
): boolean {
  switch (alert.alertType) {
    case 'profitable':
      return (bookData.profit || 0) > 0;

    case 'target_margin':
      if (!alert.targetValue || !bookData.profitMargin) return false;
      return bookData.profitMargin >= alert.targetValue;

    case 'price_drop':
      if (!alert.targetValue || !bookData.currentPrice) return false;
      return bookData.currentPrice < alert.targetValue;

    case 'price_increase':
      if (!alert.targetValue || !bookData.currentPrice) return false;
      return bookData.currentPrice > alert.targetValue;

    default:
      return false;
  }
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(profit: number, cost: number): number {
  if (cost === 0) return 0;
  return (profit / cost) * 100;
}

/**
 * Format alert description for display
 */
export function formatAlertDescription(alert: PriceAlert): string {
  const condition = ALERT_CONDITIONS.find(c => c.type === alert.alertType);
  if (!condition) return 'Unknown alert type';

  switch (alert.alertType) {
    case 'profitable':
      return 'When any book becomes profitable';

    case 'target_margin':
      return `When profit margin ≥ ${alert.targetValue}%`;

    case 'price_drop':
      return `When price drops below £${alert.targetValue?.toFixed(2)}`;

    case 'price_increase':
      return `When price increases above £${alert.targetValue?.toFixed(2)}`;

    default:
      return condition.description;
  }
}

/**
 * Get notification method icons/labels
 */
export function getNotificationMethodLabel(method: NotificationMethod): string {
  switch (method) {
    case 'toast':
      return 'In-App Notification';
    case 'email':
      return 'Email';
    case 'push':
      return 'Push Notification';
  }
}

/**
 * Validate alert configuration
 */
export function validateAlert(alert: Partial<PriceAlert>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!alert.alertType) {
    errors.push('Alert type is required');
  }

  if (
    (alert.alertType === 'target_margin' ||
      alert.alertType === 'price_drop' ||
      alert.alertType === 'price_increase') &&
    (alert.targetValue === undefined || alert.targetValue <= 0)
  ) {
    errors.push('Target value must be greater than 0');
  }

  if (!alert.notificationMethods || alert.notificationMethods.length === 0) {
    errors.push('At least one notification method is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a new alert with defaults
 */
export function createDefaultAlert(type: AlertType): Partial<PriceAlert> {
  return {
    alertType: type,
    notificationMethods: ['toast'],
    status: 'active',
    createdAt: new Date(),
  };
}

/**
 * Group alerts by type
 */
export function groupAlertsByType(alerts: PriceAlert[]): Map<AlertType, PriceAlert[]> {
  const grouped = new Map<AlertType, PriceAlert[]>();

  alerts.forEach(alert => {
    const existing = grouped.get(alert.alertType) || [];
    grouped.set(alert.alertType, [...existing, alert]);
  });

  return grouped;
}

/**
 * Get active alerts count
 */
export function getActiveAlertsCount(alerts: PriceAlert[]): number {
  return alerts.filter(a => a.status === 'active').length;
}

/**
 * Check if price change is significant (>5%)
 */
export function isSignificantPriceChange(oldPrice: number, newPrice: number): boolean {
  if (oldPrice === 0) return true;
  const percentChange = Math.abs((newPrice - oldPrice) / oldPrice) * 100;
  return percentChange >= 5;
}
