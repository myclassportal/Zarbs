const CACHE_NAME = 'mult-3x3-game-v1';

const SOUND_ASSETS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '20', '30', '40', '50', '60', '70', '80', '90',
  '100', '200', '300', '400', '500', '600', '700', '800', '900',
  'va', 'dar', 'ba', 'mishe', 'hezar',
  'sefr_dahgan', 'sefr_aval_sadgan', 'sefr_dovom_sadgan',
  'ro_minevisim', 'ro_mibarim_bala', 'enteqal_mishe',
  'chon_raqam_akhare', 'jame_sotoon', 'zarb_kamel_shod'
].map(name => `./sounds/${name}.mp3`);

const ASSETS = [
  './',
  './index.html',
  './game-db.js',
  './supabase.js',
  './game-audio.js',
  './Vazirmatn-Regular.woff2',
  './Vazirmatn-Bold.woff2',
  ...SOUND_ASSETS
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS.map((url) => {
          return fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch((err) => {
            console.warn('Failed to cache game asset:', url, err);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') {
    return;
  }

  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});