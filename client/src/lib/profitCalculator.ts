// Profit calculation utilities for book selling

export type Platform = "amazon-fba" | "amazon-fbm" | "ebay";

export interface PlatformFees {
  name: string;
  commission: number;
  fulfillment: number;
  storage: number;
  closingFee: number;
  description: string;
}

export interface BookCondition {
  weight: number; // in kg
  isStandard: boolean; // standard vs oversized
}

export interface ProfitCalculation {
  salePrice: number;
  commissionFee: number;
  fulfillmentFee: number;
  storageFee: number;
  closingFee: number;
  totalFees: number;
  purchaseCost: number;
  shippingCost: number;
  packagingCost: number;
  inboundShippingCost: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
}

// Platform fee structures
export const PLATFORM_FEES: Record<Platform, PlatformFees> = {
  "amazon-fba": {
    name: "Amazon FBA",
    commission: 0.15, // 15%
    fulfillment: 2.50, // Base rate - will be calculated based on weight
    storage: 0.50,
    closingFee: 0,
    description: "15% commission + fulfillment + storage fees",
  },
  "amazon-fbm": {
    name: "Amazon FBM",
    commission: 0.15, // 15%
    fulfillment: 0,
    storage: 0,
    closingFee: 0,
    description: "15% commission only",
  },
  "ebay": {
    name: "eBay",
    commission: 0.128, // 12.8%
    fulfillment: 0,
    storage: 0,
    closingFee: 0.30,
    description: "12.8% commission + £0.30 per sale",
  },
};

/**
 * Calculate FBA fulfillment fee based on book weight
 * Amazon UK FBA fees for books (Media category)
 */
export function calculateFBAFulfillmentFee(weightKg: number): number {
  // Amazon UK FBA fees for Media (Books) - 2024 rates
  // Standard size books (most books)
  if (weightKg <= 0.25) return 1.99;
  if (weightKg <= 0.50) return 2.39;
  if (weightKg <= 1.00) return 2.79;
  if (weightKg <= 2.00) return 3.19;

  // Heavier books
  return 3.19 + ((weightKg - 2.0) * 0.40); // £0.40 per additional kg
}

/**
 * Estimate book weight based on typical book weights
 * Most paperbacks: 0.2-0.4kg
 * Most hardcovers: 0.5-0.8kg
 */
export function estimateBookWeight(isHardcover: boolean = false): number {
  return isHardcover ? 0.6 : 0.3; // kg
}

export interface CalculateProfitParams {
  platform: Platform;
  salePrice: number;
  purchaseCost: number;
  shippingCost?: number;
  packagingCost?: number;
  inboundShippingCost?: number;
  bookWeight?: number; // in kg, for FBA fee calculation
}

/**
 * Calculate detailed profit breakdown for a book sale
 */
export function calculateProfit(params: CalculateProfitParams): ProfitCalculation {
  const {
    platform,
    salePrice,
    purchaseCost,
    shippingCost = 0,
    packagingCost = 0,
    inboundShippingCost = 0,
    bookWeight = 0.3, // Default: 300g paperback
  } = params;

  const fees = PLATFORM_FEES[platform];

  // Calculate commission
  const commissionFee = salePrice * fees.commission;

  // Calculate fulfillment fee (weight-based for FBA)
  let fulfillmentFee = fees.fulfillment;
  if (platform === "amazon-fba") {
    fulfillmentFee = calculateFBAFulfillmentFee(bookWeight);
  }

  const storageFee = fees.storage;
  const closingFee = fees.closingFee;

  // For FBA, shipping and packaging to customer are included in fulfillment fee
  const actualShippingCost = platform === "amazon-fba" ? 0 : shippingCost;
  const actualPackagingCost = platform === "amazon-fba" ? 0 : packagingCost;

  // For FBA, add inbound shipping cost (sending to Amazon warehouse)
  const actualInboundShipping = platform === "amazon-fba" ? inboundShippingCost : 0;

  const totalFees = commissionFee + fulfillmentFee + storageFee + closingFee;
  const totalCosts = purchaseCost + actualShippingCost + actualPackagingCost + actualInboundShipping;
  const netProfit = salePrice - totalFees - totalCosts;
  const profitMargin = salePrice > 0 ? (netProfit / salePrice) * 100 : 0;
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

  return {
    salePrice,
    commissionFee,
    fulfillmentFee,
    storageFee,
    closingFee,
    totalFees,
    purchaseCost,
    shippingCost: actualShippingCost,
    packagingCost: actualPackagingCost,
    inboundShippingCost: actualInboundShipping,
    totalCosts,
    netProfit,
    profitMargin,
    roi,
  };
}

/**
 * Calculate profit for all platforms and return comparison
 */
export function calculateProfitAllPlatforms(
  salePrice: number,
  purchaseCost: number,
  bookWeight: number = 0.3
): Record<Platform, ProfitCalculation> {
  const platforms: Platform[] = ["amazon-fba", "amazon-fbm", "ebay"];

  const results: Partial<Record<Platform, ProfitCalculation>> = {};

  for (const platform of platforms) {
    results[platform] = calculateProfit({
      platform,
      salePrice,
      purchaseCost,
      bookWeight,
      shippingCost: platform !== "amazon-fba" ? 2.50 : 0, // Default Royal Mail 2nd class
      packagingCost: platform !== "amazon-fba" ? 0.50 : 0,
      inboundShippingCost: platform === "amazon-fba" ? 0.20 : 0,
    });
  }

  return results as Record<Platform, ProfitCalculation>;
}

/**
 * Get the best platform based on ROI
 */
export function getBestPlatform(
  salePrice: number,
  purchaseCost: number,
  bookWeight: number = 0.3
): { platform: Platform; calculation: ProfitCalculation } {
  const allCalculations = calculateProfitAllPlatforms(salePrice, purchaseCost, bookWeight);

  let bestPlatform: Platform = "amazon-fba";
  let bestROI = -Infinity;

  for (const [platform, calc] of Object.entries(allCalculations) as [Platform, ProfitCalculation][]) {
    if (calc.roi > bestROI) {
      bestROI = calc.roi;
      bestPlatform = platform;
    }
  }

  return {
    platform: bestPlatform,
    calculation: allCalculations[bestPlatform],
  };
}
