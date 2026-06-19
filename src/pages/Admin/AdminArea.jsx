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
const compressImage = (file, maxWidth, maxHeight, callback) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const format = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
      const compressedBase64 = canvas.toDataURL(format, 0.95);
      callback(compressedBase64);
    };
  };
};

export default function AdminArea() {
  const { 
    users, orders, servicesHired, coupons, updateRegistrationStatus, 
    setUserBanStatus, createCoupon, triggerGlobalNotification, setUsers,
    categories, addCategory, editCategory, deleteCategory,
    visualLayoutSettings, updateVisualLayoutSettings, logout,
    banners, addBanner, deleteBanner,
    homeSections, addHomeSection, editHomeSection, deleteHomeSection, reorderHomeSections,
    products, services, events, deleteUser,
    setSectionOrder, deletedUsers
  } = useFirebaseMock();

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('connecta_admin_active_tab') || 'metrics';
  }); // metrics, users_mod, coupons_mod, home_editor, notifications

  useEffect(() => {
    localStorage.setItem('connecta_admin_active_tab', activeTab);
  }, [activeTab]);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Home Editor subtabs and creation states
  const [homeSubTab, setHomeSubTab] = useState('layout'); // layout, banners, categories, sections
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Banner creation states
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerDesc, setNewBannerDesc] = useState('');
  const [newBannerImg, setNewBannerImg] = useState('');
  const [newBannerImgMobile, setNewBannerImgMobile] = useState('');
  const [newBannerLink, setNewBannerLink] = useState('lojas');

  // Section creation/editing states
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionType, setNewSectionType] = useState('products'); // 'products', 'stores', 'services', 'events'
  const [newSectionItemIds, setNewSectionItemIds] = useState([]);
  const [editingSectionId, setEditingSectionId] = useState(null);

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

  // --- DAILY, MONTHLY & ALL-TIME REVENUE ---
  const parseOrderDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const cleanDateStr = dateStr.split(' às ')[0];
    const parts = cleanDateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const parseServiceDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    const partsSlash = dateStr.split('/');
    if (partsSlash.length === 3) {
      return new Date(parseInt(partsSlash[2]), parseInt(partsSlash[1]) - 1, parseInt(partsSlash[0]));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let grossAlways = totalGMV;
  let netAlways = totalCommissions;
  let grossMonthly = 0;
  let netMonthly = 0;
  let grossDaily = 0;
  let netDaily = 0;

  orders.forEach(o => {
    const d = parseOrderDate(o.date);
    const orderTotal = o.total || 0;
    const orderComm = o.commissionFee || 0;

    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      grossMonthly += orderTotal;
      netMonthly += orderComm;
    }

    if (d.getDate() === now.getDate() && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      grossDaily += orderTotal;
      netDaily += orderComm;
    }
  });

  servicesHired.forEach(sh => {
    if (sh.status === 'completed' || sh.status === 'accepted') {
      const d = parseServiceDate(sh.date);
      const shTotal = sh.total || 0;
      const shComm = sh.commissionFee || 0;

      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        grossMonthly += shTotal;
        netMonthly += shComm;
      }

      if (d.getDate() === now.getDate() && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        grossDaily += shTotal;
        netDaily += shComm;
      }
    }
  });

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

      {/* Detailed Revenue Dashboard (Gross & Net / Daily, Monthly, Always) */}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: '12px' }}>
        {[
          { label: 'De Sempre (Geral)', gross: grossAlways, net: netAlways },
          { label: 'Mensal', gross: grossMonthly, net: netMonthly },
          { label: 'Diário', gross: grossDaily, net: netDaily }
        ].map(card => (
          <div key={card.label} style={{ backgroundColor: 'white', border: '1px solid #eee', borderRadius: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <span style={{ fontSize: '0.68rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f28d1a', marginTop: '4px' }}>
              Bruto: R$ {card.gross.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2d2d2d' }}>
              Líquido: R$ {card.net.toFixed(2)}
            </div>
          </div>
        ))}
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
    </div>
  );

  // --- SUBVIEW 2: USERS MODERATION & REGISTRATIONS AUDITING ---
  const renderUsersMod = () => {
    const approvedUsers = users.filter(u => u.registrationStatus === 'approved' && u.role !== 'admin');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
        
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
                    <button
                      onClick={() => {
                        if (confirm(`Deseja mesmo excluir permanentemente o usuário ${user.name} do Firestore?`)) {
                          deleteUser(user.id);
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#ff5e5b15',
                        color: '#ff5e5b',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deleted Users History */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '12px' }}>
            Contas Excluídas (Histórico) ({deletedUsers?.length || 0})
          </h3>
          {!deletedUsers || deletedUsers.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: '#999', fontStyle: 'italic' }}>Nenhum histórico de conta excluída.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {deletedUsers.map(user => {
                const displayRole = user.role === 'client' ? 'Cliente' :
                                    user.role === 'seller' ? 'Lojista' :
                                    user.role === 'provider' ? 'Prestador' :
                                    user.role === 'motoboy' ? 'Motoboy' : user.role;
                const deletedDate = user.deletedAt ? new Date(user.deletedAt).toLocaleDateString('pt-BR') + ' às ' + new Date(user.deletedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Data indisponível';

                return (
                  <div
                    key={user.id}
                    style={{
                      backgroundColor: '#fcfcfc',
                      padding: '16px',
                      borderRadius: '20px',
                      border: '1px dashed #ccc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      fontSize: '0.78rem',
                      color: '#555'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#666', fontSize: '0.85rem' }}>{user.name} (Excluído)</div>
                        <span style={{
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          backgroundColor: '#eee',
                          color: '#666',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          marginTop: '4px',
                          display: 'inline-block'
                        }}>
                          {displayRole}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#999' }}>{deletedDate}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid #eee', paddingTop: '6px' }}>
                      <div><strong>E-mail:</strong> {user.email}</div>
                      <div><strong>Telefone:</strong> {user.phone || 'Não informado'}</div>
                      <div><strong>Endereço:</strong> {user.address || 'Não informado'}</div>
                      <div><strong>OuroCoins Acumulados:</strong> {user.ouroCoins || 0}</div>
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

  // --- SUBVIEW 5: HOME EDITOR (BANNERS, CATEGORIES & SECTIONS) ---
  const renderHomeEditor = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d2d2d' }}>Editor da Página Inicial</h2>
          <p style={{ fontSize: '0.78rem', color: '#777' }}>Personalize os banners, categorias e seções dinâmicas que os clientes visualizam</p>
        </div>

        {/* Sub-tabs Header */}
        <div style={{
          display: 'flex',
          backgroundColor: '#fafafa',
          padding: '4px',
          borderRadius: '16px',
          border: '1px solid #eee',
          gap: '4px'
        }}>
          {[
            { id: 'layout', label: 'Layout' },
            { id: 'banners', label: 'Banners' },
            { id: 'categories', label: 'Categorias' },
            { id: 'sections', label: 'Seções Dinâmicas' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setHomeSubTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                backgroundColor: homeSubTab === tab.id ? 'white' : 'transparent',
                color: homeSubTab === tab.id ? '#f28d1a' : '#777',
                fontWeight: 600,
                fontSize: '0.8rem',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: homeSubTab === tab.id ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Banners Sub-tab */}
        {homeSubTab === 'banners' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            {/* Form */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '12px' }}>Adicionar Novo Banner</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newBannerImg || !newBannerImgMobile) {
                  alert('Por favor, adicione ambas as fotos (Desktop e Mobile) para o banner!');
                  return;
                }
                try {
                  await addBanner({
                    title: newBannerTitle,
                    desc: newBannerDesc,
                    img: newBannerImg,
                    imgMobile: newBannerImgMobile,
                    link: newBannerLink
                  });
                  setNewBannerTitle('');
                  setNewBannerDesc('');
                  setNewBannerImg('');
                  setNewBannerImgMobile('');
                  setNewBannerLink('lojas');
                  alert('Banner adicionado com sucesso!');
                } catch (err) {
                  console.error("Error saving banner:", err);
                  alert('Erro ao salvar o banner no Firestore: ' + err.message);
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }} className="form-group">
                    <label>Título (opcional)</label>
                    <input type="text" placeholder="Ex: Cupom de Desconto" value={newBannerTitle} onChange={(e) => setNewBannerTitle(e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: '0.78rem' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }} className="form-group">
                    <label>Descrição (opcional)</label>
                    <input type="text" placeholder="Ex: Ganhe 20% em artesanato" value={newBannerDesc} onChange={(e) => setNewBannerDesc(e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: '0.78rem' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Foto do Banner Desktop (Proporção 3:1)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="URL da imagem ou faça upload..." 
                      value={newBannerImg} 
                      onChange={(e) => setNewBannerImg(e.target.value)} 
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
                            compressImage(file, 2048, 800, (compressedBase64) => {
                              setNewBannerImg(compressedBase64);
                            });
                          }
                        }} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                  {newBannerImg && (
                    <div style={{ marginTop: '8px', width: '150px', height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                      <img src={newBannerImg} alt="Preview Desktop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Foto do Banner Mobile (Proporção ~1.64:1)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="URL da imagem ou faça upload..." 
                      value={newBannerImgMobile} 
                      onChange={(e) => setNewBannerImgMobile(e.target.value)} 
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
                            compressImage(file, 1200, 800, (compressedBase64) => {
                              setNewBannerImgMobile(compressedBase64);
                            });
                          }
                        }} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                  {newBannerImgMobile && (
                    <div style={{ marginTop: '8px', width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                      <img src={newBannerImgMobile} alt="Preview Mobile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Redirecionar Para (Link)</label>
                  <select 
                    value={newBannerLink} 
                    onChange={(e) => setNewBannerLink(e.target.value)} 
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

                <button type="submit" className="btn btn-primary" style={{ height: '38px', fontSize: '0.82rem', fontWeight: 600 }}>
                  Adicionar Banner
                </button>
              </form>
            </div>

            {/* List */}
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px' }}>Banners Cadastrados ({banners.length})</h3>
              {banners.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '0.82rem', backgroundColor: '#f9f9f9', borderRadius: '16px' }}>Nenhum banner cadastrado ainda.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {banners.map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '12px', borderRadius: '18px', border: '1px solid #eee' }}>
                      <div style={{ width: '80px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f0f0f0' }}>
                        <img src={b.img} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d2d2d' }}>{b.title || 'Sem título'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.desc || 'Sem descrição'}</div>
                        <div style={{ fontSize: '0.62rem', color: '#f28d1a', marginTop: '2px', fontWeight: 600 }}>Link: {b.link}</div>
                      </div>
                      <button type="button" onClick={() => { if(confirm('Remover este banner?')) deleteBanner(b.id); }} style={{ background: 'none', border: 'none', color: '#ff5e5b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Excluir</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Sub-tab */}
        {homeSubTab === 'categories' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
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
                    <option value="entregadores">Entregadores</option>
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
                  {['lojas', 'servicos', 'eventos', 'entregadores'].map(type => {
                    const typeCats = categories.filter(c => c.type === type);
                    if (typeCats.length === 0) return null;
                    return (
                      <div key={type}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f28d1a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', marginTop: '8px' }}>
                          {type === 'lojas' ? 'Lojas' : type === 'servicos' ? 'Serviços' : type === 'eventos' ? 'Eventos' : 'Entregadores'}
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
        )}

        {/* Sections Sub-tab */}
        {homeSubTab === 'sections' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            {/* Form */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '12px' }}>
                {editingSectionId ? 'Editar Seção Dinâmica' : 'Adicionar Nova Seção Dinâmica'}
              </h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newSectionName) {
                  alert('Por favor, informe o nome da seção!');
                  return;
                }
                try {
                  if (editingSectionId) {
                    await editHomeSection(editingSectionId, {
                      name: newSectionName,
                      type: newSectionType,
                      itemIds: newSectionItemIds
                    });
                    setEditingSectionId(null);
                    alert('Seção atualizada com sucesso!');
                  } else {
                    await addHomeSection({
                      name: newSectionName,
                      type: newSectionType,
                      itemIds: newSectionItemIds
                    });
                    alert('Seção criada com sucesso!');
                  }
                  setNewSectionName('');
                  setNewSectionItemIds([]);
                } catch (err) {
                  console.error(err);
                  alert('Erro ao salvar seção: ' + err.message);
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }} className="form-group">
                    <label>Título da Seção</label>
                    <input type="text" placeholder="Ex: Produtos em Destaque" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} className="input-field" required />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }} className="form-group">
                    <label>Tipo de Conteúdo</label>
                    <select 
                      value={newSectionType} 
                      onChange={(e) => {
                        setNewSectionType(e.target.value);
                        setNewSectionItemIds([]); // Reset selection on type change
                      }} 
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
                      <option value="products">Produtos</option>
                      <option value="stores">Lojas</option>
                      <option value="services">Serviços</option>
                      <option value="events">Eventos</option>
                      <option value="banners">Banners</option>
                    </select>
                  </div>
                </div>

                {/* Items selection checkboxes */}
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#444', marginBottom: '6px', display: 'block' }}>
                    Selecione os Itens ({newSectionItemIds.length} selecionados)
                  </label>
                  <div style={{
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '2px solid #eaeaea',
                    borderRadius: '16px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    backgroundColor: '#fafafa'
                  }} className="custom-scroll">
                    {(() => {
                      let listToRender = [];
                      if (newSectionType === 'products') {
                        listToRender = products.filter(p => p.active).map(p => ({ id: p.id, name: `${p.name} - R$ ${p.price.toFixed(2)} (${p.storeName})` }));
                      } else if (newSectionType === 'stores') {
                        listToRender = users.filter(u => u.role === 'seller' && u.registrationStatus === 'approved').map(u => ({ id: u.id, name: u.name }));
                      } else if (newSectionType === 'services') {
                        listToRender = services.map(s => ({ id: s.id, name: `${s.name} - R$ ${s.pricePerHour.toFixed(2)}/h (${s.providerName})` }));
                      } else if (newSectionType === 'events') {
                        listToRender = events.filter(e => e.published).map(e => ({ id: e.id, name: `${e.name} (${e.date})` }));
                      } else if (newSectionType === 'banners') {
                        listToRender = banners.map(b => ({ id: b.id, name: b.title ? `${b.title} - ${b.desc || 'Sem desc'}` : `Banner (${b.link})` }));
                      }

                      if (listToRender.length === 0) {
                        return <div style={{ fontSize: '0.72rem', color: '#999', textAlign: 'center', padding: '10px' }}>Nenhum item cadastrado deste tipo no banco de dados.</div>;
                      }

                      return listToRender.map(item => {
                        const isChecked = newSectionItemIds.includes(item.id);
                        return (
                          <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: '#333' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setNewSectionItemIds(prev => prev.filter(id => id !== item.id));
                                } else {
                                  setNewSectionItemIds(prev => [...prev, item.id]);
                                }
                              }}
                              style={{ width: '15px', height: '15px', accentColor: '#f28d1a', cursor: 'pointer' }}
                            />
                            <span>{item.name}</span>
                          </label>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '38px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {editingSectionId ? 'Salvar Seção' : 'Criar Seção Dinâmica'}
                  </button>
                  {editingSectionId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSectionId(null);
                        setNewSectionName('');
                        setNewSectionItemIds([]);
                      }}
                      style={{
                        padding: '8px 16px',
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        backgroundColor: '#fff',
                        color: '#666',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px' }}>Seções Configuradas ({homeSections.length})</h3>
              {homeSections.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999', fontSize: '0.82rem', backgroundColor: '#f9f9f9', borderRadius: '16px' }}>Nenhuma seção cadastrada ainda.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {homeSections.map((sec, idx) => (
                    <div key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'white', padding: '12px 16px', borderRadius: '18px', border: '1px solid #eee' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d2d2d' }}>{sec.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>
                          Tipo: <strong style={{ color: '#f28d1a' }}>{sec.type === 'products' ? 'Produtos' : sec.type === 'stores' ? 'Lojas' : sec.type === 'services' ? 'Serviços' : sec.type === 'events' ? 'Eventos' : 'Banners'}</strong> | Itens vinculados: {sec.itemIds?.length || 0}
                        </div>
                      </div>
                      
                      {/* Ordering Buttons */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const newOrder = [...homeSections];
                            const temp = newOrder[idx];
                            newOrder[idx] = newOrder[idx - 1];
                            newOrder[idx - 1] = temp;
                            reorderHomeSections(newOrder.map(s => s.id));
                          }}
                          style={{
                            padding: '4px 8px', border: '1px solid #eaeaea', borderRadius: '6px',
                            backgroundColor: 'white', color: idx === 0 ? '#ccc' : '#f28d1a',
                            fontWeight: 700, fontSize: '0.7rem', cursor: idx === 0 ? 'default' : 'pointer'
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === homeSections.length - 1}
                          onClick={() => {
                            const newOrder = [...homeSections];
                            const temp = newOrder[idx];
                            newOrder[idx] = newOrder[idx + 1];
                            newOrder[idx + 1] = temp;
                            reorderHomeSections(newOrder.map(s => s.id));
                          }}
                          style={{
                            padding: '4px 8px', border: '1px solid #eaeaea', borderRadius: '6px',
                            backgroundColor: 'white', color: idx === homeSections.length - 1 ? '#ccc' : '#f28d1a',
                            fontWeight: 700, fontSize: '0.7rem', cursor: idx === homeSections.length - 1 ? 'default' : 'pointer'
                          }}
                        >
                          ▼
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingSectionId(sec.id);
                          setNewSectionName(sec.name);
                          setNewSectionType(sec.type || 'products');
                          setNewSectionItemIds(sec.itemIds || []);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f28d1a',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          marginRight: '6px'
                        }}
                      >
                        Editar
                      </button>
                      <button type="button" onClick={() => { if(confirm('Remover esta seção dinâmica?')) deleteHomeSection(sec.id); }} style={{ background: 'none', border: 'none', color: '#ff5e5b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Excluir</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layout Sub-tab */}
        {homeSubTab === 'layout' && (() => {
          const blockLabels = {
            banner: { label: 'Banners', icon: '🖼️' },
            categories: { label: 'Categorias', icon: '📂' },
            flashDeals: { label: 'Ofertas Relâmpago', icon: '⚡' },
            nearbyStores: { label: 'Lojas Próximas', icon: '📍' },
            products: { label: 'Produtos para Você', icon: '🛍️' },
            buyers: { label: 'Top Compradores', icon: '🏆' },
            events: { label: 'Eventos', icon: '🎉' },
            services: { label: 'Serviços', icon: '🔧' }
          };
          const currentOrder = visualLayoutSettings?.sectionOrder || [];
          const fixedBlockIds = Object.keys(blockLabels);
          const dynamicBlocks = (homeSections || []).map(sec => ({
            id: `dynamic_${sec.id}`,
            label: sec.name,
            icon: '📦'
          }));
          const allAvailable = [
            ...fixedBlockIds.map(id => ({ id, label: blockLabels[id].label, icon: blockLabels[id].icon })),
            ...dynamicBlocks
          ];
          const getBlockInfo = (blockId) => {
            const baseId = blockId.includes('__') ? blockId.split('__')[0] : blockId;
            if (blockLabels[baseId]) return blockLabels[baseId];
            const dynSec = (homeSections || []).find(s => `dynamic_${s.id}` === baseId);
            if (dynSec) return { label: dynSec.name, icon: '📦' };
            return { label: blockId, icon: '❓' };
          };
          const handleReorder = (idx, direction) => {
            const newOrder = [...currentOrder];
            const swapIdx = idx + direction;
            if (swapIdx < 0 || swapIdx >= newOrder.length) return;
            const temp = newOrder[idx];
            newOrder[idx] = newOrder[swapIdx];
            newOrder[swapIdx] = temp;
            setSectionOrder(newOrder);
          };
          const handleRemove = (blockId) => {
            setSectionOrder(currentOrder.filter(id => id !== blockId));
          };
          const handleAdd = (blockId) => {
            const isDuplicate = currentOrder.some(id => id === blockId || id.startsWith(blockId + '__'));
            const uniqueId = isDuplicate ? `${blockId}__${Date.now()}` : blockId;
            setSectionOrder([...currentOrder, uniqueId]);
            setShowAddMenu(false);
          };
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '24px', border: '1px solid #eee' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '4px' }}>Layout da Página Inicial</h3>
                <p style={{ fontSize: '0.75rem', color: '#999', marginBottom: '16px' }}>Organize a ordem dos blocos exibidos na tela inicial do app.</p>

                {currentOrder.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: '#aaa', textAlign: 'center', padding: '24px 0' }}>Nenhum bloco adicionado ao layout.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {currentOrder.map((blockId, idx) => {
                      const info = getBlockInfo(blockId);
                      const baseBlockId = blockId.includes('__') ? blockId.split('__')[0] : blockId;
                      const isTitleEditable = ['products', 'services', 'events'].includes(baseBlockId);
                      const isBannerSelectable = baseBlockId === 'banner' || baseBlockId.startsWith('dynamic_');
                      
                      // Check if it's a dynamic section of type banners
                      const dynSec = baseBlockId.startsWith('dynamic_') 
                        ? (homeSections || []).find(s => `dynamic_${s.id}` === baseBlockId)
                        : null;
                      const isDynamicBannerSec = dynSec && dynSec.type === 'banners';

                      // Title settings getter/setter
                      const currentTitle = visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || info.label;

                      return (
                        <div key={blockId} style={{
                          display: 'flex', flexDirection: 'column', gap: '8px',
                          backgroundColor: '#fafafa', padding: '16px', borderRadius: '24px',
                          border: '1px solid #eee', transition: 'all 0.2s ease'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {/* Ícone e nome do bloco */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '1.2rem' }}>{info.icon}</span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2d2d2d' }}>{info.label}</span>
                              <span style={{ fontSize: '0.68rem', color: '#aaa', fontWeight: 500 }}>#{idx + 1}</span>
                            </div>
                            {/* Botões de ação */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleReorder(idx, -1)}
                                style={{
                                  padding: '4px 8px', border: '1px solid #eaeaea', borderRadius: '6px',
                                  backgroundColor: 'white', color: idx === 0 ? '#ccc' : '#f28d1a',
                                  fontWeight: 700, fontSize: '0.7rem', cursor: idx === 0 ? 'default' : 'pointer'
                                }}
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={idx === currentOrder.length - 1}
                                onClick={() => handleReorder(idx, 1)}
                                style={{
                                  padding: '4px 8px', border: '1px solid #eaeaea', borderRadius: '6px',
                                  backgroundColor: 'white', color: idx === currentOrder.length - 1 ? '#ccc' : '#f28d1a',
                                  fontWeight: 700, fontSize: '0.7rem', cursor: idx === currentOrder.length - 1 ? 'default' : 'pointer'
                                }}
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemove(blockId)}
                                style={{
                                  padding: '4px 8px', border: '1px solid #eaeaea', borderRadius: '6px',
                                  backgroundColor: 'white', color: '#ff5e5b',
                                  fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', marginLeft: '4px'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          {/* Personalização do título (para seções configuráveis) */}
                          {isTitleEditable && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Nome Personalizado da Seção</label>
                              <input 
                                type="text"
                                value={currentTitle}
                                onChange={(e) => {
                                  const updatedSettings = {
                                    ...visualLayoutSettings,
                                    customTexts: {
                                      ...(visualLayoutSettings?.customTexts || {}),
                                      [`section_title_${blockId}`]: e.target.value
                                    }
                                  };
                                  updateVisualLayoutSettings(updatedSettings);
                                }}
                                placeholder={`Ex: ${info.label}`}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #ddd',
                                  fontSize: '0.75rem',
                                  width: '100%',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>
                          )}

                          {/* Seletor de Banners (para bloco Banner fixo ou Seção Dinâmica de Banners) */}
                          {((blockId === 'banner') || isDynamicBannerSec) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>
                                Selecionar Banner Ativo nesta Seção
                              </label>
                              <div style={{
                                display: 'flex',
                                gap: '10px',
                                overflowX: 'auto',
                                padding: '6px 0',
                                width: '100%',
                              }} className="hide-scrollbar">
                                {/* Option: Todos */}
                                {(() => {
                                  const isActive = (visualLayoutSettings?.[`active_banner_id_${blockId}`] || 'all') === 'all';
                                  return (
                                    <div 
                                      onClick={() => {
                                        const updatedSettings = {
                                          ...visualLayoutSettings,
                                          [`active_banner_id_${blockId}`]: 'all'
                                        };
                                        updateVisualLayoutSettings(updatedSettings);
                                      }}
                                      style={{
                                        flexShrink: 0,
                                        width: '120px',
                                        height: '70px',
                                        borderRadius: '12px',
                                        border: isActive ? '3.5px solid #f28d1a' : '1px solid #ddd',
                                        background: isActive ? 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' : '#fafafa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        padding: '6px',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s',
                                        transform: isActive ? 'scale(1.02)' : 'none'
                                      }}
                                    >
                                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isActive ? '#f28d1a' : '#555' }}>
                                        Todos (Carrossel)
                                      </span>
                                    </div>
                                  );
                                })()}

                                {/* List of banners */}
                                {banners.map(b => {
                                  const isActive = visualLayoutSettings?.[`active_banner_id_${blockId}`] === b.id;
                                  return (
                                    <div 
                                      key={b.id}
                                      onClick={() => {
                                        const updatedSettings = {
                                          ...visualLayoutSettings,
                                          [`active_banner_id_${blockId}`]: b.id
                                        };
                                        updateVisualLayoutSettings(updatedSettings);
                                      }}
                                      style={{
                                        flexShrink: 0,
                                        width: '120px',
                                        height: '70px',
                                        borderRadius: '12px',
                                        border: isActive ? '3.5px solid #f28d1a' : '1px solid #ddd',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s',
                                        transform: isActive ? 'scale(1.02)' : 'none'
                                      }}
                                    >
                                      <img 
                                        src={b.img || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200'} 
                                        alt="banner" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />
                                      <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'rgba(0,0,0,0.65)',
                                        color: 'white',
                                        fontSize: '0.55rem',
                                        padding: '2px 4px',
                                        textAlign: 'center',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {b.title || 'Sem título'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Botão Adicionar Bloco */}
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    style={{
                      width: '100%', padding: '12px', border: '2px dashed #f28d1a',
                      borderRadius: '16px', backgroundColor: showAddMenu ? '#fff8f0' : 'transparent',
                      color: '#f28d1a', fontWeight: 600, fontSize: '0.82rem',
                      cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                  >
                    {showAddMenu ? '✕ Fechar' : '＋ Adicionar Bloco'}
                  </button>

                  {showAddMenu && (
                    <div style={{
                      marginTop: '8px', backgroundColor: 'white', border: '1px solid #eee',
                      borderRadius: '16px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }}>
                      {allAvailable.length === 0 ? (
                        <p style={{ fontSize: '0.78rem', color: '#aaa', textAlign: 'center', padding: '12px' }}>Nenhum bloco disponível.</p>
                      ) : (
                        allAvailable.map(block => (
                          <button
                            key={block.id}
                            type="button"
                            onClick={() => handleAdd(block.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '10px 14px', border: 'none', borderRadius: '12px',
                              backgroundColor: 'transparent', cursor: 'pointer',
                              fontSize: '0.82rem', color: '#2d2d2d', fontWeight: 500,
                              transition: 'background-color 0.15s ease',
                              textAlign: 'left'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fff8f0'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <span style={{ fontSize: '1.1rem' }}>{block.icon}</span>
                            <span>{block.label}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', position: 'relative' }} className="animate-fade-in">
      {/* Menu Topo para Desktop */}
      <div className="desktop-admin-nav">
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo-full.png" alt="Connecta+" className="header-logo-img" style={{ objectFit: 'contain' }} />
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
            { id: 'home_editor', label: 'Home', icon: <Layers size={16} /> },
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
        {activeTab === 'home_editor' && renderHomeEditor()}
        {activeTab === 'notifications' && renderNotifications()}
      </div>

      {/* Menu Fixo Embaixo com Ícones (Somente Mobile) */}
      <div className="bottom-nav">
        {[
          { id: 'metrics', label: 'Relatórios', icon: <Home size={20} /> },
          { id: 'users_mod', label: 'Moderar', icon: <UserCheck size={20} /> },
          { id: 'support_chat', label: 'Suporte', icon: <MessageSquare size={20} /> },
          { id: 'coupons_mod', label: 'Cupons', icon: <Ticket size={20} /> },
          { id: 'home_editor', label: 'Home', icon: <Layers size={20} /> },
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
            maxHeight: '90vh',
            overflow: 'hidden',
            overflowY: 'auto',
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
                  <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '8px', lineHeight: 1.4, backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '12px', whiteSpace: 'pre-wrap' }}>
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

              {/* User's Products / Services / Events */}
              {(selectedProfileUser.role === 'seller' || products.some(p => p.storeId === selectedProfileUser.id || p.sellerId === selectedProfileUser.id)) && (() => {
                const userProducts = products.filter(p => p.storeId === selectedProfileUser.id || p.sellerId === selectedProfileUser.id);
                return (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d2d2d', marginBottom: '10px' }}>Produtos ({userProducts.length})</h4>
                    {userProducts.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', padding: '12px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }}>Nenhum produto cadastrado</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }} className="custom-scroll">
                        {userProducts.map(p => (
                          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fafafa', padding: '8px 10px', borderRadius: '12px', border: '1px solid #eee' }}>
                            <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#f28d1a', fontWeight: 600 }}>R$ {p.price?.toFixed(2)}</span>
                                <span style={{ fontSize: '0.6rem', color: p.active !== false ? '#2ec4b6' : '#ff5e5b', fontWeight: 600, backgroundColor: p.active !== false ? '#e6f7f4' : '#fef3f3', padding: '1px 6px', borderRadius: '4px' }}>{p.active !== false ? 'Ativo' : 'Inativo'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {(selectedProfileUser.role === 'provider' || services.some(s => s.providerId === selectedProfileUser.id)) && (() => {
                const userServices = services.filter(s => s.providerId === selectedProfileUser.id);
                return (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d2d2d', marginBottom: '10px' }}>Serviços ({userServices.length})</h4>
                    {userServices.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', padding: '12px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }}>Nenhum serviço cadastrado</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }} className="custom-scroll">
                        {userServices.map(s => (
                          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fafafa', padding: '8px 10px', borderRadius: '12px', border: '1px solid #eee' }}>
                            <img src={s.image} alt={s.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#f28d1a', fontWeight: 600 }}>
                                  {s.priceType === 'total' 
                                    ? `R$ ${(s.totalPrice ?? s.price ?? 0).toFixed(2)}` 
                                    : `R$ ${(s.pricePerHour ?? s.price ?? 0).toFixed(2)}/h`}
                                </span>
                                <span style={{ fontSize: '0.6rem', color: '#2ec4b6', fontWeight: 600, backgroundColor: '#e6f7f4', padding: '1px 6px', borderRadius: '4px' }}>Ativo</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {(selectedProfileUser.role === 'organizer' || events.some(e => e.organizerId === selectedProfileUser.id)) && (() => {
                const userEvents = events.filter(e => e.organizerId === selectedProfileUser.id);
                return (
                  <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2d2d2d', marginBottom: '10px' }}>Eventos ({userEvents.length})</h4>
                    {userEvents.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', padding: '12px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #eee' }}>Nenhum evento cadastrado</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }} className="custom-scroll">
                        {userEvents.map(ev => {
                          const activeBatch = ev.batches && ev.batches.length > 0
                            ? ev.batches.find(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) < parseInt(b.limit || 0, 10)) || ev.batches[0]
                            : null;
                          const isSoldOut = ev.batches && ev.batches.length > 0
                            ? ev.batches.every(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) >= parseInt(b.limit || 0, 10))
                            : false;
                          return (
                            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fafafa', padding: '8px 10px', borderRadius: '12px', border: '1px solid #eee' }}>
                              <img src={ev.image} alt={ev.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <span style={{ fontSize: '0.7rem', color: '#f28d1a', fontWeight: 600 }}>
                                    {isSoldOut ? 'Esgotado' : (activeBatch ? `R$ ${(activeBatch.price || 0).toFixed(2)}` : 'Preço Indisponível')}
                                  </span>
                                  <span style={{ fontSize: '0.6rem', color: '#888' }}>{ev.date}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

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
