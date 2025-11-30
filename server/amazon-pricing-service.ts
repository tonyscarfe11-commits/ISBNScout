/**
 * Amazon Product Advertising API Service
 *
 * Fetches pricing data from Amazon UK marketplace
 * Requires Amazon Associates account and API credentials
 *
 * Setup: https://affiliate-program.amazon.co.uk/
 * API Docs: https://webservices.amazon.com/paapi5/documentation/
 */

import amazonPaapi from 'amazon-paapi';

export interface AmazonPriceData {
  isbn: string;
  asin?: string;
  title?: string;
  price?: number;
  lowestNewPrice?: number;
  lowestUsedPrice?: number;
  salesRank?: number;
  currency: string;
  availability?: string;
  productUrl?: string;
  imageUrl?: string;
  lastUpdated: Date;
}

export class AmazonPricingService {
  private commonParameters: any = null;
  private isConfiguredFlag: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const accessKey = process.env.AMAZON_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY;
    const partnerTag = process.env.AMAZON_PARTNER_TAG;

    if (accessKey && secretKey && partnerTag) {
      this.commonParameters = {
        AccessKey: accessKey,
        SecretKey: secretKey,
        PartnerTag: partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.co.uk', // UK marketplace for book scouting
      };
      this.isConfiguredFlag = true;
      console.log('[Amazon PA-API] Initialized for UK marketplace with Partner Tag:', partnerTag);
    } else {
      console.log('[Amazon PA-API] Not configured - missing credentials');
      const missing = [];
      if (!accessKey) missing.push('AMAZON_ACCESS_KEY');
      if (!secretKey) missing.push('AMAZON_SECRET_KEY');
      if (!partnerTag) missing.push('AMAZON_PARTNER_TAG');
      console.log('[Amazon PA-API] Missing:', missing.join(', '));
      this.isConfiguredFlag = false;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.isConfiguredFlag;
  }

  /**
   * Get pricing data for a book by ISBN
   */
  async getPriceByISBN(isbn: string): Promise<AmazonPriceData | null> {
    if (!this.isConfiguredFlag || !this.commonParameters) {
      console.log('[Amazon PA-API] Not configured - skipping Amazon price lookup');
      return null;
    }

    try {
      // Clean ISBN (remove hyphens and spaces)
      const cleanIsbn = isbn.replace(/[-\s]/g, '');

      const requestParameters = {
        Keywords: cleanIsbn,
        SearchIndex: 'Books',
        ItemCount: 5,
        Resources: [
          'Images.Primary.Medium',
          'ItemInfo.Title',
          'ItemInfo.ExternalIds',
          'Offers.Listings.Price',
          'Offers.Listings.Condition',
          'Offers.Summaries.LowestPrice',
          'BrowseNodeInfo.BrowseNodes.SalesRank',
        ],
      };

      console.log(`[Amazon PA-API] Searching for ISBN: ${cleanIsbn}`);
      const response = await amazonPaapi.SearchItems(this.commonParameters, requestParameters);

      if (!response?.SearchResult?.Items || response.SearchResult.Items.length === 0) {
        console.log(`[Amazon PA-API] No results found for ISBN: ${cleanIsbn}`);
        return null;
      }

      // Find the item that best matches our ISBN
      let matchedItem = null;
      for (const item of response.SearchResult.Items) {
        const externalIds = item.ItemInfo?.ExternalIds;
        const isbns = externalIds?.ISBNs?.DisplayValues || [];
        const eans = externalIds?.EANs?.DisplayValues || [];
        
        if (isbns.includes(cleanIsbn) || eans.includes(cleanIsbn)) {
          matchedItem = item;
          break;
        }
      }

      // If no exact ISBN match, use the first result
      if (!matchedItem) {
        matchedItem = response.SearchResult.Items[0];
        console.log(`[Amazon PA-API] No exact ISBN match, using first result: ${matchedItem.ASIN}`);
      }

      // Extract pricing information
      let lowestNewPrice: number | undefined;
      let lowestUsedPrice: number | undefined;
      let buyBoxPrice: number | undefined;

      // Check offer listings
      if (matchedItem.Offers?.Listings) {
        for (const listing of matchedItem.Offers.Listings) {
          const price = listing.Price?.Amount;
          const condition = listing.Condition?.Value;

          if (price) {
            if (condition === 'New') {
              if (!lowestNewPrice || price < lowestNewPrice) {
                lowestNewPrice = price;
              }
            } else if (condition === 'Used' || condition === 'Collectible') {
              if (!lowestUsedPrice || price < lowestUsedPrice) {
                lowestUsedPrice = price;
              }
            }
            // First listing price is typically the Buy Box
            if (!buyBoxPrice) {
              buyBoxPrice = price;
            }
          }
        }
      }

      // Check offer summaries for better lowest prices
      if (matchedItem.Offers?.Summaries) {
        for (const summary of matchedItem.Offers.Summaries) {
          const price = summary.LowestPrice?.Amount;
          const condition = summary.Condition?.Value;

          if (price) {
            if (condition === 'New' && (!lowestNewPrice || price < lowestNewPrice)) {
              lowestNewPrice = price;
            } else if ((condition === 'Used' || condition === 'Collectible') && 
                       (!lowestUsedPrice || price < lowestUsedPrice)) {
              lowestUsedPrice = price;
            }
          }
        }
      }

      // Extract sales rank
      let salesRank: number | undefined;
      if (matchedItem.BrowseNodeInfo?.BrowseNodes) {
        for (const node of matchedItem.BrowseNodeInfo.BrowseNodes) {
          if (node.SalesRank) {
            salesRank = node.SalesRank;
            break;
          }
        }
      }

      // Use the best available price
      const bestPrice = buyBoxPrice || lowestNewPrice || lowestUsedPrice;

      const result: AmazonPriceData = {
        isbn: cleanIsbn,
        asin: matchedItem.ASIN,
        title: matchedItem.ItemInfo?.Title?.DisplayValue,
        price: bestPrice,
        lowestNewPrice,
        lowestUsedPrice,
        salesRank,
        currency: 'GBP',
        productUrl: matchedItem.DetailPageURL,
        imageUrl: matchedItem.Images?.Primary?.Medium?.URL,
        lastUpdated: new Date(),
      };

      console.log(`[Amazon PA-API] Found for ${cleanIsbn}:`, {
        asin: result.asin,
        price: result.price ? `£${result.price.toFixed(2)}` : 'N/A',
        newPrice: result.lowestNewPrice ? `£${result.lowestNewPrice.toFixed(2)}` : 'N/A',
        usedPrice: result.lowestUsedPrice ? `£${result.lowestUsedPrice.toFixed(2)}` : 'N/A',
        salesRank: result.salesRank || 'N/A',
      });

      return result;

    } catch (error: any) {
      console.error('[Amazon PA-API] Error:', error.message || error);

      // Handle specific errors
      if (error.message?.includes('TooManyRequests') || error.message?.includes('RequestThrottled')) {
        console.log('[Amazon PA-API] Rate limited - please wait before retrying');
      } else if (error.message?.includes('InvalidParameterValue')) {
        console.log('[Amazon PA-API] Invalid ISBN format or not found in Amazon catalog');
      } else if (error.message?.includes('InvalidAssociate')) {
        console.log('[Amazon PA-API] Invalid Associate credentials - check your Partner Tag');
      }

      return null;
    }
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo(): string {
    return 'Amazon PA-API: 1 request per second, 8,640 requests per day (based on revenue)';
  }
}

// Singleton instance
let amazonPricingServiceInstance: AmazonPricingService | null = null;

export function getAmazonPricingService(): AmazonPricingService {
  if (!amazonPricingServiceInstance) {
    amazonPricingServiceInstance = new AmazonPricingService();
  }
  return amazonPricingServiceInstance;
}

// Re-initialize (useful after adding credentials)
export function reinitializeAmazonPricingService(): AmazonPricingService {
  amazonPricingServiceInstance = new AmazonPricingService();
  return amazonPricingServiceInstance;
}

// Legacy export for backwards compatibility
export const amazonPricingService = getAmazonPricingService();
