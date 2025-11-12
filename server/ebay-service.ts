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

  constructor(credentials: EbayCredentials) {
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
      throw new Error('Invalid eBay credentials');
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
}
