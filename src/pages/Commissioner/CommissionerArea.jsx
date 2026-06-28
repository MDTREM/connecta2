import { useState } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { 
  Home, Ticket, Play, Users, MessageSquare, User, 
  ExternalLink, Copy, Check, Clock, Calendar, LogOut, Layers
} from 'lucide-react';

export default function CommissionerArea({ onOpenChat, onLogout, onGoToHome }) {
  const { currentUser, logout, events, orders } = useFirebaseMock();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copiedEventId, setCopiedEventId] = useState(null);

  const commissionerCode = currentUser?.commissionerCode || '';

  // 1. Filtrar eventos em que o comissário está cadastrado
  const myLinkedEvents = events.filter(ev => 
    ev.commissioners && ev.commissioners.some(c => c.code.toUpperCase() === commissionerCode.toUpperCase())
  );

  // 2. Filtrar vendas (orders) associadas ao código do comissário
  const mySales = (orders || []).filter(o => 
    o.type === 'ticket' && o.commissionerCode && o.commissionerCode.toUpperCase() === commissionerCode.toUpperCase()
  );

  // 3. Calcular métricas
  const totalTicketsSold = mySales.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
  
  // A comissão é calculada de forma acumulada (10% sobre o subtotal do valor do ingresso ou comissão individual se repassado)
  const totalCommissionsEarned = mySales.reduce((acc, curr) => acc + (curr.commissionFee || 0), 0);

  const handleCopyLink = (eventId) => {
    // Link de afiliado direcionando para o Connecta+ com o código do comissário parametrizado
    const refLink = `${window.location.origin}/?promo=${commissionerCode.toUpperCase()}&event=${eventId}`;
    navigator.clipboard.writeText(refLink);
    setCopiedEventId(eventId);
    setTimeout(() => setCopiedEventId(null), 2000);
  };

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Olá, {currentUser?.name}</h2>
        <p style={{ fontSize: '0.78rem', color: '#777', margin: '2px 0 0 0' }}>Comissário de Eventos | Código: <strong style={{ color: '#f28d1a' }}>{commissionerCode.toUpperCase()}</strong></p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[
          { label: 'Ingressos Vendidos', val: `${totalTicketsSold} un.`, desc: 'Total acumulado', color: '#fcf6ed' },
          { label: 'Comissão Acumulada', val: `R$ ${totalCommissionsEarned.toFixed(2)}`, desc: 'Estimada em 10%', color: '#f3faf8' },
          { label: 'Eventos Ativos', val: `${myLinkedEvents.length} ev.`, desc: 'Em divulgação', color: '#fef3f3' }
        ].map(st => (
          <div
            key={st.label}
            style={{
              backgroundColor: st.color,
              padding: '14px',
              borderRadius: '20px',
              border: '1.5px solid #eaeaea40',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 500 }}>{st.label}</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d2d2d', margin: '4px 0' }}>{st.val}</div>
            <div style={{ fontSize: '0.62rem', color: '#999' }}>{st.desc}</div>
          </div>
        ))}
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
        gap: '12px',
        marginTop: '10px'
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
          Chat Suporte
        </button>
      </div>
    </div>
  );

  const renderMyLinks = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Meus Eventos e Links</h3>
        <p style={{ fontSize: '0.75rem', color: '#777', margin: '2px 0 0 0' }}>Copie seu link de vendas para divulgar e garantir sua comissão</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {myLinkedEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #eee', fontSize: '0.78rem' }}>
            Você não está vinculado a nenhum evento ainda. Peça para o organizador cadastrar seu código: <strong style={{ color: '#f28d1a' }}>{commissionerCode.toUpperCase()}</strong>.
          </div>
        ) : (
          myLinkedEvents.map(ev => {
            const isCopied = copiedEventId === ev.id;
            return (
              <div
                key={ev.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '24px',
                  padding: '16px',
                  border: '1px solid #eee',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <img 
                  src={ev.image} 
                  alt={ev.name} 
                  style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover' }} 
                />
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ev.name}
                  </h4>
                  <div style={{ fontSize: '0.68rem', color: '#f28d1a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>{ev.date}</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#777', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Link: {window.location.origin}/?promo={commissionerCode.toUpperCase()}&event={ev.id}
                  </div>
                </div>

                <button
                  onClick={() => handleCopyLink(ev.id)}
                  style={{
                    backgroundColor: isCopied ? '#f3faf8' : '#fff7e6',
                    color: isCopied ? '#2ec4b6' : '#f28d1a',
                    border: 'none',
                    borderRadius: '12px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  title="Copiar Link de Vendas"
                >
                  {isCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderMySales = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Histórico de Vendas</h3>
        <p style={{ fontSize: '0.75rem', color: '#777', margin: '2px 0 0 0' }}>Lista de ingressos vendidos sob seu código promocional</p>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '24px', 
        border: '1px solid #eee', 
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {mySales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '0.78rem' }}>
            Nenhuma venda registrada ainda. Divulgue seu link para começar a lucrar!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {mySales.map((sale, idx) => (
              <div 
                key={sale.id}
                style={{ 
                  padding: '12px 16px', 
                  borderBottom: idx === mySales.length - 1 ? 'none' : '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d2d2d' }}>
                    {sale.customerName}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#777', marginTop: '2px' }}>
                    {sale.eventName} • {sale.batchName} ({sale.quantity} ingressos)
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#999', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} />
                    <span>{sale.date}</span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2ec4b6' }}>
                    + R$ {(sale.commissionFee || 0).toFixed(2)}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#999' }}>Comissão</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', position: 'relative' }} className="animate-fade-in">
      {/* Desktop Header */}
      <header className="desktop-header">
        <div className="desktop-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
            <img 
              src="/logo-full.png" 
              alt="Connecta+" 
              className="header-logo-img"
              style={{ objectFit: 'contain' }} 
            />
          </div>

          <nav className="desktop-nav">
            {[
              { id: 'home', label: 'Home', icon: <Home size={18} /> },
              { id: 'dashboard', label: 'Painel', icon: <Layers size={18} /> },
              { id: 'links', label: 'Meus Links', icon: <Ticket size={18} /> },
              { id: 'sales', label: 'Minhas Vendas', icon: <Users size={18} /> }
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
                className={`desktop-nav-item ${activeTab === item.id ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* Main Content Area */}
      <main className="main-content-scroll" style={{ flex: 1, padding: '16px 16px 90px 16px', boxSizing: 'border-box' }}>
        <div className="main-content-container">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'links' && renderMyLinks()}
          {activeTab === 'sales' && renderMySales()}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Painel', icon: <Layers size={20} /> },
          { id: 'links', label: 'Links', icon: <Ticket size={20} /> },
          { id: 'sales', label: 'Vendas', icon: <Users size={20} /> }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
