// Service Worker - 离线缓存
const CACHE_NAME = 'meihua-v3.10.1';
const CACHE_FILES = [
    './',
    './2.png',
    './index.html',
    './style.css',
    './app.js',
    './ui.js',
    './data.js',
    './lunar_data.js',
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
    // 对于非导航请求，先尝试网络，失败后回退缓存
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).then(resp => {
                const respClone = resp.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
                return resp;
            }).catch(() => caches.match(e.request).then(res => res || caches.match('./index.html')))
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(res => res || fetch(e.request).then(resp => {
                if (resp.status === 200 && e.request.method === 'GET') {
                    const respClone = resp.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
                }
                return resp;
            }).catch(() => caches.match('./index.html')))
        );
    }
});
