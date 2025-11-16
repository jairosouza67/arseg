self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
// Minimal service worker placeholder to avoid 404/MIME issues during development.
