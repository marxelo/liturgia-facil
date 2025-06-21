const CACHE_NAME = 'liturgia-diaria-v1.0.0';
const STATIC_CACHE = 'liturgia-static-v1';
const DYNAMIC_CACHE = 'liturgia-dynamic-v1';

// Arquivos essenciais para cache
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// URLs da API para cache dinâmico
const API_URLS = [
  'https://liturgia.up.railway.app/v2/'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Fazendo cache dos arquivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Instalação concluída');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Erro na instalação:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Ativação concluída');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégia Cache First para arquivos estáticos
  if (STATIC_FILES.some(file => request.url.includes(file))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(request);
        })
    );
    return;
  }
  
  // Estratégia Network First para API (com fallback)
  if (url.hostname === 'liturgia.up.railway.app') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar response para cache
          const responseClone = response.clone();
          
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseClone);
            });
          
          return response;
        })
        .catch(() => {
          // Fallback para cache se network falhar
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Fallback para dados offline
              return new Response(JSON.stringify({
                error: 'Sem conexão',
                message: 'Dados da liturgia não disponíveis offline',
                offline: true
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }
  
  // Estratégia Cache First para outros recursos
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(request)
          .then((response) => {
            // Cache apenas responses válidas
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          });
      })
  );
});

// Sync em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sync em background');
  
  if (event.tag === 'liturgia-sync') {
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados
      console.log('Sincronizando dados da liturgia...')
    );
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recebido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova liturgia disponível!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver liturgia',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Liturgia Diária', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique na notificação');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
