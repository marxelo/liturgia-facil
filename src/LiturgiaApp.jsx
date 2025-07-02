import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Menu, Book, Heart, Music, Cross, Scroll, Sparkles, AlertCircle, Download, WifiOff, Bell, BellOff, Share2, Play, Pause, Volume2, VolumeX, CalendarDays, Type, ToggleLeft, ToggleRight, ExternalLink, RefreshCw } from 'lucide-react';

// Carregando fonte Gelasio do Google Fonts
const loadGelasioFont = () => {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Gelasio:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';
  link.rel = 'stylesheet';
  if (!document.querySelector(`link[href="${link.href}"]`)) {
    document.head.appendChild(link);
  }
};

const getInitialDateUTC3 = () => {
  const now = new Date(); // Gets current instant
  // To get the date string for UTC-3, we subtract 3 hours from the current UTC time,
  // then convert that to an ISO string and take the date part.
  // new Date().getTime() gives UTC milliseconds since epoch.
  const dateObjectInUTCMinus3Timezone = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  return dateObjectInUTCMinus3Timezone.toISOString().split('T')[0];
};

const LiturgiaApp = () => {
  const [currentDate, setCurrentDate] = useState(getInitialDateUTC3());
  const [selectedDate, setSelectedDate] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('base');
  const [activeSection, setActiveSection] = useState('todas');
  const [showMenu, setShowMenu] = useState(false);
  const [liturgiaData, setLiturgiaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // PWA states
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  // New features states
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [playingSection, setPlayingSection] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // state for the PWA update notification
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  // Simple localStorage hook (replacing hatch dependency)
  const [notificationTime, setNotificationTime] = useState('07:00');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notificationTimer, setNotificationTimer] = useState(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedNotificationTime = localStorage.getItem('notificationTime');
      const savedAudioEnabled = localStorage.getItem('audioEnabled');
      const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled');
      const savedFontSize = localStorage.getItem('fontSize');
      const savedDarkMode = localStorage.getItem('darkMode');
      
      if (savedNotificationTime) {
        setNotificationTime(savedNotificationTime);
      }
      if (savedAudioEnabled !== null) {
        setAudioEnabled(JSON.parse(savedAudioEnabled));
      }
      if (savedNotificationsEnabled !== null) {
        setNotificationsEnabled(JSON.parse(savedNotificationsEnabled));
      }
      if (savedFontSize) {
        setFontSize(savedFontSize);
      }
      if (savedDarkMode !== null) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  }, []);

  // Save notification time to localStorage
  const updateNotificationTime = useCallback((time) => {
    setNotificationTime(time);
    try {
      localStorage.setItem('notificationTime', time);
    } catch (error) {
      console.warn('Failed to save notification time:', error);
    }
  }, []);

  // Save audio setting to localStorage
  const updateAudioEnabled = useCallback((enabled) => {
    setAudioEnabled(enabled);
    try {
      localStorage.setItem('audioEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save audio setting:', error);
    }
  }, []);

  // Save notifications setting to localStorage
  const updateNotificationsEnabled = useCallback((enabled) => {
    setNotificationsEnabled(enabled);
    try {
      localStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save notifications setting:', error);
    }
  }, []);

  // Save font size to localStorage
  const updateFontSize = useCallback((size) => {
    setFontSize(size);
    try {
      localStorage.setItem('fontSize', size);
    } catch (error) {
      console.warn('Failed to save font size:', error);
    }
  }, []);

  // Save dark mode to localStorage
  const updateDarkMode = useCallback((enabled) => {
    setDarkMode(enabled);
    try {
      localStorage.setItem('darkMode', JSON.stringify(enabled));
    } catch (error) {
      console.warn('Failed to save dark mode:', error);
    }
  }, []);

  // Cores litúrgicas para estilização
  const liturgicalColors = {
    'Verde': { 
      primary: darkMode ? 'from-green-700 to-emerald-700' : 'from-green-600 to-emerald-600',
      accent: darkMode ? 'border-green-600 bg-green-900/30' : 'border-green-300 bg-green-50',
      text: darkMode ? 'text-green-200' : 'text-green-800'
    },
    'Vermelho': { 
      primary: darkMode ? 'from-red-700 to-rose-700' : 'from-red-600 to-rose-600',
      accent: darkMode ? 'border-red-600 bg-red-900/30' : 'border-red-300 bg-red-50',
      text: darkMode ? 'text-red-200' : 'text-red-800'
    },
    'Roxo': { 
      primary: darkMode ? 'from-purple-700 to-violet-700' : 'from-purple-600 to-violet-600',
      accent: darkMode ? 'border-purple-600 bg-purple-900/30' : 'border-purple-300 bg-purple-50',
      text: darkMode ? 'text-purple-200' : 'text-purple-800'
    },
    'Rosa': { 
      primary: darkMode ? 'from-pink-700 to-rose-700' : 'from-pink-600 to-rose-600',
      accent: darkMode ? 'border-pink-600 bg-pink-900/30' : 'border-pink-300 bg-pink-50',
      text: darkMode ? 'text-pink-200' : 'text-pink-800'
    },
    'Branco': { 
      primary: darkMode ? 'from-gray-600 to-slate-600' : 'from-slate-700 to-gray-800',
      accent: darkMode ? 'border-gray-500 bg-gray-800/30' : 'border-gray-400 bg-gray-100',
      text: darkMode ? 'text-gray-200' : 'text-gray-700'
    },
    'Dourado': {
      primary: darkMode ? 'from-yellow-600 to-amber-600' : 'from-yellow-500 to-amber-500',
      accent: darkMode ? 'border-yellow-500 bg-yellow-900/30' : 'border-yellow-300 bg-yellow-50',
      text: darkMode ? 'text-yellow-200' : 'text-yellow-800'
    }
  };

  const getCurrentColor = () => {
    const cor = liturgiaData?.cor || 'Branco';
    return liturgicalColors[cor] || liturgicalColors['Branco'];
  };

  // PWA functionality
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      // if (outcome === 'accepted') {
      //   // console.log('PWA instalado com sucesso');
      // } else {
      //   // console.log('Instalação cancelada pelo usuário');
      // }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  // Notification functionality
  const requestNotificationPermission = async () => {
    // console.log('🔔 Solicitando permissão para notificações...');
    
    if (!('Notification' in window)) {
      // console.error('❌ Browser não suporta notificações');
      alert('Seu navegador não suporta notificações.');
      return;
    }

    try {
      // console.log('📋 Estado atual da permissão:', Notification.permission);
      
      // Se já tem permissão, apenas ativar
      if (Notification.permission === 'granted') {
        // console.log('✅ Permissão já concedida');
        updateNotificationsEnabled(true);
        scheduleNotification();
        return;
      }

      // Solicitar permissão
      // console.log('🙋 Solicitando permissão...');
      const permission = await Notification.requestPermission();
      // console.log('📋 Nova permissão:', permission);
      
      if (permission === 'granted') {
        // console.log('✅ Permissão concedida com sucesso');
        updateNotificationsEnabled(true);
        
        // Teste imediato para confirmar funcionamento
        setTimeout(() => {
          // console.log('🧪 Fazendo teste imediato após permissão');
          showNotification();
        }, 500);
        
        // Agendar normalmente
        scheduleNotification();
      } else {
        // console.warn('⚠️ Permissão negada:', permission);
        alert('Permissão para notificações negada. Você pode habilitar nas configurações do navegador.');
      }
    } catch (error) {
      // console.error('❌ Erro ao solicitar permissão:', error);
      alert('Erro ao solicitar permissão para notificações: ' + error.message);
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      updateNotificationsEnabled(false);
      // Clear existing timer
      if (notificationTimer) {
        clearTimeout(notificationTimer);
        setNotificationTimer(null);
      }
    } else {
      requestNotificationPermission();
    }
  };

  const scheduleNotification = useCallback(() => {
    // console.log('🔧 [AGENDAMENTO] Iniciando processo de agendamento...');
    // console.log('🔧 [AGENDAMENTO] Estado atual:', {
    //   notificationsEnabled,
    //   notificationTime,
    //   hasTimer: !!notificationTimer
    // });
    
    if (!notificationsEnabled) {
      // console.log('🔕 [AGENDAMENTO] Notificações desabilitadas - não agendando');
      return;
    }
    
    // Clear existing timer
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      // console.log('⏹️ [AGENDAMENTO] Timer anterior cancelado:', notificationTimer);
      setNotificationTimer(null);
    }
    
    try {
      const [hours, minutes] = notificationTime.split(':');
      const now = new Date();
      const notificationDate = new Date();
      notificationDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // console.log('📋 [AGENDAMENTO] Dados do agendamento:', {
      //   horaConfigurada: notificationTime,
      //   horaAtual: now.toLocaleTimeString(),
      //   dataNotificacao: notificationDate.toLocaleString()
      // });
      
      // Se o horário já passou hoje, agendar para amanhã
      if (notificationDate <= now) {
        notificationDate.setDate(notificationDate.getDate() + 1);
        // console.log('📅 [AGENDAMENTO] Horário já passou hoje, agendando para amanhã');
        // console.log('📅 [AGENDAMENTO] Nova data: ', notificationDate.toLocaleString());
      }
      
      const timeUntilNotification = notificationDate.getTime() - now.getTime();
      const minutesUntil = Math.round(timeUntilNotification / 1000 / 60);
      const hoursUntil = Math.round(minutesUntil / 60);
      
      // console.log(`📅 [AGENDAMENTO] Próxima notificação: ${notificationDate.toLocaleString()}`);
      // console.log(`⏰ [AGENDAMENTO] Tempo restante: ${minutesUntil} minutos (${hoursUntil} horas)`);
      // console.log(`⏰ [AGENDAMENTO] Milissegundos até disparo: ${timeUntilNotification}`);
      
      // Validar se o tempo é razoável (não muito longo que pode dar overflow)
      if (timeUntilNotification > 2147483647) { // Max setTimeout value
        // console.error('❌ [AGENDAMENTO] Tempo muito longo, reagendando para 24h');
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const newTime = tomorrow.getTime() - now.getTime();
        
        const timerId = setTimeout(() => {
          // console.log('🚨 [AGENDAMENTO] Timer de 24h executado, reagendando...');
          scheduleNotification();
        }, newTime);
        
        setNotificationTimer(timerId);
        return;
      }
      
      const timerId = setTimeout(() => {
        // console.log('🚨 [AGENDAMENTO] EXECUTANDO NOTIFICAÇÃO AUTOMÁTICA!');
        // console.log('🚨 [AGENDAMENTO] Horário atual:', new Date().toLocaleString());
        // console.log('🚨 [AGENDAMENTO] Timer disparado conforme planejado!');
        
        // Chamar notificação marcando como automática
        showNotification(true);
        
        // Reagendar automaticamente para o próximo dia
        // console.log('🔄 [AGENDAMENTO] Reagendando para o próximo dia...');
        setTimeout(() => {
          scheduleNotification();
        }, 5000); // Aguarda 5 segundos antes de reagendar
        
      }, timeUntilNotification);
      
      setNotificationTimer(timerId);
      // console.log(`✅ [AGENDAMENTO] Timer criado com sucesso!`);
      // console.log(`✅ [AGENDAMENTO] Timer ID: ${timerId}`);
      // console.log(`✅ [AGENDAMENTO] Será executado em: ${new Date(now.getTime() + timeUntilNotification).toLocaleString()}`);
      
    } catch (error) {
      console.error('❌ [AGENDAMENTO] Erro durante agendamento:', error);
      console.error('❌ [AGENDAMENTO] Stack:', error.stack);
    }
  }, [notificationsEnabled, notificationTime, notificationTimer]);

  const showNotification = async (isAutomatic = false) => {
    const timestamp = new Date().toLocaleString();
    const tipo = isAutomatic ? 'AUTOMÁTICA' : 'MANUAL';
    // console.log(`🔔 [NOTIFICAÇÃO ${tipo} - ${timestamp}] INICIANDO ENVIO`);
    
    try {
      // Verificar permissão primeiro
      if (!('Notification' in window)) {
        console.error('❌ [NOTIFICAÇÃO] Browser não suporta notificações');
        return;
      }

      if (Notification.permission !== 'granted') {
        console.warn('⚠️ [NOTIFICAÇÃO] Permissão não concedida:', Notification.permission);
        return;
      }

      // console.log(`✅ [NOTIFICAÇÃO] Permissão OK, enviando liturgia...`);
      
      const isPWA = window.matchMedia('(display-mode: standalone)').matches;
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      // console.log('🔍 [NOTIFICAÇÃO] Ambiente:', {
      //   standalone: isPWA,
      //   serviceWorker: hasServiceWorker,
      //   userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
      // });

      // NOVA LÓGICA: Service Worker PRIMEIRO para PWA, Notification API para browser
      if (isPWA && hasServiceWorker) {
        // PWA: Usar APENAS Service Worker
        // console.log('⏰ [NOTIFICAÇÃO] Configurando timeout de 10s para detectar travamento...');
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('TIMEOUT: showNotification travou por mais de 10 segundos'));
          }, 10000);
        });
        
        try {
          // console.log('📱 [NOTIFICAÇÃO] PWA detectado - usando Service Worker...');
          
          // Verificar se há registrations ANTES de aguardar ready
          // console.log('🔍 [NOTIFICAÇÃO] Verificando registrations do Service Worker...');
          const registrations = await navigator.serviceWorker.getRegistrations();
          // console.log('📋 [NOTIFICAÇÃO] Registrations encontradas:', registrations.length);
          
          if (registrations.length === 0) {
            console.warn('⚠️ [NOTIFICAÇÃO] NENHUM SERVICE WORKER REGISTRADO!');
            // console.log('🔄 [NOTIFICAÇÃO] Tentando registrar Service Worker automaticamente...');
            
            try {
              const newRegistration = await navigator.serviceWorker.register('/sw.js');
              // console.log('✅ [NOTIFICAÇÃO] Service Worker registrado com sucesso:', newRegistration);
              
              // Aguardar ativação
              await navigator.serviceWorker.ready;
              // console.log('✅ [NOTIFICAÇÃO] Service Worker ativado e pronto');
              
            } catch (swRegisterError) {
              console.error('❌ [NOTIFICAÇÃO] Falha ao registrar Service Worker:', swRegisterError);
              throw new Error('Não foi possível registrar Service Worker - verifique se /sw.js existe');
            }
          }
          
          // console.log('🔍 [NOTIFICAÇÃO] Aguardando Service Worker ready...');
          const registration = await navigator.serviceWorker.ready;
          // console.log('✅ [NOTIFICAÇÃO] Service Worker ready obtido:', {
          //   active: registration.active?.state,
          //   scope: registration.scope,
          //   updateViaCache: registration.updateViaCache
          // });
          
          // Preparar dados da notificação
          const notificationOptions = {
            body: 'Hora de conferir a liturgia de hoje!',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'liturgia-daily-pwa',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            silent: false,
            data: {
              source: 'liturgia-app-pwa',
              timestamp: Date.now(),
              url: window.location.href,
              action: 'daily-reminder'
            }
          };
          
          // console.log('📋 [NOTIFICAÇÃO] Tentando showNotification com opções:', notificationOptions);
          // console.log('🚀 [NOTIFICAÇÃO] ENVIANDO AGORA...');
          
          // Criar promise com timeout para detectar travamento
          let timeoutId;
          const notificationPromise = registration.showNotification('Liturgia Diária 🙏', notificationOptions);
          
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error('TIMEOUT: showNotification travou por mais de 10 segundos'));
            }, 10000);
          });
          
          // Race entre notificação e timeout
          await Promise.race([notificationPromise, timeoutPromise]);
          
          // IMPORTANTE: Cancelar timeout se chegou até aqui (sucesso)
          if (timeoutId) {
            clearTimeout(timeoutId);
            // console.log('⏰ [NOTIFICAÇÃO] Timer de timeout cancelado - notificação enviada com sucesso');
          }
          
          // console.log(`✅ [NOTIFICAÇÃO] PWA ENVIADA COM SUCESSO!`);
          // console.log('📋 [NOTIFICAÇÃO] Confirmação de envio concluída');
          
        } catch (pwaError) {
          console.error('❌ [NOTIFICAÇÃO] PWA Service Worker falhou:', pwaError);
          console.error('❌ [NOTIFICAÇÃO] Tipo do erro:', pwaError.name);
          console.error('❌ [NOTIFICAÇÃO] Mensagem:', pwaError.message);
          console.error('❌ [NOTIFICAÇÃO] Stack:', pwaError.stack);
          
          // Verificar se foi timeout
          if (pwaError.message.includes('TIMEOUT')) {
            console.error('⏰ [NOTIFICAÇÃO] DETECTADO TRAVAMENTO!');
            console.error('🔍 [NOTIFICAÇÃO] O showNotification() travou - possível problema com Service Worker');
            
            // Tentar diagnóstico adicional
            try {
              const registration = await navigator.serviceWorker.ready;
              // console.log('🔍 [NOTIFICAÇÃO] Status do Service Worker pós-timeout:', {
              //   active: registration.active?.state,
              //   installing: registration.installing?.state,
              //   waiting: registration.waiting?.state
              // });
            } catch (diagError) {
              console.error('❌ [NOTIFICAÇÃO] Erro no diagnóstico:', diagError);
            }
          }
          
          // Tentar versão mais simples como fallback
          try {
            // console.log('🔄 [NOTIFICAÇÃO] Tentando versão simplificada...');
            const registration = await navigator.serviceWorker.ready;
            
            await registration.showNotification('Liturgia Diária', {
              body: 'Hora de conferir a liturgia de hoje!',
              tag: 'liturgia-simple'
            });
            
            // console.log('✅ [NOTIFICAÇÃO] Versão simplificada funcionou!');
            
          } catch (simpleError) {
            console.error('❌ [NOTIFICAÇÃO] Versão simplificada também falhou:', simpleError);
            throw pwaError; // Re-throw original error
          }
        }
        
      } else {
        // BROWSER: Tentar Notification API primeiro, Service Worker como fallback
        try {
          // console.log('🖥️ [NOTIFICAÇÃO] Browser detectado - usando Notification API...');
          
          const notification = new Notification('Liturgia Diária 🙏', {
            body: 'Hora de conferir a liturgia de hoje!',
            icon: '/icons/icon-192.png',
            tag: 'liturgia-daily-browser',
            requireInteraction: false,
            silent: false,
            badge: '/icons/icon-192.png',
            data: {
              source: 'liturgia-app-browser',
              timestamp: Date.now(),
              url: window.location.href
            }
          });
          
          // Event listeners para debug
          notification.onclick = () => {
            // console.log('🔔 [NOTIFICAÇÃO] Browser - clique detectado');
            window.focus();
            notification.close();
          };
          
          // notification.onshow = () => {
            // console.log(`✅ [NOTIFICAÇÃO] BROWSER MOSTRADA COM SUCESSO`);
            // console.log('📋 [NOTIFICAÇÃO] Dados:', {
            //   title: notification.title,
            //   body: notification.body,
            //   tag: notification.tag,
            //   icon: notification.icon
            // });
          // };
          
          // notification.onerror = (error) => {
          //   console.error(`❌ [NOTIFICAÇÃO] ERRO NO BROWSER:`, error);
          // };

          // Auto-close após 10 segundos
          setTimeout(() => {
            notification.close();
          }, 10000);

        } catch (browserError) {
          // console.warn('⚠️ [NOTIFICAÇÃO] API falhou, tentando Service Worker:', browserError);
          
          // Fallback: Service Worker para browsers que bloqueiam Notification API
          if (hasServiceWorker) {
            try {
              // console.log('📱 [NOTIFICAÇÃO] Fallback - usando Service Worker...');
              const registration = await navigator.serviceWorker.ready;
              
              await registration.showNotification('Liturgia Diária 🙏', {
                body: 'Hora de conferir a liturgia de hoje!',
                icon: '/icons/icon-192.png',
                badge: '/icons/icon-192.png',
                tag: 'liturgia-daily-fallback',
                vibrate: [200, 100, 200],
                requireInteraction: false,
                silent: false,
                data: {
                  source: 'liturgia-app-fallback',
                  timestamp: Date.now(),
                  url: window.location.href,
                  action: 'daily-reminder'
                }
              });
              
              // console.log(`✅ [NOTIFICAÇÃO] FALLBACK ENVIADA COM SUCESSO!`);
              
            } catch (fallbackError) {
              // console.error('❌ [NOTIFICAÇÃO] Fallback também falhou:', fallbackError);
              throw fallbackError;
            }
          } else {
            throw browserError;
          }
        }
      }
      
      // Reagendar para o próximo dia (apenas para notificações automáticas)
      if (notificationsEnabled && isAutomatic) {
        // console.log('🔄 [NOTIFICAÇÃO] Notificação automática enviada, reagendando para amanhã...');
        setTimeout(() => {
          // console.log('🔄 [NOTIFICAÇÃO] Executando reagendamento pós-envio...');
          scheduleNotification();
        }, 2000);
      } else if (isAutomatic) {
        // console.log('⚠️ [NOTIFICAÇÃO] Notificações foram desabilitadas durante execução automática');
      }
      
    } catch (error) {
      // console.error('❌ [NOTIFICAÇÃO] ERRO GERAL:', error);
      // console.error('❌ [NOTIFICAÇÃO] Stack:', error.stack);
      
      // Reagendar apenas se as notificações estão habilitadas e era automática
      if (notificationsEnabled && isAutomatic) {
        // console.log('🔄 [NOTIFICAÇÃO] Erro em notificação automática, reagendando...');
        setTimeout(() => {
          scheduleNotification();
        }, 5000); // Aguarda mais tempo em caso de erro
      }
    }
  };

  // Audio functionality (Text-to-Speech)
  const speakText = useCallback((text, sectionName) => {
    if (!audioEnabled || !('speechSynthesis' in window)) {
      alert('Seu navegador não suporta síntese de voz.');
      return;
    }

    if (isPlaying && playingSection === sectionName) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setPlayingSection(null);
      return;
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    try {
      const cleanText = text.replace(/<[^>]*>/g, '').replace(/\d+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setIsPlaying(true);
        setPlayingSection(sectionName);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setPlayingSection(null);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setPlayingSection(null);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  }, [audioEnabled, isPlaying, playingSection]);

  // Share functionality - melhorada para compartilhar texto completo
  const shareReading = async (title, text) => {
    // Remove HTML tags e pega texto completo
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    
    const shareData = {
      title: `Liturgia Diária - ${title}`,
      text: `${title}\n\n${cleanText}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        const textToCopy = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
        await navigator.clipboard.writeText(textToCopy);
        alert('Texto completo copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      // Fallback manual para dispositivos que não suportam clipboard
      const textToCopy = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Texto completo copiado para a área de transferência!');
      } catch (fallbackErr) {
        alert('Erro ao compartilhar conteúdo.');
      }
      document.body.removeChild(textArea);
    }
  };

  // Calendar functionality - melhorado com navegação entre meses
  const generateLiturgicalCalendar = () => {
    const currentMonth = calendarMonth.getMonth();
    const currentYear = calendarMonth.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayWeekday = firstDayOfMonth.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = dateString === new Date().toISOString().split('T')[0];
      const isSelected = dateString === currentDate;

      days.push({
        day,
        date: dateString,
        isToday,
        isSelected,
        liturgicalSeason: getLiturgicalSeason(date)
      });
    }

    return {
      days,
      monthName: firstDayOfMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    };
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(calendarMonth.getMonth() + direction);
    setCalendarMonth(newMonth);
  };

  const getLiturgicalSeason = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Simplified liturgical seasons (more accurate calculation would need Easter date)
    if ((month === 12 && day >= 3) || (month === 1 && day <= 13)) return 'Advento/Natal';
    if (month === 2 || month === 3) return 'Quaresma';
    if (month === 4) return 'Páscoa';
    if (month >= 5 && month <= 11) return 'Tempo Comum';
    return 'Tempo Comum';
  };

  const getSeasonColor = (season) => {
    const baseColors = {
      'Advento/Natal': darkMode 
        ? 'bg-purple-800/40 text-purple-200 border-purple-600/50' 
        : 'bg-purple-100 text-purple-800 border-purple-200',
      'Quaresma': darkMode 
        ? 'bg-purple-800/40 text-purple-200 border-purple-600/50' 
        : 'bg-purple-100 text-purple-800 border-purple-200',
      'Páscoa': darkMode 
        ? 'bg-yellow-700/40 text-yellow-200 border-yellow-600/50' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Tempo Comum': darkMode 
        ? 'bg-green-800/40 text-green-200 border-green-600/50' 
        : 'bg-green-100 text-green-800 border-green-200'
    };
    
    return baseColors[season] || baseColors['Tempo Comum'];
  };

    // NEW: Add a useEffect to handle the PWA update event
  useEffect(() => {
    const handleUpdateAvailable = () => {
      console.log('🎉 Nova versão disponível! Mostrando banner de atualização.');
      setShowUpdateBanner(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  // NEW: Function to trigger the update
// src/LiturgiaApp.jsx

const handleUpdate = () => {
  navigator.serviceWorker.getRegistration().then(registration => {
    // This is the check that is likely failing.
    if (registration && registration.waiting) {
      const waitingWorker = registration.waiting;
      
      console.log('✅ Found a waiting service worker. Proceeding with update.');
      console.log('Waiting worker details:', waitingWorker);

      waitingWorker.addEventListener('statechange', event => {
        if (event.target.state === 'activated') {
          console.log('✅ New Service Worker has been activated. Reloading page.');
          window.location.reload();
        }
      });

      console.log('📤 Sending SKIP_WAITING message to the waiting worker.');
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

    } else {
      // --- LOGGING BLOCK ---
      // This block will run if no waiting worker is found.
      console.error('❌ UPDATE FAILED: Could not find a waiting service worker.');
      
      if (registration) {
        console.log('🔍 Current registration details:', registration);
        console.log('   - Active worker:', registration.active);
        console.log('   - Installing worker:', registration.installing);
        console.log('   - Waiting worker:', registration.waiting);
        alert('An error occurred during the update. A new version might have already been installed, or you may be offline. Please try reloading the page.');
      } else {
        console.error('致命的なエラー：Service Workerの登録が見つかりませんでした。');
        alert('A critical error occurred: No service worker registration was found.');
      }
      // --- END LOGGING BLOCK ---
    }
  });
};

  // Fetch liturgy data
  const fetchLiturgia = useCallback(async (date) => {
    try {
      setLoading(true);
      setError(null);
      
      const [ano, mes, dia] = date.split('-');
      const response = await fetch(`https://liturgia.up.railway.app/v2/?dia=${dia}&mes=${mes}&ano=${ano}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar liturgia');
      }
      
      const data = await response.json();
      setLiturgiaData(data);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar liturgia:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiturgia(currentDate);
    loadGelasioFont(); // Carrega a fonte Gelasio
  }, [currentDate, fetchLiturgia]);

  // Schedule notification when enabled or time changes
  useEffect(() => {
    
    if (notificationsEnabled) {
      scheduleNotification();
    } else {
      if (notificationTimer) {
        clearTimeout(notificationTimer);
        setNotificationTimer(null);

      }
    }
  }, [notificationsEnabled, notificationTime, scheduleNotification]);

  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const formatTextWithVerses = (text) => {
    if (!text) return null;
    
    const verseRegex = /(\s|^)(\d{1,3})([^\d])/g;
    
    return text.split('\n').map((paragrafo, pIndex) => {
      if (!paragrafo.trim()) return null;
      
      const formattedParagraph = paragrafo.replace(verseRegex, (match, space, number, nextChar) => {
        return `${space}<sup class="text-xs opacity-70 font-medium">${number}</sup>${nextChar}`;
      });
      
      return (
        <p 
          key={pIndex} 
          className="mb-4"
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
        />
      );
    });
  };

  const getDynamicSections = () => {
    if (!liturgiaData) return [];
    
    const sections = [
      { id: 'todas', name: 'Todas as Seções', icon: Book, available: true }
    ];

    if (liturgiaData.leituras?.primeiraLeitura?.length > 0) {
      sections.push({ id: 'primeiraLeitura', name: 'Primeira Leitura', icon: Book, available: true });
    }
    
    if (liturgiaData.leituras?.segundaLeitura?.length > 0) {
      sections.push({ id: 'segundaLeitura', name: 'Segunda Leitura', icon: Book, available: true });
    }

    if (liturgiaData.leituras?.salmo?.length > 0) {
      sections.push({ id: 'salmo', name: 'Salmo', icon: Music, available: true });
    }

    if (liturgiaData.leituras?.evangelho?.length > 0) {
      sections.push({ id: 'evangelho', name: 'Evangelho', icon: Cross, available: true });
    }

    if (liturgiaData.leituras?.extras?.length > 0) {
      sections.push({ id: 'extras', name: 'Leituras Extras', icon: Sparkles, available: true });
    }

    if (liturgiaData.oracoes && Object.keys(liturgiaData.oracoes).length > 0) {
      sections.push({ id: 'oracoes', name: 'Orações', icon: Heart, available: true });
    }

    if (liturgiaData.antifonas && Object.keys(liturgiaData.antifonas).length > 0) {
      sections.push({ id: 'antifonas', name: 'Antífonas', icon: Scroll, available: true });
    }

    return sections;
  };

  const renderMultipleReadings = (readings, sectionKey, sectionName) => {
    if (!readings || readings.length === 0) return null;

    return (
      <div key={sectionKey} className={`mb-8 ${activeSection !== 'todas' && activeSection !== sectionKey ? 'hidden' : ''}`}>
        {readings.map((reading, index) => (
          <div key={index} className={`mb-6 p-6 rounded-2xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className={`text-xl font-bold ${getCurrentColor().text}`} style={{ fontFamily: 'Gelasio, serif' }}>
                  {reading.titulo || sectionName}
                </h3>
                {readings.length > 1 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getCurrentColor().accent} ${getCurrentColor().text}`}>
                    {reading.tipo || `Opção ${index + 1}`}
                  </span>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(reading.texto, `${sectionKey}-${index}`)}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  title={playingSection === `${sectionKey}-${index}` && isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
                >
                  {playingSection === `${sectionKey}-${index}` && isPlaying ? 
                    <Pause size={16} className="text-blue-600" /> : 
                    <Play size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  }
                </button>
                
                <button
                  onClick={() => shareReading(reading.titulo || sectionName, reading.texto)}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  title="Compartilhar"
                >
                  <Share2 size={16} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                </button>
              </div>
            </div>
            
            {reading.referencia && (
              <p className={`text-sm font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} italic`} style={{ fontFamily: 'Gelasio, serif' }}>
                {reading.referencia}
              </p>
            )}

            {reading.refrao && (
              <div className={`p-4 rounded-xl mb-4 border-2 ${getCurrentColor().accent} ${getCurrentColor().text}`}>
                <p className="font-semibold" style={{ fontFamily: 'Gelasio, serif' }}>
                  <strong>R/. </strong>{reading.refrao}
                </p>
              </div>
            )}

            {reading.texto && (
              <div className={`${fontSizeClasses[fontSize]} leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} style={{ fontFamily: 'Gelasio, serif' }}>
                {formatTextWithVerses(reading.texto)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPrayers = () => {
    if (!liturgiaData.oracoes || activeSection !== 'todas' && activeSection !== 'oracoes') return null;

    return (
      <div className="mb-8">
        <h3 className={`text-xl font-bold mb-4 ${getCurrentColor().text}`} style={{ fontFamily: 'Gelasio, serif' }}>Orações</h3>
        {Object.entries(liturgiaData.oracoes).map(([key, value]) => {
          if (key === 'extras') {
            return value.map((extra, index) => (
              <div key={`extra-${index}`} className={`mb-4 p-4 rounded-xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} style={{ fontFamily: 'Gelasio, serif' }}>
                    {extra.titulo}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(extra.texto, `prayer-extra-${index}`)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      {playingSection === `prayer-extra-${index}` && isPlaying ? 
                        <Pause size={14} className="text-blue-600" /> : 
                        <Play size={14} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                      }
                    </button>
                    <button
                      onClick={() => shareReading(extra.titulo, extra.texto)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <Share2 size={14} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                  </div>
                </div>
                <div className={`${fontSizeClasses[fontSize]} leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} style={{ fontFamily: 'Gelasio, serif' }}>
                  {formatTextWithVerses(extra.texto)}
                </div>
              </div>
            ));
          } else {
            return (
              <div key={key} className={`mb-4 p-4 rounded-xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold capitalize ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} style={{ fontFamily: 'Gelasio, serif' }}>
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(value, `prayer-${key}`)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      {playingSection === `prayer-${key}` && isPlaying ? 
                        <Pause size={14} className="text-blue-600" /> : 
                        <Play size={14} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                      }
                    </button>
                    <button
                      onClick={() => shareReading(key, value)}
                      className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                    >
                      <Share2 size={14} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                  </div>
                </div>
                <div className={`${fontSizeClasses[fontSize]} leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} style={{ fontFamily: 'Gelasio, serif' }}>
                  {formatTextWithVerses(value)}
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderAntiphons = () => {
    if (!liturgiaData.antifonas || activeSection !== 'todas' && activeSection !== 'antifonas') return null;

    return (
      <div className="mb-8">
        <h3 className={`text-xl font-bold mb-4 ${getCurrentColor().text}`} style={{ fontFamily: 'Gelasio, serif' }}>Antífonas</h3>
        {Object.entries(liturgiaData.antifonas).map(([key, value]) => (
          <div key={key} className={`mb-4 p-4 rounded-xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold capitalize ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} style={{ fontFamily: 'Gelasio, serif' }}>
                {key}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakText(value, `antiphon-${key}`)}
                  className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  {playingSection === `antiphon-${key}` && isPlaying ? 
                    <Pause size={14} className="text-blue-600" /> : 
                    <Play size={14} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  }
                </button>
                <button
                  onClick={() => shareReading(key, value)}
                  className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <Share2 size={14} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                </button>
              </div>
            </div>
            <div className={`${fontSizeClasses[fontSize]} leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} style={{ fontFamily: 'Gelasio, serif' }}>
              {formatTextWithVerses(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'} mx-auto mb-4`}></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando liturgia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="text-center p-6">
          <AlertCircle className={`mx-auto mb-4 h-12 w-12 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Erro ao carregar</h2>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => fetchLiturgia(currentDate)}
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const sections = getDynamicSections();
  const currentColor = getCurrentColor();
  const calendar = generateLiturgicalCalendar();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
     {/* NEW: PWA Update Available Banner */}
      {showUpdateBanner && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-lg z-[100] p-4 bg-blue-600 text-white rounded-lg shadow-2xl flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <RefreshCw size={24} className="animate-spin-slow" />
            <div>
              <h4 className="font-bold">Nova versão disponível!</h4>
              <p className="text-sm opacity-90">Recarregue para aplicar a atualização.</p>
            </div>
          </div>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-md hover:bg-blue-100 transition-colors"
          >
            Atualizar
          </button>
        </div>
      )}      
      {/* Header - Simplificado para mobile */}
      <div className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <Menu size={24} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
            </button>
            <div>
              <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Liturgia Diária
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {liturgiaData?.data}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mostrar apenas quando offline */}
            {!isOnline && (
              <div className="p-2 rounded-full text-red-500" title="Sem conexão">
                <WifiOff size={16} />
              </div>
            )}
            
            {/* Install button */}
            {isInstallable && (
              <button
                onClick={installApp}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Instalar App"
              >
                <Download size={20} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
            )}

            {/* Calendar - apenas um calendário litúrgico */}
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <CalendarDays size={20} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
            </button>
            
            {/* Dark mode */}
            <button
              onClick={() => updateDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700" />}
            </button>

            {/* Font size controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const sizes = ['sm', 'base', 'lg', 'xl', '2xl'];
                  const currentIndex = sizes.indexOf(fontSize);
                  if (currentIndex > 0) {
                    updateFontSize(sizes[currentIndex - 1]);
                  }
                }}
                disabled={fontSize === 'sm'}
                className={`p-2 rounded-full transition-colors ${
                  fontSize === 'sm' 
                    ? 'text-gray-400 cursor-not-allowed opacity-50' 
                    : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
                title="Diminuir texto"
              >
                <Type size={12} />
              </button>
              
              {/* Type icon indicator */}
              {/* <div className={`p-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} title="Controles de tamanho do texto">
                <Type size={14} />
              </div> */}
              
              <button
                onClick={() => {
                  const sizes = ['sm', 'base', 'lg', 'xl', '2xl'];
                  const currentIndex = sizes.indexOf(fontSize);
                  if (currentIndex < sizes.length - 1) {
                    updateFontSize(sizes[currentIndex + 1]);
                  }
                }}
                disabled={fontSize === '2xl'}
                className={`p-2 rounded-full transition-colors ${
                  fontSize === '2xl' 
                    ? 'text-gray-400 cursor-not-allowed opacity-50'
                    : darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
                title="Aumentar texto"
              >
                <Type size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar view - melhorado com navegação */}
        {showCalendar && (
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => navigateMonth(-1)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ChevronLeft size={20} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
              
              <h4 className={`font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {calendar.monthName}
              </h4>
              
              <button
                onClick={() => navigateMonth(1)}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <ChevronRight size={20} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className={`p-2 text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {day}
                </div>
              ))}
              {calendar.days.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day ? (
                    <button
                      onClick={() => {
                        setCurrentDate(day.date);
                        setShowCalendar(false);
                      }}
                      className={`w-full h-full rounded-lg text-xs font-medium transition-colors ${
                        day.isToday
                          ? `bg-gradient-to-r ${currentColor.primary} text-white`
                          : day.isSelected
                          ? `border-2 ${currentColor.accent} ${currentColor.text}`
                          : darkMode
                          ? 'hover:bg-gray-700 text-gray-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      } ${!day.isToday && !day.isSelected ? getSeasonColor(day.liturgicalSeason) : ''}`}
                    >
                      {day.day}
                    </button>
                  ) : (
                    <div></div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-center">
              <div className={`inline-flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className={`w-3 h-3 rounded ${darkMode ? 'bg-purple-800/40 border border-purple-600/50' : 'bg-purple-100 border border-purple-200'}`}></div>
                <span>Advento/Quaresma</span>
                <div className={`w-3 h-3 rounded ml-2 ${darkMode ? 'bg-yellow-700/40 border border-yellow-600/50' : 'bg-yellow-100 border border-yellow-200'}`}></div>
                <span>Páscoa</span>
                <div className={`w-3 h-3 rounded ml-2 ${darkMode ? 'bg-green-800/40 border border-green-600/50' : 'bg-green-100 border border-green-200'}`}></div>
                <span>Tempo Comum</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation menu - com configurações de notificação e áudio */}
        {showMenu && (
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            {/* Seções de navegação */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {sections.map((section) => {
                const IconComponent = section.icon;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setShowMenu(false);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      activeSection === section.id
                        ? `bg-gradient-to-r ${currentColor.primary} text-white border-transparent`
                        : darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <IconComponent size={16} />
                      <span className="text-xs font-medium text-center">{section.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Configurações no menu */}
            <div className="space-y-3 pt-3 border-t border-gray-600">
              {/* Notificações */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationsEnabled ? 
                    <Bell size={16} className="text-blue-500" /> : 
                    <BellOff size={16} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
                  }
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Notificações
                  </span>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={`transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full p-1`}
                >
                  {notificationsEnabled ? 
                    <ToggleRight size={24} className="text-blue-500" /> : 
                    <ToggleLeft size={24} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  }
                </button>
              </div>

              {/* Configuração de horário da notificação */}
              {notificationsEnabled && (
                <div className="ml-6">
                  <label className={`block text-xs mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Horário do lembrete:
                  </label>
                  <input
                    type="time"
                    value={notificationTime}
                    onChange={(e) => {
                      updateNotificationTime(e.target.value);
                      // Re-schedule with new time
                      setTimeout(() => scheduleNotification(), 100);
                    }}
                    className={`w-full p-2 rounded-lg border text-xs ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Próximo lembrete: às {notificationTime} {new Date().toISOString().split('T')[0] >= new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') ? 'de amanhã' : 'de hoje'}
                  </p>
                </div>
              )}

              {/* Áudio */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {audioEnabled ? 
                    <Volume2 size={16} className="text-green-500" /> : 
                    <VolumeX size={16} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
                  }
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Áudio (Ler em voz alta)
                  </span>
                </div>
                <button
                  onClick={() => updateAudioEnabled(!audioEnabled)}
                  className={`transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full p-1`}
                >
                  {audioEnabled ? 
                    <ToggleRight size={24} className="text-green-500" /> : 
                    <ToggleLeft size={24} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {/* Liturgy information */}
        <div className={`p-6 rounded-2xl mb-6 bg-gradient-to-r ${currentColor.primary} text-white shadow-xl`}>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Gelasio, serif' }}>{liturgiaData?.liturgia}</h2>
          <div className="flex flex-wrap gap-4 text-sm opacity-90">
            <span>📅 {liturgiaData?.data}</span>
            <span>🎨 Cor: {liturgiaData?.cor}</span>
          </div>
        </div>

        {/* Section content */}
        <div className="space-y-6">
          {liturgiaData?.leituras?.primeiraLeitura && renderMultipleReadings(liturgiaData.leituras.primeiraLeitura, 'primeiraLeitura', 'Primeira Leitura')}
          {liturgiaData?.leituras?.segundaLeitura && renderMultipleReadings(liturgiaData.leituras.segundaLeitura, 'segundaLeitura', 'Segunda Leitura')}
          {liturgiaData?.leituras?.salmo && renderMultipleReadings(liturgiaData.leituras.salmo, 'salmo', 'Salmo Responsorial')}
          {liturgiaData?.leituras?.evangelho && renderMultipleReadings(liturgiaData.leituras.evangelho, 'evangelho', 'Evangelho')}
          {liturgiaData?.leituras?.extras && renderMultipleReadings(liturgiaData.leituras.extras, 'extras', 'Leituras Extras')}
          {renderPrayers()}
          {renderAntiphons()}

          {/* Vatican News Button */}
          {liturgiaData && currentDate && (
            <div className="mt-8 text-center">
              <a
                href={`https://www.vaticannews.va/pt/palavra-do-dia/${currentDate.substring(0, 4)}/${currentDate.substring(5, 7)}/${currentDate.substring(8, 10)}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r ${currentColor.primary}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <ExternalLink size={20} className="mr-2" />
                Liturgia diária Vatican News
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiturgiaApp;