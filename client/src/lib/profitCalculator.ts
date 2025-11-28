// Profit calculation utilities for book selling

import { calculateShippingCost, getCheapestShipping, type ShippingCarrier } from './shippingCalculator';

export type Platform = "amazon-fbm" | "ebay";

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
  shippingCost?: number; // Optional: override auto-calculated shipping
  packagingCost?: number;
  inboundShippingCost?: number;
  bookWeight?: number; // in kg, for shipping calculation
  shippingCarrier?: ShippingCarrier; // Optional: specify carrier
}

/**
 * Calculate detailed profit breakdown for a book sale
 */
export function calculateProfit(params: CalculateProfitParams): ProfitCalculation {
  const {
    platform,
    salePrice,
    purchaseCost,
    packagingCost = 0,
    inboundShippingCost = 0,
    bookWeight = 0.3, // Default: 300g paperback
    shippingCarrier = 'royal-mail-2nd',
  } = params;

  // Calculate dynamic shipping cost if not provided
  let shippingCost = params.shippingCost;
  if (shippingCost === undefined) {
    // Use dynamic shipping calculator for all platforms
    const shippingRate = calculateShippingCost(bookWeight, shippingCarrier);
    shippingCost = shippingRate.cost;
  }

  const fees = PLATFORM_FEES[platform];

  // Calculate commission
  const commissionFee = salePrice * fees.commission;

  // Calculate fulfillment fee
  const fulfillmentFee = fees.fulfillment;

  const storageFee = fees.storage;
  const closingFee = fees.closingFee;

  // All platforms handle their own shipping
  const actualShippingCost = shippingCost;
  const actualPackagingCost = packagingCost;
  const actualInboundShipping = 0; // Not applicable for FBM/eBay

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
  const platforms: Platform[] = ["amazon-fbm", "ebay"];

  const results: Partial<Record<Platform, ProfitCalculation>> = {};

  for (const platform of platforms) {
    results[platform] = calculateProfit({
      platform,
      salePrice,
      purchaseCost,
      bookWeight,
      // Dynamic shipping calculated automatically based on weight
      packagingCost: 0.50, // Standard packaging cost for all platforms
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

  let bestPlatform: Platform = "amazon-fbm";
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
