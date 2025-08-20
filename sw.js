/*
    Service Worker for Real Estate Management App
    Author: Jules
    Date: 2025-08-19
    Description: Service worker for PWA functionality with offline support
*/

/* ===== CACHE CONFIGURATION ===== */
const CACHE_NAME = 'estate-pro-cache-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/db.js',
    '/style.css',
    '/manifest.json',
    'https://unpkg.com/htmx.org@1.9.10',
    'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

/* ===== SERVICE WORKER LIFECYCLE EVENTS ===== */

/**
 * Install event: Cache essential assets for offline functionality
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('Service Worker: All assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache assets:', error);
            })
    );
});

/**
 * Activate event: Clean up old caches and take control
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation completed');
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('Service Worker: Activation failed:', error);
            })
    );
});

/* ===== FETCH EVENT HANDLING ===== */

/**
 * Fetch event: Serve assets from cache first, then network
 */
self.addEventListener('fetch', (event) => {
    const request = event.request;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension requests
    if (request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    console.log('Service Worker: Serving from cache:', request.url);
                    return response;
                }
                
                // Not in cache - fetch from network
                console.log('Service Worker: Fetching from network:', request.url);
                return fetch(request)
                    .then((networkResponse) => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone the response
                        const responseToCache = networkResponse.clone();
                        
                        // Cache the response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            })
                            .catch((error) => {
                                console.error('Service Worker: Failed to cache response:', error);
                            });
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Network fetch failed:', error);
                        
                        // Return a fallback response for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        return new Response('Network error', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
            .catch((error) => {
                console.error('Service Worker: Fetch event failed:', error);
            })
    );
});

/* ===== MESSAGE HANDLING ===== */

/**
 * Message event: Handle messages from the main application
 */
self.addEventListener('message', (event) => {
    const data = event.data;
    
    if (!data) {
        return;
    }
    
    switch (data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches()
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                })
                .catch((error) => {
                    console.error('Service Worker: Failed to clear cache:', error);
                    event.ports[0].postMessage({ success: false, error: error.message });
                });
            break;
            
        default:
            console.log('Service Worker: Unknown message type:', data.type);
    }
});

/* ===== CACHE UTILITY FUNCTIONS ===== */

/**
 * Clear all caches
 * @returns {Promise<void>}
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Service Worker: All caches cleared');
}

/**
 * Get cache statistics
 * @returns {Promise<Object>}
 */
async function getCacheStats() {
    const cacheNames = await caches.keys();
    const stats = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        stats[cacheName] = keys.length;
    }
    
    return stats;
}

/**
 * Precache additional assets
 * @param {Array<string>} urls - Array of URLs to cache
 * @returns {Promise<void>}
 */
async function precacheAssets(urls) {
    const cache = await caches.open(CACHE_NAME);
    
    for (const url of urls) {
        try {
            await cache.add(url);
            console.log('Service Worker: Precached:', url);
        } catch (error) {
            console.error('Service Worker: Failed to precache:', url, error);
        }
    }
}

/* ===== BACKGROUND SYNC (if supported) ===== */

/**
 * Background sync event (if supported by the browser)
 */
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync event:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform background sync operations here
            console.log('Service Worker: Performing background sync...')
        );
    }
});

/* ===== PUSH NOTIFICATIONS (if supported) ===== */

/**
 * Push event (if supported by the browser)
 */
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push event received');
    
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'New notification',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View',
                    icon: '/icon-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icon-192x192.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Real Estate Manager', options)
        );
    }
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

/* ===== ERROR HANDLING ===== */

/**
 * Handle service worker errors
 */
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred:', event.error);
});

/**
 * Handle unhandled promise rejections
 */
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection:', event.reason);
});
