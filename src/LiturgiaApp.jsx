import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Sun, Moon, Type, Menu, Book, Heart, Music, Cross, Scroll, Sparkles, AlertCircle, Download, Wifi, WifiOff } from 'lucide-react';

const LiturgiaApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState('base');
  const [activeSection, setActiveSection] = useState('todas');
  const [showMenu, setShowMenu] = useState(false);
  const [liturgiaData, setLiturgiaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // PWA states integrados
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Cores litúrgicas para estilização com melhor contraste para cor branca
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
      // Melhor contraste para cor branca no tema claro
      primary: darkMode ? 'from-gray-600 to-slate-600' : 'from-slate-700 to-gray-800',
      accent: darkMode ? 'border-gray-500 bg-gray-800/30' : 'border-gray-400 bg-gray-100',
      text: darkMode ? 'text-gray-200' : 'text-gray-700'
    }
  };

  const getCurrentColor = () => {
    const cor = liturgiaData?.cor || 'Branco';
    return liturgicalColors[cor] || liturgicalColors['Branco'];
  };

  // Buscar dados da API real - CORRIGIDO BUG DA DATA
  const fetchLiturgia = async (date) => {
    try {
      setLoading(true);
      setError(null);
      
      // CORREÇÃO: Usar a data diretamente sem criar novo objeto Date
      // que pode causar problemas de timezone
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
  };

  // PWA functionality integrada
  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Handle install prompt
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

    // Check if already installed
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
      
      if (outcome === 'accepted') {
        console.log('PWA instalado com sucesso');
      } else {
        console.log('Instalação cancelada pelo usuário');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  useEffect(() => {
    fetchLiturgia(currentDate);
  }, [currentDate]);

  // Adicionado tamanho 2xl para fonte maior
  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  // Função para formatar texto com números de versículos estilizados
  const formatTextWithVerses = (text) => {
    if (!text) return null;
    
    // Regex para encontrar números de versículos (ex: 1, 2, 15, etc.)
    // Procura por números no início de parágrafos ou após pontos
    const verseRegex = /(\s|^)(\d{1,3})([^\d])/g;
    
    return text.split('\n').map((paragrafo, pIndex) => {
      if (!paragrafo.trim()) return null;
      
      // Substituir números de versículos por spans estilizados
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

  // Seções dinâmicas baseadas nos dados disponíveis
  const getDynamicSections = () => {
    if (!liturgiaData) return [];
    
    const sections = [
      { id: 'todas', name: 'Todas as Seções', icon: Book, available: true }
    ];

    // Leituras
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

    // Extras (leituras adicionais)
    if (liturgiaData.leituras?.extras?.length > 0) {
      sections.push({ id: 'extras', name: 'Leituras Extras', icon: Sparkles, available: true });
    }

    // Orações
    if (liturgiaData.oracoes && Object.keys(liturgiaData.oracoes).length > 0) {
      sections.push({ id: 'oracoes', name: 'Orações', icon: Heart, available: true });
    }

    // Antífonas
    if (liturgiaData.antifonas && Object.keys(liturgiaData.antifonas).length > 0) {
      sections.push({ id: 'antifonas', name: 'Antífonas', icon: Scroll, available: true });
    }

    return sections;
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const renderMultipleReadings = (readings, sectionKey, sectionName) => {
    if (!readings || readings.length === 0) return null;

    return (
      <div key={sectionKey} className={`mb-8 ${activeSection !== 'todas' && activeSection !== sectionKey ? 'hidden' : ''}`}>
        {readings.map((reading, index) => (
          <div key={index} className={`mb-6 p-6 rounded-2xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className={`text-xl font-bold ${getCurrentColor().text}`}>
                {reading.titulo || sectionName}
              </h3>
              {readings.length > 1 && (
                <span className={`text-xs px-2 py-1 rounded-full ${getCurrentColor().accent} ${getCurrentColor().text}`}>
                  {reading.tipo || `Opção ${index + 1}`}
                </span>
              )}
            </div>
            
            {reading.referencia && (
              <p className={`text-sm font-medium mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} italic`}>
                {reading.referencia}
              </p>
            )}

            {reading.refrao && (
              <div className={`p-4 rounded-xl mb-4 border-2 ${getCurrentColor().accent} ${getCurrentColor().text}`}>
                <p className="font-semibold">
                  <strong>R/. </strong>{reading.refrao}
                </p>
              </div>
            )}

            {reading.texto && (
              <div className={`${fontSizeClasses[fontSize]} leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
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
        <h3 className={`text-xl font-bold mb-4 ${getCurrentColor().text}`}>Orações</h3>
        {Object.entries(liturgiaData.oracoes).map(([key, value]) => {
          if (key === 'extras') {
            return value.map((extra, index) => (
              <div key={`extra-${index}`} className={`mb-4 p-4 rounded-xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {extra.titulo}
                </h4>
                <div className={`${fontSizeClasses[fontSize]} leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {formatTextWithVerses(extra.texto)}
                </div>
              </div>
            ));
          } else {
            return (
              <div key={key} className={`mb-4 p-4 rounded-xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className={`font-semibold mb-2 capitalize ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </h4>
                <div className={`${fontSizeClasses[fontSize]} leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
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
        <h3 className={`text-xl font-bold mb-4 ${getCurrentColor().text}`}>Antífonas</h3>
        {Object.entries(liturgiaData.antifonas).map(([key, value]) => (
          <div key={key} className={`mb-4 p-4 rounded-xl border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h4 className={`font-semibold mb-2 capitalize ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {key}
            </h4>
            <div className={`${fontSizeClasses[fontSize]} leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Header */}
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
            {/* Status de conexão */}
            <div className={`p-2 rounded-full ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
              {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            </div>
            
            {/* Botão de instalação */}
            {isInstallable && (
              <button
                onClick={installApp}
                className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                title="Instalar App"
              >
                <Download size={20} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
              </button>
            )}
            
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <Calendar size={20} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
            </button>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700" />}
            </button>

            <button
              onClick={() => {
                const sizes = ['sm', 'base', 'lg', 'xl', '2xl'];
                const currentIndex = sizes.indexOf(fontSize);
                const nextIndex = (currentIndex + 1) % sizes.length;
                setFontSize(sizes[nextIndex]);
              }}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <Type size={20} className={darkMode ? 'text-gray-300' : 'text-gray-700'} />
            </button>
          </div>
        </div>

        {/* Date Picker */}
        {showDatePicker && (
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className={`w-full p-3 rounded-xl border-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        )}

        {/* Menu de navegação */}
        {showMenu && (
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="grid grid-cols-2 gap-2">
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
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {/* Informações da liturgia */}
        <div className={`p-6 rounded-2xl mb-6 bg-gradient-to-r ${currentColor.primary} text-white shadow-xl`}>
          <h2 className="text-xl font-bold mb-2">{liturgiaData?.liturgia}</h2>
          <div className="flex flex-wrap gap-4 text-sm opacity-90">
            <span>📅 {liturgiaData?.data}</span>
            <span>🎨 Cor: {liturgiaData?.cor}</span>
          </div>
        </div>

        {/* Conteúdo das seções */}
        <div className="space-y-6">
          {liturgiaData?.leituras?.primeiraLeitura && renderMultipleReadings(liturgiaData.leituras.primeiraLeitura, 'primeiraLeitura', 'Primeira Leitura')}
          {liturgiaData?.leituras?.segundaLeitura && renderMultipleReadings(liturgiaData.leituras.segundaLeitura, 'segundaLeitura', 'Segunda Leitura')}
          {liturgiaData?.leituras?.salmo && renderMultipleReadings(liturgiaData.leituras.salmo, 'salmo', 'Salmo Responsorial')}
          {liturgiaData?.leituras?.evangelho && renderMultipleReadings(liturgiaData.leituras.evangelho, 'evangelho', 'Evangelho')}
          {liturgiaData?.leituras?.extras && renderMultipleReadings(liturgiaData.leituras.extras, 'extras', 'Leituras Extras')}
          {renderPrayers()}
          {renderAntiphons()}
        </div>
      </div>
    </div>
  );
};

export default LiturgiaApp;