/**
 * Offline-aware pricing service
 *
 * Tries to get prices from:
 * 1. IndexedDB cache (instant, works offline)
 * 2. Server cache (/api/offline/lookup)
 * 3. Live API call (/api/books/lookup-pricing)
 *
 * All POST requests include CSRF token for security
 */

import { getOfflineDB, type PriceCacheRecord } from './offline-db';
import { getCsrfToken } from './csrf';

export interface PricingResult {
  isbn: string;
  title: string | null;
  author: string | null;
  publisher: string | null;
  thumbnail: string | null;
  ebayPrice: number | null;
  amazonPrice: number | null;
  lowestPrice: number | null;
  profit: number | null;
  source: 'cache' | 'server-cache' | 'api' | 'estimate';
  confidence: 'high' | 'medium' | 'low';
  cacheAge?: number; // hours
}

/**
 * Smart offline pricing estimation based on book metadata
 */
function estimatePrice(title?: string, author?: string, publisher?: string): number {
  let basePrice = 8.00; // Default UK book price

  // Adjust based on author popularity
  const profitableAuthors = [
    'j.k. rowling', 'stephen king', 'george r.r. martin', 'j.r.r. tolkien',
    'dan brown', 'james patterson', 'john grisham', 'lee child',
    'terry pratchett', 'neil gaiman', 'brandon sanderson',
  ];

  if (author) {
    const authorLower = author.toLowerCase();
    const isProfitableAuthor = profitableAuthors.some(a => authorLower.includes(a));
    if (isProfitableAuthor) {
      basePrice = 12.00;
    }
  }

  // Adjust based on publisher
  const premiumPublishers = ['penguin', 'vintage', 'harper', 'random house', 'bloomsbury'];
  if (publisher) {
    const publisherLower = publisher.toLowerCase();
    const isPremium = premiumPublishers.some(p => publisherLower.includes(p));
    if (isPremium) {
      basePrice += 2.00;
    }
  }

  // Add variation (±15%)
  const variation = (Math.random() - 0.5) * 0.3 * basePrice;
  return Math.round((basePrice + variation) * 100) / 100;
}

/**
 * Look up pricing with offline-first strategy
 */
export async function lookupPricing(
  isbn: string,
  metadata?: { title?: string; author?: string; publisher?: string }
): Promise<PricingResult> {
  const offlineDB = getOfflineDB();

  // 1. Try IndexedDB cache first (instant, works offline)
  try {
    const cached = await offlineDB.getCachedPrice(isbn);
    if (cached) {
      const cacheAge = (Date.now() - cached.cachedAt) / (1000 * 60 * 60);
      console.log(`[OfflinePricing] IndexedDB cache HIT (${cacheAge.toFixed(1)}h old)`);

      const lowestPrice = Math.min(
        ...[cached.ebayPrice, cached.amazonPrice].filter(p => p !== null) as number[]
      );

      const estimatedCost = 3.00;
      const fees = lowestPrice ? lowestPrice * 0.15 : 0;
      const profit = lowestPrice ? lowestPrice - estimatedCost - fees : null;

      return {
        isbn,
        title: cached.title || metadata?.title || null,
        author: cached.author || metadata?.author || null,
        publisher: cached.publisher || metadata?.publisher || null,
        thumbnail: null,
        ebayPrice: cached.ebayPrice,
        amazonPrice: cached.amazonPrice,
        lowestPrice: lowestPrice || null,
        profit,
        source: 'cache',
        confidence: 'high',
        cacheAge,
      };
    }
  } catch (error) {
    console.warn('[OfflinePricing] IndexedDB lookup failed:', error);
  }

  // 2. Try server offline lookup (uses server-side SQLite cache)
  if (navigator.onLine) {
    try {
      console.log('[OfflinePricing] Trying server cache...');
      const csrfToken = await getCsrfToken();
      const response = await fetch('/api/offline/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          isbn,
          title: metadata?.title,
          author: metadata?.author,
          publisher: metadata?.publisher,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[OfflinePricing] Server cache HIT');

        // Cache in IndexedDB for next time
        await offlineDB.cachePrice({
          isbn,
          ebayPrice: data.ebayPrice,
          amazonPrice: data.amazonPrice,
          title: data.title,
          author: data.author,
          publisher: data.publisher,
          source: 'cache',
        });

        return {
          ...data,
          source: 'server-cache' as const,
          confidence: data.confidence || 'medium',
        };
      }
    } catch (error) {
      console.warn('[OfflinePricing] Server cache failed:', error);
    }

    // 3. Try live API call (freshest data)
    try {
      console.log('[OfflinePricing] Trying live API...');
      const csrfToken = await getCsrfToken();
      const response = await fetch('/api/books/lookup-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ isbn }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[OfflinePricing] Live API success (source: ${data.source})`);

        // Cache in IndexedDB
        await offlineDB.cachePrice({
          isbn,
          ebayPrice: data.ebayPrice,
          amazonPrice: data.amazonPrice,
          title: data.title,
          author: data.author,
          publisher: data.publisher,
          source: data.source === 'demo' ? 'estimate' : 'api',
        });

        return {
          ...data,
          source: data.source === 'demo' ? 'estimate' : 'api',
          confidence: data.source === 'demo' ? 'low' : 'high',
        };
      }
    } catch (error) {
      console.warn('[OfflinePricing] Live API failed:', error);
    }
  }

  // 4. Fallback: Estimate based on metadata (works offline!)
  console.log('[OfflinePricing] Using estimation fallback');
  const estimatedPrice = estimatePrice(
    metadata?.title,
    metadata?.author,
    metadata?.publisher
  );

  const ebayPrice = estimatedPrice;
  const amazonPrice = estimatedPrice * 1.1; // Amazon typically 10% higher
  const lowestPrice = ebayPrice;
  const estimatedCost = 3.00;
  const fees = lowestPrice * 0.15;
  const profit = lowestPrice - estimatedCost - fees;

  // Cache the estimate
  await offlineDB.cachePrice({
    isbn,
    ebayPrice,
    amazonPrice,
    title: metadata?.title || null,
    author: metadata?.author || null,
    publisher: metadata?.publisher || null,
    source: 'estimate',
  });

  return {
    isbn,
    title: metadata?.title || null,
    author: metadata?.author || null,
    publisher: metadata?.publisher || null,
    thumbnail: null,
    ebayPrice,
    amazonPrice,
    lowestPrice,
    profit,
    source: 'estimate',
    confidence: 'low',
  };
}

/**
 * Get pricing from cache only (for offline mode)
 */
export async function getCachedPricingOnly(isbn: string): Promise<PricingResult | null> {
  const offlineDB = getOfflineDB();

  try {
    const cached = await offlineDB.getCachedPrice(isbn);
    if (!cached) return null;

    const cacheAge = (Date.now() - cached.cachedAt) / (1000 * 60 * 60);
    const lowestPrice = Math.min(
      ...[cached.ebayPrice, cached.amazonPrice].filter(p => p !== null) as number[]
    );

    const estimatedCost = 3.00;
    const fees = lowestPrice ? lowestPrice * 0.15 : 0;
    const profit = lowestPrice ? lowestPrice - estimatedCost - fees : null;

    return {
      isbn,
      title: cached.title,
      author: cached.author,
      publisher: cached.publisher,
      thumbnail: null,
      ebayPrice: cached.ebayPrice,
      amazonPrice: cached.amazonPrice,
      lowestPrice: lowestPrice || null,
      profit,
      source: 'cache',
      confidence: cached.source === 'api' ? 'high' : cached.source === 'estimate' ? 'low' : 'medium',
      cacheAge,
    };
  } catch (error) {
    console.error('[OfflinePricing] Cache lookup failed:', error);
    return null;
  }
}
