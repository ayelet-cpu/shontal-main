/* מרכז הבקרה — התראות על משימות (cloud/functions/mc-push), ו-mission.html תמיד טרי מהרשת
   (האייפון שומר את הדף של אפליקציה ממסך הבית יותר מדי זמן). אין מטמון משלנו. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || e.request.mode !== 'navigate' || !/\/mission\.html$/.test(u.pathname)) return;
  e.respondWith(fetch(u.href, { cache: 'no-store', credentials: 'same-origin' }).catch(function () { return fetch(e.request); }));
});
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'מרכז הבקרה', {
    body: d.body || '', tag: d.tag || 'mc', renotify: true, requireInteraction: true,
    icon: 'mission-192.png', badge: 'mission-192.png', dir: 'rtl', lang: 'he', data: { url: d.url || 'mission.html' }
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || 'mission.html';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (cs) {
    for (var i = 0; i < cs.length; i++) if (cs[i].url.indexOf('mission') >= 0) { cs[i].focus(); return; }
    return self.clients.openWindow(url);
  }));
});
