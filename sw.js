const CACHE_NAME = 'halabja-traffic-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // هێنانی داتا لە ئینتەرنێتەوە، ئەگەر کێشە هەبوو با بگەڕێتەوە بۆ کەیش (بێ ئەوەی تێکستی سادە بنێرێت کە سایتەکە تێکبدات)
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
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
                // ڕێڕەوی دروست بۆ کردنەوەی سایتەکە لە گیتهەب
                return clients.openWindow('./');
            }
        })
    );
});
