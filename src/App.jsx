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

import { Home, Search, Play, Heart, Layers, Bell, LogOut, User } from 'lucide-react';

function AppContent() {
  const { currentUser, logout, notifications, markNotificationsRead } = useFirebaseMock();
  
  // Navigation subviews
  const [clientView, setClientView] = useState('client_home');
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);

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

  // Define screen layout inside the smartphone frame based on user roles
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
      {/* Smartphone app wrapper bar */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: '100%',
        minWidth: 0,
        width: '100%',
        overflowX: 'hidden'
      }}>
        
        {/* PARTNER HEADER BAR */}
        {currentUser && currentUser.role !== 'client' && !showChatRoom && !showNotifications && (
          <div style={{
            height: '56px',
            borderBottom: '1px solid #eaeaea',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px',
            flexShrink: 0,
            zIndex: 100
          }}>
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
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <Bell size={14} style={{ color: '#f28d1a' }} />
                  {unreadNotifications.length > 0 && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ff5e5b', width: '12px', height: '12px', borderRadius: '50%', fontSize: '0.55rem', color: 'white', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
              )}
              
              <button
                onClick={logout}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ff5e5b15',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Sair da Conta"
              >
                <LogOut size={14} style={{ color: '#ff5e5b' }} />
              </button>
            </div>
          </div>
        )}

        {/* Core Screen */}
        {(() => {
          const showBottomBar = (!currentUser || currentUser.role === 'client') && 
                                !showChatRoom && 
                                ['client_home', 'client_search', 'client_foryou', 'client_favorites', 'client_profile'].includes(clientView);
          return (
            <>
              <div style={{
                flex: 1,
                minWidth: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                paddingBottom: showBottomBar ? '72px' : '0px' // padding for bottom menu
              }} className="custom-scroll">
                {renderRoleScreen()}
              </div>

              {/* CUSTOMER BOTTOM BAR:
                  inicio, buscar, foryou, camera highlighted, favoritos, categoria */}
              {showBottomBar && (
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
            </>
          );
        })()}
        {showChatRoom && (
          <div style={{
            position: 'absolute',
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
