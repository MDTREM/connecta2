import { useState, useEffect } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { 
  Calendar, MessageSquare, Home, Play, Upload, X, 
  User, MapPin, Phone, Clock, Star, Users, Camera, Save, Edit, Trash2,
  Bell, LogOut
} from 'lucide-react';
import { uploadAvatar, uploadCover, uploadEventImage, uploadVideoFile } from '../../firebase/storage';

export default function EventsArea({ onOpenChat, onToggleNotifications, unreadNotificationsCount, onLogout }) {
  const { 
    currentUser, events, addEvent, updateEvent, addCommissioner, addVideo, 
    setUsers, deleteEvent, visualLayoutSettings, updateUserProfile, categories, users,
    videos, deleteVideo, updateVideo, validateTicket, orders
  } = useFirebaseMock();

  const eventCategoriesFromDb = categories ? categories.filter(c => c.type === 'eventos').map(c => c.label) : [];
  const eventCategoriesList = eventCategoriesFromDb.length > 0 ? eventCategoriesFromDb : ['Eventos - Festas e Shows', 'Eventos - Universitários e Repúblicas', 'Eventos - Culturais e Festivais'];

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('connecta_organizer_active_tab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('connecta_organizer_active_tab', activeTab);
  }, [activeTab]);

  // Saque modal states
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawPixKey, setWithdrawPixKey] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Portaria Scanner states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerInputValue, setScannerInputValue] = useState('');
  const [scannerResult, setScannerResult] = useState(null);
  const [scannerFilterEventId, setScannerFilterEventId] = useState('all');
  const [scannerSearchTerm, setScannerSearchTerm] = useState('');
  const [html5QrcodeLoaded, setHtml5QrcodeLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerTab, setScannerTab] = useState('camera'); // 'camera' or 'list'

  useEffect(() => {
    if (showScannerModal && !html5QrcodeLoaded) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/html5-qrcode";
      script.onload = () => {
        setHtml5QrcodeLoaded(true);
      };
      script.onerror = (err) => {
        console.error("Erro ao carregar html5-qrcode:", err);
      };
      document.body.appendChild(script);
    }
  }, [showScannerModal, html5QrcodeLoaded]);

  useEffect(() => {
    let html5QrCodeScanner = null;
    if (showScannerModal && cameraActive && html5QrcodeLoaded && scannerTab === 'camera') {
      try {
        html5QrCodeScanner = new window.Html5Qrcode("reader");
        html5QrCodeScanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 }
          },
          (decodedText) => {
            handleTicketScanSubmit(decodedText);
            setCameraActive(false); // desliga câmera após scan para focar no resultado
          },
          () => {
            // erro de leitura silencioso
          }
        ).catch(err => {
          console.error("Erro ao iniciar câmera no scanner:", err);
          alert("Não foi possível acessar a câmera do dispositivo. Por favor, dê permissão ou use a validação manual/lista.");
          setCameraActive(false);
        });
      } catch (err) {
        console.error("Erro ao instanciar Html5Qrcode:", err);
      }
    }

    return () => {
      if (html5QrCodeScanner && html5QrCodeScanner.isScanning) {
        html5QrCodeScanner.stop().catch(err => console.error("Erro ao desligar câmera no cleanup:", err));
      }
    };
  }, [showScannerModal, cameraActive, html5QrcodeLoaded, scannerTab]);

  const handleTicketScanSubmit = async (customCode) => {
    const codeToValidate = customCode || scannerInputValue;
    if (!codeToValidate) return;

    setScannerResult({ loading: true });
    
    // Suporta formato com ou sem '#' e limpa espaços
    const formattedCode = codeToValidate.replace('Ticket #', '').replace('#', '').trim();
    
    const res = await validateTicket(formattedCode, currentUser.id);
    if (res.success) {
      setScannerResult({ success: true, message: res.message, ticket: res.ticket });
      setScannerInputValue('');
    } else {
      setScannerResult({ success: false, message: res.message });
    }
  };

  // Edit profile states
  const [editingField, setEditingField] = useState(null); // 'name', 'description', 'phone', 'address', 'category', 'openingHours'
  const [editValue, setEditValue] = useState('');

  // Form states for new event
  const [evName, setEvName] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evImages, setEvImages] = useState(Array(10).fill(''));
  const [evDescription, setEvDescription] = useState('');

  // Handlers for event images
  const handleEventImageUpload = async (idx, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const eventId = selectedEventId || 'temp_' + Date.now();
        const url = await uploadEventImage(file, currentUser.id, eventId);
        setEvImages(prev => {
          const updated = [...prev];
          updated[idx] = url;
          return updated;
        });
      } catch (error) {
        console.error(error);
        alert('Erro ao fazer upload da imagem do evento.');
      }
    }
  };


  const handleRemoveEventImage = (idx, e) => {
    if (e) e.stopPropagation();
    setEvImages(prev => {
      const updated = [...prev];
      updated[idx] = '';
      return updated;
    });
  };
  
  // Dynamic Event Form States
  const [batches, setBatches] = useState([{ name: 'Lote Único', price: '', limit: '', type: 'pago', startDate: '', startTime: '', endDate: '', endTime: '' }]);
  const [eventCategory, setEventCategory] = useState('Show e Festival');
  const [tags, setTags] = useState('');
  const [eventType, setEventType] = useState('fisico'); // 'fisico' or 'virtual'
  const [hasNumberedSeats, setHasNumberedSeats] = useState(false);
  const [totalSeats, setTotalSeats] = useState('');
  const [feeOption, setFeeOption] = useState('absorver'); // 'absorver' or 'repassar'
  const [coupons, setCoupons] = useState([]); // Array of { code, discountType: 'fixed'|'percent', value }
  const [policy, setPolicy] = useState('');

  const defaultPolicyTemplate = `1. REEMBOLSO E CANCELAMENTO:
Atenção! O produtor é o único responsável pela devolução de valores referentes ao(s) ingresso(s). Em caso de arrependimento da compra, o reembolso do valor do ingresso somente será efetuado caso a solicitação seja feita no prazo de até 7 dias a contar da data da compra e desde que realizado o pedido de devolução com no máximo 48h de antecedência do horário de início do evento. Situações fora do descrito estarão condicionadas a decisão dos produtores do evento.

2. ENTRADA E CLASSIFICAÇÃO:
É proibida a entrada de menores de idade sem o acompanhamento e autorização por escrito dos pais ou responsáveis legais. Apresentação de documento oficial com foto é obrigatória na portaria.

3. USO DE IMAGEM:
Ao adquirir o ingresso, o portador autoriza a captação e utilização de sua imagem e voz em fotografias, vídeos e materiais promocionais do evento, sem direito a compensação financeira.`;

  // Promoter states
  const [commName, setCommName] = useState('');
  const [commCode, setCommCode] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);

  // Reels upload states
  const [vidTitle, setVidTitle] = useState('');
  const [reelsDesc, setReelsDesc] = useState('');
  const [reelsVideoUrl, setReelsVideoUrl] = useState('');
  const [reelsVideoName, setReelsVideoName] = useState('');
  const [reelsEventId, setReelsEventId] = useState('');
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


  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReelsVideoUrl(url);
      setReelsVideoName(file.name);
      setReelsFile(file);
    }
  };

  const myEvents = events ? events.filter(e => e.organizerId === currentUser?.id) : [];

  // Compute sales stats
  let totalTicketsSold = 0;
  let grossSales = 0;
  myEvents.forEach(e => {
    if (e && e.batches && Array.isArray(e.batches)) {
      e.batches.forEach(b => {
        const soldQty = parseInt(b.sold || 0, 10);
        const ticketPrice = parseFloat(b.price || 0);
        if (!isNaN(soldQty) && soldQty > 0) {
          totalTicketsSold += soldQty;
        }
        if (!isNaN(soldQty) && !isNaN(ticketPrice) && soldQty > 0) {
          grossSales += soldQty * ticketPrice;
        }
      });
    }
  });

  const ticketsCommRate = (visualLayoutSettings?.commissions?.tickets !== undefined ? parseFloat(visualLayoutSettings.commissions.tickets) : 10);
  const netEarnings = grossSales * (1 - ticketsCommRate / 100);
  const withdrawableBalance = isNaN(netEarnings) ? 0 : netEarnings;

  const handleAddBatch = () => {
    setBatches([...batches, { name: '', type: 'pago', price: '', limit: '', startDate: '', startTime: '', endDate: '', endTime: '', sold: 0 }]);
  };

  const handleRemoveBatch = (idx) => {
    if (batches.length > 1) {
      setBatches(batches.filter((_, i) => i !== idx));
    }
  };

  const handleBatchChange = (idx, field, val) => {
    setBatches(batches.map((b, i) => {
      if (i !== idx) return b;
      const updated = { ...b, [field]: val };
      if (field === 'type' && val === 'gratuito') {
        updated.price = '0';
      }
      return updated;
    }));
  };

  const handleAddCoupon = () => {
    setCoupons([...coupons, { code: '', discountType: 'percent', value: '' }]);
  };

  const handleRemoveCoupon = (idx) => {
    setCoupons(coupons.filter((_, i) => i !== idx));
  };

  const handleCouponChange = (idx, field, val) => {
    setCoupons(coupons.map((c, i) => {
      if (i !== idx) return c;
      return { ...c, [field]: val };
    }));
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!evName || !evDate || !evLocation) {
      alert('Por favor, insira o nome, a data e o local do evento!');
      return;
    }

    const filteredImages = evImages.filter(img => img !== '');
    const mainImage = filteredImages[0] || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500';

    const parsedBatches = batches.map(b => ({
      name: b.name || 'Lote Único',
      type: b.type || 'pago',
      price: b.type === 'gratuito' ? 0 : parseFloat(b.price || 0),
      limit: parseInt(b.limit || 0),
      startDate: b.startDate || '',
      startTime: b.startTime || '',
      endDate: b.endDate || '',
      endTime: b.endTime || '',
      sold: b.sold || 0
    })).filter(b => b.limit > 0);

    if (parsedBatches.length === 0) {
      alert('É necessário ter pelo menos 1 lote com limite de ingressos maior que 0!');
      return;
    }

    const eventData = {
      name: evName,
      date: evDate,
      location: evLocation,
      image: mainImage,
      cover: mainImage,
      images: filteredImages,
      description: evDescription,
      category: eventCategory,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      eventType,
      hasNumberedSeats,
      totalSeats: hasNumberedSeats ? parseInt(totalSeats || 0) : null,
      feeOption,
      coupons: coupons.filter(c => c.code.trim() !== ''),
      policy: policy || defaultPolicyTemplate
    };

    if (editingEventId) {
      const originalEv = events.find(ev => ev.id === editingEventId);
      const updatedBatches = parsedBatches.map(newB => {
        const origB = originalEv?.batches?.find(ob => ob.name.toLowerCase() === newB.name.toLowerCase());
        return {
          ...newB,
          sold: origB ? parseInt(origB.sold || 0) : 0
        };
      });

      updateEvent(editingEventId, {
        ...eventData,
        batches: updatedBatches
      });
      setEditingEventId(null);
      alert('Evento atualizado com sucesso!');
    } else {
      addEvent({
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        ...eventData,
        batches: parsedBatches,
        soldSeats: []
      });
      alert('Evento cadastrado com sucesso!');
    }

    // Reset Form
    setEvName('');
    setEvDate('');
    setEvLocation('');
    setEvDescription('');
    setEvImages(Array(10).fill(''));
    setBatches([{ name: 'Lote Único', price: '', limit: '', type: 'pago', startDate: '', startTime: '', endDate: '', endTime: '' }]);
    setEventCategory('Show e Festival');
    setTags('');
    setEventType('fisico');
    setHasNumberedSeats(false);
    setTotalSeats('');
    setFeeOption('absorver');
    setCoupons([]);
    setPolicy('');
    setActiveTab('events');
  };

  const handleCommissionerSubmit = (e) => {
    e.preventDefault();
    const eventIdToUse = selectedEventId || (myEvents[0]?.id || '');
    if (!commName || !commCode || !eventIdToUse) {
      alert('Preencha os dados do comissário, sô!');
      return;
    }

    addCommissioner(eventIdToUse, commName, commCode);
    setCommName('');
    setCommCode('');
    alert('Comissário cadastrado com sucesso! Compartilhe o código dele para contabilizar vendas.');
  };

  const startEditing = (field, initialVal) => {
    setEditingField(field);
    setEditValue(initialVal);
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

  const handleReelsSubmit = async (e) => {
    e.preventDefault();
    if (!vidTitle || !reelsVideoUrl) {
      alert('Adicione um vídeo e uma legenda, sô!');
      return;
    }
    setIsUploadingVideo(true);
    try {
      let finalVideoUrl = reelsVideoUrl;
      if (reelsFile) {
        finalVideoUrl = await uploadVideoFile(reelsFile, currentUser.id);
      }

      const linkedEv = events.find(ev => ev.id === reelsEventId);

      addVideo({
        title: vidTitle,
        description: reelsDesc,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        videoUrl: finalVideoUrl,
        poster: linkedEv ? linkedEv.image : currentUser.logo || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500',
        linkedType: linkedEv ? 'event' : null,
        linkedId: linkedEv ? linkedEv.id : null,
        linkedName: linkedEv ? linkedEv.name : null,
        linkedPrice: linkedEv ? (linkedEv.batches[0]?.price || 0) : null
      });

      setVidTitle('');
      setReelsDesc('');
      setReelsVideoUrl('');
      setReelsVideoName('');
      setReelsEventId('');
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

  // --- SUBVIEW 2: PROFILE VIEW (EVENTOS - SEM BOLD) ---
  const renderProfileView = () => {
    const followers = (users || []).filter(u => u.role === 'client' && u.following && u.following.includes(currentUser.id));

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
            htmlFor="cover-file-upload-ev"
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
            id="cover-file-upload-ev" 
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
              htmlFor="logo-file-upload-ev"
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
              id="logo-file-upload-ev" 
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
                <button type="button" onClick={() => handleSaveField('name')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>{currentUser.companyName || currentUser.name}</h3>
                <button type="button" onClick={() => startEditing('name', currentUser.companyName || currentUser.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
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
                  {eventCategoriesList.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button type="button" onClick={() => handleSaveField('category')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentUser.category || eventCategoriesList[0]}</span>
                <button type="button" onClick={() => startEditing('category', currentUser.category || eventCategoriesList[0])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
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
                  <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '30px', width: 'auto' }}>Cancelar</button>
                  <button type="button" onClick={() => handleSaveField('description')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '30px', width: 'auto', backgroundColor: '#f28d1a' }}>Salvar</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, lineHeight: 1.35, flex: 1, whiteSpace: 'pre-wrap' }}>{currentUser.description || 'Nenhuma descrição informada.'}</p>
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
                  <span style={{ color: '#555' }}>Endereço:</span> {currentUser.address}
                  <button type="button" onClick={() => startEditing('address', currentUser.address)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
                </div>
              )}
            </div>



            {/* FOLLOWERS */}
            <div style={{ marginTop: '14px', borderTop: '1px solid #f2f2f2', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#2d2d2d' }}>
                <Users size={14} style={{ color: '#666' }} />
                <span>Seguidores:</span>
                <span style={{ fontWeight: 500, marginLeft: '4px' }}>{followers.length} clientes</span>
              </div>
              <div 
                style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginTop: '8px' }} 
                className="hide-scrollbar"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {followers.map(f => (
                  <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f9f9f9', padding: '4px 10px', borderRadius: '12px', border: '1px solid #eee', flexShrink: 0 }}>
                    <img src={f.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} alt={f.name} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.65rem', color: '#666' }}>{(f.name || '').split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Events Grid */}
        <div style={{ padding: '16px 0', paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Eventos Cadastrados</h4>
          
          {myEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.78rem' }}>
              Nenhum evento cadastrado ainda.
            </div>
          ) : (
            <div className="responsive-profile-grid" style={{ gap: '12px' }}>
              {myEvents.map(ev => {
                const activeBatch = ev.batches ? ev.batches.find(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) < parseInt(b.limit || 0, 10)) || ev.batches[0] : null;
                const isSoldOut = ev.batches && ev.batches.length > 0 ? ev.batches.every(b => parseInt(b.limit || 0, 10) > 0 && parseInt(b.sold || 0, 10) >= parseInt(b.limit || 0, 10)) : false;
                const activeBatchSold = activeBatch ? parseInt(activeBatch.sold || 0, 10) : 0;
                const activeBatchLimit = activeBatch ? parseInt(activeBatch.limit || 0, 10) : 0;
                const percent = activeBatchLimit > 0 ? Math.round((activeBatchSold / activeBatchLimit) * 100) : 0;
                return (
                  <div 
                    key={ev.id}
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '16px',
                      padding: '10px',
                      position: 'relative',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <img src={ev.image} alt={ev.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }} />
                    <div style={{ padding: '4px' }}>
                      <div style={{ fontSize: '0.68rem', color: '#f28d1a', fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} />
                        <span>{ev.date}</span>
                      </div>
                      <h5 style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</h5>
                      <div style={{ fontSize: '0.68rem', color: '#777' }}>Local: {ev.location}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid #f9f9f9', paddingTop: '6px' }}>
                        <span style={{ fontSize: '0.68rem', color: '#888' }}>{activeBatch?.name || 'Lote'}</span>
                        <strong style={{ fontSize: '0.74rem', color: '#f28d1a', fontWeight: 500 }}>
                          {isSoldOut ? 'Esgotado' : `R$ ${activeBatch.price.toFixed(2)}`}
                        </strong>
                      </div>

                      {activeBatch && (
                        <div style={{ marginTop: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#777', marginBottom: '2px' }}>
                            <span>Progresso:</span>
                            <span>{percent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', backgroundColor: '#eee', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#f28d1a', borderRadius: '2px' }} />
                          </div>
                        </div>
                      )}
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


  const renderScannerModal = () => {
    const organizerTickets = (orders || []).filter(o => o.type === 'ticket' && myEvents.some(me => me.id === o.eventId));
    
    const filteredTickets = organizerTickets
      .filter(o => scannerFilterEventId === 'all' ? true : o.eventId === scannerFilterEventId)
      .filter(o => {
        if (!scannerSearchTerm.trim()) return true;
        const term = scannerSearchTerm.toLowerCase();
        return (o.customerName || '').toLowerCase().includes(term) || 
               (o.id || '').toLowerCase().includes(term) ||
               (o.eventName || '').toLowerCase().includes(term);
      });

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }} onClick={() => {
        setCameraActive(false);
        setShowScannerModal(false);
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '480px',
          padding: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Validação de Portaria</h3>
              <span style={{ fontSize: '0.65rem', color: '#777' }}>Controle de entrada em tempo real</span>
            </div>
            <button 
              onClick={() => {
                setCameraActive(false);
                setShowScannerModal(false);
              }}
              style={{ background: '#f5f5f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Scanner Feedback (Success/Error Message) */}
          {scannerResult && (
            <div style={{
              backgroundColor: scannerResult.loading 
                ? '#fffdf4' 
                : scannerResult.success 
                  ? '#e6f9f6' 
                  : '#ffebe9',
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '14px',
              border: `1.5px solid ${
                scannerResult.loading 
                  ? '#f28d1a30' 
                  : scannerResult.success 
                    ? '#2ec4b630' 
                    : '#ff5e5b30'
              }`,
              textAlign: 'center',
              position: 'relative'
            }}>
              {scannerResult.loading ? (
                <div style={{ padding: '10px 0' }}>
                  <div style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 600 }}>Processando check-in...</div>
                  <span style={{ fontSize: '0.68rem', color: '#999' }}>Aguardando resposta do servidor</span>
                </div>
              ) : (
                <div>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: scannerResult.success ? '#20a396' : '#ff5e5b',
                    marginBottom: '4px'
                  }}>
                    {scannerResult.success ? 'CHECK-IN LIBERADO' : 'CONTRATEMPO NA ENTRADA'}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#333', margin: '4px 0 8px 0' }}>{scannerResult.message}</p>
                  
                  {scannerResult.success && scannerResult.ticket && (
                    <div style={{ backgroundColor: 'rgba(46,196,182,0.06)', borderRadius: '10px', padding: '8px', textAlign: 'left', fontSize: '0.7rem', color: '#444', marginBottom: '8px' }}>
                      <div><strong>Titular:</strong> {scannerResult.ticket.customerName}</div>
                      <div><strong>Lote:</strong> {scannerResult.ticket.batchName || 'Lote Único'}</div>
                      <div><strong>Ingressos:</strong> {scannerResult.ticket.quantity} un.</div>
                      <div><strong>Evento:</strong> {scannerResult.ticket.eventName}</div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setScannerResult(null);
                      if (scannerTab === 'camera') {
                        setCameraActive(true);
                      }
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: scannerResult.success ? '#f28d1a' : '#ff5e5b',
                      color: 'white',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Próximo Ingresso
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
            <button
              onClick={() => {
                setScannerTab('camera');
                setScannerResult(null);
              }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                background: scannerTab === 'camera' ? '#fcf6ed' : 'none',
                color: scannerTab === 'camera' ? '#f28d1a' : '#666',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Câmera QR Code
            </button>
            <button
              onClick={() => {
                setScannerTab('list');
                setCameraActive(false);
                setScannerResult(null);
              }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                background: scannerTab === 'list' ? '#fcf6ed' : 'none',
                color: scannerTab === 'list' ? '#f28d1a' : '#666',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Portaria (Lista)
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {scannerTab === 'camera' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  height: '220px',
                  backgroundColor: '#111',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  position: 'relative'
                }}>
                  {cameraActive ? (
                    <div id="reader" style={{ width: '100%', height: '100%' }}></div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '10px' }}>
                        Ative o scanner de câmera para ler QR Codes
                      </div>
                      <button
                        onClick={() => {
                          setScannerResult(null);
                          setCameraActive(true);
                        }}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: '#f28d1a',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Camera size={16} />
                        Ligar Câmera
                      </button>
                    </div>
                  )}
                  {cameraActive && (
                    <button
                      onClick={() => setCameraActive(false)}
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      Desligar Câmera
                    </button>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', marginTop: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', display: 'block', marginBottom: '6px' }}>
                    Validação Manual por Código
                  </label>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleTicketScanSubmit();
                  }} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Código do ingresso (ex: Ticket #12345)"
                      value={scannerInputValue}
                      onChange={(e) => setScannerInputValue(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1.5px solid #eee',
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#f28d1a',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Validar
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={scannerFilterEventId}
                    onChange={(e) => setScannerFilterEventId(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1.5px solid #eee',
                      fontSize: '0.75rem',
                      outline: 'none',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <option value="all">Todos os eventos</option>
                    {myEvents.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Buscar titular ou ID..."
                    value={scannerSearchTerm}
                    onChange={(e) => setScannerSearchTerm(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '10px',
                      border: '1.5px solid #eee',
                      fontSize: '0.75rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ 
                  maxHeight: '220px', 
                  overflowY: 'auto', 
                  border: '1px solid #eee', 
                  borderRadius: '14px',
                  backgroundColor: '#fafafa' 
                }}>
                  {filteredTickets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#999', fontSize: '0.75rem' }}>
                      Nenhum ingresso vendido atende aos filtros.
                    </div>
                  ) : (
                    filteredTickets.map(t => (
                      <div 
                        key={t.id} 
                        style={{ 
                          padding: '10px 12px', 
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                          backgroundColor: 'white'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.customerName}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#666', marginTop: '2px' }}>
                            #{t.id} • {t.batchName || 'Lote Único'} ({t.quantity} un.)
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#999', fontStyle: 'italic' }}>
                            {t.eventName}
                          </div>
                        </div>
                        <div>
                          {t.status === 'checked_in' ? (
                            <span style={{
                              fontSize: '0.62rem',
                              color: '#ff5e5b',
                              backgroundColor: '#ffebe9',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}>
                              Utilizado
                            </span>
                          ) : (
                            <button
                              onClick={() => handleTicketScanSubmit(t.id)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#f28d1a',
                                color: 'white',
                                fontSize: '0.62rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Check-in
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- SUBVIEW 1: DASHBOARD ---
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d' }}>{currentUser.companyName || currentUser.name}</h2>
          <p style={{ fontSize: '0.78rem', color: '#777' }}>Organizador de Eventos | Ouro Preto</p>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { label: 'Saldo Disponível', val: `R$ ${withdrawableBalance.toFixed(2)}`, desc: 'Líquido para saque', color: '#fffdf4', btn: 'Sacar' },
          { label: 'Ingressos Vendidos', val: `${totalTicketsSold} un.`, desc: 'Total geral acumulado', color: '#fcf6ed' },
          { label: 'Receita Bruta', val: `R$ ${grossSales.toFixed(2)}`, desc: 'Sem dedução da comissão', color: '#f3faf8' },
          { label: 'Eventos Cadastrados', val: `${myEvents.length} ev.`, desc: 'Ativos e finalizados', color: '#fef3f3' }
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

      {/* Portaria & Validação de Ingressos */}
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="12" y1="7" x2="12" y2="17" />
            </svg>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Portaria e Validação</h4>
            <p style={{ fontSize: '0.7rem', color: '#777', margin: '2px 0 0 0' }}>Escanear QR Codes e fazer check-in em tempo real</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setScannerResult(null);
            setScannerInputValue('');
            setShowScannerModal(true);
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '16px',
            border: 'none',
            background: 'var(--gradient-primary)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.72rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(242, 141, 26, 0.2)'
          }}
        >
          Validar Entrada
        </button>
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
                <strong style={{ color: '#d4730d', display: 'block', marginBottom: '4px' }}>Taxa de Intermediação</strong>
                A taxa cobrada pelo Conecta+ para venda de ingressos é de <strong>{visualLayoutSettings?.commissions?.tickets !== undefined ? visualLayoutSettings.commissions.tickets : 10}%</strong> sobre o valor de cada ingresso vendido.
              </div>

              <div style={{ backgroundColor: '#f3faf8', padding: '14px', borderRadius: '16px', border: '1px solid #2ec4b615' }}>
                <strong style={{ color: '#2ec4b6', display: 'block', marginBottom: '4px' }}>Saldo Líquido</strong>
                O valor líquido das vendas é liberado no seu saldo disponível assim que a transação for confirmada.
              </div>

              <div style={{ backgroundColor: '#fcf6ed', padding: '14px', borderRadius: '16px', border: '1px solid #f28d1a15' }}>
                <strong style={{ color: '#f28d1a', display: 'block', marginBottom: '4px' }}>Saques Rápidos</strong>
                Você pode solicitar o saque do seu saldo disponível via Pix diretamente no painel a qualquer momento!
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

  // --- SUBVIEW 2: EVENT CATALOG ---
  const renderEvents = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d' }}>Meus Eventos ({myEvents.length})</h3>
        <button
          onClick={() => setActiveTab('add_event')}
          style={{
            padding: '6px 12px',
            borderRadius: '99px',
            backgroundColor: '#f28d1a',
            color: 'white',
            border: 'none',
            fontSize: '0.72rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          + Novo Evento
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {myEvents.map(ev => (
          <div
            key={ev.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '14px',
              border: '1px solid #eee',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '12px', marginBottom: '10px' }}>
                <img src={ev.image} alt={ev.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{ev.name}</h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setEditingEventId(ev.id);
                      setEvName(ev.name || '');
                      setEvDate(ev.date || '');
                      setEvLocation(ev.location || '');
                      setEvDescription(ev.description || '');
                      
                      const imagesArray = Array(10).fill('');
                      if (ev.images && ev.images.length > 0) {
                        ev.images.forEach((img, idx) => {
                          if (idx < 10) imagesArray[idx] = img;
                        });
                      } else if (ev.image) {
                        imagesArray[0] = ev.image;
                      }
                      setEvImages(imagesArray);

                      if (ev.batches && ev.batches.length > 0) {
                        setBatches(ev.batches.map(b => ({
                          name: b.name || '',
                          type: b.type || 'pago',
                          price: b.price !== undefined ? b.price.toString() : '',
                          limit: b.limit !== undefined ? b.limit.toString() : '',
                          startDate: b.startDate || '',
                          startTime: b.startTime || '',
                          endDate: b.endDate || '',
                          endTime: b.endTime || '',
                          sold: b.sold || 0
                        })));
                      } else {
                        setBatches([{ name: 'Lote Único', price: '', limit: '', type: 'pago', startDate: '', startTime: '', endDate: '', endTime: '' }]);
                      }
                      setEventCategory(ev.category || 'Show e Festival');
                      setTags(ev.tags ? ev.tags.join(', ') : '');
                      setEventType(ev.eventType || 'fisico');
                      setHasNumberedSeats(ev.hasNumberedSeats || false);
                      setTotalSeats(ev.totalSeats !== null && ev.totalSeats !== undefined ? ev.totalSeats.toString() : '');
                      setFeeOption(ev.feeOption || 'absorver');
                      setCoupons(ev.coupons || []);
                      setPolicy(ev.policy || '');
                      setActiveTab('add_event');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a', padding: '4px' }}
                    title="Editar Evento"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Quer mesmo excluir o evento "${ev.name}"?`)) {
                        deleteEvent(ev.id);
                      }
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff5e5b', padding: '4px' }}
                    title="Excluir Evento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#777', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {ev.date}</div>
            </div>
            <div style={{ borderTop: '1px solid #f9f9f9', paddingTop: '6px', marginTop: '6px', fontSize: '0.72rem', color: '#666' }}>
              {ev.batches.map(b => (
                <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{b.name} (limite {b.limit}):</span>
                  <span>{b.sold} vendidos / R$ {b.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // --- SUBVIEW 3: CREATE EVENT ---
  // --- SUBVIEW 3: CREATE EVENT ---
  const renderAddEvent = () => (
    <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} className="animate-fade-in">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
        {editingEventId ? 'Editar Evento' : 'Cadastrar Novo Evento'}
      </h3>
      
      {/* Event Details */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Nome da Festa / Evento</label>
          <input 
            type="text" 
            placeholder="Ex: Calourada de Ouro Preto 2026" 
            value={evName} 
            onChange={(e) => setEvName(e.target.value)} 
            className="input-field" 
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Categoria de Festa</label>
            <select
              value={eventCategory}
              onChange={(e) => setEventCategory(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', border: '1.5px solid #eee', backgroundColor: 'white', outline: 'none' }}
            >
              {['Show e Festival', 'Balada e Festa', 'Universitário e República', 'Teatro e Cultural', 'Gastronômico', 'Esportivo', 'Outros'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Data e Horário</label>
            <input 
              type="text" 
              placeholder="Ex: 24/10/2026 às 22h" 
              value={evDate} 
              onChange={(e) => setEvDate(e.target.value)} 
              className="input-field" 
              required 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Tipo de Evento</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', border: '1.5px solid #eee', backgroundColor: 'white', outline: 'none' }}
            >
              <option value="fisico">Evento Físico (Presencial)</option>
              <option value="virtual">Evento Virtual (Online)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Tags de SEO (separadas por vírgula)</label>
            <input 
              type="text" 
              placeholder="Ex: republica, rock, openbar" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              className="input-field" 
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>
            {eventType === 'fisico' ? 'Localização Completa (Endereço)' : 'Link de Transmissão Online'}
          </label>
          <input 
            type="text" 
            placeholder={eventType === 'fisico' ? 'Ex: República Pasárgada, Centro, Ouro Preto - MG' : 'Ex: https://zoom.us/j/123456789'} 
            value={evLocation} 
            onChange={(e) => setEvLocation(e.target.value)} 
            className="input-field" 
            required 
          />
        </div>
      </div>

      {/* Seat Config and App Fee Settings */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Configurações de Assentos e Taxas</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setHasNumberedSeats(!hasNumberedSeats)}>
          <input 
            type="checkbox" 
            checked={hasNumberedSeats} 
            onChange={(e) => setHasNumberedSeats(e.target.checked)} 
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.78rem', color: '#333', fontWeight: 500 }}>Este evento possui assentos numerados/cadeiras?</span>
        </div>

        {hasNumberedSeats && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Quantidade Total de Assentos Numerados (1 a X)</label>
            <input 
              type="number" 
              placeholder="Ex: 100" 
              value={totalSeats} 
              onChange={(e) => setTotalSeats(e.target.value)} 
              className="input-field" 
              required={hasNumberedSeats}
            />
          </div>
        )}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Cobrança de Taxas do Aplicativo (10%)</label>
          <select
            value={feeOption}
            onChange={(e) => setFeeOption(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', border: '1.5px solid #eee', backgroundColor: 'white', outline: 'none' }}
          >
            <option value="absorver">Absorver taxas do aplicativo (Deduzir 10% da receita do produtor)</option>
            <option value="repassar">Repassar taxas para o cliente (Adicionar 10% no total pago pelo cliente)</option>
          </select>
        </div>
      </div>

      {/* Dynamic Batches */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Configuração de Lotes</h4>
          <button
            type="button"
            onClick={handleAddBatch}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: '#fff7e6',
              color: '#f28d1a',
              border: 'none',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Adicionar Lote
          </button>
        </div>
        
        {batches.map((b, idx) => (
          <div key={idx} style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '16px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f28d1a' }}>Lote #{idx + 1} {b.sold > 0 && `(${b.sold} vendidos)`}</span>
              {batches.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveBatch(idx)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#ff5e5b',
                    border: 'none',
                    fontSize: '0.68rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Excluir
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Nome do Lote</label>
                <input 
                  type="text" 
                  value={b.name} 
                  onChange={(e) => handleBatchChange(idx, 'name', e.target.value)} 
                  className="input-field" 
                  style={{ padding: '6px 10px', fontSize: '0.72rem', margin: 0 }} 
                  placeholder="Ex: 1º Lote" 
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Tipo</label>
                <select
                  value={b.type}
                  onChange={(e) => handleBatchChange(idx, 'type', e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.72rem', borderRadius: '10px', border: '1.5px solid #eee', backgroundColor: 'white' }}
                >
                  <option value="pago">Pago</option>
                  <option value="gratuito">Gratuito</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Preço (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={b.price} 
                  disabled={b.type === 'gratuito'}
                  onChange={(e) => handleBatchChange(idx, 'price', e.target.value)} 
                  className="input-field" 
                  style={{ padding: '6px 10px', fontSize: '0.72rem', margin: 0 }}
                  placeholder="0.00"
                  required={b.type !== 'gratuito'}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Limite de Ingressos</label>
                <input 
                  type="number" 
                  value={b.limit} 
                  onChange={(e) => handleBatchChange(idx, 'limit', e.target.value)} 
                  className="input-field" 
                  style={{ padding: '6px 10px', fontSize: '0.72rem', margin: 0 }} 
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid #f0f0f0', paddingTop: '6px', marginTop: '2px' }}>
              <div>
                <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Início das Vendas (Data)</label>
                <input type="date" value={b.startDate} onChange={(e) => handleBatchChange(idx, 'startDate', e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem', borderRadius: '10px', border: '1.5px solid #eee' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Início (Hora)</label>
                <input type="time" value={b.startTime} onChange={(e) => handleBatchChange(idx, 'startTime', e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem', borderRadius: '10px', border: '1.5px solid #eee' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Fim das Vendas (Data)</label>
                <input type="date" value={b.endDate} onChange={(e) => handleBatchChange(idx, 'endDate', e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem', borderRadius: '10px', border: '1.5px solid #eee' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.62rem', color: '#666', display: 'block', marginBottom: '2px' }}>Fim (Hora)</label>
                <input type="time" value={b.endTime} onChange={(e) => handleBatchChange(idx, 'endTime', e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '0.72rem', borderRadius: '10px', border: '1.5px solid #eee' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Coupons */}
      <div style={{ border: '1px solid #eee', padding: '16px', borderRadius: '24px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2d2d2d', margin: 0 }}>Cupons de Desconto</h4>
          <button
            type="button"
            onClick={handleAddCoupon}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              backgroundColor: '#fff7e6',
              color: '#f28d1a',
              border: 'none',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Adicionar Cupom
          </button>
        </div>

        {coupons.length === 0 ? (
          <span style={{ fontSize: '0.68rem', color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhum cupom cadastrado para este evento.</span>
        ) : (
          coupons.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Código (Ex: VIP20)" 
                value={c.code} 
                onChange={(e) => handleCouponChange(idx, 'code', e.target.value)} 
                className="input-field" 
                style={{ padding: '6px 10px', fontSize: '0.72rem', margin: 0, flex: 2 }} 
                required
              />
              <select
                value={c.discountType}
                onChange={(e) => handleCouponChange(idx, 'discountType', e.target.value)}
                style={{ padding: '6px 10px', fontSize: '0.72rem', borderRadius: '10px', border: '1.5px solid #eee', backgroundColor: 'white', flex: 1.5 }}
              >
                <option value="percent">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
              <input 
                type="number" 
                placeholder="Desconto" 
                value={c.value} 
                onChange={(e) => handleCouponChange(idx, 'value', e.target.value)} 
                className="input-field" 
                style={{ padding: '6px 10px', fontSize: '0.72rem', margin: 0, flex: 1.5 }} 
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveCoupon(idx)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#ff5e5b',
                  border: 'none',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </div>

      {/* Event Policy */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Política do Evento (Reembolsos, regras de entrada e imagem)</label>
        <textarea 
          placeholder="Escreva a política do seu evento..." 
          value={policy || defaultPolicyTemplate} 
          onChange={(e) => setPolicy(e.target.value)} 
          className="input-field" 
          style={{ height: '90px', resize: 'vertical', fontSize: '0.75rem', lineHeight: 1.4 }}
        />
      </div>

      {/* Event Photos */}
      <div className="form-group" style={{ marginBottom: 4 }}>
        <label style={{ fontSize: '0.72rem', color: '#555', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Fotos do Evento (Até 10 slots - A primeira é a Capa)</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {evImages.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => document.getElementById(`ev-img-file-${idx}`).click()}
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
                    onClick={(e) => handleRemoveEventImage(idx, e)}
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
                id={`ev-img-file-${idx}`} 
                accept="image/*" 
                onChange={(e) => handleEventImageUpload(idx, e)}
                style={{ display: 'none' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555' }}>Descrição Geral da Festa</label>
        <textarea 
          placeholder="Escreva sobre as atrações, open bar, etc..." 
          value={evDescription} 
          onChange={(e) => setEvDescription(e.target.value)} 
          className="input-field" 
          style={{ height: '70px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
        <button type="button" onClick={() => setActiveTab('events')} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {editingEventId ? 'Salvar Alterações' : 'Criar Evento'}
        </button>
      </div>
    </form>
  );

  // --- SUBVIEW 4: FORYOU REELS ---
  const renderForyou = () => {
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
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Upload de Vídeo ForYou</h3>
            <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.3, margin: 0 }}>
              Publique vídeos de divulgação do seu evento no feed ForYou para viralizar as vendas dos lotes de ingressos!
            </p>

      {/* 1. Vídeo */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label style={{ fontSize: '0.72rem', color: '#666', marginBottom: '6px', display: 'block' }}>Vídeo</label>
        
        <input 
          type="file" 
          id="reels-video-file-upload-ev" 
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
            onClick={() => document.getElementById('reels-video-file-upload-ev').click()}
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
        <label>Legenda chamativa</label>
        <input 
          type="text" 
          placeholder="Ex: Confere o open bar que te espera nesse festival!" 
          value={vidTitle} 
          onChange={(e) => setVidTitle(e.target.value)} 
          className="input-field" 
          required 
        />
      </div>

      {/* 3. Descrição */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Descrição detalhada do Vídeo</label>
        <textarea 
          placeholder="Conte um pouco sobre o evento..." 
          value={reelsDesc}
          onChange={(e) => setReelsDesc(e.target.value)}
          className="input-field"
          style={{ height: '50px', resize: 'none' }}
        />
      </div>

      {/* 4. Vincular Evento */}
      <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
        <label>Vincular Evento (Opcional)</label>
        
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
          {reelsEventId ? (() => {
            const selectedEv = myEvents.find(ev => ev.id === reelsEventId);
            if (!selectedEv) return <span style={{ color: '#777' }}>Não vincular nenhum evento</span>;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={selectedEv.image} alt={selectedEv.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{selectedEv.name}</span>
                <span style={{ color: '#f28d1a', whiteSpace: 'nowrap' }}>R$ {(selectedEv.batches[0]?.price || 0).toFixed(2)}</span>
                <span style={{ fontSize: '0.65rem', backgroundColor: '#f28d1a15', color: '#f28d1a', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Eventos</span>
              </div>
            );
          })() : (
            <span style={{ color: '#777' }}>Não vincular nenhum evento</span>
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
                setReelsEventId('');
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
              Não vincular nenhum evento
            </div>
            
            {/* Lista de Eventos */}
            {myEvents.map(ev => (
              <div 
                key={ev.id}
                onClick={() => {
                  setReelsEventId(ev.id);
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
                <img src={ev.image} alt={ev.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#2d2d2d' }}>{ev.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#777', display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#f28d1a', fontWeight: 500 }}>R$ {(ev.batches[0]?.price || 0).toFixed(2)}</span>
                    <span>•</span>
                    <span>Eventos</span>
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
              style={{ width: '100%', height: '48px', marginTop: '10px', backgroundColor: '#f28d1a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
                        {v.linkedName ? `Vinculado a: ${v.linkedName}` : 'Sem evento vinculado'}
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

            {/* Modal de Edição de Vídeo do Organizador */}
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

                    {/* Alterar/Remover Evento Vinculado */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#666' }}>Evento Vinculado</label>
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
                          const selectedEv = myEvents.find(ev => ev.id === editVideoLinkedId);
                          if (!selectedEv) return <span style={{ color: '#777' }}>Sem evento vinculado</span>;
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={selectedEv.image} alt={selectedEv.name} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{selectedEv.name}</span>
                            </div>
                          );
                        })() : (
                          <span style={{ color: '#777' }}>Sem evento vinculado</span>
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
                          {myEvents.map(ev => (
                            <div 
                              key={ev.id}
                              onClick={() => {
                                setEditVideoLinkedId(ev.id);
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
                              <img src={ev.image} alt={ev.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</span>
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
                          const selectedEv = myEvents.find(ev => ev.id === editVideoLinkedId);
                          updateVideo(videoToEdit.id, {
                            title: editVideoTitle.trim(),
                            description: editVideoDesc.trim(),
                            linkedId: editVideoLinkedId,
                            linkedType: editVideoLinkedId ? 'event' : '',
                            linkedName: editVideoLinkedId ? selectedEv?.name || '' : ''
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

  // --- SUBVIEW 5: COMMISSIONERS VIEW ---
  const renderCommissioners = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Gestão de Comissários</h3>
        {myEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.78rem' }}>
            Cadastre um evento primeiro para poder vincular comissários!
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '24px', border: '1px solid #eee' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '10px' }}>Vendas por Comissários</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.72rem', color: '#666', display: 'block', marginBottom: '4px' }}>Selecione o Evento para visualizar:</label>
              <select
                value={selectedEventId || (myEvents[0]?.id || '')}
                onChange={(e) => setSelectedEventId(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.78rem', borderRadius: '12px', border: '2px solid #eaeaea', backgroundColor: 'white', fontWeight: 500 }}
              >
                <option value="">Selecione o Evento...</option>
                {myEvents.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              {((myEvents.find(e => e.id === selectedEventId) || myEvents[0])?.commissioners || []).map(comm => (
                <div key={comm.code} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderBottom: '1px solid #f9f9f9', paddingBottom: '4px' }}>
                  <div>
                    <span>{comm.name}</span> 
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#f9bb1a20', color: '#f28d1a', padding: '1px 6px', borderRadius: '8px', marginLeft: '6px' }}>Código: {comm.code}</span>
                  </div>
                  <span>{comm.sales} ingressos vendidos</span>
                </div>
              ))}
              {(!((myEvents.find(e => e.id === selectedEventId) || myEvents[0])?.commissioners) || ((myEvents.find(e => e.id === selectedEventId) || myEvents[0])?.commissioners || []).length === 0) && (
                <div style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', padding: '10px' }}>Nenhum comissário vinculado a este evento.</div>
              )}
            </div>
            
            {/* Add promoter form */}
            <form onSubmit={handleCommissionerSubmit} style={{ borderTop: '1px solid #eaeaea', marginTop: '12px', paddingTop: '12px' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '6px' }}>Cadastrar Novo Comissário</h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <input 
                  type="text" 
                  placeholder="Nome do Promoter" 
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  className="input-field" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '10px', margin: 0 }} 
                />
                <input 
                  type="text" 
                  placeholder="Código" 
                  value={commCode}
                  onChange={(e) => setCommCode(e.target.value)}
                  className="input-field" 
                  style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '10px', margin: 0 }} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.72rem', borderRadius: '10px', width: '100%', backgroundColor: '#f28d1a' }}>
                Vincular Promotor
              </button>
            </form>
          </div>
        )}
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
              { id: 'dashboard', label: 'Painel', icon: <Home size={18} /> },
              { id: 'profile', label: 'Perfil', icon: <User size={18} /> },
              { id: 'events', label: 'Eventos', icon: <Calendar size={18} /> },
              { id: 'commissioners', label: 'Comissários', icon: <Users size={18} /> },
              { id: 'foryou', label: 'ForYou', icon: <Play size={18} /> }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`desktop-nav-item ${(activeTab === item.id || (item.id === 'events' && activeTab === 'add_event')) ? 'active' : ''}`}
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

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '90px' }} className="custom-scroll">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && renderProfileView()}
        {activeTab === 'events' && renderEvents()}
        {activeTab === 'add_event' && renderAddEvent()}
        {activeTab === 'commissioners' && renderCommissioners()}
        {activeTab === 'foryou' && renderForyou()}
      </div>

      {/* Menu Fixo Embaixo com Ícones */}
      <div className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Painel', icon: <Home size={20} /> },
          { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
          { id: 'events', label: 'Eventos', icon: <Calendar size={20} /> },
          { id: 'commissioners', label: 'Comissários', icon: <Users size={20} /> },
          { id: 'foryou', label: 'ForYou', icon: <Play size={20} /> }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-item ${(activeTab === item.id || (item.id === 'events' && activeTab === 'add_event')) ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
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
      
      {showScannerModal && renderScannerModal()}
    </div>
  );
}
