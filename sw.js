const CACHE_NAME = 'halabja-traffic-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response('تكایه‌ موبایله‌كه‌ت كۆنێكتی ئه‌نته‌رنێت بكه‌.');
        })
    );
});

// === کۆدی وەرگرتنی نۆتیفیکەیشن لە پاشبنەما (پێشنیاری نوێ) ===
self.addEventListener('push', function(event) {
    // دەقی نامەکە وەردەگرێت ئەگەر هەبێت، ئەگەر نەبێت دەقێکی ئامادەکراو دادەنێت
    let messageText = event.data ? event.data.text() : 'سیستەمی نۆرەگرتنی هاتووچۆ ئێستا کراوەیە!';
    
    let options = {
        body: messageText,
        icon: 'icon-192.png',  // ئایکۆنی لۆگۆکەت کە لە فایلەکانتدا هەیە
        badge: 'icon-192.png',
        dir: 'rtl',
        vibrate: [200, 100, 200, 100, 200] // لەرینەوەی مۆبایل
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
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
