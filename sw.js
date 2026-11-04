/* HUYỀN TRỢ LÝ — service worker tối giản.
   • Cho phép Chrome "Cài đặt ứng dụng".
   • Trang & logo: lấy MẠNG TRƯỚC (luôn bản mới nhất từ GitHub), mất mạng mới dùng bản lưu.
   • KHÔNG đụng tới Firebase / API (dữ liệu đơn hàng luôn đi thẳng, không lưu đệm). */
var CACHE = 'huyen-tro-ly-v1';
var SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function (e) { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL).catch(function () {}); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return; // Firebase, AI… đi thẳng
  e.respondWith(fetch(e.request).then(function (r) {
    if (r && r.ok) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
    return r;
  }).catch(function () { return caches.match(e.request).then(function (m) { return m || caches.match('./index.html'); }); }));
});
