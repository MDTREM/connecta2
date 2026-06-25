import { useState, useEffect } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { 
  Trash2, MessageSquare, Home, Wrench, Play, Camera, Upload, 
  ArrowLeft, X, Save, Edit, User, ClipboardList, MapPin, Phone, Clock, Star, Users,
  Bell, LogOut
} from 'lucide-react';
import { uploadAvatar, uploadServiceImage, uploadVideoFile } from '../../firebase/storage';

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
export default function ProviderArea({ onOpenChat, onToggleNotifications, unreadNotificationsCount, onLogout }) {
  const { 
    currentUser, services, servicesHired, addService, editService, deleteService, 
    updateHiringStatus, addVideo, setUsers, updateUserProfile, users,
    serviceReviews, categories, visualLayoutSettings,
    videos, deleteVideo, updateVideo
  } = useFirebaseMock();

  if (!currentUser) return null;
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('connecta_provider_active_tab') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('connecta_provider_active_tab', activeTab);
  }, [activeTab]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Edit profile states
  const [editingField, setEditingField] = useState(null); // 'name', 'description', 'phone', 'address', 'serviceCategory', 'openingHours'
  const [editValue, setEditValue] = useState('');

  // Form states for service
  const [editingServiceId, setEditingServiceId] = useState(null); // null or service ID
  const [servName, setServName] = useState('');
  const [servCategory, setServCategory] = useState('Guia Turístico');
  const [servPrice, setServPrice] = useState('');
  const [servPriceType, setServPriceType] = useState('hour');
  const [servOriginalPrice, setServOriginalPrice] = useState('');
  const [servMinHours, setServMinHours] = useState('2');
  const [servImages, setServImages] = useState(Array(10).fill(''));
  const [servVariations, setServVariations] = useState([]);
  const [servDescription, setServDescription] = useState('');

  // Inline variation states
  const [newVarText, setNewVarText] = useState('');
  const [newVarImage, setNewVarImage] = useState('');
  const [newVarPrice, setNewVarPrice] = useState('');

  // Reels upload states
  const [vidTitle, setVidTitle] = useState('');
  const [reelsDesc, setReelsDesc] = useState('');
  const [reelsVideoUrl, setReelsVideoUrl] = useState('');
  const [reelsVideoName, setReelsVideoName] = useState('');
  const [reelsServiceId, setReelsServiceId] = useState('');
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);
  const [reelsFile, setReelsFile] = useState(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [foryouSubTab, setForyouSubTab] = useState('upload');
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoDesc, setEditVideoDesc] = useState('');
  const [editVideoLinkedId, setEditVideoLinkedId] = useState('');
  const [isEditLinkDropdownOpen, setIsEditLinkDropdownOpen] = useState(false);
   // Saque modal states
   const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawPixKey, setWithdrawPixKey] = useState('');
    const [withdrawAccount, setWithdrawAccount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
   const [withdrawError, setWithdrawError] = useState('');
   const [withdrawSuccess, setWithdrawSuccess] = useState(false);
   const [showTaxInfoModal, setShowTaxInfoModal] = useState(false);

  const providerServices = services ? services.filter(s => s.providerId === currentUser?.id) : [];
  const providerHirings = servicesHired ? servicesHired.filter(h => h.providerId === currentUser?.id) : [];
  const activeHirings = providerHirings.filter(h => h.status === 'pending' || h.status === 'accepted');

  const totalEarnings = providerHirings
    .filter(h => h.status === 'completed')
    .reduce((acc, h) => {
      const valTotal = parseFloat(h.total || 0);
      const valFee = parseFloat(h.commissionFee || 0);
      return acc + (isNaN(valTotal) ? 0 : valTotal) - (isNaN(valFee) ? 0 : valFee);
    }, 0);

  const withdrawableBalance = isNaN(totalEarnings) ? 0 : totalEarnings; // Real withdrawable balance from completed services

  const myReviews = serviceReviews ? serviceReviews.filter(r => r.providerId === currentUser.id) : [];
  const totalReviewsCount = myReviews.length;
  const avgRating = totalReviewsCount > 0 
    ? parseFloat((myReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)) 
    : 0.0;
  const serviceCategories = categories ? categories.filter(c => c.type === 'servicos') : [];
  const serviceCats = serviceCategories.length > 0 ? serviceCategories : [
    { label: 'Guia Turístico / Roteiros', key: 'Guia Turístico' },
    { label: 'Fotógrafo', key: 'Fotógrafo' },
    { label: 'Diarista / Faxina', key: 'Diarista' },
    { label: 'Manutenção Geral', key: 'Marido de Aluguel' },
    { label: 'Entregas Grandes / Mudanças', key: 'Fretes' }
  ];


  const handleServiceImageUpload = async (idx, e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const serviceId = editingServiceId && editingServiceId !== 'new' ? editingServiceId : 'temp_' + Date.now();
        const url = await uploadServiceImage(file, currentUser.id, serviceId);
        setServImages(prev => {
          const updated = [...prev];
          updated[idx] = url;
          return updated;
        });
      } catch (error) {
        console.error(error);
        alert('Erro ao fazer upload da imagem.');
      }
    }
  };
  const handleRemoveServiceImage = (idx, e) => {
    if (e) e.stopPropagation();
    setServImages(prev => {
      const updated = [...prev];
      updated[idx] = '';
      return updated;
    });
  };
  const handleVarImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const serviceId = editingServiceId && editingServiceId !== 'new' ? editingServiceId : 'temp_' + Date.now();
        const url = await uploadServiceImage(file, currentUser.id, serviceId);
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
      alert('Digite o texto da variação!');
      return;
    }
    const newVar = {
      id: 'var_' + Math.random().toString(36).substr(2, 9),
      text: newVarText.trim(),
      image: newVarImage || '',
      price: parseFloat(newVarPrice) || 0
    };
    setServVariations(prev => [...prev, newVar]);
    setNewVarText('');
    setNewVarImage('');
    setNewVarPrice('');
  };

  const handleRemoveVariation = (varId) => {
    setServVariations(prev => prev.filter(v => v.id !== varId));
  };

  const handleSelectServiceForEdit = (servId) => {
    const serv = services.find(s => s.id === servId);
    if (serv) {
      setEditingServiceId(servId);
      setServName(serv.name || '');
      setServPriceType(serv.priceType || 'hour');
      let realPrice = serv.priceType === 'total' ? serv.totalPrice : serv.pricePerHour;
      if (realPrice === null || realPrice === undefined || isNaN(parseFloat(realPrice))) {
        realPrice = serv.price;
      }
      setServPrice((realPrice !== null && realPrice !== undefined && !isNaN(realPrice)) ? realPrice.toString() : '');
      setServOriginalPrice(serv.originalPrice?.toString() || '');
      setServMinHours(serv.minHours?.toString() || '1');
      setServCategory(serv.category || 'Guia Turístico');
      setServDescription(serv.description || '');
      setServVariations(serv.variations || []);
      
      const imagesArray = Array(10).fill('');
      if (serv.images && serv.images.length > 0) {
        serv.images.forEach((img, idx) => {
          if (idx < 10) imagesArray[idx] = img;
        });
      } else if (serv.image) {
        imagesArray[0] = serv.image;
      }
      setServImages(imagesArray);
      
      setActiveTab('add_service');
    }
  };

  const handleNewServiceClick = () => {
    setEditingServiceId('new');
    setServPriceType('hour');
    setServName('');
    setServPrice('');
    setServOriginalPrice('');
    setServMinHours('1');
    setServCategory(serviceCats[0]?.key || serviceCats[0]?.label || 'Guia Turístico');
    setServDescription('');
    setServImages(Array(10).fill(''));
    setServVariations([]);
    setActiveTab('add_service');
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReelsFile(file);
      const url = URL.createObjectURL(file);
      setReelsVideoUrl(url);
      setReelsVideoName(file.name);
    }
  };

  const handleServiceSubmit = (e) => {
    e.preventDefault();
    if (!servName || !servPrice) return;

    const filteredImages = servImages.filter(img => img !== '');
    const mainImage = filteredImages[0] || 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400';

    const priceVal = Math.max(0, parseFloat(servPrice) || 0);
    const origPriceVal = servOriginalPrice ? Math.max(0, parseFloat(servOriginalPrice)) : null;

    const servicePayload = {
      providerId: currentUser.id,
      providerName: currentUser.name,
      name: servName,
      category: servCategory,
      priceType: servPriceType,
      pricePerHour: servPriceType === 'hour' ? priceVal : null,
      totalPrice: servPriceType === 'total' ? priceVal : null,
      price: priceVal,
      originalPrice: origPriceVal,
      minHours: servPriceType === 'hour' ? (parseInt(servMinHours) || 1) : 1,
      image: mainImage,
      images: filteredImages,
      variations: servVariations,
      description: servDescription
    };

    if (editingServiceId === 'new' || !editingServiceId) {
      addService(servicePayload);
      alert('Serviço cadastrado com sucesso!');
    } else {
      editService(editingServiceId, servicePayload);
      alert('Serviço atualizado com sucesso!');
    }

    setEditingServiceId(null);
    setActiveTab('services');
  };

  const startEditing = (field, initialVal) => {
    setEditingField(field);
    setEditValue(initialVal);
  };

  const handleSaveField = (field) => {
    updateUserProfile(currentUser.id, { [field]: editValue });
    setEditingField(null);
  };
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadAvatar(file, currentUser.id);
        updateUserProfile(currentUser.id, { avatar: url });
      } catch (error) {
        console.error(error);
        alert('Erro ao enviar avatar. Tente novamente.');
      }
    }
  };
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      compressImage(file, 800, 300, (compressedBase64) => {
        updateUserProfile(currentUser.id, { banner: compressedBase64, cover: compressedBase64 });
      });
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
      alert('Selecione um vídeo e uma legenda, sô!');
      return;
    }
    setIsUploadingVideo(true);
    try {
      let finalVideoUrl = reelsVideoUrl;
      if (reelsFile) {
        finalVideoUrl = await uploadVideoFile(reelsFile, currentUser.id);
      }

      const linkedServ = services.find(s => s.id === reelsServiceId);

      addVideo({
        title: vidTitle,
        description: reelsDesc,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        videoUrl: finalVideoUrl,
        poster: linkedServ ? linkedServ.image : currentUser.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        linkedType: linkedServ ? 'service' : null,
        linkedId: linkedServ ? linkedServ.id : null,
        linkedName: linkedServ ? linkedServ.name : null,
        linkedPrice: linkedServ ? linkedServ.pricePerHour : null
      });

      setVidTitle('');
      setReelsDesc('');
      setReelsVideoUrl('');
      setReelsVideoName('');
      setReelsServiceId('');
      setReelsFile(null);
      setForyouSubTab('my_videos');
      alert('Vídeo publicado com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar vídeo. Tente novamente.');
    } finally {
      setIsUploadingVideo(false);
    }
  };
  // --- SUBVIEW 2: PROFILE VIEW (PRESTADOR) ---
  const renderProfileView = () => {
    const followers = users.filter(u => u.following && u.following.includes(currentUser.id));

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
            htmlFor="cover-file-upload-prov"
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
            id="cover-file-upload-prov" 
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
              src={currentUser.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} 
              alt="logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <label 
              htmlFor="logo-file-upload-prov"
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
              id="logo-file-upload-prov" 
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
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>{currentUser.name}</h3>
                <button type="button" onClick={() => startEditing('name', currentUser.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={14} /></button>
              </div>
            )}

            {/* CATEGORY */}
            {editingField === 'serviceCategory' ? (
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
                  {serviceCats.map(cat => (
                    <option key={cat.id || cat.key || cat.label} value={cat.key || cat.label}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => handleSaveField('serviceCategory')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentUser.serviceCategory || 'Guia Turístico'}</span>
                <button type="button" onClick={() => startEditing('serviceCategory', currentUser.serviceCategory || 'Guia Turístico')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
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
                  <button type="button" onClick={() => handleSaveField('phone')} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={12} /></button>
                  <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto' }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} style={{ color: '#aaa' }} /> 
                  <span style={{ color: '#555' }}>Telefone:</span> {currentUser.phone}
                  <button type="button" onClick={() => startEditing('phone', currentUser.phone)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
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
                  <button type="button" onClick={() => handleSaveField('openingHours')} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={12} /></button>
                  <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.7rem', height: '28px', width: 'auto' }}><X size={12} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} style={{ color: '#aaa' }} /> 
                  <span style={{ color: '#555' }}>Horário:</span> {currentUser.openingHours || '08:00 às 18:00'}
                  <button type="button" onClick={() => startEditing('openingHours', currentUser.openingHours || '08:00 às 18:00')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={10} /></button>
                </div>
              )}
            </div>

            {/* RATINGS (Read Only) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={12} 
                    fill={avgRating > 0 && star <= Math.round(avgRating) ? "#f28d1a" : "#ddd"} 
                    stroke="none" 
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#2d2d2d', fontWeight: 500 }}>
                {avgRating > 0 ? avgRating.toFixed(1) : '0'} ({totalReviewsCount} {totalReviewsCount === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </div>

            {/* FOLLOWERS (Read Only) */}
            <div style={{ marginTop: '14px', borderTop: '1px solid #f2f2f2', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#2d2d2d' }}>
                <Users size={14} style={{ color: '#666' }} />
                <span>Seguidores:</span>
                <strong style={{ fontWeight: 500 }}>{followers.length} clientes</strong>
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
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f9f9f9', padding: '4px 10px', borderRadius: '12px', border: '1px solid #eee', flexShrink: 0 }}>
                    <img src={f.avatar} alt={f.name} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.65rem', color: '#666' }}>{f.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Services Grid (Client View Layout with edit trigger) */}
        <div style={{ padding: '16px 0', paddingBottom: '90px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Serviços Disponíveis</h4>
          
          {providerServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '0.78rem' }}>
              Nenhum serviço cadastrado ainda.
            </div>
          ) : (
            <div className="responsive-profile-grid" style={{ gap: '12px' }}>
              {providerServices.map(s => {
                const servicePrice = s.pricePerHour || s.price || 0;
                const hasDiscount = s.originalPrice && servicePrice < s.originalPrice;
                const discountPercent = hasDiscount ? Math.round(((s.originalPrice - servicePrice) / s.originalPrice) * 100) : 0;
                return (
                  <div 
                    key={s.id}
                    onClick={() => handleSelectServiceForEdit(s.id)}
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
                      <strong style={{ fontSize: '0.8rem', color: '#f28d1a', fontWeight: 500 }}>R$ {servicePrice.toFixed(2)}{s.priceType === 'total' ? '' : '/h'}</strong>
                      {hasDiscount && (
                        <span style={{ fontSize: '0.68rem', textDecoration: 'line-through', color: '#bbb' }}>R$ {s.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '2px' }}>
                      {(servicesHired || []).filter(sh => sh.serviceId === s.id && sh.status === 'completed').length} serviços realizados
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

        {/* Avaliações dos Clientes */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #f2f2f2', paddingTop: '16px', paddingBottom: '30px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '12px' }}>Avaliações dos Clientes ({myReviews.length})</h4>
          {myReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px', color: '#999', fontSize: '0.75rem' }}>
              Nenhuma avaliação recebida ainda.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myReviews.map(r => (
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

  // --- SUBVIEW 3: HIRINGS PIPELINE ---
  const renderHiringList = (list, sectionTitle) => {
    if (list.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: '#f28d1a', margin: '8px 0 4px 0', borderBottom: '1px solid #f28d1a33', paddingBottom: '4px' }}>
          {sectionTitle} ({list.length})
        </h4>
        {list.map(h => (
          <div
            key={h.id}
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
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{h.serviceName}</span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: '8px',
                backgroundColor: h.status === 'completed' ? '#e6f7f4' : h.status === 'rejected' ? '#ff5e5b15' : '#fff0d2',
                color: h.status === 'completed' ? '#2ec4b6' : h.status === 'rejected' ? '#ff5e5b' : '#d4730d'
              }}>
                {h.status === 'pending' ? 'Pendente' : h.status === 'accepted' ? 'Aceito' : h.status === 'completed' ? 'Concluído' : 'Recusado'}
              </span>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#666' }}>
              <div>Data/Hora: {h.date} às {h.time}</div>
              <div>Contratante: {h.customerName} ({h.customerPhone})</div>
              <div>Estimado: {h.hours} horas (Líquido: R$ {(h.total - h.commissionFee).toFixed(2)})</div>
              {h.notes && <div>Obs: {h.notes}</div>}
            </div>

            {h.status === 'pending' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => updateHiringStatus(h.id, 'rejected')}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '6px 0', fontSize: '0.72rem', borderRadius: '12px' }}
                >
                  Recusar
                </button>
                <button
                  type="button"
                  onClick={() => updateHiringStatus(h.id, 'accepted')}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '6px 0', fontSize: '0.72rem', borderRadius: '12px', backgroundColor: '#f28d1a' }}
                >
                  Aceitar Serviço
                </button>
              </div>
            )}

            {h.status === 'accepted' && (
              <button
                type="button"
                onClick={() => updateHiringStatus(h.id, 'completed')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '6px 0', fontSize: '0.72rem', borderRadius: '12px', marginTop: '4px', backgroundColor: '#2ec4b6' }}
              >
                Concluir Serviço
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderHirings = () => {
    const pendingHirings = providerHirings.filter(h => h.status === 'pending');
    const acceptedHirings = providerHirings.filter(h => h.status === 'accepted');
    const completedHirings = providerHirings.filter(h => h.status === 'completed' || h.status === 'rejected');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>Solicitações de Serviço ({providerHirings.length})</h3>
        
        {providerHirings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ClipboardList size={48} style={{ color: '#ccc', marginBottom: '8px' }} />
            <p style={{ fontSize: '0.82rem' }}>Nenhuma solicitação de agendamento ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {renderHiringList(pendingHirings, 'Pendentes')}
            {renderHiringList(acceptedHirings, 'Aprovado')}
            {renderHiringList(completedHirings, 'Serviço Realizado')}
          </div>
        )}
      </div>
    );
  };

  // --- SUBVIEW 1: DASHBOARD ---
  const renderDashboard = () => (

    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d' }}>{currentUser.name}</h2>
          <p style={{ fontSize: '0.78rem', color: '#777' }}>Prestador de Serviços | Ouro Preto</p>
        </div>
      </div>

      {/* Metrics widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { label: 'Saldo Disponível', val: `R$ ${withdrawableBalance.toFixed(2)}`, desc: 'Disponível para saque', color: '#fffdf4', btn: 'Sacar' },
          { label: 'Serviços Ativos', val: `${activeHirings.length} agendados`, desc: 'Pendentes / Aceitos', color: '#fffdf0' },
          { label: 'Ganhos do Mês', val: `R$ ${totalEarnings.toFixed(2)}`, desc: 'Acumulado no caixa', color: '#f3faf8' },
          { label: 'Avaliação Média', val: `${avgRating} ★`, desc: `Baseado em ${totalReviewsCount} avaliações`, color: '#fef3f3' }
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
            <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600 }}>{st.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2d2d2d', margin: '4px 0' }}>{st.val}</div>
            <div style={{ fontSize: '0.62rem', color: '#999' }}>{st.desc}</div>
            {st.btn && (
              <button 
                type="button"
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
                  padding: '4px 12px',
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
                A taxa cobrada pelo Conecta+ para prestação de serviços é de <strong>{visualLayoutSettings?.commissions?.services !== undefined ? visualLayoutSettings.commissions.services : 10}%</strong> sobre o valor de cada contratação.
              </div>

              <div style={{ backgroundColor: '#f3faf8', padding: '14px', borderRadius: '16px', border: '1px solid #2ec4b615' }}>
                <strong style={{ color: '#2ec4b6', display: 'block', marginBottom: '4px' }}>Saldo Líquido</strong>
                O valor líquido dos seus serviços é creditado no seu saldo disponível assim que a contratação for marcada como realizada.
              </div>

              <div style={{ backgroundColor: '#fcf6ed', padding: '14px', borderRadius: '16px', border: '1px solid #f28d1a15' }}>
                <strong style={{ color: '#f28d1a', display: 'block', marginBottom: '4px' }}>Saques Sem Complicação</strong>
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


  // --- SUBVIEW 2: SERVICES LIST ---
  const renderServices = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d' }}>Meus Serviços ({providerServices.length})</h3>
        <button
          onClick={handleNewServiceClick}
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
          + Adicionar Serviço
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {providerServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '20px', border: '1px solid #eee', color: '#999', fontSize: '0.8rem' }}>
            Nenhum serviço cadastrado. Clique em "+ Adicionar Serviço" para começar!
          </div>
        ) : (
          providerServices.map(serv => (
            <div
              key={serv.id}
              onClick={() => handleSelectServiceForEdit(serv.id)}
              style={{
                display: 'flex',
                gap: '12px',
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '20px',
                border: '1px solid #eee',
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <img src={serv.image} alt={serv.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 500 }}>{serv.name}</h4>
                <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '2px' }}>
                  {serv.priceType === 'total' 
                    ? `R$ ${(serv.price || 0).toFixed(2)}` 
                    : `R$ ${(serv.pricePerHour || 0).toFixed(2)}/hora (mín ${serv.minHours}h)`
                  }
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Edit size={16} style={{ color: '#f28d1a', cursor: 'pointer' }} />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Tem certeza que deseja remover este serviço, sô?')) {
                      deleteService(serv.id);
                    }
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff5e5b', padding: 0 }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // --- SUBVIEW 3: ADD SERVICE FORM ---
  const renderAddServiceForm = () => (
    <form onSubmit={handleServiceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <button 
          type="button" 
          onClick={() => setActiveTab('services')} 
          style={{ background: 'none', border: 'none', color: '#2d2d2d', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft size={20} />
        </button>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d', margin: 0 }}>
          {editingServiceId === 'new' || !editingServiceId ? 'Cadastrar Novo Serviço' : 'Editar Serviço'}
        </h3>
      </div>

      {/* Slots for Up to 10 Images */}
      <div className="form-group" style={{ marginBottom: 4 }}>
        <label style={{ fontSize: '0.72rem', color: '#666', marginBottom: '4px', display: 'block' }}>Fotos do Serviço (Até 10 slots - Primeira é a Capa)</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {servImages.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => document.getElementById(`serv-img-file-${idx}`).click()}
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
                    onClick={(e) => handleRemoveServiceImage(idx, e)}
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
                id={`serv-img-file-${idx}`} 
                accept="image/*" 
                onChange={(e) => handleServiceImageUpload(idx, e)}
                style={{ display: 'none' }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Nome do Serviço</label>
        <input 
          type="text" 
          placeholder="Ex: Passeio Guiado nas Minas Históricas" 
          value={servName} 
          onChange={(e) => setServName(e.target.value)} 
          className="input-field" 
          required 
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Descrição detalhada</label>
        <textarea 
          placeholder="Descreva o que está incluso no serviço..." 
          value={servDescription} 
          onChange={(e) => setServDescription(e.target.value)} 
          className="input-field" 
          style={{ height: '60px', resize: 'none' }}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Categoria do Serviço</label>
        <select 
          value={servCategory} 
          onChange={(e) => setServCategory(e.target.value)} 
          style={{ width: '100%', padding: '14px 18px', borderRadius: '16px', border: '2px solid #eaeaea', fontSize: '0.9rem', backgroundColor: 'white' }}
        >
          {serviceCats.map(cat => (
            <option key={cat.id || cat.key || cat.label} value={cat.key || cat.label}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de cobrança */}
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Tipo de Cobrança</label>
        <div style={{ display: 'flex', gap: '0', borderRadius: '12px', overflow: 'hidden', border: '2px solid #eaeaea' }}>
          <button
            type="button"
            onClick={() => setServPriceType('hour')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: servPriceType === 'hour' ? 'linear-gradient(135deg, #f9bb1a, #f28d1a)' : '#fafafa',
              color: servPriceType === 'hour' ? 'white' : '#777',
              transition: 'all 0.2s ease'
            }}
          >
            Valor por Hora
          </button>
          <button
            type="button"
            onClick={() => setServPriceType('total')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderLeft: '1px solid #eaeaea',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: servPriceType === 'total' ? 'linear-gradient(135deg, #f9bb1a, #f28d1a)' : '#fafafa',
              color: servPriceType === 'total' ? 'white' : '#777',
              transition: 'all 0.2s ease'
            }}
          >
            Valor Total
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>{servPriceType === 'hour' ? 'Preço por Hora (R$)' : 'Preço Total (R$)'}</label>
          <input 
            type="number" 
            min="0"
            step="0.01"
            placeholder="45.00" 
            value={servPrice} 
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || parseFloat(val) >= 0) setServPrice(val);
            }} 
            className="input-field" 
            required 
          />
        </div>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>Preço Desconto (R$)</label>
          <input 
            type="number" 
            min="0"
            step="0.01"
            placeholder="Ex: 55.00" 
            value={servOriginalPrice} 
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || parseFloat(val) >= 0) setServOriginalPrice(val);
            }} 
            className="input-field" 
          />
        </div>
      </div>

      {servPriceType === 'hour' && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Horas Mínimas</label>
          <input 
            type="number" 
            min="1"
            value={servMinHours} 
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || parseInt(val) >= 0) setServMinHours(val);
            }} 
            className="input-field" 
            required 
          />
        </div>
      )}

      {/* Service Variations section */}
      <div style={{ border: '1px solid #eee', padding: '12px', borderRadius: '16px', backgroundColor: '#fafafa', marginTop: '4px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#666', display: 'block', marginBottom: '8px' }}>Cadastro de Variações (Duração, Idioma, etc.)</span>
        
        {/* Added variations list */}
        {servVariations.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
            {servVariations.map(v => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ffffff', padding: '6px 10px', borderRadius: '10px', border: '1px solid #eee' }}>
                {v.image && <img src={v.image} alt={v.text} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />}
                <span style={{ fontSize: '0.75rem', flex: 1, color: '#333' }}>{v.text}</span>
                {v.price > 0 && <span style={{ fontSize: '0.68rem', color: '#f28d1a', fontWeight: 500 }}>+R$ {v.price.toFixed(2)}</span>}
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
            onClick={() => document.getElementById('serv-var-image-file').click()}
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
            id="serv-var-image-file" 
            accept="image/*" 
            onChange={handleVarImageUpload}
            style={{ display: 'none' }}
          />

          <input 
            type="text" 
            placeholder="Texto (ex: Em Inglês)" 
            value={newVarText}
            onChange={(e) => setNewVarText(e.target.value)}
            className="input-field"
            style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0, flex: 1, height: '36px' }}
          />

          <input 
            type="number" 
            placeholder="+ R$" 
            value={newVarPrice}
            onChange={(e) => setNewVarPrice(e.target.value)}
            className="input-field"
            style={{ padding: '6px 8px', fontSize: '0.75rem', margin: 0, width: '70px', height: '36px', flexShrink: 0 }}
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
        <button type="button" onClick={() => setActiveTab('services')} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: '#f28d1a' }}>Salvar Serviço</button>
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
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d' }}>Upload de Vídeo ForYou</h3>
            <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.3 }}>
              Publique vídeos do seu serviço para a aba ForYou e conquiste mais agendamentos de turistas e locais!
            </p>

            {/* 1. Vídeo */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.72rem', color: '#666', marginBottom: '6px', display: 'block' }}>Vídeo</label>
              
              <input 
                type="file" 
                id="reels-video-file-upload-prov" 
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
                  onClick={() => document.getElementById('reels-video-file-upload-prov').click()}
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
                placeholder="Ex: Conheça as ruelas de Ouro Preto como nunca!" 
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
                placeholder="Conte um pouco sobre o serviço oferecido..." 
                value={reelsDesc}
                onChange={(e) => setReelsDesc(e.target.value)}
                className="input-field"
                style={{ height: '50px', resize: 'none' }}
              />
            </div>

            {/* 4. Vincular Serviço */}
            <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
              <label>Vincular Serviço (Opcional)</label>
              
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
                {reelsServiceId ? (() => {
                  const selectedServ = providerServices.find(s => s.id === reelsServiceId);
                  if (!selectedServ) return <span style={{ color: '#777' }}>Não vincular nenhum serviço</span>;
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={selectedServ.image} alt={selectedServ.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{selectedServ.name}</span>
                      <span style={{ color: '#f28d1a', whiteSpace: 'nowrap' }}>R$ {(selectedServ.pricePerHour || selectedServ.price || 0).toFixed(2)}{selectedServ.priceType === 'total' ? '' : '/h'}</span>
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#f28d1a15', color: '#f28d1a', padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>{selectedServ.category}</span>
                    </div>
                  );
                })() : (
                  <span style={{ color: '#777' }}>Não vincular nenhum serviço</span>
                )}
                <span style={{ fontSize: '0.6rem', color: '#999' }}>▼</span>
              </div>

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
                  <div 
                    onClick={() => {
                      setReelsServiceId('');
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
                    Não vincular nenhum serviço
                  </div>
                  {providerServices.map(s => (
                    <div 
                      key={s.id}
                      onClick={() => {
                        setReelsServiceId(s.id);
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
                      <img src={s.image} alt={s.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#2d2d2d' }}>{s.name}</div>
                        <div style={{ fontSize: '0.68rem', color: '#777', display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#f28d1a', fontWeight: 500 }}>R$ {(s.pricePerHour || s.price || 0).toFixed(2)}{s.priceType === 'total' ? '' : '/h'}</span>
                          <span>•</span>
                          <span>{s.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={providerServices.length === 0 || isUploadingVideo}
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                height: '48px', 
                marginTop: '10px', 
                backgroundColor: isUploadingVideo ? '#ccc' : '#f28d1a',
                cursor: isUploadingVideo ? 'not-allowed' : 'pointer'
              }}
            >
              {isUploadingVideo ? 'Enviando vídeo...' : 'Publicar Vídeo no ForYou'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d' }}>Gerenciar Vídeos</h3>
            
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
                        {v.linkedName ? `Vinculado a: ${v.linkedName}` : 'Sem serviço vinculado'}
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

            {/* Modal de Edição de Vídeo */}
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

                    {/* Alterar/Remover Serviço Vinculado */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 500, color: '#666' }}>Serviço Vinculado</label>
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
                          const selectedServ = providerServices.find(s => s.id === editVideoLinkedId);
                          if (!selectedServ) return <span style={{ color: '#777' }}>Sem serviço vinculado</span>;
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={selectedServ.image} alt={selectedServ.name} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{selectedServ.name}</span>
                            </div>
                          );
                        })() : (
                          <span style={{ color: '#777' }}>Sem serviço vinculado</span>
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
                          {providerServices.map(s => (
                            <div 
                              key={s.id}
                              onClick={() => {
                                setEditVideoLinkedId(s.id);
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
                              <img src={s.image} alt={s.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
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
                          const selectedServ = providerServices.find(s => s.id === editVideoLinkedId);
                          updateVideo(videoToEdit.id, {
                            title: editVideoTitle.trim(),
                            description: editVideoDesc.trim(),
                            linkedId: editVideoLinkedId,
                            linkedType: editVideoLinkedId ? 'service' : '',
                            linkedName: editVideoLinkedId ? selectedServ?.name || '' : ''
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', position: 'relative' }} className="animate-fade-in">
      
      {/* Provider Header (Visible on both desktop and mobile) */}
      <header style={{
        height: '56px',
        borderBottom: '1px solid #eaeaea',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        flexShrink: 0,
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}>
            <img 
              src="/logo-full.png" 
              alt="Connecta+" 
              style={{ height: isMobile ? '18px' : '34px', objectFit: 'contain' }} 
            />
          </div>

          {/* Nav links (Desktop Only) */}
          {!isMobile && (
            <nav className="desktop-nav" style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'dashboard', label: 'Painel', icon: <Home size={18} /> },
                { id: 'profile', label: 'Perfil', icon: <User size={18} /> },
                { id: 'services', label: 'Serviços', icon: <Wrench size={18} /> },
                { id: 'hirings', label: 'Solicitações', icon: <ClipboardList size={18} /> },
                { id: 'foryou', label: 'ForYou', icon: <Play size={18} /> }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`desktop-nav-item ${(activeTab === item.id || (item.id === 'services' && activeTab === 'add_service')) ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}

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
        {activeTab === 'services' && renderServices()}
        {activeTab === 'add_service' && renderAddServiceForm()}
        {activeTab === 'hirings' && renderHirings()}
        {activeTab === 'foryou' && renderForyou()}
      </div>

      {/* Menu Fixo Embaixo com Ícones */}
      <div className="bottom-nav">
        {[
          { id: 'dashboard', label: 'Painel', icon: <Home size={20} /> },
          { id: 'profile', label: 'Perfil', icon: <User size={20} /> },
          { id: 'services', label: 'Serviços', icon: <Wrench size={20} /> },
          { id: 'hirings', label: 'Solicitações', icon: <ClipboardList size={20} /> },
          { id: 'foryou', label: 'ForYou', icon: <Play size={20} /> }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-item ${(activeTab === item.id || (item.id === 'services' && activeTab === 'add_service')) ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Modal de Saque Pix */}
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

                // Success simulation: Deduct balance or show success state
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
                      backgroundColor: '#fcfcfc',
                      fontWeight: '600'
                    }}
                    required
                  />
                </div>

                {withdrawError && (
                  <div style={{ color: '#ff5e5b', fontSize: '0.75rem', fontWeight: 500 }}>
                    {withdrawError}
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    marginTop: '6px',
                    padding: '12px',
                    backgroundColor: '#f28d1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  Confirmar Saque
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
