const CACHE_NAME = 'halabja-traffic-v2';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // ئەم کۆدە زۆر گرنگە: هەموو کەیش و هەڵە کۆنەکانی پێشوو (وەک v1) لە مۆبایلی هاووڵاتیان دەسڕێتەوە
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
    event.respondWith(
        fetch(event.request).catch(async (error) => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }
            // ئەگەر ئینتەرنێت نەبوو، ڕێگە دەدات بڕۆسەرەکە ئێرۆری ئاسایی خۆی بدات نەک لەسەر لۆگۆکە گیر بخوات
            throw error; 
        })
    );
});

// === کۆدی وەرگرتنی نۆتیفیکەیشن لە پاشبنەما ===
self.addEventListener('push', function(event) {
    let messageText = event.data ? event.data.text() : 'سیستەمی نۆرەگرتنی هاتووچۆ ئێستا کراوەیە!';
    
    let options = {
        body: messageText,
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        dir: 'rtl',
        vibrate: [200, 100, 200, 100, 200]
    };
    
    event.waitUntil(
        self.registration.showNotification('بەڕێوەبەرایەتی هاتووچۆی هەڵەبجە', options)
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
                return clients.openWindow('index.html');
            }
        })
    );
});
