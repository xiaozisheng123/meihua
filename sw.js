// Service Worker - 离线缓存
const CACHE_NAME = 'meihua-v3.6.0';
const CACHE_FILES = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './ui.js',
    './data.js',
    './manifest.json',
    './icon.svg',
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request).then(resp => {
            // 缓存新资源
            if (resp.status === 200 && e.request.method === 'GET') {
                const respClone = resp.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
            }
            return resp;
        }).catch(() => caches.match('./index.html')))
    );
});
