import { useState, useEffect } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { ToggleLeft, ToggleRight, Bike, MapPin, MessageSquare, Home, X, Bell, LogOut, User, Camera, Edit, Save, Calendar, Clock, Layers } from 'lucide-react';
import { uploadAvatar, uploadCover } from '../../firebase/storage';

export default function DeliveryArea({ onOpenChat, onToggleNotifications, unreadNotificationsCount, onLogout, onGoToHome }) {
  const { currentUser, orders, acceptDelivery, updateOrderStatus, setUsers, categories, updateUserProfile } = useFirebaseMock();

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('connecta_delivery_active_tab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('connecta_delivery_active_tab', activeTab);
  }, [activeTab]);

  // Profile editing states
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  // Saque modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPixKey, setWithdrawPixKey] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  
  // Rider toggle state
  const isOnline = currentUser.online;
  const deliveryRate = currentUser.deliveryRate || 7.00;

  // Find delivery offers (orders calling riders)
  const deliveryOffers = orders.filter(o => o.status === 'calling_rider' && (!o.assignedRiderId || o.assignedRiderId === currentUser.id));

  // Find rider's active job
  const activeJob = orders.find(o => 
    o.riderId === currentUser.id && 
    o.status !== 'delivered' && 
    o.status !== 'rejected'
  );

  // Compute rider stats
  const completedDeliveries = orders.filter(o => o.riderId === currentUser.id && o.status === 'delivered');
  const totalRiderEarnings = completedDeliveries.length * (currentUser.deliveryRate || 7.00);
  const withdrawableBalance = totalRiderEarnings; // Real withdrawable balance from completed deliveries

  const handleToggleOnline = () => {
    const nextOnlineState = !currentUser.online;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, online: nextOnlineState } : u));
    updateUserProfile(currentUser.id, { online: nextOnlineState });
  };

  const handleRateChange = (newRate) => {
    const rateVal = parseFloat(newRate) || 7.00;
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, deliveryRate: rateVal } : u));
    updateUserProfile(currentUser.id, { deliveryRate: rateVal });
  };

  const startEditing = (field, val) => {
    setEditingField(field);
    setEditValue(val || '');
  };

  const handleSaveField = (field) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, [field]: editValue } : u));
    updateUserProfile(currentUser.id, { [field]: editValue });
    setEditingField(null);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadAvatar(file, currentUser.id);
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatar: url, logo: url } : u));
        updateUserProfile(currentUser.id, { avatar: url, logo: url });
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
                  padding: '2px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#f28d1a',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.62rem',
                  cursor: 'pointer'
                }}
              >
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

  const renderProfileView = () => {
    const deliveryCategoriesFromDb = categories ? categories.filter(c => c.type === 'entregadores').map(c => c.label) : [];
    const deliveryCategoriesList = deliveryCategoriesFromDb.length > 0 ? deliveryCategoriesFromDb : ['Entrega de Moto', 'Entrega de Carro / Fretes', 'Bicicleta', 'Caminhão/Entregas Grandes'];

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', width: '100%', boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Cover Banner */}
        <div style={{ width: '100%', height: '140px', position: 'relative', backgroundColor: '#fafafa', borderRadius: '16px', overflow: 'hidden' }}>
          <img 
            src={currentUser.cover || currentUser.banner || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 35"><rect width="100" height="35" fill="%23eaeaea"/></svg>'} 
            alt="cover" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <label 
            htmlFor="cover-file-upload-del"
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
              fontWeight: 500,
              backdropFilter: 'blur(2px)'
            }}
          >
            <Camera size={12} /> Alterar Capa
          </label>
          <input 
            type="file" 
            id="cover-file-upload-del" 
            accept="image/*" 
            onChange={handleCoverUpload} 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Profile Avatar overlapping */}
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
              src={currentUser.avatar || currentUser.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} 
              alt="logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <label 
              htmlFor="avatar-file-upload-del"
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
              className="avatar-hover-upload"
            >
              <Camera size={16} />
            </label>
            <input 
              type="file" 
              id="avatar-file-upload-del" 
              accept="image/*" 
              onChange={handleAvatarUpload} 
              style={{ display: 'none' }} 
            />
          </div>
          <style>{`
            .avatar-hover-upload:hover { opacity: 1 !important; }
          `}</style>

          {/* Inline Editing */}
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>{currentUser.name}</h3>
                <button type="button" onClick={() => startEditing('name', currentUser.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
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
                  <option value="">Selecione uma categoria...</option>
                  {deliveryCategoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button type="button" onClick={() => handleSaveField('category')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentUser.category || 'Sem categoria cadastrada'}</span>
                <button type="button" onClick={() => startEditing('category', currentUser.category || deliveryCategoriesList[0])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
              </div>
            )}

            {/* DESCRIPTION / BIO */}
            {editingField === 'description' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', marginBottom: '8px' }}>
                <textarea 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                  className="input-field" 
                  style={{ padding: '8px', fontSize: '0.78rem', height: '80px', resize: 'none', margin: 0 }}
                  placeholder="Conte um pouco sobre sua experiência de entrega..."
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '30px', width: 'auto' }}>Cancelar</button>
                  <button type="button" onClick={() => handleSaveField('description')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '30px', width: 'auto', backgroundColor: '#f28d1a' }}>Salvar</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, lineHeight: 1.35, flex: 1, whiteSpace: 'pre-wrap' }}>{currentUser.description || 'Nenhuma descrição/bio cadastrada.'}</p>
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
                  <span style={{ color: '#555' }}>Endereço base:</span> {currentUser.address || 'Não informado'}
                  <button type="button" onClick={() => startEditing('address', currentUser.address || '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DELIVERY HISTORY SECTION */}
        <div style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} style={{ color: '#f28d1a' }} /> Histórico de Entregas ({completedDeliveries.length})
          </h3>

          {completedDeliveries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '0.8rem', backgroundColor: '#f9f9f9', borderRadius: '16px', border: '1px solid #eee' }}>
              Nenhuma entrega concluída ainda. Comece a receber corridas!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {completedDeliveries.map(order => (
                <div 
                  key={order.id} 
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '16px',
                    border: '1px solid #eee',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* History Item Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #fcfcfc', paddingBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2d2d2d' }}>Pedido #{order.id}</span>
                      <div style={{ fontSize: '0.68rem', color: '#999', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={12} /> {order.date || 'Data não disponível'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2ec4b6' }}>+ R$ {(currentUser.deliveryRate || 7.00).toFixed(2)}</span>
                      <div style={{ fontSize: '0.62rem', backgroundColor: '#e6f7f0', color: '#2ec4b6', padding: '2px 8px', borderRadius: '99px', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>
                        ENTREGUE
                      </div>
                    </div>
                  </div>

                  {/* Merchant & Customer Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.72rem', color: '#666' }}>
                    <div style={{ backgroundColor: '#fafafa', padding: '8px 12px', borderRadius: '12px' }}>
                      <strong style={{ color: '#ff5e5b', fontSize: '0.62rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Coleta</strong>
                      <span style={{ fontWeight: 600, color: '#333' }}>{order.items[0]?.storeName || 'Loja Parceira'}</span>
                    </div>
                    <div style={{ backgroundColor: '#fafafa', padding: '8px 12px', borderRadius: '12px' }}>
                      <strong style={{ color: '#f28d1a', fontSize: '0.62rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Destinatário</strong>
                      <span style={{ fontWeight: 600, color: '#333' }}>{order.customerName}</span>
                    </div>
                  </div>

                  {/* Destination address */}
                  <div style={{ fontSize: '0.72rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fffcf7', padding: '8px 12px', borderRadius: '12px' }}>
                    <MapPin size={12} style={{ color: '#f28d1a', flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.address}</span>
                  </div>

                  {/* Items list summary */}
                  <div style={{ borderTop: '1px dashed #eee', paddingTop: '8px', fontSize: '0.68rem', color: '#888' }}>
                    <span style={{ fontWeight: 600 }}>Itens entregues:</span>{' '}
                    {order.items.map((item, idx) => (
                      <span key={item.id}>
                        {item.quantity}x {item.name}
                        {idx < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              { id: 'active_job', label: 'Corrida Ativa', icon: <Bike size={18} /> },
              { id: 'profile', label: 'Perfil', icon: <User size={18} /> }
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
                style={{ position: 'relative' }}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === 'active_job' && activeJob && (
                  <span style={{ position: 'absolute', top: '2px', right: '14px', backgroundColor: '#ff5e5b', width: '6px', height: '6px', borderRadius: '50%' }} />
                )}
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
        {activeTab === 'active_job' && renderActiveJob()}
        {activeTab === 'profile' && renderProfileView()}
      </div>

      {/* Menu Fixo Embaixo com Ícones */}
      <div className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Painel', icon: <Layers size={20} /> },
          { id: 'active_job', label: 'Corrida Ativa', icon: <Bike size={20} /> },
          { id: 'profile', label: 'Perfil', icon: <User size={20} /> }
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
    </div>
  );
}
