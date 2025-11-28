/**
 * Service Worker for ISBNScout PWA
 *
 * Caches assets and API responses for offline use
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `isbnscout-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `isbnscout-dynamic-${CACHE_VERSION}`;
const API_CACHE = `isbnscout-api-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/scan',
  '/library',
  '/subscription',
  // Add other critical routes/assets here
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/offline/lookup',
  '/api/offline/stats',
  '/api/sync/status',
  '/api/user/me',
  '/api/user/scan-limits',
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).catch(error => {
      console.error('[SW] Failed to cache static assets:', error);
      // Don't fail installation if some assets fail to cache
      return Promise.resolve();
    })
  );

  // Force waiting service worker to become active
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old caches
            return cacheName.startsWith('isbnscout-') &&
                   cacheName !== STATIC_CACHE &&
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== API_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});

/**
 * Fetch event - serve from cache or network
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle asset requests (JS, CSS, images)
  event.respondWith(handleAssetRequest(request));
});

/**
 * Handle API requests - Network first, cache fallback
 */
async function handleAPIRequest(request) {
  const url = new URL(request.url);

  // Check if this API should be cached
  const shouldCache = CACHEABLE_APIS.some(api => url.pathname.startsWith(api));

  if (!shouldCache) {
    // Don't cache - just fetch
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Network error' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Network first, cache fallback strategy
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);

    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }

    // No cache - return error
    return new Response(JSON.stringify({
      error: 'Offline and no cached data available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle navigation requests - Cache first, network fallback
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first for HTML
    const networkResponse = await fetch(request);

    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed - try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving navigation from cache:', request.url);
      return cachedResponse;
    }

    // Fallback to index.html (SPA)
    const fallback = await caches.match('/index.html');
    if (fallback) {
      return fallback;
    }

    // No cache available
    return new Response('Offline and no cached page available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Handle asset requests - Cache first, network fallback
 */
async function handleAssetRequest(request) {
  // Try cache first for better performance
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Not in cache - fetch from network
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Failed to fetch asset:', request.url, error);

    // Return a basic error response
    return new Response('Asset not available offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Background sync event (future enhancement)
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scans') {
    console.log('[SW] Background sync triggered');
    // Could trigger sync here
  }
});

/**
 * Push notification event (future enhancement)
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ISBNScout';
  const options = {
    body: data.body || 'New notification',
    icon: '/isbnscout-icon.png',
    badge: '/isbnscout-icon.png',
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
