// Service Worker - Versão com auto-update
const CACHE_VERSION = 'v2025-12-10-001';
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
  const url = event.request.url;

  // Ignorar requisições do Chrome DevTools
  if (url.includes('chrome-extension')) {
    return;
  }

  // Requisições ao Supabase: passar direto para network (sem cache)
  // IMPORTANTE: Usar event.respondWith() para garantir que a requisição seja tratada
  if (url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.error('[SW] Supabase request failed:', error.message);
        // Para requisições Supabase, retornar erro de rede em vez de cache
        return new Response(
          JSON.stringify({ error: 'Network error', offline: true }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }

  // Para outras requisições: Network First com fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar a resposta antes de retornar
        const responseToCache = response.clone();

        // Cachear apenas respostas bem-sucedidas de GET requests
        if (response.status === 200 && event.request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch((error) => {
        console.error('[SW] Fetch failed:', error, 'URL:', url);
        // Se network falhar, tentar buscar do cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache (offline):', url);
            return cachedResponse;
          }

          // Se não estiver no cache e for uma navegação, retornar index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }

          // Para outros recursos, retornar erro
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
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

