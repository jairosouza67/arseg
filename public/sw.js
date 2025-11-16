// Service Worker - Versão com auto-update
const CACHE_VERSION = 'v2025-11-15-002';
const CACHE_NAME = `arseg-cache-${CACHE_VERSION}`;

self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker, version:', CACHE_VERSION);
  self.skipWaiting(); // Ativa imediatamente
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker, version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Estratégia: Network First (sempre tenta buscar do servidor primeiro)
self.addEventListener('fetch', (event) => {
  // Ignorar requisições do Chrome DevTools
  if (event.request.url.includes('chrome-extension')) {
    return;
  }

  // Ignorar requisições ao Supabase (sempre buscar do servidor)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar a resposta antes de retornar
        const responseToCache = response.clone();
        
        // Cachear apenas respostas bem-sucedidas
        if (response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Se network falhar, tentar buscar do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache (offline):', event.request.url);
            return cachedResponse;
          }
          
          // Se não estiver no cache e for uma navegação, retornar index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Mensagem de debug
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Force skip waiting');
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded, version:', CACHE_VERSION);

