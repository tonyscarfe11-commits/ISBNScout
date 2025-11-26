/**
 * eBay Browse API Service
 *
 * Provides pricing data using eBay Browse API (RESTful)
 * Migrated from deprecated Finding API (decommissioned Feb 2025)
 *
 * Uses OAuth 2.0 Client Credentials flow
 * API Keys required from: https://developer.ebay.com/
 *
 * This service is READ-ONLY - searches active listings only
 * Note: Sold/completed listings no longer available via public API
 */

export interface EbayPriceData {
  isbn: string;
  currentPrice?: number;
  averagePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  soldCount?: number; // Always 0 - kept for backwards compatibility
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

interface OAuthToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number; // Timestamp when token expires
}

import type { SQLiteStorage } from "./sqlite-storage";

export class EbayPricingService {
  private clientId: string;
  private clientSecret: string;
  private isSandbox: boolean;
  private storage?: SQLiteStorage;

  // OAuth token cache
  private cachedToken: OAuthToken | null = null;

  // API endpoints
  private oauthUrl: string;
  private browseUrl: string;

  constructor(clientId?: string, clientSecret?: string, storage?: SQLiteStorage) {
    this.clientId = clientId || process.env.EBAY_APP_ID || "";
    this.clientSecret = clientSecret || process.env.EBAY_CERT_ID || "";
    this.isSandbox = process.env.EBAY_SANDBOX === "true";
    this.storage = storage;

    // Set endpoints based on environment
    if (this.isSandbox) {
      this.oauthUrl = "https://api.sandbox.ebay.com/identity/v1/oauth2/token";
      this.browseUrl = "https://api.sandbox.ebay.com/buy/browse/v1";
    } else {
      this.oauthUrl = "https://api.ebay.com/identity/v1/oauth2/token";
      this.browseUrl = "https://api.ebay.com/buy/browse/v1";
    }

    console.log("[eBay] Initialized Browse API with Client ID:", this.clientId ? this.clientId.substring(0, 15) + "..." : "MISSING");
  }

  /**
   * Get OAuth 2.0 access token using client credentials flow
   * Tokens are cached for 2 hours (expires_in: 7200 seconds)
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 5 minute buffer)
    if (this.cachedToken && Date.now() < this.cachedToken.expires_at - 300000) {
      return this.cachedToken.access_token;
    }

    try {
      // Create Basic auth header: Base64(clientId:clientSecret)
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await fetch(this.oauthUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OAuth failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Cache the token with expiration timestamp
      this.cachedToken = {
        access_token: data.access_token,
        expires_in: data.expires_in,
        token_type: data.token_type,
        expires_at: Date.now() + (data.expires_in * 1000),
      };

      console.log("[eBay] OAuth token acquired, expires in", data.expires_in, "seconds");

      return this.cachedToken.access_token;
    } catch (error: any) {
      console.error("[eBay] OAuth error:", error);
      throw new Error(`Failed to get eBay OAuth token: ${error.message}`);
    }
  }

  /**
   * Get pricing data for a book by ISBN
   * Searches active listings only (sold data no longer available)
   */
  async getPriceByISBN(isbn: string): Promise<EbayPriceData | null> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "eBay credentials not configured. Set EBAY_APP_ID and EBAY_CERT_ID environment variables."
      );
    }

    try {
      // Clean ISBN
      const cleanIsbn = isbn.replace(/[-\s]/g, "");

      // Get access token
      const accessToken = await this.getAccessToken();

      // Search active listings using Browse API
      const searchResults = await this.searchActiveListings(cleanIsbn, accessToken);

      if (!searchResults || searchResults.length === 0) {
        return null;
      }

      // Process results
      const allPrices: number[] = [];
      const activeListings: EbayListing[] = [];

      searchResults.forEach((item: any) => {
        const price = parseFloat(item.price?.value || "0");
        if (price > 0) {
          allPrices.push(price);
          activeListings.push({
            title: item.title || "",
            price,
            condition: item.condition || "Unknown",
            listingUrl: item.itemWebUrl || "",
            seller: item.seller?.username || "",
            location: item.itemLocation?.country || "",
            shipping: parseFloat(item.shippingOptions?.[0]?.shippingCost?.value || "0"),
          });
        }
      });

      if (allPrices.length === 0) {
        return null;
      }

      // Calculate statistics from active listings
      const sortedPrices = allPrices.sort((a, b) => a - b);
      const averagePrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;

      return {
        isbn: cleanIsbn,
        currentPrice: activeListings.length > 0 ? activeListings[0].price : undefined,
        averagePrice,
        minPrice: sortedPrices[0],
        maxPrice: sortedPrices[sortedPrices.length - 1],
        soldCount: 0, // No longer available in Browse API
        activeListings: searchResults.length,
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
   * Search active listings on eBay UK using Browse API
   */
  private async searchActiveListings(isbn: string, accessToken: string): Promise<any[]> {
    try {
      // Build Browse API search URL
      const url = new URL(`${this.browseUrl}/item_summary/search`);
      url.searchParams.append('q', isbn);
      url.searchParams.append('category_ids', '267'); // Books category
      url.searchParams.append('limit', '50'); // Max results per page
      url.searchParams.append('sort', 'price'); // Sort by lowest price

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB', // UK marketplace
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`eBay Browse API error: ${response.status} - ${errorText}`);
      }

      // Track API usage
      if (this.storage) {
        this.storage.incrementApiCall('ebay');
      }

      const data = await response.json();

      // Check for errors
      if (data.errors) {
        const error = data.errors[0];
        console.error(`⚠️  eBay API error: ${error.errorId} - ${error.message}`);
        return [];
      }

      return data.itemSummaries || [];
    } catch (error) {
      console.error("eBay active listings search failed:", error);
      return [];
    }
  }


  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.clientId.length > 0 && this.clientSecret.length > 0;
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo(): string {
    return "5,000 requests per day (eBay Browse API - FREE)";
  }

  /**
   * Search for books by title (for future use)
   */
  async searchByTitle(title: string, limit: number = 10): Promise<EbayListing[]> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("eBay credentials not configured");
    }

    try {
      // Get access token
      const accessToken = await this.getAccessToken();

      // Build Browse API search URL
      const url = new URL(`${this.browseUrl}/item_summary/search`);
      url.searchParams.append('q', title);
      url.searchParams.append('category_ids', '267'); // Books category
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_GB',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`eBay API error: ${response.status}`);
      }

      // Track API usage
      if (this.storage) {
        this.storage.incrementApiCall('ebay');
      }

      const data = await response.json();
      const items = data.itemSummaries || [];

      return items.map((item: any) => ({
        title: item.title || "",
        price: parseFloat(item.price?.value || "0"),
        condition: item.condition || "Unknown",
        listingUrl: item.itemWebUrl || "",
        seller: item.seller?.username || "",
        location: item.itemLocation?.country || "",
        shipping: parseFloat(item.shippingOptions?.[0]?.shippingCost?.value || "0"),
      }));
    } catch (error: any) {
      console.error("eBay title search failed:", error);
      throw error;
    }
  }
}

// Import storage for tracking (imported at the end to avoid circular dependency)
import { storage } from "./storage";

// Export singleton instance
export const ebayPricingService = new EbayPricingService(undefined, undefined, storage as any);
