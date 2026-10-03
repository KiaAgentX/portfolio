// ================================================================
//  NEON PROMPT STUDIO ULTIMATE — SERVICE WORKER v3.0
//  Full Offline Support · Cache-First Strategy for Assets
// ================================================================

const CACHE_NAME = 'neon-prompt-ultimate-v4';
const ASSET_CACHE = 'neon-assets-v4';
const DATA_CACHE = 'neon-data-v4';

const urlsToCache = [
  '/',
  './index.html',
  './manifest.json',
  './icon-48.png',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-256.png',
  './icon-384.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './screenshot-desktop.jpg',
  './screenshot-mobile.jpg',
  './offline.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap',
  'https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxTOl5s.woff2'
];

// ================================================================
//  INSTALL EVENT
// ================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(async (cache) => {
        console.log('[SW] Caching core assets (fault-tolerant)...');
        const results = await Promise.allSettled(urlsToCache.map(u => cache.add(u)));
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length) console.warn('[SW] skipped', failed.length, 'URL(s); rest cached');
        return true;
      }),
      caches.open(ASSET_CACHE).then((cache) => {
        console.log('[SW] Asset cache ready');
      }),
      caches.open(DATA_CACHE).then((cache) => {
        console.log('[SW] Data cache ready');
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// ================================================================
//  ACTIVATE EVENT
// ================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, ASSET_CACHE, DATA_CACHE].includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      ).then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      });
    })
  );
});

// ================================================================
//  FETCH EVENT — Advanced Cache Strategy
// ================================================================
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Navigation (HTML) — Cache First, then Network
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return networkResponse;
            })
            .catch(() => {
              return caches.match('./offline.html').then(r => r || new Response(
'<!DOCTYPE html><title>Offline</title><body style="background:#08080e;color:#e8e8f0;font-family:sans-serif;text-align:center;padding-top:20vh"><h1>Offline</h1><p>Could not reach the app. <a href="./" style="color:#00d4ff">Retry</a></p></body>',
                { headers: { 'Content-Type': 'text/html' } }));
            });
        })
    );
    return;
  }

  // 2. Manifest & static assets — Cache First
  if (url.pathname === './manifest.json' || 
      url.pathname.startsWith('./icon-') || 
      url.pathname.startsWith('./screenshot-') ||
      url.pathname === './offline.html') {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            return cached;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(ASSET_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          }).catch(() => {
            if (url.pathname.includes('icon')) {
              return caches.match('./icon-192.png');
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // 3. Google Fonts — Cache First
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) {
            return cached;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(ASSET_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          }).catch(() => {
            return new Response('', { status: 200 });
          });
        })
    );
    return;
  }

  // 4. Data requests — Network First, fallback to Cache
  if (url.pathname === '/api/prompts' || url.pathname === '/api/save' || url.pathname === '/api/export') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(DATA_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 5. Default — Stale-While-Revalidate
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(ASSET_CACHE).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return cached || new Response('Offline', { status: 503 });
          });

        return cached || fetchPromise;
      })
  );
});

// ================================================================
//  MESSAGE EVENT — Client communication
// ================================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.put(event.data.url, event.data.response);
      })
    );
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: 'v4.0', cache: CACHE_NAME });
  }
});

// ================================================================
//  PERIODIC BACKGROUND SYNC
// ================================================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-data') {
    event.waitUntil(
      fetch('/api/prompts')
        .then((response) => {
          if (response.ok) {
            return caches.open(DATA_CACHE).then((cache) => {
              return cache.put('/api/prompts', response);
            });
          }
        })
        .catch(() => {})
    );
  }
});

// ================================================================
//  PUSH EVENT
// ================================================================
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {
    title: 'Neon Prompt Studio',
    body: 'Your prompts are waiting for you!',
    icon: './icon-192.png',
    badge: './icon-72.png'
  };

  const options = {
    body: data.body || 'Stay creative!',
    icon: data.icon || './icon-192.png',
    badge: data.badge || './icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || './',
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open Studio'
      },
      {
        action: 'random',
        title: '🎲 Random Prompt'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Neon Prompt Studio',
      options
    )
  );
});

// ================================================================
//  NOTIFICATION CLICK EVENT
// ================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'random') {
    event.waitUntil(
      clients.openWindow('./?action=random')
    );
    return;
  }

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || './')
  );
});

// ================================================================
//  CACHE CLEANUP (periodic)
// ================================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    event.waitUntil(
      caches.open(ASSET_CACHE).then((cache) => {
        return cache.keys().then((keys) => {
          const now = Date.now();
          const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
          return Promise.all(
            keys.map(async (key) => {
              const response = await cache.match(key);
              if (response) {
                const headers = response.headers;
                const dateHeader = headers.get('date');
                if (dateHeader) {
                  const date = new Date(dateHeader).getTime();
                  if (now - date > maxAge) {
                    return cache.delete(key);
                  }
                }
              }
              return null;
            })
          );
        });
      })
    );
  }
});

// ================================================================
//  DEBUG LOGGING (only in development)
// ================================================================
if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
  console.log('[SW] Neon Prompt Studio Ultimate v4.0');
  console.log('[SW] Caching strategy: Cache First for assets, Network First for data');
}

// ================================================================
//  EXPOSE INTERFACE FOR CLIENTS
// ================================================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_OFFLINE_STATUS') {
    event.ports[0].postMessage({
      offline: !navigator.onLine,
      cache: CACHE_NAME
    });
  }
});