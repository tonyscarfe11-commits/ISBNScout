import SellingPartnerAPI from 'amazon-sp-api';

export interface AmazonCredentials {
  region: string;
  refresh_token: string;
  credentials: {
    SELLING_PARTNER_APP_CLIENT_ID: string;
    SELLING_PARTNER_APP_CLIENT_SECRET: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_SELLING_PARTNER_ROLE: string;
  };
}

export interface AmazonListingData {
  isbn: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  condition: string;
  conditionNote?: string;
  fulfillmentChannel?: 'MFN' | 'AFN'; // Merchant Fulfilled or Amazon Fulfilled (FBA)
}

export class AmazonService {
  private api: any = null;

  constructor(credentials: AmazonCredentials) {
    try {
      // Cast to any to bypass TypeScript constructor checking
      // The amazon-sp-api library has type definition issues
      this.api = new (SellingPartnerAPI as any)({
        region: credentials.region || 'eu', // Europe for UK marketplace
        refresh_token: credentials.refresh_token,
        credentials: credentials.credentials,
      });
    } catch (error) {
      console.error('Failed to initialize Amazon SP-API:', error);
      throw new Error('Invalid Amazon credentials');
    }
  }

  async createListing(listingData: AmazonListingData): Promise<{ listingId: string; success: boolean }> {
    if (!this.api) {
      throw new Error('Amazon SP-API not initialized');
    }

    try {
      // Map condition values to Amazon condition types
      const conditionMap: Record<string, string> = {
        'new': 'NewItem',
        'as-new': 'UsedLikeNew',
        'good': 'UsedGood',
        'acceptable': 'UsedAcceptable',
        'collectable': 'CollectibleLikeNew',  // Collectable items
      };

      const amazonCondition = conditionMap[listingData.condition] || 'UsedGood';
      const fulfillmentChannel = listingData.fulfillmentChannel || 'AFN'; // Default to FBA

      // Step 1: Create the catalog item association (if not already exists)
      // For books with ISBN, Amazon usually has the product in their catalog

      // Step 2: Create the listing using Listings Items API
      const listingPayload = {
        productType: 'BOOK',
        requirements: 'LISTING',
        attributes: {
          condition_type: [{ value: amazonCondition, marketplace_id: 'A1F83G8C2ARO7P' }], // UK marketplace
          merchant_suggested_asin: [{ value: await this.lookupASIN(listingData.isbn), marketplace_id: 'A1F83G8C2ARO7P' }],
          purchasable_offer: [{
            currency: 'GBP',
            our_price: [{ schedule: [{ value_with_tax: listingData.price }] }],
            marketplace_id: 'A1F83G8C2ARO7P',
          }],
          fulfillment_availability: [{
            fulfillment_channel_code: fulfillmentChannel,
            quantity: listingData.quantity,
            marketplace_id: 'A1F83G8C2ARO7P',
          }],
        },
      };

      if (listingData.conditionNote) {
        (listingPayload.attributes as any).condition_note = [{
          value: listingData.conditionNote,
          marketplace_id: 'A1F83G8C2ARO7P'
        }];
      }

      const response = await this.api.callAPI({
        operation: 'putListingsItem',
        endpoint: 'listingsItems',
        path: {
          sellerId: await this.getSellerId(),
          sku: listingData.sku,
        },
        body: listingPayload,
        options: {
          version: '2021-08-01',
        },
      });

      if (response.status === 'ACCEPTED' || response.status === 'SUCCESS') {
        return {
          listingId: listingData.sku,
          success: true,
        };
      } else {
        const errors = response.issues?.map((issue: any) => issue.message).join(', ');
        throw new Error(errors || 'Failed to create listing');
      }
    } catch (error: any) {
      console.error('Amazon listing creation failed:', error);
      throw new Error(error.message || 'Failed to create Amazon listing');
    }
  }

  private async lookupASIN(isbn: string): Promise<string> {
    try {
      // Use Catalog Items API to search for the book by ISBN
      const response = await this.api.callAPI({
        operation: 'searchCatalogItems',
        endpoint: 'catalog',
        query: {
          keywords: isbn,
          marketplaceIds: ['A1F83G8C2ARO7P'],
          includedData: ['identifiers'],
        },
        options: {
          version: '2022-04-01',
        },
      });

      if (response.items && response.items.length > 0) {
        return response.items[0].asin;
      }

      throw new Error('ASIN not found for ISBN');
    } catch (error) {
      console.error('ASIN lookup failed:', error);
      // Return the ISBN as fallback
      return isbn;
    }
  }

  private async getSellerId(): Promise<string> {
    try {
      // Get seller account info
      const response = await this.api.callAPI({
        operation: 'getMarketplaceParticipations',
        endpoint: 'sellers',
        options: {
          version: 'v1',
        },
      });

      if (response.payload && response.payload.length > 0) {
        return response.payload[0].sellerId;
      }

      throw new Error('Seller ID not found');
    } catch (error) {
      console.error('Failed to get seller ID:', error);
      throw new Error('Failed to retrieve seller information');
    }
  }

  async createFBAShipment(
    sku: string,
    quantity: number,
    shipFromAddress: any
  ): Promise<{ shipmentId: string; success: boolean }> {
    if (!this.api) {
      throw new Error('Amazon SP-API not initialized');
    }

    try {
      // Create inbound shipment plan for FBA
      const response = await this.api.callAPI({
        operation: 'createInboundShipmentPlan',
        endpoint: 'fba/inbound',
        body: {
          ShipFromAddress: shipFromAddress,
          InboundShipmentPlanRequestItems: [{
            SellerSKU: sku,
            Quantity: quantity,
          }],
          LabelPrepPreference: 'SELLER_LABEL',
        },
        options: {
          version: 'v0',
        },
      });

      if (response.payload?.InboundShipmentPlans?.[0]) {
        const plan = response.payload.InboundShipmentPlans[0];
        return {
          shipmentId: plan.ShipmentId,
          success: true,
        };
      }

      throw new Error('Failed to create FBA shipment plan');
    } catch (error: any) {
      console.error('FBA shipment creation failed:', error);
      throw new Error(error.message || 'Failed to create FBA shipment');
    }
  }
}
