import { useState, useEffect, useRef, useMemo } from 'react';
import { useFirebaseMock, EditableText } from '../../context/FirebaseMockContext';
import { IS_BETA_EVENTS_ONLY } from '../../config';
import { 
  MapPin, ShoppingCart, Heart, Search, Clock, 
  Store as StoreIcon, Calendar, Award, ArrowLeft, 
  Trash, Ticket, Check, X, Flame, Sparkles, Play, 
  Coins, Star, Palette, Gift, Wrench, Phone, MessageSquare, Layers, User,
  Plus, Camera, Edit, Bell, LogOut, ChevronRight, Share2, Bus, Briefcase, Mail,
  Tag, Truck, CreditCard, Receipt, AlertTriangle,
  Music, Coffee, Book, Gem, Scissors, Brush, Utensils, Wine, Mountain, Sun, Umbrella, Zap, Leaf
} from 'lucide-react';

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
      
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedBase64);
    };
  };
};

const SectionWrapper = ({ sectionId, children }) => {
  const { isVisualEditorActive, reorderSections } = useFirebaseMock();
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

const BannerCarousel = ({ bannersList, isMobile, onSwitchView, setSelectedCategory }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let interval;
    if (bannersList && bannersList.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % bannersList.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [bannersList]);

  if (!bannersList || bannersList.length === 0) return null;
  const bannerItem = bannersList[currentIndex < bannersList.length ? currentIndex : 0];

  return (
    <div style={{
      width: '100%',
      aspectRatio: isMobile ? '1.64/1' : '3/1',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      marginBottom: '20px',
      boxShadow: '0 8px 24px rgba(242,141,26,0.06)'
    }}>
      <img 
        src={(isMobile && bannerItem.imgMobile) ? bannerItem.imgMobile : bannerItem.img} 
        alt={bannerItem.title || 'Banner'}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      {(bannerItem.title?.trim() || bannerItem.desc?.trim()) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.1) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '20px',
          color: 'white',
          zIndex: 2
        }}>
          {bannerItem.title && <h3 style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#f9bb1a' }}>{bannerItem.title}</h3>}
          {bannerItem.desc && <p style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.9, maxWidth: '60%' }}>{bannerItem.desc}</p>}
          <button
            onClick={() => {
              const linkVal = bannerItem.link || 'Artesanato';
              if (linkVal === 'lojas' || linkVal === 'servicos' || linkVal === 'eventos') {
                setSelectedCategory('Todos');
                if (linkVal === 'lojas') onSwitchView('client_home');
                else onSwitchView('client_categories');
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
      )}

      {bannersList.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '20px',
          display: 'flex',
          gap: '6px',
          zIndex: 3
        }}>
          {bannersList.map((_, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(i);
              }}
              style={{
                width: currentIndex === i ? '12px' : '6px',
                height: '6px',
                borderRadius: '99px',
                backgroundColor: currentIndex === i ? '#ffffff' : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ClientArea({ currentView, onSwitchView, onOpenChat, isVisitor, onTriggerLogin, isEditingProfile, setIsEditingProfile }) {
  const { 
    currentUser, products, events, services, videos, orders, coupons,
    cart, addToCart, updateCartQty, removeFromCart, placeOrder, buyTicket,
    userLocation, likeVideo, unlikeVideo, setUserLocation, hireServiceProvider, users,
    servicesHired, updateUserProfile, logout, notifications, markNotificationsRead,
    isVisualEditorActive, visualLayoutSettings, updateVisualText,
    updateAvatarOffset, reorderSections,
    productReviews, addProductReview, getCoinsUsedInPeriod, categories,
    banners, homeSections, serviceReviews, addServiceReview,
    videoComments, addVideoComment, isDataLoading, jobs, addJobVacancy
  } = useFirebaseMock();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isDataLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#2d2d2d',
        color: '#ffffff',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(242, 141, 26, 0.1)',
          borderTop: '3px solid #f28d1a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.5px' }}>Carregando dados...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const iconComponents = {
    MapPin, ShoppingCart, Heart, Search, Clock, Calendar, Award, 
    Ticket, Flame, Sparkles, Play, Coins, Star, Palette, Gift, 
    Wrench, Phone, MessageSquare, Layers, User, Camera, Truck,
    Music, Coffee, Book, Gem, Scissors, Brush, Utensils, Wine, Mountain, Sun, Umbrella, Zap, Leaf
  };

  const renderCategoryIcon = (iconName) => {
    const IconComp = iconComponents[iconName] || Sparkles;
    return <IconComp size={20} style={{ color: '#f28d1a' }} />;
  };

  // Local navigation state for client details
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState(null);
  const [selectedServiceIdForHire, setSelectedServiceIdForHire] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isEventDescExpanded, setIsEventDescExpanded] = useState(false);
  const [isServiceDescExpanded, setIsServiceDescExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (banners && banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  useEffect(() => {
    const scrollContainer = document.querySelector('.main-content');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [currentView, selectedProductId, selectedEventId, selectedProviderId, selectedCategory, selectedStoreId]);
  
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
  useEffect(() => {
    if (selectedServiceIdForHire) {
      const serv = services.find(s => s.id === selectedServiceIdForHire);
      if (serv) {
        setServiceHours(serv.minHours || 1);
      }
    }
  }, [selectedServiceIdForHire, services]);
  const [serviceDate, setServiceDate] = useState('2026-06-15');
  const [serviceTime, setServiceTime] = useState('14:00');
  const [serviceNotes, setServiceNotes] = useState('');

  // Event buying
  const [ticketQty, setTicketQty] = useState(1);
  const [commissionerCode, setCommissionerCode] = useState('');
  const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);
  const [selectedBatchIndex, setSelectedBatchIndex] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Outros');
  const [reportDescription, setReportDescription] = useState('');

  // ForYou state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef(null);
  const touchStartYRef = useRef(0);
  const mouseDownYRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const [videoLikes, setVideoLikes] = useState({});
  const [likedVideoIds, setLikedVideoIds] = useState([]);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showVideoComments, setShowVideoComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [followingIds, setFollowingIds] = useState([]);
  const [forYouTab, setForYouTab] = useState('foryou');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState('Todos');
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [activeStorePage, setActiveStorePage] = useState(0);
  const [activeEventPage, setActiveEventPage] = useState(0);
  
  // Bus schedule states
  const [selectedBusRoute, setSelectedBusRoute] = useState('bauxita'); // 'bauxita' or 'saramenha'
  const [selectedBusDay, setSelectedBusDay] = useState('weekday'); // 'weekday', 'saturday', 'sunday'
  const [selectedLineForModal, setSelectedLineForModal] = useState(null);
  const [selectedModalBusDay, setSelectedModalBusDay] = useState(0);

  // Job states
  const [jobsSearchQuery, setJobsSearchQuery] = useState('');
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    companyName: '',
    cnpj: '',
    description: '',
    location: 'Ouro Preto - MG',
    contactType: 'whatsapp',
    whatsapp: '',
    email: '',
    photo: ''
  });
  const [newJobFormErrors, setNewJobFormErrors] = useState({});

  // Detail View Thumbnail states
  const [activeProductImageIdx, setActiveProductImageIdx] = useState(0);
  const [activeEventImageIdx, setActiveEventImageIdx] = useState(0);
  const [activeServiceImageIdx, setActiveServiceImageIdx] = useState(0);

  // Variation and Rating states
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedServiceVariation, setSelectedServiceVariation] = useState(null);
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

  // Load followingIds from currentUser on mount/change
  useEffect(() => {
    if (currentUser && currentUser.following && Array.isArray(currentUser.following)) {
      setFollowingIds(currentUser.following);
    }
  }, [currentUser?.id, currentUser?.following?.length]);

  // Redirect detail views to home when required IDs are missing (e.g., page reload)
  useEffect(() => {
    const detailViews = ['client_store', 'client_product', 'client_event', 'client_organizer', 'client_provider', 'client_service'];
    if (detailViews.includes(currentView)) {
      if (
        (currentView === 'client_store' && !selectedStoreId) ||
        (currentView === 'client_product' && !selectedProductId) ||
        (currentView === 'client_event' && !selectedEventId) ||
        (currentView === 'client_organizer' && !selectedOrganizerId) ||
        (currentView === 'client_provider' && !selectedProviderId) ||
        (currentView === 'client_service' && !selectedServiceIdForHire)
      ) {
        onSwitchView('client_home');
      }
    }
  }, []);

  const nearbyStores = (users || []).filter(u => u.role === 'seller' && u.registrationStatus === 'approved' && !u.banned).map(u => {
    // Dynamic rating based on store's products reviews
    const storeProds = (products || []).filter(p => p.storeId === u.id || p.sellerId === u.id);
    const storeProdIds = storeProds.map(p => p.id);
    const storeReviews = productReviews?.filter(r => storeProdIds.includes(r.productId)) || [];
    
    let avgRating = null;
    if (storeReviews.length > 0) {
      const sum = storeReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      avgRating = parseFloat((sum / storeReviews.length).toFixed(1));
    }

    return {
      id: u.id,
      name: u.companyName || u.name || 'Loja',
      desc: (u.category || u.description || 'Loja Parceira').substring(0, 40),
      rating: avgRating,
      ratingCount: storeReviews.length,
      distance: u.distance || '',
      time: u.deliveryTimeEstimate || '',
      shipping: 0,
      logo: u.avatar || u.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
    };
  });

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
    const base = serv.pricePerHour || serv.price || 0;
    if (serv.priceType === 'total') return base;
    return base * serviceHours;
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

    if (ev.hasNumberedSeats && !selectedSeat) {
      alert('Por favor, selecione um assento antes de prosseguir com a compra!');
      return;
    }

    const res = buyTicket(ev.id, selectedBatchIndex, ticketQty, commissionerCode, useCoins, couponApplied ? couponCode : '', selectedSeat);
    if (res.success) {
      setPlacedOrderId(res.order.id);
      setShowPaymentModal(false);
      
      // Reset
      setSelectedSeat(null);
      setCouponCode('');
      setCouponApplied(false);
      setCommissionerCode('');
      setTicketQty(1);

      onSwitchView('client_payment_success');
    } else {
      alert(res.message);
    }
  };

  const handleHiringSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const serv = services.find(s => s.id === selectedServiceIdForHire);
    if (!serv) return;
    const res = hireServiceProvider(serv.id, serviceHours, serviceDate, serviceTime, serviceNotes, useCoins, selectedServiceVariation);
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

    const serv = services.find(s => s.id === selectedServiceIdForHire);
    if (serv && serv.schedule?.enabled) {
      const isAlreadyBooked = (servicesHired || []).some(sh => 
        sh.serviceId === serv.id && 
        sh.date === serviceDate && 
        sh.time === serviceTime && 
        sh.status !== 'rejected'
      );
      if (isAlreadyBooked) {
        alert('Desculpe, este horário já foi reservado por outro cliente! Por favor, escolha outro horário.');
        return;
      }
    }

    if (currentUser?.phone && currentUser?.cpf && currentUser?.name) {
      setPaymentModalType('service');
      setActivePaymentTab('pix');
      setShowPaymentModal(true);
    } else {
      setPreCheckoutType('service');
      setPreCheckoutName(currentUser?.name || '');
      setPreCheckoutPhone(currentUser?.phone || '');
      setPreCheckoutCpf(currentUser?.cpf || '');
      setShowPreCheckoutModal(true);
    }
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

  const handleReportSubmit = () => {
    if (!reportReason) {
      alert('Por favor, selecione o motivo da denúncia!');
      return;
    }
    if (!reportDescription.trim()) {
      alert('Por favor, detalhe sua denúncia!');
      return;
    }
    const res = reportEvent(selectedEventId, reportReason, reportDescription);
    if (res.success) {
      alert('Obrigado! Sua denúncia foi registrada com sucesso e será analisada pela equipe de moderação.');
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
    } else {
      alert(res.message);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setCheckoutPhone(currentUser.phone || '');
      setCheckoutCpf(currentUser.cpf || '');
      setTempAddress(currentUser.address || userLocation);
    } else {
      setCheckoutPhone('');
      setCheckoutCpf('');
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
    const resetScroll = () => {
      const scrollContainers = document.querySelectorAll('.custom-scroll');
      scrollContainers.forEach(el => {
        el.scrollTop = 0;
      });
    };
    resetScroll();
    // Run again in next ticks to ensure newly rendered containers are caught
    const t1 = setTimeout(resetScroll, 20);
    const t2 = setTimeout(resetScroll, 100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentView, selectedProductId, selectedEventId, selectedServiceIdForHire]);

  useEffect(() => {
    if (currentView === 'client_foryou' && videoRef.current) {
      videoRef.current.load();
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
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editCep, setEditCep] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editNumber, setEditNumber] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');
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
  const [ratingServiceHiredId, setRatingServiceHiredId] = useState(null);
  const [serviceReviewRating, setServiceReviewRating] = useState(5);
  const [serviceReviewComment, setServiceReviewComment] = useState('');
  const [serviceReviewImages, setServiceReviewImages] = useState([]);
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
  };

  // Drag to scroll handlers for horizontal lists
  const handleMouseDown = (e) => {
    if (!isDesktop) return; // Ignore on mobile
    const container = e.currentTarget;
    container.dataset.isDown = 'true';
    container.dataset.startX = e.pageX - container.offsetLeft;
    container.dataset.scrollLeft = container.scrollLeft;
    container.dataset.hasDragged = 'false';
  };

  const handleMouseLeave = (e) => {
    if (!isDesktop) return; // Ignore on mobile
    const container = e.currentTarget;
    container.dataset.isDown = 'false';
  };

  const handleMouseUp = (e) => {
    if (!isDesktop) return; // Ignore on mobile
    const container = e.currentTarget;
    container.dataset.isDown = 'false';
  };

  const handleMouseMove = (e) => {
    if (!isDesktop) return; // Ignore on mobile
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
    setActiveStorePage(Math.max(0, pageIndex));
  };

  const handleEventScroll = (e) => {
    const container = e.currentTarget;
    const pageIndex = Math.round(container.scrollLeft / (container.clientWidth * 0.85));
    setActiveEventPage(Math.max(0, pageIndex));
  };

  const toggleFollow = (id, e) => {
    if (e) e.stopPropagation();
    if (isVisitor) {
      onTriggerLogin();
      return;
    }
    const updated = followingIds.includes(id) 
      ? followingIds.filter(item => item !== id) 
      : [...followingIds, id];
    setFollowingIds(updated);
    if (currentUser) {
      updateUserProfile(currentUser.id, { following: updated });
    }
  };

  const videoCommentsList = useMemo(() => {
    const map = {
      vid1: [
        { name: 'Juliana S.', text: 'Nossa, que caneca perfeita! Quero uma!', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
        { name: 'Lucas B.', text: 'Comprei e a qualidade é sensacional.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }
      ],
      vid2: [
        { name: 'Mariana P.', text: 'O festival do ano passado foi incrível!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
        { name: 'Pedro H.', text: 'Confirmadíssimo no 2º lote uai!', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' }
      ],
      vid3: [
        { name: 'Mateus O.', text: 'Excelente passeio histórico. Super recomendo a Ana Cláudia!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
      ]
    };
    
    if (videoComments && videoComments.length > 0) {
      videoComments.forEach(c => {
        if (!map[c.videoId]) {
          map[c.videoId] = [];
        }
        const exists = map[c.videoId].some(item => item.id === c.id || (item.text === c.text && item.name === c.userName));
        if (!exists) {
          map[c.videoId].push({
            id: c.id,
            name: c.userName || 'Cliente',
            text: c.text,
            avatar: c.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
            userId: c.userId,
            createdAt: c.createdAt
          });
        }
      });
    }

    videos.forEach(v => {
      if (v.commentsList && v.commentsList.length > 0) {
        if (!map[v.id]) {
          map[v.id] = [];
        }
        v.commentsList.forEach(c => {
          const exists = map[v.id].some(item => item.id === c.id || (item.text === c.text && item.name === c.userName));
          if (!exists) {
            map[v.id].push({
              id: c.id,
              name: c.userName || 'Cliente',
              text: c.text,
              avatar: c.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
              userId: c.userId,
              createdAt: c.createdAt
            });
          }
        });
      }
    });

    return map;
  }, [videoComments, videos]);

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

  const filteredProducts = selectedCategory 
    ? products.filter(p => {
        if (p.category.toLowerCase() !== selectedCategory.toLowerCase() || !p.active) return false;
        const store = users?.find(u => u.id === p.storeId || u.id === p.sellerId);
        if (!store || store.registrationStatus !== 'approved' || store.banned) return false;
        return true;
      })
    : products.filter(p => {
        if (!p.active) return false;
        const store = users?.find(u => u.id === p.storeId || u.id === p.sellerId);
        if (!store || store.registrationStatus !== 'approved' || store.banned) return false;
        return true;
      });

  // --- SUBVIEW 1: CLIENT HOME ---
  const renderHome = () => {
    const activeBanner = visualLayoutSettings?.homeBanner || {
      title: 'Artesanato & Tradição',
      desc: 'Peças em Pedra-Sabão direto de Ouro Preto',
      img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
      link: 'Artesanato'
    };

    // Top buyers dynamically from users with most orders
    const clientUsers = (users || []).filter(u => u.role === 'client');
    const topBuyers = clientUsers
      .map(u => {
        const userOrders = (orders || []).filter(o => o.customerId === u.id && o.type !== 'ticket');
        return {
          id: u.id,
          rank: 0,
          name: currentUser && u.id === currentUser.id ? `${u.name} (Você)` : u.name,
          orders: userOrders.length,
          coins: u.ouroCoins || 0,
          avatar: u.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
        };
      })
      .sort((a, b) => b.orders - a.orders || b.coins - a.coins)
      .slice(0, 5)
      .map((b, i) => ({ ...b, rank: i + 1 }));



    const getActiveBannersForSection = (blockId) => {
      const selectedId = visualLayoutSettings?.[`active_banner_id_${blockId}`];
      if (selectedId && selectedId !== 'all') {
        const found = (banners || []).find(b => b.id === selectedId);
        if (found) return [found];
      }
      return banners && banners.length > 0 ? banners : [
        {
          id: 'default_banner',
          title: visualLayoutSettings?.homeBanner?.title || 'Artesanato & Tradição',
          desc: visualLayoutSettings?.homeBanner?.desc || 'Peças em Pedra-Sabão direto de Ouro Preto',
          img: visualLayoutSettings?.homeBanner?.img || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
          link: visualLayoutSettings?.homeBanner?.link || 'Artesanato'
        }
      ];
    };

    const section_banner = (blockId = 'banner') => {
      const activeBanners = getActiveBannersForSection(blockId);
      return (
        <SectionWrapper key={blockId} sectionId={blockId}>
          <BannerCarousel 
            bannersList={activeBanners}
            isMobile={isMobile}
            onSwitchView={onSwitchView}
            setSelectedCategory={setSelectedCategory}
          />
        </SectionWrapper>
      );
    };

    const section_categories = (blockId = 'categories') => (
      <SectionWrapper key={blockId} sectionId={blockId}>
        {/* Categories Quick Filter with Dot Indicators */}
        {(() => {
          const homeCategories = [
            { label: 'Tudo', key: null, icon: 'Sparkles' },
            ...(categories || []).filter(c => c.active !== false && c.type !== 'entregadores').map(c => ({ label: c.label, key: c.key || c.label, icon: c.icon }))
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
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                className="hide-scrollbar"
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
                      width: '80px'
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
                      {renderCategoryIcon(cat.icon || 'Sparkles')}
                    </div>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 500, 
                      color: '#666', 
                      textAlign: 'center', 
                      whiteSpace: 'normal', 
                      wordBreak: 'break-word',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: '1.2',
                      height: '24px',
                      width: '100%'
                    }}>{cat.label}</span>
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

    const section_flashDeals = (blockId = 'flashDeals') => (
      <SectionWrapper key={blockId} sectionId={blockId}>
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
            style={{ 
              display: 'flex', 
              gap: '12px', 
              overflowX: 'auto', 
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }} 
            className="hide-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {(products || []).filter(p => {
              if (!p.inFlashDeal || !p.active) return false;
              const store = users?.find(u => u.id === p.storeId || u.id === p.sellerId);
              if (!store || store.registrationStatus !== 'approved' || store.banned) return false;
              return true;
            }).map(prod => {
              const discountPercent = prod.flashDealDiscount || (prod.originalPrice ? Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100) : 0);
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
                      draggable="false"
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

    const section_nearbyStores = (blockId = 'nearbyStores') => (
      <SectionWrapper key={blockId} sectionId={blockId}>
        {/* SECTION: Lojas Perto de Você */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
            <EditableText textId="home_nearby_stores_title" defaultText="Lojas Perto de Você" />
          </h3>
          
          {/* Carousel: horizontal layout scroll */}
          <div 
            style={{ 
              display: 'flex',
              gap: '12px', 
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%'
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
                  minWidth: isDesktop ? '280px' : '240px',
                  flex: isDesktop ? '0 0 280px' : '0 0 80%',
                  border: '1px solid #f7f7f7'
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.68rem', color: '#666', fontWeight: 500, alignItems: 'center', flexWrap: 'wrap' }}>
                      {store.distance ? <span>{store.distance}</span> : null}
                      {store.time ? <span>{store.distance ? ' • ' : ''}{store.time}</span> : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.68rem' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          size={11} 
                          fill={store.rating !== null && store.rating > 0 && star <= Math.round(store.rating) ? "#f9bb1a" : "#ddd"} 
                          stroke="none" 
                        />
                      ))}
                      <span style={{ color: '#666', marginLeft: '4px', fontWeight: 500 }}>
                        {store.rating !== null && store.rating > 0 ? `${store.rating.toFixed(1)} (${store.ratingCount})` : '0 (0)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators para Lojas */}
          {nearbyStores.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
              {Array.from({ length: nearbyStores.length }).map((_, i) => (
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
          )}
        </div>
      </SectionWrapper>
    );

    const section_products = (blockId = 'products') => (
      <SectionWrapper key={blockId} sectionId={blockId}>
        {/* SECTION: Produtos para Você */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
            {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || 'Produtos para Você'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(180px, 1fr))' : 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {(() => {
              const activeProds = (products || []).filter(p => {
                if (!p.active) return false;
                const store = users?.find(u => u.id === p.storeId || u.id === p.sellerId);
                if (!store || store.registrationStatus !== 'approved' || store.banned) return false;
                return true;
              });

              const getProductRating = (p) => {
                const reviews = (productReviews || []).filter(r => r.productId === p.id) || [];
                if (reviews.length > 0) {
                  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                }
                const store = users?.find(u => u.id === p.storeId || u.id === p.sellerId);
                return p.rating || store?.rating || 4.5;
              };

              const getProximityScore = (p) => {
                const store = users?.find(u => u.id === p.storeId || u.id === p.sellerId);
                if (!currentUser || !store) return 0.5;
                const userAddr = (currentUser.address || '').toLowerCase();
                const storeAddr = (store.address || '').toLowerCase();
                if (currentUser.neighborhood && store.address && store.address.toLowerCase().includes(currentUser.neighborhood.toLowerCase())) {
                  return 1.0;
                }
                const commonNeighborhoods = ['centro', 'cabeças', 'bauxita', 'barra', 'pilar', 'antônio dias', 'saramenha'];
                for (const nb of commonNeighborhoods) {
                  if (userAddr.includes(nb) && storeAddr.includes(nb)) {
                    return 1.0;
                  }
                }
                if (userAddr.includes('ouro preto') && storeAddr.includes('ouro preto')) {
                  return 0.7;
                }
                return 0.4;
              };

              const getRotationIndex = (listLen, storeId) => {
                if (listLen <= 1) return 0;
                let hash = 0;
                const str = storeId || '';
                for (let i = 0; i < str.length; i++) {
                  hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                const seed = new Date().getDate() + new Date().getHours();
                return Math.abs(hash + seed) % listLen;
              };

              const getRotationBoost = (storeId) => {
                let hash = 0;
                const str = storeId || '';
                for (let i = 0; i < str.length; i++) {
                  hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                const seed = new Date().getDate() + new Date().getHours();
                return (((hash + seed) % 100) / 100) * 0.3 - 0.15;
              };

              const storeGroups = {};
              activeProds.forEach(p => {
                const sId = p.storeId || p.sellerId;
                if (!storeGroups[sId]) storeGroups[sId] = [];
                storeGroups[sId].push(p);
              });

              const selectedProducts = [];
              Object.keys(storeGroups).forEach(sId => {
                const group = storeGroups[sId];
                const rotIdx = getRotationIndex(group.length, sId);
                const chosen = group[rotIdx];
                if (chosen) selectedProducts.push(chosen);
              });

              return selectedProducts
                .map(p => {
                  const rScore = getProductRating(p) / 5.0;
                  const sScore = Math.min(p.soldCount || 0, 100) / 100;
                  const pScore = getProximityScore(p);
                  const baseRelevance = (rScore * 0.4) + (sScore * 0.3) + (pScore * 0.3);
                  const sId = p.storeId || p.sellerId;
                  const finalScore = baseRelevance + getRotationBoost(sId);
                  return { p, finalScore };
                })
                .sort((a, b) => b.finalScore - a.finalScore)
                .map(item => item.p)
                .slice(0, 12);
            })().map(prod => {
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

    const section_buyers = (blockId = 'buyers') => (
      <SectionWrapper key={blockId} sectionId={blockId}>
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
            {(topBuyers || []).map(buyer => (
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

    const section_events = (blockId = 'events') => {
      if (!events || events.length === 0) return null;
      
      // DESKTOP: Grid (more columns, 1 row)
      if (isDesktop) {
        return (
          <SectionWrapper key={blockId} sectionId={blockId}>
            <div id="events-section" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
                {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || 'Eventos e Festas na Cidade'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {(events || []).map(ev => {
                  const activeBatch = ev.batches && ev.batches.length > 0
                    ? ev.batches.find(b => parseInt(b.limit || 0) > 0 && parseInt(b.sold || 0) < parseInt(b.limit || 0)) || ev.batches[0]
                    : null;
                  const isSoldOut = ev.batches && ev.batches.length > 0 
                    ? ev.batches.every(b => parseInt(b.limit || 0) > 0 && parseInt(b.sold || 0) >= parseInt(b.limit || 0)) 
                    : false;
                  
                  const parsedSold = activeBatch ? parseInt(activeBatch.sold || 0) : 0;
                  const parsedLimit = activeBatch ? parseInt(activeBatch.limit || 0) : 0;
                  const percent = parsedLimit > 0 ? Math.round((parsedSold / parsedLimit) * 100) : 0;
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
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                    >
                      <div>
                        <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', borderRadius: '12px', marginBottom: '8px' }}>
                          <img 
                            src={ev.homepageBanner || ev.image} 
                            alt={ev.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <div style={{ padding: '4px' }}>
                          <div style={{ fontSize: '0.7rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            <span>{ev.date}</span>
                          </div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</h4>
                          <div style={{ fontSize: '0.72rem', color: '#777' }}>Local: {ev.location}</div>
                          <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '2px' }}>Organizador: {ev.organizerName}</div>
                        </div>
                      </div>

                      <div style={{ padding: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #f9f9f9', paddingTop: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#888' }}>Lote: {activeBatch?.name || 'Lote'}</span>
                          <strong style={{ fontSize: '0.8rem', color: isVisitor ? '#ff5e5b' : '#f28d1a', fontWeight: 500 }}>
                            {isVisitor ? 'Bloqueado' : (isSoldOut ? 'Esgotado' : `R$ ${activeBatch ? parseFloat(activeBatch.price || 0).toFixed(2) : '0.00'}`)}
                          </strong>
                        </div>

                        {activeBatch && (
                          <div style={{ marginTop: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#777', marginBottom: '2px' }}>
                              <span>Progresso:</span>
                              <span>{percent}% ({parsedSold}/{parsedLimit})</span>
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
            </div>
          </SectionWrapper>
        );
      }

      // MOBILE: Horizontal scrollable carousel
      return (
        <SectionWrapper key={blockId} sectionId={blockId}>
          <div id="events-section" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
              {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || 'Eventos na Cidade'}
            </h3>
            
            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
              className="hide-scrollbar"
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onScroll={handleEventScroll}
            >
              {(events || []).map(ev => {
                const evActiveBatch = ev.batches && ev.batches.length > 0
                  ? ev.batches.find(b => parseInt(b.limit || 0) > 0 && parseInt(b.sold || 0) < parseInt(b.limit || 0)) || ev.batches[0]
                  : null;
                const evIsSoldOut = ev.batches && ev.batches.length > 0 
                  ? ev.batches.every(b => parseInt(b.limit || 0) > 0 && parseInt(b.sold || 0) >= parseInt(b.limit || 0)) 
                  : false;
                const evSold = evActiveBatch ? parseInt(evActiveBatch.sold || 0) : 0;
                const evLimit = evActiveBatch ? parseInt(evActiveBatch.limit || 0) : 0;
                const evPercent = evLimit > 0 ? Math.round((evSold / evLimit) * 100) : 0;
                
                return (
                  <div
                    key={ev.id}
                    onClick={(e) => {
                      const container = e.currentTarget.parentElement;
                      if (container && container.dataset.hasDragged === 'true') {
                        container.dataset.hasDragged = 'false';
                        return;
                      }
                      setSelectedEventId(ev.id); onSwitchView('client_event');
                    }}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '16px',
                      padding: '10px',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      flex: '0 0 80%',
                      minWidth: '240px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden', borderRadius: '12px', marginBottom: '8px' }}>
                        <img src={ev.homepageBanner || ev.image} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable="false" />
                      </div>
                      <div style={{ padding: '4px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          <span>{ev.date}</span>
                        </div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</h4>
                        <div style={{ fontSize: '0.72rem', color: '#777' }}>Local: {ev.location}</div>
                        <div style={{ fontSize: '0.72rem', color: '#777', marginTop: '2px' }}>Organizador: {ev.organizerName}</div>
                      </div>
                    </div>

                    <div style={{ padding: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #f9f9f9', paddingTop: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>Lote ({evActiveBatch?.name || 'Lote'})</span>
                        <strong style={{ fontSize: '0.82rem', color: isVisitor ? '#ff5e5b' : '#f28d1a', fontWeight: 500 }}>
                          {isVisitor ? 'Bloqueado' : (evIsSoldOut ? 'Esgotado' : `R$ ${evActiveBatch ? parseFloat(evActiveBatch.price || 0).toFixed(2) : '0.00'}`)}
                        </strong>
                      </div>
                      {evActiveBatch && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#777', marginBottom: '2px' }}>
                            <span>Progresso:</span>
                            <span>{evPercent}% ({evSold}/{evLimit})</span>
                          </div>
                          <div style={{ width: '100%', height: '5px', backgroundColor: '#eee', borderRadius: '2.5px', overflow: 'hidden' }}>
                            <div style={{ width: `${evPercent}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2.5px' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {(events || []).length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                {(events || []).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: activeEventPage === idx ? '18px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: activeEventPage === idx ? '#f28d1a' : '#ddd',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </SectionWrapper>
      );
    };


    const section_services = (blockId = 'services') => (
      <SectionWrapper key={blockId} sectionId={blockId}>
        {/* SECTION: Serviços em Destaque */}
        <div id="services-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
            {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || 'Serviços em Destaque'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {(services || []).filter(serv => {
              if (serv.active === false) return false;
              const provider = users?.find(u => u.id === serv.providerId);
              if (!provider || provider.registrationStatus !== 'approved' || provider.banned) return false;
              return true;
            }).map(serv => {
              const sPrice = serv.pricePerHour || serv.price || 0;
              const hasDiscount = serv.originalPrice && sPrice < serv.originalPrice;
              const discountPercent = hasDiscount ? Math.round(((serv.originalPrice - sPrice) / serv.originalPrice) * 100) : 0;
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
                        <strong style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 500 }}>R$ {(serv.pricePerHour || serv.price || 0).toFixed(2)}{serv.priceType === 'total' ? '' : '/h'}</strong>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {serv.originalPrice.toFixed(2)}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                    {(servicesHired || []).filter(sh => sh.serviceId === serv.id && sh.status === 'completed').length} serviços realizados
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionWrapper>
    );

    const renderDynamicSection = (sec, blockIdParam = null) => {
      const blockId = blockIdParam || `dynamic_${sec.id}`;
      if (!sec.itemIds || sec.itemIds.length === 0) return null;

      if (sec.type === 'products') {
        const secProducts = (products || []).filter(p => {
          if (!p.active || !sec.itemIds.includes(p.id)) return false;
          const store = users?.find(u => u.id === p.storeId || u.id === p.sellerId);
          if (!store || store.registrationStatus !== 'approved' || store.banned) return false;
          return true;
        });
        if (secProducts.length === 0) return null;
        return (
          <div key={blockId} style={{ marginBottom: '24px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
              {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || sec.name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {secProducts.map(prod => {
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
        );
      }

      if (sec.type === 'stores') {
        const secStores = (users || []).filter(u => u.role === 'seller' && u.registrationStatus === 'approved' && sec.itemIds.includes(u.id));
        if (secStores.length === 0) return null;
        return (
          <div key={blockId} style={{ marginBottom: '24px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
              {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || sec.name}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {secStores.map(store => (
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
                    border: '1px solid #eee'
                  }}
                >
                  <img 
                    src={store.logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150'} 
                    alt={store.name} 
                    style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.desc || 'Loja parceira Connecta+'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (sec.type === 'services') {
        const secServices = (services || []).filter(s => {
          if (sec.itemIds && !sec.itemIds.includes(s.id)) return false;
          if (s.active === false) return false;
          const provider = users?.find(u => u.id === s.providerId);
          if (!provider || provider.registrationStatus !== 'approved' || provider.banned) return false;
          return true;
        });
        if (secServices.length === 0) return null;
        return (
          <div key={blockId} style={{ marginBottom: '24px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
              {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || sec.name}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {secServices.map(serv => {
                const sPrice = serv.pricePerHour || serv.price || 0;
                const hasDiscount = serv.originalPrice && sPrice < serv.originalPrice;
                const discountPercent = hasDiscount ? Math.round(((serv.originalPrice - sPrice) / serv.originalPrice) * 100) : 0;
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
                          <strong style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 500 }}>R$ {(serv.pricePerHour || serv.price || 0).toFixed(2)}{serv.priceType === 'total' ? '' : '/h'}</strong>
                          {hasDiscount && (
                            <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {serv.originalPrice.toFixed(2)}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      if (sec.type === 'events') {
        const secEvents = (events || []).filter(ev => ev.published && sec.itemIds.includes(ev.id));
        if (secEvents.length === 0) return null;
        return (
          <div key={blockId} style={{ marginBottom: '24px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
              {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || sec.name}
            </h3>
            {secEvents.map(ev => {
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
                    src={ev.homepageBanner || ev.image} 
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
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      
      if (sec.type === 'banners') {
        const selectedId = visualLayoutSettings?.[`active_banner_id_${blockId}`];
        
        let secBanners = [];
        if (selectedId && selectedId !== 'all') {
          const found = (banners || []).find(b => b.id === selectedId);
          if (found) {
            secBanners = [found];
          }
        } else {
          secBanners = (banners || []).filter(b => sec.itemIds && sec.itemIds.includes(b.id));
        }

        if (secBanners.length === 0) return null;

        return (
          <div key={blockId} style={{ marginBottom: '24px' }} className="animate-fade-in">
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
              {visualLayoutSettings?.customTexts?.[`section_title_${blockId}`] || sec.name}
            </h3>
            <BannerCarousel
              bannersList={secBanners}
              isMobile={isMobile}
              onSwitchView={onSwitchView}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        );
      }

      return null;
    };

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
      <div style={{ padding: '16px', paddingBottom: '90px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">


        {/* Localization & Header Actions */}
        <div className="mobile-home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <img 
              src="/logo-full.png" 
              alt="Connecta+" 
              style={{ height: '22px', objectFit: 'contain', display: 'block' }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!IS_BETA_EVENTS_ONLY && (
              <button 
                onClick={() => onSwitchView('client_bus')}
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
                title="Horários de Ônibus"
              >
                <Bus size={16} style={{ color: '#f28d1a' }} />
              </button>
            )}
            {!IS_BETA_EVENTS_ONLY && (
              <button 
                onClick={() => onSwitchView('client_jobs')}
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
                title="Vagas de Emprego"
              >
                <Briefcase size={16} style={{ color: '#f28d1a' }} />
              </button>
            )}
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
            {!IS_BETA_EVENTS_ONLY && (
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
            )}
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
                  olá, <EditableText textId="home_username" defaultText={(currentUser && currentUser.name) ? currentUser.name.split(' ')[0] : 'lindeza'} />!
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

        {(visualLayoutSettings?.sectionOrder || ['banner', 'categories', 'flashDeals', 'nearbyStores', 'products', 'buyers', 'events', 'services'])
          .filter(secId => {
            if (IS_BETA_EVENTS_ONLY) {
              const baseId = secId.includes('__') ? secId.split('__')[0] : secId;
              return ['banner', 'events'].includes(baseId);
            }
            return true;
          })
          .map(secId => {
            const baseId = secId.includes('__') ? secId.split('__')[0] : secId;
            // Seção fixa
            if (sectionsMap[baseId]) return sectionsMap[baseId](secId);
            // Seção dinâmica (prefixo dynamic_)
            if (baseId.startsWith('dynamic_') && homeSections) {
              const dynId = baseId.replace('dynamic_', '');
              const sec = (homeSections || []).find(s => s.id === dynId);
              if (sec) return renderDynamicSection(sec, secId);
            }
            return null;
          })}
      </div>
    );
  };

  // --- SUBVIEW 2: PRODUCT DETAIL ---
  const renderProductDetail = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return <div>Produto sumiu uai...</div>;
    const coinsEarned = Math.round(prod.price * 0.5);
    const images = (prod.images && prod.images.filter(img => img)) || [];
    if (images.length === 0 && prod.image) {
      images.push(prod.image);
    }
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500');
    }
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
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            paddingBottom: '90px',
            display: isDesktop ? 'flex' : 'block',
            gap: isDesktop ? '32px' : '0px',
            padding: isDesktop ? '20px' : '0px',
            maxWidth: isDesktop ? '1000px' : '100%',
            margin: isDesktop ? '0 auto' : '0',
            width: '100%',
            boxSizing: 'border-box'
          }} 
          className="custom-scroll"
        >
          {/* Cover gallery 1:1 with horizontal scroll snap */}
          <div style={{ 
            position: isDesktop ? 'sticky' : 'relative',
            top: isDesktop ? '20px' : '0px',
            width: isDesktop ? '300px' : '100%',
            aspectRatio: '1/1',
            backgroundColor: '#eee',
            overflow: 'hidden',
            flexShrink: 0,
            borderRadius: isDesktop ? '20px' : '0px',
            boxShadow: isDesktop ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
            alignSelf: isDesktop ? 'flex-start' : 'auto',
            zIndex: 1
          }}>
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

          {/* Right side wrapper (on desktop, flows to the right) */}
          <div style={{ flex: 1, minWidth: 0, padding: isDesktop ? '0 10px' : '0px' }}>

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
                src={users?.find(u => u.id === prod.storeId)?.avatar || users?.find(u => u.id === prod.storeId)?.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} 
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
        </div>

        {/* Floating action bar fixed at the bottom */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: isDesktop ? '1000px' : '100%',
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
      label: c.label, key: c.key || c.label, desc: c.desc || '', img: c.image || '', icon: c.icon
    })),
    servicos: categories.filter(c => c.type === 'servicos' && c.active !== false).map(c => ({
      label: c.label, key: c.key || c.label, desc: c.desc || '', img: c.image || '', icon: c.icon
    })),
    eventos: categories.filter(c => c.type === 'eventos' && c.active !== false).map(c => ({
      label: c.label, key: c.key || c.label, desc: c.desc || '', img: c.image || '', icon: c.icon
    }))
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat.key);
    onSwitchView('client_categories');
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
      {cat.img && typeof cat.img === 'string' && cat.img.trim() !== '' && (cat.img.startsWith('http') || cat.img.startsWith('data:')) ? (
        <img
          src={cat.img}
          alt={cat.label}
          style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: '#fff9ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f28d1a',
          flexShrink: 0
        }}>
          {renderCategoryIcon(cat.icon)}
        </div>
      )}
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
    const getStoreRatingInfo = (storeId) => {
      const storeProds = (products || []).filter(p => p.storeId === storeId || p.sellerId === storeId);
      const storeProdIds = storeProds.map(p => p.id);
      const storeReviews = productReviews?.filter(r => storeProdIds.includes(r.productId)) || [];
      
      if (storeReviews.length > 0) {
        const sum = storeReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
        const avg = parseFloat((sum / storeReviews.length).toFixed(1));
        return {
          rating: avg,
          count: storeReviews.length,
          text: `${avg} (${storeReviews.length})`
        };
      }
      return {
        rating: null,
        count: 0,
        text: 'Sem avaliações'
      };
    };
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

    const catObj = categories.find(c => c.key?.toLowerCase() === selectedCategory.toLowerCase() || c.label?.toLowerCase() === selectedCategory.toLowerCase());
    const categoryType = catObj ? catObj.type : 'lojas';

    if (categoryType === 'lojas') {
      const catStores = users.filter(u => u.role === 'seller' && u.registrationStatus === 'approved' && !u.banned && u.category?.toLowerCase() === selectedCategory.toLowerCase());
      const catProds = products.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase() && p.active !== false);

      const hasAnything = catStores.length > 0 || catProds.length > 0;

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

          {!hasAnything ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Search size={32} style={{ color: '#ccc', marginBottom: '8px' }} />
              <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Nenhum estabelecimento ou produto cadastrado nessa categoria uai.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Lojas List */}
              {catStores.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '10px' }}>Lojas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {catStores.map(store => (
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
                          border: '1px solid #eee'
                        }}
                      >
                        <img 
                          src={store.logo || store.avatar || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100'} 
                          alt={store.companyName || store.name} 
                          style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{store.companyName || store.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{store.bio || store.description || 'Loja Parceira'}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                            <div style={{ display: 'flex', gap: '6px', fontSize: '0.68rem', color: '#666', fontWeight: 500, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span>{store.deliveryTimeEstimate || '30-40min'}</span>
                            </div>
                            {(() => {
                              const ratingInfo = getStoreRatingInfo(store.id);
                              const ratingVal = ratingInfo.rating;
                              const ratingCnt = ratingInfo.count;
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.68rem' }}>
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                      key={star} 
                                      size={11} 
                                      fill={ratingVal !== null && ratingVal > 0 && star <= Math.round(ratingVal) ? "#f9bb1a" : "#ddd"} 
                                      stroke="none" 
                                    />
                                  ))}
                                  <span style={{ color: '#666', marginLeft: '4px', fontWeight: 500 }}>
                                    {ratingVal !== null && ratingVal > 0 ? `${ratingVal.toFixed(1)} (${ratingCnt})` : '0 (0)'}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Produtos List */}
              {catProds.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2d2d2d', marginBottom: '10px' }}>Produtos</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '12px'
                  }}>
                    {catProds.map(prod => (
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
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (categoryType === 'servicos') {
      const catServices = services.filter(s => {
        if (s.active === false) return false;
        const provider = users?.find(u => u.id === s.providerId);
        if (!provider || provider.registrationStatus !== 'approved' || provider.banned) return false;
        return s.category?.toLowerCase() === selectedCategory.toLowerCase() || s.serviceCategory?.toLowerCase() === selectedCategory.toLowerCase();
      });

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

          {catServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Search size={32} style={{ color: '#ccc', marginBottom: '8px' }} />
              <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Nenhum serviço cadastrado nessa categoria uai.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {catServices.map(serv => (
                <div
                  key={serv.id}
                  onClick={() => { setSelectedServiceIdForHire(serv.id); setSelectedProviderId(serv.providerId); onSwitchView('client_service'); }}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    border: '1px solid #eee'
                  }}
                >
                  <img 
                    src={serv.image} 
                    alt={serv.name} 
                    style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '14px', marginBottom: '8px' }}
                  />
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{serv.name}</h4>
                  <div style={{ fontSize: '0.68rem', color: '#888' }}>Prestador: {serv.providerName || 'Profissional'}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f28d1a', marginTop: '4px' }}>
                    R$ {(serv.pricePerHour || serv.price || 0).toFixed(2)}{serv.priceType === 'total' ? '' : '/h'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (categoryType === 'eventos') {
      const catEvents = events.filter(e => e.category?.toLowerCase() === selectedCategory.toLowerCase());

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

          {catEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Search size={32} style={{ color: '#ccc', marginBottom: '8px' }} />
              <p style={{ fontSize: '0.88rem', marginTop: '6px' }}>Nenhum evento cadastrado nessa categoria uai.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {catEvents.map(ev => {
                const activeBatch = ev.batches && ev.batches.length > 0
                  ? ev.batches.find(b => parseInt(b.limit || 0) > 0 && parseInt(b.sold || 0) < parseInt(b.limit || 0)) || ev.batches[0]
                  : null;
                const isSoldOut = ev.batches && ev.batches.length > 0 
                  ? ev.batches.every(b => parseInt(b.limit || 0) > 0 && parseInt(b.sold || 0) >= parseInt(b.limit || 0)) 
                  : false;
                return (
                  <div
                    key={ev.id}
                    onClick={() => { setSelectedEventId(ev.id); onSwitchView('client_event'); }}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '20px',
                      padding: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      border: '1px solid #eee'
                    }}
                  >
                    <img 
                      src={ev.image} 
                      alt={ev.name} 
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '14px', marginBottom: '8px' }}
                    />
                    <div style={{ fontSize: '0.68rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', marginTop: '4px' }}>{ev.date}</div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</h4>
                    <div style={{ fontSize: '0.72rem', color: '#777' }}>Local: {ev.location}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #f9f9f9', paddingTop: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#888' }}>{activeBatch?.name || 'Lote'}</span>
                      <strong style={{ fontSize: '0.8rem', color: isVisitor ? '#ff5e5b' : '#f28d1a', fontWeight: 500 }}>
                        {isVisitor ? 'Bloqueado' : (isSoldOut ? 'Esgotado' : `R$ ${activeBatch?.price.toFixed(2)}`)}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

    const followersCount = users.filter(u => u.following && u.following.includes(mockStore.id)).length;
    const storeReviews = productReviews?.filter(r => storeProducts.map(p => p.id).includes(r.productId)) || [];
    let avgRating = 0;
    if (storeReviews.length > 0) {
      const sum = storeReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      avgRating = parseFloat((sum / storeReviews.length).toFixed(1));
    }

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', overflowX: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Cover */}
        <div style={{ padding: '16px 16px 0 16px' }}>
          <div style={{ width: '100%', height: '140px', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
            <img src={mockStore.cover || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 35"><rect width="100" height="35" fill="%23eaeaea"/></svg>'} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        </div>

        {/* Profile info */}
        <div style={{ padding: '16px', position: 'relative', borderBottom: '1px solid #eee' }}>
          <img 
            src={mockStore.logo || mockStore.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} 
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#2d2d2d' }}>
              <EditableText textId={`store_${mockStore.id}_name`} defaultText={mockStore.companyName || mockStore.name} />
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px' }}>
              {mockStore.category}
            </div>

            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px', lineHeight: 1.3, whiteSpace: 'pre-wrap' }}>
              <EditableText textId={`store_${mockStore.id}_desc`} defaultText={mockStore.description} />
            </p>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> <span>Endereço:</span> {mockStore.address}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Phone size={12} /> <span>Telefone:</span> {mockStore.phone}
            </div>
            {mockStore.openingHours && (
              <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Clock size={12} /> <span>Horário:</span> {mockStore.openingHours}
              </div>
            )}
            {mockStore.deliveryTimeEstimate && (
              <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Truck size={12} /> <span>Tempo de Entrega:</span> {mockStore.deliveryTimeEstimate}
              </div>
            )}
            {/* Avaliações e Seguidores */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', color: '#666', marginTop: '8px' }}>
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
                {avgRating > 0 ? avgRating.toFixed(1) : '0'} ({storeReviews.length} {storeReviews.length === 1 ? 'avaliação' : 'avaliações'})
              </span>
              <span>•</span>
              <span style={{ fontWeight: 500 }}>
                {followersCount} {followersCount === 1 ? 'seguidor' : 'seguidores'}
              </span>
            </div>

            {/* Seguidores com foto e nome */}
            {(() => {
              const storeFollowers = users.filter(u => u.following && u.following.includes(mockStore.id));
              if (storeFollowers.length === 0) return null;

              return (
                <div style={{ marginTop: '12px', borderTop: '1px solid #f9f9f9', paddingTop: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#888', fontWeight: 600, marginBottom: '6px' }}>Seguidores:</div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                    {storeFollowers.map(follower => (
                      <div 
                        key={follower.id}
                        onClick={() => {
                          if (follower.role === 'provider') {
                            setSelectedProviderId(follower.id);
                            onSwitchView('client_provider');
                          } else if (follower.role === 'seller') {
                            setSelectedStoreId(follower.id);
                            onSwitchView('client_store');
                          } else if (follower.role === 'organizer') {
                            setSelectedOrganizerId(follower.id);
                            onSwitchView('client_organizer');
                          }
                        }}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          backgroundColor: '#f9f9f9', 
                          padding: '4px 10px', 
                          borderRadius: '99px',
                          cursor: 'pointer',
                          border: '1px solid #f0f0f0',
                          flexShrink: 0
                        }}
                      >
                        <img 
                          src={follower.avatar || follower.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} 
                          alt={follower.name} 
                          style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#333', whiteSpace: 'nowrap' }}>
                          {follower.name || follower.companyName || 'Usuário'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Products grid */}
        <div style={{ padding: '16px', paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Produtos da Loja</h4>
          <div className="responsive-store-grid" style={{ gap: '10px' }}>
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

    const availableBatch = ev.batches.findIndex(b => parseInt(b.sold || 0, 10) < parseInt(b.limit || 0, 10));
    const activeBatch = availableBatch !== -1 ? ev.batches[availableBatch] : null;

    const imgBase = ev.cover || ev.image || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500';
    const images = (ev.images && ev.images.filter(img => img)) || [];
    if (images.length === 0 && imgBase) {
      images.push(imgBase);
    }
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500');
    }
    return (
      <div style={{ backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }} className="animate-fade-in">
        {/* Scrollable Container */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            paddingBottom: '30px',
            display: isDesktop ? 'flex' : 'block',
            gap: isDesktop ? '32px' : '0px',
            padding: isDesktop ? '20px' : '0px',
            maxWidth: isDesktop ? '1000px' : '100%',
            margin: isDesktop ? '0 auto' : '0',
            width: '100%',
            boxSizing: 'border-box'
          }} 
          className="custom-scroll"
        >
          
          {/* Cover gallery 1:1 with horizontal scroll snap */}
          <div style={{ 
            position: isDesktop ? 'sticky' : 'relative',
            top: isDesktop ? '20px' : '0px',
            width: isDesktop ? '300px' : '100%',
            aspectRatio: '1/1',
            backgroundColor: '#eee',
            overflow: 'hidden',
            flexShrink: 0,
            borderRadius: isDesktop ? '20px' : '0px',
            boxShadow: isDesktop ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
            alignSelf: isDesktop ? 'flex-start' : 'auto',
            zIndex: 1
          }}>
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

          {/* Right side wrapper (on desktop, flows to the right) */}
          <div style={{ flex: 1, minWidth: 0, padding: isDesktop ? '0 10px' : '0px' }}>
            {/* Event Main Info */}
            <div style={{ padding: '16px', borderBottom: '1px solid #eee' }}>
              <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                <span>{ev.date}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d', margin: '8px 0 4px 0' }}>{ev.name}</h3>
              <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                <MapPin size={12} style={{ color: '#aaa' }} />
                <span>Local: {ev.location}</span>
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
                  textOverflow: 'ellipsis',
                  whiteSpace: 'pre-wrap'
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
              </div>

              {/* Event Policies */}
              {ev.policies && ev.policies.trim() !== '' && (
                <div style={{ marginTop: '14px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2d2d2d', margin: '0 0 6px 0' }}>Políticas do Evento</h4>
                  <p style={{ fontSize: '0.68rem', color: '#666', lineHeight: 1.4, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {ev.policies}
                  </p>
                </div>
              )}

              {/* Report Event button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#777' }}>Problemas com este evento?</span>
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'transparent',
                    color: '#ff5e5b',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <AlertTriangle size={14} />
                  Denunciar Evento
                </button>
              </div>
            </div>

            {/* Tickets Purchase Area */}
            <div style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Ingressos Disponíveis</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                {ev.batches.map((b, idx) => {
                  const bSold = parseInt(b.sold || 0, 10);
                  const bLimit = parseInt(b.limit || 0, 10);
                  const isSoldOut = bLimit > 0 && bSold >= bLimit;
                  const isActive = selectedBatchIndex === idx;
                  const percent = bLimit > 0 ? Math.round((bSold / bLimit) * 100) : 0;
                  return (
                    <div
                      key={b.name}
                      onClick={() => {
                        if (!isSoldOut) {
                          setSelectedBatchIndex(idx);
                          setSelectedSeat(null);
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        backgroundColor: isActive ? '#f9bb1a15' : '#ffffff',
                        border: isActive ? '1px solid #f28d1a' : '1px solid #eee',
                        opacity: isSoldOut ? 0.6 : 1,
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: isActive ? 600 : 500, color: '#2d2d2d' }}>{b.name}</span>
                        <span style={{ fontSize: '0.78rem', color: isSoldOut ? '#999' : (isVisitor ? '#ff5e5b' : '#f28d1a'), fontWeight: 600 }}>
                          {isSoldOut ? 'Esgotado' : (isVisitor ? 'Bloqueado' : `R$ ${b.price.toFixed(2)}`)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#777', marginTop: '2px' }}>
                        <span>Progresso do lote:</span>
                        <span>{percent}% ({bSold}/{bLimit})</span>
                      </div>
                      <div style={{ width: '100%', height: '5px', backgroundColor: '#eee', borderRadius: '2.5px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2.5px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Seat Map for numbered seats */}
              {ev.hasNumberedSeats && (
                <div style={{ marginTop: '12px', marginBottom: '12px', border: '1px solid #eee', padding: '12px', borderRadius: '16px', backgroundColor: '#fafafa' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2d2d2d', display: 'block', marginBottom: '8px' }}>Selecione seu Assento / Cadeira:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '4px' }}>
                    {Array.from({ length: ev.totalSeats || 0 }, (_, i) => {
                      const seatNum = (i + 1).toString();
                      const isSold = (ev.soldSeats || []).includes(seatNum);
                      const isSelected = selectedSeat === seatNum;
                      return (
                        <button
                          key={seatNum}
                          type="button"
                          disabled={isSold}
                          onClick={() => setSelectedSeat(seatNum)}
                          style={{
                            padding: '6px 0',
                            fontSize: '0.68rem',
                            borderRadius: '6px',
                            border: isSelected ? '1.5px solid #f28d1a' : '1px solid #ddd',
                            backgroundColor: isSold ? '#2d2d2d' : (isSelected ? '#fff7e6' : '#ffffff'),
                            color: isSold ? '#ffffff' : (isSelected ? '#f28d1a' : '#333'),
                            fontWeight: isSelected ? 'bold' : 'normal',
                            cursor: isSold ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s'
                          }}
                          title={isSold ? 'Ocupado' : `Assento ${seatNum}`}
                        >
                          {seatNum}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSeat && (
                    <div style={{ fontSize: '0.7rem', color: '#2ec4b6', marginTop: '6px', fontWeight: 600 }}>
                      Assento selecionado: {selectedSeat}
                    </div>
                  )}
                </div>
              )}

              {(() => {
                const activeBatch = ev.batches[selectedBatchIndex] || ev.batches[0];
                if (!activeBatch) return null;

                const handleApplyEventCoupon = () => {
                  if (!couponCode) return;
                  const found = ev.coupons?.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
                  if (found) {
                    setCouponApplied(true);
                  } else {
                    setCouponApplied(false);
                    alert('Cupom inválido para este evento!');
                  }
                };

                let discountAmount = 0;
                let couponSuccess = '';
                let couponError = '';
                if (couponApplied && couponCode) {
                  const found = ev.coupons?.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
                  if (found) {
                    if (found.discountType === 'percent') {
                      discountAmount = activeBatch.price * (parseFloat(found.value) / 100);
                    } else {
                      discountAmount = parseFloat(found.value);
                    }
                    couponSuccess = `Cupom "${found.code}" aplicado com sucesso!`;
                  } else {
                    couponError = 'Cupom inválido para este evento!';
                  }
                }

                const subtotal = activeBatch.price * ticketQty;
                const totalDiscount = discountAmount * ticketQty;
                const finalPriceAfterDiscount = Math.max(0, subtotal - totalDiscount);
                const hasServiceFee = ev.feeOption === 'repassar';
                const serviceFee = hasServiceFee ? finalPriceAfterDiscount * 0.10 : 0;
                const finalTotal = finalPriceAfterDiscount + serviceFee;

                return (
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
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <input 
                            type="text" 
                            placeholder="Digite o cupom (opcional)" 
                            value={couponCode} 
                            onChange={e => setCouponCode(e.target.value)}
                            disabled={couponApplied}
                            style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.75rem', outline: 'none' }}
                          />
                          {couponApplied ? (
                            <button
                              type="button"
                              onClick={() => { setCouponApplied(false); setCouponCode(''); }}
                              style={{ padding: '0 12px', borderRadius: '8px', backgroundColor: '#ff5e5b', color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Remover
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyEventCoupon}
                              style={{ padding: '0 12px', borderRadius: '8px', backgroundColor: '#f28d1a', color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Aplicar
                            </button>
                          )}
                        </div>
                        {couponSuccess && <span style={{ fontSize: '0.62rem', color: '#2ec4b6', display: 'block', marginTop: '3px' }}>{couponSuccess}</span>}
                        {couponError && <span style={{ fontSize: '0.62rem', color: '#ff5e5b', display: 'block', marginTop: '3px' }}>{couponError}</span>}
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

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#666' }}>
                        <span>Subtotal ({ticketQty}x):</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {totalDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#2ec4b6' }}>
                          <span>Desconto Cupom:</span>
                          <span>- R$ {totalDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      {hasServiceFee && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#666' }}>
                          <span>Taxa de Serviço (10%):</span>
                          <span>R$ {serviceFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, color: '#f28d1a', marginTop: '4px', paddingTop: '4px', borderTop: '1px dotted #eee' }}>
                        <span>Total Final:</span>
                        <span>R$ {finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Aviso legal obrigatório de reembolso */}
                    <div style={{ padding: '8px 10px', backgroundColor: '#f9f9f9', borderLeft: '3px solid #f28d1a', borderRadius: '8px', fontSize: '0.62rem', color: '#777', marginTop: '12px', lineHeight: 1.4 }}>
                      Atenção! O produtor é o único responsável pela devolução de valores referentes ao(s) ingresso(s). Em caso de arrependimento da compra, o reembolso do valor do ingresso somente será efetuado caso a solicitação seja feita no prazo de até 7 dias a contar da data da compra e desde que realizado o pedido de devolução com no máximo 48h de antecedência do horário de início do evento. Situações fora do descrito estarão condicionadas a decisão dos produtores do evento.
                    </div>

                    <button
                      onClick={() => {
                        if (isVisitor) {
                          onTriggerLogin();
                        } else if (currentUser?.phone && currentUser?.cpf && currentUser?.name) {
                          setPaymentModalType('event');
                          setActivePaymentTab('pix');
                          setShowPaymentModal(true);
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
                );
              })()}
            </div>
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
    const organizerFollowersCount = users.filter(u => u.following && u.following.includes(orgId)).length;

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Cover */}
        <div style={{ padding: '16px 16px 0 16px' }}>
          <div style={{ width: '100%', height: '140px', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
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

            {/* Seguidores e Ingressos Vendidos do organizador */}
            {(() => {
              const organizerEventIds = organizerEvents.map(e => e.id);
              const ticketsOrders = (orders || []).filter(o => o.type === 'ticket' && organizerEventIds.includes(o.eventId));
              const totalTicketsSold = ticketsOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);

              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: '#666', marginTop: '8px' }}>
                  <span style={{ fontWeight: 500 }}>
                    {organizerFollowersCount} {organizerFollowersCount === 1 ? 'seguidor' : 'seguidores'}
                  </span>
                  <span>•</span>
                  <span style={{ fontWeight: 500, color: '#f28d1a' }}>
                    {totalTicketsSold} {totalTicketsSold === 1 ? 'ingresso vendido' : 'ingressos vendidos'}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Events Grid */}
        <div style={{ padding: '16px 0', flex: 1, paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px', paddingLeft: '16px' }}>Eventos do Organizador</h4>
          
          <div className="responsive-profile-grid" style={{ gap: '12px', padding: '0 16px' }}>
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

    // Retrieve real provider user document
    const providerUser = users.find(u => u.id === selectedProviderId) || {};
    const providerAvatar = providerUser.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150";
    const providerCover = providerUser.cover || providerUser.banner || "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600";
    const providerName = providerUser.name || prov.providerName;
    const providerDescription = providerUser.description || prov.description || 'Prestador de Serviços no Connecta+';
    const providerAddress = providerUser.address || 'Cabeças - Ouro Preto, MG';
    const providerPhone = providerUser.phone || '(31) 98888-5555';
    const providerHours = providerUser.openingHours || '08:00 às 18:00';

    // Calculate real reviews
    const providerReviewsList = serviceReviews ? serviceReviews.filter(r => r.providerId === selectedProviderId) : [];
    const totalReviews = providerReviewsList.length;
    const avgRating = totalReviews > 0
      ? parseFloat((providerReviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0.0;
    const providerFollowersCount = users.filter(u => u.following && u.following.includes(selectedProviderId)).length;

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Cover */}
        <div style={{ padding: '16px 16px 0 16px' }}>
          <div style={{ width: '100%', height: '140px', position: 'relative', overflow: 'hidden', borderRadius: '16px' }}>
            <img src={providerCover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        </div>

        {/* Profile info */}
        <div style={{ padding: '16px', position: 'relative', borderBottom: '1px solid #eee' }}>
          <img 
            src={providerAvatar} 
            alt={providerName} 
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              position: 'absolute',
              top: '-32px',
              left: '16px',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              objectFit: 'cover',
              backgroundColor: '#ffffff'
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
              {providerName}
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px' }}>
              {providerUser.serviceCategory || prov.category}
            </div>

            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px', marginBottom: '0px', lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>
              {providerDescription}
            </p>
            <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> <span>Endereço:</span> {providerAddress}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Phone size={12} /> <span>Telefone:</span> {providerPhone}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Clock size={12} /> <span>Horário:</span> {providerHours}
            </div>
            {/* Ratings stars display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
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
              <span style={{ fontSize: '0.7rem', color: '#2d2d2d', fontWeight: 500 }}>
                {avgRating > 0 ? avgRating.toFixed(1) : '0'} ({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
              </span>
              <span style={{ fontSize: '0.7rem', color: '#888' }}>•</span>
              <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>
                {providerFollowersCount} {providerFollowersCount === 1 ? 'seguidor' : 'seguidores'}
              </span>
            </div>
          </div>
        </div>

        {/* Services list */}
        <div style={{ padding: '16px 0', paddingBottom: '10px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px', paddingLeft: '16px' }}>Serviços Disponíveis</h4>
          
          <div className="responsive-profile-grid" style={{ gap: '12px', padding: '0 16px' }}>
            {providerServices.map(s => {
              const sPrice = s.pricePerHour || s.price || 0;
              const hasDiscount = s.originalPrice && sPrice < s.originalPrice;
              const discountPercent = hasDiscount ? Math.round(((s.originalPrice - sPrice) / s.originalPrice) * 100) : 0;
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
                        <strong style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 500 }}>R$ {(s.pricePerHour || s.price || 0).toFixed(2)}{s.priceType === 'total' ? '' : '/h'}</strong>
                        {hasDiscount && (
                          <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {s.originalPrice.toFixed(2)}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                    {(servicesHired || []).filter(sh => sh.serviceId === s.id && sh.status === 'completed').length} serviços realizados
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Avaliações dos Clientes */}
        <div style={{ padding: '0 16px', marginTop: '10px', borderTop: '1px solid #f2f2f2', paddingTop: '16px', paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Avaliações dos Clientes ({providerReviewsList.length})</h4>
          {providerReviewsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#999', fontSize: '0.75rem' }}>
              Nenhuma avaliação recebida ainda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {providerReviewsList.map(r => (
                <div key={r.id} style={{ backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '16px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.75rem', color: '#333' }}>{r.customerName}</strong>
                    <span style={{ fontSize: '0.65rem', color: '#999' }}>{r.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} fill={i < r.rating ? '#f28d1a' : '#ddd'} stroke="none" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#555', margin: 0, lineHeight: 1.3 }}>"{r.comment || 'Sem comentário.'}"</p>
                  {r.images && r.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      {r.images.map((img, idx) => (
                        <img key={idx} src={img} alt="review" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  };

  // --- SUBVIEW 6b: SERVICE DETAIL (VER SERVIÇO) ---
  const renderServiceView = () => {
    const serv = services.find(s => s.id === selectedServiceIdForHire) || services[0];
    if (!serv) return <div>Serviço não encontrado uai...</div>;
    const imgBase = serv.image || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500';
    const images = (serv.images && serv.images.filter(img => img)) || [];
    if (images.length === 0 && imgBase) {
      images.push(imgBase);
    }
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500');
    }
    return (
      <div style={{ backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }} className="animate-fade-in">
        {/* Scrollable Container */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            paddingBottom: '30px',
            display: isDesktop ? 'flex' : 'block',
            gap: isDesktop ? '32px' : '0px',
            padding: isDesktop ? '20px' : '0px',
            maxWidth: isDesktop ? '1000px' : '100%',
            margin: isDesktop ? '0 auto' : '0',
            width: '100%',
            boxSizing: 'border-box'
          }} 
          className="custom-scroll"
        >
          
          {/* Cover gallery 1:1 with horizontal scroll snap */}
          <div style={{ 
            position: isDesktop ? 'sticky' : 'relative',
            top: isDesktop ? '20px' : '0px',
            width: isDesktop ? '300px' : '100%',
            aspectRatio: '1/1',
            backgroundColor: '#eee',
            overflow: 'hidden',
            flexShrink: 0,
            borderRadius: isDesktop ? '20px' : '0px',
            boxShadow: isDesktop ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
            alignSelf: isDesktop ? 'flex-start' : 'auto',
            zIndex: 1
          }}>
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

          {/* Right side wrapper (on desktop, flows to the right) */}
          <div style={{ flex: 1, minWidth: 0, padding: isDesktop ? '0 10px' : '0px' }}>

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

          {/* Service Variations Selector */}
          {serv.variations && serv.variations.length > 0 && (
            <div style={{ padding: '0 16px', marginTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#444', display: 'block', marginBottom: '8px' }}>Variações disponíveis</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {serv.variations.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => setSelectedServiceVariation(selectedServiceVariation?.id === v.id ? null : v)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: selectedServiceVariation?.id === v.id ? '2px solid #f28d1a' : '1px solid #eee',
                      backgroundColor: selectedServiceVariation?.id === v.id ? '#fff8ef' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={v.image} alt={v.text} style={{ width: '30px', height: '30px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.75rem', flex: 1, color: '#333' }}>{v.text}</span>
                    {v.price > 0 && <span style={{ fontSize: '0.7rem', color: '#f28d1a', fontWeight: 600 }}>+R$ {v.price.toFixed(2)}</span>}
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: selectedServiceVariation?.id === v.id ? '2px solid #f28d1a' : '2px solid #ccc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {selectedServiceVariation?.id === v.id && (
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f28d1a' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduling Form */}
          <div style={{ padding: '16px', paddingBottom: '30px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Agendamento</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {serv.priceType !== 'total' && (
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
              )}

              {serv.schedule?.enabled ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {serv.schedule.type === 'variable' ? (
                    <div>
                      <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Datas e Horários Disponíveis</label>
                      {serv.schedule.variableSlots && serv.schedule.variableSlots.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', maxHeight: '160px', overflowY: 'auto' }} className="custom-scroll">
                          {serv.schedule.variableSlots.map(slot => {
                            const isBooked = (servicesHired || []).some(sh => 
                              sh.serviceId === serv.id && 
                              sh.date === slot.date && 
                              sh.time === slot.time && 
                              sh.status !== 'rejected'
                            );
                            const isSelected = serviceDate === slot.date && serviceTime === slot.time;
                            
                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={isBooked}
                                onClick={() => {
                                  setServiceDate(slot.date);
                                  setServiceTime(slot.time);
                                }}
                                style={{
                                  padding: '10px 8px',
                                  borderRadius: '12px',
                                  border: isSelected ? '2px solid #f28d1a' : '1px solid #ddd',
                                  backgroundColor: isSelected ? '#f28d1a10' : isBooked ? '#f5f5f5' : '#ffffff',
                                  color: isBooked ? '#999' : '#333',
                                  fontSize: '0.72rem',
                                  fontWeight: isSelected ? '600' : 'normal',
                                  textAlign: 'center',
                                  cursor: isBooked ? 'not-allowed' : 'pointer',
                                  textDecoration: isBooked ? 'line-through' : 'none',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                <span>{slot.date.split('-').reverse().join('/')}</span>
                                <span style={{ fontWeight: 600, color: isBooked ? '#aaa' : '#f28d1a' }}>
                                  {slot.time} {isBooked && '(Reservado)'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '12px', textAlign: 'center', backgroundColor: '#fcfcfc', borderRadius: '12px', border: '1px dashed #ddd', fontSize: '0.72rem', color: '#777' }}>
                          Nenhuma data disponível para este serviço no momento.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Fixed Schedule Date Selection */}
                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 600 }}>1. Escolha a Data</label>
                        <input 
                          type="date" 
                          value={serviceDate}
                          onChange={(e) => {
                            setServiceDate(e.target.value);
                            setServiceTime(''); // reset time
                          }}
                          style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.78rem', marginTop: '4px', outline: 'none' }}
                          required
                        />
                      </div>

                      {/* Fixed Schedule Time Selection */}
                      <div>
                        <label style={{ fontSize: '0.68rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '6px' }}>2. Horários Disponíveis para este dia</label>
                        {serviceDate ? (() => {
                          const selectedDateObj = new Date(serviceDate + 'T00:00:00');
                          const dayOfWeek = selectedDateObj.getDay();
                          const availableFixedSlots = serv.schedule?.fixedSlots ? serv.schedule.fixedSlots.filter(fs => fs.dayOfWeek === dayOfWeek) : [];
                          
                          const days = {
                            1: 'Segunda-feira',
                            2: 'Terça-feira',
                            3: 'Quarta-feira',
                            4: 'Quinta-feira',
                            5: 'Sexta-feira',
                            6: 'Sábado',
                            0: 'Domingo'
                          };

                          if (availableFixedSlots.length === 0) {
                            return (
                              <div style={{ padding: '10px', fontSize: '0.7rem', color: '#999', backgroundColor: '#fcfcfc', borderRadius: '10px', border: '1px dashed #ddd', textAlign: 'center' }}>
                                O prestador não atende às {days[dayOfWeek]}s. Por favor, escolha outro dia!
                              </div>
                            );
                          }

                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                              {availableFixedSlots.map(slot => {
                                const isBooked = (servicesHired || []).some(sh => 
                                  sh.serviceId === serv.id && 
                                  sh.date === serviceDate && 
                                  sh.time === slot.time && 
                                  sh.status !== 'rejected'
                                );
                                const isSelected = serviceTime === slot.time;

                                return (
                                  <button
                                    key={slot.id}
                                    type="button"
                                    disabled={isBooked}
                                    onClick={() => setServiceTime(slot.time)}
                                    style={{
                                      padding: '8px 4px',
                                      borderRadius: '10px',
                                      border: isSelected ? '2px solid #f28d1a' : '1px solid #ddd',
                                      backgroundColor: isSelected ? '#f28d1a10' : isBooked ? '#f5f5f5' : '#ffffff',
                                      color: isBooked ? '#bbb' : '#333',
                                      fontSize: '0.72rem',
                                      fontWeight: isSelected ? '600' : 'normal',
                                      cursor: isBooked ? 'not-allowed' : 'pointer',
                                      textDecoration: isBooked ? 'line-through' : 'none',
                                      transition: 'all 0.2s ease',
                                      textAlign: 'center'
                                    }}
                                  >
                                    {slot.time} {isBooked && '(Reservado)'}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })() : (
                          <div style={{ padding: '10px', fontSize: '0.7rem', color: '#999', backgroundColor: '#fcfcfc', borderRadius: '10px', border: '1px dashed #ddd', textAlign: 'center' }}>
                            Escolha uma data acima para visualizar os horários disponíveis do prestador.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
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
              )}

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
                  {isVisitor ? 'Bloqueado' : `R$ ${((serv.priceType === 'total' ? (serv.pricePerHour || serv.price || 0) : ((serv.pricePerHour || serv.price || 0) * serviceHours)) + (selectedServiceVariation?.price || 0)).toFixed(2)}`}
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
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: isDesktop ? '1000px' : '100%',
          backgroundColor: '#ffffff',
          padding: '16px',
          borderTop: '1px solid #eaeaea',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.05)',
          zIndex: 100,
          boxSizing: 'border-box'
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
          address: currentUser.address || tempAddress || userLocation
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

    const handleWheel = (e) => {
      const now = Date.now();
      if (now - lastWheelTimeRef.current < 800) {
        return;
      }
      if (e.deltaY > 20) {
        lastWheelTimeRef.current = now;
        handleNextVideo();
      } else if (e.deltaY < -20) {
        lastWheelTimeRef.current = now;
        handlePrevVideo();
      }
    };

    const handleLike = () => {
      const isAlreadyLiked = activeVideo.likedBy && activeVideo.likedBy.includes(currentUser?.id);
      if (isAlreadyLiked) {
        unlikeVideo(activeVideo.id);
      } else {
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
          onWheel={handleWheel}
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
            key={activeVideo.id}
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
              const creator = users?.find(u => u.id === activeVideo.creatorId);
              const role = creator?.role || '';
              if (role === 'seller' || activeVideo.linkedType === 'product') {
                setSelectedStoreId(activeVideo.creatorId);
                onSwitchView('client_store');
              } else if (role === 'provider' || activeVideo.linkedType === 'service') {
                setSelectedProviderId(activeVideo.creatorId);
                onSwitchView('client_provider');
              } else if (role === 'events' || activeVideo.linkedType === 'event') {
                setSelectedOrganizerId(activeVideo.creatorId);
                onSwitchView('client_organizer');
              } else {
                setSelectedStoreId(activeVideo.creatorId);
                onSwitchView('client_store');
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
              {(() => {
                const creator = users?.find(u => u.id === activeVideo.creatorId);
                const avatarUrl = creator?.avatar || creator?.logo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
                return (
                  <img 
                    src={avatarUrl} 
                    alt="creator" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                );
              })()}
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
                fill={activeVideo.likedBy && activeVideo.likedBy.includes(currentUser?.id) ? "#ff5e5b" : "none"} 
                color={activeVideo.likedBy && activeVideo.likedBy.includes(currentUser?.id) ? "#ff5e5b" : "white"} 
              />
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 500 }}>{activeVideo.likedBy ? activeVideo.likedBy.length : (activeVideo.likes || 0)}</span>
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
        </div>

        {/* Video Descriptions & Title Overlay (Left Bottom) */}
        <div style={{
          position: 'absolute',
          left: '16px',
          bottom: (activeVideo.linkedType && activeVideo.linkedId) ? '120px' : '25px',
          right: '80px',
          zIndex: 5,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          textAlign: 'left',
          transition: 'bottom 0.2s ease-in-out'
        }}>
          <h4 
            onClick={(e) => {
              e.stopPropagation();
              const creator = users?.find(u => u.id === activeVideo.creatorId);
              const role = creator?.role || '';
              if (role === 'seller' || activeVideo.linkedType === 'product') {
                setSelectedStoreId(activeVideo.creatorId);
                onSwitchView('client_store');
              } else if (role === 'provider' || activeVideo.linkedType === 'service') {
                setSelectedProviderId(activeVideo.creatorId);
                onSwitchView('client_provider');
              } else if (role === 'events' || activeVideo.linkedType === 'event') {
                setSelectedOrganizerId(activeVideo.creatorId);
                onSwitchView('client_organizer');
              } else {
                setSelectedStoreId(activeVideo.creatorId);
                onSwitchView('client_store');
              }
            }}
            style={{ fontSize: '0.92rem', fontWeight: 500, color: '#ffffff', margin: 0, cursor: 'pointer' }}
          >
            {(() => {
              const creator = users?.find(u => u.id === activeVideo.creatorId);
              const displayName = creator?.companyName || creator?.name || activeVideo.creatorName || 'Parceiro';
              return `@${displayName}`;
            })()}
          </h4>
          <h5 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', margin: '4px 0 2px 0' }}>
            {activeVideo.title}
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <p 
              onClick={(e) => { e.stopPropagation(); setDescExpanded(!descExpanded); }}
              style={{ 
                fontSize: '0.75rem', 
                color: '#eaeaea', 
                margin: 0, 
                lineHeight: 1.3,
                cursor: 'pointer',
                width: '100%',
                ...(!descExpanded ? {
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                } : {
                  whiteSpace: 'normal',
                  wordBreak: 'break-word'
                })
              }}
            >
              {activeVideo.desc || activeVideo.description || ''}
            </p>
            {(activeVideo.desc || activeVideo.description) && (
              <button 
                onClick={(e) => { e.stopPropagation(); setDescExpanded(!descExpanded); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f28d1a',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '2px 0 0 0',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {descExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>
        </div>

        {/* TIKTOK SHOP LINKING POPUP (Overlay at the bottom) */}
        {(() => {
          if (!activeVideo.linkedType || !activeVideo.linkedId) return null;
          
          let linkedName = activeVideo.linkedName || 'Item Destaque';
          let linkedPrice = activeVideo.linkedPrice;
          let linkedImage = activeVideo.poster;
          
          if (activeVideo.linkedType === 'product') {
            const p = products?.find(prod => prod.id === activeVideo.linkedId);
            if (p) {
              linkedName = p.name;
              linkedPrice = p.price;
              linkedImage = p.image || p.images?.[0] || activeVideo.poster;
            }
          } else if (activeVideo.linkedType === 'service') {
            const s = services?.find(serv => serv.id === activeVideo.linkedId);
            if (s) {
              linkedName = s.name || s.title;
              linkedPrice = s.price || s.pricePerHour;
              linkedImage = s.image || s.images?.[0] || activeVideo.poster;
            }
          } else if (activeVideo.linkedType === 'event') {
            const evt = events?.find(e => e.id === activeVideo.linkedId);
            if (evt) {
              linkedName = evt.title || evt.name;
              linkedPrice = evt.price || evt.ticketPrice;
              linkedImage = evt.image || evt.coverImage || activeVideo.poster;
            }
          }
          
          const parsedPrice = parseFloat(linkedPrice);
          const displayPrice = isNaN(parsedPrice) ? 'Consultar' : `R$ ${parsedPrice.toFixed(2)}`;
          
          return (
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
                src={linkedImage} 
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
                  {linkedName}
                </h5>
                <strong style={{ fontSize: '0.82rem', color: isVisitor ? '#ff5e5b' : '#f28d1a' }}>
                  {isVisitor ? 'Bloqueado' : displayPrice}
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
          );
        })()}

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
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#333' }}>
                      <img 
                        src={c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                        alt={c.name} 
                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div>
                        <span style={{ color: '#2d2d2d', fontWeight: 'normal' }}>{c.name}: </span>
                        <span>{c.text}</span>
                      </div>
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
                  if (isVisitor) {
                    onTriggerLogin();
                    return;
                  }
                  if (newCommentText.trim() !== '') {
                    addVideoComment(
                      activeVideo.id,
                      currentUser?.name || 'Cliente',
                      currentUser?.avatar || '',
                      newCommentText,
                      currentUser?.id || ''
                    );
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
            style={{ background: 'none', border: 'none', outline: 'none', boxShadow: 'none', textDecoration: 'none', padding: 0, cursor: 'pointer', color: '#f28d1a' }}
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
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: o.status === 'checked_in' ? '#888' : '#f28d1a' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingLeft: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: o.status === 'checked_in' ? '#888' : '#f28d1a' }}>Ticket #{o.id}</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    color: o.status === 'checked_in' ? '#ff5e5b' : '#2ec4b6',
                    backgroundColor: o.status === 'checked_in' ? '#ffebe9' : '#e6f9f6',
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}>
                    {o.status === 'checked_in' ? 'Utilizado' : 'Confirmado'}
                  </span>
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
                  <span style={{ fontSize: '0.68rem', color: '#999' }}>
                    {o.status === 'checked_in' ? `Entrada validada às ${o.checkInTime}` : 'Apresente na portaria do evento'}
                  </span>
                  <button 
                    onClick={() => setSelectedTicketForModal(o)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      border: `1px solid ${o.status === 'checked_in' ? '#ccc' : '#f28d1a'}`, 
                      background: 'none', 
                      color: o.status === 'checked_in' ? '#888' : '#f28d1a', 
                      fontSize: '0.7rem', 
                      fontWeight: 600, 
                      cursor: 'pointer' 
                    }}
                  >
                    Ver QR Code
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Modal */}
        {selectedTicketForModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }} onClick={() => setSelectedTicketForModal(null)}>
            <div style={{
              width: '100%',
              maxWidth: '340px',
              backgroundColor: '#1e1e1e',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              position: 'relative'
            }} onClick={e => e.stopPropagation()}>
              
              {/* Event Cover Image Area */}
              <div style={{ height: '140px', position: 'relative', overflow: 'hidden' }}>
                <img 
                  src={selectedTicketForModal.eventImage || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400'} 
                  alt="Evento" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: 0, right: 0, bottom: 0, left: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(30,30,30,1) 100%)'
                }} />
                
                {/* Header elements inside cover */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '99px', fontWeight: 600 }}>
                    Connecta+ Eventos
                  </span>
                  <button 
                    onClick={() => setSelectedTicketForModal(null)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '28px', height: '28px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Ticket Details */}
              <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#ffaf5b', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {selectedTicketForModal.batchName || 'Lote Único'}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', margin: '4px 0 12px 0', lineHeight: 1.2 }}>
                  {selectedTicketForModal.eventName}
                </h3>
                
                {/* Ticket separation line (Serrated Ticket Stub Style) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0' }}>
                  <div style={{ width: '10px', height: '20px', backgroundColor: '#000', borderRadius: '0 10px 10px 0', marginLeft: '-20px' }} />
                  <div style={{ flex: 1, borderTop: '1px dashed rgba(255,255,255,0.15)' }} />
                  <div style={{ width: '10px', height: '20px', backgroundColor: '#000', borderRadius: '10px 0 0 10px', marginRight: '-20px' }} />
                </div>

                {/* QR Code Container */}
                <div style={{ margin: '12px 0' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedTicketForModal.id}`} 
                    alt="Ingresso QR Code" 
                    style={{ 
                      width: '160px', 
                      height: '160px', 
                      margin: '0 auto', 
                      display: 'block', 
                      padding: '8px', 
                      backgroundColor: 'white', 
                      borderRadius: '16px' 
                    }} 
                  />
                  <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '6px', fontWeight: 500 }}>
                    Código: #{selectedTicketForModal.id}
                  </div>
                </div>

                {/* Info Block */}
                <div style={{ backgroundColor: '#282828', borderRadius: '14px', padding: '10px 14px', margin: '14px 0', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#999' }}>Titular:</span>
                    <span style={{ fontSize: '0.68rem', color: '#fff', fontWeight: 600 }}>{selectedTicketForModal.customerName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#999' }}>Quantidade:</span>
                    <span style={{ fontSize: '0.68rem', color: '#fff', fontWeight: 600 }}>{selectedTicketForModal.quantity} {selectedTicketForModal.quantity === 1 ? 'ingresso' : 'ingressos'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', color: '#999' }}>Data do Evento:</span>
                    <span style={{ fontSize: '0.68rem', color: '#fff', fontWeight: 600 }}>{selectedTicketForModal.eventDate}</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  borderRadius: '99px',
                  backgroundColor: selectedTicketForModal.status === 'checked_in' ? 'rgba(255, 94, 91, 0.15)' : 'rgba(46, 196, 182, 0.15)',
                  color: selectedTicketForModal.status === 'checked_in' ? '#ff5e5b' : '#2ec4b6',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  marginBottom: '10px'
                }}>
                  <div style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: selectedTicketForModal.status === 'checked_in' ? '#ff5e5b' : '#2ec4b6' 
                  }} />
                  {selectedTicketForModal.status === 'checked_in' 
                    ? `Utilizado às ${selectedTicketForModal.checkInTime}` 
                    : 'Ingresso Válido • Portaria Liberada'
                  }
                </div>

                <button 
                  onClick={() => setSelectedTicketForModal(null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '14px',
                    border: 'none',
                    background: '#f28d1a',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '10px',
                    transition: 'all 0.2s'
                  }}
                >
                  Fechar Carteira
                </button>
              </div>

            </div>
          </div>
        )}
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

              const name = u ? ((u.role === 'seller' || u.role === 'organizer') ? (u.companyName || u.name) : u.name) : s.name;
              const logo = u ? (u.avatar || u.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>') : s.logo;
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
            const isPercent = cp.discountType === 'percent' || cp.discountType === 'percentage';
            const tag = isPercent ? `${cp.value}% OFF` : `R$ ${cp.value.toFixed(2)}`;
            const desc = isPercent
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

  // --- SUBVIEW: BUS SCHEDULES ---
  const renderBusSchedule = () => {
    const linesData = {
      'BAUXITA X RODOVIÁRIA': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['12:00', '12:30', '13:10', '13:40', '14:20', '14:50', '15:30', '16:00', '16:40', '17:10', '17:50*Cooperouro', '18:20*Cooperouro'],
            volta: ['11:20', '11:40', '12:35', '13:05', '13:45', '14:55', '15:25', '16:05', '16:35', '17:15', '17:45']
          }
        ],
        notes: 'Os horários de 17:50 e 18:20 têm o ponto final na Cooperouro. Não opera sábados, domingos e feriados.'
      },
      'COOPEROURO X M. S. SEBASTIÃO': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:20*Via Veloso', '07:30', '08:20*Saída do Pocinho', '09:20*Não passa na UFOP', '10:30*Saída do Pocinho', '11:25*Reforço até Morro Santana', '12:00', '13:00*Saída do Pocinho', '14:20', '15:10*Saída do Pocinho', '16:30*Reforço até Morro Santana', '16:40', '17:30', '19:20', '21:45'],
            volta: ['05:40', '06:30', '07:00*Em Trânsito', '07:10', '08:30', '09:20', '11:00', '12:00', '13:10', '14:00', '15:30', '16:20', '17:40', '18:40', '20:20']
          },
          {
            tabLabel: 'Sábado',
            ida: ['06:10*Saída do Pocinho', '08:10*Saída do Pocinho', '10:20*Saída do Pocinho', '12:10*Saída do Pocinho', '14:10*Saída do Pocinho', '16:10*Saída do Pocinho', '18:20*Saída do Pocinho', '21:45*Saída do Pocinho'],
            volta: ['07:05', '09:10', '11:10', '13:10', '15:10', '17:10', '19:10']
          }
        ],
        notes: 'Viagens especiais partem do Pocinho ou Morro Santana. Não há atendimento aos domingos e feriados.'
      },
      'COOPEROURO X PIEDADE': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['08:50', '11:00', '13:00', '15:20', '17:00*Via Praça', '19:10*Via Praça', '21:20*Via Praça', '22:40*Via Praça'],
            volta: ['06:10', '07:30', '10:00', '12:00', '14:20', '16:10*Via Praça', '18:10', '20:20', '22:10*Rota Estendida']
          },
          {
            tabLabel: 'Sábado, Domingo e Feriado',
            ida: ['17:00', '19:10'],
            volta: ['06:10', '20:00']
          }
        ],
        notes: 'Viagem das 22:10 realiza itinerário estendido via Praça Tiradentes, Av. JK e Fundação Gorceix.'
      },
      'COOPEROURO X SANTA CRUZ': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['09:40', '11:45', '15:40', '17:00', '19:20', '21:30', '22:40'],
            volta: ['06:20', '07:20', '08:35', '10:40', '12:50', '18:10', '20:25']
          },
          {
            tabLabel: 'Sábado',
            ida: [],
            volta: ['06:20']
          }
        ],
        notes: 'Não há atendimento aos domingos e feriados.'
      },
      'JARDIM ALVORADA X HOSPITAL': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:20', '07:15'],
            volta: []
          }
        ],
        notes: 'Não há atendimento aos sábados, domingos e feriados.'
      },
      'M. SANTANA X SÃO CRISTÓVÃO': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Atendimento pela linha Morro São Sebastião',
            ida: [],
            volta: []
          }
        ],
        notes: 'Esta linha é atendida pela linha do Morro São Sebastião.'
      },
      'M. S. SEBASTIÃO X SÃO CRISTÓVÃO': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:00*Saída Morro Santana', '06:15*Saída Morro São Sebastião', '06:30*Saída Morro Santana', '06:30*Saída Morro São Sebastião', '07:00*Saída Morro Santana', '07:30*Saída Morro Santana', '07:30*Saída Morro São Sebastião', '08:00*Saída Morro Santana', '08:00*Saída Morro São Sebastião', '08:30*Saída Morro Santana', '09:00*Saída Morro Santana', '09:00*Saída Morro São Sebastião', '09:30*Saída Morro Santana', '09:30*Saída Morro São Sebastião', '10:00*Saída Morro Santana', '10:30*Saída Morro Santana', '10:30*Saída Morro São Sebastião', '11:00*Saída Morro Santana', '11:00*Saída Morro São Sebastião', '11:30*Saída Morro Santana', '12:00*Saída Morro Santana', '12:00*Saída Morro São Sebastião', '12:30*Saída Morro Santana', '12:30*Saída Morro São Sebastião', '13:00*Saída Morro Santana', '13:15*Saída Morro São Sebastião', '13:30*Saída Morro Santana', '14:00*Saída Morro Santana', '14:00*Saída Morro São Sebastião', '14:45*Saída Morro São Sebastião', '15:00*Saída Morro Santana', '15:30*Saída Morro Santana', '15:30*Saída Morro São Sebastião', '16:15*Saída Morro Santana', '16:15*Saída Morro São Sebastião', '16:40*Saída Morro São Sebastião', '17:00*Saída Morro Santana', '17:05*Saída Morro São Sebastião', '17:25*Saída Morro São Sebastião', '17:45*Saída Morro Santana', '17:50*Saída Morro São Sebastião', '18:15*Saída Morro São Sebastião', '18:30*Saída Morro Santana', '18:35*Saída Morro São Sebastião', '19:00*Saída Morro Santana', '19:15*Saída Morro São Sebastião', '19:25*Saída Morro São Sebastião', '20:00*Saída Morro Santana', '20:30*Saída Morro São Sebastião', '21:00*Saída Morro Santana', '21:30*Saída Morro São Sebastião', '21:55*Saída Morro São Sebastião'],
            volta: ['05:40*Destino Morro Santana', '06:00*Destino Morro São Sebastião', '06:30*Destino Morro São Sebastião', '07:00*Destino Morro Santana', '07:00*Destino Morro São Sebastião', '07:15*Destino Morro Santana', '07:30*Destino Morro São Sebastião', '08:00*Destino Morro Santana', '08:15*Destino Morro São Sebastião', '08:30*Destino Morro Santana', '08:45*Destino Morro São Sebastião', '09:00*Destino Morro Santana', '09:30*Destino Morro Santana', '09:45*Destino Morro São Sebastião', '10:00*Destino Morro Santana', '10:15*Destino Morro São Sebastião', '10:30*Destino Morro Santana', '11:00*Destino Morro Santana', '11:15*Destino Morro São Sebastião', '11:30*Destino Morro Santana', '11:45*Destino Morro São Sebastião', '12:00*Destino Morro Santana', '12:30*Destino Morro Santana', '12:30*Destino Morro São Sebastião', '13:00*Destino Morro Santana', '13:30*Destino Morro Santana', '13:15*Destino Morro São Sebastião', '14:00*Destino Morro Santana', '14:30*Destino Morro Santana', '14:45*Destino Morro São Sebastião', '15:00*Destino Morro Santana', '15:30*Destino Morro Santana', '15:40*Destino Morro São Sebastião', '16:05*Destino Morro São Sebastião', '16:15*Destino Morro Santana', '16:30*Destino Morro São Sebastião', '16:50*Destino Morro São Sebastião', '17:00*Destino Morro Santana', '17:15*Destino Morro São Sebastião', '17:40*Destino Morro São Sebastião', '17:45*Destino Morro Santana', '18:00*Destino Morro São Sebastião', '18:25*Destino Morro São Sebastião', '18:30*Destino Morro Santana', '18:50*Destino Morro São Sebastião', '19:15*Destino Morro São Sebastião', '20:00*Destino Morro Santana', '20:30*Destino Morro São Sebastião', '21:00*Destino Morro Santana', '21:30*Destino Morro São Sebastião', '22:00*Destino Morro São Sebastião', '22:40*Saída da Cooperouro']
          },
          {
            tabLabel: 'Sábado, Domingo e Feriado',
            ida: ['06:00', '06:30', '07:15', '08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:20', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15', '20:30', '21:45', '23:00'],
            volta: ['06:00', '06:30', '07:15', '08:00', '08:45', '09:30', '11:00', '12:05', '12:40', '13:20', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15', '20:30', '22:30']
          }
        ],
        notes: 'Itinerários e pontos de partida variam entre Morro Santana e Morro São Sebastião. Horário das 22:40 parte da Cooperouro.'
      },
      'POCINHO X S. CRISTÓVÃO (VIA UPA)': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:10*Não passa na UFOP', '06:20', '07:10', '08:20', '09:20*Não passa na UFOP', '10:30', '12:10', '13:00', '14:00', '15:10', '16:00', '16:30*Morro Santana', '18:00', '19:20', '20:00', '22:50*Via Saramenha'],
            volta: ['05:40*Partida Morro São Sebastião', '08:20', '10:20', '13:00', '15:00', '17:00', '19:00', '20:50', '23:30*Via Saramenha']
          },
          {
            tabLabel: 'Sábado, Domingo e Feriado',
            ida: ['07:00', '08:40', '10:20', '12:00', '13:40', '15:20', '17:00', '18:40', '20:20'],
            volta: ['07:50', '09:30', '11:10', '12:50', '14:30', '16:10', '17:50', '19:30', '21:10']
          }
        ],
        notes: 'Viagens via Saramenha de Cima destacadas. Horário de 05:40 parte do Morro São Sebastião.'
      },
      'RODOVIÁRIA X SANTA CRUZ': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['05:25', '06:00', '06:20', '06:30', '06:45', '07:10', '07:30', '07:55', '08:20', '08:40', '09:05', '09:30', '09:55', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:44', '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:40', '20:00', '20:20', '21:00'],
            volta: ['05:50', '07:15', '07:35', '08:00', '08:30', '08:55', '09:20', '09:40', '10:05', '10:30', '10:55', '11:20', '11:40', '12:00', '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00', '20:45', '21:20', '22:10']
          },
          {
            tabLabel: 'Sábado',
            ida: ['05:25*Via Padre Faria', '06:00*Via Padre Faria', '06:40*Via Padre Faria', '07:00*Via Padre Faria', '07:20*Via Padre Faria', '08:00*Via Padre Faria', '08:40*Via Padre Faria', '09:20*Via Padre Faria', '10:00*Via Padre Faria', '10:40*Via Padre Faria', '11:20*Via Padre Faria', '12:00*Via Padre Faria', '12:40*Via Padre Faria', '13:20*Via Padre Faria', '14:00*Via Padre Faria', '14:40*Via Padre Faria', '15:20*Via Padre Faria', '16:00*Via Padre Faria', '16:40*Via Padre Faria', '17:20*Via Padre Faria', '18:00*Via Padre Faria', '18:40*Via Padre Faria', '19:10*Via Padre Faria', '20:00*Via Padre Faria', '21:00*Via Padre Faria'],
            volta: ['07:40*Via Padre Faria', '08:20*Via Padre Faria', '09:00*Via Padre Faria', '09:40*Via Padre Faria', '10:20*Via Padre Faria', '11:00*Via Padre Faria', '11:40*Via Padre Faria', '12:20*Via Padre Faria', '13:00*Via Padre Faria', '13:40*Via Padre Faria', '14:20*Via Padre Faria', '15:00*Via Padre Faria', '15:40*Via Padre Faria', '16:20*Via Padre Faria', '17:00*Via Padre Faria', '17:40*Via Padre Faria', '18:20*Via Padre Faria', '19:00*Via Padre Faria', '19:30*Via Padre Faria', '20:00*Via Padre Faria', '21:00*Via Padre Faria', '22:00*Via Padre Faria']
          },
          {
            tabLabel: 'Domingo e Feriado',
            ida: ['05:25*Via Padre Faria', '06:30*Via Padre Faria', '07:20*Via Padre Faria', '08:10*Via Padre Faria', '09:00*Via Padre Faria', '09:50*Via Padre Faria', '10:40*Via Padre Faria', '11:30*Via Padre Faria', '12:20*Via Padre Faria', '13:10*Via Padre Faria', '14:00*Via Padre Faria', '14:50*Via Padre Faria', '15:40*Via Padre Faria', '16:30*Via Padre Faria', '17:20*Via Padre Faria', '18:10*Via Padre Faria', '19:00*Via Padre Faria', '20:00*Via Padre Faria', '21:00*Via Padre Faria'],
            volta: ['06:20*Via Padre Faria', '07:20*Via Padre Faria', '08:10*Via Padre Faria', '09:00*Via Padre Faria', '09:50*Via Padre Faria', '10:40*Via Padre Faria', '11:30*Via Padre Faria', '12:20*Via Padre Faria', '13:10*Via Padre Faria', '14:00*Via Padre Faria', '14:50*Via Padre Faria', '15:40*Via Padre Faria', '16:30*Via Padre Faria', '17:20*Via Padre Faria', '18:10*Via Padre Faria', '19:00*Via Padre Faria', '20:00*Via Padre Faria', '21:00*Via Padre Faria', '22:00*Via Padre Faria']
          }
        ],
        notes: 'Viagens via Padre Faria destacadas aos sábados, domingos e feriados.'
      },
      'SARAMENHA X SÃO CRISTÓVÃO': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['05:30', '06:05', '06:30', '06:55', '07:20', '07:45', '08:10', '08:35', '09:00', '09:25', '09:50', '10:15', '10:40', '11:05', '11:30', '11:50', '12:20', '12:45', '13:10', '13:35', '14:00', '14:25', '14:50', '15:15', '15:40', '16:05', '16:30', '16:55', '17:20', '17:55', '18:25', '19:00', '19:35', '20:10', '20:40', '21:30', '22:30*Saída do Pocinho via Saramenha'],
            volta: ['05:55', '06:00*Saída Bairro Liberdade via UFOP', '06:30', '06:55', '07:20', '07:45', '08:10', '08:35', '09:00', '09:25', '09:55', '10:15', '10:45', '11:05', '11:30', '12:00', '12:30', '12:50', '13:10', '13:35', '14:00', '14:25', '14:50', '15:15', '15:40', '16:05', '16:30', '17:00', '17:20', '17:50', '18:10', '18:35', '19:10', '19:45', '20:00', '20:20', '20:40', '21:00', '21:40', '22:30', '23:30*Viagem atendida pela linha do Pocinho via Saramenha']
          },
          {
            tabLabel: 'Sábado',
            ida: ['05:30', '06:30', '07:20', '08:10', '09:00', '09:50', '10:45', '11:30', '12:20', '13:10', '14:00', '14:50', '15:40', '16:30', '17:20', '18:10', '19:00', '19:50', '20:40', '21:30', '22:20'],
            volta: ['05:50', '06:30', '07:20', '08:10', '09:00', '09:45', '10:45', '11:00', '11:30', '12:20', '12:30', '13:10', '14:00', '14:50', '15:40', '16:30', '17:30', '18:10', '19:00', '19:50', '20:40', '21:30', '22:00', '23:00']
          },
          {
            tabLabel: 'Domingo e Feriado',
            ida: ['05:30', '06:30', '07:20', '08:10', '09:00', '09:50', '10:45', '11:30', '12:20', '13:10', '14:00', '14:50', '15:40', '16:30', '17:20', '18:10', '19:00', '19:50', '20:40', '22:20'],
            volta: ['05:50', '06:30', '07:20', '08:10', '09:00', '09:50', '10:45', '11:30', '12:20', '13:10', '14:00', '14:50', '15:40', '16:30', '17:30', '18:10', '19:00', '19:50', '20:40', '21:30', '23:00']
          }
        ],
        notes: 'Viagens via UFOP, Bairro Liberdade e Pocinho sinalizadas.'
      },
      'TAQUARAL X COOPEROURO': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['05:20', '05:20', '06:00', '06:15', '06:30', '06:30', '06:45', '07:00', '07:20', '07:40', '07:50', '08:00', '08:10', '08:20', '08:40', '09:00', '09:20', '09:30', '09:40', '10:00', '10:20', '10:30', '10:40', '11:00', '11:10', '11:20', '11:40', '12:00', '12:20', '12:40', '12:50', '12:55', '13:00', '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '15:55', '16:00', '16:20', '16:40', '17:00', '17:10', '17:20', '17:30', '17:40', '18:00', '18:10', '18:20', '18:40', '19:00', '19:20', '19:40', '19:50', '20:00', '20:20', '20:40', '21:00', '21:40', '22:00*Não passa na UFOP'],
            volta: ['06:00', '06:15', '06:30', '07:00', '07:10', '07:20', '07:35', '07:50', '08:10', '08:30', '08:40', '08:50', '09:10', '09:20', '09:30', '09:50', '10:10', '10:20', '10:30', '10:50', '11:10', '11:30', '11:40', '11:50', '11:55', '12:10', '12:30', '12:50', '13:10', '13:30', '13:50', '14:10', '14:30', '14:40', '14:50', '15:00', '15:10', '15:30', '15:50', '16:00', '16:10', '16:20', '16:30', '16:50', '16:50', '17:10', '17:10', '17:30', '17:50', '18:10', '18:30', '18:40', '18:50', '19:10', '19:30', '19:50', '20:10', '20:30', '20:50', '21:00', '21:40', '22:10', '22:40']
          },
          {
            tabLabel: 'Sábado',
            ida: ['05:20', '06:00', '06:15', '06:30', '06:45', '07:00', '07:20', '07:40', '08:00', '08:20', '08:40', '09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00', '20:20', '20:40', '21:15', '21:40'],
            volta: ['06:10', '06:30', '06:50', '07:10', '07:30', '07:40', '08:00', '08:20', '08:40', '09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40', '16:00', '16:20', '16:40', '17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '19:00', '19:20', '19:40', '20:00', '20:20', '20:40', '21:40', '22:10']
          },
          {
            tabLabel: 'Domingo e Feriado',
            ida: ['05:20', '06:00', '06:20', '06:40', '07:00', '07:25', '07:50', '08:15', '08:40', '09:00', '09:25', '09:50', '10:15', '10:40', '11:00', '11:25', '11:50', '12:15', '12:40', '13:00', '13:25', '13:50', '14:15', '14:40', '15:00', '15:25', '15:50', '16:15', '16:40', '17:00', '17:25', '17:50', '18:15', '18:40', '19:00', '19:30', '19:50', '20:15', '20:40', '21:00'],
            volta: ['06:20', '07:00', '07:20', '07:40', '08:00', '08:25', '08:50', '09:15', '09:40', '10:00', '10:25', '10:50', '11:15', '11:40', '12:00', '12:25', '12:50', '13:15', '13:40', '14:00', '14:25', '14:50', '15:15', '15:40', '16:00', '16:25', '16:50', '17:15', '17:40', '18:00', '18:25', '18:50', '19:15', '19:40', '20:00', '20:50', '21:15', '21:40', '22:10']
          }
        ],
        notes: 'Itinerários e horários de saída de segunda a sexta, sábados, domingos e feriados.'
      },
      'VILA APARECIDA X PIEDADE': {
        category: 'urbana',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:10*Direto Cooperouro', '07:00*Direto Cooperouro', '08:00', '09:00', '09:40', '10:50', '11:40', '12:30', '13:20', '14:10', '15:00', '15:50', '16:40', '17:30', '18:20', '19:10', '20:00'],
            volta: ['06:20', '07:15', '08:15', '08:50', '09:50', '10:30', '11:40', '12:30', '13:20', '14:10', '15:00', '15:50', '16:40', '17:30', '18:20', '19:10', '20:10*Via Cooperouro']
          },
          {
            tabLabel: 'Sábado',
            ida: ['06:10*Para Cooperouro', '08:00', '09:40', '11:20', '13:00', '14:40', '16:15', '18:00', '20:00*Para Cooperouro'],
            volta: ['07:15', '08:50', '10:30', '12:10', '13:50', '15:30', '17:00*Via Cooperouro', '19:00*Via Cooperouro']
          },
          {
            tabLabel: 'Domingos e Feriados',
            ida: ['06:10', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00*Para Cooperouro'],
            volta: ['07:15', '09:00', '11:00', '13:00', '15:00', '17:00*Via Cooperouro para Piedade', '19:00*Via Cooperouro para Piedade']
          }
        ],
        notes: 'Viagens via Cooperouro destacadas nos horários especiais.'
      },
      'ANT. PEREIRA X O. PRETO': {
        category: 'urbana_distrito',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:00', '14:00'],
            volta: ['12:00', '16:30']
          }
        ],
        notes: 'Linha EXPRESSA DIRETA. Por determinação regulamentar, não é permitido embarque/desembarque em Mariana. Não opera sábados, domingos e feriados.'
      },
      'CACHOEIRA(AMAR.) X O. PRETO': {
        category: 'urbana_distrito',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:00', '06:10', '06:15', '06:50', '07:20', '07:30', '08:20', '08:20', '09:00', '09:40', '10:20', '11:00', '11:10', '11:40', '12:20', '13:00', '13:20', '13:40', '14:20', '15:00', '15:40', '15:50', '16:20', '17:00', '17:40', '18:10', '18:20', '18:20', '19:00', '20:10*Hospital', '20:40', '22:00'],
            volta: ['06:15', '06:50', '07:10', '07:40', '08:20', '09:00', '09:30', '09:40', '10:20', '10:00*Rodrigo Silva', '11:00', '11:40', '12:20', '12:20', '13:00', '13:40', '14:20', '14:35', '15:00', '15:40', '16:20', '17:00', '17:20', '17:40', '18:20', '19:00', '19:50', '21:20', '22:40']
          },
          {
            tabLabel: 'Sábado',
            ida: ['07:00*Partida do Ratinho', '07:00*Partida de Cachoeira', '08:30*Partida de Cachoeira', '09:00*Partida de Amarantina', '10:20*Partida de Cachoeira', '11:00*Partida do Ratinho', '13:00*Partida de Cachoeira', '15:00*Partida de Cachoeira', '17:00*Partida do Ratinho', '19:00*Partida de Amarantina'],
            volta: ['07:40*Ponto final Cachoeira', '08:00*Ponto final Amarantina', '09:20*Ponto final Cachoeira', '10:00*Ponto final Ratinho', '11:00*Ponto final Cachoeira', '12:00*Ponto final Cachoeira', '14:00*Ponto final Cachoeira', '16:00*Ponto final Ratinho', '18:00*Ponto final Amarantina', '20:00*Ponto final Cachoeira']
          },
          {
            tabLabel: 'Domingo e Feriado',
            ida: ['07:00*Partida do Ratinho', '09:00*Partida de Amarantina', '11:00*Partida do Ratinho', '13:00*Partida de Cachoeira', '15:00*Partida de Cachoeira', '17:00*Partida do Ratinho', '19:00*Partida de Amarantina'],
            volta: ['08:00*Ponto final Amarantina', '10:00*Ponto final Ratinho', '12:00*Ponto final Cachoeira', '14:00*Ponto final Cachoeira', '16:00*Ponto final Ratinho', '18:00*Ponto final Amarantina', '20:00*Ponto final Cachoeira']
          }
        ],
        notes: 'Algumas partidas partem ou finalizam em Amarantina ou Ratinho. Consórcio Rota Real Linha 370.'
      },
      'LAVRAS NOVAS X OURO PRETO': {
        category: 'urbana_distrito',
        schedule: [
          {
            tabLabel: 'Segunda, Quarta e Sexta',
            ida: ['05:45', '11:00'],
            volta: ['07:00', '17:00']
          },
          {
            tabLabel: 'Terça e Quinta',
            ida: ['05:45'],
            volta: ['17:00']
          },
          {
            tabLabel: 'Sábado',
            ida: ['05:45'],
            volta: ['13:20']
          }
        ],
        notes: 'Não há atendimento aos domingos e feriados.'
      },
      'RODRIGO SILVA X OURO PRETO': {
        category: 'urbana_distrito',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:30*Via Cachoeira do Campo', '12:10*Via Cachoeira do Campo'],
            volta: ['10:00*Via Cachoeira do Campo', '17:00*Via Cachoeira do Campo']
          }
        ],
        notes: 'Esta linha opera exclusivamente de segunda a sexta-feira via Cachoeira do Campo.'
      },
      'SALTO X OURO PRETO': {
        category: 'urbana_distrito',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:45'],
            volta: ['16:00']
          },
          {
            tabLabel: 'Sábado',
            ida: ['06:45'],
            volta: ['13:00']
          }
        ],
        notes: 'Linha atende o distrito de Santo Antônio do Salto. Não opera aos domingos e feriados.'
      },
      'SANTA RITA X OURO PRETO': {
        category: 'urbana_distrito',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['07:15'],
            volta: ['16:00']
          },
          {
            tabLabel: 'Sábado',
            ida: ['07:15'],
            volta: ['13:00']
          }
        ],
        notes: 'Não opera aos domingos e feriados.'
      },
      'ALTO DO BELEZA': {
        category: 'distrital',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['05:45', '06:10', '06:40', '07:05', '07:30', '07:55', '08:20', '08:45', '09:10', '09:35', '10:00', '10:25', '11:00', '11:25', '11:55', '12:00', '12:25', '13:00', '13:25', '14:00', '14:25', '15:00', '15:00*Em Trânsito', '15:25', '16:00', '16:05*Em Trânsito', '16:25', '17:00', '17:05*Em Trânsito', '17:25', '18:00', '18:00*Em Trânsito', '18:25', '19:00', '19:25', '20:00', '20:25', '21:00', '21:25', '22:10', '22:35'],
            volta: ['05:45', '06:10', '06:40', '07:10', '07:30', '08:20', '09:10', '10:00', '11:00', '12:00', '12:15', '13:00', '14:00', '15:00', '15:20', '16:00', '16:25', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00', '21:50']
          },
          {
            tabLabel: 'Sábado',
            ida: ['06:40', '07:50', '08:15', '08:35', '09:15', '09:45', '10:25', '10:55', '11:35', '12:05', '12:45', '13:15', '14:25', '15:35', '16:45', '17:55', '19:05', '20:05', '21:05'],
            volta: ['06:00', '07:00', '07:40', '08:10', '08:50', '09:20', '10:00', '10:30', '11:10', '11:40', '12:20', '12:50', '14:00', '15:10', '16:20', '17:30', '18:40', '19:40', '20:40']
          },
          {
            tabLabel: 'Domingo e Feriado',
            ida: ['06:45', '07:45', '08:55', '10:05', '11:15', '12:25', '13:35', '14:45', '15:55', '17:05', '18:15', '19:25', '20:25', '21:25'],
            volta: ['07:00', '08:10', '09:20', '10:30', '11:40', '12:50', '14:00', '15:10', '16:20', '17:30', '18:40', '19:50', '20:50', '21:50']
          }
        ],
        notes: 'Algumas viagens via Vila Alegre e UPA. Carros em trânsito previstos passar na Rodoviária.'
      },
      'METALURGICO': {
        category: 'distrital',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['07:05*Em Trânsito', '08:05*Em Trânsito', '09:05*Em Trânsito', '10:05*Em Trânsito', '11:05*Em Trânsito', '12:05*Em Trânsito', '13:05*Em Trânsito', '14:05*Em Trânsito', '15:05*Em Trânsito', '16:05*Em Trânsito', '17:05*Em Trânsito', '18:05*Em Trânsito', '19:05*Em Trânsito', '20:05*Em Trânsito'],
            volta: ['06:25', '07:30', '08:30', '09:30', '10:30', '11:30', '12:30', '13:30', '14:30', '15:30', '16:30', '17:30', '18:30', '19:30']
          },
          {
            tabLabel: 'Sábado',
            ida: ['07:05*Em Trânsito', '08:05*Em Trânsito', '09:05*Em Trânsito', '14:05*Em Trânsito', '15:15*Em Trânsito', '16:25*Em Trânsito', '17:35*Em Trânsito', '18:45*Em Trânsito'],
            volta: ['06:30', '07:30', '08:30', '13:30', '14:40', '15:50', '17:00', '18:10']
          }
        ],
        notes: 'Saídas do Metalúrgico para o Vila Alegre. Previsões de passagem em trânsito pela Rodoviária de Cachoeira do Campo.'
      },
      'VILA ALEGRE': {
        category: 'distrital',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['05:50', '06:05', '06:30', '06:40', '07:00', '07:30', '07:40', '07:45', '07:50', '08:20', '08:40', '09:10', '09:30', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '12:00', '12:20', '12:35', '12:40', '13:00', '13:20', '13:40', '14:00', '14:20', '14:44', '15:00', '15:20', '15:40', '16:00', '16:20', '16:35', '16:45', '17:00', '17:20', '17:40', '18:00', '18:20', '18:40', '18:50', '19:00', '19:20', '19:35', '20:00', '20:20', '21:00', '22:10'],
            volta: ['06:15', '07:20', '08:30', '09:40', '10:50', '12:00', '13:10', '14:20', '15:30', '16:40', '17:50', '19:00', '20:00', '21:00']
          },
          {
            tabLabel: 'Sábado',
            ida: ['06:00', '06:20', '06:30', '07:20', '08:00', '08:30', '09:10', '09:40', '10:20', '10:50', '11:30', '12:00', '12:40', '13:10', '14:20', '15:30', '16:40', '17:50', '19:00', '20:00', '21:00'],
            volta: ['06:15', '07:20', '08:30', '09:40', '10:50', '12:00', '13:10', '14:20', '15:30', '16:40', '17:50', '19:00', '20:00', '21:00']
          },
          {
            tabLabel: 'Domingo e Feriado',
            ida: ['06:00', '07:00', '08:00', '09:10', '10:20', '11:30', '12:40', '13:50', '15:00', '16:10', '17:20', '18:30', '19:40', '20:40'],
            volta: ['06:15', '07:20', '08:30', '09:40', '10:50', '12:00', '13:10', '14:20', '15:30', '16:40', '17:50', '19:00', '20:00', '21:00']
          }
        ],
        notes: 'Horários via BR-356, Posto Painha, Vila do Cruzeiro e Vila Alegre. Carros em trânsito previstos passar pelo centro.'
      },
      'CACHOEIRA X GLAURA': {
        category: 'distrital',
        schedule: [
          {
            tabLabel: 'Segunda',
            ida: ['05:40*Via Ilha', '06:45*Via Ilha e Soares', '10:00*Via Centro', '13:10*Via Ilha', '16:00*Via Ilha e Soares', '18:05*Via Centro'],
            volta: ['06:00', '07:20*Via Soares', '10:20', '13:20', '16:30*Via Soares', '18:30']
          },
          {
            tabLabel: 'Terça, Quarta e Quinta',
            ida: ['05:40*Via Ilha', '07:00*Via Ilha', '10:00*Via Centro', '13:10*Via Ilha', '16:10*Via Ilha', '18:05*Via Centro'],
            volta: ['06:00', '07:20', '10:20', '13:20', '16:30', '18:30']
          },
          {
            tabLabel: 'Sexta',
            ida: ['05:40*Via Ilha', '06:45*Via Ilha e Soares', '07:00*Via Ilha', '10:00*Via Centro', '13:10*Via Ilha', '16:00*Via Ilha e Soares', '18:05*Via Centro'],
            volta: ['06:00', '07:20*Via Soares', '10:20', '13:20', '16:30*Via Soares', '18:30']
          },
          {
            tabLabel: 'Sábados',
            ida: ['06:00', '08:00', '10:00', '12:30', '15:30', '17:30'],
            volta: ['06:20', '08:30', '10:30', '13:00', '16:00', '18:00']
          }
        ],
        notes: 'Viagens via Soares destacadas nas Segundas e Sextas. Não há atendimento aos domingos e feriados.'
      },
      'CACHOEIRA X SÃO BARTOLOMEU': {
        category: 'distrital',
        schedule: [
          {
            tabLabel: 'Segundas e Sextas',
            ida: ['08:00', '15:00'],
            volta: ['08:40', '15:40']
          }
        ],
        notes: 'Opera apenas às segundas e sextas-feiras.'
      },
      'CACHOEIRA X S. A. DO LEITE': {
        category: 'distrital',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['06:25', '08:40', '11:15', '13:00', '14:30', '16:40', '18:15'],
            volta: ['06:00', '06:50', '09:00', '11:30', '14:00', '16:00', '17:00']
          },
          {
            tabLabel: 'Sábado',
            ida: ['08:40', '11:30', '16:40', '17:30'],
            volta: ['06:40', '09:00', '15:00', '17:00']
          }
        ],
        notes: 'Algumas viagens realizam trajeto via Catete/Chapada. Não há atendimento aos domingos e feriados.'
      },
      'CACHOEIRA X SERRA SIQUEIRA': {
        category: 'distrital',
        schedule: [
          {
            tabLabel: 'Segunda a Sexta',
            ida: ['17:15'],
            volta: ['06:00', '17:35']
          }
        ],
        notes: 'Linha em caráter experimental. Não opera aos sábados, domingos e feriados.'
      },
      'CACHOEIRA X SOARES': {
        category: 'distrital',
        sundays: null,
        notes: 'Opera apenas às segundas e sextas-feiras.'
      }
    };

    const col1 = [
      'BAUXITA X RODOVIÁRIA',
      'COOPEROURO X M. S. SEBASTIÃO',
      'COOPEROURO X PIEDADE',
      'COOPEROURO X SANTA CRUZ',
      'JARDIM ALVORADA X HOSPITAL',
      'M. SANTANA X SÃO CRISTÓVÃO',
      'M. S. SEBASTIÃO X SÃO CRISTÓVÃO',
      'POCINHO X S. CRISTÓVÃO (VIA UPA)',
      'RODOVIÁRIA X SANTA CRUZ',
      'SARAMENHA X SÃO CRISTÓVÃO',
      'TAQUARAL X COOPEROURO',
      'VILA APARECIDA X PIEDADE'
    ];

    const col2 = [
      'ANT. PEREIRA X O. PRETO',
      'CACHOEIRA(AMAR.) X O. PRETO',
      'LAVRAS NOVAS X OURO PRETO',
      'RODRIGO SILVA X OURO PRETO',
      'SALTO X OURO PRETO',
      'SANTA RITA X OURO PRETO'
    ];

    const col3 = [
      'ALTO DO BELEZA',
      'METALURGICO',
      'VILA ALEGRE',
      'CACHOEIRA X GLAURA',
      'CACHOEIRA X SÃO BARTOLOMEU',
      'CACHOEIRA X S. A. DO LEITE',
      'CACHOEIRA X SERRA SIQUEIRA',
      'CACHOEIRA X SOARES'
    ];

    const renderLineItem = (lineName) => {
      return (
        <div
          key={lineName}
          onClick={() => {
            setSelectedLineForModal(lineName);
            setSelectedModalBusDay(0);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: '12px',
            backgroundColor: '#eef6fc',
            border: '1px solid #d0e3f4',
            cursor: 'pointer',
            transition: 'all 0.2s',
            minHeight: '48px',
            userSelect: 'none'
          }}
          className="bus-line-hover"
        >
          {/* Decorativo listrado à esquerda estilo Rota Real */}
          <div style={{
            position: 'relative',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: 'linear-gradient(90deg, #1e3a8a 0%, #1e3a8a 50%, #facc15 50%, #facc15 100%)'
          }}>
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: '#1e3a8a',
              border: '1px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
            }}>
              <Bus size={11} style={{ color: '#ffffff' }} />
            </div>
          </div>
          <span style={{
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#1e40af',
            textTransform: 'uppercase',
            lineHeight: 1.2
          }}>
            - {lineName}
          </span>
        </div>
      );
    };

    const renderBusModal = () => {
      if (!selectedLineForModal) return null;
      const data = linesData[selectedLineForModal];
      if (!data) return null;

      const scheduleTabs = data.schedule || [];
      const activeTabIdx = selectedModalBusDay >= scheduleTabs.length ? 0 : selectedModalBusDay;
      const currentTab = scheduleTabs[activeTabIdx] || { ida: [], volta: [] };
      const activeTimes = { ida: currentTab.ida || [], volta: currentTab.volta || [] };

      return (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={() => setSelectedLineForModal(null)}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <span style={{
                  fontSize: '0.65rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: '#64748b',
                  fontWeight: 700
                }}>
                  {data.category === 'urbana' ? 'Linha Urbana' : data.category === 'urbana_distrito' ? 'Linha Distrito' : 'Linha Distrital'}
                </span>
                <h3 style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.95rem',
                  color: '#1e3a8a',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  lineHeight: 1.3
                }}>
                  {selectedLineForModal}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLineForModal(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Day Selector */}
            <div style={{
              display: 'flex',
              padding: '12px 20px',
              gap: '8px',
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #f1f5f9',
              overflowX: 'auto',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}>
              {scheduleTabs.map((tab, idx) => {
                const isActive = activeTabIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedModalBusDay(idx)}
                    style={{
                      flex: scheduleTabs.length > 2 ? '0 0 auto' : 1,
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: isActive ? '#1e3a8a' : '#e2e8f0',
                      backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                      color: isActive ? '#1e3a8a' : '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.tabLabel}
                  </button>
                );
              })}
            </div>

            {/* Horarios Content */}
            <div style={{
              padding: '20px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Ida */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '8px'
                  }}>
                    Saídas / Ida
                  </h4>
                  {activeTimes.ida && activeTimes.ida.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
                      gap: '8px'
                    }}>
                      {activeTimes.ida.map((time, idx) => {
                        const parts = time.split('*');
                        const timeStr = parts[0];
                        const labelStr = parts[1];
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '6px 0',
                              textAlign: 'center',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              backgroundColor: labelStr ? '#fff7ed' : '#f8fafc',
                              borderColor: labelStr ? '#fed7aa' : '#e2e8f0'
                            }}
                          >
                            {timeStr}
                            {labelStr && (
                              <div style={{ fontSize: '0.48rem', color: '#ea580c', fontWeight: 500, marginTop: '2px', lineHeight: 1 }}>
                                {labelStr}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
                      Sem viagens registradas.
                    </div>
                  )}
                </div>

                {/* Volta */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '8px'
                  }}>
                    Retornos / Volta
                  </h4>
                  {activeTimes.volta && activeTimes.volta.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
                      gap: '8px'
                    }}>
                      {activeTimes.volta.map((time, idx) => {
                        const parts = time.split('*');
                        const timeStr = parts[0];
                        const labelStr = parts[1];
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '6px 0',
                              textAlign: 'center',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#0f172a',
                              backgroundColor: labelStr ? '#fff7ed' : '#f8fafc',
                              borderColor: labelStr ? '#fed7aa' : '#e2e8f0'
                            }}
                          >
                            {timeStr}
                            {labelStr && (
                              <div style={{ fontSize: '0.48rem', color: '#ea580c', fontWeight: 500, marginTop: '2px', lineHeight: 1 }}>
                                {labelStr}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
                      Sem viagens registradas.
                    </div>
                  )}
                </div>

              </div>

              {data.notes && (
                <div style={{
                  fontSize: '0.68rem',
                  color: '#64748b',
                  lineHeight: 1.4,
                  backgroundColor: '#f1f5f9',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  borderLeft: '3px solid #1e3a8a'
                }}>
                  <strong>Observações:</strong> {data.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div style={{ padding: '16px', paddingBottom: '90px', width: '100%', boxSizing: 'border-box' }} className="animate-fade-in">
        {/* Subview Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button 
            onClick={() => onSwitchView('client_home')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h2 style={{ fontSize: '1.1rem', color: '#2d2d2d', margin: 0, fontWeight: 600 }}>
            Horários de Ônibus
          </h2>
        </div>

        {/* 3 Columns Layout mirroring original UI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'start',
          marginBottom: '24px'
        }}>
          {/* Column 1: Urbano 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '10px', backgroundColor: '#f0f7ff', borderRadius: '12px', border: '1px solid #d0e3f4', textAlign: 'center' }}>
              <p style={{ fontSize: '0.78rem', color: '#1e40af', margin: 0, fontWeight: 500 }}>
                Selecione uma <strong>linha urbana</strong> na lista abaixo para visualizar seus horários.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col1.map(line => renderLineItem(line))}
            </div>
          </div>

          {/* Column 2: Urbano 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '10px', backgroundColor: '#f0f7ff', borderRadius: '12px', border: '1px solid #d0e3f4', textAlign: 'center' }}>
              <p style={{ fontSize: '0.78rem', color: '#1e40af', margin: 0, fontWeight: 500 }}>
                Selecione uma <strong>linha urbana</strong> na lista abaixo para visualizar seus horários.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col2.map(line => renderLineItem(line))}
            </div>
          </div>

          {/* Column 3: Distrital */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '10px', backgroundColor: '#f0f7ff', borderRadius: '12px', border: '1px solid #d0e3f4', textAlign: 'center' }}>
              <p style={{ fontSize: '0.78rem', color: '#1e40af', margin: 0, fontWeight: 500 }}>
                Selecione uma <strong>linha Distrital</strong> na lista abaixo para visualizar seus horários.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col3.map(line => renderLineItem(line))}
            </div>
          </div>
        </div>

        {/* Redirect Button - Icon removed as requested */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <a
            href="https://consorciorotareal.com.br/horarios-linhas-onibus/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              width: '100%',
              maxWidth: '380px',
              padding: '14px',
              borderRadius: '24px',
              backgroundColor: '#2d2d2d',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 500,
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'background-color 0.2s'
            }}
          >
            Ver Todas as Linhas no Site Oficial
          </a>
        </div>

        {/* Pop-up Modal */}
        {renderBusModal()}
      </div>
    );
  };

  // --- SUBVIEW 13.6: VAGAS DE EMPREGO (JOBS) ---
  const renderJobs = () => {
    // Filter jobs based on search query
    const filteredJobs = (jobs || []).filter(job => {
      const query = jobsSearchQuery.toLowerCase();
      return (
        job.title?.toLowerCase().includes(query) ||
        job.companyName?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
      );
    });

    const handleCreateJob = async (e) => {
      e.preventDefault();
      const errors = {};
      if (!newJobForm.title.trim()) errors.title = "Título da vaga é obrigatório";
      if (!newJobForm.companyName.trim()) errors.companyName = "Nome da empresa é obrigatório";
      if (!newJobForm.description.trim()) errors.description = "Descrição é obrigatória";
      if (!newJobForm.location.trim()) errors.location = "Localização é obrigatória";

      if (newJobForm.contactType === 'whatsapp' || newJobForm.contactType === 'both') {
        if (!newJobForm.whatsapp.trim()) errors.whatsapp = "WhatsApp é obrigatório";
      }
      if (newJobForm.contactType === 'email' || newJobForm.contactType === 'both') {
        if (!newJobForm.email.trim()) errors.email = "E-mail é obrigatório";
      }

      if (Object.keys(errors).length > 0) {
        setNewJobFormErrors(errors);
        return;
      }

      // Add job via context function
      const res = await addJobVacancy({
        ...newJobForm,
        createdAt: Date.now()
      });

      if (res?.success) {
        triggerToast("Vaga cadastrada com sucesso! 🎉");
        setIsAddingJob(false);
        setNewJobForm({
          title: '',
          companyName: '',
          cnpj: '',
          description: '',
          location: 'Ouro Preto - MG',
          contactType: 'whatsapp',
          whatsapp: '',
          email: '',
          photo: ''
        });
        setNewJobFormErrors({});
      } else {
        triggerToast("Erro ao cadastrar vaga: " + (res?.message || "Erro desconhecido"));
      }
    };

    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => onSwitchView('client_home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
            >
              <ArrowLeft size={22} />
            </button>
            <h2 style={{ fontSize: '1.1rem', color: '#2d2d2d', margin: 0 }}>
              Vagas de Emprego
            </h2>
          </div>

          <button
            onClick={() => isVisitor ? onTriggerLogin() : setIsAddingJob(true)}
            style={{
              background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              padding: '8px 16px',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(242, 141, 26, 0.2)'
            }}
          >
            <Plus size={16} /> Cadastrar Vaga
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          border: '1px solid #eee',
          borderRadius: '24px',
          padding: '8px 16px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <Search size={18} style={{ color: '#aaa', marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Buscar por cargo, empresa, descrição..."
            value={jobsSearchQuery}
            onChange={(e) => setJobsSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.82rem',
              color: '#333'
            }}
          />
          {jobsSearchQuery && (
            <button
              onClick={() => setJobsSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Jobs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJobs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: 'white',
              borderRadius: '24px',
              border: '1px solid #eee',
              color: '#888'
            }}>
              <Briefcase size={40} style={{ color: '#ccc', marginBottom: '12px' }} />
              <p style={{ fontSize: '0.88rem', margin: 0 }}>Nenhuma vaga encontrada para esta busca.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const formattedDate = new Date(job.createdAt).toLocaleDateString('pt-BR');
              return (
                <div 
                  key={job.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '24px',
                    border: '1px solid #eee',
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}
                >
                  {/* Job Header */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {job.photo ? (
                      <img 
                        src={job.photo} 
                        alt={job.companyName}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: '1px solid #eee'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #ffe0b2 0%, #ffb74d 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f28d1a',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}>
                        {job.companyName?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#2d2d2d', margin: '0 0 2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {job.title}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#666', fontWeight: 500 }}>
                        {job.companyName}
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.74rem', color: '#888' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {job.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Publicado em {formattedDate}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.8rem',
                    color: '#555',
                    lineHeight: 1.4,
                    margin: 0,
                    whiteSpace: 'pre-line'
                  }}>
                    {job.description}
                  </p>

                  {/* CNPJ Badge */}
                  {job.cnpj && (
                    <div style={{ fontSize: '0.7rem', color: '#999', alignSelf: 'flex-start' }}>
                      CNPJ: {job.cnpj}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    {(job.contactType === 'whatsapp' || job.contactType === 'both') && job.whatsapp && (
                      <a
                        href={`https://wa.me/55${job.whatsapp.replace(/\D/g, '')}?text=Olá!%20Vi%20a%20sua%20vaga%20de%20${encodeURIComponent(job.title)}%20no%20Connecta%2B%20e%20tenho%20interesse.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          backgroundColor: '#25D366',
                          color: 'white',
                          borderRadius: '16px',
                          padding: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          boxShadow: '0 4px 10px rgba(37, 211, 102, 0.15)'
                        }}
                      >
                        <Phone size={14} /> WhatsApp
                      </a>
                    )}

                    {(job.contactType === 'email' || job.contactType === 'both') && job.email && (
                      <a
                        href={`mailto:${job.email}?subject=Vaga%20de%20${encodeURIComponent(job.title)}%20-%20Connecta%2B`}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          backgroundColor: '#f28d1a',
                          color: 'white',
                          borderRadius: '16px',
                          padding: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          boxShadow: '0 4px 10px rgba(242, 141, 26, 0.15)'
                        }}
                      >
                        <Mail size={14} /> E-mail
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal for adding a job */}
        {isAddingJob && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }} className="animate-fade-in">
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#2d2d2d', fontWeight: 700 }}>Cadastrar Nova Vaga</h3>
                <button
                  onClick={() => setIsAddingJob(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Cargo / Título da Vaga *</label>
                  <input
                    type="text"
                    placeholder="Ex: Auxiliar de Cozinha"
                    value={newJobForm.title}
                    onChange={(e) => setNewJobForm({...newJobForm, title: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: `1px solid ${newJobFormErrors.title ? '#ff4d4f' : '#eee'}`,
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  />
                  {newJobFormErrors.title && <span style={{ fontSize: '0.68rem', color: '#ff4d4f' }}>{newJobFormErrors.title}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nome da Empresa *</label>
                  <input
                    type="text"
                    placeholder="Ex: Restaurante Ouro de Minas"
                    value={newJobForm.companyName}
                    onChange={(e) => setNewJobForm({...newJobForm, companyName: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: `1px solid ${newJobFormErrors.companyName ? '#ff4d4f' : '#eee'}`,
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  />
                  {newJobFormErrors.companyName && <span style={{ fontSize: '0.68rem', color: '#ff4d4f' }}>{newJobFormErrors.companyName}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>CNPJ da Empresa (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: 12.345.678/0001-90"
                    value={newJobForm.cnpj}
                    onChange={(e) => setNewJobForm({...newJobForm, cnpj: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #eee',
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Localização *</label>
                  <input
                    type="text"
                    placeholder="Ex: Centro Histórico, Ouro Preto - MG"
                    value={newJobForm.location}
                    onChange={(e) => setNewJobForm({...newJobForm, location: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: `1px solid ${newJobFormErrors.location ? '#ff4d4f' : '#eee'}`,
                      outline: 'none',
                      fontSize: '0.8rem'
                    }}
                  />
                  {newJobFormErrors.location && <span style={{ fontSize: '0.68rem', color: '#ff4d4f' }}>{newJobFormErrors.location}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Logo da Empresa (Opcional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {newJobForm.photo ? (
                      <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <img 
                          src={newJobForm.photo} 
                          alt="Logo Preview" 
                          style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #eee' }} 
                        />
                        <button
                          type="button"
                          onClick={() => setNewJobForm({...newJobForm, photo: ''})}
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            background: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        border: '2px dashed #ccc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#888',
                        fontSize: '0.7rem',
                        transition: 'border-color 0.2s',
                        backgroundColor: '#fafafa'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = '#f28d1a'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = '#ccc'}
                      >
                        <Camera size={20} style={{ marginBottom: '2px', color: '#aaa' }} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              compressImage(file, 200, 200, (compressedBase64) => {
                                setNewJobForm({...newJobForm, photo: compressedBase64});
                              });
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                    <span style={{ fontSize: '0.7rem', color: '#888' }}>
                      Selecione uma imagem de logo para sua empresa (JPEG/PNG).
                    </span>
                  </div>
                </div>


                <div>
                  <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Descrição da Vaga e Requisitos *</label>
                  <textarea
                    rows={4}
                    placeholder="Descreva as atividades, horários, remuneração e pré-requisitos para a vaga."
                    value={newJobForm.description}
                    onChange={(e) => setNewJobForm({...newJobForm, description: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: `1px solid ${newJobFormErrors.description ? '#ff4d4f' : '#eee'}`,
                      outline: 'none',
                      fontSize: '0.8rem',
                      resize: 'none'
                    }}
                  />
                  {newJobFormErrors.description && <span style={{ fontSize: '0.68rem', color: '#ff4d4f' }}>{newJobFormErrors.description}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Meio de Contato para Candidatura *</label>
                  <select
                    value={newJobForm.contactType}
                    onChange={(e) => setNewJobForm({...newJobForm, contactType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #eee',
                      outline: 'none',
                      fontSize: '0.8rem',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                    <option value="both">Ambos (WhatsApp & E-mail)</option>
                  </select>
                </div>

                {(newJobForm.contactType === 'whatsapp' || newJobForm.contactType === 'both') && (
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>WhatsApp *</label>
                    <input
                      type="text"
                      placeholder="Ex: 31988888888 (com DDD)"
                      value={newJobForm.whatsapp}
                      onChange={(e) => setNewJobForm({...newJobForm, whatsapp: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: `1px solid ${newJobFormErrors.whatsapp ? '#ff4d4f' : '#eee'}`,
                        outline: 'none',
                        fontSize: '0.8rem'
                      }}
                    />
                    {newJobFormErrors.whatsapp && <span style={{ fontSize: '0.68rem', color: '#ff4d4f' }}>{newJobFormErrors.whatsapp}</span>}
                  </div>
                )}

                {(newJobForm.contactType === 'email' || newJobForm.contactType === 'both') && (
                  <div>
                    <label style={{ fontSize: '0.74rem', color: '#666', fontWeight: 600, display: 'block', marginBottom: '4px' }}>E-mail *</label>
                    <input
                      type="email"
                      placeholder="Ex: rh@empresa.com"
                      value={newJobForm.email}
                      onChange={(e) => setNewJobForm({...newJobForm, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: `1px solid ${newJobFormErrors.email ? '#ff4d4f' : '#eee'}`,
                        outline: 'none',
                        fontSize: '0.8rem'
                      }}
                    />
                    {newJobFormErrors.email && <span style={{ fontSize: '0.68rem', color: '#ff4d4f' }}>{newJobFormErrors.email}</span>}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingJob(false)}
                    style={{
                      flex: 1,
                      backgroundColor: '#f5f5f5',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#666',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(242,141,26,0.2)'
                    }}
                  >
                    Publicar Vaga
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
      ? (IS_BETA_EVENTS_ONLY 
          ? (events || []).filter(e => e.name?.toLowerCase().includes(searchQuery.toLowerCase()) || e.description?.toLowerCase().includes(searchQuery.toLowerCase()) || e.location?.toLowerCase().includes(searchQuery.toLowerCase()))
          : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : [];

    return (
      <div style={{ padding: '16px', paddingBottom: '90px' }} className="animate-fade-in">
        <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '16px' }}>
          {IS_BETA_EVENTS_ONLY ? "O que você quer curtir hoje?" : "O que você está buscando hoje?"}
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
            placeholder={IS_BETA_EVENTS_ONLY ? "Buscar eventos..." : "Buscar produtos, lojas ou serviços..."}
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
                {searchResults.map(item => {
                  if (IS_BETA_EVENTS_ONLY) {
                    return (
                      <div
                        key={item.id}
                        onClick={() => { setSelectedEventId(item.id); onSwitchView('client_event'); }}
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
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                          <span style={{ fontSize: '0.68rem', color: '#999' }}>{item.organizerName}</span>
                          <strong style={{ fontSize: '0.85rem', fontWeight: 500, color: isVisitor ? '#ff5e5b' : '#f28d1a', display: 'block', marginTop: '2px' }}>
                            {isVisitor ? 'Bloqueado' : `Ver Detalhes`}
                          </strong>
                          <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>
                            {item.date} - {item.location}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleProductClick(item.id)}
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
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 500, color: '#2d2d2d', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                        <span style={{ fontSize: '0.68rem', color: '#999' }}>{item.storeName}</span>
                        <strong style={{ fontSize: '0.85rem', fontWeight: 500, color: isVisitor ? '#ff5e5b' : '#f28d1a', display: 'block', marginTop: '2px' }}>
                          {isVisitor ? 'Bloqueado' : `R$ ${item.price.toFixed(2)}`}
                        </strong>
                        <div style={{ fontSize: '0.68rem', color: '#888', marginTop: '2px' }}>
                          {item.soldCount || 0} vendidos
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          !IS_BETA_EVENTS_ONLY && (
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>
                Categorias
              </h3>
              {renderGroupedCategoriesList()}
            </div>
          )
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

    const handlePhoneChange = (val) => {
      let clean = val.replace(/\D/g, '');
      if (clean.length > 11) clean = clean.slice(0, 11);
      let formatted = clean;
      if (clean.length > 6) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
      } else if (clean.length > 2) {
        formatted = `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
      } else if (clean.length > 0) {
        formatted = `(${clean.slice(0, 2)}`;
      }
      setEditPhone(formatted);
    };

    const handleCpfChange = (val) => {
      let clean = val.replace(/\D/g, '');
      if (clean.length > 11) clean = clean.slice(0, 11);
      let formatted = clean;
      if (clean.length > 9) {
        formatted = `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
      } else if (clean.length > 6) {
        formatted = `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
      } else if (clean.length > 3) {
        formatted = `${clean.slice(0, 3)}.${clean.slice(3)}`;
      }
      setEditCpf(formatted);
    };

    const handleCepChange = async (val) => {
      let clean = val.replace(/\D/g, '');
      if (clean.length > 8) clean = clean.slice(0, 8);
      let masked = clean;
      if (clean.length > 5) {
        masked = `${clean.slice(0, 5)}-${clean.slice(5)}`;
      }
      setEditCep(masked);

      if (clean.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
          const data = await response.json();
          if (data && !data.erro) {
            setEditStreet(data.logradouro || '');
            setEditNeighborhood(data.bairro || '');
          }
        } catch (err) {
          console.error("Erro ao buscar CEP:", err);
        }
      }
    };

    const startEditing = () => {
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setEditAvatar(user.avatar || '');
      setEditBanner(user.banner || '');
      setEditPhone(user.phone || '');
      setEditCpf(user.cpf || '');
      
      setEditStreet(user.addrStreet || '');
      setEditNumber(user.addrNumber || '');
      setEditNeighborhood(user.addrNeighborhood || '');
      setEditCep(user.addrCep || '');
      
      if (!user.addrStreet && user.address) {
        const parts = user.address.split(',');
        const street = parts[0]?.trim() || '';
        const num = parts[1]?.trim() || '';
        let neighborhood = '';
        let cep = '';
        
        if (parts[2]) {
          const subParts = parts[2].split('-');
          neighborhood = subParts[0]?.trim() || '';
          if (subParts[1] && subParts[1].toLowerCase().includes('cep')) {
            cep = subParts[1].replace(/cep:/i, '').trim();
          }
        }
        setEditStreet(street);
        setEditNumber(num);
        setEditNeighborhood(neighborhood);
        setEditCep(cep);
      }
      
      setIsEditingProfile(true);
    };

    const handleClientCoverUpload = (e) => {
      const file = e.target.files[0];
      if (file && isOwnProfile && currentUser) {
        compressImage(file, 800, 300, (compressedBase64) => {
          updateUserProfile(currentUser.id, { banner: compressedBase64 });
          triggerToast("Capa do perfil atualizada!");
        });
      }
    };

    const handleClientAvatarUpload = (e) => {
      const file = e.target.files[0];
      if (file && isOwnProfile && currentUser) {
        compressImage(file, 400, 400, (compressedBase64) => {
          updateUserProfile(currentUser.id, { avatar: compressedBase64 });
          triggerToast("Foto de perfil atualizada!");
        });
      }
    };

    const saveProfileChanges = () => {
      if (isOwnProfile && currentUser) {
        const fullAddr = `${editStreet}${editNumber ? ', ' + editNumber : ''}${editNeighborhood ? ', ' + editNeighborhood : ''}${editCep ? ' - CEP: ' + editCep : ''}`;
        const updatedFields = {
          name: editName,
          bio: editBio,
          address: fullAddr,
          addrStreet: editStreet,
          addrNumber: editNumber,
          addrNeighborhood: editNeighborhood,
          addrCep: editCep,
          phone: editPhone,
          cpf: editCpf
        };
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

                  const name = u ? ((u.role === 'seller' || u.role === 'organizer') ? (u.companyName || u.name) : u.name) : s.name;
                  const logo = u ? (u.avatar || u.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>') : s.logo;
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
                    {sh.status === 'completed' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                        {sh.reviewed ? (
                          <span style={{ fontSize: '0.7rem', color: '#2ec4b6', fontWeight: 500 }}>✓ Avaliado</span>
                        ) : (
                          <button
                            onClick={() => {
                              setRatingServiceHiredId(sh.id);
                              setServiceReviewRating(5);
                              setServiceReviewComment('');
                              setServiceReviewImages([]);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '8px',
                              border: '1px solid #f28d1a',
                              backgroundColor: '#ffffff',
                              color: '#f28d1a',
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            Avaliar Serviço
                          </button>
                        )}
                      </div>
                    )}
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 500, color: '#2d2d2d', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <EditableText textId={`profile_name_${user.id}`} defaultText={user.name} />
            </h3>
            <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px' }}>
              @<EditableText textId={`profile_username_${user.id}`} defaultText={user.name?.toLowerCase().replace(/\s/g, '') || 'usuario'} />
            </div>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '6px', lineHeight: 1.3, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <EditableText textId={`profile_bio_${user.id}`} defaultText={user.bio || ''} />
            </p>
            {/* Se for admin, ou se for um perfil comercial (não-client) */}
            {((currentUser?.role === 'admin' || user.role !== 'client') && (user.address || user.phone || user.cpf)) && (
              <>
                {user.address && (
                  <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> 
                    <span>Endereço: {user.address}</span>
                  </div>
                )}
                {user.phone && (
                  <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Phone size={12} /> 
                    <span>Telefone: {user.phone}</span>
                  </div>
                )}
                {user.cpf && (
                  <div style={{ fontSize: '0.7rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Layers size={12} /> 
                    <span>CPF: {user.cpf}</span>
                  </div>
                )}
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
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f28d1a' }}>{userTickets.length}</div>
              <div style={{ fontSize: '0.65rem', color: '#888' }}><EditableText textId="stat_events" defaultText="Eventos" /></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f28d1a' }}>{user.ouroCoins || 0}</div>
              <div style={{ fontSize: '0.65rem', color: '#888' }}><EditableText textId="stat_coins" defaultText="OuroCoins" /></div>
            </div>
          </div>

          {/* Sections Menu */}
          {[
            ...(isOwnProfile && currentUser && currentUser.role !== 'client' ? [
              { 
                icon: <Layers size={16} />, 
                label: currentUser.role === 'seller' ? 'Painel do Lojista' :
                       currentUser.role === 'provider' ? 'Painel do Prestador' :
                       currentUser.role === 'organizer' ? 'Painel de Eventos' :
                       currentUser.role === 'motoboy' ? 'Painel do Entregador' :
                       currentUser.role === 'admin' ? 'Painel do Administrador' : 'Painel de Parceiro', 
                key: 'menu_painel_parceiro', 
                count: null, 
                action: () => onSwitchView('go_to_partner_panel') 
              }
            ] : []),
            { icon: <Ticket size={16} />, label: 'Ingressos Comprados', key: 'menu_ingressos_comprados', count: userTickets.length, action: () => onSwitchView('client_tickets') },
            { icon: <Ticket size={16} />, label: 'Meus Cupons', key: 'menu_meus_cupons', count: coupons.length, action: () => onSwitchView('client_coupons') },
            { icon: <StoreIcon size={16} />, label: 'Perfis Seguidos', key: 'menu_perfis_seguidos', count: isOwnProfile ? followingIds.length : 3, action: () => isOwnProfile ? onSwitchView('client_following') : triggerToast("Apenas o próprio usuário pode ver seus perfis seguidos.") },
            ...(isOwnProfile && isDesktop ? [
              { icon: <Bell size={16} />, label: 'Notificações', key: 'menu_notificacoes', count: currentUser ? notifications.filter(n => n.userId === currentUser.id && !n.read).length : 0, action: () => { setProfileSubSection('notifications'); if (currentUser) markNotificationsRead(currentUser.id); } },
              { icon: <LogOut size={16} style={{ color: '#ff5e5b' }} />, label: 'Sair da Conta', key: 'menu_sair', count: null, action: logout }
            ] : [])
          ].map((item, idx) => {
            // Se for perfil público de outro usuário, ocultar Ingressos e Meus Cupons
            if (!isOwnProfile && (
              item.label === 'Ingressos Comprados' ||
              item.label === 'Meus Cupons'
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

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>CEP</label>
                  <input 
                    type="text" 
                    placeholder="00000-000"
                    value={editCep} 
                    onChange={e => handleCepChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Rua</label>
                  <input 
                    type="text" 
                    value={editStreet} 
                    onChange={e => setEditStreet(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Número</label>
                  <input 
                    type="text" 
                    value={editNumber} 
                    onChange={e => setEditNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Bairro</label>
                  <input 
                    type="text" 
                    value={editNeighborhood} 
                    onChange={e => setEditNeighborhood(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>Telefone</label>
                  <input 
                    type="text" 
                    placeholder="(31) 99999-9999"
                    value={editPhone} 
                    onChange={e => handlePhoneChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#666' }}>CPF</label>
                  <input 
                    type="text" 
                    placeholder="000.000.000-00"
                    value={editCpf} 
                    onChange={e => handleCpfChange(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px', outline: 'none' }}
                  />
                </div>
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
      case 'client_bus': return renderBusSchedule();
      case 'client_ourocoins': return renderOuroCoins();
      case 'client_jobs': return renderJobs();
      case 'client_search': return renderSearch();
      case 'client_profile': return renderClientProfile();
      default: return renderHome();
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflowX: 'hidden', minWidth: 0 }}>
      {renderViewContent()}
      
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #f9bb1a 0%, #f28d1a 100%)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '16px',
          fontSize: '0.82rem',
          fontWeight: 600,
          zIndex: 99999,
          boxShadow: '0 8px 32px rgba(242, 141, 26, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          pointerEvents: 'none',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          textAlign: 'center',
          width: 'calc(100% - 32px)',
          maxWidth: '340px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Check size={16} color="white" style={{ flexShrink: 0 }} />
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

      {/* Service Rating Modal */}
      {ratingServiceHiredId && (
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
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Avaliar Serviço</h3>
              <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px', lineHeight: 1.3 }}>Conta pra gente o que achou do profissional e do serviço prestado!</p>
            </div>
            
            {/* Stars Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '8px 0' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setServiceReviewRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '1.8rem',
                    color: star <= serviceReviewRating ? '#f28d1a' : '#ddd',
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
                placeholder="Ex: Profissional muito pontual e educado! Recomendo."
                value={serviceReviewComment}
                onChange={(e) => setServiceReviewComment(e.target.value)}
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
                {serviceReviewImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setServiceReviewImages(prev => prev.filter((_, i) => i !== idx))}
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
                
                {serviceReviewImages.length < 5 && (
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
                      multiple={serviceReviewImages.length < 4}
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const spaceLeft = 5 - serviceReviewImages.length;
                        const filesToProcess = files.slice(0, spaceLeft);
                        
                        filesToProcess.forEach(file => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setServiceReviewImages(prev => {
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
                  setRatingServiceHiredId(null);
                  setServiceReviewImages([]);
                }}
                className="btn btn-secondary"
                style={{ flex: 1, height: '44px', padding: 0, fontSize: '0.8rem', border: '1px solid #ddd' }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await addServiceReview(ratingServiceHiredId, currentUser?.name || 'Cliente Anônimo', serviceReviewRating, serviceReviewComment, serviceReviewImages);
                  setServiceReviewImages([]);
                  setServiceReviewComment('');
                  setServiceReviewRating(5);
                  setRatingServiceHiredId(null);
                  triggerToast("Avaliação de serviço enviada com sucesso!");
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

      {/* Report Event Modal */}
      {showReportModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: '20px'
          }}
        >
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '360px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            color: '#2d2d2d',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d2d2d', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} style={{ color: '#ff5e5b' }} />
                Denunciar Evento
              </h3>
              <button 
                onClick={() => setShowReportModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#999' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>
              Sua denúncia ajuda a manter nossa comunidade segura. Por favor, escolha a categoria e dê detalhes.
            </p>

            <div>
              <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 600 }}>Motivo da Denúncia</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  marginTop: '4px',
                  outline: 'none',
                  color: '#2d2d2d'
                }}
              >
                <option value="">Selecione um motivo...</option>
                <option value="fraude">Fraude ou Golpe (Evento Inexistente)</option>
                <option value="conteudo_inadequado">Conteúdo Inadequado / Violento</option>
                <option value="direitos_autorais">Violação de Direitos Autorais / Marca</option>
                <option value="venda_proibida">Venda de Itens Proibidos</option>
                <option value="outro">Outro Motivo</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.7rem', color: '#666', fontWeight: 600 }}>Descrição dos Detalhes</label>
              <textarea
                placeholder="Por favor, descreva detalhadamente o problema..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                  marginTop: '4px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                onClick={() => setShowReportModal(false)}
                className="btn"
                style={{ flex: 1, height: '44px', border: '1px solid #ddd', backgroundColor: '#ffffff', color: '#666', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
              >
                Cancelar
              </button>
              <button
                onClick={handleReportSubmit}
                className="btn btn-primary"
                style={{ flex: 1, height: '44px', color: '#ffffff', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 }}
              >
                Enviar Denúncia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
