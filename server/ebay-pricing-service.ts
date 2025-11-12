/**
 * eBay Finding API Service
 *
 * Provides pricing data using eBay Finding API
 * API Key required from: https://developer.ebay.com/
 *
 * Free tier: 5,000 requests per day
 * This service is READ-ONLY - no authentication needed for searching
 */

export interface EbayPriceData {
  isbn: string;
  currentPrice?: number;
  averagePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  soldCount?: number;
  activeListings?: number;
  currency: string;
  lastUpdated: Date;
  listings?: EbayListing[];
}

export interface EbayListing {
  title: string;
  price: number;
  condition: string;
  listingUrl: string;
  seller: string;
  location: string;
  shipping?: number;
}

export class EbayPricingService {
  private appId: string;
  private baseUrl = "https://svcs.ebay.com/services/search/FindingService/v1";

  constructor(appId?: string) {
    this.appId = appId || process.env.EBAY_APP_ID || "";
    console.log("[eBay] Initialized with App ID:", this.appId ? this.appId.substring(0, 15) + "..." : "MISSING");
  }

  /**
   * Get pricing data for a book by ISBN
   * Searches both active and sold listings
   */
  async getPriceByISBN(isbn: string): Promise<EbayPriceData | null> {
    if (!this.appId) {
      throw new Error(
        "eBay App ID not configured. Set EBAY_APP_ID environment variable."
      );
    }

    try {
      // Clean ISBN
      const cleanIsbn = isbn.replace(/[-\s]/g, "");

      // Search active listings and sold listings in parallel
      const [activeResults, soldResults] = await Promise.all([
        this.searchActiveListings(cleanIsbn),
        this.searchSoldListings(cleanIsbn),
      ]);

      // Combine results
      const allPrices: number[] = [];
      const activeListings: EbayListing[] = [];

      // Process active listings
      if (activeResults.length > 0) {
        activeResults.forEach((item) => {
          const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || "0");
          if (price > 0) {
            allPrices.push(price);
            activeListings.push({
              title: item.title?.[0] || "",
              price,
              condition: item.condition?.[0]?.conditionDisplayName?.[0] || "Unknown",
              listingUrl: item.viewItemURL?.[0] || "",
              seller: item.sellerInfo?.[0]?.sellerUserName?.[0] || "",
              location: item.location?.[0] || "",
              shipping: parseFloat(item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__ || "0"),
            });
          }
        });
      }

      // Process sold listings for average price
      if (soldResults.length > 0) {
        soldResults.forEach((item) => {
          const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || "0");
          if (price > 0) {
            allPrices.push(price);
          }
        });
      }

      if (allPrices.length === 0) {
        return null;
      }

      // Calculate statistics
      const sortedPrices = allPrices.sort((a, b) => a - b);
      const averagePrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

      return {
        isbn: cleanIsbn,
        currentPrice: activeListings.length > 0 ? activeListings[0].price : undefined,
        averagePrice,
        minPrice: sortedPrices[0],
        maxPrice: sortedPrices[sortedPrices.length - 1],
        soldCount: soldResults.length,
        activeListings: activeResults.length,
        currency: "GBP",
        lastUpdated: new Date(),
        listings: activeListings.slice(0, 5), // Return top 5 listings
      };
    } catch (error: any) {
      console.error("eBay pricing error:", error);
      throw error;
    }
  }

  /**
   * Search active listings on eBay UK
   */
  private async searchActiveListings(isbn: string): Promise<any[]> {
    try {
      const url = this.buildSearchUrl({
        keywords: isbn,
        itemFilter: [
          { name: "ListingType", value: "FixedPrice" },
          { name: "Condition", value: ["Used", "New"] },
        ],
        sortOrder: "PricePlusShippingLowest",
        paginationInput: { entriesPerPage: 20 },
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`eBay API error: ${response.status}`);
      }

      const text = await response.text();
      const data = this.parseXmlResponse(text);

      // Check for eBay API errors (they return 200 with error in JSON)
      if (data.errorMessage) {
        const error = data.errorMessage[0]?.error?.[0];
        const errorId = error?.errorId?.[0];
        const message = error?.message?.[0];

        if (errorId === "10001") {
          console.log("⚠️  eBay API rate limit exceeded (5,000/day). Using fallback data.");
          return [];
        }

        throw new Error(`eBay API error ${errorId}: ${message}`);
      }

      return data.findItemsAdvancedResponse?.[0]?.searchResult?.[0]?.item || [];
    } catch (error) {
      console.error("eBay active listings search failed:", error);
      return [];
    }
  }

  /**
   * Search sold listings on eBay UK (completed auctions)
   */
  private async searchSoldListings(isbn: string): Promise<any[]> {
    try {
      const url = this.buildSearchUrl({
        operation: "findCompletedItems",
        keywords: isbn,
        itemFilter: [
          { name: "SoldItemsOnly", value: "true" },
          { name: "Condition", value: ["Used", "New"] },
        ],
        sortOrder: "EndTimeSoonest",
        paginationInput: { entriesPerPage: 20 },
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`eBay API error: ${response.status}`);
      }

      const text = await response.text();
      const data = this.parseXmlResponse(text);

      // Check for eBay API errors (they return 200 with error in JSON)
      if (data.errorMessage) {
        const error = data.errorMessage[0]?.error?.[0];
        const errorId = error?.errorId?.[0];
        const message = error?.message?.[0];

        if (errorId === "10001") {
          console.log("⚠️  eBay API rate limit exceeded (5,000/day). Using fallback data.");
          return [];
        }

        throw new Error(`eBay API error ${errorId}: ${message}`);
      }

      return data.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];
    } catch (error) {
      console.error("eBay sold listings search failed:", error);
      return [];
    }
  }

  /**
   * Build eBay Finding API URL with parameters
   */
  private buildSearchUrl(params: {
    operation?: string;
    keywords: string;
    itemFilter?: Array<{ name: string; value: string | string[] }>;
    sortOrder?: string;
    paginationInput?: { entriesPerPage: number };
  }): string {
    const url = new URL(this.baseUrl);

    // Base parameters
    url.searchParams.append("OPERATION-NAME", params.operation || "findItemsAdvanced");
    url.searchParams.append("SERVICE-VERSION", "1.0.0");
    url.searchParams.append("SECURITY-APPNAME", this.appId);
    url.searchParams.append("RESPONSE-DATA-FORMAT", "JSON");
    url.searchParams.append("GLOBAL-ID", "EBAY-GB"); // UK site
    url.searchParams.append("keywords", params.keywords);

    // Category - Books (267)
    url.searchParams.append("categoryId", "267");

    // Sort order
    if (params.sortOrder) {
      url.searchParams.append("sortOrder", params.sortOrder);
    }

    // Pagination
    if (params.paginationInput) {
      url.searchParams.append(
        "paginationInput.entriesPerPage",
        params.paginationInput.entriesPerPage.toString()
      );
    }

    // Item filters
    if (params.itemFilter) {
      params.itemFilter.forEach((filter, index) => {
        url.searchParams.append(`itemFilter(${index}).name`, filter.name);
        if (Array.isArray(filter.value)) {
          filter.value.forEach((val, valIndex) => {
            url.searchParams.append(`itemFilter(${index}).value(${valIndex})`, val);
          });
        } else {
          url.searchParams.append(`itemFilter(${index}).value`, filter.value);
        }
      });
    }

    return url.toString();
  }

  /**
   * Parse XML response from eBay (they return JSON despite the name)
   */
  private parseXmlResponse(text: string): any {
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse eBay response:", error);
      throw new Error("Invalid response from eBay API");
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.appId.length > 0;
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo(): string {
    return "5,000 requests per day (eBay Finding API - FREE)";
  }

  /**
   * Search for books by title (for future use)
   */
  async searchByTitle(title: string, limit: number = 10): Promise<EbayListing[]> {
    if (!this.appId) {
      throw new Error("eBay App ID not configured");
    }

    try {
      const url = this.buildSearchUrl({
        keywords: title,
        itemFilter: [
          { name: "ListingType", value: "FixedPrice" },
        ],
        sortOrder: "BestMatch",
        paginationInput: { entriesPerPage: limit },
      });

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`eBay API error: ${response.status}`);
      }

      const text = await response.text();
      const data = this.parseXmlResponse(text);

      const items = data.findItemsAdvancedResponse?.[0]?.searchResult?.[0]?.item || [];

      return items.map((item: any) => ({
        title: item.title?.[0] || "",
        price: parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || "0"),
        condition: item.condition?.[0]?.conditionDisplayName?.[0] || "Unknown",
        listingUrl: item.viewItemURL?.[0] || "",
        seller: item.sellerInfo?.[0]?.sellerUserName?.[0] || "",
        location: item.location?.[0] || "",
        shipping: parseFloat(item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__ || "0"),
      }));
    } catch (error: any) {
      console.error("eBay title search failed:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const ebayPricingService = new EbayPricingService();
