import { useState, useEffect } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { 
  Home, UserCheck, Ticket, Bell, Layers, LogOut,
  Sparkles, Palette, Gift, Wrench, Star, Award, Heart, 
  ShoppingCart, MapPin, Camera, Music, Coffee, Book, 
  Gem, Scissors, Brush, Utensils, Wine, Mountain, 
  Sun, Umbrella, Zap, Flame, Leaf,
  X, User, MessageSquare
} from 'lucide-react';
import Chat from '../Shared/Chat';

const iconComponents = {
  Sparkles, Palette, Gift, Wrench, Ticket, Star, Award, Heart, 
  ShoppingCart, MapPin, Camera, Music, Coffee, Book, 
  Gem, Scissors, Brush, Utensils, Wine, Mountain, 
  Sun, Umbrella, Zap, Flame, Leaf
};

export default function AdminArea() {
  const { 
    users, orders, servicesHired, coupons, updateRegistrationStatus, 
    setUserBanStatus, createCoupon, triggerGlobalNotification, setUsers,
    categories, addCategory, editCategory, deleteCategory,
    visualLayoutSettings, updateVisualLayoutSettings, logout
  } = useFirebaseMock();

  const [activeTab, setActiveTab] = useState('metrics'); // metrics, users_mod, coupons_mod, categories_mod, notifications
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);

  // Commission Rates states
  const [commProd, setCommProd] = useState('');
  const [commTicket, setCommTicket] = useState('');
  const [commServ, setCommServ] = useState('');

  // Banner Editor state
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerDesc, setBannerDesc] = useState('');
  const [bannerImg, setBannerImg] = useState('');
  const [bannerLink, setBannerLink] = useState('');

  // Sync state when settings are loaded
  useEffect(() => {
    if (visualLayoutSettings?.homeBanner) {
      setBannerTitle(visualLayoutSettings.homeBanner.title || '');
      setBannerDesc(visualLayoutSettings.homeBanner.desc || '');
      setBannerImg(visualLayoutSettings.homeBanner.img || '');
      setBannerLink(visualLayoutSettings.homeBanner.link || '');
    }
    if (visualLayoutSettings?.commissions) {
      setCommProd(visualLayoutSettings.commissions.products?.toString() || '10');
      setCommTicket(visualLayoutSettings.commissions.tickets?.toString() || '10');
      setCommServ(visualLayoutSettings.commissions.services?.toString() || '12');
    } else {
      setCommProd('10');
      setCommTicket('10');
      setCommServ('12');
    }
  }, [visualLayoutSettings]);

  const renderCategoryIcon = (iconName, size = 18) => {
    const IconComp = iconComponents[iconName] || Sparkles;
    return <IconComp size={size} />;
  };

  // Coupon form
  const [cpCode, setCpCode] = useState('');
  const [cpType, setCpType] = useState('fixed');
  const [cpValue, setCpValue] = useState('');
  const [cpMin, setCpMin] = useState('0.00');

  // Push form
  const [pushTarget, setPushTarget] = useState('all'); // all, client, seller, motoboy
  const [pushText, setPushText] = useState('');

  // Coins adjustment
  const [selectedUserId, setSelectedUserId] = useState('');
  const [coinsDelta, setCoinsDelta] = useState('50');

  // Category management
  const [catLabel, setCatLabel] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('Sparkles');
  const [catType, setCatType] = useState('lojas');
  const [editingCatId, setEditingCatId] = useState(null);

  // --- STATS CALCULATION ---
  const clientsCount = users.filter(u => u.role === 'client').length;
  const sellersCount = users.filter(u => u.role === 'seller').length;
  const providersCount = users.filter(u => u.role === 'provider').length;
  const organizersCount = users.filter(u => u.role === 'organizer').length;
  const motoboysCount = users.filter(u => u.role === 'motoboy').length;

  // Revenue by sector
  let productSales = 0;
  let productCommissions = 0;
  let ticketSales = 0;
  let ticketCommissions = 0;

  orders.forEach(o => {
    if (o.type === 'ticket') {
      ticketSales += o.total;
      ticketCommissions += o.commissionFee;
    } else {
      productSales += o.total;
      productCommissions += o.commissionFee;
    }
  });

  const serviceVolume = servicesHired
    .filter(h => h.status === 'completed' || h.status === 'accepted')
    .reduce((acc, h) => acc + h.total, 0);

  const serviceCommissions = servicesHired
    .filter(h => h.status === 'completed' || h.status === 'accepted')
    .reduce((acc, h) => acc + h.commissionFee, 0);

  const totalGMV = productSales + ticketSales + serviceVolume;
  const totalCommissions = productCommissions + ticketCommissions + serviceCommissions;

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!cpCode || !cpValue) return;

    createCoupon({
      code: cpCode,
      discountType: cpType,
      value: parseFloat(cpValue),
      minPurchase: parseFloat(cpMin)
    });

    setCpCode('');
    setCpValue('');
    alert('Cupom criado e ativado no sistema, sô!');
  };

  const handlePushSubmit = (e) => {
    e.preventDefault();
    if (!pushText) return;

    triggerGlobalNotification(pushTarget, pushText);
    setPushText('');
    alert('Notificação enviada em massa com sucesso!');
  };

  const handleCoinsAdjustment = (e) => {
    e.preventDefault();
    if (!selectedUserId || !coinsDelta) return;

    setUsers(prev => prev.map(u => {
      if (u.id === selectedUserId) {
        return { ...u, ouroCoins: Math.max(0, u.ouroCoins + parseInt(coinsDelta)) };
      }
      return u;
    }));

    setCoinsDelta('50');
    alert('Saldo de OuroCoins ajustado!');
  };

  // --- SUBVIEW 1: GLOBAL METRICS ---
  const renderMetrics = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d2d2d' }}>Desempenho Geral</h2>
        <p style={{ fontSize: '0.78rem', color: '#777' }}>Auditoria financeira em tempo real</p>
      </div>

      {/* Total system balance */}
      <div style={{
        background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
        borderRadius: '24px',
        padding: '20px',
        color: 'white',
        boxShadow: '0 8px 20px rgba(242,141,26,0.2)'
      }}>
        <span style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faturamento Líquido Connecta+ (Comissões)</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '4px 0', color: 'white' }}>
          R$ {totalCommissions.toFixed(2)}
        </h1>
        <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>
          Volume Transacionado Geral (GMV): <strong>R$ {totalGMV.toFixed(2)}</strong>
        </p>
      </div>

      {/* Stats by Sector */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px' }}>Faturamento por Setor</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { name: 'Lojas & Produtos', vol: productSales, fee: productCommissions, rate: `${visualLayoutSettings?.commissions?.products ?? 10}%` },
            { name: 'Festas & Ingressos', vol: ticketSales, fee: ticketCommissions, rate: `${visualLayoutSettings?.commissions?.tickets ?? 10}%` },
            { name: 'Prestadores de Serviço', vol: serviceVolume, fee: serviceCommissions, rate: `${visualLayoutSettings?.commissions?.services ?? 12}%` }
          ].map(sec => (
            <div
              key={sec.name}
              style={{
                backgroundColor: 'white',
                padding: '12px 16px',
                borderRadius: '16px',
                border: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#2d2d2d' }}>{sec.name}</strong>
                <div style={{ fontSize: '0.68rem', color: '#777', marginTop: '2px' }}>
                  Volume: R$ {sec.vol.toFixed(2)} | Comissão: {sec.rate}
                </div>
              </div>
              <strong style={{ fontSize: '0.9rem', color: '#f28d1a' }}>+ R$ {sec.fee.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Commission settings form */}
      <div style={{ backgroundColor: 'white', padding: '18px', borderRadius: '24px', border: '1px solid #eee' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '4px' }}>Gerenciar Taxas de Comissão (%)</h3>
        <p style={{ fontSize: '0.72rem', color: '#777', marginBottom: '14px' }}>Defina a taxa de comissão cobrada para cada tipo de setor.</p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const updatedCommissions = {
            products: parseFloat(commProd) || 0,
            tickets: parseFloat(commTicket) || 0,
            services: parseFloat(commServ) || 0
          };
          updateVisualLayoutSettings({
            ...visualLayoutSettings,
            commissions: updatedCommissions
          });
          alert('Taxas de comissão atualizadas com sucesso!');
        }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Lojas & Produtos (%)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="100"
                value={commProd}
                onChange={(e) => setCommProd(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '10px',
                  border: '1px solid #ddd', fontSize: '0.8rem', outline: 'none'
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Festas & Ingressos (%)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="100"
                value={commTicket}
                onChange={(e) => setCommTicket(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '10px',
                  border: '1px solid #ddd', fontSize: '0.8rem', outline: 'none'
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '4px' }}>Prestadores de Serviço (%)</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="100"
                value={commServ}
                onChange={(e) => setCommServ(e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '10px',
                  border: '1px solid #ddd', fontSize: '0.8rem', outline: 'none'
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 16px', borderRadius: '10px',
              backgroundColor: '#f28d1a', color: 'white', border: 'none',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
              alignSelf: 'flex-start', marginTop: '4px'
            }}
          >
            Salvar Taxas
          </button>
        </form>
      </div>

      {/* Users Count summary */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px' }}>Usuários Cadastrados</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
          {[
            { label: 'Clientes', count: clientsCount },
            { label: 'Lojas', count: sellersCount },
            { label: 'Prestadores', count: providersCount },
            { label: 'Motoboys', count: motoboysCount },
            { label: 'Eventos', count: organizersCount }
          ].map(it => (
            <div key={it.label} style={{ backgroundColor: '#fafafa', padding: '8px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.65rem', color: '#777' }}>{it.label}</div>
              <strong style={{ fontSize: '1.1rem', color: '#f28d1a' }}>{it.count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Personalizar Página Inicial (Home Banner) */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #eee', marginTop: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '4px' }}>Banner Principal da Home</h3>
        <p style={{ fontSize: '0.72rem', color: '#777', marginBottom: '14px' }}>Configure o slide de destaque na página inicial dos clientes</p>
        
        {/* Banner Preview */}
        {bannerImg && (
          <div style={{
            width: '100%',
            height: '100px',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <img src={bannerImg} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '12px 16px',
              color: 'white'
            }}>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0, color: '#f9bb1a' }}>{bannerTitle || 'Título do Banner'}</h4>
              <p style={{ fontSize: '0.68rem', marginTop: '2px', opacity: 0.9 }}>{bannerDesc || 'Descrição do banner...'}</p>
              <span style={{ fontSize: '0.58rem', marginTop: '4px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content' }}>
                Destino: {bannerLink || 'Nenhum'}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          updateVisualLayoutSettings({
            ...visualLayoutSettings,
            homeBanner: {
              title: bannerTitle,
              desc: bannerDesc,
              img: bannerImg,
              link: bannerLink
            }
          });
          alert('Banner da Home atualizado com sucesso, sô!');
        }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444' }}>Título do Banner</label>
            <input 
              type="text" 
              placeholder="Ex: Artesanato & Tradição" 
              value={bannerTitle} 
              onChange={(e) => setBannerTitle(e.target.value)} 
              className="input-field" 
              style={{ padding: '8px 12px', fontSize: '0.78rem' }}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444' }}>Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: Peças em pedra-sabão direto de Ouro Preto" 
              value={bannerDesc} 
              onChange={(e) => setBannerDesc(e.target.value)} 
              className="input-field" 
              style={{ padding: '8px 12px', fontSize: '0.78rem' }}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444' }}>Foto do Banner</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="URL da imagem ou faça upload..." 
                value={bannerImg} 
                onChange={(e) => setBannerImg(e.target.value)} 
                className="input-field" 
                style={{ padding: '8px 12px', fontSize: '0.78rem', flex: 1 }}
                required 
              />
              <label style={{
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: '#fff9ee',
                color: '#f28d1a',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px dashed #f28d1a',
                flexShrink: 0
              }}>
                Upload
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setBannerImg(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#444' }}>Redirecionar Para (Link)</label>
            <select 
              value={bannerLink} 
              onChange={(e) => setBannerLink(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '12px', 
                border: '2px solid #eaeaea', 
                fontSize: '0.78rem', 
                backgroundColor: 'white', 
                fontWeight: 600 
              }}
            >
              <option value="lojas">Aba Lojas (Home Principal)</option>
              <option value="servicos">Aba Serviços</option>
              <option value="eventos">Aba Eventos</option>
              <optgroup label="Categorias Específicas">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.label}>{cat.label} ({cat.type})</option>
                ))}
              </optgroup>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '38px', fontSize: '0.82rem', fontWeight: 600, marginTop: '8px' }}>
            Salvar Alterações na Home
          </button>
        </form>
      </div>
    </div>
  );

  // --- SUBVIEW 2: USERS MODERATION & REGISTRATIONS AUDITING ---
  const renderUsersMod = () => {
    const pendingUsers = users.filter(u => u.registrationStatus === 'pending');
    const approvedUsers = users.filter(u => u.registrationStatus === 'approved' && u.role !== 'admin');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
        
        {/* Approvals section */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '8px' }}>Auditoria de Cadastros ({pendingUsers.length})</h3>
          {pendingUsers.length === 0 ? (
            <div style={{ fontSize: '0.78rem', color: '#888', fontStyle: 'italic', backgroundColor: 'white', padding: '12px', borderRadius: '16px', border: '1px solid #eee' }}>
              Nenhum cadastro aguardando aprovação uai.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingUsers.map(user => (
                <div
                  key={user.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '14px',
                    borderRadius: '20px',
                    border: '1px solid #eee',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, marginBottom: '6px' }}>
                    <span>{user.name}</span>
                    <span style={{ color: '#f28d1a' }}>{user.role.toUpperCase()}</span>
                  </div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Contato:</strong> {user.phone}</div>
                  {user.cnpj && <div><strong>CNPJ/CPF:</strong> {user.cnpj}</div>}
                  {user.cpf && <div><strong>CPF:</strong> {user.cpf}</div>}
                  {user.address && <div><strong>Endereço:</strong> {user.address}</div>}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => updateRegistrationStatus(user.id, 'refused')}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '4px 0', fontSize: '0.72rem', borderRadius: '10px' }}
                    >
                      Recusar
                    </button>
                    <button
                      onClick={() => updateRegistrationStatus(user.id, 'approved')}
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '4px 0', fontSize: '0.72rem', borderRadius: '10px', backgroundColor: '#2ec4b6' }}
                    >
                      Aprovar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User list & Ban controls */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '12px' }}>
            Gerenciar Usuários Aprovados ({approvedUsers.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {approvedUsers.map(user => {
              const purchaseCount = orders.filter(o => o.userId === user.id || o.customerId === user.id).length;
              const hasAvatar = !!user.avatar;
              const displayRole = user.role === 'client' ? 'Cliente' :
                                  user.role === 'seller' ? 'Lojista' :
                                  user.role === 'provider' ? 'Prestador' :
                                  user.role === 'motoboy' ? 'Motoboy' : user.role;

              return (
                <div
                  key={user.id}
                  style={{
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '20px',
                    border: '1px solid #eee',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    fontSize: '0.78rem',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                  }}
                >
                  {/* User Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #eaeaea',
                      flexShrink: 0
                    }}>
                      {hasAvatar ? (
                        <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={20} style={{ color: '#bbb' }} />
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#2d2d2d', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name}
                      </div>
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        backgroundColor: '#fff3e0',
                        color: '#f28d1a',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        marginTop: '2px',
                        display: 'inline-block'
                      }}>
                        {displayRole}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '1px solid #f9f9f9', paddingTop: '8px' }}>
                    <div><strong>Telefone:</strong> {user.phone || 'Não informado'}</div>
                    <div><strong>Endereço:</strong> {user.address || 'Não informado'}</div>
                    <div><strong>CPF/CNPJ:</strong> {user.cpf || user.cnpj || 'Não informado'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', backgroundColor: '#fafafa', padding: '6px 8px', borderRadius: '8px' }}>
                      <span><strong>OuroCoins:</strong> {user.ouroCoins || 0}</span>
                      <span><strong>Compras:</strong> {purchaseCount}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      onClick={() => setSelectedProfileUser(user)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '10px',
                        border: '1px solid #f28d1a',
                        backgroundColor: 'white',
                        color: '#f28d1a',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => setUserBanStatus(user.id, !user.banned)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: user.banned ? '#f28d1a' : '#ff5e5b15',
                        color: user.banned ? 'white' : '#ff5e5b',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {user.banned ? 'Desbanir' : 'Banir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    );
  };

  // --- SUBVIEW 3: COUPONS GENERATOR ---
  const renderCouponsMod = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      
      {/* Coupon form */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Criar Novo Cupom</h3>
        <form onSubmit={handleCouponSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.68rem', color: '#666' }}>Código do Cupom</label>
              <input type="text" value={cpCode} onChange={(e) => setCpCode(e.target.value.toUpperCase())} className="input-field" style={{ padding: '8px 12px', fontSize: '0.8rem' }} placeholder="Ex: OURO30" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.68rem', color: '#666' }}>Tipo de Desconto</label>
              <select value={cpType} onChange={(e) => setCpType(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '16px', border: '2px solid #eaeaea', fontSize: '0.8rem', backgroundColor: 'white', fontWeight: 600 }}>
                <option value="fixed">Valor Fixo (R$)</option>
                <option value="percentage">Porcentagem (%)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.68rem', color: '#666' }}>Valor do Desconto</label>
              <input type="number" value={cpValue} onChange={(e) => setCpValue(e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: '0.8rem' }} placeholder="10.00" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.68rem', color: '#666' }}>Mínimo Compra (R$)</label>
              <input type="number" value={cpMin} onChange={(e) => setCpMin(e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: '0.8rem' }} placeholder="30.00" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px', marginTop: '4px' }}>
            Criar e Ativar Cupom
          </button>
        </form>
      </div>

      {/* Coupon List */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '8px' }}>Cupons Ativos</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {coupons.map(cp => (
            <div key={cp.code} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '16px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <div>
                <strong>{cp.code}</strong>
                <div style={{ fontSize: '0.68rem', color: '#777' }}>
                  Desconto: {cp.discountType === 'fixed' ? `R$ ${cp.value.toFixed(2)}` : `${cp.value}%`} | Mínimo: R$ {cp.minPurchase.toFixed(2)}
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#2ec4b6', fontWeight: 500 }}>Ativo</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- SUBVIEW 4: GLOBAL PUSH NOTIFICATIONS ---
  const renderNotifications = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Enviar Alerta / Push Simulado</h3>
        <form onSubmit={handlePushSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Destinatários</label>
            <select
              value={pushTarget}
              onChange={(e) => setPushTarget(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '16px',
                border: '2px solid #eaeaea',
                fontSize: '0.82rem',
                backgroundColor: 'white',
                fontWeight: 600
              }}
            >
              <option value="all">Todos os Usuários</option>
              <option value="client">Apenas Clientes</option>
              <option value="seller">Apenas Lojistas</option>
              <option value="motoboy">Apenas Motoboys</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Texto da Notificação</label>
            <textarea
              placeholder="Digite o aviso que aparecerá instantaneamente nas contas..."
              value={pushText}
              onChange={(e) => setPushText(e.target.value)}
              className="input-field"
              style={{ height: '70px', resize: 'none', fontSize: '0.8rem' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
            Enviar Push virtual
          </button>
        </form>
      </div>

    </div>
  );

  // --- SUBVIEW 5: CATEGORIES MANAGEMENT ---
  const renderCategoriesAdmin = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d2d2d' }}>Gerenciar Categorias</h2>
        <p style={{ fontSize: '0.78rem', color: '#777' }}>Adicione, edite e organize as categorias do app</p>
      </div>

      {/* Add/Edit Category Form */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
          {editingCatId ? 'Editar Categoria' : 'Nova Categoria'}
        </h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!catLabel) return;
          if (editingCatId) {
            editCategory(editingCatId, { label: catLabel, key: catLabel, desc: catDesc, icon: catIcon, type: catType });
            setEditingCatId(null);
          } else {
            addCategory({ label: catLabel, key: catLabel, desc: catDesc, icon: catIcon, type: catType });
          }
          setCatLabel(''); setCatDesc(''); setCatIcon('Sparkles'); setCatType('lojas');
        }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nome da Categoria</label>
            <input type="text" placeholder="Ex: Artesanato" value={catLabel} onChange={(e) => setCatLabel(e.target.value)} className="input-field" required />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Descrição (opcional)</label>
            <input type="text" placeholder="Ex: Peças em cobre e pedra-sabão" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} className="input-field" />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Tipo</label>
            <select value={catType} onChange={(e) => setCatType(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '16px', border: '2px solid #eaeaea', fontSize: '0.82rem', backgroundColor: 'white', fontWeight: 600 }}>
              <option value="lojas">Lojas</option>
              <option value="servicos">Serviços</option>
              <option value="eventos">Eventos</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Ícone de Exibição</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.keys(iconComponents).map(iconName => (
                <button key={iconName} type="button" onClick={() => setCatIcon(iconName)} style={{ width: '40px', height: '40px', borderRadius: '12px', border: catIcon === iconName ? '2px solid #f28d1a' : '1px solid #eee', backgroundColor: catIcon === iconName ? '#fff9ee' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: catIcon === iconName ? '#f28d1a' : '#888' }} title={iconName}>
                  {renderCategoryIcon(iconName, 20)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '44px' }}>
              {editingCatId ? 'Salvar' : 'Adicionar'}
            </button>
            {editingCatId && (
              <button type="button" onClick={() => { setEditingCatId(null); setCatLabel(''); setCatDesc(''); setCatIcon('Sparkles'); setCatType('lojas'); }} style={{ padding: '10px 16px', borderRadius: '16px', border: '1px solid #eee', backgroundColor: 'white', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#888' }}>Cancelar</button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Categories List */}
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px' }}>Categorias Cadastradas ({categories.length})</h3>
        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '0.82rem', backgroundColor: '#f9f9f9', borderRadius: '16px' }}>Nenhuma categoria cadastrada ainda.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['lojas', 'servicos', 'eventos'].map(type => {
              const typeCats = categories.filter(c => c.type === type);
              if (typeCats.length === 0) return null;
              return (
                <div key={type}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f28d1a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', marginTop: '8px' }}>
                    {type === 'lojas' ? 'Lojas' : type === 'servicos' ? 'Serviços' : 'Eventos'}
                  </h4>
                  {typeCats.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', padding: '10px 14px', borderRadius: '16px', border: '1px solid #eee', marginBottom: '6px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fff9ee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f28d1a', flexShrink: 0 }}>
                        {renderCategoryIcon(cat.icon, 18)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d' }}>{cat.label}</div>
                        {cat.desc && <div style={{ fontSize: '0.68rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.desc}</div>}
                      </div>
                      <button type="button" onClick={() => { setEditingCatId(cat.id); setCatLabel(cat.label); setCatDesc(cat.desc || ''); setCatIcon(cat.icon || 'Sparkles'); setCatType(cat.type || 'lojas'); }} style={{ background: 'none', border: 'none', color: '#f28d1a', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Editar</button>
                      <button type="button" onClick={() => { if(confirm('Remover esta categoria?')) deleteCategory(cat.id); }} style={{ background: 'none', border: 'none', color: '#ff5e5b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Excluir</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', position: 'relative' }} className="animate-fade-in">
      {/* Menu Topo para Desktop */}
      <div className="desktop-admin-nav">
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo-full.png" alt="Connecta+" style={{ height: '30px', objectFit: 'contain' }} />
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f28d1a', border: '1px solid #f28d1a', padding: '2px 6px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Painel Admin
          </span>
        </div>
        
        {/* Center: Tabs */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { id: 'metrics', label: 'Relatórios', icon: <Home size={16} /> },
            { id: 'users_mod', label: 'Moderar', icon: <UserCheck size={16} /> },
            { id: 'support_chat', label: 'Suporte', icon: <MessageSquare size={16} /> },
            { id: 'coupons_mod', label: 'Cupons', icon: <Ticket size={16} /> },
            { id: 'categories_mod', label: 'Categorias', icon: <Layers size={16} /> },
            { id: 'notifications', label: 'Alertas', icon: <Bell size={16} /> }
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`desktop-admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right: Sair */}
        <div>
          <button 
            onClick={logout} 
            className="desktop-admin-logout-btn"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="admin-body custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {activeTab === 'metrics' && renderMetrics()}
        {activeTab === 'users_mod' && renderUsersMod()}
        {activeTab === 'support_chat' && (
          <div style={{ height: 'calc(100vh - 140px)', minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
            <Chat onCloseChat={() => setActiveTab('metrics')} />
          </div>
        )}
        {activeTab === 'coupons_mod' && renderCouponsMod()}
        {activeTab === 'categories_mod' && renderCategoriesAdmin()}
        {activeTab === 'notifications' && renderNotifications()}
      </div>

      {/* Menu Fixo Embaixo com Ícones (Somente Mobile) */}
      <div className="bottom-nav">
        {[
          { id: 'metrics', label: 'Relatórios', icon: <Home size={20} /> },
          { id: 'users_mod', label: 'Moderar', icon: <UserCheck size={20} /> },
          { id: 'support_chat', label: 'Suporte', icon: <MessageSquare size={20} /> },
          { id: 'coupons_mod', label: 'Cupons', icon: <Ticket size={20} /> },
          { id: 'categories_mod', label: 'Categorias', icon: <Layers size={20} /> },
          { id: 'notifications', label: 'Alertas', icon: <Bell size={20} /> }
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

      {/* Modal Ver Perfil */}
      {selectedProfileUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '440px',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            animation: 'scaleUp 0.2s ease-out'
          }}>
            {/* Banner cover */}
            <div style={{
              height: '110px',
              backgroundColor: '#f28d1a',
              background: selectedProfileUser.banner ? `url(${selectedProfileUser.banner}) center/cover no-repeat` : 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 40%, #e67e22 100%)',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedProfileUser(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Profile Content */}
            <div style={{ padding: '20px', position: 'relative', marginTop: '-36px' }}>
              {/* Avatar */}
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '16px',
                border: '3px solid white',
                overflow: 'hidden',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {selectedProfileUser.avatar ? (
                  <img src={selectedProfileUser.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={32} style={{ color: '#bbb' }} />
                )}
              </div>

              {/* Bio & Basic info */}
              <div style={{ marginTop: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2d2d2d', margin: 0 }}>
                  {selectedProfileUser.name}
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 600, marginTop: '2px', textTransform: 'uppercase' }}>
                  {selectedProfileUser.role === 'client' ? 'Cliente' :
                   selectedProfileUser.role === 'seller' ? 'Lojista' :
                   selectedProfileUser.role === 'provider' ? 'Prestador' :
                   selectedProfileUser.role === 'motoboy' ? 'Motoboy' : selectedProfileUser.role}
                </div>
                {selectedProfileUser.bio && (
                  <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '8px', lineHeight: 1.4, backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '12px' }}>
                    {selectedProfileUser.bio}
                  </p>
                )}
              </div>

              {/* Grid of full user details */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #eee', paddingTop: '16px', fontSize: '0.75rem' }}>
                <div><strong>E-mail:</strong> {selectedProfileUser.email}</div>
                <div><strong>Telefone:</strong> {selectedProfileUser.phone || 'Não informado'}</div>
                <div><strong>Endereço:</strong> {selectedProfileUser.address || 'Não informado'}</div>
                <div><strong>CPF/CNPJ:</strong> {selectedProfileUser.cpf || selectedProfileUser.cnpj || 'Não informado'}</div>
                <div><strong>Status de Cadastro:</strong> <span style={{ fontWeight: 600, color: selectedProfileUser.registrationStatus === 'approved' ? '#2ec4b6' : '#f28d1a' }}>{selectedProfileUser.registrationStatus}</span></div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <div style={{ flex: 1, backgroundColor: '#fff3e0', padding: '8px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.62rem', color: '#777' }}>OuroCoins</div>
                    <strong style={{ fontSize: '1.1rem', color: '#f28d1a' }}>{selectedProfileUser.ouroCoins || 0}</strong>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#fff3e0', padding: '8px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.62rem', color: '#777' }}>Compras Feitas</div>
                    <strong style={{ fontSize: '1.1rem', color: '#f28d1a' }}>{orders.filter(o => o.userId === selectedProfileUser.id || o.customerId === selectedProfileUser.id).length}</strong>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedProfileUser(null)}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '10px 0',
                  borderRadius: '14px',
                  backgroundColor: '#f28d1a',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
