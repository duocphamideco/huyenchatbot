/* HUYEN MOBILE PWA — chỉ cache tệp giao diện, tuyệt đối không cache Firebase/ERP/API. */
const CACHE = 'huyen-mobile-ui-v2-45-0-firebase';
const SHELL = ['./', './index.html', './catalog_normalizer.js', './manifest.json', './favicon-48.png', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== self.location.origin) return; // dữ liệu ERP và API không lưu
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put('./index.html', copy))); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(r, copy))); }
    return res;
  }).catch(() => caches.match(r)));
});
