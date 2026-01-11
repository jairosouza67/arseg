// This project no longer uses a Service Worker.
// This file exists only to take over older installed SW versions and remove them,
// preventing stale caches from breaking the app after deploys.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch {
        // ignore
      }

      try {
        await self.registration.unregister();
      } finally {
        const windowClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true,
        });
        await Promise.all(windowClients.map((client) => client.navigate(client.url)));
      }
    })()
  );
});
