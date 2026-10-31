const CACHE_NAME = 'projectflow-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Purge all old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Cache and network request handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // In local development or for Vite modules/HMR, DO NOT intercept anything
  const isDev =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.includes('/src/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/') ||
    url.searchParams.has('t') ||
    url.searchParams.has('import') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.jsx');

  if (isDev) {
    return;
  }

  // Pass-through: Supabase API calls, non-GET requests
  if (url.origin.includes('supabase.co') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type !== 'opaque'
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/') || Response.error();
          }
          return Response.error();
        })
      )
  );
});

// Background Sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-task-mutations') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'BACKGROUND_SYNC_TRIGGERED' });
        });
      })
    );
  }
});

// Periodic Background Sync handler
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-sprint-telemetry') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'PERIODIC_SYNC_TRIGGERED' });
        });
      })
    );
  }
});

// Push notification event listener
self.addEventListener('push', (event) => {
  let data = { title: 'ProjectFlow', body: 'New team update available', url: '/tasks' };
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (_e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon.ico',
    data: data.url || '/tasks'
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click router
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data || '/tasks';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
