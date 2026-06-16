import { useState } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { 
  Calendar, MessageSquare, Home, Play, Upload, X, 
  User, MapPin, Phone, Clock, Star, Users, Camera, Save, Edit 
} from 'lucide-react';

export default function EventsArea({ onOpenChat }) {
  const { currentUser, events, addEvent, addCommissioner, addVideo, setUsers } = useFirebaseMock();

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, profile, events, add_event, commissioners, foryou

  // Edit profile states
  const [editingField, setEditingField] = useState(null); // 'name', 'description', 'phone', 'address', 'category', 'openingHours'
  const [editValue, setEditValue] = useState('');

  // Form states for new event
  const [evName, setEvName] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evImage, setEvImage] = useState('https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500');
  const [evDescription, setEvDescription] = useState('');
  
  // Batch states
  const [batch1Name, setBatch1Name] = useState('1º Lote');
  const [batch1Price, setBatch1Price] = useState('40.00');
  const [batch1Limit, setBatch1Limit] = useState('100');
  const [batch2Name, setBatch2Name] = useState('2º Lote');
  const [batch2Price, setBatch2Price] = useState('60.00');
  const [batch2Limit, setBatch2Limit] = useState('150');

  // Promoter states
  const [commName, setCommName] = useState('');
  const [commCode, setCommCode] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');

  // Reels upload states
  const [vidTitle, setVidTitle] = useState('');
  const [reelsDesc, setReelsDesc] = useState('');
  const [reelsVideoUrl, setReelsVideoUrl] = useState('');
  const [reelsVideoName, setReelsVideoName] = useState('');
  const [reelsEventId, setReelsEventId] = useState('');
  const [isLinkDropdownOpen, setIsLinkDropdownOpen] = useState(false);


  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReelsVideoUrl(url);
      setReelsVideoName(file.name);
    }
  };

  const myEvents = events.filter(e => e.organizerId === currentUser.id);

  // Compute sales stats
  let totalTicketsSold = 0;
  let grossSales = 0;
  myEvents.forEach(e => {
    e.batches.forEach(b => {
      totalTicketsSold += b.sold;
      grossSales += b.sold * b.price;
    });
  });

  const netEarnings = grossSales * 0.90; // 10% Connecta+ commission fee
  const withdrawableBalance = netEarnings + 800.00; // Simulated historical balance

  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (!evName || !evDate || !evLocation) return;

    addEvent({
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      name: evName,
      date: evDate,
      location: evLocation,
      image: evImage,
      cover: evImage,
      description: evDescription,
      batches: [
        { name: batch1Name || '1º Lote', price: parseFloat(batch1Price), limit: parseInt(batch1Limit) },
        { name: batch2Name || '2º Lote', price: parseFloat(batch2Price), limit: parseInt(batch2Limit) }
      ]
    });

    setEvName('');
    setEvDate('');
    setEvLocation('');
    setEvDescription('');
    setBatch1Name('1º Lote');
    setBatch2Name('2º Lote');
    setActiveTab('events');
  };

  const handleCommissionerSubmit = (e) => {
    e.preventDefault();
    if (!commName || !commCode || !selectedEventId) {
      alert('Preencha os dados do comissário, sô!');
      return;
    }

    addCommissioner(selectedEventId, commName, commCode);
    setCommName('');
    setCommCode('');
    alert('Comissário cadastrado com sucesso! Compartilhe o código dele para contabilizar vendas.');
  };

  const startEditing = (field, initialVal) => {
    setEditingField(field);
    setEditValue(initialVal);
  };

  const handleSaveField = (field) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, [field]: editValue } : u));
    setEditingField(null);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, logo: base64 } : u));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, cover: base64 } : u));
      };
      reader.readAsDataURL(file);
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

  const handleReelsSubmit = (e) => {
    e.preventDefault();
    if (!vidTitle || !reelsVideoUrl) {
      alert('Adicione um vídeo e uma legenda, sô!');
      return;
    }

    const linkedEv = events.find(ev => ev.id === reelsEventId);

    addVideo({
      title: vidTitle,
      description: reelsDesc,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      videoUrl: reelsVideoUrl,
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
    setActiveTab('dashboard');
    alert('Vídeo publicado com sucesso no ForYou!');
  };

  // --- SUBVIEW 2: PROFILE VIEW (EVENTOS - SEM BOLD) ---
  const renderProfileView = () => {
    const followers = [
      { name: 'Mateus Oliveira', phone: '(31) 98888-7777', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }
    ];

    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '100%', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' }} className="animate-fade-in">
        {/* Cover */}
        <div style={{ width: '100%', aspectRatio: '21/9', position: 'relative', backgroundColor: '#fafafa', borderRadius: '16px', overflow: 'hidden' }}>
          <img 
            src={currentUser.cover || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600'} 
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
              src={currentUser.logo || 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=150'} 
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
                  <option value="Eventos - Festas e Shows">Eventos - Festas e Shows</option>
                  <option value="Eventos - Universitários e Repúblicas">Eventos - Universitários e Repúblicas</option>
                  <option value="Eventos - Culturais e Festivais">Eventos - Culturais e Festivais</option>
                </select>
                <button type="button" onClick={() => handleSaveField('category')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto', backgroundColor: '#f28d1a' }}><Save size={14} /></button>
                <button type="button" onClick={() => setEditingField(null)} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '0.72rem', height: '34px', width: 'auto' }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 500, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentUser.category || 'Eventos - Universitários e Repúblicas'}</span>
                <button type="button" onClick={() => startEditing('category', currentUser.category || 'Eventos - Universitários e Repúblicas')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}><Edit size={12} /></button>
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
                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, lineHeight: 1.35, flex: 1 }}>{currentUser.description || 'Nenhuma descrição informada.'}</p>
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

            {/* RATINGS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={12} fill="#f28d1a" stroke="none" />
                ))}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#2d2d2d', fontWeight: 500 }}>4.9 (42 avaliações)</span>
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
                  <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f9f9f9', padding: '4px 10px', borderRadius: '12px', border: '1px solid #eee', flexShrink: 0 }}>
                    <img src={f.avatar} alt={f.name} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.65rem', color: '#666' }}>{f.name.split(' ')[0]}</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              {myEvents.map(ev => {
                const activeBatch = ev.batches ? ev.batches.find(b => b.sold < b.limit) || ev.batches[ev.batches.length - 1] : null;
                const isSoldOut = !ev.batches || !ev.batches.some(b => b.sold < b.limit);
                const percent = activeBatch ? Math.round((activeBatch.sold / activeBatch.limit) * 100) : 0;
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


  // --- SUBVIEW 1: DASHBOARD ---
  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2d2d2d' }}>{currentUser.name}</h2>
          <p style={{ fontSize: '0.78rem', color: '#777' }}>Organizador de Eventos | Ouro Preto</p>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { label: 'Saldo Disponível', val: `R$ ${withdrawableBalance.toFixed(2)}`, desc: 'Líquido para saque', color: '#fffdf4', btn: 'Sacar' },
          { label: 'Ingressos Vendidos', val: `${totalTicketsSold} un.`, desc: 'Total geral acumulado', color: '#fcf6ed' },
          { label: 'Receita Bruta', val: `R$ ${grossSales.toFixed(2)}`, desc: 'Sem dedução da comissão', color: '#f3faf8' },
          { label: 'Taxa Connecta+', val: '10%', desc: 'Por ingresso vendido', color: '#fef3f3' }
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

      {myEvents.map(ev => (
        <div
          key={ev.id}
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '14px',
            border: '1px solid #eee',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <img src={ev.image} alt={ev.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '12px', marginBottom: '10px' }} />
          <h4 style={{ fontSize: '0.85rem', fontWeight: 500 }}>{ev.name}</h4>
          <div style={{ fontSize: '0.7rem', color: '#777', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {ev.date}</div>
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
  );

  // --- SUBVIEW 3: CREATE EVENT ---
  const renderAddEvent = () => (
    <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d' }}>Cadastrar Novo Evento</h3>
      
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Nome da Festa / Evento</label>
        <input 
          type="text" 
          placeholder="Ex: Calourada de Ouro Preto 2026" 
          value={evName} 
          onChange={(e) => setEvName(e.target.value)} 
          className="input-field" 
          required 
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Data e Horário</label>
        <input 
          type="text" 
          placeholder="Ex: 24/10/2026 às 22h" 
          value={evDate} 
          onChange={(e) => setEvDate(e.target.value)} 
          className="input-field" 
          required 
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Localização Completa</label>
        <input 
          type="text" 
          placeholder="Ex: República Pasárgada, Centro" 
          value={evLocation} 
          onChange={(e) => setEvLocation(e.target.value)} 
          className="input-field" 
          required 
        />
      </div>

      <div style={{ border: '1px solid #eee', padding: '12px', borderRadius: '16px', backgroundColor: '#ffffff' }}>
        <h4 style={{ fontSize: '0.78rem', fontWeight: 500, color: '#2d2d2d', marginBottom: '8px' }}>Configuração de Lotes</h4>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem' }}>Nome do 1º Lote</label>
              <input type="text" value={batch1Name} onChange={(e) => setBatch1Name(e.target.value)} className="input-field" style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0 }} placeholder="Ex: Lote Promocional" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem' }}>1º Lote Preço (R$)</label>
              <input type="number" value={batch1Price} onChange={(e) => setBatch1Price(e.target.value)} className="input-field" style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem' }}>1º Lote Limite (un)</label>
              <input type="number" value={batch1Limit} onChange={(e) => setBatch1Limit(e.target.value)} className="input-field" style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0 }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem' }}>Nome do 2º Lote</label>
              <input type="text" value={batch2Name} onChange={(e) => setBatch2Name(e.target.value)} className="input-field" style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0 }} placeholder="Ex: 2º Lote" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem' }}>2º Lote Preço (R$)</label>
              <input type="number" value={batch2Price} onChange={(e) => setBatch2Price(e.target.value)} className="input-field" style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem' }}>2º Lote Limite (un)</label>
              <input type="number" value={batch2Limit} onChange={(e) => setBatch2Limit(e.target.value)} className="input-field" style={{ padding: '6px 12px', fontSize: '0.75rem', margin: 0 }} />
            </div>
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>URL da Foto de Capa (Unsplash)</label>
        <input 
          type="text" 
          value={evImage} 
          onChange={(e) => setEvImage(e.target.value)} 
          className="input-field" 
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Descrição e Regras</label>
        <textarea 
          placeholder="Regras de open bar, idade mínima, etc..." 
          value={evDescription} 
          onChange={(e) => setEvDescription(e.target.value)} 
          className="input-field" 
          style={{ height: '50px', resize: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
        <button type="button" onClick={() => setActiveTab('events')} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Criar Evento</button>
      </div>
    </form>
  );

  // --- SUBVIEW 4: FORYOU REELS ---
  const renderForyou = () => (
    <form onSubmit={handleReelsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
      <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#2d2d2d' }}>Upload de Vídeo ForYou</h3>
      <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: 1.3 }}>
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
        disabled={myEvents.length === 0}
        className="btn btn-primary"
        style={{ width: '100%', height: '48px', marginTop: '10px', backgroundColor: '#f28d1a' }}
      >
        Publicar Vídeo no ForYou
      </button>
    </form>
  );

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
    </div>
  );
}
