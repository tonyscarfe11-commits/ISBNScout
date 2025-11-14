import { type RepricingRule, type Listing, type InsertRepricingHistory } from "@shared/schema";
import { AmazonService } from "./amazon-service";
import { EbayService } from "./ebay-service";
import { storage } from "./storage";

export interface RepricingResult {
  listingId: string;
  oldPrice: number;
  newPrice: number;
  competitorPrice: number | null;
  reason: string;
  success: boolean;
  errorMessage?: string;
}

export class RepricingService {
  async repriceListing(
    listing: Listing,
    rule: RepricingRule,
    amazonService?: AmazonService,
    ebayService?: EbayService
  ): Promise<RepricingResult> {
    try {
      const currentPrice = parseFloat(listing.price);
      
      // Fetch current market price
      const competitorPrice = await this.fetchCompetitorPrice(
        listing,
        rule.platform === 'all' ? listing.platform : rule.platform,
        amazonService,
        ebayService
      );

      if (!competitorPrice) {
        return {
          listingId: listing.id,
          oldPrice: currentPrice,
          newPrice: currentPrice,
          competitorPrice: null,
          reason: 'No competitor price available',
          success: false,
          errorMessage: 'Could not fetch market price',
        };
      }

      // Calculate new price based on strategy
      const newPrice = this.calculateNewPrice(
        currentPrice,
        competitorPrice,
        rule
      );

      // Skip if price hasn't changed
      if (Math.abs(newPrice - currentPrice) < 0.01) {
        return {
          listingId: listing.id,
          oldPrice: currentPrice,
          newPrice: currentPrice,
          competitorPrice,
          reason: 'Price unchanged',
          success: true,
        };
      }

      // Update listing price via API
      const updateSuccess = await this.updateListingPrice(
        listing,
        newPrice,
        amazonService,
        ebayService
      );

      if (!updateSuccess) {
        return {
          listingId: listing.id,
          oldPrice: currentPrice,
          newPrice: currentPrice,
          competitorPrice,
          reason: 'API update failed',
          success: false,
          errorMessage: 'Failed to update listing on platform',
        };
      }

      // Update local database with new price
      await storage.updateListingPrice(listing.id, newPrice.toString());

      const reason = this.getRepricingReason(rule.strategy, competitorPrice, newPrice);

      return {
        listingId: listing.id,
        oldPrice: currentPrice,
        newPrice,
        competitorPrice,
        reason,
        success: true,
      };
    } catch (error) {
      console.error(`[RepricingService] Error repricing listing ${listing.id}:`, error);
      return {
        listingId: listing.id,
        oldPrice: parseFloat(listing.price),
        newPrice: parseFloat(listing.price),
        competitorPrice: null,
        reason: 'Error occurred',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async fetchCompetitorPrice(
    listing: Listing,
    platform: string,
    amazonService?: AmazonService,
    ebayService?: EbayService
  ): Promise<number | null> {
    try {
      // Get book ISBN from listing
      const book = await storage.getBookById(listing.bookId);
      if (!book || !book.isbn) {
        return null;
      }

      if (platform === 'amazon' && amazonService) {
        // Fetch current lowest price on Amazon
        const offers = await amazonService.getCompetitivePricing(book.isbn);
        return offers?.lowestPrice || null;
      } else if (platform === 'ebay' && ebayService) {
        // Fetch current lowest price on eBay
        const pricing = await ebayService.searchByISBN(book.isbn);
        return pricing?.lowestPrice || null;
      }

      return null;
    } catch (error) {
      console.error('[RepricingService] Error fetching competitor price:', error);
      return null;
    }
  }

  private calculateNewPrice(
    currentPrice: number,
    competitorPrice: number,
    rule: RepricingRule
  ): number {
    let newPrice = currentPrice;
    const minPrice = parseFloat(rule.minPrice);
    const maxPrice = parseFloat(rule.maxPrice);

    switch (rule.strategy) {
      case 'match_lowest':
        newPrice = competitorPrice;
        break;

      case 'beat_by_percent':
        if (rule.strategyValue) {
          const percent = parseFloat(rule.strategyValue);
          if (!isNaN(percent)) {
            newPrice = competitorPrice * (1 - percent / 100);
          } else {
            newPrice = competitorPrice;
          }
        } else {
          newPrice = competitorPrice;
        }
        break;

      case 'beat_by_amount':
        if (rule.strategyValue) {
          const amount = parseFloat(rule.strategyValue);
          if (!isNaN(amount)) {
            newPrice = competitorPrice - amount;
          } else {
            newPrice = competitorPrice;
          }
        } else {
          newPrice = competitorPrice;
        }
        break;

      case 'target_margin':
        // Keep current price - this strategy is for alerts, not repricing
        newPrice = currentPrice;
        break;
    }

    // Apply price bounds
    if (newPrice < minPrice) {
      newPrice = minPrice;
    }
    if (newPrice > maxPrice) {
      newPrice = maxPrice;
    }

    // Round to 2 decimals
    return Math.round(newPrice * 100) / 100;
  }

  private async updateListingPrice(
    listing: Listing,
    newPrice: number,
    amazonService?: AmazonService,
    ebayService?: EbayService
  ): Promise<boolean> {
    try {
      if (listing.platform === 'amazon' && amazonService && listing.platformListingId) {
        await amazonService.updateListingPrice(listing.platformListingId, newPrice);
        return true;
      } else if (listing.platform === 'ebay' && ebayService && listing.platformListingId) {
        await ebayService.updateListingPrice(listing.platformListingId, newPrice);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[RepricingService] Error updating listing price:', error);
      return false;
    }
  }

  private getRepricingReason(strategy: string, competitorPrice: number, newPrice: number): string {
    switch (strategy) {
      case 'match_lowest':
        return `Matched competitor price of £${competitorPrice.toFixed(2)}`;
      case 'beat_by_percent':
        return `Beat competitor price of £${competitorPrice.toFixed(2)}`;
      case 'beat_by_amount':
        return `Undercut competitor price of £${competitorPrice.toFixed(2)}`;
      default:
        return `Repriced to £${newPrice.toFixed(2)}`;
    }
  }

  async repriceAllActiveListings(userId: string): Promise<RepricingResult[]> {
    const results: RepricingResult[] = [];

    try {
      // Get all active listings for user
      const listings = await storage.getListings(userId);
      const activeListings = listings.filter(l => l.status === 'active');

      // Get user's API credentials
      const amazonCreds = await storage.getApiCredentials(userId, 'amazon');
      const ebayCreds = await storage.getApiCredentials(userId, 'ebay');

      let amazonService: AmazonService | undefined;
      let ebayService: EbayService | undefined;

      if (amazonCreds) {
        try {
          amazonService = new AmazonService(JSON.parse(amazonCreds.credentials as any));
        } catch (error) {
          console.error('[RepricingService] Failed to initialize Amazon service:', error);
        }
      }

      if (ebayCreds) {
        try {
          ebayService = new EbayService(JSON.parse(ebayCreds.credentials as any));
        } catch (error) {
          console.error('[RepricingService] Failed to initialize eBay service:', error);
        }
      }

      // Process each listing
      for (const listing of activeListings) {
        // Find applicable repricing rule
        const rules = await this.getActiveRulesForListing(userId, listing);
        
        if (rules.length === 0) {
          continue;
        }

        // Use first matching rule (most specific)
        const rule = rules[0];

        const result = await this.repriceListing(
          listing,
          rule,
          amazonService,
          ebayService
        );

        results.push(result);

        // Record in history
        await this.recordRepricingHistory(userId, listing.id, rule.id, result);

        // Update rule's lastRun timestamp
        await this.updateRuleLastRun(rule.id);
      }

      return results;
    } catch (error) {
      console.error('[RepricingService] Error in repriceAllActiveListings:', error);
      return results;
    }
  }

  private async getActiveRulesForListing(
    userId: string,
    listing: Listing
  ): Promise<RepricingRule[]> {
    return await storage.getActiveRulesForListing(userId, listing.id, listing.platform);
  }

  private async recordRepricingHistory(
    userId: string,
    listingId: string,
    ruleId: string,
    result: RepricingResult
  ): Promise<void> {
    const history: InsertRepricingHistory = {
      userId,
      listingId,
      ruleId,
      oldPrice: result.oldPrice.toString(),
      newPrice: result.newPrice.toString(),
      competitorPrice: result.competitorPrice?.toString() || null,
      reason: result.reason,
      success: result.success ? 'true' : 'false',
      errorMessage: result.errorMessage || null,
    };

    await storage.createRepricingHistory(history);
  }

  private async updateRuleLastRun(ruleId: string): Promise<void> {
    await storage.updateRepricingRule(ruleId, { lastRun: new Date() });
  }
}
