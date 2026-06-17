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

import { Home, Search, Play, Heart, Layers, Bell, LogOut, User, ShoppingCart, MapPin, Coins } from 'lucide-react';

function AppContent() {
  const { currentUser, logout, notifications, markNotificationsRead, categories } = useFirebaseMock();
  
  // Navigation subviews
  const [clientView, setClientView] = useState('client_home');
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

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
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Notificações</h2>
            <button 
              onClick={() => {
                if (currentUser) markNotificationsRead(currentUser.id);
                setShowNotifications(false);
              }}
              style={{ background: 'none', border: 'none', color: '#f28d1a', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
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
            onOpenChat={() => {
              if (!currentUser) setShowAuthScreen(true);
              else setShowChatRoom(true);
            }} 
            isVisitor={!currentUser}
            onTriggerLogin={() => setShowAuthScreen(true)}
          />
        );
      case 'seller':
        return <SellerArea onOpenChat={() => setShowChatRoom(true)} />;
      case 'provider':
        return <ProviderArea onOpenChat={() => setShowChatRoom(true)} />;
      case 'organizer':
        return <EventsArea onOpenChat={() => setShowChatRoom(true)} />;
      case 'motoboy':
        return <DeliveryArea onOpenChat={() => setShowChatRoom(true)} />;
      case 'admin':
        return <AdminArea />;
      default:
        return <div>Papel desconhecido.</div>;
    }
  };

  const isClientRole = !currentUser || currentUser.role === 'client';
  const showBottomBar = isClientRole && 
                        !showChatRoom && 
                        ['client_home', 'client_search', 'client_foryou', 'client_favorites', 'client_profile'].includes(clientView);

  // Desktop Top Nav for client
  const renderDesktopTopNav = () => {
    if (!isClientRole || showChatRoom) return null;
    
    const navItems = [
      { id: 'client_home', label: 'Início', icon: <Home size={18} /> },
      { id: 'client_search', label: 'Buscar', icon: <Search size={18} /> },
      { id: 'client_foryou', label: 'ForYou', icon: <Play size={18} /> },
      { id: 'client_favorites', label: 'Favoritos', icon: <Heart size={18} />, requireAuth: true },
      { id: 'client_ourocoins', label: 'OuroCoins', icon: <Coins size={18} />, requireAuth: true },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) markNotificationsRead(currentUser.id);
                  }}
                  className="desktop-icon-btn"
                  style={{ position: 'relative' }}
                >
                  <Bell size={18} />
                  {unreadNotifications.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '-2px', right: '-2px',
                      backgroundColor: '#ff5e5b', width: '14px', height: '14px',
                      borderRadius: '50%', fontSize: '0.55rem', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{unreadNotifications.length}</span>
                  )}
                </button>
                <button onClick={logout} className="desktop-icon-btn" title="Sair">
                  <LogOut size={18} style={{ color: '#ff5e5b' }} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthScreen(true)}
                style={{
                  padding: '8px 20px', borderRadius: '99px',
                  background: 'linear-gradient(135deg, #f9bb1a, #f28d1a)',
                  color: 'white', border: 'none', fontWeight: 600,
                  fontSize: '0.85rem', cursor: 'pointer',
                  transition: 'all 0.2s ease'
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

    return (
      <div className="partner-header">
        <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d' }}>
          {currentUser.role === 'seller' ? 'Painel Lojista' :
           currentUser.role === 'provider' ? 'Painel Prestador' :
           currentUser.role === 'organizer' ? 'Painel Eventos' :
           currentUser.role === 'motoboy' ? 'Painel Entregador' : 'Painel Admin'}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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

        {/* Partner Header */}
        {renderPartnerHeader()}

        {/* Core Screen */}
        <div className="main-content" style={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          paddingBottom: (!isDesktop && showBottomBar) ? '88px' : '0px'
        }} className="custom-scroll">
          <div className="content-container">
            {renderRoleScreen()}
          </div>
        </div>

        {/* MOBILE BOTTOM BAR (hidden on desktop) */}
        {!isDesktop && showBottomBar && (
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
              className="bottom-nav-center"
            >
              <Play size={22} />
            </button>

            <button 
              onClick={() => {
                if (!currentUser) {
                  setShowAuthScreen(true);
                } else {
                  handleClientTabClick('client_favorites');
                }
              }}
              className={`bottom-nav-item ${clientView === 'client_favorites' ? 'active' : ''}`}
            >
              <Heart size={20} />
              <span>favoritos</span>
            </button>

            <button 
              onClick={() => {
                if (!currentUser) {
                  setShowAuthScreen(true);
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
            <Chat onCloseChat={() => setShowChatRoom(false)} />
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
