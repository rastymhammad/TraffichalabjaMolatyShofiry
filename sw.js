const CACHE_NAME = 'traffic-v2';

// ئەو فایلە سەرەکیانەی کە دەبێت خەزن ببن بۆ کاتی بێ ئینتەرنێتی
const STATIC_ASSETS = [
    './',
    './manifest.json',
    './icon-192.png',
    './rudawregular2.ttf',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://cdn.jsdelivr.net/npm/qrcodejs/1.0.0/qrcode.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
    // خەزنکردنی فایلەکان لە کاتی دابەزاندنی ئەپەکە
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // ئەم کۆدە زۆر گرنگە: هەموو کەیش و هەڵە کۆنەکانی پێشوو لە مۆبایلی هاووڵاتیان دەسڕێتەوە
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // با داواکارییەکانی سێرڤەر (API) هەرگیز لە کەیشەوە نەخوێنرێنەوە، تەنها ڕاستەوخۆ
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request).catch(error => {
                return new Response(JSON.stringify({ message: "هێڵی ئینتەرنێت پچڕاوە" }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // بۆ فایلەکانی تری سایتەکە (ئەگەر ئینتەرنێت نەبوو لە کەیشەوە بیهێنە)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(response => {
                // وێنە و فایلە نوێیەکان بە ئۆتۆماتیکی خەزن بکە بۆ داهاتوو
                if (event.request.method === 'GET') {
                    let responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            }).catch(async (error) => {
                // ئەگەر ئینتەرنێت نەبوو و فایلەکەش خەزن نەکرابوو
                throw error; 
            });
        })
    );
});

// === کۆدی وەرگرتنی نۆتیفیکەیشن لە پاشبنەما ===
self.addEventListener('push', function(event) {
    let messageText = event.data ? event.data.text() : 'سیستەمی نۆرەگرتن ئێستا کراوەیە!';
    
    let options = {
        body: messageText,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        dir: 'rtl',
        vibrate: [200, 100, 200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification('تـــرافــیـك', options)
    );
});

// کاتێک هاووڵاتی کلیک لە نۆتیفیکەیشنەکە دەکات، سایتەکەی بۆ بکاتەوە
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                // ڕێڕەوی دروست بۆ کردنەوەی سایتەکە
                return clients.openWindow('./');
            }
        })
    );
});
