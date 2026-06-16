import { useState } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { ToggleLeft, ToggleRight, Bike, MapPin, MessageSquare, Home } from 'lucide-react';

export default function DeliveryArea({ onOpenChat }) {
  const { currentUser, orders, acceptDelivery, updateOrderStatus, setUsers } = useFirebaseMock();

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, active_job
  
  // Rider toggle state
  const isOnline = currentUser.online;
  const deliveryRate = currentUser.deliveryRate || 7.00;

  // Find delivery offers (orders calling riders)
  const deliveryOffers = orders.filter(o => o.status === 'calling_rider');

  // Find rider's active job
  const activeJob = orders.find(o => 
    o.riderId === currentUser.id && 
    o.status !== 'delivered' && 
    o.status !== 'rejected'
  );

  // Compute rider stats
  const completedDeliveries = orders.filter(o => o.riderId === currentUser.id && o.status === 'delivered');
  const totalRiderEarnings = completedDeliveries.length * (currentUser.deliveryRate || 7.00);
  const withdrawableBalance = totalRiderEarnings + 42.00; // simulated history

  const handleToggleOnline = () => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, online: !u.online } : u));
  };

  const handleRateChange = (newRate) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, deliveryRate: parseFloat(newRate) || 7.00 } : u));
  };

  // --- SUBVIEW 1: DASHBOARD ---
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      
      {/* Welcome & Chat support */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d' }}>{currentUser.name}</h2>
          <p style={{ fontSize: '0.78rem', color: '#777' }}>Entregador Parceiro | Ouro Preto</p>
        </div>
      </div>

      {/* Online/Offline card */}
      <div style={{
        backgroundColor: isOnline ? '#e6f7f4' : '#fef3f3',
        padding: '16px',
        borderRadius: '24px',
        border: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d' }}>
            Você está {isOnline ? 'Online, uai!' : 'Offline'}
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#666', marginTop: '2px' }}>
            {isOnline ? 'Pronto para receber chamadas de entrega.' : 'Ative para visualizar ofertas.'}
          </p>
        </div>

        <button
          onClick={handleToggleOnline}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isOnline ? '#2ec4b6' : '#ff5e5b' }}
        >
          {isOnline ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
        </button>
      </div>

      {/* Stats and Wallet */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { label: 'Minha Carteira', val: `R$ ${withdrawableBalance.toFixed(2)}`, desc: 'Saldo para saque', color: '#fffdf4', btn: 'Sacar' },
          { label: 'Taxa por Entrega', val: `R$ ${deliveryRate.toFixed(2)}`, desc: 'Defina seu preço', color: '#fffdf0', input: true },
          { label: 'Corridas Feitas', val: `${completedDeliveries.length} entregas`, desc: 'Geral Connecta+', color: '#f3faf8' },
          { label: 'Ganhos Acumulados', val: `R$ ${totalRiderEarnings.toFixed(2)}`, desc: 'Histórico líquido', color: '#fef3f3' }
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
            <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600 }}>{st.label}</span>
            {st.input ? (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'baseline', margin: '4px 0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>R$</span>
                <input
                  type="number"
                  step="0.50"
                  value={deliveryRate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  style={{
                    width: '60px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '2px 6px',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                />
              </div>
            ) : (
              <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0' }}>{st.val}</div>
            )}
            <div style={{ fontSize: '0.62rem', color: '#999' }}>{st.desc}</div>
            {st.btn && (
              <button style={{
                marginTop: '8px',
                padding: '2px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#f28d1a',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.62rem',
                cursor: 'pointer'
              }}>
                {st.btn}
              </button>
            )}
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
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Suporte Connecta+</h4>
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

      {/* Offers pipeline */}
      {isOnline && (
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px' }}>Ofertas de Entrega ({deliveryOffers.length})</h3>
          {deliveryOffers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #eee', color: '#999', fontSize: '0.8rem' }}>
              Nenhuma entrega disponível no momento, sô.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {deliveryOffers.map(offer => (
                <div
                  key={offer.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '14px',
                    border: '1px solid #eee',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.8rem' }}>Pedido #{offer.id}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#2ec4b6', fontWeight: 500 }}>Ganho: R$ {deliveryRate.toFixed(2)}</span>
                  </div>
                  
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    <div>Coleta (Loja): {offer.items[0].storeName}</div>
                    <div>Endereço Loja: Rua Getúlio Vargas, 102 - Centro</div>
                    <div>Destino (Cliente): {offer.customerName}</div>
                    <div>Endereço Cliente: {offer.address}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      onClick={() => alert('Oferta recusada pelo motoboy.')}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '6px 0', fontSize: '0.72rem', borderRadius: '12px' }}
                    >
                      Recusar
                    </button>
                    <button
                      onClick={() => {
                        acceptDelivery(offer.id, currentUser.id);
                        setActiveTab('active_job');
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '6px 0', fontSize: '0.72rem', borderRadius: '12px' }}
                    >
                      Aceitar Corrida
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // --- SUBVIEW 2: ACTIVE JOB DETAILS (WITH SIMULATED PATH MAP) ---
  const renderActiveJob = () => {
    if (!activeJob) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }} className="animate-fade-in">
          <Bike size={40} style={{ color: '#ccc', margin: '0 auto 8px' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '8px' }}>Nenhuma entrega ativa!</h3>
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Fique online e aguarde chamadas.</p>
          <button onClick={() => setActiveTab('dashboard')} className="btn btn-primary" style={{ marginTop: '14px' }}>Ir para Painel</button>
        </div>
      );
    }

    const isHeadingToStore = activeJob.status === 'rider_assigned';
    const isDelivering = activeJob.status === 'delivering';

    // Simulated path routing coordinates based on status
    const getRiderPos = () => {
      if (isHeadingToStore) return { x: 100, y: 80 }; // halfway to store
      return { x: 180, y: 100 }; // delivering (halfway to client)
    };

    const riderPos = getRiderPos();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
        
        {/* Active Header */}
        <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '20px', border: '1px solid #eee', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 500 }}>Entrega em Andamento</h3>
            <span style={{ fontSize: '0.7rem', color: '#999' }}>Pedido #{activeJob.id}</span>
          </div>
          <button 
            onClick={() => onOpenChat()} // chat with merchant/customer
            style={{
              padding: '6px 12px',
              borderRadius: '99px',
              backgroundColor: '#f9bb1a20',
              color: '#f28d1a',
              border: '1.5px solid #f28d1a',
              fontSize: '0.68rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Chat Suporte
          </button>
        </div>

        {/* MAP ROUTING SIMULATION */}
        <div style={{
          width: '100%',
          height: '180px',
          backgroundColor: '#e6f2eb',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)',
          border: '1.5px solid #c8e2d2'
        }}>
          <svg width="100%" height="100%">
            <path d="M 50 120 Q 120 40 180 100 T 280 150" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
            <path d="M 50 120 Q 120 40 180 100 T 280 150" fill="none" stroke="#2ec4b650" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 4" />
            
            {/* Store Pin */}
            <circle cx="50" cy="120" r="12" fill="#ff5e5b" />
            <text x="50" y="123" fontSize="8" fill="white" fontWeight="800" textAnchor="middle">L</text>

            {/* Customer Pin */}
            <circle cx="280" cy="150" r="12" fill="#f28d1a" />
            <text x="280" y="153" fontSize="8" fill="white" fontWeight="800" textAnchor="middle">C</text>

            {/* Rider pin */}
            <g transform={`translate(${riderPos.x - 12}, ${riderPos.y - 12})`}>
              <circle cx="12" cy="12" r="10" fill="#2ec4b6" />
              <text x="12" y="15" fontSize="8" fill="white" fontWeight="800" textAnchor="middle">M</text>
            </g>
          </svg>
        </div>

        {/* Coleta & Destino details */}
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.62rem', backgroundColor: '#ff5e5b15', color: '#ff5e5b', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>COLETA</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, marginTop: '4px' }}>{activeJob.items[0].storeName}</div>
            <div style={{ fontSize: '0.72rem', color: '#777', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><MapPin size={12} /> Rua Getúlio Vargas, 102, Centro</div>
          </div>
          
          <div style={{ borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.62rem', backgroundColor: '#f9bb1a20', color: '#f28d1a', padding: '2px 8px', borderRadius: '99px', fontWeight: 500 }}>ENTREGA</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 500, marginTop: '4px' }}>{activeJob.customerName}</div>
            <div style={{ fontSize: '0.72rem', color: '#777', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><MapPin size={12} /> {activeJob.address}</div>
          </div>
        </div>

        {/* Actions */}
        {isHeadingToStore && (
          <button
            onClick={() => updateOrderStatus(activeJob.id, 'delivering')}
            className="btn btn-primary pulse-button"
            style={{ width: '100%', height: '48px' }}
          >
            Cheguei na Loja (Iniciar Entrega)
          </button>
        )}

        {isDelivering && (
          <button
            onClick={() => updateOrderStatus(activeJob.id, 'delivered')}
            className="btn btn-primary"
            style={{ width: '100%', height: '48px', backgroundColor: '#2ec4b6' }}
          >
            Confirmar Entrega Concluída
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', position: 'relative' }} className="animate-fade-in">
      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '90px' }} className="custom-scroll">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'active_job' && renderActiveJob()}
      </div>

      {/* Menu Fixo Embaixo com Ícones */}
      <div className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Painel', icon: <Home size={20} /> },
          { id: 'active_job', label: 'Corrida Ativa', icon: <Bike size={20} /> }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            style={{ position: 'relative' }}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.id === 'active_job' && activeJob && (
              <span style={{ position: 'absolute', top: '2px', right: '24px', backgroundColor: '#ff5e5b', width: '8px', height: '8px', borderRadius: '50%' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
