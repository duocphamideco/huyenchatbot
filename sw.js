/* HUYỀN TRỢ LÝ — v2.61.0
   Giữ cách cài PWA bản gốc: manifest id /huyenchatbot/, start_url ./, scope ./.
   Network-first cho giao diện, offline fallback; không chặn kích hoạt nếu thiếu một tệp.
   Không can thiệp API, Firebase, ERP, và không xóa cache của app khác.
*/
var CACHE = 'huyen-tro-ly-v2-61-0';
var SHELL = ['./', './index.html', './manifest.json', './catalog_normalizer.js', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(function(cache) {
    return Promise.all(SHELL.map(function(file) {
      return cache.add(file).catch(function() { return null; });
    }));
  }));
});

self.addEventListener('activate', function(event) {
  event.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(key) {
      // Chỉ quản lý cache của chính HUYỀN MOBILE
      return key !== CACHE && (key.indexOf('huyen-tro-ly-') === 0 || key === 'huyen-mobile-ui-v2-45-0-firebase');
    }).map(function(key) { return caches.delete(key); }));
  }).then(function() { return self.clients.claim(); }));
});

self.addEventListener('fetch', function(event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Firebase, ERP, AI... đi trực tiếp.
  // Không nhận những đường dẫn nằm ngoài phạm vi HUYỀN MOBILE.
  if (url.pathname.indexOf(new URL(self.registration.scope).pathname) !== 0) return;

  event.respondWith(fetch(request).then(function(response) {
    if (response && response.ok) {
      var copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(function(cache) { return cache.put(request, copy); }).catch(function() {}));
    }
    return response;
  }).catch(function() {
    return caches.match(request).then(function(cached) {
      if (cached) return cached;
      if (request.mode === 'navigate') {
        return caches.match('./').then(function(indexCached) {
          return indexCached || caches.match('./index.html');
        }).then(function(result) {
          return result || new Response('Không thể tải HUYỀN MOBILE. Vui lòng kết nối Internet và mở lại.', { status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'} });
        });
      }
      return new Response('', { status: 504, statusText: 'Offline resource unavailable' });
    });
  }));
});
