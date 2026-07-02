import { useState, useEffect } from 'react';
import { FirebaseMockProvider, useFirebaseMock } from './context/FirebaseMockContext';
import DeviceFrame from './components/DeviceFrame';
import Auth, { AuthStatus } from './pages/Shared/Auth';
import Chat from './pages/Shared/Chat';
import ClientArea from './pages/Client/ClientArea';
import SellerArea from './pages/Seller/SellerArea';
import ProviderArea from './pages/Provider/ProviderArea';
import EventsArea from './pages/Events/EventsArea';
import DeliveryArea from './pages/Delivery/DeliveryArea';
import AdminArea from './pages/Admin/AdminArea';
import CommissionerArea from './pages/Commissioner/CommissionerArea';
import { IS_BETA_EVENTS_ONLY } from './config';

import { Home, Search, Play, Heart, Layers, Bell, LogOut, User, ShoppingCart, MapPin, Coins, Ticket, Bus, Briefcase, X, MessageSquare } from 'lucide-react';

function AppContent() {
  const { currentUser, logout, notifications, markNotificationsRead, categories, cart, isAuthLoading, isDataLoading } = useFirebaseMock();
  
  // Navigation subviews
  const [clientView, setClientView] = useState('client_home');
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [chatTargetUserId, setChatTargetUserId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showPartnerSwitchModal, setShowPartnerSwitchModal] = useState(false);
  const [isClientEditingProfile, setIsClientEditingProfile] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  // Controle de visualização da Home x Painel para parceiros
  const [viewMode, setViewMode] = useState('panel'); // 'panel' ou 'home'

  // Detect desktop
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync clientView if tab changes
  const handleClientTabClick = (viewName) => {
    setShowChatRoom(false);
    setShowNotifications(false);
    setClientView(viewName);
  };

  // Sincronizar viewMode quando o usuário logar ou deslogar, exceto se houver link de evento
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'client') {
        setViewMode('home');
      } else {
        const params = new URLSearchParams(window.location.search);
        const hasEventLink = params.get('event') || sessionStorage.getItem('connecta_referred_event');
        if (!hasEventLink) {
          setViewMode('panel');
        } else {
          setViewMode('home');
        }
      }
    } else {
      setViewMode('home');
    }
  }, [currentUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event');
    if (eventParam) {
      sessionStorage.setItem('connecta_referred_event', eventParam);
      setViewMode('home');
      setClientView('client_event');
    }
  }, []);

  // If user log out, reset view
  useEffect(() => {
    if (!currentUser) {
      setTimeout(() => {
        setClientView('client_home');
        setShowChatRoom(false);
        setShowNotifications(false);
      }, 0);
    }
  }, [currentUser]);

  // Unread notifications count
  const unreadNotifications = currentUser ? notifications.filter(n => n.userId === currentUser.id && !n.read) : [];
  const cartCount = cart ? cart.reduce((acc, item) => acc + item.quantity, 0) : 0;

  if (isAuthLoading || isDataLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        gap: '16px'
      }}>
        <div className="spinner-loader" style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid #f28d1a30',
          borderTopColor: '#f28d1a',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
  
  // Render Login & Registration status if not fully logged in and approved
  if (!currentUser && showAuthScreen) {
    return (
      <DeviceFrame 
        onSwitchView={(v) => {
          setShowAuthScreen(false);
          setClientView(v);
        }}
        onOpenAuth={() => {
          logout();
          setShowAuthScreen(true);
        }}
      >
        <Auth 
          onAuthSuccess={() => setShowAuthScreen(false)} 
          onCancelVisitor={() => setShowAuthScreen(false)}
        />
      </DeviceFrame>
    );
  }

  if (currentUser && currentUser.registrationStatus !== 'approved') {
    return (
      <DeviceFrame 
        onSwitchView={logout}
        onOpenAuth={() => {
          logout();
          setShowAuthScreen(true);
        }}
      >
        <AuthStatus 
          user={currentUser} 
          onBackToLogin={logout} 
        />
      </DeviceFrame>
    );
  }

  // Define screen layout based on user roles
  const renderRoleScreen = () => {

    if (showNotifications) {
      const myNotifs = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
      return (
        <div style={{ padding: '16px', height: '100%', backgroundColor: '#ffffff' }} className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d' }}>Notificações</h2>
            <button 
              onClick={() => {
                if (currentUser) markNotificationsRead(currentUser.id);
                setShowNotifications(false);
              }}
              style={{ background: 'none', border: 'none', color: '#f28d1a', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}
            >
              Fechar
            </button>
          </div>
          {myNotifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
              Nenhum aviso por aqui uai...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myNotifs.map(n => (
                <div 
                  key={n.id} 
                  style={{
                    backgroundColor: n.read ? 'white' : '#fff9ee',
                    border: '1px solid #eaeaea',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    position: 'relative'
                  }}
                >
                  {!n.read && <span style={{ position: 'absolute', top: '12px', right: '14px', width: '6px', height: '6px', backgroundColor: '#f28d1a', borderRadius: '50%' }} />}
                  <div style={{ color: '#2d2d2d', lineHeight: 1.3 }}>{n.text}</div>
                  <div style={{ fontSize: '0.62rem', color: '#999', marginTop: '6px', textAlign: 'right' }}>{n.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const activeRole = currentUser ? currentUser.role : 'client';

    // Qualquer parceiro (lojista, prestador, admin, etc.) no modo 'home' vê a interface de cliente
    if (activeRole !== 'client' && viewMode === 'home') {
      return (
        <ClientArea 
          currentView={clientView} 
          onSwitchView={(v) => {
            if (v === 'go_to_partner_panel') {
              sessionStorage.removeItem('connecta_referred_event');
              setViewMode('panel');
            } else if (!currentUser && (v === 'client_checkout' || v === 'client_ourocoins' || v === 'client_favorites')) {
              setShowAuthScreen(true);
            } else {
              setClientView(v);
            }
          }} 
          onOpenChat={(targetUserId) => {
            if (!currentUser) setShowAuthScreen(true);
            else {
              setChatTargetUserId(targetUserId || null);
              setShowChatRoom(true);
            }
          }} 
          isVisitor={false}
          onTriggerLogin={() => setShowAuthScreen(true)}
          onEditingProfileChange={setIsClientEditingProfile}
          onTicketModalChange={setIsTicketModalOpen}
        />
      );
    }

    switch (activeRole) {
      case 'client':
        return (
          <ClientArea 
            currentView={clientView} 
            onSwitchView={(v) => {
              if (!currentUser && (v === 'client_checkout' || v === 'client_ourocoins' || v === 'client_favorites')) {
                setShowAuthScreen(true);
              } else {
                setClientView(v);
              }
            }} 
            onOpenChat={(targetUserId) => {
              if (!currentUser) setShowAuthScreen(true);
              else {
                setChatTargetUserId(targetUserId || null);
                setShowChatRoom(true);
              }
            }} 
            isVisitor={!currentUser}
            onTriggerLogin={() => setShowAuthScreen(true)}
            onEditingProfileChange={setIsClientEditingProfile}
            onTicketModalChange={setIsTicketModalOpen}
          />
        );
      case 'seller':
        return (
          <SellerArea 
            onOpenChat={() => setShowChatRoom(true)} 
            onGoToHome={() => setViewMode('home')}
            onToggleNotifications={() => { setShowNotifications(!showNotifications); if (!showNotifications && currentUser) markNotificationsRead(currentUser.id); }}
            unreadNotificationsCount={unreadNotifications.length}
            onLogout={logout}
          />
        );
      case 'provider':
        return (
          <ProviderArea 
            onOpenChat={() => setShowChatRoom(true)} 
            onGoToHome={() => setViewMode('home')}
            onToggleNotifications={() => { setShowNotifications(!showNotifications); if (!showNotifications && currentUser) markNotificationsRead(currentUser.id); }}
            unreadNotificationsCount={unreadNotifications.length}
            onLogout={logout}
          />
        );
      case 'organizer':
        return (
          <EventsArea 
            onOpenChat={() => setShowChatRoom(true)} 
            onGoToHome={() => setViewMode('home')}
            onToggleNotifications={() => { setShowNotifications(!showNotifications); if (!showNotifications && currentUser) markNotificationsRead(currentUser.id); }}
            unreadNotificationsCount={unreadNotifications.length}
            onLogout={logout}
          />
        );
      case 'motoboy':
        return (
          <DeliveryArea 
            onOpenChat={() => setShowChatRoom(true)} 
            onGoToHome={() => setViewMode('home')}
            onToggleNotifications={() => { setShowNotifications(!showNotifications); if (!showNotifications && currentUser) markNotificationsRead(currentUser.id); }}
            unreadNotificationsCount={unreadNotifications.length}
            onLogout={logout}
          />
        );
      case 'admin':
        return (
          <AdminArea 
            onGoToHome={() => setViewMode('home')}
            onLogout={logout}
          />
        );
      case 'commissioner':
        return (
          <CommissionerArea 
            onOpenChat={() => setShowChatRoom(true)} 
            onGoToHome={() => setViewMode('home')}
            onLogout={logout}
          />
        );
      default:
        return <div>Papel desconhecido.</div>;
    }
  };

  const isClientRole = !currentUser || currentUser.role === 'client' || viewMode === 'home';
  const showBottomBar = isClientRole && 
                        !showChatRoom && 
                        !isClientEditingProfile &&
                        !isTicketModalOpen &&
                        ['client_home', 'client_search', 'client_foryou', 'client_favorites', 'client_profile', 'client_coupons', 'client_tickets'].includes(clientView);

  // Desktop Top Nav for client
  const renderDesktopTopNav = () => {
    if (!isClientRole || showChatRoom) return null;
    
    const navItems = [
      { id: 'client_home', label: 'Início', icon: <Home size={18} /> },
      { id: 'client_search', label: 'Buscar', icon: <Search size={18} /> },
      { id: 'client_foryou', label: 'ForYou', icon: <Play size={18} /> },
      ...(!IS_BETA_EVENTS_ONLY ? [
        { id: 'client_ourocoins', label: 'OuroCoins', icon: <Coins size={18} />, requireAuth: true }
      ] : []),
      { id: 'client_favorites', label: 'Favoritos', icon: <Heart size={18} />, requireAuth: true },
      { id: 'client_profile', label: 'Perfil', icon: <User size={18} />, requireAuth: true },
    ];

    return (
      <header className="desktop-header">
        <div className="desktop-header-inner">
          {/* Logo */}
          <div 
            onClick={() => handleClientTabClick('client_home')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
          >
            <img 
              src="/logo-full.png" 
              alt="Connecta+" 
              style={{ height: '34px', objectFit: 'contain' }} 
            />
          </div>

          {/* Nav links */}
          <nav className="desktop-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.requireAuth && !currentUser) {
                    setShowAuthScreen(true);
                  } else {
                    handleClientTabClick(item.id);
                  }
                }}
                className={`desktop-nav-item ${clientView === item.id ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Ônibus */}
            {!IS_BETA_EVENTS_ONLY && (
              <button
                onClick={() => handleClientTabClick('client_bus')}
                className={`desktop-icon-btn ${clientView === 'client_bus' ? 'active' : ''}`}
                title="Horários de Ônibus"
              >
                <Bus size={18} style={{ color: '#f28d1a' }} />
              </button>
            )}

            {/* Vagas de Emprego */}
            {!IS_BETA_EVENTS_ONLY && (
              <button
                onClick={() => handleClientTabClick('client_jobs')}
                className={`desktop-icon-btn ${clientView === 'client_jobs' ? 'active' : ''}`}
                title="Vagas de Emprego"
              >
                <Briefcase size={18} style={{ color: '#f28d1a' }} />
              </button>
            )}

            {/* Cupons */}
            <button
              onClick={() => {
                if (!currentUser) setShowAuthScreen(true);
                else handleClientTabClick('client_coupons');
              }}
              className={`desktop-icon-btn ${clientView === 'client_coupons' ? 'active' : ''}`}
              title="Meus Cupons"
            >
              <Ticket size={18} style={{ color: '#f28d1a' }} />
            </button>

            {/* Carrinho */}
            {!IS_BETA_EVENTS_ONLY && (
              <button
                onClick={() => handleClientTabClick('client_cart')}
                className={`desktop-icon-btn ${clientView === 'client_cart' ? 'active' : ''}`}
                style={{ position: 'relative' }}
                title="Carrinho"
              >
                <ShoppingCart size={18} style={{ color: '#f28d1a' }} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    backgroundColor: '#ff5e5b', width: '16px', height: '16px',
                    borderRadius: '50%', fontSize: '0.6rem', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700
                  }}>{cartCount}</span>
                )}
              </button>
            )}

            {currentUser && currentUser.role !== 'client' && (
              <button
                onClick={() => {
                  sessionStorage.removeItem('connecta_referred_event');
                  setViewMode('panel');
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '99px',
                  backgroundColor: '#f28d1a',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginRight: '6px',
                  boxShadow: '0 2px 8px rgba(242, 141, 26, 0.2)'
                }}
              >
                Voltar ao Painel
              </button>
            )}

            {!currentUser && (
              <button
                onClick={() => setShowAuthScreen(true)}
                style={{
                  padding: '8px 20px', borderRadius: '99px',
                  background: 'linear-gradient(135deg, #f9bb1a, #f28d1a)',
                  color: 'white', border: 'none', fontWeight: 600,
                  fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginLeft: '4px'
                }}
              >
                Entrar / Cadastrar
              </button>
            )}
          </div>
        </div>
      </header>
    );
  };

  // Partner header for non-client roles
  const renderPartnerHeader = () => {
    if (!currentUser || currentUser.role === 'client' || showChatRoom || showNotifications) return null;

    if (viewMode === 'home') return null;

    return (
      <div className="partner-header">
        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d' }}>
          {currentUser.role === 'seller' ? 'Painel Lojista' :
           currentUser.role === 'provider' ? 'Painel Prestador' :
           currentUser.role === 'organizer' ? 'Painel Eventos' :
           currentUser.role === 'motoboy' ? 'Painel Entregador' : 'Painel Admin'}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode('home')}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#f28d1a15', border: '1px solid #f28d1a30',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Ir para a Home"
          >
            <Home size={14} style={{ color: '#f28d1a' }} />
          </button>

          <button
            onClick={() => setShowChatRoom(true)}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#fff7e6', border: '1px solid #f28d1a30',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Chat Suporte"
          >
            <MessageSquare size={14} style={{ color: '#f28d1a' }} />
          </button>

          {currentUser.role !== 'admin' && (
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsRead(currentUser.id);
              }}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'white', border: '1px solid #eee',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative'
              }}
            >
              <Bell size={14} style={{ color: '#f28d1a' }} />
              {unreadNotifications.length > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ff5e5b', width: '12px', height: '12px', borderRadius: '50%', fontSize: '0.55rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={logout}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#ff5e5b15', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
            title="Sair da Conta"
          >
            <LogOut size={14} style={{ color: '#ff5e5b' }} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <DeviceFrame 
      currentUser={currentUser}
      onSwitchView={(v) => {
        setShowChatRoom(false);
        setShowNotifications(false);
        setClientView(v);
      }}
      onOpenAuth={() => {
        logout();
        setShowAuthScreen(true);
      }}
    >
      {/* App wrapper */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: '100vh',
        minWidth: 0,
        width: '100%',
        overflowX: 'hidden'
      }}>

        {/* Desktop Top Nav (only on desktop for client) */}
        {isDesktop && renderDesktopTopNav()}

        {/* Partner Header (only visible when in partner panel and on mobile) */}
        {!isDesktop && renderPartnerHeader()}



        {/* Core Screen */}
        <div className="main-content custom-scroll" style={{
          flex: 1,
          minWidth: 0,
          overflowY: clientView === 'client_foryou' ? 'hidden' : 'auto',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          paddingBottom: (!isDesktop && showBottomBar && clientView !== 'client_foryou' && clientView !== 'client_receipt') ? '88px' : '0px'
        }}>
          <div className="content-container" style={{
            height: clientView === 'client_foryou' ? (isDesktop ? 'calc(100vh - 64px)' : 'calc(100vh - 72px)') : 'auto',
            display: clientView === 'client_foryou' ? 'flex' : 'block',
            flexDirection: 'column'
          }}>
            {renderRoleScreen()}
          </div>
        </div>

        {/* MOBILE BOTTOM BAR (hidden on desktop) */}
        {!isDesktop && showBottomBar && clientView !== 'client_receipt' && (
          <div className="bottom-nav">
            <button 
              onClick={() => handleClientTabClick('client_home')}
              className={`bottom-nav-item ${clientView === 'client_home' ? 'active' : ''}`}
            >
              <Home size={20} />
              <span>início</span>
            </button>

            <button 
              onClick={() => handleClientTabClick('client_search')}
              className={`bottom-nav-item ${clientView === 'client_search' ? 'active' : ''}`}
            >
              <Search size={20} />
              <span>buscar</span>
            </button>

            {/* Glowing ForYou center button */}
            <button 
              onClick={() => handleClientTabClick('client_foryou')}
              className={`bottom-nav-center ${clientView === 'client_foryou' ? 'active' : ''}`}
              style={{
                background: clientView === 'client_foryou' 
                  ? 'linear-gradient(135deg, #f28d1a 0%, #f9bb1a 100%)' 
                  : 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)'
              }}
            >
              <Play size={22} />
            </button>

            <button 
              onClick={() => {
                if (!currentUser) {
                  setShowAuthScreen(true);
                } else {
                  handleClientTabClick('client_tickets');
                }
              }}
              className={`bottom-nav-item ${clientView === 'client_tickets' ? 'active' : ''}`}
            >
              <Ticket size={20} />
              <span>ingressos</span>
            </button>

            <button 
              onClick={() => {
                if (!currentUser) {
                  setShowAuthScreen(true);
                } else if (currentUser.role !== 'client') {
                  setShowPartnerSwitchModal(true);
                } else {
                  handleClientTabClick('client_profile');
                }
              }}
              className={`bottom-nav-item ${clientView === 'client_profile' ? 'active' : ''}`}
            >
              <User size={20} />
              <span>perfil</span>
            </button>
          </div>
        )}

        {showChatRoom && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#ffffff',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Chat targetChatUserId={chatTargetUserId} onCloseChat={() => { setChatTargetUserId(null); setShowChatRoom(false); }} />
          </div>
        )}

        {showPartnerSwitchModal && currentUser && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '450px',
              backgroundColor: '#ffffff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              fontFamily: 'Outfit, sans-serif'
            }}>
              <style>{`
                @keyframes slideUp {
                  from { transform: translateY(100%); }
                  to { transform: translateY(0); }
                }
              `}</style>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d2d2d' }}>Opções de Conta</span>
                <button 
                  onClick={() => setShowPartnerSwitchModal(false)}
                  style={{
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} style={{ color: '#666' }} />
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.4 }}>
                Olá, <strong>{currentUser.name}</strong>. Como você possui uma conta de parceiro, o que gostaria de acessar agora?
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => {
                    setViewMode('panel');
                    setShowPartnerSwitchModal(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
                    color: 'white',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(242, 141, 26, 0.2)'
                  }}
                >
                  <Layers size={18} />
                  Ir para o Painel do {
                    currentUser.role === 'seller' ? 'Lojista' :
                    currentUser.role === 'provider' ? 'Prestador' :
                    currentUser.role === 'organizer' ? 'Organizador' :
                    currentUser.role === 'motoboy' ? 'Entregador' :
                    currentUser.role === 'admin' ? 'Administrador' : 'Parceiro'
                  }
                </button>

                <button
                  onClick={() => {
                    handleClientTabClick('client_profile');
                    setShowPartnerSwitchModal(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    border: '1px solid #eee',
                    backgroundColor: '#ffffff',
                    color: '#2d2d2d',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <User size={18} />
                  Ver Meu Perfil de Cliente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DeviceFrame>
  );
}

export default function App() {
  return (
    <FirebaseMockProvider>
      <AppContent />
    </FirebaseMockProvider>
  );
}
