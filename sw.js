const CACHE_NAME = 'sollicitatie-tracker-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg'
];

// Installeren van de Service Worker en bestanden cachen
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activeren en oude caches opruimen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Netwerkverzoeken afhandelen (Cache met fallback naar netwerk)
self.addEventListener('fetch', (event) => {
  // Firebase/Firestore-verzoeken laten we altijd direct naar de cloud gaan
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('firebasejs')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});