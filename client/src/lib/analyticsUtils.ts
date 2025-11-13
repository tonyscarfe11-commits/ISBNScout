// Analytics utilities for calculating statistics and trends

export interface BookData {
  id: string;
  isbn: string;
  title: string;
  author?: string;
  amazonPrice?: number;
  ebayPrice?: number;
  yourCost?: number;
  profit?: number;
  status: string;
  createdAt: Date | string;
}

export interface AnalyticsMetrics {
  totalScans: number;
  profitableBooks: number;
  totalProfit: number;
  averageProfit: number;
  bestProfit: number;
  worstProfit: number;
  profitabilityRate: number;
}

export interface TimeSeriesData {
  date: string;
  scans: number;
  profit: number;
}

export interface CategoryData {
  category: string;
  count: number;
  profit: number;
  avgProfit: number;
}

/**
 * Calculate key analytics metrics
 */
export function calculateMetrics(books: BookData[]): AnalyticsMetrics {
  const profitable = books.filter(b => (b.profit || 0) > 0);
  const profits = books.map(b => b.profit || 0);
  const totalProfit = profits.reduce((sum, p) => sum + p, 0);

  return {
    totalScans: books.length,
    profitableBooks: profitable.length,
    totalProfit,
    averageProfit: books.length > 0 ? totalProfit / books.length : 0,
    bestProfit: profits.length > 0 ? Math.max(...profits) : 0,
    worstProfit: profits.length > 0 ? Math.min(...profits) : 0,
    profitabilityRate: books.length > 0 ? (profitable.length / books.length) * 100 : 0,
  };
}

/**
 * Group books by date for time series analysis
 */
export function groupByDate(books: BookData[], days: number = 30): TimeSeriesData[] {
  const now = new Date();
  const dateMap = new Map<string, { scans: number; profit: number }>();

  // Initialize last N days
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dateMap.set(dateKey, { scans: 0, profit: 0 });
  }

  // Aggregate data
  books.forEach(book => {
    if (!book.createdAt) return; // Skip books without dates

    const date = new Date(book.createdAt);

    // Validate date
    if (isNaN(date.getTime())) return; // Skip invalid dates

    const dateKey = date.toISOString().split('T')[0];

    if (dateMap.has(dateKey)) {
      const existing = dateMap.get(dateKey)!;
      existing.scans += 1;
      existing.profit += book.profit || 0;
    }
  });

  // Convert to array and sort by date
  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      scans: data.scans,
      profit: data.profit,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top performing books by profit
 */
export function getTopBooks(books: BookData[], limit: number = 10): BookData[] {
  return [...books]
    .filter(b => (b.profit || 0) > 0)
    .sort((a, b) => (b.profit || 0) - (a.profit || 0))
    .slice(0, limit);
}

/**
 * Get worst performing books by profit
 */
export function getWorstBooks(books: BookData[], limit: number = 10): BookData[] {
  return [...books]
    .filter(b => (b.profit || 0) < 0)
    .sort((a, b) => (a.profit || 0) - (b.profit || 0))
    .slice(0, limit);
}

/**
 * Calculate profit distribution
 */
export function getProfitDistribution(books: BookData[]): {
  veryProfitable: number;
  profitable: number;
  breakEven: number;
  loss: number;
} {
  let veryProfitable = 0; // > £5
  let profitable = 0; // £0.01 - £5
  let breakEven = 0; // £0
  let loss = 0; // < £0

  books.forEach(book => {
    const profit = book.profit || 0;
    if (profit > 5) veryProfitable++;
    else if (profit > 0) profitable++;
    else if (profit === 0) breakEven++;
    else loss++;
  });

  return { veryProfitable, profitable, breakEven, loss };
}

/**
 * Get scanning trends (increasing/decreasing)
 */
export function getScanningTrend(timeSeriesData: TimeSeriesData[]): {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
} {
  if (timeSeriesData.length < 2) {
    return { trend: 'stable', percentage: 0 };
  }

  const midpoint = Math.floor(timeSeriesData.length / 2);
  const firstHalf = timeSeriesData.slice(0, midpoint);
  const secondHalf = timeSeriesData.slice(midpoint);

  const firstHalfTotal = firstHalf.reduce((sum, d) => sum + d.scans, 0);
  const secondHalfTotal = secondHalf.reduce((sum, d) => sum + d.scans, 0);

  const firstHalfAvg = firstHalfTotal / firstHalf.length;
  const secondHalfAvg = secondHalfTotal / secondHalf.length;

  if (firstHalfAvg === 0) {
    return { trend: 'increasing', percentage: 100 };
  }

  const change = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  if (change > 10) return { trend: 'increasing', percentage: change };
  if (change < -10) return { trend: 'decreasing', percentage: Math.abs(change) };
  return { trend: 'stable', percentage: Math.abs(change) };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Calculate ROI (Return on Investment)
 */
export function calculateROI(books: BookData[]): number {
  const totalCost = books.reduce((sum, b) => sum + (b.yourCost || 0), 0);
  const totalRevenue = books.reduce((sum, b) => {
    const salePrice = b.ebayPrice || b.amazonPrice || 0;
    return sum + salePrice;
  }, 0);

  if (totalCost === 0) return 0;
  return ((totalRevenue - totalCost) / totalCost) * 100;
}

/**
 * Get books scanned in specific date range
 */
export function filterByDateRange(
  books: BookData[],
  startDate: Date,
  endDate: Date
): BookData[] {
  return books.filter(book => {
    if (!book.createdAt) return false;
    const bookDate = new Date(book.createdAt);
    if (isNaN(bookDate.getTime())) return false;
    return bookDate >= startDate && bookDate <= endDate;
  });
}

/**
 * Get quick stats for a specific time period
 */
export function getQuickStats(books: BookData[], days: number) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const periodBooks = books.filter(b => {
    if (!b.createdAt) return false;
    const bookDate = new Date(b.createdAt);
    if (isNaN(bookDate.getTime())) return false;
    return bookDate >= cutoffDate;
  });
  return calculateMetrics(periodBooks);
}
