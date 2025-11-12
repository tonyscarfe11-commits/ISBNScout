/**
 * Google Books API Service
 *
 * Provides ISBN lookup functionality using Google Books API
 * API Key required from: https://console.cloud.google.com/
 *
 * Free tier: 1,000 requests per day
 */

export interface GoogleBookData {
  isbn: string;
  title: string;
  author?: string;
  authors?: string[];
  thumbnail?: string;
  description?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  language?: string;
}

export class GoogleBooksService {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/books/v1/volumes";

  constructor(apiKey?: string) {
    // API key is optional - Google Books API works without it but has lower rate limits
    this.apiKey = apiKey || process.env.GOOGLE_BOOKS_API_KEY || "";
  }

  /**
   * Look up book information by ISBN
   * @param isbn - 10 or 13 digit ISBN
   * @returns Book data or null if not found
   */
  async lookupByISBN(isbn: string): Promise<GoogleBookData | null> {
    try {
      // Clean ISBN (remove dashes, spaces)
      const cleanIsbn = isbn.replace(/[-\s]/g, "");

      // Validate ISBN format
      if (!/^\d{10}(\d{3})?$/.test(cleanIsbn)) {
        throw new Error("Invalid ISBN format. Must be 10 or 13 digits.");
      }

      // Build URL with API key if available
      const url = new URL(this.baseUrl);
      url.searchParams.append("q", `isbn:${cleanIsbn}`);
      if (this.apiKey) {
        url.searchParams.append("key", this.apiKey);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Google Books API key is invalid or rate limit exceeded");
        }
        throw new Error(`Google Books API error: ${response.status}`);
      }

      const data = await response.json();

      // Check if any books were found
      if (!data.items || data.items.length === 0) {
        return null;
      }

      // Get the first result (most relevant)
      const book = data.items[0];
      const volumeInfo = book.volumeInfo;

      // Extract thumbnail (use smaller size for thumbnails)
      let thumbnail = volumeInfo.imageLinks?.thumbnail;
      if (thumbnail) {
        // Remove edge curl effect
        thumbnail = thumbnail.replace("&edge=curl", "");
        // Force small thumbnail by replacing zoom parameter
        thumbnail = thumbnail.replace(/zoom=\d+/, "zoom=1");
        // Use HTTPS
        thumbnail = thumbnail.replace("http://", "https://");
      }

      // Format authors (Google Books returns array)
      const author = volumeInfo.authors ? volumeInfo.authors[0] : undefined;

      return {
        isbn: cleanIsbn,
        title: volumeInfo.title || "Unknown Title",
        author,
        authors: volumeInfo.authors,
        thumbnail,
        description: volumeInfo.description,
        publisher: volumeInfo.publisher,
        publishedDate: volumeInfo.publishedDate,
        pageCount: volumeInfo.pageCount,
        categories: volumeInfo.categories,
        language: volumeInfo.language,
      };
    } catch (error: any) {
      console.error("Google Books API error:", error);
      throw error;
    }
  }

  /**
   * Search for books by title, author, or keywords
   * @param query - Search query
   * @param maxResults - Maximum number of results (default 10, max 40)
   * @returns Array of book data
   */
  async search(query: string, maxResults: number = 10): Promise<GoogleBookData[]> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append("q", query);
      url.searchParams.append("maxResults", Math.min(maxResults, 40).toString());
      if (this.apiKey) {
        url.searchParams.append("key", this.apiKey);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return [];
      }

      return data.items.map((book: any) => {
        const volumeInfo = book.volumeInfo;

        // Try to extract ISBN
        let isbn = "";
        if (volumeInfo.industryIdentifiers) {
          const isbn13 = volumeInfo.industryIdentifiers.find(
            (id: any) => id.type === "ISBN_13"
          );
          const isbn10 = volumeInfo.industryIdentifiers.find(
            (id: any) => id.type === "ISBN_10"
          );
          isbn = isbn13?.identifier || isbn10?.identifier || "";
        }

        let thumbnail = volumeInfo.imageLinks?.thumbnail;
        if (thumbnail) {
          thumbnail = thumbnail.replace("&edge=curl", "");
          thumbnail = thumbnail.replace(/zoom=\d+/, "zoom=1");
          thumbnail = thumbnail.replace("http://", "https://");
        }

        return {
          isbn,
          title: volumeInfo.title || "Unknown Title",
          author: volumeInfo.authors ? volumeInfo.authors[0] : undefined,
          authors: volumeInfo.authors,
          thumbnail,
          description: volumeInfo.description,
          publisher: volumeInfo.publisher,
          publishedDate: volumeInfo.publishedDate,
          pageCount: volumeInfo.pageCount,
          categories: volumeInfo.categories,
          language: volumeInfo.language,
        };
      });
    } catch (error: any) {
      console.error("Google Books search error:", error);
      throw error;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Get rate limit information
   * Note: Without API key = 100 requests per day
   *       With API key = 1,000 requests per day
   */
  getRateLimitInfo(): string {
    if (this.apiKey) {
      return "1,000 requests per day (with API key)";
    }
    return "100 requests per day (without API key - consider adding GOOGLE_BOOKS_API_KEY)";
  }
}

// Export singleton instance
export const googleBooksService = new GoogleBooksService();
