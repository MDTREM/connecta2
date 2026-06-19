import { useState, useEffect } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { 
  Plus, Trash2, ToggleLeft, ToggleRight, 
  ShoppingBag, User, MapPin, Phone, Truck, Bike, MessageSquare,
  Edit, Camera, Save, X, Star, Users, Clock, Upload, ArrowLeft,
  Home, Store as StoreIcon, Layers, Play, ClipboardList,
  Bell, LogOut
} from 'lucide-react';
import { uploadAvatar, uploadCover, uploadProductImage, uploadVideoFile } from '../../firebase/storage';

export default function SellerArea({ onOpenChat, onToggleNotifications, unreadNotificationsCount, onLogout }) {
  const { 
    currentUser, products, orders, addProduct, editProduct,
    deleteProduct, toggleProductActive, updateOrderStatus, callRider, cancelCallRider, addVideo,
    setUsers, addFlashDeal, removeFlashDeal, visualLayoutSettings, updateUserProfile, users,
    productReviews, videos, deleteVideo, updateVideo
  } = useFirebaseMock();

  // Rider selection modal state
  const [selectedOrderForRider, setSelectedOrderForRider] = useState(null);

  // Saque modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPixKey, setWithdrawPixKey] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('connecta_seller_active_tab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('connecta_seller_active_tab', activeTab);
  }, [activeTab]);

  // Edit profile states
  const [editingField, setEditingField] = useState(null); // 'name', 'description', 'phone', 'address', 'openingHours'
  const [editValue, setEditValue] = useState('');

  // Category management
  const [newCategoryName, setNewCategoryName] = useState('');

  // Product form states
  const [editingProductId, setEditingProductId] = useState(null); // 'new' or product ID or null
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodCostPrice, setProdCostPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodSpecifications, setProdSpecifications] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodQuantity, setProdQuantity] = useState('1');
  const [prodShipping, setProdShipping] = useState('6.00');
  const [prodDeliveryTime, setProdDeliveryTime] = useState('5');
  const [prodProductionTime, setProdProductionTime] = useState('2');
  const [prodImages, setProdImages] = useState(Array(10).fill(''));
  const [prodVariations, setProdVariations] = useState([]);
  
  // New variation inline inputs
  const [newVarText, setNewVarText] = useState('');
  const [newVarImage, setNewVarImage] = useState('');

  // Reels states
  const [reelsTitle, setReelsTitle] = useState('');
  const [reelsDesc, setReelsDesc] = useState('');
  const [reelsVideoUrl, setReelsVideoUrl] = useState('');
  const [reelsVideoName, setReelsVideoName] = useState('');
  const [reelsProductId, setReelsProductId] = useState('');
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

  // Flash Deal states
  const [fdProductId, setFdProductId] = useState('');
  const [fdDiscount, setFdDiscount] = useState('20');
  const [fdLimit, setFdLimit] = useState('10');

  const handleCreateFlashDeal = (e) => {
    e.preventDefault();
    if (!fdProductId) {
      alert('Selecione um produto, uai!');
      return;
    }
    const activeFD = storeProducts.filter(p => p.inFlashDeal);
    if (activeFD.length >= 3) {
      alert('Limite de 3 ofertas relâmpago por loja excedido!');
      return;
    }
    addFlashDeal(fdProductId, parseFloat(fdDiscount), parseInt(fdLimit));
    setFdProductId('');
    setFdDiscount('20');
    setFdLimit('10');
  };

  const getRemainingTime = (createdAt) => {
    const diff = (createdAt + 24 * 60 * 60 * 1000) - Date.now();
    if (diff <= 0) return 'Expirado';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m restando`;
  };

  const storeProducts = products.filter(p => p.storeId === currentUser.id);
  const storeCategories = currentUser.storeCategories || ['Todos'];
  
  const followers = users.filter(u => u.following && u.following.includes(currentUser.id));
  const storeProdIds = storeProducts.map(p => p.id);
  const storeReviews = productReviews ? productReviews.filter(r => storeProdIds.includes(r.productId)) : [];
  const totalReviewsCount = storeReviews.length;
  const avgRating = totalReviewsCount > 0 
    ? parseFloat((storeReviews.reduce((sum, r) => sum + (parseFloat(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)) 
    : 0.0;

  // Flatten items of orders to see if they belong to this store
  const storeOrders = orders.filter(o => 
    o.items && o.items.some(item => item.storeId === currentUser.id)
  );

  const activeOrders = storeOrders.filter(o => o.status !== 'delivered' && o.status !== 'rejected');
  
  // Calculate financial reports
  const dailyEarnings = storeOrders
    .filter(o => o.status === 'delivered')
    .reduce((acc, o) => acc + o.total - o.commissionFee, 0);
  
  const monthlyEarnings = dailyEarnings; // Real monthly earnings calculated from delivered orders
  const withdrawableBalance = dailyEarnings; // Real withdrawable balance from delivered orders

  // Profile fields handlers
  const startEditing = (field, initialVal) => {
    setEditingField(field);
    setEditValue(initialVal);
  };

  // Drag to scroll handlers for horizontal lists
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

  // Categories handlers
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const cleanName = newCategoryName.trim();
    if (storeCategories.includes(cleanName)) {
      alert('Esta categoria já existe, uai!');
      return;
    }
    const updated = [...storeCategories, cleanName];
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, storeCategories: updated } : u));
    updateUserProfile(currentUser.id, { storeCategories: updated });
    setNewCategoryName('');
  };

  const handleDeleteCategory = (catToDelete) => {
    if (catToDelete === 'Todos') {
      alert('A categoria "Todos" é padrão e não pode ser removida!');
      return;
    }
    if (confirm(`Quer mesmo remover a categoria "${catToDelete}"?`)) {
      const updated = storeCategories.filter(c => c !== catToDelete);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, storeCategories: updated } : u));
      updateUserProfile(currentUser.id, { storeCategories: updated });
    }
  };

  // Product editing helpers
  const handleSelectProductForEdit = (prodId) => {
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setEditingProductId(prodId);
      setProdName(prod.name || '');
      setProdPrice(prod.price?.toString() || '');
      setProdOriginalPrice(prod.originalPrice?.toString() || '');
      setProdCostPrice(prod.costPrice?.toString() || '');
      setProdCategory(prod.category || storeCategories[0]);
      setProdDescription(prod.description || '');
      setProdSpecifications(prod.specifications || '');
      setProdStock(prod.stock?.toString() || '10');
      setProdQuantity(prod.quantity?.toString() || '1');
      setProdShipping(prod.shippingPrice?.toString() || '6.00');
      setProdDeliveryTime(prod.deliveryTime?.toString() || '5');
      setProdProductionTime(prod.productionTime?.toString() || '2');
      
      // Load variations & images if present, otherwise default
      setProdVariations(prod.variations || []);
      const imagesArray = Array(10).fill('');
      if (prod.images && prod.images.length > 0) {
        prod.images.forEach((img, idx) => {
          if (idx < 10) imagesArray[idx] = img;
        });
      } else if (prod.image) {
        imagesArray[0] = prod.image;
      }
      setProdImages(imagesArray);
      
      setActiveTab('products');
    };
  };

  const handleNewProductClick = () => {
    setEditingProductId('new');
    setProdName('');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdCostPrice('');
    setProdCategory(storeCategories[0] || 'Todos');
    setProdDescription('');
    setProdSpecifications('');
    setProdStock('10');
    setProdQuantity('1');
    setProdShipping('6.00');
    setProdDeliveryTime('5');
    setProdProductionTime('2');
    setProdImages(Array(10).fill(''));
    setProdVariations([]);
  };

  const handleProductImageUpload = async (idx, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const productId = editingProductId && editingProductId !== 'new' ? editingProductId : 'temp_' + Date.now();
        const url = await uploadProductImage(file, currentUser.id, productId);
        setProdImages(prev => {
          const updated = [...prev];
          updated[idx] = url;
          return updated;
        });
      } catch (error) {
        console.error(error);
        alert('Erro ao fazer upload da imagem do produto.');
      }
    }
  };

  const handleRemoveProductImage = (idx, e) => {
    if (e) e.stopPropagation();
    setProdImages(prev => {
      const updated = [...prev];
      updated[idx] = '';
      return updated;
    });
  };

  // Variations handlers
  const handleVarImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const productId = editingProductId && editingProductId !== 'new' ? editingProductId : 'temp_' + Date.now();
        const url = await uploadProductImage(file, currentUser.id, productId);
        setNewVarImage(url);
      } catch (error) {
        console.error(error);
        alert('Erro ao fazer upload da imagem de variação.');
      }
    }
  };
  const handleAddVariation = (e) => {
    e.preventDefault();
    if (!newVarText.trim()) {
      alert('Digite o texto da variação, uai!');
      return;
    }
    const newVar = {
      id: 'var_' + Math.random().toString(36).substr(2, 9),
      text: newVarText.trim(),
      image: newVarImage || ''
    };
    setProdVariations(prev => [...prev, newVar]);
    setNewVarText('');
    setNewVarImage('');
  };

  const handleRemoveVariation = (varId) => {
    setProdVariations(prev => prev.filter(v => v.id !== varId));
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodName || !prodPrice || !prodStock) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const filteredImages = prodImages.filter(img => img !== '');
    const mainImage = filteredImages[0] || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400';

    const productPayload = {
      name: prodName,
      price: parseFloat(prodPrice),
      originalPrice: prodOriginalPrice ? parseFloat(prodOriginalPrice) : null,
      costPrice: prodCostPrice ? parseFloat(prodCostPrice) : null,
      category: prodCategory,
      description: prodDescription,
      specifications: prodSpecifications,
      stock: parseInt(prodStock) || 0,
      quantity: parseInt(prodQuantity) || 1,
      shippingPrice: parseFloat(prodShipping) || 0,
      deliveryTime: parseInt(prodDeliveryTime) || 5,
      productionTime: parseInt(prodProductionTime) || 2,
      image: mainImage,
      images: filteredImages,
      variations: prodVariations,
      storeId: currentUser.id,
      storeName: currentUser.companyName || currentUser.name
    };

    if (editingProductId === 'new') {
      addProduct(productPayload);
      alert('Produto cadastrado com sucesso, sô!');
    } else {
      editProduct(editingProductId, productPayload);
      alert('Produto atualizado com sucesso!');
    }

    setEditingProductId(null);
  };

  // Reels video handler
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReelsVideoUrl(url);
      setReelsVideoName(file.name);
      setReelsFile(file);
    }
  };

  const handleReelsSubmit = async (e) => {
    e.preventDefault();
    if (!reelsTitle || !reelsVideoUrl) {
      alert('Carregue um vídeo e informe a legenda, uai!');
      return;
    }

    setIsUploadingVideo(true);
    try {
      let finalVideoUrl = reelsVideoUrl;
      if (reelsFile) {
        finalVideoUrl = await uploadVideoFile(reelsFile, currentUser.id);
      }

      const linkedProd = products.find(p => p.id === reelsProductId);
      addVideo({
        title: reelsTitle,
        description: reelsDesc,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        videoUrl: finalVideoUrl,
        poster: linkedProd ? linkedProd.image : currentUser.logo || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400',
        linkedType: linkedProd ? 'product' : null,
        linkedId: linkedProd ? linkedProd.id : null,
        linkedName: linkedProd ? linkedProd.name : null,
        linkedPrice: linkedProd ? linkedProd.price : null
      });

      setReelsTitle('');
      setReelsDesc('');
      setReelsVideoUrl('');
      setReelsVideoName('');
      setReelsProductId('');
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

  // --- SUBVIEW 1: DASHBOARD ---
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>{currentUser.companyName || currentUser.name}</h2>
          <p style={{ fontSize: '0.78rem', color: '#777', margin: '2px 0 0 0' }}>Painel da Loja | Ouro Preto</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { label: 'Saldo Disponível', val: `R$ ${withdrawableBalance.toFixed(2)}`, desc: 'Pronto para sacar', color: '#fffdf4', btn: 'Sacar' },
          { label: 'Pedidos Ativos', val: `${activeOrders.length} ped.`, desc: 'Pendentes de envio', color: '#fffdf0' },
          { label: 'Ganhos do Dia', val: `R$ ${dailyEarnings.toFixed(2)}`, desc: 'Líquido pós comissão', color: '#f3faf8' },
          { label: 'Ganhos do Mês', val: `R$ ${monthlyEarnings.toFixed(2)}`, desc: 'Estimado 30 dias', color: '#fef3f3' }
        ].map(st => (
          <div
            key={st.label}
            style={{
              backgroundColor: st.color,
              padding: '14px',
              borderRadius: '20px',
              border: '1.5px solid #eaeaea40',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 500 }}>{st.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0' }}>{st.val}</div>
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
                <strong style={{ color: '#d4730d', display: 'block', marginBottom: '4px' }}>Taxa Administrativa</strong>
                A taxa cobrada pelo Conecta+ para venda de produtos é de <strong>{visualLayoutSettings?.commissions?.products !== undefined ? visualLayoutSettings.commissions.products : 10}%</strong> sobre o valor de cada venda realizada.
              </div>

              <div style={{ backgroundColor: '#f3faf8', padding: '14px', borderRadius: '16px', border: '1px solid #2ec4b615' }}>
                <strong style={{ color: '#2ec4b6', display: 'block', marginBottom: '4px' }}>Saldo Líquido</strong>
                O valor líquido das vendas é creditado no seu saldo disponível pós-pagamento do pedido.
              </div>

              <div style={{ backgroundColor: '#fcf6ed', padding: '14px', borderRadius: '16px', border: '1px solid #f28d1a15' }}>
                <strong style={{ color: '#f28d1a', display: 'block', marginBottom: '4px' }}>Saques Pix</strong>
                Você pode solicitar o saque do seu saldo acumulado via Pix diretamente no painel a qualquer momento!
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

  // --- SUBVIEW 2: PROFILE VIEW (LOJA) ---
  const renderProfileView = () => {


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
            htmlFor="cover-file-upload"
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
            id="cover-file-upload" 
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
              htmlFor="logo-file-upload"
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
              id="logo-file-upload" 
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
                <button onClick={() => handleSaveField('name')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>{currentUser.companyName || currentUser.name}</h3>
                <button onClick={() => startEditing('name', currentUser.companyName || currentUser.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={14} /></button>
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
                  <option value="Lojas - Artesanato e Lembranças">Lojas - Artesanato e Lembranças</option>
                  <option value="Lojas - Alimentos e Bebidas">Lojas - Alimentos e Bebidas</option>
                  <option value="Serviços - Guia Turístico">Serviços - Guia Turístico</option>
                  <option value="Serviços - Hospedagem e Aventura">Serviços - Hospedagem e Aventura</option>
                  <option value="Eventos - Festas e Shows">Eventos - Festas e Shows</option>
                </select>
                <button type="button" onClick={() => handleSaveField('category')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentUser.category || 'Lojas - Artesanato e Lembranças'}</span>
                <button onClick={() => startEditing('category', currentUser.category || 'Lojas - Artesanato e Lembranças')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
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
                  <button onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '30px', width: 'auto' }}>Cancelar</button>
                  <button onClick={() => handleSaveField('description')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '30px', width: 'auto', backgroundColor: '#f28d1a' }}>Salvar</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, lineHeight: 1.35, flex: 1, whiteSpace: 'pre-wrap' }}>{currentUser.description || 'Nenhuma descrição informada.'}</p>
                <button onClick={() => startEditing('description', currentUser.description || '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: '2px 0 0 0' }}><Edit size={12} /></button>
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
                  <button onClick={() => handleSaveField('address')} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={12} /></button>
                  <button onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto' }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} style={{ color: '#aaa' }} /> 
                  <span style={{ color: '#555' }}>Endereço:</span> {currentUser.address}
                  <button onClick={() => startEditing('address', currentUser.address)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
                </div>
              )}
            </div>

            {/* PHONE */}
            <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '4px' }}>
              {editingField === 'phone' ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Phone size={12} />
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0 }}
                  />
                  <button onClick={() => handleSaveField('phone')} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={12} /></button>
                  <button onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto' }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} style={{ color: '#aaa' }} /> 
                  <span style={{ color: '#555' }}>Telefone:</span> {currentUser.phone}
                  <button onClick={() => startEditing('phone', currentUser.phone)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
                </div>
              )}
            </div>

            {/* OPENING HOURS */}
            <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '4px' }}>
              {editingField === 'openingHours' ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Clock size={12} />
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0 }}
                  />
                  <button onClick={() => handleSaveField('openingHours')} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={12} /></button>
                  <button onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto' }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} style={{ color: '#aaa' }} /> 
                  <span style={{ color: '#555' }}>Horário:</span> {currentUser.openingHours || '09:00 às 18:00'}
                  <button onClick={() => startEditing('openingHours', currentUser.openingHours || '09:00 às 18:00')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
                </div>
              )}
            </div>

            {/* DELIVERY TIME ESTIMATE */}
            <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '4px' }}>
              {editingField === 'deliveryTimeEstimate' ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Truck size={12} />
                  <input 
                    type="text" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)} 
                    className="input-field" 
                    placeholder="Ex: 30-50 min"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0 }}
                  />
                  <button onClick={() => handleSaveField('deliveryTimeEstimate')} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={12} /></button>
                  <button onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto' }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={12} style={{ color: '#aaa' }} /> 
                  <span style={{ color: '#555' }}>Tempo de Entrega:</span> {currentUser.deliveryTimeEstimate || 'Não informado'}
                  <button onClick={() => startEditing('deliveryTimeEstimate', currentUser.deliveryTimeEstimate || '')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
                </div>
              )}
            </div>

            {/* RATINGS & FOLLOWERS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#666', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={11} 
                    fill={avgRating > 0 && star <= Math.round(avgRating) ? "#f28d1a" : "#ddd"} 
                    stroke="none" 
                  />
                ))}
              </div>
              <span style={{ color: '#2d2d2d', fontWeight: 500 }}>
                {avgRating > 0 ? avgRating.toFixed(1) : '0'} ({totalReviewsCount} {totalReviewsCount === 1 ? 'avaliação' : 'avaliações'})
              </span>
              <span>•</span>
              <span style={{ fontWeight: 500 }}>
                {followers.length} {followers.length === 1 ? 'seguidor' : 'seguidores'}
              </span>
            </div>

          </div>
        </div>

        {/* Products Grid (Client View Layout with edit trigger) */}
        <div style={{ padding: '16px 0', paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Produtos da Loja</h4>
          
          {storeProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.78rem' }}>
              Nenhum produto cadastrado. Vá em "Produtos" para cadastrar, sô!
            </div>
          ) : (
            <div className="responsive-profile-grid" style={{ gap: '12px' }}>
              {storeProducts.map(p => {
                const hasDiscount = p.originalPrice && p.price < p.originalPrice;
                const discountPercent = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
                return (
                  <div 
                    key={p.id}
                    onClick={() => handleSelectProductForEdit(p.id)}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '16px',
                      padding: '10px',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    {hasDiscount && (
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: '#ff5e5b',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        padding: '2px 6px',
                        borderRadius: '8px',
                        zIndex: 2
                      }}>
                        {discountPercent}%
                      </span>
                    )}
                    <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }} />
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#2d2d2d', margin: 0 }}>{p.name}</h5>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 500 }}>R$ {p.price.toFixed(2)}</strong>
                      {hasDiscount && (
                        <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {p.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                      {p.soldCount || 0} vendidos
                    </div>
                    
                    {/* Floating edit button overlay */}
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      backgroundColor: 'rgba(242, 141, 26, 0.95)',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      zIndex: 3
                    }}>
                      <Edit size={10} />
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

  // --- SUBVIEW 3: PRODUCTS CATALOG (LISTING & EDITING FORM) ---
  const renderProducts = () => {
    if (editingProductId !== null) {
      // Product Form (Add/Edit)
      return (
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <button 
              type="button" 
              onClick={() => setEditingProductId(null)} 
              style={{ background: 'none', border: 'none', color: '#2d2d2d', cursor: 'pointer', padding: 0 }}
            >
              <ArrowLeft size={20} />
            </button>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
              {editingProductId === 'new' ? 'Cadastrar Novo Produto' : 'Editar Produto'}
            </h3>
          </div>

          {/* Slots for Up to 10 Images */}
          <div className="form-group" style={{ marginBottom: 4 }}>
            <label style={{ fontSize: '0.72rem', color: '#666', marginBottom: '4px', display: 'block' }}>Fotos do Produto (Até 10 slots - Primeira é a Capa)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {prodImages.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => document.getElementById(`prod-img-file-${idx}`).click()}
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
                        onClick={(e) => handleRemoveProductImage(idx, e)}
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
                    id={`prod-img-file-${idx}`} 
                    accept="image/*" 
                    onChange={(e) => handleProductImageUpload(idx, e)}
                    style={{ display: 'none' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nome do Produto</label>
            <input 
              type="text" 
              placeholder="Ex: Pedra-Sabão Esculpida Aleijadinho" 
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              className="input-field"
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Descrição do produto (detalhe o trem)</label>
            <textarea 
              placeholder="Descrição legal para valorizar o trabalho manual..." 
              value={prodDescription}
              onChange={(e) => setProdDescription(e.target.value)}
              className="input-field"
              style={{ height: '52px', resize: 'none' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Especificações do Produto</label>
            <input 
              type="text" 
              placeholder="Ex: Peso: 1.2kg, Material: Pedra-Sabão, Dimensões: 15x10cm" 
              value={prodSpecifications}
              onChange={(e) => setProdSpecifications(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Categoria</label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: '2px solid #eaeaea',
                  fontSize: '0.82rem',
                  backgroundColor: 'white',
                  fontWeight: 500
                }}
              >
                {storeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Estoque</label>
              <input 
                type="number" 
                placeholder="10" 
                value={prodStock}
                onChange={(e) => setProdStock(e.target.value)}
                className="input-field"
                required 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Preço Venda (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="39.90" 
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                className="input-field"
                required 
              />
            </div>

            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Preço Custo (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="20.00" 
                value={prodCostPrice}
                onChange={(e) => setProdCostPrice(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Preço Desconto (R$)</label>
            <input 
              type="number" 
              step="0.01" 
              placeholder="Ex: 49.90" 
              value={prodOriginalPrice}
              onChange={(e) => setProdOriginalPrice(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Taxa de Frete (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder="6.00" 
                value={prodShipping}
                onChange={(e) => setProdShipping(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Produção (dias)</label>
              <input 
                type="number" 
                placeholder="2" 
                value={prodProductionTime}
                onChange={(e) => setProdProductionTime(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Entrega (dias)</label>
              <input 
                type="number" 
                placeholder="5" 
                value={prodDeliveryTime}
                onChange={(e) => setProdDeliveryTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Product Variations section */}
          <div style={{ border: '1px solid #eee', padding: '12px', borderRadius: '16px', backgroundColor: '#fafafa', marginTop: '4px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#666', display: 'block', marginBottom: '8px' }}>Cadastro de Variações (Cor, Tamanho, etc.)</span>
            
            {/* Added variations list */}
            {prodVariations.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                {prodVariations.map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '10px', border: '1px solid #eee' }}>
                    {v.image && <img src={v.image} alt={v.text} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />}
                    <span style={{ fontSize: '0.75rem', flex: 1, color: '#333' }}>{v.text}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveVariation(v.id)}
                      style={{ background: 'none', border: 'none', color: '#ff5e5b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline add variation form */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div 
                onClick={() => document.getElementById('var-image-file').click()}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px dashed #bbb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                {newVarImage ? (
                  <img src={newVarImage} alt="new-var" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={14} style={{ color: '#888' }} />
                )}
              </div>
              <input 
                type="file" 
                id="var-image-file" 
                accept="image/*" 
                onChange={handleVarImageUpload}
                style={{ display: 'none' }}
              />

              <input 
                type="text" 
                placeholder="Texto (ex: Tamanho M)" 
                value={newVarText}
                onChange={(e) => setNewVarText(e.target.value)}
                className="input-field"
                style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0, flex: 1, height: '36px' }}
              />

              <button 
                type="button" 
                onClick={handleAddVariation}
                className="btn btn-primary"
                style={{ width: 'auto', padding: '0 12px', height: '36px', fontSize: '0.72rem', backgroundColor: '#f28d1a', whiteSpace: 'nowrap' }}
              >
                Adicionar
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={() => setEditingProductId(null)} 
              className="btn btn-secondary" 
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ flex: 1, backgroundColor: '#f28d1a' }}
            >
              Salvar Produto
            </button>
          </div>
        </form>
      );
    }

    // Default Products Listing
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
        
        {/* SEÇÃO: Ofertas Relâmpago (Máx 3) */}
        <div style={{
          background: 'linear-gradient(135deg, #fffcf5 0%, #fff9ee 100%)',
          border: '1.5px solid #f28d1a',
          borderRadius: '24px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#d4730d', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 12px 0' }}>
            ⚡ Ofertas Relâmpago (Máx 3)
          </h4>

          {/* Form to add a flash deal */}
          {storeProducts.filter(p => p.inFlashDeal).length < 3 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', borderBottom: '1px dashed #f28d1a40', paddingBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: '#666', fontWeight: 500 }}>Vincular novo produto à Oferta Relâmpago (duração de 24h):</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select
                  value={fdProductId}
                  onChange={(e) => setFdProductId(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    color: '#2d2d2d',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Selecione o Produto --</option>
                  {storeProducts.filter(p => p.active && !p.inFlashDeal).map(p => (
                    <option key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)})</option>
                  ))}
                </select>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: '#777', display: 'block', marginBottom: '2px' }}>Desconto (%)</label>
                    <input
                      type="number"
                      placeholder="Ex: 20"
                      min="1"
                      max="99"
                      value={fdDiscount}
                      onChange={(e) => setFdDiscount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '0.8rem',
                        borderRadius: '12px',
                        border: '1px solid #ddd',
                        color: '#2d2d2d',
                        backgroundColor: 'white',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: '#777', display: 'block', marginBottom: '2px' }}>Limite de Vendas</label>
                    <input
                      type="number"
                      placeholder="Ex: 10"
                      min="1"
                      value={fdLimit}
                      onChange={(e) => setFdLimit(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '0.8rem',
                        borderRadius: '12px',
                        border: '1px solid #ddd',
                        color: '#2d2d2d',
                        backgroundColor: 'white',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button
                    onClick={handleCreateFlashDeal}
                    style={{
                      alignSelf: 'flex-end',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: '#f28d1a',
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      height: '35px'
                    }}
                  >
                    Vincular
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: '#d4730d', backgroundColor: '#fff3cd', padding: '10px 14px', borderRadius: '12px', marginBottom: '16px', fontWeight: 500 }}>
              Você já atingiu o limite máximo de 3 Ofertas Relâmpago ativas. Remova uma das ofertas abaixo para liberar espaço!
            </div>
          )}

          {/* Active flash deals list */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '8px' }}>Ofertas Ativas no Momento:</div>
            {storeProducts.filter(p => p.inFlashDeal).length === 0 ? (
              <div style={{ fontSize: '0.72rem', color: '#999', fontStyle: 'italic' }}>Nenhum produto em oferta relâmpago no momento.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {storeProducts.filter(p => p.inFlashDeal).map(p => {
                  const sold = p.flashDealSold || 0;
                  const limit = p.flashDealLimit || 1;
                  const percent = Math.round((sold / limit) * 100) || 0;
                  
                  return (
                    <div key={p.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: 'white',
                      padding: '10px',
                      borderRadius: '16px',
                      border: '1px solid #f28d1a30',
                      boxShadow: '0 2px 8px rgba(242, 141, 26, 0.05)'
                    }}>
                      <img src={p.image} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.68rem', color: '#666', marginTop: '2px' }}>
                          <span style={{ color: '#ff5e5b', fontWeight: 600 }}>{p.flashDealDiscount}% OFF</span>
                          <span>•</span>
                          <span style={{ color: '#f28d1a', fontWeight: 600 }}>R$ {p.price.toFixed(2)}</span>
                          {p.flashDealBackupPrice && <span style={{ textDecoration: 'line-through', color: '#bbb' }}>R$ {p.flashDealBackupPrice.toFixed(2)}</span>}
                        </div>
                        
                        {/* Sales progress bar */}
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#888', marginBottom: '2px' }}>
                            <span>Vendas: {sold}/{limit} ({percent}%)</span>
                            <span style={{ color: '#d4730d' }}>{getRemainingTime(p.flashDealCreatedAt)}</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', backgroundColor: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2px' }} />
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeFlashDeal(p.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff5e5b',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Remover da Oferta Relâmpago"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Produtos Cadastrados ({storeProducts.length})</h3>
          <button
            onClick={handleNewProductClick}
            style={{
              padding: '8px 16px',
              borderRadius: '99px',
              backgroundColor: '#f28d1a', // Yellow
              color: 'white',
              border: 'none',
              fontSize: '0.72rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} /> Novo Produto
          </button>
        </div>

        {storeProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
            <ShoppingBag size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '0.82rem' }}>Sua loja ainda não tem produtos cadastrados uai.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {storeProducts.map(prod => (
              <div
                key={prod.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid #eee',
                  alignItems: 'center'
                }}
              >
                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                    {prod.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', color: '#777', marginTop: '2px' }}>
                    <span style={{ color: '#f28d1a', fontWeight: 500 }}>R$ {prod.price.toFixed(2)}</span>
                    <span>• {prod.stock} un em estoque</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Edit button */}
                  <button
                    onClick={() => handleSelectProductForEdit(prod.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#f28d1a',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Editar produto"
                  >
                    <Edit size={16} />
                  </button>

                  {/* Active switch */}
                  <button
                    onClick={() => toggleProductActive(prod.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: prod.active ? '#2ec4b6' : '#999' }}
                  >
                    {prod.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (confirm(`Quer mesmo excluir o produto "${prod.name}"?`)) {
                        deleteProduct(prod.id);
                      }
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff5e5b' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- SUBVIEW 4: CATEGORIES MANAGEMENT (CADASTRO DE CATEGORIAS DA LOJA) ---
  const renderCategories = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Categorias da Loja</h3>
      <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.35, margin: 0 }}>
        Cadastre as categorias internas da sua loja. Elas servem para organizar seus produtos na vitrine e classificar no cadastro de produtos.
      </p>

      {/* Add category form */}
      <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px', marginTop: '4px', marginBottom: '8px' }}>
        <input 
          type="text" 
          placeholder="Ex: Pedra-Sabão" 
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="input-field" 
          style={{ padding: '8px 12px', fontSize: '0.8rem', margin: 0, flex: 1 }}
          required
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ width: 'auto', padding: '0 16px', fontSize: '0.78rem', backgroundColor: '#f28d1a', color: 'white', fontWeight: 500 }}
        >
          Criar Categoria
        </button>
      </form>

      {/* Categories listing */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {storeCategories.map(cat => (
          <div 
            key={cat} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              backgroundColor: '#fafafa', 
              padding: '10px 14px', 
              borderRadius: '16px', 
              border: '1px solid #eee' 
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#333' }}>{cat}</span>
            {cat !== 'Todos' && (
              <button 
                onClick={() => handleDeleteCategory(cat)}
                style={{ background: 'none', border: 'none', color: '#ff5e5b', cursor: 'pointer', padding: 0 }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrderList = (ordersList, sectionTitle) => {
    if (ordersList.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f28d1a', margin: '8px 0 4px 0', borderBottom: '1px solid #f28d1a33', paddingBottom: '4px' }}>
          {sectionTitle} ({ordersList.length})
        </h4>
        {ordersList.map(order => {
          const isPending = order.status === 'pending';
          const isPreparing = order.status === 'preparing';
          const isCallingRider = order.status === 'calling_rider';
          const isRiderAssigned = order.status === 'rider_assigned';
          const isDelivering = order.status === 'delivering';
          const isDelivered = order.status === 'delivered';
          
          return (
            <div
              key={order.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid #eee',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f9f9f9', paddingBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d' }}>Pedido #{order.id}</span>
                  <div style={{ fontSize: '0.62rem', color: '#999' }}>{order.date}</div>
                </div>
                
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  padding: '2px 10px',
                  borderRadius: '99px',
                  backgroundColor: 
                    order.status === 'delivered' ? '#e6f7f4' : 
                    order.status === 'rejected' ? '#ff5e5b15' : '#fff0d2',
                  color: 
                    order.status === 'delivered' ? '#2ec4b6' : 
                    order.status === 'rejected' ? '#ff5e5b' : '#d4730d'
                }}>
                  {order.status === 'pending' ? 'Novo Pedido' : 
                   order.status === 'preparing' ? 'Preparando' : 
                   order.status === 'calling_rider' ? 'Chamando Entregador' : 
                   order.status === 'rider_assigned' ? 'Entregador no Local' : 
                   order.status === 'delivering' ? 'Em Rota de Entrega' : 
                   order.status === 'delivered' ? 'Concluído' : 'Recusado'}
                </span>
              </div>

              {/* Customer Details */}
              <div style={{ fontSize: '0.75rem', color: '#666', borderBottom: '1px dashed #f0f0f0', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} style={{ color: '#888' }} /> <span><strong>Cliente:</strong> {order.customerName}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><Phone size={12} style={{ color: '#888' }} /> <span><strong>Contato:</strong> {order.customerPhone}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}><MapPin size={12} style={{ color: '#888' }} /> <span><strong>Entrega:</strong> {order.address}</span></div>
              </div>

              {/* Items & All Registered Info of Selected Products */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items.map(item => {
                  const fullProd = products.find(p => p.id === item.id);
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: '10px', backgroundColor: '#fcfcfc', border: '1px solid #f2f2f2', padding: '10px', borderRadius: '16px' }}>
                      <img src={item.image || (fullProd ? fullProd.image : '')} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#333', alignItems: 'center' }}>
                          <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>{item.quantity}x {item.name}</span>
                          <span style={{ color: '#f28d1a', whiteSpace: 'nowrap', fontWeight: 500 }}>R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.variation && (
                          <div style={{ fontSize: '0.68rem', color: '#f28d1a', marginTop: '2px' }}>
                            Variação selecionada: {item.variation}
                          </div>
                        )}
                        
                        {/* Full Registered details of the product */}
                        <div style={{ borderTop: '1px dashed #eee', marginTop: '6px', paddingTop: '6px', fontSize: '0.68rem', color: '#777', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {fullProd?.description && (
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                              <strong>Descrição cadastrada:</strong> {fullProd.description}
                            </div>
                          )}
                          {fullProd?.specifications && <div><strong>Especificações:</strong> {fullProd.specifications}</div>}
                          <div>
                            <strong>Categoria:</strong> {fullProd?.category || 'Geral'} | <strong>Estoque:</strong> {fullProd?.stock || 0} un.
                          </div>
                          <div>
                            <strong>Frete cadastrado:</strong> R$ {fullProd?.shippingPrice?.toFixed(2) || '0.00'}
                          </div>
                          <div>
                            <strong>Produção:</strong> {fullProd?.productionTime || 0} dias | <strong>Entrega:</strong> {fullProd?.deliveryTime || 0} dias
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals & Motoboy Action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid #f9f9f9', paddingTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#888' }}>Total repassado (líq):</span>
                  <div style={{ fontSize: '0.9rem', color: '#f28d1a', fontWeight: 500 }}>R$ {(order.total - order.commissionFee).toFixed(2)}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Call motoboy actions directly inside card */}
                  {(isPending || isPreparing) && (
                    <button
                      onClick={() => {
                        if (isPending) updateOrderStatus(order.id, 'preparing');
                        setSelectedOrderForRider(order);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '16px',
                        border: 'none',
                        backgroundColor: '#f28d1a',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Truck size={14} /> Chamar Entregador
                    </button>
                  )}

                  {isCallingRider && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#d4730d', fontStyle: 'italic', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {order.assignedRiderName ? `Chamando ${order.assignedRiderName}...` : 'Chamando entregador...'} 🚗🛵
                      </span>
                      <button
                        onClick={() => cancelCallRider(order.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff5e5b',
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Cancelar Chamada
                      </button>
                    </div>
                  )}

                  {isRiderAssigned && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivering')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '16px',
                        border: 'none',
                        backgroundColor: '#2ec4b6',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      Entregar ao Entregador ({order.riderName})
                    </button>
                  )}

                  {isDelivering && (
                    <span style={{ fontSize: '0.7rem', color: '#2ec4b6', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      Em rota de entrega... 🛵
                    </span>
                  )}

                  {isDelivered && (
                    <span style={{ fontSize: '0.7rem', color: '#2ec4b6', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      Concluído!
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- SUBVIEW 5: ORDERS PIPELINE ---
  const renderOrders = () => {
    const pendingOrders = storeOrders.filter(o => o.status === 'pending');
    const approvedOrders = storeOrders.filter(o => o.status === 'preparing');
    const awaitingRiderOrders = storeOrders.filter(o => o.status === 'calling_rider' || o.status === 'rider_assigned');
    const deliveredOrders = storeOrders.filter(o => o.status === 'delivering' || o.status === 'delivered');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Pedidos de Clientes ({storeOrders.length})</h3>
        
        {storeOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ShoppingBag size={48} style={{ color: '#ccc', marginBottom: '8px' }} />
            <p style={{ fontSize: '0.82rem' }}>Nenhum pedido recebido ainda. Divulgue seu link, uai!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {renderOrderList(pendingOrders, 'Pendentes')}
            {renderOrderList(approvedOrders, 'Aprovado')}
            {renderOrderList(awaitingRiderOrders, 'Aguardando Entregador')}
            {renderOrderList(deliveredOrders, 'Entregue')}
          </div>
        )}
      </div>
    );
  };


  // --- SUBVIEW 6: FOR YOU VIDEO UPLOAD ---
  const renderForyouForm = () => {
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
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Upload Vídeo ForYou</h3>
            <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.35, margin: 0 }}>
              Cadastre um vídeo curto no feed da ForYou. Os clientes podem comprar o produto vinculado diretamente do vídeo!
            </p>

            {/* 1. Vídeo */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.72rem', color: '#666', marginBottom: '6px', display: 'block' }}>Vídeo</label>
              
              <input 
                type="file" 
                id="reels-video-file-upload" 
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
                  onClick={() => document.getElementById('reels-video-file-upload').click()}
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
              <label>Título / Legenda do vídeo</label>
              <input 
                type="text" 
                placeholder="Ex: Caneca esculpida com amor e tradição" 
                value={reelsTitle}
                onChange={(e) => setReelsTitle(e.target.value)}
                className="input-field"
                required 
              />
            </div>

            {/* 3. Descrição */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Descrição detalhada do Vídeo</label>
              <textarea 
                placeholder="Conte um pouco sobre a produção deste item..." 
                value={reelsDesc}
                onChange={(e) => setReelsDesc(e.target.value)}
                className="input-field"
                style={{ height: '50px', resize: 'none' }}
              />
            </div>

            {/* 4. Vincular Produto */}
            <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
              <label>Vincular Produto da sua loja (Opcional)</label>
              
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
                {reelsProductId ? (() => {
                  const selectedProd = storeProducts.find(p => p.id === reelsProductId);
                  if (!selectedProd) return <span style={{ color: '#777' }}>Não vincular nenhum produto</span>;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={selectedProd.image} alt={selectedProd.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{selectedProd.name}</span>
                      <span style={{ color: '#f28d1a', whiteSpace: 'nowrap' }}>R$ {selectedProd.price.toFixed(2)}</span>
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#f28d1a15', color: '#f28d1a', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{selectedProd.category}</span>
                    </div>
                  );
                })() : (
                  <span style={{ color: '#777' }}>Não vincular nenhum produto</span>
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
                      setReelsProductId('');
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
                    Não vincular nenhum produto
                  </div>
                  
                  {/* Lista de Produtos */}
                  {storeProducts.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setReelsProductId(p.id);
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
                      <img src={p.image} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#2d2d2d' }}>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#777', display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#f28d1a', fontWeight: 500 }}>R$ {p.price.toFixed(2)}</span>
                          <span>•</span>
                          <span>{p.category}</span>
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
              style={{ width: '100%', height: '44px', marginTop: '6px', backgroundColor: '#f28d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
                        {v.linkedName ? `Vinculado a: ${v.linkedName}` : 'Sem produto vinculado'}
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

            {/* Modal de Edição de Vídeo do Vendedor */}
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

                    {/* Alterar/Remover Produto Vinculado */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#666' }}>Produto Vinculado</label>
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
                          const selectedProd = storeProducts.find(p => p.id === editVideoLinkedId);
                          if (!selectedProd) return <span style={{ color: '#777' }}>Sem produto vinculado</span>;
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={selectedProd.image} alt={selectedProd.name} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{selectedProd.name}</span>
                            </div>
                          );
                        })() : (
                          <span style={{ color: '#777' }}>Sem produto vinculado</span>
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
                          {storeProducts.map(p => (
                            <div 
                              key={p.id}
                              onClick={() => {
                                setEditVideoLinkedId(p.id);
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
                              <img src={p.image} alt={p.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
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
                          const selectedProd = storeProducts.find(p => p.id === editVideoLinkedId);
                          updateVideo(videoToEdit.id, {
                            title: editVideoTitle.trim(),
                            description: editVideoDesc.trim(),
                            linkedId: editVideoLinkedId,
                            linkedType: editVideoLinkedId ? 'product' : '',
                            linkedName: editVideoLinkedId ? selectedProd?.name || '' : ''
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

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff',
      overflowX: 'hidden',
      position: 'relative'
    }} className="animate-fade-in">
      
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
              { id: 'dashboard', label: 'Painel', icon: <Home size={18} /> },
              { id: 'profile', label: 'Loja', icon: <StoreIcon size={18} /> },
              { id: 'products', label: 'Produtos', icon: <ShoppingBag size={18} /> },
              { id: 'categories', label: 'Categorias', icon: <Layers size={18} /> },
              { id: 'orders', label: 'Pedidos', icon: <ClipboardList size={18} /> },
              { id: 'foryou', label: 'ForYou', icon: <Play size={18} /> }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setActiveTab(item.id);
                }}
                className={`desktop-nav-item ${activeTab === item.id ? 'active' : ''}`}
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

      {/* Main Area Body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px', paddingBottom: '90px' }} className="custom-scroll">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfileView()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'foryou' && renderForyouForm()}
      </div>

      {/* Menu Fixo Embaixo com Ícones */}
      <div className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Painel', icon: <Home size={20} /> },
          { id: 'profile', label: 'Loja', icon: <StoreIcon size={20} /> },
          { id: 'products', label: 'Produtos', icon: <ShoppingBag size={20} /> },
          { id: 'categories', label: 'Categorias', icon: <Layers size={20} /> },
          { id: 'orders', label: 'Pedidos', icon: <ClipboardList size={20} /> },
          { id: 'foryou', label: 'ForYou', icon: <Play size={20} /> }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setEditingProductId(null);
              setActiveTab(item.id);
            }}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {selectedOrderForRider && (
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
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }} className="animate-fade-in custom-scroll">
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Chamar Entregador</h3>
                <span style={{ fontSize: '0.7rem', color: '#888' }}>Pedido #{selectedOrderForRider.id} • Total: R$ {selectedOrderForRider.total.toFixed(2)}</span>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedOrderForRider(null)}
                style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={20} style={{ color: '#666' }} />
              </button>
            </div>

            {/* List of active couriers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f28d1a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Entregadores Online
              </div>

              {(() => {
                const onlineRiders = users.filter(u => u.role === 'motoboy' && u.online);
                if (onlineRiders.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#fdfdfd', borderRadius: '16px', border: '1px solid #eee', color: '#999', fontSize: '0.8rem' }}>
                      Nenhum entregador parceiro online no momento, sô. Tente novamente mais tarde.
                    </div>
                  );
                }

                return onlineRiders.map(rider => {
                  // Count completed deliveries for this rider
                  const completedCount = orders.filter(o => o.riderId === rider.id && o.status === 'delivered').length;
                  
                  return (
                    <div 
                      key={rider.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: '#ffffff',
                        padding: '12px',
                        borderRadius: '16px',
                        border: '1px solid #eee',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#f5f5f5' }}>
                        <img 
                          src={rider.avatar || rider.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} 
                          alt={rider.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2d2d2d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{rider.name}</span>
                          <span style={{ fontSize: '0.62rem', backgroundColor: '#e6f7f0', color: '#2ec4b6', padding: '1px 6px', borderRadius: '99px', fontWeight: 600 }}>Online</span>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#777', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{rider.category || 'Entregador'}</span>
                          <span>•</span>
                          <span>{completedCount} entregas</span>
                        </div>
                      </div>

                      {/* Rate & Call Action */}
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f28d1a' }}>R$ {(rider.deliveryRate || 7.00).toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            callRider(selectedOrderForRider.id, rider.id);
                            setSelectedOrderForRider(null);
                          }}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#f28d1a',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Chamar
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            
            {/* Broadcast Option */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, paddingRight: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333' }}>Chamada Geral (Rádio)</div>
                <div style={{ fontSize: '0.65rem', color: '#777', marginTop: '2px' }}>Dispare para todos os entregadores online. Quem aceitar primeiro leva.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  callRider(selectedOrderForRider.id);
                  setSelectedOrderForRider(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  border: '1.5px solid #f28d1a',
                  color: '#f28d1a',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Disparar Geral
              </button>
            </div>

          </div>
        </div>
      )}

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
