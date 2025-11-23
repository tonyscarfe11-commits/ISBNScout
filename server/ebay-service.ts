import eBayApi from 'ebay-api';

export interface EbayCredentials {
  appId: string;
  certId: string;
  devId: string;
  authToken?: string;
  sandbox?: boolean;
}

export interface EbayListingData {
  isbn: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  condition: string;
  imageUrls?: string[];
}

export class EbayService {
  private api: eBayApi | null = null;
  private appId: string;
  private sandbox: boolean;

  constructor(credentials: EbayCredentials) {
    // Store credentials for direct API calls
    this.appId = credentials.appId;
    this.sandbox = credentials.sandbox || false;

    try {
      this.api = new eBayApi({
        appId: credentials.appId,
        certId: credentials.certId,
        devId: credentials.devId,
        authToken: credentials.authToken,
        sandbox: credentials.sandbox || false,
      });
    } catch (error) {
      console.error('Failed to initialize eBay API:', error);
      // Don't throw - we can still use Finding API with just appId
      console.warn('[EbayService] eBay API library failed to init, but Finding API will still work');
    }
  }

  async createListing(listingData: EbayListingData): Promise<{ listingId: string; success: boolean }> {
    if (!this.api) {
      throw new Error('eBay API not initialized');
    }

    try {
      // Map condition values to eBay condition IDs
      const conditionMap: Record<string, number> = {
        'new': 1000,          // Brand New
        'as-new': 1500,       // Like New / Mint
        'good': 4000,         // Good
        'acceptable': 5000,   // Acceptable
        'collectable': 6000,  // For Collection Only
      };

      const conditionId = conditionMap[listingData.condition] || 4000;

      // Create the listing using Trading API
      const item = {
        Title: listingData.title,
        Description: listingData.description,
        PrimaryCategory: { CategoryID: '267' }, // Books category
        StartPrice: listingData.price,
        Quantity: listingData.quantity,
        ConditionID: conditionId,
        Country: 'GB',
        Currency: 'GBP',
        DispatchTimeMax: 3,
        ListingDuration: 'GTC', // Good 'Til Cancelled
        ListingType: 'FixedPriceItem',
        PaymentMethods: ['PayPal'],
        PayPalEmailAddress: 'seller@example.com', // This should come from settings
        PostalCode: 'SW1A 1AA', // This should come from settings
        ReturnPolicy: {
          ReturnsAcceptedOption: 'ReturnsAccepted',
          RefundOption: 'MoneyBack',
          ReturnsWithinOption: 'Days_30',
          ShippingCostPaidByOption: 'Buyer',
        },
        ShippingDetails: {
          ShippingType: 'Flat',
          ShippingServiceOptions: [{
            ShippingServicePriority: 1,
            ShippingService: 'UK_RoyalMailSecondClassStandard',
            ShippingServiceCost: 3.50,
          }],
        },
        // Add product identifiers
        ProductListingDetails: {
          ISBN: listingData.isbn,
          IncludeeBayProductDetails: true,
        },
      };

      if (listingData.imageUrls && listingData.imageUrls.length > 0) {
        (item as any).PictureDetails = {
          PictureURL: listingData.imageUrls,
        };
      }

      const response = await this.api.trading.AddFixedPriceItem(item);

      if (response.Ack === 'Success' || response.Ack === 'Warning') {
        return {
          listingId: response.ItemID || '',
          success: true,
        };
      } else {
        throw new Error(response.Errors?.[0]?.LongMessage || 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('eBay listing creation failed:', error);
      throw new Error(error.message || 'Failed to create eBay listing');
    }
  }

  async getAuthUrl(redirectUri: string): Promise<string> {
    if (!this.api) {
      throw new Error('eBay API not initialized');
    }

    try {
      // Generate OAuth consent URL
      // Type definitions for ebay-api may not be accurate, using 'as any' for flexibility
      return (this.api.oAuth2 as any).generateAuthUrl({
        scope: ['https://api.ebay.com/oauth/api_scope/sell.inventory'],
        prompt: 'login',
      });
    } catch (error) {
      console.error('Failed to generate auth URL:', error);
      throw new Error('Failed to generate eBay authorization URL');
    }
  }

  async exchangeCodeForToken(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.api) {
      throw new Error('eBay API not initialized');
    }

    try {
      const token = await (this.api.oAuth2 as any).getToken(code);
      return {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
      };
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      throw new Error('Failed to authenticate with eBay');
    }
  }

  async searchByISBN(isbn: string): Promise<{ lowestPrice: number | null; averagePrice: number | null }> {
    try {
      // Use Finding API directly with HTTP request (doesn't require OAuth!)
      // This is simpler and more reliable than using the ebay-api library
      const baseUrl = this.sandbox
        ? 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1'
        : 'https://svcs.ebay.com/services/search/FindingService/v1';

      const params = new URLSearchParams({
        'OPERATION-NAME': 'findItemsByProduct',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': this.appId,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'paginationInput.entriesPerPage': '20',
        'productId.@type': 'ISBN',
        'productId': isbn,
        'GLOBAL-ID': 'EBAY-GB', // UK marketplace
        'itemFilter(0).name': 'ListingType',
        'itemFilter(0).value': 'FixedPrice',
        'sortOrder': 'PricePlusShippingLowest',
      });

      const url = `${baseUrl}?${params.toString()}`;
      console.log(`[EbayService] Fetching prices for ISBN ${isbn}...`);

      const response = await fetch(url);
      const data = await response.json() as any;

      // Check for errors
      if (data.errorMessage) {
        const error = data.errorMessage[0]?.error?.[0];
        const errorId = error?.errorId?.[0];
        const errorMsg = error?.message?.[0];

        console.error(`[EbayService] eBay API error ${errorId}: ${errorMsg}`);

        // Handle rate limiting gracefully
        if (errorId === '10001') {
          console.warn('[EbayService] Rate limit reached - returning null');
          return { lowestPrice: null, averagePrice: null };
        }

        return { lowestPrice: null, averagePrice: null };
      }

      // Parse search results
      const searchResult = data.findItemsByProductResponse?.[0]?.searchResult?.[0];
      if (!searchResult || searchResult['@count'] === '0') {
        console.log(`[EbayService] No listings found for ISBN ${isbn}`);
        return { lowestPrice: null, averagePrice: null };
      }

      const items = searchResult.item || [];
      const prices: number[] = [];

      for (const item of items) {
        const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0');
        if (price > 0) {
          prices.push(price);
        }
      }

      if (prices.length > 0) {
        const lowestPrice = Math.min(...prices);
        const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        console.log(`[EbayService] Found ${prices.length} prices for ISBN ${isbn}: lowest £${lowestPrice.toFixed(2)}`);
        return { lowestPrice, averagePrice };
      }

      console.log(`[EbayService] No valid prices found for ISBN ${isbn}`);
      return { lowestPrice: null, averagePrice: null };
    } catch (error: any) {
      console.error('[EbayService] Error searching by ISBN:', error);
      return { lowestPrice: null, averagePrice: null };
    }
  }

  async updateListingPrice(itemId: string, newPrice: number): Promise<boolean> {
    if (!this.api) {
      throw new Error('eBay API not initialized');
    }

    try {
      const response = await this.api.trading.ReviseFixedPriceItem({
        Item: {
          ItemID: itemId,
          StartPrice: {
            value: newPrice,
            currencyID: 'GBP',
          },
        },
      });

      if (response.Ack === 'Success' || response.Ack === 'Warning') {
        console.log(`[EbayService] Successfully updated price for item ${itemId} to £${newPrice}`);
        return true;
      }

      console.error('[EbayService] Failed to update listing price:', response);
      return false;
    } catch (error) {
      console.error('[EbayService] Error updating listing price:', error);
      return false;
    }
  }
}
