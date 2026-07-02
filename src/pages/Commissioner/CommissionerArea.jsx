import { useState } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { 
  Home, Ticket, Play, Users, MessageSquare, User, 
  ExternalLink, Copy, Check, Clock, Calendar, LogOut, Layers,
  DollarSign, TrendingUp, Percent, Wallet, X
} from 'lucide-react';

export default function CommissionerArea({ onOpenChat, onLogout, onGoToHome }) {
  const { currentUser, logout, events, orders } = useFirebaseMock();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copiedEventId, setCopiedEventId] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPix, setWithdrawPix] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');

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
  
  // A comissão é calculada pela taxa definida pelo organizador por evento
  const totalCommissionsEarned = mySales.reduce((acc, curr) => acc + (curr.commissionerFee || curr.commissionFee || 0), 0);

  // Stats por evento
  const getEventStats = (eventId) => {
    const eventSales = mySales.filter(s => s.eventId === eventId);
    const ticketsSold = eventSales.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const totalGenerated = eventSales.reduce((acc, s) => acc + (s.subtotal || 0), 0);
    const totalCommission = eventSales.reduce((acc, s) => acc + (s.commissionerFee || s.commissionFee || 0), 0);
    return { ticketsSold, totalGenerated, totalCommission };
  };

  const handleCopyLink = (eventId) => {
    const refLink = `${window.location.origin}/?promo=${commissionerCode.toUpperCase()}&event=${eventId}`;
    navigator.clipboard.writeText(refLink);
    setCopiedEventId(eventId);
    setTimeout(() => setCopiedEventId(null), 2000);
  };

  // Helper: formatar data do evento para "DD/MM às HH:MM"
  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
    const startPart = dateStr.split(' até ')[0];
    const matchISO = startPart.match(/(\d{4})-(\d{2})-(\d{2})\s+[àaA][sS]\s+(\d{2}:\d{2})/);
    if (matchISO) return `${matchISO[3]}/${matchISO[2]} às ${matchISO[4]}`;
    const matchBR = startPart.match(/(\d{2})\/(\d{2})\/(\d{4})\s+[àaA][sS]\s+(\d{2}:\d{2})/);
    if (matchBR) return `${matchBR[1]}/${matchBR[2]} às ${matchBR[4]}`;
    return startPart;
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || amt > totalCommissionsEarned) {
      alert('Valor inválido para saque.');
      return;
    }
    if (!withdrawPix.trim()) {
      alert('Informe sua chave PIX.');
      return;
    }
    alert(`Solicitação de saque de R$ ${amt.toFixed(2)} enviada com sucesso! O valor será depositado na chave PIX informada em até 3 dias úteis.`);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
    setWithdrawPix('');
    setWithdrawAccount('');
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
          { label: 'Ingressos Vendidos', val: `${totalTicketsSold} un.` },
          { label: 'Comissão Acumulada', val: `R$ ${totalCommissionsEarned.toFixed(2)}` },
          { label: 'Eventos Ativos', val: `${myLinkedEvents.length} ev.` }
        ].map(st => (
          <div
            key={st.label}
            style={{
              backgroundColor: '#ffffff',
              padding: '14px 10px',
              borderRadius: '16px',
              border: '1px solid #eef2f6',
              borderLeft: '4px solid #f28d1a',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>{st.label}</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 500, color: '#1a1a1a', margin: '4px 0', letterSpacing: '-0.3px' }}>{st.val}</div>
          </div>
        ))}
      </div>

      {/* Withdraw Button */}
      <button
        onClick={() => {
          if (totalCommissionsEarned <= 0) {
            alert('Você ainda não possui comissão acumulada para realizar saques.');
            return;
          }
          setShowWithdrawModal(true);
          setWithdrawAmount(totalCommissionsEarned.toFixed(2));
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          borderRadius: '16px',
          border: 'none',
          background: totalCommissionsEarned > 0 ? 'linear-gradient(135deg, #f9bb1a, #f28d1a)' : '#eaeaea',
          color: totalCommissionsEarned > 0 ? 'white' : '#999',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: totalCommissionsEarned > 0 ? 'pointer' : 'not-allowed',
          boxShadow: totalCommissionsEarned > 0 ? '0 4px 12px rgba(242,141,26,0.3)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        sacar
      </button>

      {/* Chat Card */}
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
          Chat
        </button>
      </div>
    </div>
  );

  const renderMyLinks = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Meus Eventos</h3>
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
            const stats = getEventStats(ev.id);
            const myCommInfo = ev.commissioners?.find(c => c.code.toUpperCase() === commissionerCode.toUpperCase());
            const commRate = myCommInfo?.rate !== undefined ? myCommInfo.rate : 10;
            const discountRate = myCommInfo?.discount !== undefined ? myCommInfo.discount : 0;

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
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Event Header */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img 
                    src={ev.image} 
                    alt={ev.name} 
                    style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2d2d2d', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.name}
                    </h4>
                    <div style={{ fontSize: '0.68rem', color: '#f28d1a', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{formatEventDate(ev.date)}</span>
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

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div style={{ backgroundColor: '#fcf6ed', padding: '10px', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: '#999', fontWeight: 500, marginBottom: '2px' }}>Sua Comissão</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f28d1a' }}>{commRate}%</div>
                  </div>
                  <div style={{ backgroundColor: '#fcf6ed', padding: '10px', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: '#999', fontWeight: 500, marginBottom: '2px' }}>Total Gerado</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f28d1a' }}>R$ {stats.totalGenerated.toFixed(2)}</div>
                  </div>
                  <div style={{ backgroundColor: '#fcf6ed', padding: '10px', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: '#999', fontWeight: 500, marginBottom: '2px' }}>Seu Ganho</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f28d1a' }}>R$ {stats.totalCommission.toFixed(2)}</div>
                  </div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {discountRate > 0 && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      backgroundColor: '#fcf6ed',
                      color: '#f28d1a',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #f28d1a15'
                    }}>
                      Desconto do link: {discountRate}%
                    </span>
                  )}
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 600,
                    backgroundColor: '#fcf6ed',
                    color: '#f28d1a',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid #f28d1a15'
                  }}>
                    {stats.ticketsSold} vendidos
                  </span>
                </div>

                {/* Link Preview */}
                <div style={{ fontSize: '0.65rem', color: '#999', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Link: {window.location.origin}/?promo={commissionerCode.toUpperCase()}&event={ev.id}
                </div>
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
                    + R$ {(sale.commissionerFee || sale.commissionFee || 0).toFixed(2)}
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
              { id: 'links', label: 'Meus Eventos', icon: <Ticket size={18} /> },
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
              title="Chat"
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

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowWithdrawModal(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '28px',
              padding: '24px',
              width: '100%',
              maxWidth: '380px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 650, color: '#2d2d2d', margin: 0 }}>Sacar Saldo</h3>
              <button onClick={() => setShowWithdrawModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              backgroundColor: '#fffdf9',
              border: '1.5px solid #f28d1a20',
              borderRadius: '20px',
              padding: '16px',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '0.72rem', color: '#888', fontWeight: 500 }}>Saldo disponível para saque</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f28d1a', marginTop: '4px' }}>R$ {totalCommissionsEarned.toFixed(2)}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#555' }}>Chave PIX</label>
              <input
                type="text"
                value={withdrawPix}
                onChange={(e) => setWithdrawPix(e.target.value)}
                className="input-field"
                placeholder="CPF, E-mail, Celular ou Chave Aleatória"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#555' }}>Número da Conta</label>
              <input
                type="text"
                value={withdrawAccount}
                onChange={(e) => setWithdrawAccount(e.target.value)}
                className="input-field"
                placeholder="Ex: Agência 0001, Conta 12345-6"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#555' }}>Valor do Saque (R$)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="input-field"
                placeholder="0.00"
                min="1"
                max={totalCommissionsEarned}
                step="0.01"
              />
            </div>

            <button
              onClick={handleWithdraw}
              style={{
                padding: '12px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #f9bb1a, #f28d1a)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(242,141,26,0.25)',
                marginTop: '6px'
              }}
            >
              Solicitar Saque
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Painel', icon: <Layers size={20} /> },
          { id: 'links', label: 'Eventos', icon: <Ticket size={20} /> },
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
