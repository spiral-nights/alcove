const CACHE_NAME = 'alcove-cache-v3';
const ASSETS = [
    './',
    './index.html',
    './sw.js',
    './dist/output.css'
];

// 1. Pre-cache everything immediately on install
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching app shell');
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// 2. Clean up old versions of the cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Cache-First Strategy for Shell, Network-First for others (Favicons)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // For local app files, use Cache-First
    if (ASSETS.some(asset => event.request.url.includes(asset.replace('./', '')))) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    } else {
        // For external requests (like favicons), try network first, then cache
        event.respondWith(
            fetch(event.request).then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    if (response.status === 200) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                });
            }).catch(() => {
                return caches.match(event.request);
            })
        );
    }
});
