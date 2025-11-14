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
   */
  calculateVelocity(salesRank: number, category: string = 'Books'): VelocityAnalysis {
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
   */
  shouldBuy(
    velocity: VelocityRating,
    profit: number,
    profitMargin: number,
    yourCost: number
  ): {
    recommendation: 'strong_buy' | 'buy' | 'maybe' | 'skip';
    reason: string;
    score: number; // 0-100
  } {
    // Calculate velocity score (0-50 points)
    let velocityScore = 0;
    switch (velocity) {
      case 'very_fast': velocityScore = 50; break;
      case 'fast': velocityScore = 40; break;
      case 'medium': velocityScore = 25; break;
      case 'slow': velocityScore = 10; break;
      case 'very_slow': velocityScore = 0; break;
    }

    // Calculate profit score (0-50 points)
    let profitScore = 0;
    if (profitMargin >= 100) profitScore = 50; // 100%+ margin
    else if (profitMargin >= 50) profitScore = 40; // 50-100% margin
    else if (profitMargin >= 30) profitScore = 30; // 30-50% margin
    else if (profitMargin >= 20) profitScore = 20; // 20-30% margin
    else if (profitMargin >= 10) profitScore = 10; // 10-20% margin
    else profitScore = 0; // <10% margin

    const totalScore = velocityScore + profitScore;

    // Determine recommendation
    let recommendation: 'strong_buy' | 'buy' | 'maybe' | 'skip';
    let reason: string;

    if (totalScore >= 70) {
      recommendation = 'strong_buy';
      reason = 'Fast sales + great profit - this is a winner!';
    } else if (totalScore >= 50) {
      recommendation = 'buy';
      reason = 'Good profit and decent velocity - solid buy';
    } else if (totalScore >= 30) {
      recommendation = 'maybe';
      if (velocityScore < 15) {
        reason = 'Slow seller - only if profit is exceptional';
      } else {
        reason = 'Low profit margin - need faster sales';
      }
    } else {
      recommendation = 'skip';
      if (profit < 5) {
        reason = 'Profit too low to be worth the effort';
      } else if (velocity === 'very_slow' || velocity === 'slow') {
        reason = 'Too slow to sell - cash will be tied up';
      } else {
        reason = 'Poor combination of profit and velocity';
      }
    }

    return { recommendation, reason, score: totalScore };
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
