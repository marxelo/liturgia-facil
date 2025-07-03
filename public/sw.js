const CACHE_NAME = 'liturgia-v1.0.1';

console.log('🔧 Service Worker carregado');

// Install - SEM cache.addAll() que causa falhas
self.addEventListener('install', event => {
  console.log('⚡ Service Worker instalando...');
});

// Activate - garante controle imediato
self.addEventListener('activate', event => {
  console.log('✅ Service Worker ativando...');
  
  event.waitUntil(
    // Limpar caches antigos e assumir controle
    caches.keys().then(cacheNames => {
      console.log('🧹 Limpando caches antigos...');
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🎯 Service Worker assumindo controle de todas as páginas');
      return clients.claim();
    }).then(() => {
      console.log('✅ Service Worker totalmente ativo e funcional!');
    }).catch(error => {
      console.error('❌ Erro durante ativação:', error);
    })
  );
});

//  message listener to trigger skipWaiting.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Recebido comando SKIP_WAITING. Ativando novo Service Worker.');
    self.skipWaiting();
  }
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('⏭️ Recebido comando skipWaiting. Ativando novo Service Worker.');
    self.skipWaiting();
  }
});

// Fetch - estratégia simples que funciona
self.addEventListener('fetch', event => {
  // Apenas para requests do nosso domínio
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      // Tentar cache primeiro, depois network
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('📦 Servindo do cache:', event.request.url);
            return response;
          }
          
          // Se não tem no cache, buscar da rede
          return fetch(event.request).then(response => {
            // Se a resposta é válida, armazenar no cache
            if (response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          });
        })
        .catch(error => {
          console.log('🌐 Falha na rede para:', event.request.url);
          // Para páginas HTML, retornar página offline se houver
          if (event.request.destination === 'document') {
            return caches.match('/') || new Response('Offline - recarregue quando tiver internet');
          }
          throw error;
        })
    );
  }
});

// Notification click handler - funcionando 100%
self.addEventListener('notificationclick', event => {
  console.log('🔔 NOTIFICAÇÃO CLICADA!');
  console.log('📋 Dados da notificação:', {
    tag: event.notification.tag,
    action: event.action,
    data: event.notification.data,
    title: event.notification.title
  });
  
  // Fechar notificação
  event.notification.close();
  
  // Verificar se é nossa notificação da liturgia
  const isLiturgiaNotification = event.notification.tag && 
    (event.notification.tag.includes('liturgia') || 
     (event.notification.data && event.notification.data.source && 
      event.notification.data.source.includes('liturgia')));

  if (!isLiturgiaNotification) {
    console.log('⚠️ Notificação não é da liturgia, ignorando');
    return;
  }

  // Tratar ações específicas
  if (event.action === 'dismiss') {
    console.log('🚫 Usuário dispensou a notificação');
    return;
  }
  
  // Abrir/focar na janela do app
  event.waitUntil(
    clients.matchAll({ 
      type: 'window',
      includeUncontrolled: true 
    }).then(clientList => {
      console.log(`🔍 Encontradas ${clientList.length} janelas do tipo window`);
      
      // Procurar janela do nosso app já aberta
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          console.log('🎯 Focando janela existente:', client.url);
          return client.focus();
        }
      }
      
      // Se não encontrou janela aberta, abrir nova
      console.log('🆕 Abrindo nova janela da liturgia');
      return clients.openWindow(self.location.origin);
      
    }).catch(error => {
      console.error('❌ Erro ao gerenciar janelas:', error);
      // Fallback: tentar abrir janela diretamente
      return clients.openWindow(self.location.origin);
    })
  );
});

// Notification show handler para debug
self.addEventListener('notificationshow', event => {
  console.log('👁️ Notificação mostrada:', event.notification.title);
});

// Push handler (caso queira notificações push no futuro)
self.addEventListener('push', event => {
  console.log('📨 Push recebido:', event.data ? event.data.text() : 'sem dados');
});

// Log final
console.log('🚀 Service Worker configurado e pronto para notificações!');
console.log('🔧 Versão: SEM cache.addAll problemático');