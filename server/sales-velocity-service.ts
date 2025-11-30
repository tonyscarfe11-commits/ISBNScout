/**
 * Sales Velocity Service
 * Estimates how quickly books sell based on Amazon Best Sellers Rank (BSR)
 * 
 * Based on industry research and real seller data
 */

export type VelocityRating = 'very_fast' | 'fast' | 'medium' | 'slow' | 'very_slow' | 'unknown';

export interface SalesVelocity {
  rating: VelocityRating;
  estimatedSalesPerMonth: string;
  confidence: 'high' | 'medium' | 'low';
  description: string;
  buyRecommendation: 'strong_buy' | 'buy' | 'maybe' | 'skip';
}

export interface VelocityAnalysis {
  velocity: SalesVelocity;
  rankCategory: string;
  competitiveLevel: 'low' | 'medium' | 'high';
}

export class SalesVelocityService {
  /**
   * Calculate sales velocity based on Amazon BSR
   * Lower rank = faster sales
   * Optional: Pass profit data to get smarter buy recommendations
   */
  calculateVelocity(
    salesRank: number,
    category: string = 'Books',
    profitData?: {
      profit: number;
      profitMargin: number;
      purchaseCost: number;
    }
  ): VelocityAnalysis {
    // Books category has different thresholds than other categories
    const isBooks = category.toLowerCase().includes('book');
    
    let velocity: SalesVelocity;
    let rankCategory: string;
    let competitiveLevel: 'low' | 'medium' | 'high';

    if (isBooks) {
      // Books-specific thresholds (Books category has millions of items)
      if (salesRank <= 5000) {
        velocity = {
          rating: 'very_fast',
          estimatedSalesPerMonth: '30-100+',
          confidence: 'high',
          description: 'Bestseller - sells multiple times daily',
          buyRecommendation: 'strong_buy'
        };
        rankCategory = 'Bestseller';
        competitiveLevel = 'high';
      } else if (salesRank <= 50000) {
        velocity = {
          rating: 'fast',
          estimatedSalesPerMonth: '10-30',
          confidence: 'high',
          description: 'Hot seller - sells daily to weekly',
          buyRecommendation: 'strong_buy'
        };
        rankCategory = 'Hot Seller';
        competitiveLevel = 'medium';
      } else if (salesRank <= 200000) {
        velocity = {
          rating: 'medium',
          estimatedSalesPerMonth: '3-10',
          confidence: 'medium',
          description: 'Steady mover - sells weekly to bi-weekly',
          buyRecommendation: 'buy'
        };
        rankCategory = 'Steady Seller';
        competitiveLevel = 'medium';
      } else if (salesRank <= 500000) {
        velocity = {
          rating: 'slow',
          estimatedSalesPerMonth: '1-3',
          confidence: 'medium',
          description: 'Slow mover - sells monthly',
          buyRecommendation: 'maybe'
        };
        rankCategory = 'Slow Mover';
        competitiveLevel = 'low';
      } else if (salesRank <= 1000000) {
        velocity = {
          rating: 'very_slow',
          estimatedSalesPerMonth: '0-1',
          confidence: 'low',
          description: 'Very slow - may take months to sell',
          buyRecommendation: 'skip'
        };
        rankCategory = 'Very Slow';
        competitiveLevel = 'low';
      } else {
        velocity = {
          rating: 'very_slow',
          estimatedSalesPerMonth: '<1',
          confidence: 'low',
          description: 'Rarely sells - high risk',
          buyRecommendation: 'skip'
        };
        rankCategory = 'Dead Stock';
        competitiveLevel = 'low';
      }
    } else {
      // Other categories have fewer items, different thresholds
      if (salesRank <= 1000) {
        velocity = {
          rating: 'very_fast',
          estimatedSalesPerMonth: '50-200+',
          confidence: 'high',
          description: 'Top seller - sells multiple times daily',
          buyRecommendation: 'strong_buy'
        };
        rankCategory = 'Top Seller';
        competitiveLevel = 'high';
      } else if (salesRank <= 10000) {
        velocity = {
          rating: 'fast',
          estimatedSalesPerMonth: '15-50',
          confidence: 'high',
          description: 'Fast mover - sells daily',
          buyRecommendation: 'strong_buy'
        };
        rankCategory = 'Fast Mover';
        competitiveLevel = 'medium';
      } else if (salesRank <= 50000) {
        velocity = {
          rating: 'medium',
          estimatedSalesPerMonth: '5-15',
          confidence: 'medium',
          description: 'Moderate seller - sells weekly',
          buyRecommendation: 'buy'
        };
        rankCategory = 'Moderate Seller';
        competitiveLevel = 'medium';
      } else if (salesRank <= 100000) {
        velocity = {
          rating: 'slow',
          estimatedSalesPerMonth: '1-5',
          confidence: 'medium',
          description: 'Slow seller - sells bi-weekly to monthly',
          buyRecommendation: 'maybe'
        };
        rankCategory = 'Slow Seller';
        competitiveLevel = 'low';
      } else {
        velocity = {
          rating: 'very_slow',
          estimatedSalesPerMonth: '<1',
          confidence: 'low',
          description: 'Very rare sales - avoid',
          buyRecommendation: 'skip'
        };
        rankCategory = 'Very Slow';
        competitiveLevel = 'low';
      }
    }

    // If profit data is provided, use smart recommendation logic
    if (profitData) {
      const smartRecommendation = this.shouldBuy(
        velocity.rating,
        profitData.profit,
        profitData.profitMargin,
        profitData.purchaseCost
      );

      // Override the velocity-only recommendation with profit-aware one
      velocity = {
        ...velocity,
        buyRecommendation: smartRecommendation.recommendation,
        description: `${velocity.description} - ${smartRecommendation.reason}`
      };
    }

    return {
      velocity,
      rankCategory,
      competitiveLevel
    };
  }

  /**
   * Calculate expected time to sell based on velocity
   */
  getTimeToSell(velocity: VelocityRating): string {
    switch (velocity) {
      case 'very_fast':
        return '1-7 days';
      case 'fast':
        return '1-2 weeks';
      case 'medium':
        return '2-4 weeks';
      case 'slow':
        return '1-3 months';
      case 'very_slow':
        return '3+ months';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get color for velocity rating (for UI)
   */
  getVelocityColor(velocity: VelocityRating): string {
    switch (velocity) {
      case 'very_fast':
        return 'green';
      case 'fast':
        return 'lime';
      case 'medium':
        return 'yellow';
      case 'slow':
        return 'orange';
      case 'very_slow':
        return 'red';
      default:
        return 'gray';
    }
  }

  /**
   * Get emoji for velocity rating
   */
  getVelocityEmoji(velocity: VelocityRating): string {
    switch (velocity) {
      case 'very_fast':
        return '🚀';
      case 'fast':
        return '⚡';
      case 'medium':
        return '📈';
      case 'slow':
        return '🐌';
      case 'very_slow':
        return '💤';
      default:
        return '❓';
    }
  }

  /**
   * Determine if a book is worth buying based on velocity and profit
   * Simple rules - no confusing points system
   */
  shouldBuy(
    velocity: VelocityRating,
    profit: number,
    profitMargin: number,
    yourCost: number
  ): {
    recommendation: 'strong_buy' | 'buy' | 'maybe' | 'skip';
    reason: string;
    score: number;
  } {
    let recommendation: 'strong_buy' | 'buy' | 'maybe' | 'skip';
    let reason: string;

    // Rule 1: Skip if profit is negative or too low (less than £3)
    if (profit < 3) {
      return {
        recommendation: 'skip',
        reason: profit < 0 ? 'Losing money on this book' : 'Profit too low - not worth the effort',
        score: 0
      };
    }

    // Rule 2: Skip if very slow velocity (will take months to sell)
    if (velocity === 'very_slow') {
      return {
        recommendation: 'skip',
        reason: 'Takes too long to sell - cash will be tied up',
        score: 10
      };
    }

    // Rule 3: Strong Buy = Fast sales + Good profit (£5+)
    if ((velocity === 'very_fast' || velocity === 'fast') && profit >= 5) {
      return {
        recommendation: 'strong_buy',
        reason: 'Sells fast with good profit!',
        score: 100
      };
    }

    // Rule 4: Buy = Medium velocity + Decent profit (£5+) OR Fast velocity + Okay profit (£3-5)
    if ((velocity === 'medium' && profit >= 5) || ((velocity === 'very_fast' || velocity === 'fast') && profit >= 3)) {
      return {
        recommendation: 'buy',
        reason: 'Decent profit and reasonable sales speed',
        score: 70
      };
    }

    // Rule 5: Maybe = Slow sales OR Low profit (£3-5)
    if (velocity === 'slow' || profit < 5) {
      return {
        recommendation: 'maybe',
        reason: velocity === 'slow' ? 'Slow to sell - consider if profit is high' : 'Low profit margin - only buy if sales are fast',
        score: 40
      };
    }

    // Rule 6: Default to Maybe for edge cases
    return {
      recommendation: 'maybe',
      reason: 'Borderline - use your judgment',
      score: 50
    };
  }

  /**
   * Format rank with proper thousands separators
   */
  formatRank(rank: number): string {
    return rank.toLocaleString();
  }
}

// Export singleton instance
export const salesVelocityService = new SalesVelocityService();
