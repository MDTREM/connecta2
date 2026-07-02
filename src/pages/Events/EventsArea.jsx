import { useState, useEffect, useRef } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { 
  Calendar, MessageSquare, Home, Play, Upload, X, Check,
  User, MapPin, Phone, Clock, Star, Users, Camera, Save, Edit, Trash2, QrCode,
  Bell, LogOut, Layers, ChevronDown, ChevronUp
} from 'lucide-react';
import { uploadAvatar, uploadCover, uploadEventImage, uploadVideoFile } from '../../firebase/storage';

// Helper component for Date Roller Picker
function DateRollerPicker({ label, value, onChange, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      let d = String(today.getDate()).padStart(2, '0');
      let m = String(today.getMonth() + 1).padStart(2, '0');
      let y = String(today.getFullYear());

      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          y = parts[0];
          m = parts[1];
          d = parts[2];
        }
      }
      setSelectedDay(d);
      setSelectedMonth(m);
      setSelectedYear(y);
    }
  }, [isOpen, value]);

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = Array.from({ length: 15 }, (_, i) => String(2025 + i));

  const handleConfirm = () => {
    const formattedDate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const displayValue = value ? (() => {
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  })() : '';

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(true)}
        className="input-field"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: '#ffffff',
          height: '42px',
          padding: '0 12px',
          borderRadius: '12px',
          border: '1.5px solid #eee',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '0.85rem', color: value ? '#2d2d2d' : '#aaa' }}>
          {displayValue || 'dd/mm/aaaa'}
        </span>
        <Calendar size={16} style={{ color: '#f28d1a' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '360px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d2d2d' }}>{label}</span>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '16px', padding: '12px', marginBottom: '20px' }}>
              {/* Day */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#888', marginBottom: '6px' }}>DIA</span>
                <div style={{ height: '140px', overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {days.map(d => {
                    const isSelected = selectedDay === d;
                    return (
                      <button
                        key={d}
                        ref={(el) => { if (el && isSelected) el.scrollIntoView({ block: 'nearest' }); }}
                        type="button"
                        onClick={() => setSelectedDay(d)}
                        style={{
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 0',
                          width: '100%',
                          backgroundColor: isSelected ? '#f28d1a' : 'transparent',
                          color: isSelected ? '#ffffff' : '#2d2d2d',
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Month */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#888', marginBottom: '6px' }}>MÊS</span>
                <div style={{ height: '140px', overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {months.map(m => {
                    const isSelected = selectedMonth === m;
                    return (
                      <button
                        key={m}
                        ref={(el) => { if (el && isSelected) el.scrollIntoView({ block: 'nearest' }); }}
                        type="button"
                        onClick={() => setSelectedMonth(m)}
                        style={{
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 0',
                          width: '100%',
                          backgroundColor: isSelected ? '#f28d1a' : 'transparent',
                          color: isSelected ? '#ffffff' : '#2d2d2d',
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Year */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#888', marginBottom: '6px' }}>ANO</span>
                <div style={{ height: '140px', overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {years.map(y => {
                    const isSelected = selectedYear === y;
                    return (
                      <button
                        key={y}
                        ref={(el) => { if (el && isSelected) el.scrollIntoView({ block: 'nearest' }); }}
                        type="button"
                        onClick={() => setSelectedYear(y)}
                        style={{
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 0',
                          width: '100%',
                          backgroundColor: isSelected ? '#f28d1a' : 'transparent',
                          color: isSelected ? '#ffffff' : '#2d2d2d',
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  backgroundColor: '#ffffff',
                  color: '#555',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#f28d1a',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for Time Roller Picker
function TimeRollerPicker({ label, value, onChange, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');

  useEffect(() => {
    if (isOpen) {
      let h = '12';
      let min = '00';

      if (value) {
        const parts = value.split(':');
        if (parts.length === 2) {
          h = parts[0];
          min = parts[1];
        }
      }
      setSelectedHour(h);
      setSelectedMinute(min);
    }
  }, [isOpen, value]);

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const handleConfirm = () => {
    const formattedTime = `${selectedHour}:${selectedMinute}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(true)}
        className="input-field"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: '#ffffff',
          height: '42px',
          padding: '0 12px',
          borderRadius: '12px',
          border: '1.5px solid #eee',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '0.85rem', color: value ? '#2d2d2d' : '#aaa' }}>
          {value || '--:--'}
        </span>
        <Clock size={16} style={{ color: '#f28d1a' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '320px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2d2d2d' }}>{label}</span>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', backgroundColor: '#f9f9f9', borderRadius: '16px', padding: '12px', marginBottom: '20px' }}>
              {/* Hour */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#888', marginBottom: '6px' }}>HORA</span>
                <div style={{ height: '140px', overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {hours.map(h => {
                    const isSelected = selectedHour === h;
                    return (
                      <button
                        key={h}
                        ref={(el) => { if (el && isSelected) el.scrollIntoView({ block: 'nearest' }); }}
                        type="button"
                        onClick={() => setSelectedHour(h)}
                        style={{
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 0',
                          width: '100%',
                          backgroundColor: isSelected ? '#f28d1a' : 'transparent',
                          color: isSelected ? '#ffffff' : '#2d2d2d',
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minute */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#888', marginBottom: '6px' }}>MINUTO</span>
                <div style={{ height: '140px', overflowY: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {minutes.map(m => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        ref={(el) => { if (el && isSelected) el.scrollIntoView({ block: 'nearest' }); }}
                        type="button"
                        onClick={() => setSelectedMinute(m)}
                        style={{
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 0',
                          width: '100%',
                          backgroundColor: isSelected ? '#f28d1a' : 'transparent',
                          color: isSelected ? '#ffffff' : '#2d2d2d',
                          fontWeight: isSelected ? '600' : '400',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  backgroundColor: '#ffffff',
                  color: '#555',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#f28d1a',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventsArea({ onOpenChat, onToggleNotifications, unreadNotificationsCount, onLogout, onGoToHome }) {
  const { 
    currentUser, events, addEvent, updateEvent, addCommissioner, removeCommissioner,
    linkExistingCommissionerToEvent, updateCommissionerRates, addVideo, 
    setUsers, deleteEvent, visualLayoutSettings, updateUserProfile, categories, users,
    videos, deleteVideo, updateVideo, validateTicket, orders
  } = useFirebaseMock();

  const eventCategoriesFromDb = categories ? categories.filter(c => c.type === 'eventos').map(c => c.label) : [];
  const eventCategoriesList = eventCategoriesFromDb.length > 0 
    ? eventCategoriesFromDb 
    : ['Eventos - Culturais e Festivais', 'Eventos - Festas e Shows', 'Eventos - Universitários e Repúblicas'];

  const [ticketFilterEventId, setTicketFilterEventId] = useState('all');
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('connecta_organizer_active_tab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('connecta_organizer_active_tab', activeTab);
  }, [activeTab]);

  // Saque modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPixKey, setWithdrawPixKey] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Portaria Scanner states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerInputValue, setScannerInputValue] = useState('');
  const [scannerResult, setScannerResult] = useState(null);
  const [scannerFilterEventId, setScannerFilterEventId] = useState('all');
  const [scannerSearchTerm, setScannerSearchTerm] = useState('');
  const [html5QrcodeLoaded, setHtml5QrcodeLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerTab, setScannerTab] = useState('camera'); // 'camera' or 'list'
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const [offlineSyncMessage, setOfflineSyncMessage] = useState('');

  useEffect(() => {
    if (showScannerModal && !html5QrcodeLoaded) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode";
      script.onload = () => {
        setHtml5QrcodeLoaded(true);
      };
      script.onerror = (err) => {
        console.error("Erro ao carregar html5-qrcode:", err);
      };
      document.body.appendChild(script);
    }
  }, [showScannerModal, html5QrcodeLoaded]);

  const scannerRef = useRef(null);

  useEffect(() => {
    if (showScannerModal && cameraActive && html5QrcodeLoaded && scannerTab === 'camera') {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {});
          }
        } catch (e) {}
      }

      try {
        const scannerInstance = new window.Html5Qrcode("reader");
        scannerRef.current = scannerInstance;

        scannerInstance.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const min = Math.min(width, height);
              return { width: Math.round(min * 0.8), height: Math.round(min * 0.8) };
            }
          },
          (decodedText) => {
            // Executa com um pequeno delay para evitar conflito de thread no html5-qrcode
            setTimeout(() => {
              if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop()
                  .then(() => {
                    handleTicketScanSubmit(decodedText);
                    setCameraActive(false);
                  })
                  .catch((err) => {
                    console.error("Erro ao parar scanner no callback de sucesso:", err);
                    handleTicketScanSubmit(decodedText);
                    setCameraActive(false);
                  });
              } else {
                handleTicketScanSubmit(decodedText);
                setCameraActive(false);
              }
            }, 100);
          },
          () => {
            // erro de leitura silencioso
          }
        ).catch(err => {
          console.error("Erro ao iniciar câmera no scanner:", err);
          alert("Não foi possível acessar a câmera do dispositivo. Por favor, dê permissão ou use a validação manual/lista.");
          setCameraActive(false);
        });
      } catch (err) {
        console.error("Erro ao instanciar Html5Qrcode:", err);
      }
    }

    return () => {
      if (scannerRef.current) {
        const instance = scannerRef.current;
        scannerRef.current = null;
        try {
          if (instance.isScanning) {
            instance.stop()
              .then(() => {
                try {
                  instance.clear();
                } catch (e) {}
              })
              .catch(err => console.error("Erro ao desligar câmera no cleanup:", err));
          }
        } catch (err) {
          console.error("Erro síncrono no cleanup:", err);
        }
      }
    };
  }, [showScannerModal, cameraActive, html5QrcodeLoaded, scannerTab]);

  const handleTicketScanSubmit = async (customCode) => {
    const codeToValidate = customCode || scannerInputValue;
    if (!codeToValidate) return;

    setScannerResult({ loading: true });
    
    // Suporta formato com ou sem '#' e limpa espaços
    const formattedCode = codeToValidate.replace('Ticket #', '').replace('#', '').trim();
    
    if (isOfflineMode) {
      // MODO OFFLINE ATIVO
      const storageKey = `connecta_offline_tickets_${currentUser.id}`;
      const savedData = localStorage.getItem(storageKey);
      if (!savedData) {
        setScannerResult({ success: false, message: 'Nenhuma base offline carregada! Por favor, ative a internet e clique em "Baixar Ingressos".' });
        return;
      }

      let localTickets = [];
      try {
        localTickets = JSON.parse(savedData);
      } catch (e) {
        setScannerResult({ success: false, message: 'Erro ao ler a base offline local.' });
        return;
      }

      const cleanId = formattedCode.toUpperCase();
      const ticketIndex = localTickets.findIndex(o => o.id.toUpperCase() === cleanId);
      
      if (ticketIndex === -1) {
        setScannerResult({ success: false, message: 'Ingresso não encontrado na base offline local!' });
        return;
      }

      const ticket = localTickets[ticketIndex];
      if (ticket.type !== 'ticket') {
        setScannerResult({ success: false, message: 'Este ID não corresponde a um ingresso!' });
        return;
      }

      if (scannerFilterEventId && scannerFilterEventId !== 'all' && ticket.eventId !== scannerFilterEventId) {
        const selectedEvent = myEvents.find(e => e.id === scannerFilterEventId);
        setScannerResult({ 
          success: false, 
          message: `Este ingresso pertence ao evento "${ticket.eventName}", mas a validação está configurada apenas para o evento "${selectedEvent?.name || 'evento selecionado'}"!` 
        });
        return;
      }

      if (ticket.status === 'checked_in') {
        setScannerResult({ 
          success: false, 
          message: `Ingresso já utilizado! Entrada offline realizada em ${ticket.checkInTime || 'horário desconhecido'}.` 
        });
        return;
      }

      // Sucesso no check-in offline!
      const checkInTime = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      // Atualizar o status localmente
      ticket.status = 'checked_in';
      ticket.checkInTime = checkInTime;
      localTickets[ticketIndex] = ticket;
      
      // Salvar de volta na base offline local
      localStorage.setItem(storageKey, JSON.stringify(localTickets));

      // Adicionar na fila de sincronização pendente
      const queueKey = `connecta_offline_sync_queue_${currentUser.id}`;
      const queueData = localStorage.getItem(queueKey);
      let syncQueue = queueData ? JSON.parse(queueData) : [];
      syncQueue.push({ id: ticket.id, checkInTime });
      localStorage.setItem(queueKey, JSON.stringify(syncQueue));

      setScannerResult({ 
        success: true, 
        message: 'Ingresso validado offline com sucesso! Entrada liberada.',
        ticket: { ...ticket }
      });
      setScannerInputValue('');
      return;
    }

    // MODO ONLINE PADRÃO
    const res = await validateTicket(formattedCode, currentUser.id, scannerFilterEventId);
    if (res.success) {
      setScannerResult({ success: true, message: res.message, ticket: res.ticket });
      setScannerInputValue('');
    } else {
      setScannerResult({ success: false, message: res.message });
    }
  };

  const handleDownloadOfflineTickets = () => {
    setIsSyncingOffline(true);
    setOfflineSyncMessage('Baixando ingressos do banco...');

    setTimeout(() => {
      // 1. Filtrar todos os ingressos pertencentes aos eventos deste organizador
      const myEventIds = myEvents.map(e => e.id);
      const myTickets = orders.filter(o => o.type === 'ticket' && myEventIds.includes(o.eventId));

      // 2. Salvar no localStorage
      const storageKey = `connecta_offline_tickets_${currentUser.id}`;
      localStorage.setItem(storageKey, JSON.stringify(myTickets));

      setIsSyncingOffline(false);
      setOfflineSyncMessage(`Pronto! ${myTickets.length} ingressos baixados para uso offline.`);
      setTimeout(() => setOfflineSyncMessage(''), 3000);
    }, 800);
  };

  const handleSyncOfflineCheckins = async () => {
    const queueKey = `connecta_offline_sync_queue_${currentUser.id}`;
    const queueData = localStorage.getItem(queueKey);
    if (!queueData) {
      setOfflineSyncMessage('Nenhum check-in offline pendente para sincronizar.');
      setTimeout(() => setOfflineSyncMessage(''), 3000);
      return;
    }

    let syncQueue = [];
    try {
      syncQueue = JSON.parse(queueData);
    } catch (e) {
      localStorage.removeItem(queueKey);
      return;
    }

    if (syncQueue.length === 0) {
      setOfflineSyncMessage('Nenhum check-in offline pendente para sincronizar.');
      setTimeout(() => setOfflineSyncMessage(''), 3000);
      return;
    }

    setIsSyncingOffline(true);
    setOfflineSyncMessage(`Sincronizando ${syncQueue.length} check-ins offline com o servidor...`);

    let successCount = 0;
    for (const item of syncQueue) {
      try {
        const res = await validateTicket(item.id, currentUser.id, 'all');
        if (res.success) {
          successCount++;
        }
      } catch (err) {
        console.error("Erro ao sincronizar check-in offline:", err);
      }
    }

    // Limpar fila
    localStorage.removeItem(queueKey);
    setIsSyncingOffline(false);
    setOfflineSyncMessage(`Sincronização concluída! ${successCount} de ${syncQueue.length} check-ins atualizados no banco.`);
    setTimeout(() => setOfflineSyncMessage(''), 4000);
  };

  const handleCloseScanner = () => {
    setCameraActive(false);
    setTimeout(() => {
      setShowScannerModal(false);
      setScannerResult(null);
    }, 150);
  };

  // Edit profile states
  const [editingField, setEditingField] = useState(null); // 'name', 'description', 'phone', 'address', 'category', 'openingHours'
  const [editValue, setEditValue] = useState('');

  // Form states for new event
  const [evName, setEvName] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evImages, setEvImages] = useState(Array(10).fill(''));
  const [evDescription, setEvDescription] = useState('');
  const [homepageBanner, setHomepageBanner] = useState('');

  const handleHomepageBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const eventId = selectedEventId || 'temp_' + Date.now();
        const url = await uploadEventImage(file, currentUser.id, eventId);
        setHomepageBanner(url);
      } catch (error) {
        console.error(error);
        alert('Erro ao fazer upload do banner de destaque.');
      }
    }
  };

  // Structured date/time states
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesStartTime, setSalesStartTime] = useState('');

  // Structured address states
  const [venueName, setVenueName] = useState('');
  const [addressCep, setAddressCep] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressNeighborhood, setAddressNeighborhood] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');

  // Online transmission link
  const [onlineLink, setOnlineLink] = useState('');

  // Handlers for event images
  const handleEventImageUpload = async (idx, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const eventId = selectedEventId || 'temp_' + Date.now();
        const url = await uploadEventImage(file, currentUser.id, eventId);
        setEvImages(prev => {
          const updated = [...prev];
          updated[idx] = url;
          return updated;
        });
      } catch (error) {
        console.error(error);
        alert('Erro ao fazer upload da imagem do evento.');
      }
    }
  };


  const handleRemoveEventImage = (idx, e) => {
    if (e) e.stopPropagation();
    setEvImages(prev => {
      const updated = [...prev];
      updated[idx] = '';
      return updated;
    });
  };
  
  // Dynamic Event Form States
  const [batches, setBatches] = useState([{ name: 'Lote Único', price: '', limit: '', type: 'pago', startDate: '', startTime: '', endDate: '', endTime: '' }]);
  const [eventCategory, setEventCategory] = useState('');
  const [ticketTypeSelection, setTicketTypeSelection] = useState('pago'); // 'pago' or 'gratuito'
  const [tags, setTags] = useState('');
  const [eventType, setEventType] = useState('fisico'); // 'fisico' or 'virtual'
  const [hasNumberedSeats, setHasNumberedSeats] = useState(false);
  const [totalSeats, setTotalSeats] = useState('');
  const [feeOption, setFeeOption] = useState('absorver'); // 'absorver' or 'repassar'
  const [maxTicketsPerCPF, setMaxTicketsPerCPF] = useState('');
  const [minAge, setMinAge] = useState('0');
  const [coupons, setCoupons] = useState([]); // Array of { code, discountType: 'fixed'|'percent', value }
  const defaultPolicyTemplate = `1. REEMBOLSO E CANCELAMENTO:
Atenção! O produtor é o único responsável pela devolução de valores referentes ao(s) ingresso(s). Em caso de arrependimento da compra, o reembolso do valor do ingresso somente será efetuado caso a solicitação seja feita no prazo de até 7 dias a contar da data da compra e desde que realizado o pedido de devolução com no máximo 48h de antecedência do horário de início do evento. Situações fora do descrito estarão condicionadas a decisão dos produtores do evento.

2. ENTRADA E CLASSIFICAÇÃO:
É proibida a entrada de menores de idade sem o acompanhamento e autorização por escrito dos pais ou responsáveis legais. Apresentação de documento oficial com foto é obrigatória na portaria.

3. USO DE IMAGEM:
Ao adquirir o ingresso, o portador autoriza a captação e utilização de sua imagem e voz em fotografias, vídeos e materiais promocionais do evento, sem direito a compensação financeira.`;

  const [policy, setPolicy] = useState(defaultPolicyTemplate);

  // Promoter states
  const [commName, setCommName] = useState('');
  const [commCode, setCommCode] = useState('');
  const [commEmail, setCommEmail] = useState('');
  const [commPhone, setCommPhone] = useState('');
  const [commPassword, setCommPassword] = useState('');
  const [commAvatar, setCommAvatar] = useState('');
  const [commRate, setCommRate] = useState('10');
  const [commDiscount, setCommDiscount] = useState('0');
  const [commFormMode, setCommFormMode] = useState('new'); // 'new' or 'existing'
  const [selectedExistingCommId, setSelectedExistingCommId] = useState('');
  const [editingCommCode, setEditingCommCode] = useState(null);
  const [expandedCommCode, setExpandedCommCode] = useState(null);
  const [editCommRate, setEditCommRate] = useState('10');
  const [editCommDiscount, setEditCommDiscount] = useState('0');
  const [generatedLink, setGeneratedLink] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [batchSalesMode, setBatchSalesMode] = useState('sequential');

  // Reels upload states
  const [vidTitle, setVidTitle] = useState('');
  const [reelsDesc, setReelsDesc] = useState('');
  const [reelsVideoUrl, setReelsVideoUrl] = useState('');
  const [reelsVideoName, setReelsVideoName] = useState('');
  const [reelsEventId, setReelsEventId] = useState('');
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [showTaxInfoModal, setShowTaxInfoModal] = useState(false);
  const [reelsFile, setReelsFile] = useState(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [foryouSubTab, setForyouSubTab] = useState('upload');
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDesc, setEditVideoDesc] = useState('');
  const [editVideoLinkedId, setEditVideoLinkedId] = useState('');
  const [isEditLinkDropdownOpen, setIsEditLinkDropdownOpen] = useState(false);


  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReelsVideoUrl(url);
      setReelsVideoName(file.name);
      setReelsFile(file);
    }
  };

  const parseEventDate = (ev) => {
    if (ev.startDate) {
      return new Date(`${ev.startDate}T${ev.startTime || '00:00'}`);
    }
    if (ev.date) {
      const clean = ev.date.split(' até ')[0].split(' às ')[0].split(' AS ')[0];
      const time = ev.date.includes(' às ') ? ev.date.split(' às ')[1] : '00:00';
      if (clean.includes('-')) {
        const parts = clean.split('-');
        if (parts[0].length === 4) return new Date(`${clean}T${time}`);
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${time}`);
      } else if (clean.includes('/')) {
        const parts = clean.split('/');
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${time}`);
      }
    }
    return new Date(2099, 11, 31);
  };

  const myEvents = events ? events.filter(e => e.organizerId === currentUser?.id).sort((a, b) => parseEventDate(a) - parseEventDate(b)) : [];
  const organizerTickets = (orders || []).filter(o => o.type === 'ticket' && myEvents.some(me => me.id === o.eventId));

  // Compute sales stats
  let totalTicketsSold = 0;
  let grossSales = 0;
  let freeTicketsClaimed = 0;
  myEvents.forEach(e => {
    if (e && e.batches && Array.isArray(e.batches)) {
      e.batches.forEach(b => {
        const soldQty = parseInt(b.sold || 0, 10);
        const ticketPrice = parseFloat(b.price || 0);
        if (!isNaN(soldQty) && soldQty > 0) {
          totalTicketsSold += soldQty;
          if (ticketPrice === 0) {
            freeTicketsClaimed += soldQty;
          }
        }
        if (!isNaN(soldQty) && !isNaN(ticketPrice) && soldQty > 0) {
          grossSales += soldQty * ticketPrice;
        }
      });
    }
  });

  const ticketsCommRate = (visualLayoutSettings?.commissions?.tickets !== undefined ? parseFloat(visualLayoutSettings.commissions.tickets) : 10);
  const netEarnings = grossSales * (1 - ticketsCommRate / 100);
  const withdrawableBalance = isNaN(netEarnings) ? 0 : netEarnings;

  const handleAddBatch = (type = 'pago') => {
    setBatches([...batches, { name: '', type, price: type === 'gratuito' ? '0' : '', limit: '', startDate: '', startTime: '', endDate: '', endTime: '', sold: 0, feeOption: 'repassar', active: true }]);
  };

  const handleRemoveBatch = (idx) => {
    if (batches.length > 1) {
      setBatches(batches.filter((_, i) => i !== idx));
    }
  };

  const handleBatchChange = (idx, field, val) => {
    setBatches(batches.map((b, i) => {
      if (i !== idx) return b;
      const updated = { ...b, [field]: val };
      if (field === 'type' && val === 'gratuito') {
        updated.price = '0';
      }
      return updated;
    }));
  };

  const handleAddCoupon = () => {
    setCoupons([...coupons, { code: '', discountType: 'percent', value: '' }]);
  };

  const handleRemoveCoupon = (idx) => {
    setCoupons(coupons.filter((_, i) => i !== idx));
  };

  const handleCouponChange = (idx, field, val) => {
    setCoupons(coupons.map((c, i) => {
      if (i !== idx) return c;
      return { ...c, [field]: val };
    }));
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setEvName('');
    setEvDate('');
    setEvLocation('');
    setEvDescription('');
    setEvImages(Array(10).fill(''));
    setBatches([{ name: 'Lote Único', price: '', limit: '', type: 'pago', startDate: '', startTime: '', endDate: '', endTime: '', active: true }]);
    setBatchSalesMode('sequential');
    setEventCategory('');
    setTags('');
    setEventType('fisico');
    setHasNumberedSeats(false);
    setTotalSeats('');
    setFeeOption('absorver');
    setMaxTicketsPerCPF('');
    setMinAge('0');
    setCoupons([]);
    setPolicy(defaultPolicyTemplate);
    setHomepageBanner('');

    // Reset novos states estruturados
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setSalesStartDate('');
    setSalesStartTime('');
    setVenueName('');
    setAddressCep('');
    setAddressStreet('');
    setAddressNumber('');
    setAddressComplement('');
    setAddressNeighborhood('');
    setAddressCity('');
    setAddressState('');
    setOnlineLink('');
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!evName) {
      alert('Por favor, insira o nome do evento!');
      return;
    }

    let finalLocation = '';
    if (eventType === 'fisico') {
      if (!addressStreet || !addressNumber || !addressCity || !addressState) {
        alert('Por favor, preencha o endereço completo (Rua, Número, Cidade e Estado) para eventos físicos!');
        return;
      }
      finalLocation = venueName
        ? `${venueName} - ${addressStreet}, ${addressNumber}${addressComplement ? ` (${addressComplement})` : ''} - ${addressNeighborhood ? addressNeighborhood + ', ' : ''}${addressCity} - ${addressState}`
        : `${addressStreet}, ${addressNumber} ${addressComplement ? `(${addressComplement})` : ''} - ${addressNeighborhood}, ${addressCity} - ${addressState}, CEP: ${addressCep}`;
    } else {
      finalLocation = onlineLink ? `Virtual (Link: ${onlineLink})` : 'Virtual (Link de transmissão online)';
    }

    let finalDateStr = '';
    if (startDate && startTime) {
      finalDateStr = `${startDate} às ${startTime}`;
      if (endDate && endTime) {
        finalDateStr += ` até ${endDate} às ${endTime}`;
      }
    } else {
      finalDateStr = 'A definir';
    }

    const filteredImages = evImages.filter(img => img !== '');
    const mainImage = filteredImages[0] || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500';

    const parsedBatches = batches.map(b => ({
      name: b.name || 'Lote Único',
      type: b.type || 'pago',
      price: b.type === 'gratuito' ? 0 : parseFloat(b.price || 0),
      limit: parseInt(b.limit || 0),
      startDate: b.startDate || '',
      startTime: b.startTime || '',
      endDate: b.endDate || '',
      endTime: b.endTime || '',
      sold: b.sold || 0,
      feeOption: b.feeOption || 'repassar',
      active: b.active !== undefined ? b.active : true
    })).filter(b => b.limit > 0);

    if (parsedBatches.length === 0) {
      alert('É necessário ter pelo menos 1 lote com limite de ingressos maior que 0!');
      return;
    }

    const eventData = {
      name: evName,
      date: finalDateStr,
      location: finalLocation,
      startDate,
      startTime,
      endDate,
      endTime,
      salesStartDate,
      salesStartTime,
      venueName,
      addressCep,
      addressStreet,
      addressNumber,
      addressComplement,
      addressNeighborhood,
      addressCity,
      addressState,
      onlineLink,
      image: mainImage,
      cover: mainImage,
      images: filteredImages,
      description: evDescription,
      category: eventCategory,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      eventType,
      hasNumberedSeats,
      totalSeats: hasNumberedSeats ? parseInt(totalSeats || 0) : null,
      feeOption,
      maxTicketsPerCPF: maxTicketsPerCPF ? parseInt(maxTicketsPerCPF) : null,
      minAge: parseInt(minAge || 0),
      coupons: coupons.filter(c => c.code.trim() !== ''),
      policy: policy || defaultPolicyTemplate,
      homepageBanner,
      batchSalesMode
    };

    if (editingEventId) {
      const originalEv = events.find(ev => ev.id === editingEventId);
      const updatedBatches = parsedBatches.map(newB => {
        const origB = originalEv?.batches?.find(ob => ob.name.toLowerCase() === newB.name.toLowerCase());
        return {
          ...newB,
          sold: origB ? parseInt(origB.sold || 0) : 0
        };
      });

      updateEvent(editingEventId, {
        ...eventData,
        batches: updatedBatches
      });
      setEditingEventId(null);
      alert('Evento atualizado com sucesso!');
    } else {
      addEvent({
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        ...eventData,
        batches: parsedBatches,
        soldSeats: []
      });
      alert('Evento cadastrado com sucesso!');
    }

    // Reset Form
    resetEventForm();
    setActiveTab('events');
  };

  const handleCommissionerSubmit = async (e) => {
    e.preventDefault();
    const eventIdToUse = selectedEventId || (myEvents[0]?.id || '');
    if (!eventIdToUse) {
      alert('Selecione um evento para cadastrar o comissário!');
      return;
    }

    if (commFormMode === 'existing') {
      if (!selectedExistingCommId) {
        alert('Selecione um comissário existente!');
        return;
      }
      const res = await linkExistingCommissionerToEvent(eventIdToUse, {
        userId: selectedExistingCommId,
        rate: parseFloat(commRate || 10),
        discount: parseFloat(commDiscount || 0)
      });
      if (res.success) {
        setSelectedExistingCommId('');
        setCommRate('10');
        setCommDiscount('0');
        alert('Comissário existente vinculado com sucesso!');
      } else {
        alert(res.message || 'Erro ao vincular comissário.');
      }
      return;
    }

    if (!commName || !commEmail || !commPhone) {
      alert('Nome, e-mail e telefone são obrigatórios para criar o comissário!');
      return;
    }

    const finalCode = commCode.trim() || (commName.replace(/\s+/g, '').substring(0, 4).toUpperCase() + Math.floor(100 + Math.random() * 900));
    const finalPassword = commPassword.trim() || Math.random().toString(36).substring(2, 8);

    const res = await addCommissioner(eventIdToUse, {
      name: commName,
      email: commEmail,
      phone: commPhone,
      avatar: commAvatar,
      password: finalPassword,
      code: finalCode,
      rate: parseFloat(commRate || 10),
      discount: parseFloat(commDiscount || 0)
    });

    if (res.success) {
      const loginUrl = `${window.location.origin}/?login_email=${encodeURIComponent(commEmail.toLowerCase().trim())}&login_pass=${encodeURIComponent(finalPassword)}`;
      setGeneratedLink(loginUrl);

      setCommName('');
      setCommEmail('');
      setCommPhone('');
      setCommPassword('');
      setCommAvatar('');
      setCommCode('');
      setCommRate('10');
      setCommDiscount('0');
      
      alert('Comissário criado com sucesso e vinculado ao evento! O link de acesso direto para ele logar foi gerado abaixo.');
    } else {
      alert(res.message || 'Erro ao criar comissário.');
    }
  };

  const startEditing = (field, initialVal) => {
    setEditingField(field);
    setEditValue(initialVal);
  };

  const handleSaveField = (field) => {
    if (field === 'name') {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, name: editValue, companyName: editValue } : u));
      updateUserProfile(currentUser.id, { name: editValue, companyName: editValue });
    } else {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, [field]: editValue } : u));
      updateUserProfile(currentUser.id, { [field]: editValue });
    }
    setEditingField(null);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadAvatar(file, currentUser.id);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, logo: url, avatar: url } : u));
        updateUserProfile(currentUser.id, { logo: url, avatar: url });
      } catch (error) {
        console.error(error);
        alert('Erro ao enviar foto de perfil. Tente novamente, sô!');
      }
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadCover(file, currentUser.id);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, cover: url, banner: url } : u));
        updateUserProfile(currentUser.id, { cover: url, banner: url });
      } catch (error) {
        console.error(error);
        alert('Erro ao enviar imagem de capa. Tente novamente, sô!');
      }
    }
  };

  const handleMouseDown = (e) => {
    const container = e.currentTarget;
    container.dataset.isDown = 'true';
    container.dataset.startX = e.pageX - container.offsetLeft;
    container.dataset.scrollLeft = container.scrollLeft;
    container.dataset.hasDragged = 'false';
  };

  const handleMouseLeave = (e) => {
    const container = e.currentTarget;
    container.dataset.isDown = 'false';
  };

  const handleMouseUp = (e) => {
    const container = e.currentTarget;
    container.dataset.isDown = 'false';
  };

  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    if (container.dataset.isDown !== 'true') return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const startX = parseFloat(container.dataset.startX);
    const scrollLeft = parseFloat(container.dataset.scrollLeft);
    const walk = (x - startX) * 1.5;
    if (Math.abs(x - startX) > 8) {
      container.dataset.hasDragged = 'true';
    }
    container.scrollLeft = scrollLeft - walk;
  };

  const handleReelsSubmit = async (e) => {
    e.preventDefault();
    if (!vidTitle || !reelsVideoUrl) {
      alert('Adicione um vídeo e uma legenda, sô!');
      return;
    }
    setIsUploadingVideo(true);
    try {
      let finalVideoUrl = reelsVideoUrl;
      if (reelsFile) {
        finalVideoUrl = await uploadVideoFile(reelsFile, currentUser.id);
      }

      const linkedEv = events.find(ev => ev.id === reelsEventId);

      addVideo({
        title: vidTitle,
        description: reelsDesc,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        videoUrl: finalVideoUrl,
        poster: linkedEv ? linkedEv.image : currentUser.logo || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500',
        linkedType: linkedEv ? 'event' : null,
        linkedId: linkedEv ? linkedEv.id : null,
        linkedName: linkedEv ? linkedEv.name : null,
        linkedPrice: linkedEv ? (linkedEv.batches[0]?.price || 0) : null
      });

      setVidTitle('');
      setReelsDesc('');
      setReelsVideoUrl('');
      setReelsVideoName('');
      setReelsEventId('');
      setReelsFile(null);
      setActiveTab('dashboard');
      alert('Vídeo publicado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar vídeo. Tente novamente.');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // --- SUBVIEW 2: PROFILE VIEW (EVENTOS - SEM BOLD) ---
  const renderProfileView = () => {
    const followers = (users || []).filter(u => u.role === 'client' && u.following && u.following.includes(currentUser.id));

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }} className="animate-fade-in">
        {/* Cover */}
        <div style={{ width: '100%', height: '140px', position: 'relative', backgroundColor: '#fafafa', borderRadius: '16px', overflow: 'hidden' }}>
          <img 
            src={currentUser.cover || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 35"><rect width="100" height="35" fill="%23eaeaea"/></svg>'} 
            alt="cover" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <label 
            htmlFor="cover-file-upload-ev"
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Camera size={12} /> Alterar Capa
          </label>
          <input 
            type="file" 
            id="cover-file-upload-ev" 
            accept="image/*" 
            onChange={handleCoverUpload} 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Profile Logo and Floating Edit Info */}
        <div style={{ padding: '16px', position: 'relative', borderBottom: '1px solid #eee' }}>
          <div style={{
            position: 'absolute',
            top: '-36px',
            left: '16px',
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            border: '3px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            <img 
              src={currentUser.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} 
              alt="logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <label 
              htmlFor="logo-file-upload-ev"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                opacity: 0,
                transition: 'opacity 0.2s',
                cursor: 'pointer'
              }}
              className="logo-hover-upload"
            >
              <Camera size={16} />
            </label>
            <input 
              type="file" 
              id="logo-file-upload-ev" 
              accept="image/*" 
              onChange={handleLogoUpload} 
              style={{ display: 'none' }} 
            />
          </div>
          <style>{`
            .logo-hover-upload:hover { opacity: 1 !important; }
          `}</style>

          {/* Edit Profile Info Inline */}
          <div style={{ marginTop: '42px' }}>
            
            {/* NAME */}
            {editingField === 'name' ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                  className="input-field" 
                  style={{ padding: '6px 10px', fontSize: '0.82rem', margin: 0 }}
                />
                <button type="button" onClick={() => handleSaveField('name')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>{currentUser.companyName || currentUser.name}</h3>
                <button type="button" onClick={() => startEditing('name', currentUser.companyName || currentUser.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
              </div>
            )}

            {/* CATEGORY */}
            {editingField === 'category' ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', marginTop: '4px' }}>
                <select 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    borderRadius: '12px',
                    border: '2px solid #eaeaea',
                    backgroundColor: 'white',
                    fontWeight: 500
                  }}
                >
                  {eventCategoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button type="button" onClick={() => handleSaveField('category')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentUser.category || eventCategoriesList[0]}</span>
                <button type="button" onClick={() => startEditing('category', currentUser.category || eventCategoriesList[0])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
              </div>
            )}

            {/* DESCRIPTION */}
            {editingField === 'description' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', marginBottom: '8px' }}>
                <textarea 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                  className="input-field" 
                  style={{ padding: '8px', fontSize: '0.78rem', height: '60px', resize: 'none', margin: 0 }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '30px', width: 'auto' }}>Cancelar</button>
                  <button type="button" onClick={() => handleSaveField('description')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '30px', width: 'auto', backgroundColor: '#f28d1a' }}>Salvar</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, lineHeight: 1.35, flex: 1, whiteSpace: 'pre-wrap' }}>{currentUser.description || 'Nenhuma descrição informada.'}</p>
                <button type="button" onClick={() => startEditing('description', currentUser.description || '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '2px 0 0 0' }}><Edit size={12} /></button>
              </div>
            )}

            {/* ADDRESS */}
            <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '12px' }}>
              {editingField === 'address' ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <MapPin size={12} />
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0 }}
                  />
                  <button type="button" onClick={() => handleSaveField('address')} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={12} /></button>
                  <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto' }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} style={{ color: '#aaa' }} /> 
                  <span style={{ color: '#555' }}>Endereço:</span> {currentUser.address}
                  <button type="button" onClick={() => startEditing('address', currentUser.address)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
                </div>
              )}
            </div>



            {/* FOLLOWERS */}
            <div style={{ marginTop: '14px', borderTop: '1px solid #f2f2f2', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#2d2d2d' }}>
                <Users size={14} style={{ color: '#666' }} />
                <span>Seguidores:</span>
                <span style={{ fontWeight: 500, marginLeft: '4px' }}>{followers.length} clientes</span>
              </div>
              <div 
                style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginTop: '8px' }} 
                className="hide-scrollbar"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {followers.map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f9f9f9', padding: '4px 10px', borderRadius: '12px', border: '1px solid #eee', flexShrink: 0 }}>
                    <img src={f.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} alt={f.name} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.65rem', color: '#666' }}>{(f.name || '').split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Events Grid */}
        <div style={{ padding: '16px 0', paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Eventos Cadastrados</h4>
          
          {myEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.78rem' }}>
              Nenhum evento cadastrado ainda.
            </div>
          ) : (
            <div className="responsive-profile-grid" style={{ gap: '12px' }}>
              {myEvents.map(ev => {
                const activeBatch = ev.batches ? ev.batches.find(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) < parseInt(b.limit || 0, 10)) || ev.batches[0] : null;
                const isSoldOut = ev.batches && ev.batches.length > 0 ? ev.batches.every(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) >= parseInt(b.limit || 0, 10)) : false;
                const activeBatchSold = activeBatch ? parseInt(activeBatch.sold || 0, 10) : 0;
                const activeBatchLimit = activeBatch ? parseInt(activeBatch.limit || 0, 10) : 0;
                const percent = activeBatchLimit > 0 ? Math.round((activeBatchSold / activeBatchLimit) * 100) : 0;
                return (
                  <div 
                    key={ev.id}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '16px',
                      padding: '10px',
                      position: 'relative',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <img src={ev.image} alt={ev.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }} />
                    <div style={{ padding: '4px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} />
                        <span>
                          {ev.startDate ? ev.startDate.split('-').reverse().join('/') : ev.date?.split(' até ')[0]}
                          {ev.startTime ? ` às ${ev.startTime}` : ''}
                        </span>
                      </div>
                      <h5 style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</h5>
                      <div style={{ fontSize: '0.68rem', color: '#777' }}>Local: {ev.venueName || ev.location?.split(' - ')[0]}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid #f9f9f9', paddingTop: '6px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#888' }}>{activeBatch?.name || 'Lote'}</span>
                        <strong style={{ fontSize: '0.74rem', color: '#f28d1a', fontWeight: 500 }}>
                          {isSoldOut ? 'Esgotado' : `R$ ${activeBatch.price.toFixed(2)}`}
                        </strong>
                      </div>

                      {activeBatch && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#777', marginBottom: '2px' }}>
                            <span>Progresso:</span>
                            <span>{percent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', backgroundColor: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2px' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    );
  };


  const renderScannerModal = () => {
    const filteredTickets = organizerTickets
      .filter(o => scannerFilterEventId === 'all' ? true : o.eventId === scannerFilterEventId)
      .filter(o => {
        if (!scannerSearchTerm.trim()) return true;
        const term = scannerSearchTerm.toLowerCase();
        return (o.customerName || '').toLowerCase().includes(term) || 
               (o.id || '').toLowerCase().includes(term) ||
               (o.eventName || '').toLowerCase().includes(term);
      })
      .sort((a, b) => {
        const isCheckedA = a.status === 'checked_in';
        const isCheckedB = b.status === 'checked_in';
        if (isCheckedA && !isCheckedB) return -1;
        if (!isCheckedA && isCheckedB) return 1;
        if (isCheckedA && isCheckedB) {
          // Sort by check-in time descending (most recent first)
          return (b.checkInTime || '').localeCompare(a.checkInTime || '');
        }
        return (a.customerName || '').localeCompare(b.customerName || '');
      });

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }} onClick={handleCloseScanner}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Validação de Portaria</h3>
              <span style={{ fontSize: '0.65rem', color: '#777' }}>Controle de entrada em tempo real</span>
            </div>
            <button 
              onClick={handleCloseScanner}
              style={{ background: '#f5f5f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Main Validation Panel (Always mounted!) */}
          <>
            {/* Event Selector (Global for both camera and list validation) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>
                Selecionar Evento
              </label>
              <select
                value={scannerFilterEventId}
                onChange={(e) => {
                  setScannerFilterEventId(e.target.value);
                  setScannerResult(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1.5px solid #eee',
                  fontSize: '0.8rem',
                  outline: 'none',
                  backgroundColor: '#fafafa',
                  fontWeight: 500,
                  color: '#333'
                }}
              >
                <option value="all">Todos os eventos</option>
                {myEvents.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {/* Offline Mode Controls */}
            <div style={{ 
              backgroundColor: isOfflineMode ? '#fff3e0' : '#f8f9fa',
              borderRadius: '16px',
              padding: '12px',
              marginBottom: '14px',
              border: isOfflineMode ? '1px solid #ffe0b2' : '1px solid #eee',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#333' }}>
                  Modo Offline da Portaria
                </span>
                <label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px' }}>
                  <input 
                    type="checkbox" 
                    checked={isOfflineMode}
                    onChange={(e) => {
                      setIsOfflineMode(e.target.checked);
                      setScannerResult(null);
                    }}
                    style={{ opacity: 0, width: 0, height: 0 }} 
                  />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: isOfflineMode ? '#f28d1a' : '#ccc',
                    borderRadius: '20px',
                    transition: '0.4s'
                  }}>
                    <span style={{
                      position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transform: isOfflineMode ? 'translateX(18px)' : 'translateX(0)',
                      transition: '0.4s'
                    }} />
                  </span>
                </label>
              </div>

              {/* Actions & Status */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleDownloadOfflineTickets}
                  disabled={isSyncingOffline}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    backgroundColor: '#ffffff',
                    color: '#333',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isSyncingOffline ? 0.6 : 1
                  }}
                >
                  Baixar Ingressos
                </button>
                <button
                  type="button"
                  onClick={handleSyncOfflineCheckins}
                  disabled={isSyncingOffline}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#f28d1a',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isSyncingOffline ? 0.6 : 1
                  }}
                >
                  Sincronizar
                </button>
              </div>

              {offlineSyncMessage && (
                <div style={{ fontSize: '0.62rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px', textAlign: 'center' }}>
                  {offlineSyncMessage}
                </div>
              )}
            </div>

            {(() => {
              const selectedEvent = myEvents.find(e => e.id === scannerFilterEventId);
              if (!selectedEvent) return null;

              const activeBatch = selectedEvent.batches 
                ? selectedEvent.batches.find(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) < parseInt(b.limit || 0, 10)) || selectedEvent.batches[0] 
                : null;
              const isSoldOut = selectedEvent.batches && selectedEvent.batches.length > 0 
                ? selectedEvent.batches.every(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) >= parseInt(b.limit || 0, 10)) 
                : false;

              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#fdfbf7',
                  border: '1px solid #f6e8d5',
                  borderRadius: '16px',
                  marginBottom: '14px',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <img 
                    src={selectedEvent.image} 
                    alt={selectedEvent.name} 
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#2d2d2d',
                      margin: '0 0 2px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {selectedEvent.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.64rem',
                        backgroundColor: '#f28d1a15',
                        color: '#f28d1a',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 500
                      }}>
                        Lote: {activeBatch?.name || 'Lote Único'}
                      </span>
                      {activeBatch && (
                        <span style={{ fontSize: '0.64rem', color: '#666', fontWeight: 500 }}>
                          {isSoldOut ? 'Esgotado' : `R$ ${parseFloat(activeBatch.price || 0).toFixed(2)}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  setScannerTab('camera');
                  setScannerResult(null);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  background: scannerTab === 'camera' ? '#fcf6ed' : 'none',
                  color: scannerTab === 'camera' ? '#f28d1a' : '#666',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                QR Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setScannerTab('list');
                  setCameraActive(false);
                  setScannerResult(null);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  background: scannerTab === 'list' ? '#fcf6ed' : 'none',
                  color: scannerTab === 'list' ? '#f28d1a' : '#666',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Lista
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {scannerTab === 'camera' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '260px',
                    aspectRatio: '1 / 1',
                    alignSelf: 'center',
                    backgroundColor: '#111',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    position: 'relative'
                  }}>
                    <div id="reader" style={{ width: '100%', height: '100%', display: cameraActive ? 'block' : 'none' }}></div>
                    {!cameraActive && (
                      <div style={{ textAlign: 'center', padding: '20px', position: 'absolute' }}>
                        <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '10px' }}>
                          Ative o scanner de câmera para ler QR Codes
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setScannerResult(null);
                            setCameraActive(true);
                          }}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#f28d1a',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Camera size={16} />
                          Ligar Câmera
                        </button>
                      </div>
                    )}
                    {cameraActive && (
                      <button
                        type="button"
                        onClick={() => setCameraActive(false)}
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        Desligar Câmera
                      </button>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', marginTop: '4px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>
                      Validação Manual por Código
                    </label>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleTicketScanSubmit();
                    }} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Código do ingresso"
                        value={scannerInputValue}
                        onChange={(e) => setScannerInputValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '10px',
                          border: '1.5px solid #eee',
                          fontSize: '0.78rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: '#f28d1a',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Validar
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Buscar titular ou ID..."
                      value={scannerSearchTerm}
                      onChange={(e) => setScannerSearchTerm(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #eee',
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ 
                    maxHeight: '220px', 
                    overflowY: 'auto', 
                    border: '1px solid #eee', 
                    borderRadius: '14px',
                    backgroundColor: '#fafafa' 
                  }}>
                    {filteredTickets.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px 10px', color: '#999', fontSize: '0.75rem' }}>
                        Nenhum ingresso vendido atende aos filtros.
                      </div>
                    ) : (
                      filteredTickets.map(t => (
                        <div 
                          key={t.id} 
                          style={{ 
                            padding: '10px 12px', 
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: 'white'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.customerName}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: '#666', marginTop: '2px' }}>
                              #{t.id} • {t.batchName || 'Lote Único'} ({t.quantity} un.)
                            </div>
                            {t.status === 'checked_in' && t.checkInTime && (
                              <div style={{ fontSize: '0.62rem', color: '#20a396', marginTop: '2px', fontWeight: 500 }}>
                                Check-in: {t.checkInTime}
                              </div>
                            )}
                            <div style={{ fontSize: '0.62rem', color: '#999', fontStyle: 'italic' }}>
                              {t.eventName}
                            </div>
                          </div>
                          <div>
                            {t.status === 'checked_in' ? (
                              <span style={{
                                fontSize: '0.62rem',
                                color: '#ff5e5b',
                                backgroundColor: '#ffebe9',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap'
                              }}>
                                Utilizado
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTicketScanSubmit(t.id)}
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  backgroundColor: '#f28d1a',
                                  color: 'white',
                                  fontSize: '0.62rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                Check-in
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>

          {/* Results Overlay (Renders on top of the main panel) */}
          {scannerResult && (
            <div style={{
              position: 'absolute',
              top: '65px',
              left: 0,
              right: 0,
              bottom: 0,
              padding: '0 20px 20px 20px',
              backgroundColor: 'white',
              borderBottomLeftRadius: '24px',
              borderBottomRightRadius: '24px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease'
            }}>
              {scannerResult.loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    border: '3.5px solid rgba(242, 141, 26, 0.15)',
                    borderTop: '3.5px solid #f28d1a',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}></div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 650, color: '#f28d1a', margin: 0 }}>Processando check-in...</h4>
                  <p style={{ fontSize: '0.75rem', color: '#888', margin: 0 }}>Aguardando resposta do servidor</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    backgroundColor: scannerResult.success ? '#e6f9f6' : '#ffebe9',
                    border: `2.5px solid ${scannerResult.success ? '#2ec4b6' : '#ff5e5b'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    boxShadow: scannerResult.success ? '0 8px 24px rgba(46,196,182,0.2)' : '0 8px 24px rgba(255,94,91,0.2)',
                    color: scannerResult.success ? '#2ec4b6' : '#ff5e5b'
                  }}>
                    {scannerResult.success ? <Check size={36} strokeWidth={3} /> : <X size={36} strokeWidth={3} />}
                  </div>

                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 750,
                    color: scannerResult.success ? '#20a396' : '#ff5e5b',
                    margin: '0 0 6px 0',
                    letterSpacing: '0.3px'
                  }}>
                    {scannerResult.success ? 'CHECK-IN LIBERADO' : 'CHECK-IN BARRADO'}
                  </h3>

                  <p style={{
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    color: '#555',
                    margin: '0 0 20px 0',
                    lineHeight: 1.4,
                    maxWidth: '280px'
                  }}>
                    {scannerResult.message}
                  </p>

                  {scannerResult.success && scannerResult.ticket && (
                    <div style={{
                      backgroundColor: '#f8faf9',
                      border: '1px solid #e8edea',
                      borderRadius: '16px',
                      padding: '14px',
                      width: '100%',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      color: '#444',
                      marginBottom: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ borderBottom: '1px solid #eee', paddingBottom: '6px', marginBottom: '2px', fontWeight: 650, color: '#20a396', fontSize: '0.78rem' }}>Detalhes do Ingresso</div>
                      <div><strong>Titular:</strong> {scannerResult.ticket.customerName}</div>
                      <div><strong>Lote:</strong> {scannerResult.ticket.batchName || 'Lote Único'}</div>
                      <div><strong>Ingressos:</strong> {scannerResult.ticket.quantity} un.</div>
                      <div><strong>Evento:</strong> {scannerResult.ticket.eventName}</div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setScannerResult(null);
                      if (scannerTab === 'camera') {
                        setCameraActive(true);
                      }
                    }}
                    style={{
                      padding: '11px 24px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: scannerResult.success ? '#f28d1a' : '#ff5e5b',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: `0 6px 16px ${scannerResult.success ? 'rgba(242,141,26,0.3)' : 'rgba(255,94,91,0.3)'}`,
                      width: '100%',
                      maxWidth: '240px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {scannerTab === 'list' ? 'Voltar para a Lista' : (scannerResult.success ? 'Próximo Ingresso' : 'Tentar Novamente')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- SUBVIEW 1: DASHBOARD ---
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d' }}>{currentUser.companyName || currentUser.name}</h2>
          <p style={{ fontSize: '0.78rem', color: '#777' }}>Organizador de Eventos</p>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { label: 'Saldo Disponível', val: `R$ ${withdrawableBalance.toFixed(2)}`, desc: '', btn: 'Sacar' },
          { label: 'Ingressos Vendidos', val: `${totalTicketsSold} un.`, desc: '' },
          { label: 'Ingressos Grátis', val: `${freeTicketsClaimed} un.`, desc: '' },
          { label: 'Receita Bruta', val: `R$ ${grossSales.toFixed(2)}`, desc: '' },
          { label: 'Eventos Cadastrados', val: `${myEvents.length} ev.`, desc: '' }
        ].map((st) => (
          <div
            key={st.label}
            style={{
              backgroundColor: '#ffffff',
              padding: '14px 14px 14px 18px',
              borderRadius: '16px',
              border: '1px solid #eef2f6',
              borderLeft: '4px solid #f28d1a',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#666', fontWeight: 500 }}>{st.label}</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 500, color: '#1a1a1a', margin: '4px 0', letterSpacing: '-0.3px' }}>{st.val}</div>
            {st.desc && <div style={{ fontSize: '0.62rem', color: '#999' }}>{st.desc}</div>}
            {st.btn && (
              <button 
                onClick={() => {
                  setWithdrawAmount(withdrawableBalance.toString());
                  setWithdrawPixKey('');
                  setWithdrawAccount('');
                  setWithdrawError('');
                  setWithdrawSuccess(false);
                  setShowWithdrawModal(true);
                }}
                style={{
                  marginTop: '8px',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#f28d1a',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  boxShadow: '0 2px 6px rgba(242,141,26,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {st.btn}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Portaria & Validação de Ingressos */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#fff7e6',
            color: '#f28d1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="12" y1="7" x2="12" y2="17" />
            </svg>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Portaria e Validação</h4>
            <p style={{ fontSize: '0.7rem', color: '#777', margin: '2px 0 0 0' }}>Escanear QR Codes e fazer check-in em tempo real</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setScannerResult(null);
            setScannerInputValue('');
            setCameraActive(true);
            setScannerTab('camera');
            setShowScannerModal(true);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '16px',
            border: 'none',
            background: 'var(--gradient-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.72rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(242, 141, 26, 0.2)'
          }}
        >
          validar
        </button>
      </div>

      {/* Chat Suporte Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#fff7e6',
            color: '#f28d1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Suporte Connecta+</h4>
            <p style={{ fontSize: '0.7rem', color: '#777', margin: '2px 0 0 0' }}>Fale com a gente se precisar de ajuda</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenChat}
          style={{
            padding: '8px 16px',
            borderRadius: '16px',
            border: 'none',
            background: 'var(--gradient-primary)',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.72rem',
            cursor: 'pointer'
          }}
        >
          chat
        </button>
      </div>

      {/* Ingressos Adquiridos List */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '18px',
        borderRadius: '24px',
        border: '1px solid #eee',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Ingressos Adquiridos</h3>
          <select
            value={ticketFilterEventId}
            onChange={(e) => setTicketFilterEventId(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: '0.72rem',
              borderRadius: '8px',
              border: '1.5px solid #eee',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none',
              color: '#555'
            }}
          >
            <option value="all">Todos os eventos</option>
            {myEvents.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        {(() => {
          const filteredTickets = organizerTickets.filter(o => 
            ticketFilterEventId === 'all' || o.eventId === ticketFilterEventId
          );

          if (filteredTickets.length === 0) {
            return (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#999', fontSize: '0.75rem' }}>
                Nenhum ingresso adquirido com este filtro.
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredTickets.map(o => {
                const customerUser = users.find(u => u.id === o.customerId);
                const customerAvatar = customerUser?.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                const isFreeTicket = parseFloat(o.ticketPrice || 0) === 0;

                return (
                  <div
                    key={o.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '16px',
                      backgroundColor: '#fcfcfc',
                      border: '1px solid #f2f2f2'
                    }}
                  >
                    {/* Event Banner Thumb */}
                    <img 
                      src={o.eventImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><rect width="100" height="60" fill="%23eaeaea"/></svg>'} 
                      alt={o.eventName} 
                      style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} 
                    />

                    {/* Ticket details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.eventName}
                      </div>
                      
                      {/* Buyer row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <img 
                          src={customerAvatar} 
                          alt={o.customerName} 
                          style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <span style={{ fontSize: '0.68rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {o.customerName}
                        </span>
                      </div>
                    </div>

                    {/* Qty & Price */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.7rem', color: '#888' }}>
                        {o.quantity}x {o.batchName}
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: isFreeTicket ? '#2ec4b6' : '#f28d1a', marginTop: '2px' }}>
                        {isFreeTicket ? 'Grátis' : `R$ ${o.total.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Informações sobre Taxas (discreto) */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        <button
          type="button"
          onClick={() => setShowTaxInfoModal(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#888',
            fontSize: '0.65rem',
            textDecoration: 'underline',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>Informações sobre taxas e comissões</span>
        </button>
      </div>

      {showTaxInfoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Taxas e Comissões</h3>
              <button 
                type="button"
                onClick={() => setShowTaxInfoModal(false)}
                style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={20} style={{ color: '#666' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem', color: '#555', lineHeight: 1.5 }}>
              <p style={{ margin: 0 }}>Como funcionam nossas taxas:</p>
              
              <div style={{ backgroundColor: '#fffdf4', padding: '14px', borderRadius: '16px', border: '1px solid #f28d1a15' }}>
                <strong style={{ color: '#d4730d', display: 'block', marginBottom: '4px' }}>Taxa de Intermediação</strong>
                A taxa cobrada pelo Conecta+ para venda de ingressos é de <strong>{visualLayoutSettings?.commissions?.tickets !== undefined ? visualLayoutSettings.commissions.tickets : 10}%</strong> sobre o valor de cada ingresso vendido.
              </div>

              <div style={{ backgroundColor: '#f3faf8', padding: '14px', borderRadius: '16px', border: '1px solid #2ec4b615' }}>
                <strong style={{ color: '#2ec4b6', display: 'block', marginBottom: '4px' }}>Saldo Líquido</strong>
                O valor líquido das vendas é liberado no seu saldo disponível assim que a transação for confirmada.
              </div>

              <div style={{ backgroundColor: '#fcf6ed', padding: '14px', borderRadius: '16px', border: '1px solid #f28d1a15' }}>
                <strong style={{ color: '#f28d1a', display: 'block', marginBottom: '4px' }}>Saques Rápidos</strong>
                Você pode solicitar o saque do seu saldo disponível via Pix diretamente no painel a qualquer momento!
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTaxInfoModal(false)}
              style={{
                padding: '12px',
                backgroundColor: '#f28d1a',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center',
                marginTop: '6px'
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // --- SUBVIEW 2: EVENT CATALOG ---
  const renderEvents = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d' }}>Meus Eventos ({myEvents.length})</h3>
        <button
          onClick={() => { resetEventForm(); setActiveTab('add_event'); }}
          style={{
            padding: '6px 12px',
            borderRadius: '99px',
            backgroundColor: '#f28d1a',
            color: 'white',
            border: 'none',
            fontSize: '0.72rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          + Novo Evento
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {myEvents.map(ev => (
          <div
            key={ev.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '14px',
              border: '1px solid #eee',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '12px', marginBottom: '10px' }}>
                <img src={ev.image} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{ev.name}</h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setEditingEventId(ev.id);
                      setEvName(ev.name || '');
                      setEvDate(ev.date || '');
                      setEvLocation(ev.location || '');
                      setEvDescription(ev.description || '');
                      
                      const imagesArray = Array(10).fill('');
                      if (ev.images && ev.images.length > 0) {
                        ev.images.forEach((img, idx) => {
                          if (idx < 10) imagesArray[idx] = img;
                        });
                      } else if (ev.image) {
                        imagesArray[0] = ev.image;
                      }
                      setEvImages(imagesArray);

                      if (ev.batches && ev.batches.length > 0) {
                        setBatches(ev.batches.map(b => ({
                          name: b.name || '',
                          type: b.type || 'pago',
                          price: b.price !== undefined ? b.price.toString() : '',
                          limit: b.limit !== undefined ? b.limit.toString() : '',
                          startDate: b.startDate || '',
                          startTime: b.startTime || '',
                          endDate: b.endDate || '',
                          endTime: b.endTime || '',
                          sold: b.sold || 0,
                          active: b.active !== undefined ? b.active : true
                        })));
                      } else {
                        setBatches([{ name: 'Lote Único', price: '', limit: '', type: 'pago', startDate: '', startTime: '', endDate: '', endTime: '', active: true }]);
                      }
                      setBatchSalesMode(ev.batchSalesMode || 'sequential');
                      setEventCategory(ev.category || '');
                      setTags(ev.tags ? ev.tags.join(', ') : '');
                      setEventType(ev.eventType || 'fisico');
                      setHasNumberedSeats(ev.hasNumberedSeats || false);
                      setTotalSeats(ev.totalSeats !== null && ev.totalSeats !== undefined ? ev.totalSeats.toString() : '');
                      setFeeOption(ev.feeOption || 'absorver');
                      setMaxTicketsPerCPF(ev.maxTicketsPerCPF ? ev.maxTicketsPerCPF.toString() : '');
                      setMinAge(ev.minAge !== undefined ? ev.minAge.toString() : '0');
                      setCoupons(ev.coupons || []);
                      setPolicy(ev.policy || '');

                      // Set structured states
                      setStartDate(ev.startDate || '');
                      setStartTime(ev.startTime || '');
                      setEndDate(ev.endDate || '');
                      setEndTime(ev.endTime || '');
                      setSalesStartDate(ev.salesStartDate || '');
                      setSalesStartTime(ev.salesStartTime || '');
                      setVenueName(ev.venueName || '');
                      setAddressCep(ev.addressCep || '');
                      setAddressStreet(ev.addressStreet || '');
                      setAddressNumber(ev.addressNumber || '');
                      setAddressComplement(ev.addressComplement || '');
                      setAddressNeighborhood(ev.addressNeighborhood || '');
                      setAddressCity(ev.addressCity || '');
                      setAddressState(ev.addressState || '');
                      setOnlineLink(ev.onlineLink || '');
                      setHomepageBanner(ev.homepageBanner || '');
                      setActiveTab('add_event');

                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a', padding: '4px' }}
                    title="Editar Evento"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setScannerFilterEventId(ev.id);
                      setScannerResult(null);
                      setScannerInputValue('');
                      setCameraActive(true);
                      setScannerTab('camera');
                      setShowScannerModal(true);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2ec4b6', padding: '4px' }}
                    title="Portaria e Validação"
                  >
                    <QrCode size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Quer mesmo excluir o evento "${ev.name}"?`)) {
                        deleteEvent(ev.id);
                      }
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff5e5b', padding: '4px' }}
                    title="Excluir Evento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#777', margin: '4px 0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} style={{ flexShrink: 0 }} />
                  <span style={{ color: '#999', minWidth: '100px' }}>Início:</span>
                  <span style={{ fontWeight: 500, color: '#555' }}>{ev.startDate ? ev.startDate.split('-').reverse().join('/') : '—'}</span>
                </div>
                {ev.endDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} style={{ flexShrink: 0, opacity: 0 }} />
                    <span style={{ color: '#999', minWidth: '100px' }}>Término:</span>
                    <span style={{ fontWeight: 500, color: '#555' }}>{ev.endDate.split('-').reverse().join('/')}</span>
                  </div>
                )}
                {ev.startTime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} style={{ flexShrink: 0, opacity: 0 }} />
                    <span style={{ color: '#999', minWidth: '100px' }}>Horário de início:</span>
                    <span style={{ fontWeight: 500, color: '#555' }}>{ev.startTime}</span>
                  </div>
                )}
                {ev.endTime && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} style={{ flexShrink: 0, opacity: 0 }} />
                    <span style={{ color: '#999', minWidth: '100px' }}>Horário de término:</span>
                    <span style={{ fontWeight: 500, color: '#555' }}>{ev.endTime}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f9f9f9', paddingTop: '6px', marginTop: '6px', fontSize: '0.72rem', color: '#666' }}>
              {ev.batches.map(b => (
                <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{b.name} (limite {b.limit}):</span>
                  <span>{b.sold} vendidos / R$ {b.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- SUBVIEW 3: CREATE EVENT ---
  // --- SUBVIEW 3: CREATE EVENT ---
  const renderAddEvent = () => (
    <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
        {editingEventId ? 'Editar Evento' : 'Cadastrar Novo Evento'}
      </h3>
      
      {/* 1. Vamos criar seu evento */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Vamos criar seu evento:</h4>
        
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Nome</label>
          <input 
            type="text" 
            value={evName} 
            onChange={(e) => setEvName(e.target.value)} 
            className="input-field" 
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Categoria</label>
            <select 
              value={eventCategory} 
              onChange={(e) => setEventCategory(e.target.value)} 
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.78rem',
                borderRadius: '12px',
                border: '1.5px solid #eee',
                backgroundColor: 'white',
                outline: 'none',
                height: '36px',
                fontWeight: 500
              }}
              required 
            >
              <option value="">Selecione...</option>
              {eventCategoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Tipo</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', border: '1.5px solid #eee', backgroundColor: 'white', outline: 'none', height: '36px' }}
            >
              <option value="fisico">Físico</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Tags</label>
            <input 
              type="text" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              className="input-field" 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Classificação Etária</label>
            <select
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', border: '1.5px solid #eee', backgroundColor: 'white', outline: 'none', height: '36px' }}
            >
              <option value="0">Livre</option>
              <option value="10">+10 anos</option>
              <option value="12">+12 anos</option>
              <option value="14">+14 anos</option>
              <option value="16">+16 anos</option>
              <option value="18">+18 anos</option>
              <option value="21">+21 anos</option>
            </select>
          </div>
        </div>
      
      </div>

      {/* 2. Imagens */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Imagens:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {evImages.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => document.getElementById(`ev-img-file-${idx}`).click()}
              style={{
                width: '100%',
                height: '60px',
                borderRadius: '12px',
                border: '1.5px dashed #ccc',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa',
                cursor: 'pointer'
              }}
            >
              {img ? (
                <>
                  <img src={img} alt={`img-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveEventImage(idx, e)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      backgroundColor: 'rgba(255, 94, 91, 0.85)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '14px',
                      height: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <X size={8} />
                  </button>
                </>
              ) : (
                <Camera size={14} style={{ color: '#999' }} />
              )}
              {idx === 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  backgroundColor: 'rgba(242, 141, 26, 0.9)',
                  color: 'white',
                  fontSize: '0.52rem',
                  textAlign: 'center',
                  padding: '1px 0',
                  fontWeight: 500
                }}>
                  Capa
                </div>
              )}
              <input 
                type="file" 
                id={`ev-img-file-${idx}`} 
                accept="image/*" 
                onChange={(e) => handleEventImageUpload(idx, e)}
                style={{ display: 'none' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2.5. Divulgue seu evento na página inicial */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Divulgue seu evento na página inicial</h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Banner do evento (1200 x 500px)
          </label>
          <div 
            onClick={() => document.getElementById('ev-banner-file').click()}
            style={{
              width: '100%',
              height: '140px',
              borderRadius: '12px',
              border: '1.5px dashed #ccc',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fafafa',
              cursor: 'pointer'
            }}
          >
            {homepageBanner ? (
              <>
                <img src={homepageBanner} alt="Banner Destaque" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setHomepageBanner(''); }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    backgroundColor: 'rgba(255, 94, 91, 0.85)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <Upload size={22} />
                <span style={{ fontSize: '0.72rem' }}>Clique para enviar o banner</span>
                <span style={{ fontSize: '0.62rem', color: '#bbb' }}>Dimensão recomendada: 16:9 (ex: 1280 x 720px)</span>
              </div>
            )}
            <input 
              type="file" 
              id="ev-banner-file" 
              accept="image/*" 
              onChange={handleHomepageBannerUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Mapa de assentos */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Mapa de assentos:</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setHasNumberedSeats(!hasNumberedSeats)}>
          <input 
            type="checkbox" 
            checked={hasNumberedSeats} 
            onChange={(e) => setHasNumberedSeats(e.target.checked)} 
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.78rem', color: '#333', fontWeight: 500 }}>Este evento possui assentos numerados?</span>
        </div>

        {hasNumberedSeats && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Quantidade de assentos</label>
            <input 
              type="number" 
              placeholder=""
              value={totalSeats} 
              onChange={(e) => setTotalSeats(e.target.value)} 
              className="input-field" 
              required={hasNumberedSeats}
            />
          </div>
        )}
      </div>

      {/* 4. Quando vai acontecer? */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Quando vai acontecer?:</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Data de início</label>
            <DateRollerPicker label="Data de início" value={startDate} onChange={setStartDate} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Hora de início</label>
            <TimeRollerPicker label="Hora de início" value={startTime} onChange={setStartTime} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Data de término</label>
            <DateRollerPicker label="Data de término" value={endDate} onChange={setEndDate} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Hora de término</label>
            <TimeRollerPicker label="Hora de término" value={endTime} onChange={setEndTime} required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Data de início das vendas</label>
            <DateRollerPicker label="Início das vendas" value={salesStartDate} onChange={setSalesStartDate} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Hora de início das vendas</label>
            <TimeRollerPicker label="Hora das vendas" value={salesStartTime} onChange={setSalesStartTime} />
          </div>
        </div>
      </div>

      {/* 5. Onde vai acontecer? */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Onde vai acontecer?</h4>
        
        {eventType === 'fisico' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Nome do local <span style={{ color: '#f28d1a' }}>*</span></label>
              <input type="text" value={venueName} onChange={(e) => setVenueName(e.target.value)} className="input-field" placeholder="Ex: Praça Tiradentes, Teatro Municipal..." required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>CEP</label>
                <input type="text" value={addressCep} onChange={(e) => setAddressCep(e.target.value)} className="input-field" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Rua</label>
                <input type="text" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} className="input-field" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Número</label>
                <input type="text" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} className="input-field" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Complemento</label>
                <input type="text" value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} className="input-field" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Bairro</label>
                <input type="text" value={addressNeighborhood} onChange={(e) => setAddressNeighborhood(e.target.value)} className="input-field" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Cidade</label>
                <input type="text" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} className="input-field" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Estado</label>
                <input type="text" value={addressState} onChange={(e) => setAddressState(e.target.value)} className="input-field" required />
              </div>
            </div>
          </div>
        ) : (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Link (opcional)</label>
            <input type="text" value={onlineLink} onChange={(e) => setOnlineLink(e.target.value)} className="input-field" />
          </div>
        )}
      </div>

      {/* 6. Descrição do Evento */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Descrição do Evento:</h4>
        <textarea 
          value={evDescription} 
          onChange={(e) => setEvDescription(e.target.value)} 
          className="input-field" 
          style={{ height: '70px', resize: 'vertical' }}
        />
      </div>

      {/* 7. Ingressos */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Ingressos:</h4>
        
        {/* Seletor de tipo de ingresso */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#fafafa', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          <button
            type="button"
            onClick={() => setTicketTypeSelection('pago')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: ticketTypeSelection === 'pago' ? '#f28d1a' : 'transparent',
              color: ticketTypeSelection === 'pago' ? 'white' : '#555',
              transition: 'all 0.2s'
            }}
          >
            Ingresso Pago
          </button>
          <button
            type="button"
            onClick={() => setTicketTypeSelection('gratuito')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              backgroundColor: ticketTypeSelection === 'gratuito' ? '#f28d1a' : 'transparent',
              color: ticketTypeSelection === 'gratuito' ? 'white' : '#555',
              transition: 'all 0.2s'
            }}
          >
            Ingresso Gratuito
          </button>
        </div>

        {/* Modo de Vendas dos Lotes e Limite CPF */}
        <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444' }}>liberação:</span>
            <select 
              value={batchSalesMode} 
              onChange={(e) => setBatchSalesMode(e.target.value)} 
              style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '8px', border: '1.5px solid #eee', backgroundColor: 'white', cursor: 'pointer', outline: 'none' }}
            >
              <option value="sequential">Automático</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444' }}>Limite de Ingressos por CPF:</span>
            <input
              type="number"
              value={maxTicketsPerCPF}
              onChange={(e) => setMaxTicketsPerCPF(e.target.value)}
              className="input-field"
              placeholder="Ilimitado"
              min="1"
              style={{ maxWidth: '80px', padding: '6px 10px', fontSize: '0.72rem', borderRadius: '8px', border: '1.5px solid #eee', margin: 0 }}
            />
          </div>
        </div>

        {ticketTypeSelection === 'pago' ? (
          /* Ingresso Pago */
          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h5 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', margin: 0 }}>Ingresso Pago</h5>
              <button
                type="button"
                onClick={() => handleAddBatch('pago')}
                style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: '#fff7e6', color: '#f28d1a', border: 'none', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}
              >
                + Adicionar
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {batches.map((b, idx) => {
                if (b.type !== 'pago') return null;
                return (
                  <div key={idx} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fafafa', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="Nome" value={b.name} onChange={(e) => handleBatchChange(idx, 'name', e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '0.72rem', margin: 0, width: '120px' }} required />
                    <input type="text" placeholder="Lote" value={b.batchNumber || ''} onChange={(e) => handleBatchChange(idx, 'batchNumber', e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '0.72rem', margin: 0, width: '80px' }} />
                    <input type="number" placeholder="Valor" value={b.price} onChange={(e) => handleBatchChange(idx, 'price', e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '0.72rem', margin: 0, width: '80px' }} required />
                    <input type="number" placeholder="Quantidade" value={b.limit} onChange={(e) => handleBatchChange(idx, 'limit', e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '0.72rem', margin: 0, width: '80px' }} required />
                    <select value={b.feeOption || 'repassar'} onChange={(e) => handleBatchChange(idx, 'feeOption', e.target.value)} style={{ padding: '6px', fontSize: '0.72rem', borderRadius: '8px', border: '1.5px solid #eee', backgroundColor: 'white', minWidth: '110px' }}>
                      <option value="repassar">Repassar taxas</option>
                      <option value="absorver">Absorver taxas</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', cursor: 'pointer', userSelect: 'none', color: '#555' }}>
                      <input 
                        type="checkbox" 
                        checked={b.active !== false} 
                        onChange={(e) => handleBatchChange(idx, 'active', e.target.checked)} 
                        style={{ cursor: 'pointer' }}
                      />
                      Ativo
                    </label>
                    <button type="button" onClick={() => handleRemoveBatch(idx)} style={{ background: 'none', border: 'none', color: '#ff5e5b', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}>Excluir</button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Ingresso Gratuito */
          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h5 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#333', margin: 0 }}>Ingresso Gratuito</h5>
              <button
                type="button"
                onClick={() => handleAddBatch('gratuito')}
                style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: '#fff7e6', color: '#f28d1a', border: 'none', fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer' }}
              >
                + Adicionar
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {batches.map((b, idx) => {
                if (b.type !== 'gratuito') return null;
                return (
                  <div key={idx} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '12px', backgroundColor: '#fafafa', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="Nome" value={b.name} onChange={(e) => handleBatchChange(idx, 'name', e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '0.72rem', margin: 0, width: '120px' }} required />
                    <input type="text" placeholder="Lote" value={b.batchNumber || ''} onChange={(e) => handleBatchChange(idx, 'batchNumber', e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '0.72rem', margin: 0, width: '80px' }} />
                    <input type="number" placeholder="Quantidade" value={b.limit} onChange={(e) => handleBatchChange(idx, 'limit', e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '0.72rem', margin: 0, width: '80px' }} required />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', cursor: 'pointer', userSelect: 'none', color: '#555' }}>
                      <input 
                        type="checkbox" 
                        checked={b.active !== false} 
                        onChange={(e) => handleBatchChange(idx, 'active', e.target.checked)} 
                        style={{ cursor: 'pointer' }}
                      />
                      Ativo
                    </label>
                    <button type="button" onClick={() => handleRemoveBatch(idx)} style={{ background: 'none', border: 'none', color: '#ff5e5b', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}>Excluir</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 8. Cupons de Desconto */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Cupons de Desconto:</h4>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '4px' }}>
          <button
            type="button"
            onClick={handleAddCoupon}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: '#fff7e6',
              color: '#f28d1a',
              border: 'none',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Adicionar
          </button>
        </div>

        {coupons.length === 0 ? (
          <span style={{ fontSize: '0.68rem', color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhum cupom cadastrado para este evento.</span>
        ) : (
          coupons.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={c.code} 
                onChange={(e) => handleCouponChange(idx, 'code', e.target.value)} 
                className="input-field" 
                style={{ padding: '6px 10px', fontSize: '0.72rem', margin: 0, flex: 2 }} 
                required
              />
              <select
                value={c.discountType}
                onChange={(e) => handleCouponChange(idx, 'discountType', e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '10px', border: '1.5px solid #eee', backgroundColor: 'white', flex: 1.5 }}
              >
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
              <input 
                type="number" 
                value={c.value} 
                onChange={(e) => handleCouponChange(idx, 'value', e.target.value)} 
                className="input-field" 
                style={{ padding: '6px 10px', fontSize: '0.72rem', margin: 0, flex: 1.5 }} 
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveCoupon(idx)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ff5e5b',
                  border: 'none',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </div>

      {/* 9. Política do Evento */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>Política do Evento</h4>
        <textarea 
          value={policy} 
          onChange={(e) => setPolicy(e.target.value)} 
          className="input-field" 
          placeholder="Ex: 1. REEMBOLSO E CANCELAMENTO: O reembolso pode ser solicitado..."
          style={{ height: '120px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
        <button type="button" onClick={() => setActiveTab('events')} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {editingEventId ? 'Salvar Alterações' : 'Criar Evento'}
        </button>
      </div>
    </form>
  );

  // --- SUBVIEW 4: FORYOU REELS ---
  const renderForyou = () => {
    const myVideos = (videos || []).filter(v => v.creatorId === currentUser.id);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
        {/* Tab selection buttons */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setForyouSubTab('upload');
              setEditingVideoId(null);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: foryouSubTab === 'upload' ? '#f28d1a15' : 'transparent',
              color: foryouSubTab === 'upload' ? '#f28d1a' : '#666',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Novo Vídeo
          </button>
          <button
            type="button"
            onClick={() => {
              setForyouSubTab('my_videos');
              setEditingVideoId(null);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: foryouSubTab === 'my_videos' ? '#f28d1a15' : 'transparent',
              color: foryouSubTab === 'my_videos' ? '#f28d1a' : '#666',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Vídeos Publicados ({myVideos.length})
          </button>
        </div>

        {foryouSubTab === 'upload' ? (
          <form onSubmit={handleReelsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>publique seu vídeo na foryou</h3>

      {/* 1. Vídeo */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label style={{ fontSize: '0.72rem', color: '#666', marginBottom: '6px', display: 'block' }}>Vídeo</label>
        
        <input 
          type="file" 
          id="reels-video-file-upload-ev" 
          accept="video/*" 
          onChange={handleVideoUpload} 
          style={{ display: 'none' }} 
        />

        {reelsVideoUrl ? (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '220px',
            borderRadius: '20px',
            overflow: 'hidden',
            backgroundColor: '#000',
            boxShadow: 'var(--shadow-sm)',
            border: '1.5px solid #eee'
          }}>
            <video 
              src={reelsVideoUrl} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              autoPlay 
              muted 
              loop 
              playsInline
            />
            <button
              type="button"
              onClick={() => {
                setReelsVideoUrl('');
                setReelsVideoName('');
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(255, 94, 91, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 10
              }}
            >
              <X size={16} />
            </button>
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.65rem',
              fontWeight: 500
            }}>
              {reelsVideoName || 'Vídeo selecionado'}
            </div>
          </div>
        ) : (
          <div 
            onClick={() => document.getElementById('reels-video-file-upload-ev').click()}
            style={{
              width: '100%',
              height: '150px',
              borderRadius: '20px',
              border: '2px dashed #f28d1a40',
              backgroundColor: '#fffcf7',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#f9bb1a15',
              color: '#f28d1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#f28d1a' }}>Selecionar arquivo de vídeo</span>
              <p style={{ fontSize: '0.65rem', color: '#888', marginTop: '3px' }}>MP4 ou MOV até 15MB. Duração sugerida: 15s</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Título */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Legenda chamativa</label>
        <input 
          type="text" 
          placeholder="" 
          value={vidTitle} 
          onChange={(e) => setVidTitle(e.target.value)} 
          className="input-field" 
          required 
        />
      </div>

      {/* 3. Descrição */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Descrição detalhada do Vídeo</label>
        <textarea 
          placeholder="" 
          value={reelsDesc}
          onChange={(e) => setReelsDesc(e.target.value)}
          className="input-field"
          style={{ height: '50px', resize: 'none' }}
        />
      </div>

      {/* 4. Vincular Evento */}
      <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
        <label>Vincular Evento (Opcional)</label>
        
        {/* Dropdown Toggle Button */}
        <div 
          onClick={() => setIsLinkDropdownOpen(!isLinkDropdownOpen)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '16px',
            border: '2px solid #eaeaea',
            fontSize: '0.82rem',
            backgroundColor: 'white',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '44px'
          }}
        >
          {reelsEventId ? (() => {
            const selectedEv = myEvents.find(ev => ev.id === reelsEventId);
            if (!selectedEv) return <span style={{ color: '#777' }}>Não vincular nenhum evento</span>;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={selectedEv.image} alt={selectedEv.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{selectedEv.name}</span>
                <span style={{ color: '#f28d1a', whiteSpace: 'nowrap' }}>R$ {(selectedEv.batches[0]?.price || 0).toFixed(2)}</span>
                <span style={{ fontSize: '0.65rem', backgroundColor: '#f28d1a15', color: '#f28d1a', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Eventos</span>
              </div>
            );
          })() : (
            <span style={{ color: '#777' }}>Não vincular nenhum evento</span>
          )}
          <span style={{ fontSize: '0.6rem', color: '#999' }}>▼</span>
        </div>

        {/* Dropdown Menu */}
        {isLinkDropdownOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '2px solid #eaeaea',
            marginBottom: '4px',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
            maxHeight: '180px',
            overflowY: 'auto'
          }}>
            {/* Opção Não Vincular */}
            <div 
              onClick={() => {
                setReelsEventId('');
                setIsLinkDropdownOpen(false);
              }}
              style={{
                padding: '10px 14px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                color: '#777'
              }}
            >
              Não vincular nenhum evento
            </div>
            
            {/* Lista de Eventos */}
            {myEvents.map(ev => (
              <div 
                key={ev.id}
                onClick={() => {
                  setReelsEventId(ev.id);
                  setIsLinkDropdownOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f9f9f9',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <img src={ev.image} alt={ev.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#2d2d2d' }}>{ev.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#777', display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#f28d1a', fontWeight: 500 }}>R$ {(ev.batches[0]?.price || 0).toFixed(2)}</span>
                    <span>•</span>
                    <span>Eventos</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

            <button
              type="submit"
              disabled={isUploadingVideo}
              className="btn btn-primary"
              style={{ width: '100%', height: '48px', marginTop: '10px', backgroundColor: '#f28d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isUploadingVideo ? 'Publicando vídeo...' : 'Publicar Vídeo no ForYou'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Gerenciar Vídeos</h3>

            {myVideos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#777', fontSize: '0.8rem', border: '1px dashed #ddd', borderRadius: '16px' }}>
                Nenhum vídeo publicado por você ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myVideos.map(v => (
                  <div
                    key={v.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '16px',
                      border: '1px solid #eee',
                      backgroundColor: '#fafafa',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ width: '60px', height: '80px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#000', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      <video src={v.videoUrl + '#t=0.1'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} preload="metadata" muted playsInline />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {v.title}
                      </div>
                      {v.description && (
                        <div style={{ fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          {v.description}
                        </div>
                      )}
                      <div style={{ fontSize: '0.68rem', color: '#999', marginTop: '4px' }}>
                        {v.linkedName ? `Vinculado a: ${v.linkedName}` : 'Sem evento vinculado'}
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingVideoId(v.id);
                            setEditVideoTitle(v.title);
                            setEditVideoDesc(v.description || v.desc || '');
                            setEditVideoLinkedId(v.linkedId || '');
                          }}
                          style={{ border: 'none', backgroundColor: 'transparent', color: '#f28d1a', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Editar vídeo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Deseja realmente excluir este vídeo?')) {
                              deleteVideo(v.id);
                            }
                          }}
                          style={{ border: 'none', backgroundColor: 'transparent', color: '#ff5e5b', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal de Edição de Vídeo do Organizador */}
            {editingVideoId && (() => {
              const videoToEdit = videos.find(vid => vid.id === editingVideoId);
              if (!videoToEdit) return null;

              return (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '16px'
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    width: '100%',
                    maxWidth: '420px',
                    padding: '24px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Editar Vídeo</h3>
                      <button 
                        onClick={() => setEditingVideoId(null)}
                        style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: '4px' }}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Miniatura do vídeo */}
                    <div style={{ 
                      width: '100%', 
                      height: '160px', 
                      borderRadius: '16px', 
                      overflow: 'hidden', 
                      backgroundColor: '#000',
                      position: 'relative'
                    }}>
                      <video 
                        src={videoToEdit.videoUrl + '#t=0.1'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        controls
                        preload="metadata"
                        muted 
                        playsInline 
                      />
                    </div>

                    {/* Legenda/Título */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#666' }}>Legenda do vídeo</label>
                      <input 
                        type="text" 
                        value={editVideoTitle}
                        onChange={(e) => setEditVideoTitle(e.target.value)}
                        placeholder="Escreva uma legenda..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '2px solid #eaeaea',
                          fontSize: '0.82rem',
                          outline: 'none',
                          color: '#2d2d2d'
                        }}
                      />
                    </div>

                    {/* Descrição */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#666' }}>Descrição do vídeo</label>
                      <textarea 
                        value={editVideoDesc}
                        onChange={(e) => setEditVideoDesc(e.target.value)}
                        placeholder="Escreva uma descrição detalhada..."
                        style={{
                          width: '100%',
                          height: '60px',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '2px solid #eaeaea',
                          fontSize: '0.82rem',
                          outline: 'none',
                          resize: 'none',
                          color: '#2d2d2d'
                        }}
                      />
                    </div>

                    {/* Alterar/Remover Evento Vinculado */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#666' }}>Evento Vinculado</label>
                      <div 
                        onClick={() => setIsEditLinkDropdownOpen(!isEditLinkDropdownOpen)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '2px solid #eaeaea',
                          fontSize: '0.82rem',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          minHeight: '40px',
                          color: '#2d2d2d'
                        }}
                      >
                        {editVideoLinkedId ? (() => {
                          const selectedEv = myEvents.find(ev => ev.id === editVideoLinkedId);
                          if (!selectedEv) return <span style={{ color: '#777' }}>Sem evento vinculado</span>;
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={selectedEv.image} alt={selectedEv.name} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{selectedEv.name}</span>
                            </div>
                          );
                        })() : (
                          <span style={{ color: '#777' }}>Sem evento vinculado</span>
                        )}
                        <span style={{ fontSize: '0.55rem', color: '#999' }}>▼</span>
                      </div>

                      {isEditLinkDropdownOpen && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          width: '100%',
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          border: '2px solid #eaeaea',
                          marginBottom: '4px',
                          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
                          zIndex: 100,
                          maxHeight: '140px',
                          overflowY: 'auto'
                        }}>
                          <div 
                            onClick={() => {
                              setEditVideoLinkedId('');
                              setIsEditLinkDropdownOpen(false);
                            }}
                            style={{
                              padding: '8px 12px',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              color: '#ff5e5b'
                            }}
                          >
                            Remover vínculo
                          </div>
                          {myEvents.map(ev => (
                            <div 
                              key={ev.id}
                              onClick={() => {
                                setEditVideoLinkedId(ev.id);
                                setIsEditLinkDropdownOpen(false);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f9f9f9',
                                color: '#2d2d2d'
                              }}
                            >
                              <img src={ev.image} alt={ev.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setEditingVideoId(null)}
                        style={{
                          flex: 1,
                          height: '42px',
                          borderRadius: '12px',
                          border: '2px solid #eaeaea',
                          backgroundColor: 'transparent',
                          color: '#666',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editVideoTitle.trim()) return;
                          const selectedEv = myEvents.find(ev => ev.id === editVideoLinkedId);
                          updateVideo(videoToEdit.id, {
                            title: editVideoTitle.trim(),
                            description: editVideoDesc.trim(),
                            linkedId: editVideoLinkedId,
                            linkedType: editVideoLinkedId ? 'event' : '',
                            linkedName: editVideoLinkedId ? selectedEv?.name || '' : ''
                          });
                          setEditingVideoId(null);
                        }}
                        style={{
                          flex: 1,
                          height: '42px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: '#f28d1a',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  // --- SUBVIEW 5: COMMISSIONERS VIEW ---
  const renderCommissioners = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Gestão de Comissários</h3>
        {myEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.78rem' }}>
            Cadastre um evento primeiro para poder vincular comissários!
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px' }}>Vendas por Comissários</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.72rem', color: '#666', display: 'block', marginBottom: '4px' }}>Selecione o Evento para visualizar:</label>
              <select
                value={selectedEventId || (myEvents[0]?.id || '')}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', border: '2px solid #eaeaea', backgroundColor: 'white', fontWeight: 500 }}
              >
                <option value="">Selecione o Evento...</option>
                {myEvents.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            {(() => {
              const activeEventId = selectedEventId || (myEvents[0]?.id || '');
              const activeEvent = myEvents.find(e => e.id === activeEventId) || myEvents[0];
              if (!activeEvent) return null;

              const activeBatch = activeEvent.batches 
                ? activeEvent.batches.find(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) < parseInt(b.limit || 0, 10)) || activeEvent.batches[0] 
                : null;
              const isSoldOut = activeEvent.batches && activeEvent.batches.length > 0 
                ? activeEvent.batches.every(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) >= parseInt(b.limit || 0, 10)) 
                : false;

              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#fdfbf7',
                  border: '1px solid #f6e8d5',
                  borderRadius: '16px',
                  marginBottom: '14px',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <img 
                    src={activeEvent.image} 
                    alt={activeEvent.name} 
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#2d2d2d',
                      margin: '0 0 2px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {activeEvent.name}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.64rem',
                        backgroundColor: '#f28d1a15',
                        color: '#f28d1a',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontWeight: 500
                      }}>
                        Lote: {activeBatch?.name || 'Lote Único'}
                      </span>
                      {activeBatch && (
                        <span style={{ fontSize: '0.64rem', color: '#666', fontWeight: 500 }}>
                          {isSoldOut ? 'Esgotado' : `R$ ${parseFloat(activeBatch.price || 0).toFixed(2)}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              {(() => {
                const activeEventId = selectedEventId || (myEvents[0]?.id || '');
                const activeEvent = myEvents.find(e => e.id === activeEventId) || myEvents[0];
                const comms = activeEvent?.commissioners || [];
                
                if (comms.length === 0) {
                  return (
                    <div style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', padding: '10px' }}>
                      Nenhum comissário vinculado a este evento.
                    </div>
                  );
                }

                return comms.map(comm => {
                  // Find sales (orders) for this commissioner code and event
                  const commSales = (orders || []).filter(o => 
                    o.type === 'ticket' && 
                    o.eventId === activeEventId && 
                    o.commissionerCode && 
                    o.commissionerCode.toUpperCase() === comm.code.toUpperCase()
                  );

                  return (
                    <div 
                      key={comm.code} 
                      style={{ 
                        backgroundColor: '#f9f9f9', 
                        padding: '12px', 
                        borderRadius: '16px', 
                        border: '1px solid #eee', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px' 
                      }}
                    >
                      {/* Commissioner Header Info */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {comm.avatar ? (
                            <img 
                              src={comm.avatar} 
                              alt={comm.name} 
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #eee' }} 
                            />
                          ) : (
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#e0e0e0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#888',
                              border: '1px solid #ddd'
                            }}>
                              <User size={16} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d2d2d' }}>{comm.name}</div>
                            <div style={{ fontSize: '0.62rem', backgroundColor: '#f9bb1a20', color: '#f28d1a', padding: '1px 6px', borderRadius: '8px', display: 'inline-block', marginTop: '2px' }}>
                              Código: {comm.code}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingCommCode === comm.code) {
                                setEditingCommCode(null);
                              } else {
                                setEditingCommCode(comm.code);
                                setEditCommRate(comm.rate !== undefined ? comm.rate.toString() : '10');
                                setEditCommDiscount(comm.discount !== undefined ? comm.discount.toString() : '0');
                              }
                            }}
                            style={{
                              background: '#fff7e6',
                              border: 'none',
                              color: '#f28d1a',
                              borderRadius: '8px',
                              width: '26px',
                              height: '26px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Editar Taxas"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Tem certeza que deseja excluir o comissário ${comm.name}?`)) {
                                const res = await removeCommissioner(activeEventId, comm.code);
                                if (res.success) {
                                  alert('Comissário excluído com sucesso!');
                                } else {
                                  alert(res.message || 'Erro ao excluir comissário.');
                                }
                              }
                            }}
                            style={{
                              background: '#ff5e5b15',
                              border: 'none',
                              color: '#ff5e5b',
                              borderRadius: '8px',
                              width: '26px',
                              height: '26px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            title="Excluir Comissário"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Commissioner Statistics or Edit Form */}
                      {editingCommCode === comm.code ? (
                        <div style={{
                          backgroundColor: '#fcfcfc',
                          padding: '12px',
                          borderRadius: '16px',
                          border: '1.5px dashed #eee',
                          marginTop: '4px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <div>
                              <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Comissão (%)</label>
                              <input
                                type="number"
                                value={editCommRate}
                                onChange={(e) => setEditCommRate(e.target.value)}
                                className="input-field"
                                style={{ padding: '6px 10px', fontSize: '0.7rem', margin: 0, borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                                min="0"
                                max="100"
                                step="0.5"
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Desconto Link (%)</label>
                              <input
                                type="number"
                                value={editCommDiscount}
                                onChange={(e) => setEditCommDiscount(e.target.value)}
                                className="input-field"
                                style={{ padding: '6px 10px', fontSize: '0.7rem', margin: 0, borderRadius: '8px', width: '100%', boxSizing: 'border-box' }}
                                min="0"
                                max="100"
                                step="0.5"
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                            <button
                              type="button"
                              onClick={() => setEditingCommCode(null)}
                              style={{ padding: '6px 12px', fontSize: '0.65rem', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#eee', color: '#555', fontWeight: 500 }}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await updateCommissionerRates(activeEventId, comm.code, {
                                  rate: parseFloat(editCommRate || 10),
                                  discount: parseFloat(editCommDiscount || 0)
                                });
                                if (res.success) {
                                  setEditingCommCode(null);
                                  alert('Taxas atualizadas com sucesso!');
                                } else {
                                  alert(res.message || 'Erro ao atualizar taxas.');
                                }
                              }}
                              style={{ padding: '6px 12px', fontSize: '0.65rem', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f28d1a', color: 'white', fontWeight: 650 }}
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Render statistics and sales ONLY if expanded */}
                          {expandedCommCode === comm.code && (
                            <>
                              {(() => {
                                const totalQty = commSales.reduce((acc, o) => acc + (o.quantity || 0), 0);
                                const totalVal = commSales.reduce((acc, o) => acc + (o.total || 0), 0);
                                const commRateVal = comm.rate !== undefined ? comm.rate : 10;
                                const commissionVal = totalVal * (commRateVal / 100);

                                return (
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    backgroundColor: '#ffffff',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    border: '1px solid #f0f0f0',
                                    marginTop: '4px'
                                  }}>
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: '1fr 1.2fr 1fr',
                                      gap: '6px'
                                    }}>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.58rem', color: '#999' }}>Ingressos Vendidos</span>
                                        <strong style={{ fontSize: '0.75rem', color: '#2d2d2d' }}>{totalQty} un</strong>
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.58rem', color: '#999' }}>Total Vendido</span>
                                        <strong style={{ fontSize: '0.75rem', color: '#2ec4b6' }}>R$ {totalVal.toFixed(2)}</strong>
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.58rem', color: '#999' }}>Repasse ({commRateVal}%)</span>
                                        <strong style={{ fontSize: '0.75rem', color: '#f28d1a' }}>R$ {commissionVal.toFixed(2)}</strong>
                                      </div>
                                    </div>
                                    {comm.discount > 0 && (
                                      <div style={{ borderTop: '1px solid #f9f9f9', paddingTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#f28d1a', backgroundColor: '#fff7e6', padding: '2px 6px', borderRadius: '4px', border: '1px solid #f28d1a20' }}>
                                          Desconto do link: {comm.discount}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* Detailed Sales (Lote, Valor) */}
                              <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '8px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {commSales.length > 0 ? (
                                  commSales.map((sale, sIdx) => (
                                    <div key={sale.id || sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#555' }}>
                                      <span>Lote: <strong>{sale.batchName}</strong> ({sale.quantity}x)</span>
                                      <span style={{ color: '#2ec4b6', fontWeight: 600 }}>R$ {(sale.total || 0).toFixed(2)}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ fontSize: '0.68rem', color: '#999', fontStyle: 'italic', marginTop: '2px' }}>
                                    Nenhuma venda registrada para este comissário.
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {/* Collapsible toggle for sales details */}
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px', borderTop: '1px solid #f9f9f9', paddingTop: '4px' }}>
                            <button
                              type="button"
                              onClick={() => setExpandedCommCode(expandedCommCode === comm.code ? null : comm.code)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#f28d1a',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px',
                                width: '100%'
                              }}
                            >
                              {expandedCommCode === comm.code ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            
            {/* Form Mode Selector tabs */}
            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #eaeaea', marginTop: '12px', paddingTop: '12px' }}>
              <button
                type="button"
                onClick={() => setCommFormMode('existing')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: commFormMode === 'existing' ? '#fff7e6' : '#f5f5f5',
                  color: commFormMode === 'existing' ? '#f28d1a' : '#777',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Vincular Existente
              </button>
              <button
                type="button"
                onClick={() => setCommFormMode('new')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: commFormMode === 'new' ? '#fff7e6' : '#f5f5f5',
                  color: commFormMode === 'new' ? '#f28d1a' : '#777',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cadastrar Novo
              </button>
            </div>

            <form onSubmit={handleCommissionerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              {commFormMode === 'existing' ? (
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Selecionar Comissário Cadastrado *
                  </label>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1.5px solid #eee',
                    borderRadius: '12px',
                    padding: '8px',
                    backgroundColor: 'white'
                  }} className="custom-scroll">
                    {(() => {
                      const activeEventId = selectedEventId || (myEvents[0]?.id || '');
                      const activeEventObj = events.find(e => e.id === activeEventId);
                      const linkedCommCodes = activeEventObj?.commissioners?.map(c => c.code.toUpperCase()) || [];
                      
                      const uniqueComms = [];
                      const seenCodes = new Set();
                      
                      (users || []).forEach(u => {
                        if (u.role === 'commissioner' && u.commissionerCode) {
                          const upper = u.commissionerCode.toUpperCase();
                          if (!seenCodes.has(upper) && !linkedCommCodes.includes(upper)) {
                            seenCodes.add(upper);
                            uniqueComms.push(u);
                          }
                        }
                      });

                      if (uniqueComms.length === 0) {
                        return (
                          <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.72rem', color: '#999', fontStyle: 'italic' }}>
                            Nenhum comissário disponível para vincular.
                          </div>
                        );
                      }

                      return uniqueComms.map(u => (
                        <div
                          key={u.id}
                          onClick={() => setSelectedExistingCommId(u.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            backgroundColor: selectedExistingCommId === u.id ? '#fff7e6' : '#fafafa',
                            border: `1.5px solid ${selectedExistingCommId === u.id ? '#f28d1a' : '#eee'}`,
                            transition: 'all 0.2s',
                            boxSizing: 'border-box'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {u.avatar ? (
                              <img 
                                src={u.avatar} 
                                alt={u.name} 
                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }} 
                              />
                            ) : (
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: '#e0e0e0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#888',
                                border: '1px solid #ddd'
                              }}>
                                <User size={13} />
                              </div>
                            )}
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>{u.name}</div>
                              <div style={{ fontSize: '0.62rem', color: '#f28d1a', fontWeight: 600, marginTop: '1px' }}>
                                Código: {u.commissionerCode.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          
                          {selectedExistingCommId === u.id && (
                            <span style={{
                              fontSize: '0.58rem',
                              fontWeight: 700,
                              color: 'white',
                              backgroundColor: '#f28d1a',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              Selecionado
                            </span>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ) : (
                <>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '2px' }}>Cadastrar Novo Comissário</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>Nome Completo *</label>
                      <input 
                        type="text" 
                        value={commName}
                        onChange={(e) => setCommName(e.target.value)}
                        className="input-field" 
                        style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '10px', width: '100%', boxSizing: 'border-box', margin: 0 }} 
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>E-mail de Acesso *</label>
                      <input 
                        type="email" 
                        value={commEmail}
                        onChange={(e) => setCommEmail(e.target.value)}
                        className="input-field" 
                        style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '10px', width: '100%', boxSizing: 'border-box', margin: 0 }} 
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>Telefone *</label>
                      <input 
                        type="text" 
                        value={commPhone}
                        onChange={(e) => setCommPhone(e.target.value)}
                        className="input-field" 
                        style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '10px', width: '100%', boxSizing: 'border-box', margin: 0 }} 
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>Senha</label>
                      <input 
                        type="password" 
                        value={commPassword}
                        onChange={(e) => setCommPassword(e.target.value)}
                        className="input-field" 
                        style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '10px', width: '100%', boxSizing: 'border-box', margin: 0 }} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>Código Promocional (Opcional)</label>
                      <input 
                        type="text" 
                        value={commCode}
                        onChange={(e) => setCommCode(e.target.value)}
                        className="input-field" 
                        style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '10px', width: '100%', boxSizing: 'border-box', margin: 0 }} 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>Foto de Perfil (Opcional)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '42px' }}>
                        <div 
                          onClick={() => document.getElementById('comm-avatar-upload-input').click()}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: '#f5f5f5',
                            border: '1.5px dashed #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                          title="Fazer upload"
                        >
                          {commAvatar ? (
                            <img src={commAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Camera size={14} style={{ color: '#888' }} />
                          )}
                        </div>
                        {commAvatar && (
                          <button
                            type="button"
                            onClick={() => setCommAvatar('')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: '#ff5e5b15',
                              color: '#ff5e5b',
                              fontSize: '0.68rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Remover
                          </button>
                        )}
                        <input 
                          type="file" 
                          id="comm-avatar-upload-input"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              try {
                                const url = await uploadAvatar(file, currentUser.id);
                                setCommAvatar(url);
                              } catch (err) {
                                console.error(err);
                                alert('Erro ao carregar a imagem do comissário.');
                              }
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Taxas (Shared between both modes) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>Taxa do Comissário (%)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 10" 
                    value={commRate}
                    onChange={(e) => setCommRate(e.target.value)}
                    className="input-field" 
                    style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '10px', width: '100%', boxSizing: 'border-box', margin: 0 }} 
                    min="0"
                    max="100"
                    step="0.5"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#666', display: 'block', marginBottom: '2px' }}>Desconto do Link (%)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 0" 
                    value={commDiscount}
                    onChange={(e) => setCommDiscount(e.target.value)}
                    className="input-field" 
                    style={{ padding: '8px 12px', fontSize: '0.75rem', borderRadius: '10px', width: '100%', boxSizing: 'border-box', margin: 0 }} 
                    min="0"
                    max="100"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px', fontSize: '0.78rem', borderRadius: '10px', width: '100%', backgroundColor: '#f28d1a', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', marginTop: '6px' }}>
                {commFormMode === 'existing' ? 'vincular comissário' : 'criar comissário'}
              </button>
              
              {commFormMode === 'new' && (
                <span style={{ fontSize: '0.65rem', color: '#888', textAlign: 'center', display: 'block', marginTop: '4px', lineHeight: 1.3 }}>
                  Como organizador de eventos, você cria a conta do comissário. Repasse o e-mail e a senha cadastrados para que ele possa acessar o painel de vendas.
                </span>
              )}
            </form>

            {generatedLink && (
              <div style={{
                marginTop: '16px',
                padding: '14px',
                backgroundColor: '#f6fff8',
                border: '1.5px solid #d8f3dc',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1b4332' }}>
                  Acesso do Comissário Gerado!
                </span>
                <span style={{ fontSize: '0.68rem', color: '#2d6a4f' }}>
                  Envie este link direto para o comissário. Ele só precisa clicar para entrar automaticamente no painel dele:
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1px solid #b7e4c7',
                      fontSize: '0.7rem',
                      backgroundColor: '#fff',
                      color: '#2d6a4f',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLink);
                      alert('Link copiado para a área de transferência!');
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#2ec4b6',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Copiar
                  </button>
                  <button
                    onClick={() => setGeneratedLink('')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#e5e5e5',
                      color: '#666',
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', position: 'relative' }} className="animate-fade-in">
      
      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="desktop-header-inner">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
            <img 
              src="/logo-full.png" 
              alt="Connecta+" 
              className="header-logo-img"
              style={{ objectFit: 'contain' }} 
            />
          </div>

          {/* Nav links */}
          <nav className="desktop-nav">
            {[
              { id: 'home', label: 'Home', icon: <Home size={18} /> },
              { id: 'dashboard', label: 'Painel', icon: <Layers size={18} /> },
              { id: 'profile', label: 'Perfil', icon: <User size={18} /> },
              { id: 'events', label: 'Eventos', icon: <Calendar size={18} /> },
              { id: 'commissioners', label: 'Comissários', icon: <Users size={18} /> },
              { id: 'foryou', label: 'ForYou', icon: <Play size={18} /> }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'home') {
                    onGoToHome();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`desktop-nav-item ${(activeTab === item.id || (item.id === 'events' && activeTab === 'add_event')) ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions (Chat, Notifications, Logout) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={onOpenChat}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: '#fff7e6', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Chat Suporte"
            >
              <MessageSquare size={16} style={{ color: '#f28d1a' }} />
            </button>

            <button
              type="button"
              onClick={onToggleNotifications}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'white', border: '1px solid #eee',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative'
              }}
              title="Notificações"
            >
              <Bell size={16} style={{ color: '#f28d1a' }} />
              {unreadNotificationsCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px',
                  backgroundColor: '#ff5e5b', width: '12px', height: '12px',
                  borderRadius: '50%', fontSize: '0.55rem', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onLogout}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: '#ff5e5b15', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Sair da Conta"
            >
              <LogOut size={16} style={{ color: '#ff5e5b' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '90px' }} className="custom-scroll">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfileView()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'add_event' && renderAddEvent()}
        {activeTab === 'commissioners' && renderCommissioners()}
        {activeTab === 'foryou' && renderForyou()}
      </div>

      {/* Menu Fixo Embaixo com Ícones */}
      <div className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Painel', icon: <Layers size={20} /> },
          { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
          { id: 'events', label: 'Eventos', icon: <Calendar size={20} /> },
          { id: 'commissioners', label: 'Comissários', icon: <Users size={20} /> },
          { id: 'foryou', label: 'ForYou', icon: <Play size={20} /> }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.id === 'home') {
                onGoToHome();
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`bottom-nav-item ${(activeTab === item.id || (item.id === 'events' && activeTab === 'add_event')) ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {showWithdrawModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Sacar Saldo</h3>
              <button 
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={20} style={{ color: '#666' }} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#e6f7f0',
                  color: '#2ec4b6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Solicitação de Saque Enviada!</h4>
                <p style={{ fontSize: '0.8rem', color: '#777', margin: 0, lineHeight: 1.4 }}>
                  Seu saque de <strong>R$ {parseFloat(withdrawAmount).toFixed(2)}</strong> está em processamento e será depositado em sua conta Pix cadastrada em breve.
                </p>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  style={{
                    marginTop: '12px',
                    padding: '10px 24px',
                    backgroundColor: '#f28d1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(withdrawAmount);
                if (isNaN(amt) || amt <= 0) {
                  setWithdrawError('Digite um valor de saque válido.');
                  return;
                }
                if (amt > withdrawableBalance) {
                  setWithdrawError(`Saldo insuficiente. Seu saldo disponível é R$ ${withdrawableBalance.toFixed(2)}.`);
                  return;
                }
                if (!withdrawPixKey.trim()) {
                  setWithdrawError('A chave PIX é obrigatória.');
                  return;
                }
                if (!withdrawAccount.trim()) {
                  setWithdrawError('O número da conta é obrigatório.');
                  return;
                }

                // Success simulation
                setWithdrawError('');
                setWithdrawSuccess(true);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div style={{ backgroundColor: '#fffdf4', padding: '12px', borderRadius: '14px', border: '1px solid #f28d1a15' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>Saldo disponível para saque</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f28d1a' }}>R$ {withdrawableBalance.toFixed(2)}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>Chave PIX</label>
                  <input
                    type="text"
                    placeholder="CPF, E-mail, Celular ou Chave Aleatória"
                    value={withdrawPixKey}
                    onChange={(e) => setWithdrawPixKey(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #eee',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#fcfcfc'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>Número da Conta</label>
                  <input
                    type="text"
                    placeholder="Ex: Agência 0001, Conta 12345-6"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #eee',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#fcfcfc'
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>Valor do Saque (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={withdrawableBalance}
                    placeholder="0,00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #eee',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#fcfcfc'
                    }}
                    required
                  />
                </div>

                {withdrawError && (
                  <div style={{ color: '#ff5e5b', fontSize: '0.75rem', fontWeight: 500 }}>{withdrawError}</div>
                )}

                <button
                  type="submit"
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    backgroundColor: '#f28d1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(242,141,26,0.2)'
                  }}
                >
                  Solicitar Saque
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      
      {showScannerModal && renderScannerModal()}
    </div>
  );
}
