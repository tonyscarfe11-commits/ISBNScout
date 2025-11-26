/**
 * Amazon Product Advertising API Service
 *
 * Fetches pricing data from Amazon UK marketplace
 * Requires Amazon Associates account and API credentials
 *
 * Setup: https://affiliate-program.amazon.co.uk/
 * API Docs: https://webservices.amazon.com/paapi5/documentation/
 */

export interface AmazonPriceData {
  isbn: string;
  asin?: string;
  price?: number;
  listPrice?: number; // Original/list price
  lowestPrice?: number;
  currency: string;
  availability?: string;
  productUrl?: string;
  lastUpdated: Date;
}

export class AmazonPricingService {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  private marketplace: string;

  constructor(accessKey?: string, secretKey?: string, partnerTag?: string) {
    this.accessKey = accessKey || process.env.AMAZON_ACCESS_KEY || '';
    this.secretKey = secretKey || process.env.AMAZON_SECRET_KEY || '';
    this.partnerTag = partnerTag || process.env.AMAZON_PARTNER_TAG || '';
    this.marketplace = 'www.amazon.co.uk'; // UK marketplace

    console.log('[Amazon PA-API] Initialized:', this.accessKey ? 'Credentials found' : 'No credentials');
  }

  /**
   * Get pricing data for a book by ISBN
   */
  async getPriceByISBN(isbn: string): Promise<AmazonPriceData | null> {
    if (!this.accessKey || !this.secretKey || !this.partnerTag) {
      console.log('[Amazon PA-API] Not configured - skipping Amazon price lookup');
      return null;
    }

    try {
      // Dynamically import amazon-paapi (ESM module)
      const { default: amazonPaapi } = await import('amazon-paapi');

      // Clean ISBN
      const cleanIsbn = isbn.replace(/[-\s]/g, '');

      // Search for the book using ISBN
      const requestParameters = {
        Keywords: cleanIsbn,
        SearchIndex: 'Books',
        ItemCount: 1,
        Resources: [
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Offers.Listings.Availability.Message',
          'ItemInfo.ExternalIds'
        ]
      };

      const response = await amazonPaapi.SearchItems(
        this.accessKey,
        this.secretKey,
        this.partnerTag,
        this.marketplace,
        requestParameters
      );

      if (!response.SearchResult?.Items || response.SearchResult.Items.length === 0) {
        console.log(`[Amazon PA-API] No results found for ISBN ${cleanIsbn}`);
        return null;
      }

      const item = response.SearchResult.Items[0];
      const offer = item.Offers?.Listings?.[0];

      // Extract pricing
      let price: number | undefined;
      let listPrice: number | undefined;

      if (offer?.Price?.Amount) {
        price = offer.Price.Amount;
      }

      if (offer?.SavingBasis?.Amount) {
        listPrice = offer.SavingBasis.Amount;
      }

      const result: AmazonPriceData = {
        isbn: cleanIsbn,
        asin: item.ASIN,
        price,
        listPrice,
        lowestPrice: price, // For now, same as current price
        currency: offer?.Price?.Currency || 'GBP',
        availability: offer?.Availability?.Message,
        productUrl: item.DetailPageURL,
        lastUpdated: new Date(),
      };

      console.log(`[Amazon PA-API] Found price for ${cleanIsbn}: £${price || 'N/A'}`);
      return result;

    } catch (error: any) {
      console.error('[Amazon PA-API] Error:', error.message);

      // Handle rate limiting
      if (error.message?.includes('RequestThrottled')) {
        console.log('[Amazon PA-API] Rate limited - please wait before retrying');
      }

      return null;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.accessKey.length > 0 &&
           this.secretKey.length > 0 &&
           this.partnerTag.length > 0;
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo(): string {
    return 'Amazon PA-API: 1 request per second, 8,640 requests per day';
  }
}

// Export singleton instance
export const amazonPricingService = new AmazonPricingService();
