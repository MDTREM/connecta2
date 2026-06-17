import { useState, useEffect, useRef } from 'react';
import { useFirebaseMock, EditableText } from '../../context/FirebaseMockContext';
import { 
  MapPin, ShoppingCart, Heart, Search, Clock, 
  Store as StoreIcon, Calendar, Award, ArrowLeft, 
  Trash, Ticket, Check, X, Flame, Sparkles, Play, 
  Coins, Star, Palette, Gift, Wrench, Phone, MessageSquare, Layers, User,
  Plus, Camera, Edit, Bell, LogOut, ChevronRight,
  Tag, Truck, CreditCard, Receipt
} from 'lucide-react';

export default function ClientArea({ currentView, onSwitchView, onOpenChat, isVisitor, onTriggerLogin }) {
  const { 
    currentUser, products, events, services, videos, orders, coupons,
    cart, addToCart, updateCartQty, removeFromCart, placeOrder, buyTicket,
    userLocation, likeVideo, unlikeVideo, setUserLocation, hireServiceProvider, users,
    servicesHired, updateUserProfile, logout, notifications, markNotificationsRead,
    isVisualEditorActive, visualLayoutSettings, updateVisualText,
    updateAvatarOffset, reorderSections,
    productReviews, addProductReview, getCoinsUsedInPeriod, categories
  } = useFirebaseMock();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SectionWrapper = ({ sectionId, children }) => {
    if (isVisualEditorActive) {
      return (
        <div style={{
          border: '1px dashed #f28d1a',
          borderRadius: '16px',
          padding: '12px',
          marginBottom: '28px',
          position: 'relative',
          backgroundColor: '#fff9ee15'
        }}>
          {/* Controles de reordenação flutuantes */}
          <div style={{
            position: 'absolute',
            top: '-12px',
            right: '10px',
            display: 'flex',
            gap: '4px',
            zIndex: 10
          }}>
            <button 
              type="button"
              onClick={() => reorderSections(sectionId, 'up')}
              style={{
                padding: '2px 8px',
                fontSize: '0.62rem',
                backgroundColor: '#f28d1a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ⬆️ Subir
            </button>
            <button 
              type="button"
              onClick={() => reorderSections(sectionId, 'down')}
              style={{
                padding: '2px 8px',
                fontSize: '0.62rem',
                backgroundColor: '#f28d1a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ⬇️ Descer
            </button>
            <span style={{
              fontSize: '0.58rem',
              backgroundColor: '#fff',
              border: '1px solid #f28d1a',
              color: '#f28d1a',
              padding: '2px 6px',
              borderRadius: '6px',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>
              Seção: {sectionId}
            </span>
          </div>
          {children}
        </div>
      );
    }
    return <>{children}</>;
  };

  const renderCategoryIcon = (key) => {
    switch (key) {
      case 'Artesanato': return <Palette size={20} style={{ color: '#f28d1a' }} />;
      case 'Lembranças': return <Gift size={20} style={{ color: '#f28d1a' }} />;
      case 'Eventos': return <Ticket size={20} style={{ color: '#f28d1a' }} />;
      case 'Serviços': return <Wrench size={20} style={{ color: '#f28d1a' }} />;
      case 'Moeda': return <Coins size={20} style={{ color: '#f28d1a' }} />;
      default: return <Sparkles size={20} style={{ color: '#f28d1a' }} />;
    }
  };

  // Local navigation state for client details
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Location pop-up and shipping recalculation states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [cepLocation, setCepLocation] = useState('');
  const [shippingFactor, setShippingFactor] = useState(1.0);

  // Checkout variables
  const [couponCode, setCouponCode] = useState('');
  const [useCoins, setUseCoins] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [placedOrderId, setPlacedOrderId] = useState(null);
  
  // Service scheduling
  const [serviceHours, setServiceHours] = useState(2);
  const [serviceDate, setServiceDate] = useState('2026-06-15');
  const [serviceTime, setServiceTime] = useState('14:00');
  const [serviceNotes, setServiceNotes] = useState('');

  // Event buying
  const [ticketQty, setTicketQty] = useState(1);
  const [commissionerCode, setCommissionerCode] = useState('');
  const [selectedServiceIdForHire, setSelectedServiceIdForHire] = useState(null);

  // ForYou state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef(null);
  const touchStartYRef = useRef(0);
  const mouseDownYRef = useRef(0);
  const [videoLikes, setVideoLikes] = useState({});
  const [likedVideoIds, setLikedVideoIds] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showVideoComments, setShowVideoComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [followingIds, setFollowingIds] = useState([]);
  const [forYouTab, setForYouTab] = useState('foryou');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState('Todos');
  const [toastMessage, setToastMessage] = useState('');
  const [activeStorePage, setActiveStorePage] = useState(0);

  // Detail View Thumbnail states
  const [activeProductImageIdx, setActiveProductImageIdx] = useState(0);
  const [activeEventImageIdx, setActiveEventImageIdx] = useState(0);
  const [activeServiceImageIdx, setActiveServiceImageIdx] = useState(0);

  // Variation and Rating states
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [ratingProductId, setRatingProductId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Checkout states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [tempCep, setTempCep] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutCpf, setCheckoutCpf] = useState('');
  const [shippingType, setShippingType] = useState('motoboy');
  const [couponApplied, setCouponApplied] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState('pix');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardInstallments, setCardInstallments] = useState('1');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrNumber, setAddrNumber] = useState('');
  const [addrNeighborhood, setAddrNeighborhood] = useState('');
  const [addrComplement, setAddrComplement] = useState('');
  const [addrDetails, setAddrDetails] = useState('');
  const [paymentModalType, setPaymentModalType] = useState('product');
  const [couponError, setCouponError] = useState('');

  // nearbyStores are now dynamically loaded from users with role 'seller'
  const nearbyStores = users.filter(u => u.role === 'seller' || u.role === 'provider' || u.role === 'organizer').map(u => ({
    id: u.id,
    name: u.name || u.companyName || 'Loja',
    desc: u.role === 'seller' ? (u.description || 'Loja Parceira').substring(0, 40) : u.role === 'provider' ? (u.serviceCategory || 'Prestador') : 'Organizador de Eventos',
    rating: 4.8,
    distance: '',
    time: '',
    shipping: 0,
    logo: u.avatar || u.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  }));

  // --- HOISTED CHECKOUT & PAYMENT LOGIC ---
  const getEventTotal = () => {
    const ev = events.find(e => e.id === selectedEventId);
    if (!ev) return 0;
    const availableBatch = ev.batches.findIndex(b => b.sold < b.limit);
    const activeBatch = availableBatch !== -1 ? ev.batches[availableBatch] : null;
    if (!activeBatch) return 0;
    return activeBatch.price * ticketQty;
  };

  const getServiceTotal = () => {
    const serv = services.find(s => s.id === selectedServiceIdForHire);
    if (!serv) return 0;
    return serv.pricePerHour * serviceHours;
  };

  const calculateOuroCoinsDiscount = (subtotalVal, discountVal = 0) => {
    if (!useCoins || !currentUser?.ouroCoins) return { coinsUsed: 0, coinDiscount: 0 };
    const dailyUsed = getCoinsUsedInPeriod ? getCoinsUsedInPeriod(1) : 0;
    const weeklyUsed = getCoinsUsedInPeriod ? getCoinsUsedInPeriod(7) : 0;
    const dailyRemaining = Math.max(0, 10000 - dailyUsed);
    const weeklyRemaining = Math.max(0, 30000 - weeklyUsed);
    
    let maxCoinsAllowed = Math.min(currentUser.ouroCoins, dailyRemaining, weeklyRemaining);
    const maxDiscountAllowed = (subtotalVal - discountVal) * 0.25;
    const maxCoinsByDiscount = Math.floor(maxDiscountAllowed / 0.01);
    
    const coinsUsed = Math.min(maxCoinsAllowed, maxCoinsByDiscount);
    const coinDiscount = coinsUsed * 0.01;
    return { coinsUsed, coinDiscount };
  };

  const getModalTotal = () => {
    let subtotal = 0;
    let shipping = 0;
    let discount = 0;

    if (paymentModalType === 'event') {
      subtotal = getEventTotal();
    } else if (paymentModalType === 'service') {
      subtotal = getServiceTotal();
    } else {
      // Product Cart Total calculation
      const prodSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      shipping = cart.reduce((acc, item) => acc + (item.product.shippingPrice * shippingFactor), 0);
      const finalShipping = shippingType === 'motoboy' ? shipping : 0;
      subtotal = prodSubtotal + finalShipping;

      if (couponApplied) {
        const cp = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
        if (cp && prodSubtotal >= cp.minPurchase) {
          if (cp.discountType === 'fixed') {
            discount = cp.value;
          } else {
            discount = (prodSubtotal * cp.value) / 100;
          }
        }
      }
    }

    let coinDiscount = 0;
    if (useCoins && currentUser?.ouroCoins) {
      const baseVal = (paymentModalType === 'event' || paymentModalType === 'service')
        ? subtotal
        : cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      const couponDisc = (paymentModalType === 'event' || paymentModalType === 'service')
        ? 0
        : discount;
      
      const coinsRes = calculateOuroCoinsDiscount(baseVal, couponDisc);
      coinDiscount = coinsRes.coinDiscount;
    }

    return Math.max(0, subtotal - discount - coinDiscount);
  };

  const handlePlaceOrderSubmit = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = cart.reduce((acc, item) => acc + (item.product.shippingPrice * shippingFactor), 0);
    const finalShipping = shippingType === 'motoboy' ? shipping : 0;

    if (currentUser) {
      updateUserProfile(currentUser.id, { 
        phone: checkoutPhone,
        cpf: checkoutCpf,
        address: currentUser.address || userLocation
      });
    }
    const res = placeOrder(activePaymentTab, couponApplied ? couponCode : '', useCoins, finalShipping, shippingType);
    if (res.success) {
      setPlacedOrderId(res.order.id);
      setShowPaymentModal(false);
      onSwitchView('client_payment_success');
    } else {
      alert(res.message);
    }
  };

  const handleBuyTicketSubmit = () => {
    const ev = events.find(e => e.id === selectedEventId);
    if (!ev) return;
    const availableBatch = ev.batches.findIndex(b => b.sold < b.limit);
    if (availableBatch === -1) return;
    const res = buyTicket(ev.id, availableBatch, ticketQty, commissionerCode, useCoins);
    if (res.success) {
      setPlacedOrderId(res.order.id);
      setShowPaymentModal(false);
      onSwitchView('client_payment_success');
    } else {
      alert(res.message);
    }
  };

  const handleHiringSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const serv = services.find(s => s.id === selectedServiceIdForHire);
    if (!serv) return;
    const res = hireServiceProvider(serv.id, serviceHours, serviceDate, serviceTime, serviceNotes, useCoins);
    if (res.success) {
      setPlacedOrderId(res.hiring.id);
      setShowPaymentModal(false);
      onSwitchView('client_payment_success');
    } else {
      alert(res.message);
    }
  };

  const handlePreHiringSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isVisitor) {
      onTriggerLogin();
      return;
    }
    if (!serviceDate || !serviceTime) {
      alert('Por favor, escolha a data e o horário para o agendamento!');
      return;
    }
    setPreCheckoutType('service');
    setPreCheckoutName(currentUser?.name || '');
    setPreCheckoutPhone(currentUser?.phone || '');
    setPreCheckoutCpf(currentUser?.cpf || '');
    setShowPreCheckoutModal(true);
  };

  const handlePaymentSubmit = () => {
    if (paymentModalType === 'event') {
      handleBuyTicketSubmit();
    } else if (paymentModalType === 'service') {
      handleHiringSubmit();
    } else {
      handlePlaceOrderSubmit();
    }
  };

  useEffect(() => {
    if (currentUser) {
      setCheckoutPhone(currentUser.phone || '');
      setCheckoutCpf(currentUser.cpf || '123.456.789-00');
      setTempAddress(currentUser.address || userLocation);
    } else {
      setCheckoutPhone('(31) 98888-7777');
      setCheckoutCpf('123.456.789-00');
      setTempAddress(userLocation);
    }
  }, [currentUser, userLocation]);

  useEffect(() => {
    const el = document.querySelector('.device-content');
    if (showAddressModal || showPaymentModal) {
      if (el) el.style.overflowY = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      if (el) el.style.overflowY = 'auto';
      document.body.style.overflow = '';
    }
    return () => {
      if (el) el.style.overflowY = 'auto';
      document.body.style.overflow = '';
    };
  }, [showAddressModal, showPaymentModal]);

  useEffect(() => {
    setActiveProductImageIdx(0);
    setSelectedVariation(null);
  }, [selectedProductId]);

  useEffect(() => {
    setActiveEventImageIdx(0);
    setIsEventDescExpanded(false);
  }, [selectedEventId]);

  useEffect(() => {
    setActiveServiceImageIdx(0);
    setIsServiceDescExpanded(false);
  }, [selectedServiceIdForHire]);

  useEffect(() => {
    // Scroll the main content container to the top when navigating
    const scrollContainer = document.querySelector('.custom-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [currentView, selectedProductId, selectedEventId, selectedServiceIdForHire]);

  useEffect(() => {
    if (currentView === 'client_foryou' && videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.play().catch(err => console.log("Video play interrupted or muted: ", err));
      } else {
        videoRef.current.pause();
      }
    } else if (currentView !== 'client_foryou' && videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentView, isVideoPlaying, currentVideoIndex, forYouTab]);

  // Profile management states
  const [selectedProfileUserId, setSelectedProfileUserId] = useState(null);
  const [profileSubSection, setProfileSubSection] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const userReviews = productReviews?.filter(r => r.userName === currentUser?.name).map(r => {
    const product = products.find(p => p.id === r.productId);
    return {
      id: r.id,
      itemName: product ? product.name : (r.productId === 'prod2' ? 'Goiabada Cascão de Ouro Preto' : 'Produto Desconhecido'),
      rating: r.rating,
      date: r.date,
      comment: r.comment,
      images: r.images
    };
  }) || [];

  const [reviewImages, setReviewImages] = useState([]);
  const [isEventDescExpanded, setIsEventDescExpanded] = useState(false);
  const [isServiceDescExpanded, setIsServiceDescExpanded] = useState(false);
  const [showPreCheckoutModal, setShowPreCheckoutModal] = useState(false);
  const [preCheckoutType, setPreCheckoutType] = useState('');
  const [preCheckoutName, setPreCheckoutName] = useState('');
  const [preCheckoutPhone, setPreCheckoutPhone] = useState('');
  const [preCheckoutCpf, setPreCheckoutCpf] = useState('');

  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleAddToCart = (product, variation = null) => {
    addToCart(product, variation);
    triggerToast(`"${product.name}" adicionado ao carrinho!`);
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

  const handleStoreScroll = (e) => {
    const container = e.currentTarget;
    const pageIndex = Math.round(container.scrollLeft / (container.clientWidth * 0.85));
    setActiveStorePage(Math.max(0, Math.min(3, pageIndex)));
  };

  const toggleFollow = (id, e) => {
    if (e) e.stopPropagation();
    setFollowingIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const [videoCommentsList, setVideoCommentsList] = useState({
    vid1: [
      { name: 'Juliana S.', text: 'Nossa, que caneca perfeita! Quero uma!' },
      { name: 'Lucas B.', text: 'Comprei e a qualidade é sensacional.' }
    ],
    vid2: [
      { name: 'Mariana P.', text: 'O festival do ano passado foi incrível!' },
      { name: 'Pedro H.', text: 'Confirmadíssimo no 2º lote uai!' }
    ],
    vid3: [
      { name: 'Mateus O.', text: 'Excelente passeio histórico. Super recomendo a Ana Cláudia!' }
    ]
  });

  // Reset profile selection when leaving the profile tab
  useEffect(() => {
    if (currentView !== 'client_profile') {
      setSelectedProfileUserId(null);
      setProfileSubSection(null);
    }
  }, [currentView]);

  // Countdown timer for Flash Deals (24h countdown restarting at midnight)
  const [countdown, setCountdown] = useState('23:59:59');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hours = 23 - now.getHours();
      const minutes = 59 - now.getMinutes();
      const seconds = 59 - now.getSeconds();
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helpers
  const handleProductClick = (id) => {
    setSelectedProductId(id);
    onSwitchView('client_product');
  };

  const handleFavoriteToggle = (id, e) => {
    e.stopPropagation();
    if (isVisitor) {
      onTriggerLogin();
      return;
    }
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter products by selected category
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase() && p.active)
    : products.filter(p => p.active);

  // --- SUBVIEW 1: CLIENT HOME ---
  const renderHome = () => {
    const activeBanner = visualLayoutSettings?.homeBanner || {
      title: 'Artesanato & Tradição',
      desc: 'Peças em Pedra-Sabão direto de Ouro Preto',
      img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
      link: 'Artesanato'
    };

    // Top buyers dynamically from users with most orders
    const clientUsers = users.filter(u => u.role === 'client');
    const topBuyers = clientUsers
      .map(u => {
        const userOrders = orders.filter(o => o.customerId === u.id && o.type !== 'ticket');
        return {
          id: u.id,
          rank: 0,
          name: currentUser && u.id === currentUser.id ? `${u.name} (Você)` : u.name,
          orders: userOrders.length,
          coins: u.ouroCoins || 0,
          avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'
        };
      })
      .sort((a, b) => b.orders - a.orders || b.coins - a.coins)
      .slice(0, 5)
      .map((b, i) => ({ ...b, rank: i + 1 }));

    const section_banner = (
      <SectionWrapper key="banner" sectionId="banner">
        {/* Carousel Banner */}
        <div style={{
          width: '100%',
          height: '140px',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(242,141,26,0.06)'
        }}>
          <img 
            src={activeBanner.img} 
            alt={activeBanner.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '20px',
            color: 'white'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#f9bb1a' }}>{activeBanner.title}</h3>
            <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.9, maxWidth: '60%' }}>{activeBanner.desc}</p>
            <button
              onClick={() => {
                const linkVal = activeBanner.link || 'Artesanato';
                if (linkVal === 'lojas' || linkVal === 'servicos' || linkVal === 'eventos') {
                  // Direct tab redirect
                  setSelectedCategory('Todos');
                  if (linkVal === 'lojas') onSwitchView('client_home');
                  else onSwitchView('client_categories'); // Or appropriate view
                } else {
                  setSelectedCategory(linkVal);
                  onSwitchView('client_categories');
                }
              }}
              style={{
                marginTop: '10px',
                padding: '4px 12px',
                borderRadius: '99px',
                backgroundColor: 'white',
                color: '#f28d1a',
                border: 'none',
                fontWeight: 500,
                fontSize: '0.68rem',
                width: 'fit-content',
                cursor: 'pointer'
              }}
            >
              Ver Mais
            </button>
          </div>
        </div>
      </SectionWrapper>
    );

    const section_categories = (
      <SectionWrapper key="categories" sectionId="categories">
        {/* Categories Quick Filter with Dot Indicators */}
        {(() => {
          const homeCategories = [
            { label: 'Tudo', key: null },
            ...categories.filter(c => c.active !== false).map(c => ({ label: c.label, key: c.key || c.label })),
            { label: 'Moeda Local', key: 'Moeda' }
          ];
          const itemsPerPage = 5;
          const totalPages = Math.ceil(homeCategories.length / itemsPerPage);
          return (
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '14px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                className="hide-scrollbar"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {homeCategories.map(cat => (
                  <button
                    key={cat.label}
                    onClick={(e) => {
                      const container = e.currentTarget.parentElement;
                      if (container && container.dataset.hasDragged === 'true') {
                        container.dataset.hasDragged = 'false';
                        return;
                      }
                      if (cat.key === 'Eventos') {
                        const el = document.getElementById('events-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else if (cat.key === 'Serviços') {
                        const el = document.getElementById('services-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else if (cat.key === 'Moeda') {
                        onSwitchView('client_ourocoins');
                      } else {
                        setSelectedCategory(cat.key);
                        onSwitchView('client_categories');
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                      scrollSnapAlign: 'start',
                      width: '64px'
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '16px',
                      backgroundColor: '#fff9ee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(242,141,26,0.04)',
                      transition: 'transform 0.2s'
                    }}>
                      {renderCategoryIcon(cat.key || 'Tudo')}
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#666', textAlign: 'center', whiteSpace: 'nowrap' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Dot Indicators */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: i === 0 ? '#f28d1a' : '#e0e0e0',
                      transition: 'background-color 0.3s'
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })()}
      </SectionWrapper>
    );

    const section_flashDeals = (
      <SectionWrapper key="flashDeals" sectionId="flashDeals">
        {/* SECTION: Ofertas Relampago */}
        <div style={{
          background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
          borderRadius: '24px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(242, 141, 26, 0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={18} style={{ color: '#ffffff' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#ffffff' }}>Ofertas Relampago</h3>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 500,
              padding: '4px 12px',
              borderRadius: '99px'
            }}>
              <Clock size={12} style={{ color: '#ffffff' }} />
              <span>{countdown}</span>
            </div>
          </div>

          {/* Flash Deals Horizontal Scroller */}
          <div 
            style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '2px' }} 
            className="custom-scroll"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {products.filter(p => p.inFlashDeal && p.active).map(prod => {
              const discountPercent = prod.flashDealDiscount || Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
              const limit = prod.flashDealLimit || 10;
              const sold = prod.flashDealSold || 0;
              const soldPercentage = Math.round((sold / limit) * 100) || 0;
              const restam = Math.max(0, limit - sold);
              return (
                <div
                  key={prod.id}
                  onClick={(e) => {
                    const container = e.currentTarget.parentElement;
                    if (container && container.dataset.hasDragged === 'true') {
                      container.dataset.hasDragged = 'false';
                      return;
                    }
                    handleProductClick(prod.id);
                  }}
                  style={{
                    width: '165px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    {/* % tag */}
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: '#ff5e5b',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      zIndex: 2
                    }}>
                      {discountPercent}%
                    </span>
                    
                    {/* Fav btn */}
                    <button
                      onClick={(e) => handleFavoriteToggle(prod.id, e)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                    >
                      <Heart 
                        size={13} 
                        className={favorites.includes(prod.id) ? 'heart-active' : ''}
                        style={{ 
                          fill: favorites.includes(prod.id) ? '#f9bb1a' : 'none', 
                          color: favorites.includes(prod.id) ? '#f9bb1a' : '#999',
                          transition: 'transform 0.2s ease-in-out'
                        }} 
                      />
                    </button>

                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }}
                    />
                    <div style={{ 
                      fontSize: '0.68rem', 
                      color: '#999', 
                      margin: '2px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{prod.storeName}</div>
                    
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: '#2d2d2d',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {prod.name}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                      {isVisitor ? (
                        <span style={{ fontSize: '0.78rem', color: '#ff5e5b' }}>Bloqueado</span>
                      ) : (
                        <>
                          <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f28d1a' }}>R$ {prod.price.toFixed(2)}</span>
                          {prod.originalPrice && <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {prod.originalPrice.toFixed(2)}</span>}
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>
                      {sold} vendidos
                    </div>

                    {/* Progressive Stock bar */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#888', marginBottom: '2px' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>{soldPercentage}% vendidos</span>
                        <span style={{ whiteSpace: 'nowrap', paddingLeft: '4px' }}>{restam} restam</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${soldPercentage}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = e.currentTarget.parentElement.parentElement;
                      if (container && container.dataset.hasDragged === 'true') {
                        container.dataset.hasDragged = 'false';
                        return;
                      }
                      handleAddToCart(prod);
                    }}
                    style={{
                      marginTop: '12px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease-in-out'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    <ShoppingCart size={12} />
                    adicionar
                  </button>
                </div>
              );
            })}
          </div>

          {/* Button to see all offers */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
            <button
              onClick={() => {
                onSwitchView('client_all_offers');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.28)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
            >
              ver todas as ofertas
            </button>
          </div>
        </div>
      </SectionWrapper>
    );

    const section_nearbyStores = (
      <SectionWrapper key="nearbyStores" sectionId="nearbyStores">
        {/* SECTION: Lojas Perto de Você */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
            <EditableText textId="home_nearby_stores_title" defaultText="Lojas Perto de Você" />
          </h3>
          
          {/* Carousel: 2 rows grid, scroll horizontal */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateRows: 'auto auto', 
              gridAutoFlow: 'column',
              gridAutoColumns: '85%',
              gap: '10px', 
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }} 
            className="hide-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onScroll={handleStoreScroll}
          >
            {nearbyStores.map(store => (
              <div
                key={store.id}
                onClick={() => { setSelectedStoreId(store.id); onSwitchView('client_store'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  minWidth: 0
                }}
              >
                <img 
                  src={store.logo} 
                  alt={store.name} 
                  style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.desc}</div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.68rem', color: '#666', marginTop: '4px', fontWeight: 500, alignItems: 'center' }}>
                    <span style={{ color: '#f9bb1a', display: 'flex', alignItems: 'center', gap: '2px' }}><Star size={12} fill="#f9bb1a" color="#f9bb1a" /> {store.rating}</span>
                    <span>• {store.distance}</span>
                    <span>• {store.time}</span>
                    <span style={{ color: '#f28d1a' }}>R$ {(store.shipping * shippingFactor).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators para Lojas */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: activeStorePage === i ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '99px',
                  backgroundColor: activeStorePage === i ? '#f28d1a' : '#e0e0e0',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>
      </SectionWrapper>
    );

    const section_products = (
      <SectionWrapper key="products" sectionId="products">
        {/* SECTION: Produtos para Você */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
            Produtos para Você
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {products.filter(p => p.active).map(prod => {
              const hasDiscount = prod.originalPrice && prod.price < prod.originalPrice;
              const discountPercent = hasDiscount ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) : 0;
              return (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '8px',
                    border: '1px solid #eee',
                    cursor: 'pointer',
                    position: 'relative',
                    minWidth: 0
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
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      zIndex: 2
                    }}>
                      {discountPercent}%
                    </span>
                  )}
                  <button
                    onClick={(e) => handleFavoriteToggle(prod.id, e)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                  >
                    <Heart 
                      size={13} 
                      className={favorites.includes(prod.id) ? 'heart-active' : ''}
                      style={{ 
                        fill: favorites.includes(prod.id) ? '#f9bb1a' : 'none', 
                        color: favorites.includes(prod.id) ? '#f9bb1a' : '#999',
                        transition: 'transform 0.2s ease-in-out'
                      }} 
                    />
                  </button>
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }}
                  />
                  <h4 style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 500, 
                    color: '#2d2d2d', 
                    margin: 0, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }}>
                    {prod.name}
                  </h4>
                  <span style={{ fontSize: '0.68rem', color: '#999' }}>{prod.storeName}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                    {isVisitor ? (
                      <span style={{ fontSize: '0.78rem', color: '#ff5e5b' }}>Bloqueado</span>
                    ) : (
                      <>
                        <strong style={{ fontSize: '0.82rem', fontWeight: 500, color: '#f28d1a' }}>R$ {prod.price.toFixed(2)}</strong>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {prod.originalPrice.toFixed(2)}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                    {prod.soldCount || 0} vendidos
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>
    );

    const section_buyers = (
      <SectionWrapper key="buyers" sectionId="buyers">
        {/* SECTION: Top Compradores do Mês (Ranking 1 a 5) */}
        <div style={{
          background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
          borderRadius: '24px',
          padding: '16px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(242, 141, 26, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Award size={18} style={{ color: '#ffffff' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#ffffff' }}><EditableText textId="home_buyers_title" defaultText="Top Compradores do Mês" /></h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', marginBottom: '12px', fontStyle: 'italic' }}>
            <EditableText textId="home_buyers_subtitle" defaultText="Quem compra de comércio local apoia Ouro Preto! Veja o ranking de recompensas:" />
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topBuyers.map(buyer => (
              <div
                key={buyer.rank}
                onClick={() => {
                  setSelectedProfileUserId(buyer.id);
                  setProfileSubSection(null);
                  onSwitchView('client_profile');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: buyer.rank <= 2 ? '#f28d1a' : '#888',
                  width: '20px'
                }}>
                  #{buyer.rank}
                </span>
                <img 
                  src={buyer.avatar} 
                  alt={buyer.name} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', flex: 1 }}>{buyer.name}</span>
                <div style={{ textAlign: 'right', fontSize: '0.68rem', color: '#666' }}>
                  <div><strong>{buyer.orders}</strong> pedidos</div>
                  <div style={{ color: '#f28d1a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}><Coins size={11} /> {buyer.coins} coins</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    );

    const section_events = (
      <SectionWrapper key="events" sectionId="events">
        {/* SECTION: Eventos da Cidade */}
        <div id="events-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
            <EditableText textId="home_events_title" defaultText="Eventos e Festas na Cidade" />
          </h3>
          {events.map(ev => {
            const activeBatch = ev.batches ? ev.batches.find(b => b.sold < b.limit) || ev.batches[ev.batches.length - 1] : null;
            const isSoldOut = !ev.batches || !ev.batches.some(b => b.sold < b.limit);
            const percent = activeBatch ? Math.round((activeBatch.sold / activeBatch.limit) * 100) : 0;
            return (
              <div
                key={ev.id}
                onClick={() => { setSelectedEventId(ev.id); onSwitchView('client_event'); }}
                style={{
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  padding: '10px',
                  position: 'relative',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  marginBottom: '14px'
                }}
              >
                <img 
                  src={ev.image} 
                  alt={ev.name} 
                  style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }}
                />
                <div style={{ padding: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>{ev.date}</span>
                  </div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</h4>
                  <div style={{ fontSize: '0.72rem', color: '#777' }}>Local: {ev.location}</div>
                  <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '2px' }}>Organizador: {ev.organizerName}</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #f9f9f9', paddingTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#888' }}>Ingressos por Lote ({activeBatch?.name || 'Lote'})</span>
                    <strong style={{ fontSize: '0.82rem', color: isVisitor ? '#ff5e5b' : '#f28d1a', fontWeight: 500 }}>
                      {isVisitor ? 'Bloqueado' : (isSoldOut ? 'Esgotado' : `R$ ${activeBatch.price.toFixed(2)}`)}
                    </strong>
                  </div>

                  {activeBatch && (
                    <div style={{ marginTop: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#777', marginBottom: '2px' }}>
                        <span>Progresso do lote:</span>
                        <span>{percent}% ({activeBatch.sold}/{activeBatch.limit})</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', backgroundColor: '#eee', borderRadius: '2.5px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2.5px' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>
    );

    const section_services = (
      <SectionWrapper key="services" sectionId="services">
        {/* SECTION: Serviços em Destaque */}
        <div id="services-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
            <EditableText textId="home_services_title" defaultText="Serviços em Destaque" />
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {services.map(serv => {
              const hasDiscount = serv.originalPrice && serv.pricePerHour < serv.originalPrice;
              const discountPercent = hasDiscount ? Math.round(((serv.originalPrice - serv.pricePerHour) / serv.originalPrice) * 100) : 0;
              return (
                <div
                  key={serv.id}
                  onClick={() => { setSelectedServiceIdForHire(serv.id); setSelectedProviderId(serv.providerId); onSwitchView('client_service'); }}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '16px',
                    padding: '8px',
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    minWidth: 0
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
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      zIndex: 2
                    }}>
                      {discountPercent}%
                    </span>
                  )}
                  <img 
                    src={serv.image} 
                    alt={serv.name} 
                    style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }}
                  />
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#2d2d2d', margin: 0 }}>{serv.name}</h4>
                  <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{serv.category}</div>
                  <div style={{ fontSize: '0.65rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Profissional: {serv.providerName}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                    {isVisitor ? (
                      <span style={{ fontSize: '0.75rem', color: '#ff5e5b' }}>Bloqueado</span>
                    ) : (
                      <>
                        <strong style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 500 }}>R$ {serv.pricePerHour.toFixed(2)}/h</strong>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {serv.originalPrice.toFixed(2)}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                    {serv.completedCount || 0} serviços realizados
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>
    );

    const sectionsMap = {
      banner: section_banner,
      categories: section_categories,
      flashDeals: section_flashDeals,
      nearbyStores: section_nearbyStores,
      products: section_products,
      buyers: section_buyers,
      events: section_events,
      services: section_services
    };

    return (
      <div style={{ padding: '16px', paddingBottom: '90px', overflowX: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Localization & Header Actions */}
        <div className="mobile-home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div 
            onClick={() => setShowLocationModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <MapPin size={18} style={{ color: '#f28d1a' }} />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 600 }}>Entregar em</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d', borderBottom: '1px dashed #f28d1a' }}>{userLocation.split(',')[0]}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => isVisitor ? onTriggerLogin() : onSwitchView('client_coupons')}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid #eaeaea',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Ticket size={16} style={{ color: '#f28d1a' }} />
            </button>
            <button 
              onClick={() => isVisitor ? onTriggerLogin() : onSwitchView('client_cart')}
              style={{
                position: 'relative',
                background: '#ffffff',
                border: '1px solid #eaeaea',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ShoppingCart size={16} style={{ color: '#f28d1a' }} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ff5e5b',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Welcome Text & Coupons Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            {isVisitor ? (
              <>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d2d2d' }}>
                  <EditableText textId="home_visitor" defaultText="olá, visitante!" />
                </h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button 
                    onClick={onTriggerLogin} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#f28d1a', 
                      fontSize: '0.78rem', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Entre ou Cadastre-se
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2d2d2d' }}>
                  olá, <EditableText textId="home_username" defaultText={currentUser ? currentUser.name.split(' ')[0] : 'lindeza'} />!
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                  <EditableText textId="home_subtitle" defaultText="Bora achar uns trem bão hoje?" />
                </p>
              </>
            )}
          </div>
          <button
            onClick={() => isVisitor ? onTriggerLogin() : onSwitchView('client_ourocoins')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(242,141,26,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Coins size={14} /> {isVisitor ? '0' : (currentUser?.ouroCoins || 0)} Coins
          </button>
        </div>

        {/* Renderização Reordenável */}
        {(visualLayoutSettings?.sectionOrder || ['banner', 'categories', 'flashDeals', 'nearbyStores', 'products', 'buyers', 'events', 'services']).map(secId => sectionsMap[secId])}
      </div>
    );
  };

  // --- SUBVIEW 2: PRODUCT DETAIL ---
  const renderProductDetail = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return <div>Produto sumiu uai...</div>;

    const coinsEarned = Math.round(prod.price * 0.5);
    const images = [
      prod.image,
      prod.image.includes('?') ? `${prod.image}&v=1` : `${prod.image}?v=1`,
      prod.image.includes('?') ? `${prod.image}&v=2` : `${prod.image}?v=2`,
      prod.image.includes('?') ? `${prod.image}&v=3` : `${prod.image}?v=3`,
      prod.image.includes('?') ? `${prod.image}&v=4` : `${prod.image}?v=4`,
      prod.image.includes('?') ? `${prod.image}&v=5` : `${prod.image}?v=5`,
      prod.image.includes('?') ? `${prod.image}&v=6` : `${prod.image}?v=6`,
      prod.image.includes('?') ? `${prod.image}&v=7` : `${prod.image}?v=7`,
      prod.image.includes('?') ? `${prod.image}&v=8` : `${prod.image}?v=8`,
      prod.image.includes('?') ? `${prod.image}&v=9` : `${prod.image}?v=9`,
    ];

    // Parse specifications
    const specList = [];
    if (typeof prod.specifications === 'string' && prod.specifications.trim()) {
      prod.specifications.split(',').forEach(s => {
        const parts = s.split(':');
        if (parts.length >= 2) {
          specList.push({
            key: parts[0].trim(),
            value: parts.slice(1).join(':').trim()
          });
        }
      });
    } else if (Array.isArray(prod.specifications)) {
      specList.push(...prod.specifications);
    }

    // Filter reviews
    const reviews = productReviews?.filter(r => r.productId === prod.id) || [];

    return (
      <div style={{ backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }} className="animate-fade-in">
        {/* Scrollable Content wrapper */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '90px' }} className="custom-scroll">
          {/* Cover gallery 1:1 with horizontal scroll snap */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#eee', overflow: 'hidden' }}>
            <div 
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft;
                const width = e.target.clientWidth;
                if (width > 0) {
                  const activeIdx = Math.round(scrollLeft / width);
                  setActiveProductImageIdx(activeIdx);
                }
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
              }}
              className="custom-scroll-hidden"
            >
              {images.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  style={{
                    flexShrink: 0,
                    width: '100%',
                    height: '100%',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <img 
                    src={imgUrl} 
                    alt={prod.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </div>

            {/* Back Button */}
            <button 
              onClick={() => onSwitchView('client_home')}
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                zIndex: 2
              }}
            >
              <ArrowLeft size={20} style={{ color: '#2d2d2d' }} />
            </button>

            {/* Carousel Indicator 1/10 */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 500,
              zIndex: 3
            }}>
              {(activeProductImageIdx % images.length) + 1}/{images.length}
            </div>
          </div>

          {/* Info grid block below the image */}
          <div style={{ padding: '20px 20px 0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              {/* Left Column */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Category & Coins Badges */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    backgroundColor: '#f9bb1a20',
                    color: '#d4730d',
                    padding: '2px 10px',
                    borderRadius: '99px',
                    fontWeight: 400
                  }}>{prod.category}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#f28d1a', fontWeight: 400 }}>
                    <Sparkles size={12} />
                    <span>Ganha +{coinsEarned} OuroCoins</span>
                  </div>
                </div>

                {/* Product Name */}
                <h2 style={{ fontSize: '1.25rem', fontWeight: 450, color: '#2d2d2d', margin: '0 0 6px 0', lineHeight: 1.25 }}>
                  <EditableText textId={`prod_${prod.id}_name`} defaultText={prod.name} />
                </h2>

                {/* Price / Price strike / % Discount */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {isVisitor ? (
                    <span style={{ fontSize: '0.82rem', color: '#ff5e5b' }}>Valor bloqueado - Entre ou cadastre-se</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.4rem', fontWeight: 400, color: '#f28d1a' }}>R$ {prod.price.toFixed(2)}</span>
                      {prod.originalPrice && (
                        <>
                          <span style={{ fontSize: '0.9rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {prod.originalPrice.toFixed(2)}</span>
                          {(() => {
                            const discount = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
                            return (
                              <span style={{ fontSize: '0.72rem', backgroundColor: '#ff5e5b20', color: '#ff5e5b', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                                {discount}% OFF
                              </span>
                            );
                          })()}
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Installments info (up to 5x) */}
                {!isVisitor && (
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '4px' }}>
                    ou em até 5x de R$ {(prod.price / 5).toFixed(2)} sem juros
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                <div style={{ fontSize: '0.82rem', color: '#888', whiteSpace: 'nowrap' }}>
                  {prod.soldCount || 0} vendidos
                </div>
                
                {/* Favorite Button */}
                <button 
                  onClick={(e) => handleFavoriteToggle(prod.id, e)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #eee',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <Heart size={20} style={{ fill: favorites.includes(prod.id) ? '#ff5e5b' : 'none', color: favorites.includes(prod.id) ? '#ff5e5b' : '#999' }} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 20px 20px' }}>
            {/* Description clamped to 2 lines by default */}
            <div style={{ margin: '14px 0 16px 0', borderTop: '1px solid #eee', paddingTop: '14px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 450, color: '#2d2d2d', marginBottom: '4px', marginTop: 0 }}>Sobre este trem:</h4>
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#666', 
                lineHeight: 1.4,
                margin: 0,
                ...(!descExpanded ? {
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                } : {})
              }}>
                <EditableText textId={`prod_${prod.id}_desc`} defaultText={prod.description} />
              </p>
              {prod.description && prod.description.length > 80 && (
                <button 
                  onClick={() => setDescExpanded(!descExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f28d1a',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '4px 0',
                    marginTop: '2px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    outline: 'none'
                  }}
                >
                  {descExpanded ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>

            {/* Standardized Store Info */}
            <div 
              onClick={() => { setSelectedStoreId(prod.storeId); onSwitchView('client_store'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                border: '1px solid #eee',
                borderRadius: '16px',
                cursor: 'pointer',
                marginBottom: '16px',
                backgroundColor: '#fafafa'
              }}
            >
              <img 
                src={users?.find(u => u.id === prod.storeId)?.avatar || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100'} 
                alt={prod.storeName}
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.68rem', color: '#888', fontWeight: 400 }}>Vendido por</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 450, color: '#2d2d2d' }}>{prod.storeName}</div>
              </div>
              <ChevronRight size={16} style={{ color: '#aaa' }} />
            </div>

            {/* Variations */}
            {prod.variations && prod.variations.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 450, color: '#2d2d2d', marginBottom: '6px' }}>Selecione a variação:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {prod.variations.map((v, idx) => {
                    const isObject = typeof v === 'object' && v !== null;
                    const varId = isObject ? (v.id || idx) : v;
                    const varText = isObject ? v.text : v;
                    const varImage = isObject ? v.image : null;
                    const isSelected = selectedVariation === varText;

                    return (
                      <button
                        key={varId}
                        onClick={() => setSelectedVariation(varText)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: varImage ? '4px 12px 4px 6px' : '6px 14px',
                          borderRadius: '99px',
                          border: isSelected ? '2px solid #f28d1a' : '1px solid #ddd',
                          backgroundColor: isSelected ? '#fff9ee' : '#ffffff',
                          color: isSelected ? '#f28d1a' : '#555',
                          fontSize: '0.75rem',
                          fontWeight: isSelected ? 500 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                      >
                        {varImage && (
                          <img 
                            src={varImage} 
                            alt={varText} 
                            style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                        )}
                        {varText && <span>{varText}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Reviews */}
            <div style={{ marginBottom: '16px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 450, color: '#2d2d2d', marginBottom: '8px', marginTop: 0 }}>
                Avaliações ({reviews.length})
              </h4>
              {reviews.length === 0 ? (
                <p style={{ fontSize: '0.78rem', color: '#999', margin: 0 }}>Sem avaliações ainda para este produto.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {reviews.map(rev => (
                    <div key={rev.id} style={{ borderBottom: '1px solid #f9f9f9', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 550, color: '#2d2d2d' }}>{rev.userName}</span>
                        <span style={{ fontSize: '0.68rem', color: '#999' }}>{rev.date}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', color: '#f28d1a', fontSize: '0.75rem', marginBottom: '4px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#555', margin: 0, lineHeight: 1.3 }}>{rev.comment}</p>
                      {rev.images && rev.images.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {rev.images.map((img, i) => (
                            <img 
                              key={i} 
                              src={img} 
                              alt={`Foto da avaliação ${i+1}`} 
                              style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #eee' }} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications list (Key-Value style) */}
            {specList.length > 0 && (
              <div style={{ marginBottom: '16px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 450, color: '#2d2d2d', marginBottom: '8px', marginTop: 0 }}>Especificações:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {specList.map((spec, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderBottom: '1px solid #f9f9f9', paddingBottom: '4px' }}>
                      <span style={{ color: '#888', fontWeight: 400 }}>{spec.key}</span>
                      <span style={{ color: '#2d2d2d', fontWeight: 450 }}>{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', borderTop: '1px solid #eee', paddingTop: '12px', marginBottom: '16px' }}>
              <span>Disponíveis em estoque: <span>{prod.stock} un</span></span>
              <span>Taxa do frete: <span style={{ color: '#f28d1a', fontWeight: 450 }}>{isVisitor ? 'Bloqueado' : `R$ ${(prod.shippingPrice * shippingFactor).toFixed(2)}`}</span></span>
            </div>

            {/* Recommended Products Grid */}
            {(() => {
              const recommended = products
                .filter(p => p.id !== prod.id && (p.category === prod.category || p.storeId === prod.storeId))
                .slice(0, 4);
              if (recommended.length === 0) return null;
              return (
                <div style={{ marginBottom: '10px', borderTop: '1px solid #eee', paddingTop: '14px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 450, color: '#2d2d2d', marginBottom: '10px', marginTop: 0 }}>Produtos Recomendados:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
                    {recommended.map(item => {
                      const hasDiscount = item.originalPrice && item.price < item.originalPrice;
                      const discountPercent = hasDiscount ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;
                      return (
                        <div 
                          key={item.id} 
                          onClick={() => { setSelectedProductId(item.id); onSwitchView('client_product'); }}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            padding: '8px',
                            border: '1px solid #eee',
                            cursor: 'pointer',
                            position: 'relative',
                            minWidth: 0
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
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '8px',
                              zIndex: 2
                            }}>
                              {discountPercent}%
                            </span>
                          )}
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }} 
                            draggable="false"
                            onDragStart={(e) => e.preventDefault()}
                          />
                          <h4 style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 500, 
                            color: '#2d2d2d', 
                            margin: 0, 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {item.name}
                          </h4>
                          <div style={{ fontSize: '0.68rem', color: '#999' }}>{item.storeName}</div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                            {isVisitor ? (
                              <span style={{ fontSize: '0.78rem', color: '#ff5e5b' }}>Bloqueado</span>
                            ) : (
                              <>
                                <strong style={{ fontSize: '0.82rem', fontWeight: 500, color: '#f28d1a' }}>R$ {item.price.toFixed(2)}</strong>
                                {hasDiscount && (
                                  <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {item.originalPrice.toFixed(2)}</span>
                                )}
                              </>
                            )}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                            {item.soldCount || 0} vendidos
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Floating action bar fixed at the bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #eaeaea',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
          zIndex: 10
        }}>
          {isVisitor ? (
            <button
              onClick={onTriggerLogin}
              className="btn btn-primary"
              style={{ flex: 1, height: '48px', padding: 0 }}
            >
              Cadastre-se ou Entre para comprar
            </button>
          ) : (
            <>
              {/* Chat icon button */}
              <button
                onClick={() => onOpenChat()}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #eee',
                  backgroundColor: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  outline: 'none'
                }}
                title="Conversar com o vendedor"
              >
                <MessageSquare size={20} style={{ color: '#666' }} />
              </button>

              {/* Add to Cart icon button */}
              <button
                onClick={() => {
                  const targetProd = { ...prod };
                  if (selectedVariation) {
                    targetProd.selectedVariation = selectedVariation;
                  }
                  handleAddToCart(targetProd);
                  triggerToast("Adicionado ao carrinho!");
                }}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #f28d1a',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  outline: 'none'
                }}
                title="Adicionar ao carrinho"
              >
                <ShoppingCart size={20} style={{ color: '#f28d1a' }} />
              </button>
              
              {/* Quero pra mim! full text button */}
              <button
                onClick={() => {
                  const targetProd = { ...prod };
                  if (selectedVariation) {
                    targetProd.selectedVariation = selectedVariation;
                  }
                  handleAddToCart(targetProd);
                  onSwitchView('client_checkout');
                }}
                className="btn btn-primary"
                style={{ flex: 1, height: '48px', padding: 0 }}
              >
                quero pra mim!
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Grouped Categories Constant & Helpers
  const categoriesGrouped = {
    lojas: categories.filter(c => c.type === 'lojas' && c.active !== false).map(c => ({
      label: c.label, key: c.key || c.label, desc: c.desc || '', img: c.image || ''
    })),
    servicos: categories.filter(c => c.type === 'servicos' && c.active !== false).map(c => ({
      label: c.label, key: 'Serviços', desc: c.desc || '', img: c.image || ''
    })),
    eventos: categories.filter(c => c.type === 'eventos' && c.active !== false).map(c => ({
      label: c.label, key: 'Eventos', desc: c.desc || '', img: c.image || ''
    }))
  };

  const handleCategorySelect = (cat) => {
    if (cat.key === 'Eventos') {
      setSelectedCategory(null);
      onSwitchView('client_home');
      setTimeout(() => {
        document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (cat.key === 'Serviços') {
      setSelectedCategory(null);
      onSwitchView('client_home');
      setTimeout(() => {
        document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      setSelectedCategory(cat.key);
      onSwitchView('client_categories');
    }
  };

  const renderCategoryRow = (cat) => (
    <div
      key={cat.label}
      onClick={() => handleCategorySelect(cat)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#ffffff',
        padding: '10px 14px',
        borderRadius: '16px',
        border: '1px solid #eee',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, border-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#f28d1a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#eee';
      }}
    >
      <img
        src={cat.img}
        alt={cat.label}
        style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }}
      />
      <div style={{ flex: 1 }}>
        <h5 style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>{cat.label}</h5>
        <p style={{ fontSize: '0.68rem', color: '#888', margin: '2px 0 0 0' }}>{cat.desc}</p>
      </div>
      <span style={{ fontSize: '0.9rem', color: '#f28d1a', fontWeight: 500 }}>→</span>
    </div>
  );

  const renderGroupedCategoriesList = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Lojas Group */}
        <div>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 500, color: '#f28d1a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Lojas</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoriesGrouped.lojas.map(cat => renderCategoryRow(cat))}
          </div>
        </div>

        {/* Serviços Group */}
        <div>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 500, color: '#f28d1a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '8px' }}>Serviços</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoriesGrouped.servicos.map(cat => renderCategoryRow(cat))}
          </div>
        </div>

        {/* Eventos Group */}
        <div>
          <h4 style={{ fontSize: '0.78rem', fontWeight: 500, color: '#f28d1a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', marginTop: '8px' }}>Eventos</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categoriesGrouped.eventos.map(cat => renderCategoryRow(cat))}
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 3: CLIENT CATEGORIES / FILTER ---
  const renderCategories = () => {
    if (!selectedCategory) {
      return (
        <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <button 
              onClick={() => onSwitchView('client_home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
            >
              <ArrowLeft size={22} />
            </button>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
              Categorias
            </h2>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '12px 14px',
            border: '1px solid #eee',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            marginBottom: '20px'
          }}>
            <Layers size={18} style={{ color: '#888', marginRight: '10px' }} />
            <span style={{ fontSize: '0.9rem', color: '#888' }}>Explorar categorias</span>
          </div>
          
          {renderGroupedCategoriesList()}
        </div>
      );
    }

    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => setSelectedCategory(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
            {selectedCategory}
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Search size={32} style={{ color: '#ccc', marginBottom: '8px' }} />
            <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Nenhum produto cadastrado nessa categoria uai.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {filteredProducts.map(prod => (
              <div
                key={prod.id}
                onClick={() => handleProductClick(prod.id)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  border: '1px solid #f0ebdf',
                  position: 'relative'
                }}
              >
                <button
                  onClick={(e) => handleFavoriteToggle(prod.id, e)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                >
                  <Heart 
                    size={14} 
                    className={favorites.includes(prod.id) ? 'heart-active' : ''}
                    style={{ 
                      fill: favorites.includes(prod.id) ? '#f9bb1a' : 'none', 
                      color: favorites.includes(prod.id) ? '#f9bb1a' : '#999',
                      transition: 'transform 0.2s ease-in-out'
                    }} 
                  />
                </button>

                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '14px', marginBottom: '8px' }}
                />
                <div style={{ fontSize: '0.68rem', color: '#999' }}>{prod.storeName}</div>
                <h4 style={{
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: '#2d2d2d',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: '2px 0'
                }}>{prod.name}</h4>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f28d1a', marginTop: '2px' }}>
                  R$ {prod.price.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>
                  {prod.soldCount || 0} vendidos
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- SUBVIEW 4: STORE PAGE (VER LOJA) ---
  const renderStoreView = () => {
    const storeId = selectedStoreId;
    const mockStore = users.find(u => u.id === storeId);
    if (!mockStore) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }} className="animate-fade-in">
          <p style={{ color: '#999' }}>Loja não encontrada.</p>
          <button onClick={() => onSwitchView('client_home')} className="btn btn-primary" style={{ marginTop: '16px' }}>Voltar</button>
        </div>
      );
    }

    const isFollowingStore = followingIds.includes(mockStore.id);
    const storeCategories = ['Todos'];

    const storeProducts = products.filter(p => p.storeId === mockStore.id);
    const storeProductsFiltered = storeProducts;

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', overflowX: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Cover */}
        <div style={{ width: '100%', aspectRatio: '21/9', position: 'relative', overflow: 'hidden' }}>
          <img src={mockStore.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Profile info */}
        <div style={{ padding: '16px', position: 'relative', borderBottom: '1px solid #eee' }}>
          <img 
            src={mockStore.logo} 
            alt="logo" 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              position: 'absolute',
              top: '-32px',
              left: '16px',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              objectFit: 'cover'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', float: 'right' }}>
            <button
              onClick={(e) => toggleFollow(mockStore.id, e)}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                backgroundColor: isFollowingStore ? '#eaeaea' : '#f28d1a',
                color: isFollowingStore ? '#666' : 'white',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {isFollowingStore ? 'Seguindo' : 'Seguir'}
            </button>
            <button
              onClick={() => onOpenChat()} // open chat room with shop
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                color: '#2d2d2d',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Chat
            </button>
          </div>
          
          <div style={{ marginTop: '36px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2d2d2d' }}>
              <EditableText textId={`store_${mockStore.id}_name`} defaultText={mockStore.name} />
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px' }}>
              {mockStore.category}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px', lineHeight: 1.3 }}>
              <EditableText textId={`store_${mockStore.id}_desc`} defaultText={mockStore.description} />
            </p>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> <strong>Endereço:</strong> {mockStore.address}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Phone size={12} /> <strong>Telefone:</strong> {mockStore.phone}
            </div>
          </div>
        </div>

        {/* Store internal categories */}
        <div 
          style={{ padding: '12px 16px 0 16px', display: 'flex', gap: '8px', overflowX: 'auto' }} 
          className="hide-scrollbar"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {storeCategories.map(cat => (
            <button
              key={cat}
              onClick={(e) => {
                const container = e.currentTarget.parentElement;
                if (container && container.dataset.hasDragged === 'true') {
                  container.dataset.hasDragged = 'false';
                  return;
                }
                setSelectedStoreCategory(cat);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                border: selectedStoreCategory === cat ? 'none' : '1px solid #ddd',
                backgroundColor: selectedStoreCategory === cat ? '#f28d1a' : '#ffffff',
                color: selectedStoreCategory === cat ? 'white' : '#666',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div style={{ padding: '16px', paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2d2d2d', marginBottom: '12px' }}>Produtos da Loja</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {storeProductsFiltered.map(p => {
              const hasDiscount = p.originalPrice && p.price < p.originalPrice;
              const discountPercent = hasDiscount ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
              return (
                <div 
                  key={p.id}
                  onClick={() => handleProductClick(p.id)}
                  style={{
                    border: '1px solid #eee',
                    borderRadius: '16px',
                    padding: '8px',
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    minWidth: 0
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
                      fontWeight: 700,
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
                    {isVisitor ? (
                      <span style={{ fontSize: '0.75rem', color: '#ff5e5b' }}>Bloqueado</span>
                    ) : (
                      <>
                        <strong style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 500 }}>R$ {p.price.toFixed(2)}</strong>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {p.originalPrice.toFixed(2)}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                    {p.soldCount || 0} vendidos
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 5: EVENT DETAIL (VER EVENTO) ---
  const renderEventView = () => {
    const ev = events.find(e => e.id === selectedEventId);
    if (!ev) return <div>Evento sumiu uai...</div>;

    const availableBatch = ev.batches.findIndex(b => b.sold < b.limit);
    const activeBatch = availableBatch !== -1 ? ev.batches[availableBatch] : null;

    const handleBuyTicketSubmit = () => {
      if (!activeBatch) return;
      const res = buyTicket(ev.id, availableBatch, ticketQty, commissionerCode);
      if (res.success) {
        onSwitchView('client_payment_success');
      } else {
        alert(res.message);
      }
    };

    const imgBase = ev.cover || ev.image || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500';
    const images = [
      imgBase,
      imgBase.includes('?') ? `${imgBase}&v=1` : `${imgBase}?v=1`,
      imgBase.includes('?') ? `${imgBase}&v=2` : `${imgBase}?v=2`,
      imgBase.includes('?') ? `${imgBase}&v=3` : `${imgBase}?v=3`,
      imgBase.includes('?') ? `${imgBase}&v=4` : `${imgBase}?v=4`,
      imgBase.includes('?') ? `${imgBase}&v=5` : `${imgBase}?v=5`,
      imgBase.includes('?') ? `${imgBase}&v=6` : `${imgBase}?v=6`,
      imgBase.includes('?') ? `${imgBase}&v=7` : `${imgBase}?v=7`,
      imgBase.includes('?') ? `${imgBase}&v=8` : `${imgBase}?v=8`,
      imgBase.includes('?') ? `${imgBase}&v=9` : `${imgBase}?v=9`,
    ];

    return (
      <div style={{ backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }} className="animate-fade-in">
        {/* Scrollable Container */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '30px' }} className="custom-scroll">
          
          {/* Cover gallery 1:1 with horizontal scroll snap */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#eee', overflow: 'hidden' }}>
            <div 
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft;
                const width = e.target.clientWidth;
                if (width > 0) {
                  const activeIdx = Math.round(scrollLeft / width);
                  setActiveEventImageIdx(activeIdx);
                }
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
              }}
              className="custom-scroll-hidden"
            >
              {images.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  style={{
                    flexShrink: 0,
                    width: '100%',
                    height: '100%',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <img 
                    src={imgUrl} 
                    alt={ev.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </div>

            {/* Back Button */}
            <button 
              onClick={() => onSwitchView('client_home')}
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <ArrowLeft size={16} />
            </button>

            {/* Indicator */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 500,
              zIndex: 3
            }}>
              {(activeEventImageIdx % images.length) + 1}/{images.length}
            </div>
          </div>

          {/* Event Main Info */}
          <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} />
              <span>{ev.date}</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d', margin: '8px 0 4px 0' }}>{ev.name}</h3>
            <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <MapPin size={12} style={{ color: '#aaa' }} />
              <span><strong>Local:</strong> {ev.location}</span>
            </div>

            <div style={{ position: 'relative' }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                marginTop: '10px',
                lineHeight: 1.4,
                display: isEventDescExpanded ? 'block' : '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: isEventDescExpanded ? 'visible' : 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {ev.description || 'Um super evento preparado com todo carinho para agitar a cidade! Venha curtir com a gente.'}
              </p>
              {(ev.description || 'Um super evento preparado com todo carinho para agitar a cidade! Venha curtir com a gente.').length > 90 && (
                <button
                  onClick={() => setIsEventDescExpanded(!isEventDescExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f28d1a',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '2px 0',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'block',
                    marginTop: '4px'
                  }}
                >
                  {isEventDescExpanded ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>

            {/* Organizer Card Link */}
            <div 
              onClick={() => { setSelectedOrganizerId(ev.organizerId || 'e1'); onSwitchView('client_organizer'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                border: '1px solid #eee',
                borderRadius: '16px',
                cursor: 'pointer',
                marginTop: '16px',
                backgroundColor: '#fafafa'
              }}
            >
              <img 
                src={users?.find(u => u.id === ev.organizerId)?.avatar || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100'} 
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.68rem', color: '#888', fontWeight: 400 }}>Organizado por</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 450, color: '#2d2d2d' }}>{ev.organizerName}</div>
              </div>
              <ChevronRight size={16} style={{ color: '#aaa' }} />
            </div>
          </div>

          {/* Tickets Purchase Area */}
          <div style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Ingressos Disponíveis</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {ev.batches.map((b, idx) => {
                const isSoldOut = b.sold >= b.limit;
                const isActive = availableBatch === idx;
                const percent = Math.round((b.sold / b.limit) * 100) || 0;
                return (
                  <div
                    key={b.name}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      backgroundColor: isActive ? '#f9bb1a15' : '#ffffff',
                      border: isActive ? '1px solid #f28d1a' : '1px solid #eee',
                      opacity: isSoldOut ? 0.6 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#2d2d2d' }}>{b.name}</span>
                      <span style={{ fontSize: '0.78rem', color: isSoldOut ? '#999' : (isVisitor ? '#ff5e5b' : '#f28d1a'), fontWeight: 500 }}>
                        {isSoldOut ? 'Esgotado' : (isVisitor ? 'Bloqueado' : `R$ ${b.price.toFixed(2)}`)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#777', marginTop: '2px' }}>
                      <span>Progresso do lote:</span>
                      <span>{percent}% ({b.sold}/{b.limit})</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', backgroundColor: '#eee', borderRadius: '2.5px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2.5px' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {activeBatch && (
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '16px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#666' }}>Quantidade</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => setTicketQty(Math.max(1, ticketQty - 1))}
                      style={{ border: '1px solid #ccc', background: 'white', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{ticketQty}</span>
                    <button 
                      onClick={() => setTicketQty(ticketQty + 1)}
                      style={{ border: '1px solid #ccc', background: 'white', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Cupom e Comissário Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>Cupom de Desconto</label>
                    <input 
                      type="text" 
                      placeholder="Digite o cupom (opcional)" 
                      value={couponCode} 
                      onChange={e => setCouponCode(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.75rem', marginTop: '4px', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>Código do Comissário</label>
                    <input 
                      type="text" 
                      placeholder="Digite o código (opcional)" 
                      value={commissionerCode} 
                      onChange={e => setCommissionerCode(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.75rem', marginTop: '4px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>Total:</span>
                  <span style={{ fontSize: '0.88rem', color: isVisitor ? '#ff5e5b' : '#f28d1a', fontWeight: 500 }}>{isVisitor ? 'Bloqueado' : `R$ ${(activeBatch.price * ticketQty).toFixed(2)}`}</span>
                </div>

                <button
                  onClick={() => {
                    if (isVisitor) {
                      onTriggerLogin();
                    } else {
                      setPreCheckoutType('event');
                      setPreCheckoutName(currentUser?.name || '');
                      setPreCheckoutPhone(currentUser?.phone || '');
                      setPreCheckoutCpf(currentUser?.cpf || '');
                      setShowPreCheckoutModal(true);
                    }
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '48px', marginTop: '16px', fontWeight: 500 }}
                >
                  {isVisitor ? 'Cadastre-se ou Entre para comprar' : 'comprar ingresso'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 5b: ORGANIZER DETAIL (VER ORGANIZADOR) ---
  const renderOrganizerView = () => {
    const orgId = selectedOrganizerId || 'e1';
    // Resolver dados do organizador com base nos eventos
    const ev = events.find(e => e.organizerId === orgId) || events[0];
    if (!ev) return <div>Organizador não encontrado uai...</div>;

    const organizerEvents = events.filter(e => e.organizerId === orgId);
    const isFollowingOrganizer = followingIds.includes(orgId);

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Cover */}
        <div style={{ width: '100%', aspectRatio: '21/9', position: 'relative', overflow: 'hidden' }}>
          <img src={ev.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Profile info */}
        <div style={{ padding: '16px', position: 'relative', borderBottom: '1px solid #eee' }}>
          <img 
            src="https://images.unsplash.com/photo-1506157786151-b8491531f063?w=150" 
            alt="logo" 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              position: 'absolute',
              top: '-32px',
              left: '16px',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              objectFit: 'cover'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', float: 'right' }}>
            <button
              onClick={(e) => toggleFollow(orgId, e)}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                backgroundColor: isFollowingOrganizer ? '#eaeaea' : '#f28d1a',
                color: isFollowingOrganizer ? '#666' : 'white',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {isFollowingOrganizer ? 'Seguindo' : 'Seguir'}
            </button>
            <button
              onClick={() => onOpenChat()}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                color: '#2d2d2d',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Chat
            </button>
          </div>

          <div style={{ marginTop: '36px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#2d2d2d' }}>
              <EditableText textId={`event_org_${orgId}_name`} defaultText={ev.organizerName} />
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px' }}>
              Organizador de Eventos
            </div>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px', lineHeight: 1.3 }}>
              <EditableText 
                textId={`event_org_${orgId}_desc`} 
                defaultText={ev.description || 'Organizador de festas acadêmicas e festivais culturais em Ouro Preto.'} 
              />
            </p>
          </div>
        </div>

        {/* Events Grid */}
        <div style={{ padding: '16px 0', flex: 1, paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px', paddingLeft: '16px' }}>Eventos do Organizador</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', padding: '0 16px' }}>
            {organizerEvents.map(orgEv => (
              <div 
                key={orgEv.id}
                onClick={() => { setSelectedEventId(orgEv.id); onSwitchView('client_event'); }}
                style={{
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <img src={orgEv.image} alt={orgEv.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }} />
                <div style={{ padding: '4px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={11} />
                    <span>{orgEv.date}</span>
                  </div>
                  <h5 style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{orgEv.name}</h5>
                  <div style={{ fontSize: '0.68rem', color: '#777' }}>Local: {orgEv.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 6: SERVICE PROVIDER PAGE (VER PRESTADOR) ---
  const renderProviderView = () => {
    const providerServices = services.filter(s => s.providerId === selectedProviderId);
    const mainProv = providerServices[0] || services.find(s => s.providerId === selectedProviderId);
    const prov = providerServices.find(s => s.id === selectedServiceIdForHire) || mainProv;
    if (!prov) return <div>Prestador sumiu uai...</div>;

    const isFollowingProvider = followingIds.includes(prov.providerId || 'p1');

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Cover */}
        <div style={{ width: '100%', aspectRatio: '21/9', position: 'relative', overflow: 'hidden' }}>
          <img src="https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600" alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Profile info */}
        <div style={{ padding: '16px', position: 'relative', borderBottom: '1px solid #eee' }}>
          <img 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" 
            alt={prov.providerName} 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              position: 'absolute',
              top: '-32px',
              left: '16px',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              objectFit: 'cover'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', float: 'right' }}>
            <button
              onClick={(e) => toggleFollow(prov.providerId || 'p1', e)}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                backgroundColor: isFollowingProvider ? '#eaeaea' : '#f28d1a',
                color: isFollowingProvider ? '#666' : 'white',
                border: 'none',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {isFollowingProvider ? 'Seguindo' : 'Seguir'}
            </button>
            <button
              onClick={() => onOpenChat()} // open support/provider chat
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                color: '#2d2d2d',
                fontSize: '0.72rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Chat
            </button>
          </div>
          
          <div style={{ marginTop: '36px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#2d2d2d' }}>
              <EditableText textId={`prov_${prov.providerId || 'p1'}_name`} defaultText={prov.providerName} />
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px' }}>
              Serviços - {prov.category}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px', lineHeight: 1.3 }}>
              <EditableText textId={`prov_${prov.providerId || 'p1'}_desc`} defaultText={prov.description} />
            </p>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> <span>Endereço:</span> Rua das Flores, 45, Cabeças - Ouro Preto
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Phone size={12} /> <span>Telefone:</span> (31) 98888-5555
            </div>
          </div>
        </div>

        {/* Services list */}
        <div style={{ padding: '16px 0', flex: 1, paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px', paddingLeft: '16px' }}>Serviços Disponíveis</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', padding: '0 16px' }}>
            {providerServices.map(s => {
              const hasDiscount = s.originalPrice && s.pricePerHour < s.originalPrice;
              const discountPercent = hasDiscount ? Math.round(((s.originalPrice - s.pricePerHour) / s.originalPrice) * 100) : 0;
              return (
                <div
                  key={s.id}
                  onClick={() => { setSelectedServiceIdForHire(s.id); onSwitchView('client_service'); }}
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
                  <img src={s.image} alt={s.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }} />
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 500, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#2d2d2d', margin: 0 }}>{s.name}</h5>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                    {isVisitor ? (
                      <span style={{ fontSize: '0.75rem', color: '#ff5e5b' }}>Bloqueado</span>
                    ) : (
                      <>
                        <strong style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 500 }}>R$ {s.pricePerHour.toFixed(2)}/h</strong>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {s.originalPrice.toFixed(2)}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                    {s.completedCount || 0} serviços realizados
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 6b: SERVICE DETAIL (VER SERVIÇO) ---
  const renderServiceView = () => {
    const serv = services.find(s => s.id === selectedServiceIdForHire) || services[0];
    if (!serv) return <div>Serviço não encontrado uai...</div>;

    const imgBase = serv.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500';
    const images = [
      imgBase,
      imgBase.includes('?') ? `${imgBase}&v=1` : `${imgBase}?v=1`,
      imgBase.includes('?') ? `${imgBase}&v=2` : `${imgBase}?v=2`,
      imgBase.includes('?') ? `${imgBase}&v=3` : `${imgBase}?v=3`,
      imgBase.includes('?') ? `${imgBase}&v=4` : `${imgBase}?v=4`,
      imgBase.includes('?') ? `${imgBase}&v=5` : `${imgBase}?v=5`,
      imgBase.includes('?') ? `${imgBase}&v=6` : `${imgBase}?v=6`,
      imgBase.includes('?') ? `${imgBase}&v=7` : `${imgBase}?v=7`,
      imgBase.includes('?') ? `${imgBase}&v=8` : `${imgBase}?v=8`,
      imgBase.includes('?') ? `${imgBase}&v=9` : `${imgBase}?v=9`,
    ];

    return (
      <div style={{ backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }} className="animate-fade-in">
        {/* Scrollable Container */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '30px' }} className="custom-scroll">
          
          {/* Cover gallery 1:1 with horizontal scroll snap */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#eee', overflow: 'hidden' }}>
            <div 
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft;
                const width = e.target.clientWidth;
                if (width > 0) {
                  const activeIdx = Math.round(scrollLeft / width);
                  setActiveServiceImageIdx(activeIdx);
                }
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'none',
              }}
              className="custom-scroll-hidden"
            >
              {images.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  style={{
                    flexShrink: 0,
                    width: '100%',
                    height: '100%',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <img 
                    src={imgUrl} 
                    alt={serv.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    draggable="false"
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </div>

            {/* Back Button */}
            <button 
              onClick={() => onSwitchView('client_home')}
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <ArrowLeft size={16} />
            </button>

            {/* Indicator */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 500,
              zIndex: 3
            }}>
              {(activeServiceImageIdx % images.length) + 1}/{images.length}
            </div>
          </div>

          {/* Service Title and Info */}
          <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: '0.65rem', backgroundColor: '#e2f9e1', color: '#27ae60', padding: '2px 8px', borderRadius: '8px', fontWeight: 500 }}>
              {serv.category}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 500, color: '#2d2d2d', marginTop: '8px', marginBottom: '4px' }}>
              <EditableText textId={`serv_${serv.id}_name`} defaultText={serv.name} />
            </h3>
            <div style={{ position: 'relative' }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#666',
                lineHeight: 1.35,
                marginTop: '8px',
                display: isServiceDescExpanded ? 'block' : '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: isServiceDescExpanded ? 'visible' : 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <EditableText textId={`serv_${serv.id}_desc`} defaultText={serv.description || 'Serviço sob demanda com alto padrão de qualidade em Ouro Preto.'} />
              </p>
              {(serv.description || 'Serviço sob demanda com alto padrão de qualidade em Ouro Preto.').length > 90 && (
                <button
                  onClick={() => setIsServiceDescExpanded(!isServiceDescExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f28d1a',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '2px 0',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'block',
                    marginTop: '4px'
                  }}
                >
                  {isServiceDescExpanded ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>

            {/* Prestador link card */}
            <div 
              onClick={() => { setSelectedProviderId(serv.providerId); onSwitchView('client_provider'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                border: '1px solid #eee',
                borderRadius: '16px',
                cursor: 'pointer',
                marginTop: '16px',
                backgroundColor: '#fafafa'
              }}
            >
              <img 
                src={users?.find(u => u.id === serv.providerId)?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'} 
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.68rem', color: '#888', fontWeight: 400 }}>Prestado por</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 450, color: '#2d2d2d' }}>{serv.providerName}</div>
              </div>
              <ChevronRight size={16} style={{ color: '#aaa' }} />
            </div>
          </div>

          {/* Scheduling Form */}
          <div style={{ padding: '16px', paddingBottom: '30px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Agendamento</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc', padding: '12px', borderRadius: '16px', border: '1px solid #eee' }}>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>Horas de Serviço</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    type="button"
                    onClick={() => setServiceHours(Math.max(1, serviceHours - 1))}
                    style={{ border: '1px solid #ccc', background: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{serviceHours}h</span>
                  <button 
                    type="button"
                    onClick={() => setServiceHours(serviceHours + 1)}
                    style={{ border: '1px solid #ccc', background: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Data</label>
                  <input 
                    type="date" 
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.78rem', marginTop: '4px', outline: 'none' }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Horário</label>
                  <input 
                    type="time" 
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.78rem', marginTop: '4px', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Observações / Instruções</label>
                <textarea 
                  placeholder="Descreva detalhes específicos do trabalho..." 
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.78rem', marginTop: '4px', height: '60px', resize: 'none', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#666' }}>Preço total:</span>
                <span style={{ fontSize: '0.92rem', color: isVisitor ? '#ff5e5b' : '#f28d1a', fontWeight: 500 }}>
                  {isVisitor ? 'Bloqueado' : `R$ ${(serv.pricePerHour * serviceHours).toFixed(2)}`}
                </span>
              </div>

              <button 
                type="button"
                onClick={handlePreHiringSubmit}
                className="btn btn-primary"
                style={{ width: '100%', height: '48px', marginTop: '8px', fontWeight: 500 }}
              >
                {isVisitor ? 'Cadastre-se ou Entre para contratar' : 'agendar agora'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 7: CART PAGE ---
  const renderCart = () => {
    if (cart.length === 0) {
      return (
        <div style={{
          padding: '40px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }} className="animate-fade-in">
          <ShoppingCart size={64} style={{ color: '#ccc', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#2d2d2d', marginBottom: '6px' }}>
            Seu carrinho tá bem vazio...
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#777', lineHeight: 1.5, marginBottom: '24px' }}>
            Tem um monte de trem bão nas lojinhas de Ouro Preto esperando você. Bora colocar algo aqui?
          </p>
          <button onClick={() => onSwitchView('client_home')} className="btn btn-primary" style={{ width: '100%' }}>
            ir às compras
          </button>
        </div>
      );
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = cart.reduce((acc, item) => acc + (item.product.shippingPrice * shippingFactor), 0);

    return (
      <div style={{
        padding: '16px',
        paddingBottom: '160px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }} className="animate-fade-in">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', color: '#2d2d2d', margin: 0 }}>
            Meu Carrinho
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }} className="custom-scroll">
          {cart.map(item => (
            <div
              key={`${item.product.id}_${item.variation || ''}`}
              style={{
                display: 'flex',
                gap: '12px',
                backgroundColor: '#ffffff',
                padding: '12px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                border: '1px solid #eaeaea'
              }}
            >
              <img 
                src={item.product.image} 
                alt={item.product.name} 
                style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.82rem', color: '#2d2d2d' }}>{item.product.name}</h4>
                <div style={{ fontSize: '0.68rem', color: '#999' }}>Vendido por: {item.product.storeName}</div>
                {item.variation && <div style={{ fontSize: '0.68rem', color: '#f28d1a' }}>Tamanho: {item.variation}</div>}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#f28d1a' }}>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  
                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #eaeaea', borderRadius: '99px', padding: '2px 8px', backgroundColor: '#fafafa' }}>
                    <button 
                      onClick={() => updateCartQty(item.product.id, item.variation, -1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#f28d1a', padding: '0 4px' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.78rem' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQty(item.product.id, item.variation, 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#f28d1a', padding: '0 4px' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => removeFromCart(item.product.id, item.variation)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff5e5b', alignSelf: 'flex-start' }}
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Totals card */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderTop: '1px solid #eaeaea',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.02)',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#777', marginBottom: '4px' }}>
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#777', marginBottom: '8px' }}>
            <span>Frete total:</span>
            <span style={{ color: '#f28d1a', fontWeight: 500 }}>R$ {shipping.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#2d2d2d', marginBottom: '14px' }}>
            <span>Total:</span>
            <span style={{ color: '#f28d1a' }}>R$ {(subtotal + shipping).toFixed(2)}</span>
          </div>
          
          <button 
            onClick={() => onSwitchView('client_checkout')} 
            className="btn btn-primary pulse-button" 
            style={{ width: '100%', height: '48px' }}
          >
            ir para o checkout
          </button>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 8: CHECKOUT PAGE ---
  const renderCheckout = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    
    // shipping fee calculated dynamically
    const shipping = cart.reduce((acc, item) => acc + (item.product.shippingPrice * shippingFactor), 0);
    const finalShipping = shippingType === 'motoboy' ? shipping : 0;
    
    // Calculate final price locally for preview
    let discount = 0;
    if (couponApplied) {
      if (couponCode === 'OURO10') discount = 10;
      else if (couponCode === 'BEMVINDO') discount = subtotal * 0.10;
      else if (couponCode === 'UAI20') discount = subtotal * 0.20;
    }

    const baseVal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const { coinsUsed, coinDiscount } = calculateOuroCoinsDiscount(baseVal, discount);

    const finalTotal = Math.max(0, subtotal + finalShipping - discount - coinDiscount);

    const handlePlaceOrderSubmit = () => {
      // Sync address, phone, and CPF to current user profile before placing the order
      if (currentUser) {
        updateUserProfile(currentUser.id, { 
          phone: checkoutPhone,
          cpf: checkoutCpf,
          address: currentUser.address || userLocation
        });
      }
      const res = placeOrder(activePaymentTab, couponApplied ? couponCode : '', useCoins, finalShipping);
      if (res.success) {
        setPlacedOrderId(res.order.id);
        setShowPaymentModal(false);
        onSwitchView('client_payment_success');
      } else {
        alert(res.message);
      }
    };

    return (
      <div style={{ padding: '16px', paddingBottom: '90px', position: 'relative' }} className="animate-fade-in">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_cart')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
            Revisar Pedido
          </h2>
        </div>

        {/* Itens do Pedido */}
        <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '20px', border: '1px solid #eee', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingCart size={14} style={{ color: '#f28d1a' }} />
            Itens do Pedido
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} 
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#999', marginTop: '2px' }}>
                    Loja: {item.product.storeName} • Categoria: {item.product.category}
                  </div>
                  {item.variation && (
                    <div style={{ fontSize: '0.68rem', color: '#f28d1a', marginTop: '2px' }}>
                      Variação: {item.variation}
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>
                    Qtd: {item.quantity} • R$ {item.product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address (Closed Box / Click to edit in modal) */}
        <div 
          onClick={() => {
            const currentAddr = currentUser?.address || userLocation || '';
            setTempAddress(currentAddr);
            
            // Check if user object has structured fields first
            let street = currentUser?.addrStreet || '';
            let num = currentUser?.addrNumber || '';
            let neighborhood = currentUser?.addrNeighborhood || '';
            let complement = currentUser?.addrComplement || '';
            let details = currentUser?.addrDetails || '';
            let cep = currentUser?.addrCep || '';
            
            // Fallback: Parse the address string if structured fields are missing
            if (!street && !num && !neighborhood) {
              if (currentAddr) {
                const parts = currentAddr.split(',');
                street = parts[0]?.trim() || '';
                num = parts[1]?.trim() || '';
                
                if (parts[2]) {
                  const subParts = parts[2].split('-');
                  neighborhood = subParts[0]?.trim() || '';
                  details = subParts[1]?.trim() || '';
                }
                if (parts[3]) {
                  complement = parts[3]?.trim() || '';
                }
              }
            }
            
            setAddrStreet(street);
            setAddrNumber(num);
            setAddrNeighborhood(neighborhood);
            setAddrComplement(complement);
            setAddrDetails(details);
            setTempCep(cep);
            setShowAddressModal(true);
          }}
          style={{ 
            backgroundColor: 'white', 
            padding: '14px', 
            borderRadius: '20px', 
            border: '1px solid #eee', 
            marginBottom: '14px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} style={{ color: '#f28d1a' }} />
              Endereço de Entrega:
            </h4>
            <span style={{ fontSize: '0.7rem', color: '#f28d1a', fontWeight: 500 }}>Alterar</span>
          </div>
          <div style={{
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid #eaeaea',
            backgroundColor: '#ffffff',
            fontSize: '0.78rem',
            color: '#2d2d2d',
            lineHeight: 1.4
          }}>
            {currentUser?.address || userLocation}
          </div>
        </div>

        {/* Dados do Cliente (Telefone e CPF) */}
        <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '20px', border: '1px solid #eee', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} style={{ color: '#f28d1a' }} />
            Dados Pessoais:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Telefone Confirmado</label>
              <input
                type="text"
                placeholder="(31) 99999-9999"
                value={checkoutPhone}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 11) val = val.slice(0, 11);
                  if (val.length > 6) {
                    val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
                  } else if (val.length > 2) {
                    val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                  } else if (val.length > 0) {
                    val = `(${val.slice(0, 2)}`;
                  }
                  setCheckoutPhone(val);
                }}
                className="input-field"
                style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', marginTop: '4px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>CPF do Destinatário</label>
              <input
                type="text"
                placeholder="123.456.789-00"
                value={checkoutCpf}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 11) val = val.slice(0, 11);
                  // Format CPF
                  if (val.length > 9) {
                    val = val.slice(0, 3) + '.' + val.slice(3, 6) + '.' + val.slice(6, 9) + '-' + val.slice(9);
                  } else if (val.length > 6) {
                    val = val.slice(0, 3) + '.' + val.slice(3, 6) + '.' + val.slice(6);
                  } else if (val.length > 3) {
                    val = val.slice(0, 3) + '.' + val.slice(3);
                  }
                  setCheckoutCpf(val);
                }}
                className="input-field"
                style={{ padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', marginTop: '4px' }}
              />
            </div>
          </div>
        </div>

        {/* Método de Entrega */}
        <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '20px', border: '1px solid #eee', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={14} style={{ color: '#f28d1a' }} />
            Método de Entrega
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'motoboy', label: `Entrega por Motoboy - R$ ${shipping.toFixed(2)}`, desc: 'Entrega rápida em Ouro Preto' },
              { id: 'pickup', label: 'Retirada na Loja - Grátis', desc: 'Retire diretamente com o lojista' }
            ].map(option => (
              <label
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: shippingType === option.id ? '2px solid #f28d1a' : '1px solid #eaeaea',
                  backgroundColor: shippingType === option.id ? '#fdf8f0' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.78rem'
                }}
              >
                <input 
                  type="radio" 
                  name="shippingType" 
                  checked={shippingType === option.id} 
                  onChange={() => setShippingType(option.id)}
                  style={{ display: 'none' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: '#2d2d2d' }}>{option.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>{option.desc}</div>
                </div>
                {shippingType === option.id && <span style={{ color: '#f28d1a', display: 'flex', alignItems: 'center' }}><Check size={16} /></span>}
              </label>
            ))}
          </div>
        </div>

        {/* Coupons box */}
        <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '20px', border: '1px solid #eee', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Tag size={14} style={{ color: '#f28d1a' }} />
            Aplicar Cupom
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Ex: BEMVINDO, OURO10, UAI20" 
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponApplied(false);
                setCouponError('');
              }}
              className="input-field"
              disabled={couponApplied}
              style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '12px', flex: 1 }}
            />
            {couponApplied ? (
              <button 
                onClick={() => {
                  setCouponCode('');
                  setCouponApplied(false);
                  setCouponError('');
                }} 
                style={{
                  backgroundColor: '#ff5e5b15',
                  color: '#ff5e5b',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 16px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Limpar
              </button>
            ) : (
              <button 
                onClick={() => {
                  const cp = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
                  if (!cp) {
                    setCouponApplied(false);
                    setCouponError("Cupom não existe!");
                    triggerToast("Cupom não existe!");
                  } else if (subtotal < cp.minPurchase) {
                    setCouponApplied(false);
                    setCouponError(`Compra mínima para este cupom é R$ ${cp.minPurchase.toFixed(2)}`);
                    triggerToast("Valor mínimo não atingido!");
                  } else {
                    setCouponApplied(true);
                    setCouponError('');
                    triggerToast("Cupom aplicado com sucesso!");
                  }
                }} 
                style={{
                  backgroundColor: '#f28d1a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 16px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Aplicar
              </button>
            )}
          </div>
          {couponError && <div style={{ fontSize: '0.68rem', color: '#ff5e5b', marginTop: '4px', fontWeight: 500 }}>{couponError}</div>}
          {couponApplied && (
            <div style={{ fontSize: '0.68rem', color: '#27ae60', marginTop: '4px', fontWeight: 500 }}>
              {(() => {
                const cp = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
                if (!cp) return '';
                return cp.discountType === 'fixed' 
                  ? `Cupom de R$ ${cp.value.toFixed(2)} aplicado!` 
                  : `Cupom de ${cp.value}% OFF aplicado!`;
              })()}
            </div>
          )}
        </div>

        {/* OuroCoins Loyalty redemptions */}
        {currentUser?.ouroCoins > 0 && (
          <div style={{
            backgroundColor: '#fffdf0',
            padding: '14px',
            borderRadius: '20px',
            border: '1.5px solid #f9bb1a30',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coins size={14} style={{ color: '#f28d1a' }} />
                Usar OuroCoins
              </h4>
              <p style={{ fontSize: '0.7rem', color: '#777' }}>Você tem {currentUser.ouroCoins} moedas (R$ {(currentUser.ouroCoins * 0.01).toFixed(2)})</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={useCoins} 
                onChange={(e) => setUseCoins(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#f28d1a',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#f28d1a' }}>Usar saldo</span>
            </label>
          </div>
        )}

        {/* Total Calculations */}
        <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '20px', border: '1px solid #eee', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Receipt size={14} style={{ color: '#f28d1a' }} />
            Resumo de Valores
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#666', marginBottom: '4px' }}>
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#666', marginBottom: '4px' }}>
            <span>Frete final:</span>
            <span style={{ color: '#f28d1a', fontWeight: 500 }}>R$ {finalShipping.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#ff5e5b', marginBottom: '4px' }}>
              <span>Desconto:</span>
              <span>- R$ {discount.toFixed(2)}</span>
            </div>
          )}
          {coinDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#f28d1a', marginBottom: '4px' }}>
              <span>OuroCoins:</span>
              <span>- R$ {coinDiscount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d', borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px' }}>
            <span>Total:</span>
            <span style={{ color: '#f28d1a' }}>R$ {finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={() => {
            setPaymentModalType('product');
            setActivePaymentTab('pix');
            setShowPaymentModal(true);
          }} 
          className="btn btn-primary pulse-button" 
          style={{ width: '100%', height: '52px', fontWeight: 500 }}
        >
          concluir e pagar uai
        </button>

        {/* Address Edit Modal */}
        {showAddressModal && (
          <div 
            onTouchMove={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '20px',
              touchAction: 'none'
            }}
          >
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '320px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              color: '#2d2d2d',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#2d2d2d', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: '#f28d1a' }} />
                  Editar Endereço
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', lineHeight: 1.3 }}>Digite o CEP para buscar automaticamente ou altere o endereço abaixo.</p>
              </div>

              {/* CEP Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>CEP</label>
                <input
                  type="text"
                  placeholder="Ex: 35400-000"
                  value={tempCep}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 8) val = val.slice(0, 8);
                    
                    // Format CEP
                    let formatted = val;
                    if (val.length > 5) {
                      formatted = val.slice(0, 5) + '-' + val.slice(5);
                    }
                    setTempCep(formatted);

                    // If CEP is complete (8 digits), fetch address
                    if (val.length === 8) {
                      const fetchCep = async () => {
                        try {
                          const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
                          const data = await res.json();
                          if (!data.erro) {
                            setAddrStreet(data.logradouro || '');
                            setAddrNeighborhood(data.bairro || '');
                            setAddrDetails(`${data.localidade || ''} - ${data.uf || ''}`);
                            triggerToast("Endereço preenchido com sucesso!");
                          }
                        } catch (err) {
                          console.log("Erro ao buscar CEP", err);
                        }
                      };
                      fetchCep();
                    }
                  }}
                  className="input-field"
                  style={{ padding: '10px 12px', fontSize: '0.8rem', borderRadius: '12px' }}
                />
              </div>

              {/* Structured Address inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 500 }}>Rua</label>
                  <input
                    type="text"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="input-field"
                    style={{ padding: '8px 10px', fontSize: '0.78rem', borderRadius: '10px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 500 }}>Número</label>
                    <input
                      type="text"
                      value={addrNumber}
                      onChange={(e) => setAddrNumber(e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', borderRadius: '10px', width: '100%' }}
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 500 }}>Bairro</label>
                    <input
                      type="text"
                      value={addrNeighborhood}
                      onChange={(e) => setAddrNeighborhood(e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', borderRadius: '10px', width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 500 }}>Complemento</label>
                    <input
                      type="text"
                      value={addrComplement}
                      onChange={(e) => setAddrComplement(e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', borderRadius: '10px', width: '100%' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.65rem', color: '#666', fontWeight: 500 }}>Cidade - UF</label>
                    <input
                      type="text"
                      value={addrDetails}
                      onChange={(e) => setAddrDetails(e.target.value)}
                      className="input-field"
                      style={{ padding: '8px 10px', fontSize: '0.78rem', borderRadius: '10px', width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.8rem', border: '1px solid #ddd' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    let cleanCep = tempCep.replace(/\D/g, '');
                    let factor = 1.0;
                    if (cleanCep.startsWith('35400')) {
                      factor = 1.0;
                    } else if (cleanCep.startsWith('35402')) {
                      factor = 1.3;
                    } else if (cleanCep) {
                      factor = 1.5;
                    }
                    setShippingFactor(factor);

                    const fullAddr = `${addrStreet}${addrNumber ? ', ' + addrNumber : ''}${addrNeighborhood ? ', ' + addrNeighborhood : ''}${addrComplement ? ', ' + addrComplement : ''}${addrDetails ? ' - ' + addrDetails : ''}`;

                    if (currentUser) {
                      updateUserProfile(currentUser.id, { 
                        address: fullAddr,
                        addrStreet: addrStreet,
                        addrNumber: addrNumber,
                        addrNeighborhood: addrNeighborhood,
                        addrComplement: addrComplement,
                        addrDetails: addrDetails,
                        addrCep: tempCep
                      });
                    } else {
                      setUserLocation(fullAddr);
                    }
                    setShowAddressModal(false);
                    triggerToast("Endereço atualizado!");
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.8rem', color: '#ffffff' }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    );
  };

  // --- SUBVIEW 9: PAYMENT SUCCESS ---
  const renderPaymentSuccess = () => {
    return (
      <div style={{
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
        backgroundColor: '#ffffff'
      }} className="animate-fade-in">
        
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#fff9ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f28d1a',
          marginBottom: '20px'
        }}>
          <Check size={40} />
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '8px' }}>
          Pagamento Aprovado!
        </h2>
        
        <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.4, marginBottom: '24px' }}>
          {paymentModalType === 'event' 
            ? 'Seu pagamento foi confirmado uai! Seu ingresso já está disponível na sua carteira.'
            : paymentModalType === 'service'
            ? 'Seu pagamento foi confirmado uai! O profissional já recebeu seu agendamento e logo começará a se preparar.'
            : shippingType === 'pickup'
            ? 'Seu pagamento foi confirmado uai! A lojinha já recebeu o pedido e logo começará a preparar seu trem para retirada.'
            : 'Seu pagamento foi confirmado uai! A lojinha já recebeu o pedido e logo começará a preparar seu trem.'}
        </p>

        {placedOrderId && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid #eaeaea',
            width: '100%',
            marginBottom: '24px',
            fontSize: '0.82rem',
            textAlign: 'left'
          }}>
            <div><span>Código do {paymentModalType === 'service' ? 'Agendamento' : paymentModalType === 'event' ? 'Ingresso' : 'Pedido'}:</span> #{placedOrderId}</div>
            <div><span>Status:</span> Pagamento Confirmado</div>
            <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#888' }}>
              Você ganhou OuroCoins por essa compra! Confira no seu perfil.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
          {paymentModalType === 'product' && shippingType !== 'pickup' ? (
            <button 
              onClick={() => onSwitchView('client_tracking')} 
              className="btn btn-primary" 
              style={{ width: '100%', fontWeight: 500 }}
            >
              rastrear pedido
            </button>
          ) : paymentModalType === 'event' ? (
            <button 
              onClick={() => {
                onSwitchView('client_tickets');
              }} 
              className="btn btn-primary" 
              style={{ width: '100%', fontWeight: 500 }}
            >
              ver meus ingressos
            </button>
          ) : paymentModalType === 'service' ? (
            <button 
              onClick={() => {
                setProfileSubSection('services');
                onSwitchView('client_profile');
              }} 
              className="btn btn-primary" 
              style={{ width: '100%', fontWeight: 500 }}
            >
              ver meus agendamentos
            </button>
          ) : (
            <button 
              onClick={() => {
                setProfileSubSection('orders');
                onSwitchView('client_profile');
              }} 
              className="btn btn-primary" 
              style={{ width: '100%', fontWeight: 500 }}
            >
              ver meus pedidos
            </button>
          )}
          
          <button 
            onClick={() => { setPlacedOrderId(null); onSwitchView('client_home'); }} 
            className="btn btn-secondary" 
            style={{ width: '100%', fontWeight: 500 }}
          >
            voltar para o início
          </button>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 10: TRACKING ORDER (RASTREIO INTERATIVO CANVAS) ---
  const renderTracking = () => {
    // Find the latest product order placed by current customer (excluding tickets and pickup orders)
    const lastOrder = orders.find(o => o.customerId === currentUser?.id && o.type !== 'ticket' && o.shippingType !== 'pickup');
    if (!lastOrder) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ fontWeight: 400 }}>Nenhum pedido ativo no rastreamento!</h3>
          <button onClick={() => onSwitchView('client_home')} className="btn btn-primary" style={{ marginTop: '12px', fontWeight: 400 }}>Voltar</button>
        </div>
      );
    }

    // Step labels
    const steps = [
      'Pagamento Aprovado',
      'Em Preparação na Loja',
      'Buscando Entregador',
      'Entregador a caminho da loja',
      'Entregador a caminho do seu endereço',
      'Entregue! Bom proveito'
    ];

    // Let's render a Canvas/SVG simulator map!
    // We draw a street path from Shop (v1) to Customer (c1).
    // The delivery rider marker moves dynamically based on status.
    const getRiderPosition = () => {
      if (lastOrder.step <= 1) return { x: 50, y: 120 }; // In shop
      if (lastOrder.step === 2) return { x: 50, y: 120 }; // calling rider
      if (lastOrder.step === 3) return { x: 100, y: 80 }; // rider assigned, heading to shop
      if (lastOrder.step === 4) return { x: 180, y: 100 }; // rider delivering
      return { x: 280, y: 150 }; // delivered
    };

    const riderPos = getRiderPosition();

    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#2d2d2d', margin: 0 }}>
            Acompanhar Entrega
          </h2>
        </div>

        {/* MAP SIMULATOR (SVG Drawing) */}
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#e6f2eb',
          borderRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
          border: '1.5px solid #c8e2d2'
        }}>
          {/* SVG map streets */}
          <svg width="100%" height="100%">
            {/* Map lines */}
            <path d="M 50 120 Q 120 40 180 100 T 280 150" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
            <path d="M 50 120 Q 120 40 180 100 T 280 150" fill="none" stroke="#f28d1a40" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 4" />
            
            {/* Shop Pin */}
            <circle cx="50" cy="120" r="14" fill="#ff5e5b" />
            <text x="50" y="123" fontSize="9" fill="white" fontWeight="400" textAnchor="middle">L</text>
            <text x="50" y="146" fontSize="9" fill="#2d2d2d" fontWeight="400" textAnchor="middle">Lojinha</text>

            {/* Customer Pin */}
            <circle cx="280" cy="150" r="14" fill="#f28d1a" />
            <text x="280" y="153" fontSize="9" fill="white" fontWeight="400" textAnchor="middle">C</text>
            <text x="280" y="174" fontSize="9" fill="#2d2d2d" fontWeight="400" textAnchor="middle">Você</text>

            {/* Rider pin (moving scooter) */}
            {lastOrder.step >= 3 && lastOrder.step <= 4 && (
              <g transform={`translate(${riderPos.x - 14}, ${riderPos.y - 14})`}>
                <circle cx="14" cy="14" r="12" fill="#f28d1a" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }} />
                <text x="14" y="17" fontSize="9" fill="white" fontWeight="400" textAnchor="middle">M</text>
              </g>
            )}
          </svg>
          
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '3px 8px',
            borderRadius: '99px',
            fontSize: '0.62rem',
            fontWeight: 400,
            color: '#666'
          }}>
            Ouro Preto, Centro Histórico
          </div>
        </div>

        {/* Status detail */}
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.7rem', color: '#999', fontWeight: 400 }}>Pedido #{lastOrder.id}</span>
            <span style={{ fontSize: '0.72rem', backgroundColor: '#fff9ee', color: '#f28d1a', padding: '2px 8px', borderRadius: '99px', fontWeight: 400 }}>
              {lastOrder.riderName ? `Entregador: ${lastOrder.riderName}` : 'Aguardando Entregador'}
            </span>
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 400, color: '#2d2d2d', marginBottom: '12px' }}>Status do Envio:</h3>
          
          {/* Vertical progress stepper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px' }}>
            {/* Left line spacer */}
            <div style={{
              position: 'absolute',
              left: '6px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              backgroundColor: '#eee'
            }} />

            {steps.map((st, idx) => {
              const isCompleted = lastOrder.step >= idx;
              const isCurrent = lastOrder.step === idx;
              return (
                <div key={st} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {/* Step bullet */}
                  <div style={{
                    position: 'absolute',
                    left: '-20px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? '#f28d1a' : '#eee',
                    border: isCurrent ? '3px solid #ffffff' : 'none',
                    boxShadow: isCurrent ? '0 0 0 3.5px #f28d1a' : 'none',
                    zIndex: 2
                  }} />
                  
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 400,
                    color: isCurrent ? '#2d2d2d' : isCompleted ? '#888' : '#bbb'
                  }}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tip */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '12px',
          borderRadius: '16px',
          border: '1px solid #eaeaea',
          fontSize: '0.78rem',
          color: '#d4730d',
          textAlign: 'center',
          fontWeight: 400
        }}>
          Dica de Teste: Vá no Painel do Vendedor ou do Motoboy no menu lateral para atualizar o status deste pedido e veja a rota atualizar ao vivo!
        </div>
      </div>
    );
  };

  // --- SUBVIEW 11: FOR YOU SCREEN (TIKTOK SHOP STYLE) ---
  const renderForYou = () => {
    const filteredVideos = forYouTab === 'following'
      ? videos.filter(v => followingIds.includes(v.creatorId))
      : videos;

    const handleTabChange = (tab) => {
      setForYouTab(tab);
      setCurrentVideoIndex(0);
      setDescExpanded(false);
      setShowVideoComments(false);
    };

    if (filteredVideos.length === 0) {
      return (
        <div style={{
          height: '100%',
          backgroundColor: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }} className="animate-fade-in">
          {/* Top Header */}
          <div style={{
            position: 'absolute',
            top: '16px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            zIndex: 10,
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            <button 
              onClick={() => handleTabChange('following')}
              style={{ background: 'none', border: 'none', color: forYouTab === 'following' ? 'white' : '#999', fontSize: forYouTab === 'following' ? '0.9rem' : '0.85rem', fontWeight: 500, borderBottom: forYouTab === 'following' ? '2px solid white' : 'none', paddingBottom: '3px', cursor: 'pointer' }}
            >
              Seguindo
            </button>
            <button 
              onClick={() => handleTabChange('foryou')}
              style={{ background: 'none', border: 'none', color: forYouTab === 'foryou' ? 'white' : '#999', fontSize: forYouTab === 'foryou' ? '0.9rem' : '0.85rem', fontWeight: 500, borderBottom: forYouTab === 'foryou' ? '2px solid white' : 'none', paddingBottom: '3px', cursor: 'pointer' }}
            >
              Para Você
            </button>
          </div>
          
          <StoreIcon size={48} style={{ color: '#555', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#eee', marginBottom: '8px' }}>
            Nenhum vídeo novo por aqui...
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#888', lineHeight: 1.4, maxWidth: '240px', marginBottom: '16px' }}>
            Siga mais lojas e organizadores de eventos para ver os conteúdos deles nesta aba!
          </p>
          <button
            onClick={() => handleTabChange('foryou')}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: '#f28d1a',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            ver recomendados
          </button>
        </div>
      );
    }

    const activeVideoIndex = currentVideoIndex % filteredVideos.length;
    const activeVideo = filteredVideos[activeVideoIndex];

    const handleNextVideo = () => {
      setDescExpanded(false);
      setShowVideoComments(false);
      setIsVideoPlaying(true);
      setCurrentVideoIndex(prev => (prev + 1) % filteredVideos.length);
    };

    const handlePrevVideo = () => {
      setDescExpanded(false);
      setShowVideoComments(false);
      setIsVideoPlaying(true);
      setCurrentVideoIndex(prev => (prev - 1 + filteredVideos.length) % filteredVideos.length);
    };

    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartYRef.current - touchEndY;
      if (diffY > 50) {
        handleNextVideo();
      } else if (diffY < -50) {
        handlePrevVideo();
      }
    };

    const handleMouseDown = (e) => {
      mouseDownYRef.current = e.clientY;
    };

    const handleMouseUp = (e) => {
      const mouseUpY = e.clientY;
      const diffY = mouseDownYRef.current - mouseUpY;
      if (diffY > 50) {
        handleNextVideo();
      } else if (diffY < -50) {
        handlePrevVideo();
      }
    };

    const handleContainerClick = (e) => {
      // Ignore click if it was actually a swipe/drag
      const startY = touchStartYRef.current || mouseDownYRef.current;
      const diffY = Math.abs(startY - e.clientY);
      if (diffY > 10) {
        return;
      }
      setIsVideoPlaying(prev => !prev);
    };

    const handleLike = () => {
      const isAlreadyLiked = likedVideoIds.includes(activeVideo.id);
      if (isAlreadyLiked) {
        setLikedVideoIds(prev => prev.filter(id => id !== activeVideo.id));
        setVideoLikes(prev => ({ ...prev, [activeVideo.id]: Math.max(0, (prev[activeVideo.id] || 0) - 1) }));
        unlikeVideo(activeVideo.id);
      } else {
        setLikedVideoIds(prev => [...prev, activeVideo.id]);
        setVideoLikes(prev => ({ ...prev, [activeVideo.id]: (prev[activeVideo.id] || 0) + 1 }));
        likeVideo(activeVideo.id);
      }
    };

    return (
      <div style={{
        height: '100%',
        backgroundColor: '#000000',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'white'
      }} className="animate-fade-in">
        
        {/* Top Header */}
        <div style={{
          position: 'absolute',
          top: '16px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          zIndex: 10,
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          <button 
            onClick={() => handleTabChange('following')}
            style={{ background: 'none', border: 'none', color: forYouTab === 'following' ? 'white' : '#999', fontSize: forYouTab === 'following' ? '0.9rem' : '0.85rem', fontWeight: 500, borderBottom: forYouTab === 'following' ? '2px solid white' : 'none', paddingBottom: '3px', cursor: 'pointer' }}
          >
            Seguindo
          </button>
          <button 
            onClick={() => handleTabChange('foryou')}
            style={{ background: 'none', border: 'none', color: forYouTab === 'foryou' ? 'white' : '#999', fontSize: forYouTab === 'foryou' ? '0.9rem' : '0.85rem', fontWeight: 500, borderBottom: forYouTab === 'foryou' ? '2px solid white' : 'none', paddingBottom: '3px', cursor: 'pointer' }}
          >
            Para Você
          </button>
        </div>

        {/* Main Video Element */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onClick={handleContainerClick}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            cursor: 'pointer',
            overflow: 'hidden',
            backgroundColor: '#000000'
          }}
        >
          <video 
            ref={videoRef}
            src={activeVideo.videoUrl}
            poster={activeVideo.poster}
            loop
            playsInline
            autoPlay
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              opacity: isVideoPlaying ? 1 : 0.8
            }}
          />

          {/* Ambient overlays */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
            pointerEvents: 'none'
          }} />

          {/* Centered Play Button Mock */}
          {!isVideoPlaying && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 2
            }}>
              <Play size={28} fill="white" color="white" style={{ marginLeft: '4px' }} />
            </div>
          )}
        </div>

        {/* Right Action Icons (Like, Comment, Share) */}
        <div style={{
          position: 'absolute',
          right: '16px',
          bottom: '160px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          zIndex: 5
        }}>
          {/* Creator Profile */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (activeVideo.linkedType === 'product') {
                setSelectedStoreId(activeVideo.creatorId);
                onSwitchView('client_store');
              } else if (activeVideo.linkedType === 'event') {
                setSelectedEventId(activeVideo.linkedId);
                onSwitchView('client_event');
              } else if (activeVideo.linkedType === 'service') {
                setSelectedServiceIdForHire(activeVideo.linkedId);
                setSelectedProviderId(activeVideo.creatorId);
                onSwitchView('client_service');
              }
            }}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: '2px solid white',
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              <img 
                src={activeVideo.linkedType === 'service' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' : activeVideo.poster} 
                alt="creator" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {!followingIds.includes(activeVideo.creatorId) && (
              <button
                onClick={(e) => toggleFollow(activeVideo.creatorId, e)}
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#f28d1a',
                  color: 'white',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  zIndex: 10
                }}
              >
                <Plus size={10} strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Like */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '3px'
            }}>
              <Heart 
                size={20} 
                fill={likedVideoIds.includes(activeVideo.id) ? "#ff5e5b" : "none"} 
                color={likedVideoIds.includes(activeVideo.id) ? "#ff5e5b" : "white"} 
              />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>{videoLikes[activeVideo.id] || activeVideo.likes}</span>
          </button>

          {/* Comment */}
          <button 
            onClick={(e) => { e.stopPropagation(); setShowVideoComments(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '3px'
            }}>
              <MessageSquare size={18} />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>{(videoCommentsList[activeVideo.id] || []).length}</span>
          </button>

          {/* Coins Badge */}
          <div className="pulse-button" style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#222',
            border: '3px solid #f28d1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulseGlow 2s infinite'
          }}>
            <Coins size={12} color="white" />
          </div>
        </div>

        {/* Video Descriptions & Title Overlay (Left Bottom) */}
        <div style={{
          position: 'absolute',
          left: '16px',
          bottom: '120px',
          right: '80px',
          zIndex: 5,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          textAlign: 'left'
        }}>
          <h4 
            onClick={(e) => {
              e.stopPropagation();
              if (activeVideo.linkedType === 'product') {
                setSelectedStoreId(activeVideo.creatorId);
                onSwitchView('client_store');
              } else if (activeVideo.linkedType === 'event') {
                setSelectedEventId(activeVideo.linkedId);
                onSwitchView('client_event');
              } else if (activeVideo.linkedType === 'service') {
                setSelectedServiceIdForHire(activeVideo.linkedId);
                setSelectedProviderId(activeVideo.creatorId);
                onSwitchView('client_service');
              }
            }}
            style={{ fontSize: '0.92rem', fontWeight: 500, color: '#ffffff', margin: 0, cursor: 'pointer' }}
          >
            @{activeVideo.creatorName}
          </h4>
          <p 
            onClick={(e) => { e.stopPropagation(); setDescExpanded(!descExpanded); }}
            style={{ 
              fontSize: '0.78rem', 
              color: '#eaeaea', 
              marginTop: '6px', 
              lineHeight: 1.3,
              cursor: 'pointer',
              ...(!descExpanded ? {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              } : {})
            }}
          >
            {activeVideo.title}
          </p>
        </div>

        {/* TIKTOK SHOP LINKING POPUP (Overlay at the bottom) */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          right: '16px',
          zIndex: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '12px 14px',
          color: '#2d2d2d',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <img 
            src={activeVideo.poster} 
            alt="link" 
            style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.62rem', backgroundColor: '#fff0d2', color: '#d4730d', padding: '1px 6px', borderRadius: '8px', fontWeight: 500 }}>
              Destaque do Vídeo
            </span>
            <h5 style={{
              fontSize: '0.78rem',
              fontWeight: 500,
              margin: '2px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {activeVideo.linkedName}
            </h5>
            <strong style={{ fontSize: '0.82rem', color: isVisitor ? '#ff5e5b' : '#f28d1a' }}>
              {isVisitor ? 'Bloqueado' : `R$ ${activeVideo.linkedPrice.toFixed(2)}`}
            </strong>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (activeVideo.linkedType === 'product') {
                handleProductClick(activeVideo.linkedId);
              } else if (activeVideo.linkedType === 'event') {
                setSelectedEventId(activeVideo.linkedId);
                onSwitchView('client_event');
              } else if (activeVideo.linkedType === 'service') {
                setSelectedServiceIdForHire(activeVideo.linkedId);
                setSelectedProviderId(activeVideo.creatorId);
                onSwitchView('client_service');
              }
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '99px',
              backgroundColor: '#f28d1a',
              color: 'white',
              border: 'none',
              fontSize: '0.7rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(242,141,26,0.3)'
            }}
          >
            Quero!
          </button>
        </div>

        {/* Video Comments Sheet Popup */}
        {showVideoComments && (
          <div 
            onClick={(e) => e.stopPropagation()} // Prevent skipping video when clicking comments
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '320px',
              backgroundColor: '#ffffff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              zIndex: 100,
              boxShadow: '0 -10px 25px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
              animation: 'slideUp 0.3s ease-out',
              color: '#2d2d2d'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Comentários ({(videoCommentsList[activeVideo.id] || []).length})</h4>
              <button 
                onClick={() => setShowVideoComments(false)}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px' }} className="custom-scroll">
              {(videoCommentsList[activeVideo.id] || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.8rem' }}>Sem comentários ainda. Seja o primeiro!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(videoCommentsList[activeVideo.id] || []).map((c, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: '#333' }}>
                      <strong style={{ color: '#2d2d2d' }}>{c.name}: </strong>{c.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '12px',
                  border: '1px solid #eee',
                  fontSize: '0.8rem',
                  outline: 'none',
                  backgroundColor: '#fbfbfb',
                  color: '#2d2d2d'
                }}
              />
              <button
                onClick={() => {
                  if (newCommentText.trim() !== '') {
                    setVideoCommentsList(prev => ({
                      ...prev,
                      [activeVideo.id]: [
                        ...(prev[activeVideo.id] || []),
                        { name: currentUser?.name || 'Cliente', text: newCommentText }
                      ]
                    }));
                    setNewCommentText('');
                  }
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#f28d1a',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- SUBVIEW 12: FAVORITES PAGE ---
  const renderFavorites = () => {
    const favProducts = products.filter(p => favorites.includes(p.id));

    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
            Meus Favoritos
          </h2>
        </div>

        {favProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Heart size={48} style={{ color: '#ccc', marginBottom: '8px' }} />
            <p style={{ fontSize: '0.85rem' }}>Nenhum trem favoritado ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {favProducts.map(prod => (
              <div
                key={prod.id}
                onClick={() => handleProductClick(prod.id)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  border: '1px solid #eaeaea'
                }}
              >
                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d' }}>{prod.name}</h4>
                  <div style={{ fontSize: '0.68rem', color: '#999' }}>{prod.storeName}</div>
                  <strong style={{ fontSize: '0.85rem', fontWeight: 500, color: isVisitor ? '#ff5e5b' : '#f28d1a', display: 'block', marginTop: '4px' }}>
                    {isVisitor ? 'Bloqueado' : `R$ ${prod.price.toFixed(2)}`}
                  </strong>
                </div>
                
                <button
                  onClick={(e) => handleFavoriteToggle(prod.id, e)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff5e5b', fontSize: '0.8rem', fontWeight: 500 }}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- SUBVIEW 12b: TICKETS PAGE ---
  const renderTicketsView = () => {
    const userTickets = orders.filter(o => (o.userId === currentUser?.id || o.customerId === currentUser?.id) && o.type === 'ticket');

    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_profile')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
            Ingressos Comprados
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {userTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
              Nenhum ingresso comprado.
            </div>
          ) : (
            userTickets.map(o => (
              <div key={o.id} style={{ border: '1px solid #eee', borderRadius: '16px', padding: '14px', backgroundColor: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#f28d1a' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingLeft: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f28d1a' }}>Ticket #{o.id}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888' }}>Confirmado</span>
                </div>
                {o.items ? (
                  o.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', paddingLeft: '6px' }}>
                      <img src={item.image || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100'} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>Lote Único • {item.quantity} ingressos</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', paddingLeft: '6px' }}>
                    <img src={o.eventImage || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100'} alt={o.eventName} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.eventName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#666' }}>{o.batchName || 'Lote Único'} • {o.quantity} ingressos</div>
                    </div>
                  </div>
                )}
                {/* Simulated QR Code button */}
                <div style={{ marginTop: '12px', paddingLeft: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#999' }}>Apresente na portaria do evento</span>
                  <button 
                    onClick={() => triggerToast("QR Code exibido! Mostre na portaria do evento.")}
                    style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #f28d1a', background: 'none', color: '#f28d1a', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Ver QR Code
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // --- SUBVIEW 12c: FOLLOWING PAGE ---
  const renderFollowingView = () => {
    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_profile')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
            Perfis Seguidos
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {followingIds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
              Nenhum perfil seguido por enquanto.
            </div>
          ) : (
            followingIds.map(fId => {
              // 1. Tentar encontrar nos users (Firebase)
              const u = users.find(usr => usr.id === fId);
              // 2. Tentar encontrar no nearbyStores
              const s = nearbyStores.find(store => store.id === fId);

              if (!u && !s) return null;

              const name = u ? u.name : s.name;
              const logo = u ? (u.avatar || u.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150') : s.logo;
              const desc = u 
                ? (u.role === 'seller' ? 'Loja Vendedora' : u.role === 'provider' ? (u.serviceCategory || 'Prestador de Serviços') : u.role === 'organizer' ? 'Organizador de Eventos' : 'Cliente') 
                : s.desc;

              const handleClick = () => {
                if (u) {
                  if (u.role === 'seller') {
                    setSelectedStoreId(u.id);
                    onSwitchView('client_store');
                  } else if (u.role === 'provider') {
                    setSelectedProviderId(u.id);
                    onSwitchView('client_provider');
                  } else if (u.role === 'organizer') {
                    setSelectedOrganizerId(u.id);
                    onSwitchView('client_organizer');
                  } else {
                    setSelectedProfileUserId(u.id);
                    onSwitchView('client_profile');
                  }
                } else if (s) {
                  setSelectedStoreId(s.id);
                  onSwitchView('client_store');
                }
              };

              const btnLabel = u 
                ? (u.role === 'seller' ? 'Ver Loja' : u.role === 'provider' ? 'Ver Serviço' : u.role === 'organizer' ? 'Ver Eventos' : 'Ver Perfil') 
                : 'Ver Loja';

              return (
                <div key={fId} style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee', borderRadius: '16px', padding: '10px', backgroundColor: 'white' }}>
                  <img src={logo} alt={name} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                    <div style={{ fontSize: '0.68rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
                  </div>
                  <button 
                    onClick={handleClick}
                    style={{ padding: '5px 12px', borderRadius: '12px', border: 'none', backgroundColor: '#f28d1a15', color: '#f28d1a', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {btnLabel}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // --- SUBVIEW 13: COUPONS LIST PAGE ---
  const renderCoupons = () => {
    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', color: '#2d2d2d', margin: 0 }}>
            Meus Cupons
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {coupons.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999', fontSize: '0.82rem', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #eee' }}>
              Nenhum cupom disponível no momento, uai!
            </div>
          ) : coupons.map(cp => {
            const tag = cp.discountType === 'percent' ? `${cp.value}% OFF` : `R$ ${cp.value.toFixed(2)}`;
            const desc = cp.discountType === 'percent'
              ? `Ganhe ${cp.value}% de desconto em suas compras!`
              : `Desconto de R$ ${cp.value.toFixed(2)}`;
            const minPurchaseText = cp.minPurchase > 0 ? ` em compras acima de R$ ${cp.minPurchase.toFixed(2)}.` : '';
            return (
              <div
                key={cp.code}
              style={{
                backgroundColor: 'white',
                border: '1.5px dashed #f28d1a',
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative'
              }}
            >
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: '0.62rem',
                  backgroundColor: '#f9bb1a20',
                  color: '#d4730d',
                  padding: '2px 8px',
                  borderRadius: '99px'
                }}>
                  {tag}
                </span>
                <h3 style={{ fontSize: '1rem', color: '#2d2d2d', margin: '4px 0' }}>{cp.code}</h3>
                <p style={{ fontSize: '0.72rem', color: '#777', lineHeight: 1.3 }}>{desc}{minPurchaseText}</p>
              </div>
              
              <button
                onClick={() => {
                  setCouponCode(cp.code);
                  onSwitchView('client_cart');
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '99px',
                  backgroundColor: '#f28d1a',
                  color: 'white',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 400,
                  cursor: 'pointer'
                }}
              >
                Usar
              </button>
            </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- SUBVIEW 14: OUROCOINS LEDGER ---
  const renderOuroCoins = () => {
    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', color: '#2d2d2d', margin: 0 }}>
            Carteira de OuroCoins
          </h2>
        </div>

        {/* Balance card */}
        <div style={{
          background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
          borderRadius: '24px',
          padding: '24px 20px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(242,141,26,0.3)',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>Meu Saldo Atual</span>
          <h1 style={{ fontSize: '2.5rem', margin: '6px 0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Coins size={32} /> {currentUser?.ouroCoins || 0}
          </h1>
          <p style={{ fontSize: '0.78rem', opacity: 0.9 }}>
            Equivale a R$ {((currentUser?.ouroCoins || 0) * 0.01).toFixed(2)} de desconto! (100 moedas = R$ 1,00)
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.88rem', color: '#2d2d2d', marginBottom: '12px' }}>Como funciona o trem?</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem', color: '#666', lineHeight: 1.4 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <StoreIcon size={16} style={{ marginTop: '2px', color: '#f28d1a' }} />
              <div>
                <span>Como ganhar:</span> A cada R$ 1,00 gasto em compras, ingressos ou serviços no app, você ganha 1 Ourocoin!
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Coins size={16} style={{ marginTop: '2px', color: '#f28d1a' }} />
              <div>
                <span>Como usar:</span> Cada 100 moedas equivalem a R$ 1,00 de desconto no pagamento, com limite de até 25% do valor total do pedido.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Calendar size={16} style={{ marginTop: '2px', color: '#f28d1a' }} />
              <div>
                <span>Limites de uso:</span> Limite máximo de até 10.000 moedas por dia e 30.000 moedas por semana.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Clock size={16} style={{ marginTop: '2px', color: '#ff5e5b' }} />
              <div>
                <span style={{ color: '#ff5e5b', fontWeight: 600 }}>Validade:</span> As moedas expiram em 2 meses, contados a partir do final do mês em que foram creditadas.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
              <Sparkles size={16} style={{ marginTop: '2px', color: '#f28d1a' }} />
              <div style={{ fontWeight: 500, color: '#444' }}>
                Suas moedas acumuladas este mês expiram em: {(() => {
                  const now = new Date();
                  const exp = new Date(now.getFullYear(), now.getMonth() + 3, 0);
                  return exp.toLocaleDateString('pt-BR');
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 15: SEARCH PAGE ---
  const renderSearch = () => {
    const searchResults = searchQuery.trim() !== '' 
      ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      : [];

    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '16px' }}>
          O que você está buscando hoje?
        </h2>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '4px 14px',
          border: '1px solid #eee',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          marginBottom: '20px'
        }}>
          <Search size={18} style={{ color: '#888', marginRight: '10px' }} />
          <input
            type="text"
            placeholder="Buscar produtos, lojas ou serviços..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '12px 0',
              fontSize: '0.9rem',
              color: '#2d2d2d',
              backgroundColor: 'transparent'
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {searchQuery.trim() !== '' ? (
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
              Resultados para "{searchQuery}"
            </h3>
            {searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
                Nenhum resultado encontrado uai. Tente outra palavra!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {searchResults.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => handleProductClick(prod.id)}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      backgroundColor: '#ffffff',
                      padding: '10px',
                      borderRadius: '16px',
                      border: '1px solid #eee',
                      cursor: 'pointer'
                    }}
                  >
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h4>
                      <span style={{ fontSize: '0.68rem', color: '#999' }}>{prod.storeName}</span>
                      <strong style={{ fontSize: '0.85rem', fontWeight: 500, color: isVisitor ? '#ff5e5b' : '#f28d1a', display: 'block', marginTop: '2px' }}>
                        {isVisitor ? 'Bloqueado' : `R$ ${prod.price.toFixed(2)}`}
                      </strong>
                      <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>
                        {prod.soldCount || 0} vendidos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
              Categorias
            </h3>
            {renderGroupedCategoriesList()}
          </div>
        )}
      </div>
    );
  };

  const renderAllOffers = () => {
    const flashDeals = products.filter(p => p.inFlashDeal && p.active);
    return (
      <div className="animate-fade-in" style={{ padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{ background: 'none', border: 'none', color: '#2d2d2d', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Ofertas Relâmpago</h3>
        </div>

        {flashDeals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.85rem' }}>
            Nenhuma oferta ativa no momento uai. Volte mais tarde!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {flashDeals.map(prod => {
              const discountPercent = prod.flashDealDiscount || Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
              const limit = prod.flashDealLimit || 10;
              const sold = prod.flashDealSold || 0;
              const soldPercentage = Math.round((sold / limit) * 100) || 0;
              const restam = Math.max(0, limit - sold);
              
              return (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    border: '1px solid #eee',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* % tag */}
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: '#ff5e5b',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      zIndex: 2
                    }}>
                      {discountPercent}%
                    </span>

                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '14px', marginBottom: '8px' }}
                    />
                    <div style={{ 
                      fontSize: '0.68rem', 
                      color: '#999', 
                      margin: '2px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{prod.storeName}</div>
                    
                    <h4 style={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: '#2d2d2d',
                      margin: '4px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {prod.name}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                      {isVisitor ? (
                        <span style={{ fontSize: '0.78rem', color: '#ff5e5b' }}>Bloqueado</span>
                      ) : (
                        <>
                          <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f28d1a' }}>R$ {prod.price.toFixed(2)}</span>
                          {prod.originalPrice && <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {prod.originalPrice.toFixed(2)}</span>}
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>
                      {sold} vendidos
                    </div>

                    {/* Progressive Stock bar */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#888', marginBottom: '2px' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>{soldPercentage}% vendidos</span>
                        <span style={{ whiteSpace: 'nowrap', paddingLeft: '4px' }}>{restam} restam</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${soldPercentage}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(prod);
                    }}
                    style={{
                      marginTop: '12px',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
                      color: 'white',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <ShoppingCart size={12} />
                    adicionar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };


  // --- SUBVIEW: CLIENT PROFILE ---
  const renderClientProfile = () => {
    // Resolve fallback user for top buyers
    const getFallbackProfile = (userIdOrName) => {
      if (userIdOrName === 'c2' || userIdOrName === 'Juliana S.') {
        return {
          id: 'c2',
          name: 'Juliana S.',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          banner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
          bio: 'Apaixonada por artesanato em pedra-sabão e café colonial ☕',
          address: 'Rua das Flores, 12, Pilar - Ouro Preto',
          phone: '(31) 97777-5555',
          ouroCoins: 450
        };
      }
      if (userIdOrName === 'c3' || userIdOrName === 'Lucas "Borracha"') {
        return {
          id: 'c3',
          name: 'Lucas "Borracha"',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
          banner: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500',
          bio: 'Estudante da UFOP e fã de festas universitárias 🎓🍺',
          address: 'Rua Direita, 99, Centro - Ouro Preto',
          phone: '(31) 96666-4444',
          ouroCoins: 180
        };
      }
      if (userIdOrName === 'c4' || userIdOrName === 'Mariana P.') {
        return {
          id: 'c4',
          name: 'Mariana P.',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
          banner: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500',
          bio: 'Turista frequente de Ouro Preto. Amo a culinária mineira! 🧀',
          address: 'Belo Horizonte - MG (Visitante)',
          phone: '(31) 95555-3333',
          ouroCoins: 140
        };
      }
      if (userIdOrName === 'c5' || userIdOrName === 'Pedro H.') {
        return {
          id: 'c5',
          name: 'Pedro H.',
          avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
          banner: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
          bio: 'Colecionador de cachaças artesanais de Ouro Preto 🍶',
          address: 'Rua São José, 42, Centro - Ouro Preto',
          phone: '(31) 94444-2222',
          ouroCoins: 90
        };
      }
      return null;
    };

    const isOwnProfile = !selectedProfileUserId || selectedProfileUserId === currentUser?.id;
    
    // Resolve user from context users first, then fallback
    let user = isOwnProfile ? currentUser : users.find(u => u.id === selectedProfileUserId || u.name === selectedProfileUserId);
    if (!user && selectedProfileUserId) {
      user = getFallbackProfile(selectedProfileUserId);
    }
    if (!user) {
      user = currentUser || {
        id: 'c1',
        name: 'Mateus Oliveira',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        banner: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
        bio: 'Amante de artesanato mineiro e um bom café ☕ | Explorador de Ouro Preto 🏛️',
        address: 'Rua Direita, 45, Centro - Ouro Preto',
        phone: '(31) 98888-7777',
        ouroCoins: 250
      };
    }

    const userOrders = orders.filter(o => o.userId === user.id || o.customerId === user.id);
    const userProductsOrders = userOrders.filter(o => o.type !== 'ticket');
    const userTickets = userOrders.filter(o => o.type === 'ticket');
    const userHiredServices = servicesHired.filter(sh => sh.userId === user.id || sh.customerId === user.id);

    const startEditing = () => {
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setEditAvatar(user.avatar || '');
      setEditBanner(user.banner || '');
      setEditAddress(user.address || '');
      setEditPhone(user.phone || '');
      setIsEditingProfile(true);
    };

    const handleClientCoverUpload = (e) => {
      const file = e.target.files[0];
      if (file && isOwnProfile && currentUser) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          updateUserProfile(currentUser.id, { banner: base64 });
          triggerToast("Capa do perfil atualizada!");
        };
        reader.readAsDataURL(file);
      }
    };

    const handleClientAvatarUpload = (e) => {
      const file = e.target.files[0];
      if (file && isOwnProfile && currentUser) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          updateUserProfile(currentUser.id, { avatar: base64 });
          triggerToast("Foto de perfil atualizada!");
        };
        reader.readAsDataURL(file);
      }
    };

    const saveProfileChanges = () => {
      if (isOwnProfile && currentUser) {
        const updatedFields = {
          name: editName,
          bio: editBio
        };
        if (currentUser.role !== 'client') {
          updatedFields.address = editAddress;
          updatedFields.phone = editPhone;
        }
        updateUserProfile(currentUser.id, updatedFields);
        triggerToast("Perfil atualizado com sucesso!");
      }
      setIsEditingProfile(false);
    };

    // If sub-section is selected, render it
    if (profileSubSection) {
      return (
        <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <button 
              onClick={() => setProfileSubSection(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
            >
              <ArrowLeft size={22} />
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>
              {profileSubSection === 'orders' ? 'Pedidos Feitos' :
               profileSubSection === 'tickets' ? 'Ingressos Comprados' :
               profileSubSection === 'following' ? 'Perfis Seguidos' :
               profileSubSection === 'services' ? 'Serviços Realizados' : 'Avaliações Feitas'}
            </h2>
          </div>

          {/* Pedidos */}
          {profileSubSection === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {userProductsOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
                  Nenhum pedido de produto encontrado.
                </div>
              ) : (
                userProductsOrders.map(o => (
                  <div key={o.id} style={{ border: '1px solid #eee', borderRadius: '16px', padding: '14px', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f28d1a' }}>Pedido #{o.id}</span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '8px', backgroundColor: '#e2f9e1', color: '#27ae60', fontWeight: 600 }}>
                        {o.status === 'delivered' ? 'Entregue' : 'A Caminho'}
                      </span>
                    </div>
                    {o.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                        <img src={item.image} alt={item.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#888' }}>Qtd: {item.quantity} • R$ {item.price.toFixed(2)}</div>
                        </div>
                        {(() => {
                          const hasReviewed = productReviews?.some(r => r.productId === item.id && r.userName === (currentUser?.name || 'Cliente Anônimo'));
                          return hasReviewed ? (
                            <button
                              disabled
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                backgroundColor: '#f5f5f5',
                                color: '#999',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                cursor: 'not-allowed',
                                flexShrink: 0
                              }}
                            >
                              Avaliado
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setRatingProductId(item.id);
                                setReviewRating(5);
                                setReviewComment('');
                                setReviewImages([]);
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #f28d1a',
                                backgroundColor: '#ffffff',
                                color: '#f28d1a',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                flexShrink: 0
                              }}
                            >
                              Avaliar
                            </button>
                          );
                        })()}
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #f9f9f9', marginTop: '8px', paddingTop: '8px', textAlign: 'right', fontSize: '0.75rem', color: '#666' }}>
                      Total: <strong style={{ color: '#2d2d2d' }}>R$ {(o.items.reduce((acc, it) => acc + it.price * it.quantity, 0)).toFixed(2)}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Ingressos */}
          {profileSubSection === 'tickets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {userTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
                  Nenhum ingresso comprado.
                </div>
              ) : (
                userTickets.map(o => (
                  <div key={o.id} style={{ border: '1px solid #eee', borderRadius: '16px', padding: '14px', backgroundColor: 'white', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#f28d1a' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingLeft: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f28d1a' }}>Ticket #{o.id}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888' }}>Confirmado</span>
                    </div>
                    {o.items ? (
                      o.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', paddingLeft: '6px' }}>
                          <img src={item.image || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100'} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#666' }}>Lote Único • {item.quantity} ingressos</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px', paddingLeft: '6px' }}>
                        <img src={o.eventImage || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100'} alt={o.eventName} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.eventName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#666' }}>{o.batchName || 'Lote Único'} • {o.quantity} ingressos</div>
                        </div>
                      </div>
                    )}
                    {/* Simulated QR Code button */}
                    <div style={{ marginTop: '12px', paddingLeft: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.68rem', color: '#999' }}>Apresente na portaria do evento</span>
                      <button 
                        onClick={() => triggerToast("QR Code exibido! Mostre na portaria do evento.")}
                        style={{ padding: '4px 10px', borderRadius: '8px', border: '1px solid #f28d1a', background: 'none', color: '#f28d1a', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Ver QR Code
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Perfis Seguidos */}
          {profileSubSection === 'following' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {followingIds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
                  Nenhum perfil seguido por enquanto.
                </div>
              ) : (
                followingIds.map(fId => {
                  const u = users.find(usr => usr.id === fId);
                  const s = nearbyStores.find(store => store.id === fId);
                  if (!u && !s) return null;

                  const name = u ? u.name : s.name;
                  const logo = u ? (u.avatar || u.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150') : s.logo;
                  const desc = u 
                    ? (u.role === 'seller' ? 'Loja Vendedora' : u.role === 'provider' ? (u.serviceCategory || 'Prestador de Serviços') : u.role === 'organizer' ? 'Organizador de Eventos' : 'Cliente') 
                    : s.desc;

                  const handleClick = () => {
                    setProfileSubSection(null);
                    if (u) {
                      if (u.role === 'seller') {
                        setSelectedStoreId(u.id);
                        onSwitchView('client_store');
                      } else if (u.role === 'provider') {
                        setSelectedProviderId(u.id);
                        onSwitchView('client_provider');
                      } else if (u.role === 'organizer') {
                        setSelectedOrganizerId(u.id);
                        onSwitchView('client_organizer');
                      } else {
                        setSelectedProfileUserId(u.id);
                        onSwitchView('client_profile');
                      }
                    } else if (s) {
                      setSelectedStoreId(s.id);
                      onSwitchView('client_store');
                    }
                  };

                  const btnLabel = u 
                    ? (u.role === 'seller' ? 'Ver Loja' : u.role === 'provider' ? 'Ver Serviço' : u.role === 'organizer' ? 'Ver Eventos' : 'Ver Perfil') 
                    : 'Ver Loja';

                  return (
                    <div key={fId} style={{ display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #eee', borderRadius: '16px', padding: '10px', backgroundColor: 'white' }}>
                      <img src={logo} alt={name} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{desc}</div>
                      </div>
                      <button 
                        onClick={handleClick}
                        style={{ padding: '5px 12px', borderRadius: '12px', border: 'none', backgroundColor: '#f28d1a15', color: '#f28d1a', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {btnLabel}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Serviços Realizados */}
          {profileSubSection === 'services' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {userHiredServices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
                  Nenhum serviço agendado ou realizado.
                </div>
              ) : (
                userHiredServices.map(sh => (
                  <div key={sh.id} style={{ border: '1px solid #eee', borderRadius: '16px', padding: '12px', backgroundColor: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#888' }}>{sh.date} • {sh.time}</span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '8px', backgroundColor: sh.status === 'completed' ? '#e2f9e1' : '#fff3cd', color: sh.status === 'completed' ? '#27ae60' : '#856404', fontWeight: 600 }}>
                        {sh.status === 'completed' ? 'Finalizado' : 'Agendado'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d2d2d' }}>{sh.serviceName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#666', marginTop: '2px' }}>Profissional: {sh.providerName}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #fcfcfc', marginTop: '6px', paddingTop: '6px', fontSize: '0.72rem' }}>
                      <span style={{ color: '#888' }}>Total ({sh.hours} horas)</span>
                      <strong style={{ color: '#f28d1a' }}>R$ {(sh.total || (sh.pricePerHour * sh.hours) || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Avaliações Feitas */}
          {profileSubSection === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {userReviews.map(rev => (
                <div key={rev.id} style={{ border: '1px solid #eee', borderRadius: '16px', padding: '12px', backgroundColor: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2d2d2d' }}>{rev.itemName}</span>
                    <span style={{ fontSize: '0.68rem', color: '#999' }}>{rev.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={12} fill="#f9bb1a" color="#f9bb1a" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#555', margin: 0, lineHeight: 1.3 }}>"{rev.comment}"</p>
                  {rev.images && rev.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {rev.images.map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt="Anexo" 
                          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notificações */}
          {profileSubSection === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(() => {
                const myNotifs = currentUser ? notifications.filter(n => n.userId === currentUser.id) : [];
                if (myNotifs.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: '#999', fontSize: '0.82rem' }}>
                      Nenhuma notificação por aqui uai...
                    </div>
                  );
                }
                return myNotifs.map(n => (
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
                ));
              })()}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', overflowX: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Painel do Cliente Header Bar (Private view only) */}
        {isOwnProfile && !isDesktop && (
          <div style={{
            height: '56px',
            borderBottom: '1px solid #eaeaea',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px',
            flexShrink: 0,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d' }}>
              Painel do Cliente
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => triggerToast("Nenhuma notificação nova por enquanto!")}
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
              </button>
              
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

        {/* Cover */}
        <div style={{
          width: 'calc(100% - 32px)',
          margin: '16px auto 0 auto',
          height: '140px',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          backgroundColor: '#f28d1a'
        }}>
          {user.banner ? (
            <img src={user.banner} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 40%, #e67e22 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={40} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>
          )}
          
          {/* Back button if viewing another user */}
          {!isOwnProfile && (
            <button 
              onClick={() => { setSelectedProfileUserId(null); onSwitchView('client_home'); }}
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {/* Botão Alterar Capa no banner (canto inferior direito) */}
          {isOwnProfile && (
            <>
              <label 
                htmlFor="client-cover-upload"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  zIndex: 10
                }}
              >
                <Camera size={14} />
                <span>Alterar Capa</span>
              </label>
              <input 
                type="file" 
                id="client-cover-upload" 
                accept="image/*" 
                onChange={handleClientCoverUpload} 
                style={{ display: 'none' }} 
              />
            </>
          )}
        </div>

        {/* Profile info header */}
        <div style={{ padding: '16px', position: 'relative', borderBottom: '1px solid #eee' }}>
          <div style={{
            position: 'absolute',
            top: `${(visualLayoutSettings?.avatarOffset?.top !== undefined ? visualLayoutSettings.avatarOffset.top : -36)}px`,
            left: `${(visualLayoutSettings?.avatarOffset?.left !== undefined ? visualLayoutSettings.avatarOffset.left : 32)}px`,
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            border: '3px solid white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            backgroundColor: 'white',
            zIndex: 5
          }}>
            {isVisualEditorActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                zIndex: 10
              }}>
                <span style={{ fontSize: '0.45rem', color: '#fff', fontWeight: 600 }}>Mover</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', width: '42px' }}>
                  <div />
                  <button type="button" onClick={() => updateAvatarOffset('top', -2)} style={{ padding: 0, fontSize: '0.5rem', border: 'none', borderRadius: '2px', cursor: 'pointer', height: '12px' }}>⬆️</button>
                  <div />
                  <button type="button" onClick={() => updateAvatarOffset('left', -2)} style={{ padding: 0, fontSize: '0.5rem', border: 'none', borderRadius: '2px', cursor: 'pointer', height: '12px' }}>⬅️</button>
                  <div />
                  <button type="button" onClick={() => updateAvatarOffset('left', 2)} style={{ padding: 0, fontSize: '0.5rem', border: 'none', borderRadius: '2px', cursor: 'pointer', height: '12px' }}>➡️</button>
                  <div />
                  <button type="button" onClick={() => updateAvatarOffset('top', 2)} style={{ padding: 0, fontSize: '0.5rem', border: 'none', borderRadius: '2px', cursor: 'pointer', height: '12px' }}>⬇️</button>
                  <div />
                </div>
              </div>
            )}
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt="avatar" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                color: '#bbb'
              }}>
                <User size={32} />
              </div>
            )}
            {isOwnProfile && (
              <>
                <label 
                  htmlFor="client-avatar-upload"
                  className="logo-hover-upload"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    zIndex: 2
                  }}
                >
                  <Camera size={16} style={{ color: 'white' }} />
                </label>
                <input 
                  type="file" 
                  id="client-avatar-upload" 
                  accept="image/*" 
                  onChange={handleClientAvatarUpload} 
                  style={{ display: 'none' }} 
                />
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', float: 'right' }}>
            {isOwnProfile ? (
              // Empty space to let Edit Inline triggers align, or a general edit profile button
              <button
                onClick={startEditing}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #ddd',
                  color: '#2d2d2d',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Editar Perfil
              </button>
            ) : (
              <>
                {(() => {
                  const isFollowing = followingIds.includes(user.id);
                  return (
                    <button
                      onClick={(e) => {
                        toggleFollow(user.id, e);
                        triggerToast(isFollowing ? `Deixou de seguir ${user.name}!` : `Seguindo ${user.name}!`);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '99px',
                        backgroundColor: isFollowing ? '#ffffff' : '#f28d1a',
                        color: isFollowing ? '#f28d1a' : 'white',
                        border: isFollowing ? '1px solid #f28d1a' : 'none',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                  );
                })()}
                <button
                  onClick={() => onOpenChat()}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '99px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #ddd',
                    color: '#2d2d2d',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Chat
                </button>
              </>
            )}
          </div>
          
          <div style={{ marginTop: '42px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2d2d2d', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <EditableText textId={`profile_name_${user.id}`} defaultText={user.name} />
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px' }}>
              @<EditableText textId={`profile_username_${user.id}`} defaultText={user.name?.toLowerCase().replace(/\s/g, '') || 'usuario'} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px', lineHeight: 1.3, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <EditableText textId={`profile_bio_${user.id}`} defaultText={user.bio || ''} />
            </p>
            {user.role !== 'client' && (
              <>
                <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> 
                  <span><strong>Endereço:</strong> <EditableText textId={`profile_address_${user.id}`} defaultText={user.address || 'Centro Histórico, Ouro Preto - MG'} /></span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Phone size={12} /> 
                  <span><strong>Telefone:</strong> <EditableText textId={`profile_phone_${user.id}`} defaultText={user.phone || '(31) 99999-1234'} /></span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content list */}
        <div style={{ padding: '16px', paddingBottom: '90px' }}>
          {/* Stats Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '14px',
            border: '1px solid #eee',
            marginBottom: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f28d1a' }}>{isOwnProfile ? followingIds.length : 3}</div>
              <div style={{ fontSize: '0.65rem', color: '#888' }}><EditableText textId="stat_following" defaultText="Seguindo" /></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f28d1a' }}>{userOrders.length}</div>
              <div style={{ fontSize: '0.65rem', color: '#888' }}><EditableText textId="stat_orders" defaultText="Pedidos" /></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f28d1a' }}>{user.ouroCoins || 0}</div>
              <div style={{ fontSize: '0.65rem', color: '#888' }}><EditableText textId="stat_coins" defaultText="OuroCoins" /></div>
            </div>
          </div>

          {/* Sections Menu */}
          {[
            { icon: <ShoppingCart size={16} />, label: 'Pedidos Feitos', key: 'menu_pedidos_feitos', count: userProductsOrders.length, action: () => setProfileSubSection('orders') },
            { icon: <Ticket size={16} />, label: 'Ingressos Comprados', key: 'menu_ingressos_comprados', count: userTickets.length, action: () => onSwitchView('client_tickets') },
            { icon: <Heart size={16} />, label: 'Favoritos', key: 'menu_favoritos', count: isOwnProfile ? favorites.length : 0, action: () => isOwnProfile ? onSwitchView('client_favorites') : triggerToast("Apenas o próprio usuário pode ver seus favoritos.") },
            { icon: <Star size={16} />, label: 'Avaliações Feitas', key: 'menu_avaliacoes_feitas', count: isOwnProfile ? userReviews.length : 2, action: () => setProfileSubSection('reviews') },
            { icon: <StoreIcon size={16} />, label: 'Perfis Seguidos', key: 'menu_perfis_seguidos', count: isOwnProfile ? followingIds.length : 3, action: () => isOwnProfile ? onSwitchView('client_following') : triggerToast("Apenas o próprio usuário pode ver seus perfis seguidos.") },
            { icon: <Wrench size={16} />, label: 'Serviços Realizados', key: 'menu_servicos_realizados', count: userHiredServices.length, action: () => setProfileSubSection('services') },
            ...(isOwnProfile && isDesktop ? [
              { icon: <Bell size={16} />, label: 'Notificações', key: 'menu_notificacoes', count: currentUser ? notifications.filter(n => n.userId === currentUser.id && !n.read).length : 0, action: () => { setProfileSubSection('notifications'); if (currentUser) markNotificationsRead(currentUser.id); } },
              { icon: <LogOut size={16} style={{ color: '#ff5e5b' }} />, label: 'Sair da Conta', key: 'menu_sair', count: null, action: logout }
            ] : [])
          ].map((item, idx) => {
            // Se for perfil público de outro usuário, ocultar Pedidos, Ingressos, Favoritos e Serviços Realizados
            if (!isOwnProfile && (
              item.label === 'Pedidos Feitos' || 
              item.label === 'Ingressos Comprados' || 
              item.label === 'Favoritos' || 
              item.label === 'Serviços Realizados'
            )) {
              return null;
            }
            return (
              <button
                key={idx}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <div style={{ color: '#f28d1a' }}>{item.icon}</div>
                <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d', textAlign: 'left' }}>
                  <EditableText textId={item.key} defaultText={item.label} />
                </span>
                {item.count !== null && (
                  <span style={{ fontSize: '0.72rem', color: '#888', backgroundColor: '#f5f5f5', padding: '2px 10px', borderRadius: '12px' }}>{item.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal de Edição de Perfil */}
        {isEditingProfile && (
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
              padding: '20px',
              width: '100%',
              maxWidth: '350px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }} className="hide-scrollbar">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2d2d2d', marginBottom: '16px', textAlign: 'center' }}>Editar Seu Perfil</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Nome</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                  />
                </div>



                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Biografia</label>
                  <textarea 
                    value={editBio} 
                    onChange={e => setEditBio(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none', resize: 'none' }}
                  />
                </div>

                {user.role !== 'client' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Endereço</label>
                      <input 
                        type="text" 
                        value={editAddress} 
                        onChange={e => setEditAddress(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Telefone</label>
                      <input 
                        type="text" 
                        value={editPhone} 
                        onChange={e => setEditPhone(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #ddd', background: 'none', color: '#666', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveProfileChanges}
                  style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: '#f28d1a', color: 'white', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // View Router for Client Area
  const renderViewContent = () => {
    switch (currentView) {
      case 'client_all_offers': return renderAllOffers();
      case 'client_home': return renderHome();
      case 'client_product': return renderProductDetail();
      case 'client_categories': return renderCategories();
      case 'client_store': return renderStoreView();
      case 'client_event': return renderEventView();
      case 'client_organizer': return renderOrganizerView();
      case 'client_provider': return renderProviderView();
      case 'client_service': return renderServiceView();
      case 'client_cart': return renderCart();
      case 'client_checkout': return renderCheckout();
      case 'client_payment_success': return renderPaymentSuccess();
      case 'client_tracking': return renderTracking();
      case 'client_foryou': return renderForYou();
      case 'client_favorites': return renderFavorites();
      case 'client_tickets': return renderTicketsView();
      case 'client_following': return renderFollowingView();
      case 'client_coupons': return renderCoupons();
      case 'client_ourocoins': return renderOuroCoins();
      case 'client_search': return renderSearch();
      case 'client_profile': return renderClientProfile();
      default: return renderHome();
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflowX: 'hidden', minWidth: 0 }}>
      {renderViewContent()}
      
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
      
      {/* Location Modal */}
      {showLocationModal && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '20px',
            width: '100%',
            maxWidth: '300px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            color: '#2d2d2d'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '8px' }}>Alterar Localização</h3>
            <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '14px', lineHeight: 1.3 }}>Digite seu CEP para recalcularmos as taxas de frete e prazos.</p>
            
            <input 
              type="text"
              placeholder="Ex: 35400-000"
              value={cepLocation}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 8) val = val.slice(0, 8);
                if (val.length > 5) {
                  val = val.slice(0, 5) + '-' + val.slice(5);
                }
                setCepLocation(val);
              }}
              className="input-field"
              style={{ padding: '10px 14px', fontSize: '0.85rem', borderRadius: '12px', marginBottom: '16px', border: '1px solid #ddd', color: '#2d2d2d', backgroundColor: '#fff' }}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowLocationModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, height: '40px', padding: 0, fontSize: '0.8rem', border: '1px solid #ddd' }}
              >
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  const cleanCep = cepLocation.replace(/\D/g, '');
                  if (cleanCep.length === 8) {
                    let addressName;
                    let factor;
                    
                    try {
                      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                      const data = await res.json();
                      if (!data.erro && data.localidade) {
                        addressName = `${data.bairro || 'Centro'}, ${data.localidade} - ${data.uf}`;
                        if (data.localidade.toLowerCase() !== 'ouro preto') {
                          factor = 2.5;
                        } else if (data.bairro?.toLowerCase().includes('barra')) {
                          factor = 1.2;
                        } else if (data.bairro?.toLowerCase().includes('bauxita')) {
                          factor = 1.3;
                        } else if (data.bairro?.toLowerCase().includes('cabeças')) {
                          factor = 1.4;
                        }
                      } else {
                        if (cleanCep.startsWith('35400')) {
                          addressName = 'Centro Histórico, Ouro Preto - MG';
                          factor = 1.0;
                        } else if (cleanCep.startsWith('35402')) {
                          addressName = 'Bauxita, Ouro Preto - MG';
                          factor = 1.3;
                        } else if (cleanCep.startsWith('35408')) {
                          addressName = 'Centro, Mariana - MG';
                          factor = 2.5;
                        } else {
                          addressName = 'Cabeças, Ouro Preto - MG';
                          factor = 1.5;
                        }
                      }
                    } catch {
                      if (cleanCep.startsWith('35400')) {
                        addressName = 'Centro Histórico, Ouro Preto - MG';
                        factor = 1.0;
                      } else if (cleanCep.startsWith('35402')) {
                        addressName = 'Bauxita, Ouro Preto - MG';
                        factor = 1.3;
                      } else {
                        addressName = 'Cabeças, Ouro Preto - MG';
                        factor = 1.5;
                      }
                    }
                    
                    setUserLocation(addressName);
                    setShippingFactor(factor);
                    setShowLocationModal(false);
                  } else {
                    alert('Digite um CEP válido com 8 números!');
                  }
                }}
                className="btn btn-primary"
                style={{ flex: 1, height: '40px', padding: 0, fontSize: '0.8rem', color: '#ffffff' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Product Rating Modal */}
      {ratingProductId && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '320px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            color: '#2d2d2d',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Avaliar Produto</h3>
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', lineHeight: 1.3 }}>Conta pra gente o que achou do produto!</p>
            </div>
            
            {/* Stars Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '8px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '1.8rem',
                    color: star <= reviewRating ? '#f28d1a' : '#ddd',
                    transition: 'transform 0.1s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  ★
                </button>
              ))}
            </div>

            {/* Comment input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>Seu comentário (opcional)</label>
              <textarea
                placeholder="Ex: Produto de ótima qualidade, chegou super rápido!"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{
                  width: '100%',
                  height: '80px',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  color: '#2d2d2d',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* Upload de Imagens */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>
                Adicionar fotos (Máx. 5)
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {reviewImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                      style={{
                        position: 'absolute',
                        top: '1px',
                        right: '1px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '12px',
                        height: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '6px',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {reviewImages.length < 5 && (
                  <label style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1.5px dashed #f28d1a',
                    backgroundColor: '#fff9ee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#f28d1a',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}>
                    +
                    <input
                      type="file"
                      accept="image/*"
                      multiple={reviewImages.length < 4}
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const spaceLeft = 5 - reviewImages.length;
                        const filesToProcess = files.slice(0, spaceLeft);
                        
                        filesToProcess.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setReviewImages(prev => {
                              if (prev.length >= 5) return prev;
                              return [...prev, event.target.result];
                            });
                          };
                          reader.readAsDataURL(file);
                        });
                        e.target.value = ''; // Reset file input
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => {
                  setRatingProductId(null);
                  setReviewImages([]);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.8rem', border: '1px solid #ddd' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  addProductReview(ratingProductId, currentUser?.name || 'Cliente Anônimo', reviewRating, reviewComment, reviewImages);
                  setReviewImages([]);
                  setReviewComment('');
                  setReviewRating(5);
                  setRatingProductId(null);
                  triggerToast("Avaliação enviada com sucesso! Obrigado.");
                }}
                className="btn btn-primary"
                style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.8rem', color: '#ffffff' }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Intermediário de Pré-Checkout (Dados do Cliente) */}
      {showPreCheckoutModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1150,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '320px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            color: '#2d2d2d',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2d2d2d', margin: 0, textAlign: 'center' }}>Confirmar Seus Dados</h3>
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', lineHeight: 1.3, textAlign: 'center' }}>
                Precisamos confirmar suas informações de contato antes de prosseguir.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Nome Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>Nome Completo</label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={preCheckoutName}
                  onChange={(e) => setPreCheckoutName(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    padding: '10px 12px',
                    fontSize: '0.78rem',
                    color: '#2d2d2d',
                    backgroundColor: '#ffffff',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              {/* Telefone Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>Telefone com DDD</label>
                <input
                  type="text"
                  placeholder="(31) 99999-9999"
                  value={preCheckoutPhone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 11) val = val.slice(0, 11);
                    if (val.length > 6) {
                      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
                    } else if (val.length > 2) {
                      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                    } else if (val.length > 0) {
                      val = `(${val.slice(0, 2)}`;
                    }
                    setPreCheckoutPhone(val);
                  }}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    padding: '10px 12px',
                    fontSize: '0.78rem',
                    color: '#2d2d2d',
                    backgroundColor: '#ffffff',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              {/* CPF Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={preCheckoutCpf}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 11) val = val.slice(0, 11);
                    if (val.length > 9) {
                      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6, 9)}-${val.slice(9)}`;
                    } else if (val.length > 6) {
                      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6)}`;
                    } else if (val.length > 3) {
                      val = `${val.slice(0, 3)}.${val.slice(3)}`;
                    }
                    setPreCheckoutCpf(val);
                  }}
                  style={{
                    width: '100%',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    padding: '10px 12px',
                    fontSize: '0.78rem',
                    color: '#2d2d2d',
                    backgroundColor: '#ffffff',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => setShowPreCheckoutModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.8rem', border: '1px solid #ddd' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!preCheckoutName || !preCheckoutPhone || !preCheckoutCpf) {
                    alert('Por favor, preencha todos os campos!');
                    return;
                  }
                  if (currentUser) {
                    updateUserProfile(currentUser.id, {
                      name: preCheckoutName,
                      phone: preCheckoutPhone,
                      cpf: preCheckoutCpf
                    });
                  }
                  setShowPreCheckoutModal(false);
                  if (preCheckoutType === 'event') {
                    setPaymentModalType('event');
                    setActivePaymentTab('pix');
                    setShowPaymentModal(true);
                  } else if (preCheckoutType === 'service') {
                    setPaymentModalType('service');
                    setActivePaymentTab('pix');
                    setShowPaymentModal(true);
                  }
                }}
                className="btn btn-primary"
                style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.8rem', color: '#ffffff' }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div 
          onTouchMove={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px',
            touchAction: 'none'
          }}
        >
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '320px',
            maxHeight: '95%',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            color: '#2d2d2d',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }} className="animate-fade-in">
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={18} style={{ color: '#f28d1a' }} />
                Escolha o Pagamento
              </h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            {/* OuroCoins para Eventos e Serviços */}
            {(paymentModalType === 'event' || paymentModalType === 'service') && currentUser?.ouroCoins > 0 && (
              <div style={{
                backgroundColor: '#fffdf0',
                padding: '12px',
                borderRadius: '16px',
                border: '1.5px solid #f9bb1a30',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 500, color: '#2d2d2d', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    <Coins size={14} style={{ color: '#f28d1a' }} />
                    Usar OuroCoins
                  </h4>
                  <p style={{ fontSize: '0.65rem', color: '#777', margin: '2px 0 0 0' }}>Você tem {currentUser.ouroCoins} moedas (R$ {(currentUser.ouroCoins * 0.01).toFixed(2)})</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={useCoins} 
                    onChange={(e) => setUseCoins(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#f28d1a',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#f28d1a' }}>Usar saldo</span>
                </label>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f5f5f5', padding: '4px', borderRadius: '14px' }}>
              <button
                onClick={() => setActivePaymentTab('pix')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activePaymentTab === 'pix' ? '#ffffff' : 'transparent',
                  color: activePaymentTab === 'pix' ? '#f28d1a' : '#666',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: activePaymentTab === 'pix' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                PIX
              </button>
              <button
                onClick={() => setActivePaymentTab('card')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: activePaymentTab === 'card' ? '#ffffff' : 'transparent',
                  color: activePaymentTab === 'card' ? '#f28d1a' : '#666',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: activePaymentTab === 'card' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Cartão de Crédito
              </button>
            </div>

            {/* Tab Contents */}
            {activePaymentTab === 'pix' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '10px 0' }}>
                <p style={{ fontSize: '0.75rem', color: '#666', textAlign: 'center', margin: 0 }}>
                  Escaneie o QR Code abaixo ou copie a chave Pix para pagar. A aprovação é automática.
                </p>
                {/* QR Code Simulation */}
                <div style={{
                  width: '140px',
                  height: '140px',
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #eaeaea',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '4rem', color: '#ccc' }}>QR</div>
                  <div style={{
                    position: 'absolute',
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#f28d1a',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 500,
                    fontSize: '0.7rem'
                  }}>C+</div>
                </div>

                {/* Copia e Cola Key */}
                <div style={{ width: '100%' }}>
                  <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Chave Pix Copia e Cola</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="text"
                      readOnly
                      value="00020126580014br.gov.bcb.pix0136connectapix-4e1a-85d1-92f758f28d1a"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '0.72rem',
                        borderRadius: '10px',
                        border: '1px solid #ddd',
                        backgroundColor: '#fafafa',
                        color: '#666',
                        outline: 'none'
                      }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136connectapix-4e1a-85d1-92f758f28d1a");
                        triggerToast("Chave PIX copiada!");
                      }}
                      style={{
                        backgroundColor: '#f28d1a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0 12px',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div style={{ width: '100%', borderTop: '1px solid #eee', paddingTop: '14px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '14px' }}>
                    <span>Valor a Pagar:</span>
                    <span style={{ color: '#2d2d2d', fontWeight: 500 }}>R$ {getModalTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handlePaymentSubmit}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '48px', color: '#ffffff', fontWeight: 500 }}
                  >
                    concluir e pagar no PIX
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Número do Cartão</label>
                  <input
                    type="text"
                    placeholder="4444 4444 4444 4444"
                    value={cardNumber}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 16) val = val.slice(0, 16);
                      let formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                      setCardNumber(formatted);
                    }}
                    className="input-field"
                    style={{ padding: '10px 12px', fontSize: '0.78rem', borderRadius: '12px', marginTop: '4px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Validade</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 4) val = val.slice(0, 4);
                        if (val.length > 2) {
                          val = `${val.slice(0, 2)}/${val.slice(2)}`;
                        }
                        setCardExpiry(val);
                      }}
                      className="input-field"
                      style={{ padding: '10px 12px', fontSize: '0.78rem', borderRadius: '12px', marginTop: '4px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 3) val = val.slice(0, 3);
                        setCardCvv(val);
                      }}
                      className="input-field"
                      style={{ padding: '10px 12px', fontSize: '0.78rem', borderRadius: '12px', marginTop: '4px' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Nome no Cartão</label>
                  <input
                    type="text"
                    placeholder="MATEUS O SILVA"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="input-field"
                    style={{ padding: '10px 12px', fontSize: '0.78rem', borderRadius: '12px', marginTop: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 500 }}>Parcelamento</label>
                  <select
                    value={cardInstallments}
                    onChange={(e) => setCardInstallments(e.target.value)}
                    style={{
                      padding: '10px 12px',
                      fontSize: '0.78rem',
                      borderRadius: '12px',
                      marginTop: '4px',
                      width: '100%',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      color: '#2d2d2d',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="1">1x de R$ {getModalTotal().toFixed(2)} (Sem juros)</option>
                    <option value="2">2x de R$ {(getModalTotal() / 2).toFixed(2)} (Sem juros)</option>
                    <option value="3">3x de R$ {(getModalTotal() / 3).toFixed(2)} (Sem juros)</option>
                    <option value="4">4x de R$ {(getModalTotal() / 4).toFixed(2)} (Sem juros)</option>
                    <option value="5">5x de R$ {(getModalTotal() / 5).toFixed(2)} (Sem juros)</option>
                  </select>
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '14px' }}>
                    <span>Valor a Debitar:</span>
                    <span style={{ color: '#2d2d2d', fontWeight: 500 }}>R$ {getModalTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handlePaymentSubmit}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '48px', color: '#ffffff', fontWeight: 500 }}
                  >
                    concluir e pagar no Cartão
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
