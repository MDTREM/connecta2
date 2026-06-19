import { useState, useRef, useEffect } from 'react';
import { useFirebaseMock } from '../../context/FirebaseMockContext';
import { Send, ArrowLeft, MessageSquare, Bell, LogOut } from 'lucide-react';

export default function Chat({ onCloseChat, onToggleNotifications }) {
  const { currentUser, chats, addMessage, users, deletedUsers, logout, notifications } = useFirebaseMock();
  const [activeRoom, setActiveRoom] = useState(null); // roomKey string
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeRoom]);

  const unreadNotifications = (notifications || []).filter(n => !n.read && n.userId === currentUser?.id);
  const isPartner = currentUser && currentUser.role !== 'client' && currentUser.role !== 'admin';

  // Derive rooms for the current user
  // A roomKey is "userA_userB". Let's scan chats to find keys that include current user ID,
  // or define default rooms to ensure they are available even if empty.
  const getAvailableRooms = () => {
    const defaultRooms = [];
    
    // Every partner/client can chat with support
    if (currentUser.role !== 'admin') {
      defaultRooms.push({
        key: `${currentUser.id}_admin`,
        title: 'Suporte Connecta+',
        subtitle: 'Suporte Oficial 24h',
        avatar: '/support-avatar.png',
        role: 'admin'
      });
    } else if (currentUser.role === 'admin') {
      const adminRooms = [];
      const userIdsInChats = new Set();
      
      chats.forEach(c => {
        if (c.roomKey && c.roomKey.endsWith('_admin')) {
          const uId = c.roomKey.replace(/_admin$/, '');
          userIdsInChats.add(uId);
        }
      });

      userIdsInChats.forEach(uId => {
        let targetUser = users?.find(u => u.id === uId);
        let isDeleted = false;
        if (!targetUser) {
          targetUser = deletedUsers?.find(u => u.id === uId);
          isDeleted = true;
        }
        if (targetUser) {
          const roleLabel = targetUser.role === 'client' ? 'Cliente' :
                            targetUser.role === 'seller' ? 'Loja' :
                            targetUser.role === 'provider' ? 'Prestador' :
                            targetUser.role === 'motoboy' ? 'Entregador' : targetUser.role;
          const deletedLabel = isDeleted ? ' - Excluído' : '';
          adminRooms.push({
            key: `${uId}_admin`,
            title: `${targetUser.role === 'seller' ? (targetUser.companyName || targetUser.name) : targetUser.name} (${roleLabel})${deletedLabel}`,
            subtitle: 'Suporte',
            avatar: targetUser.avatar || targetUser.logo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
            role: targetUser.role
          });
        }
      });
      return adminRooms;
    }

    return defaultRooms;
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeRoom) return;

    addMessage(activeRoom, text, currentUser);
    setText('');
  };

  const roomsList = getAvailableRooms();
  const currentRoomDetails = roomsList.find(r => r.key === activeRoom);
  const activeRoomMessages = chats.filter(c => c.roomKey === activeRoom);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#ffffff'
    }} className="animate-fade-in">
      
      {/* HEADER */}
      <div style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #eaeaea',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px'
      }}>
        {activeRoom ? (
          <button 
            onClick={() => setActiveRoom(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
        ) : (
          <button 
            onClick={onCloseChat}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f28d1a' }}
          >
            <ArrowLeft size={22} />
          </button>
        )}
        
        {activeRoom && currentRoomDetails ? (
          (() => {
            const isAdminRoom = currentRoomDetails.role === 'admin' || currentRoomDetails.key.endsWith('_admin');
            const roomTitle = (isAdminRoom && currentUser.role !== 'admin') ? 'Suporte Connecta' : currentRoomDetails.title;
            const roomAvatar = (isAdminRoom && currentUser.role !== 'admin') ? '/support-avatar.png' : currentRoomDetails.avatar;

            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={roomAvatar || '/logo.png'} 
                  alt={roomTitle}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #f28d1a' }}
                />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: /suporte\s+connecta/i.test(roomTitle) ? 400 : 700, color: '#2d2d2d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {roomTitle}
                    {isAdminRoom && currentUser.role !== 'admin' && (
                      <svg viewBox="0 0 24 24" width="12" height="12">
                        <path fill="#f9bb1a" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#f28d1a', fontWeight: 600 }}>online</div>
                </div>
              </div>
            );
          })()
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#2d2d2d', margin: 0 }}>
              Mensagens
            </h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isPartner && onToggleNotifications && (
                <button
                  onClick={onToggleNotifications}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: 'white', border: '1px solid #eee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative'
                  }}
                  title="Notificações"
                >
                  <Bell size={14} style={{ color: '#f28d1a' }} />
                  {unreadNotifications.length > 0 && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', backgroundColor: '#ff5e5b', width: '12px', height: '12px', borderRadius: '50%', fontSize: '0.55rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
              )}
              {isPartner && (
                <button
                  onClick={logout}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    backgroundColor: '#ff5e5b15', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                  title="Sair da Conta"
                >
                  <LogOut size={14} style={{ color: '#ff5e5b' }} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BODY */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="custom-scroll">
        {!activeRoom ? (
          /* ROOMS LIST VIEW */
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Removed description */}
            {roomsList.map(room => {
              const lastMsg = chats.filter(c => c.roomKey === room.key).pop();
              const isAdminRoom = room.role === 'admin' || room.key.endsWith('_admin');
              const roomTitle = (isAdminRoom && currentUser.role !== 'admin') ? 'Suporte Connecta' : room.title;
              const roomAvatar = (isAdminRoom && currentUser.role !== 'admin') ? '/support-avatar.png' : room.avatar;

              return (
                <div
                  key={room.key}
                  onClick={() => setActiveRoom(room.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#ffffff',
                    padding: '14px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 12px rgba(242, 141, 26, 0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(242,141,26,0.05)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <img 
                    src={roomAvatar || '/logo.png'} 
                    alt={roomTitle}
                    style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: /suporte\s+connecta/i.test(roomTitle) ? 400 : 700, color: '#2d2d2d', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                        {roomTitle}
                        {isAdminRoom && currentUser.role !== 'admin' && (
                          <svg viewBox="0 0 24 24" width="12" height="12" style={{ flexShrink: 0 }}>
                            <path fill="#f9bb1a" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        )}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#999', flexShrink: 0 }}>{lastMsg ? lastMsg.timestamp : ''}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ backgroundColor: '#fffbf0', color: '#f28d1a', padding: '1px 6px', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 600, flexShrink: 0 }}>
                        {room.subtitle}
                      </span>
                      <span style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                      }}>
                        {lastMsg ? lastMsg.text : 'Nenhuma mensagem ainda...'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ACTIVE CONVERSATION FLOW */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            minHeight: '100%',
            padding: '16px'
          }}>
            {activeRoomMessages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                margin: 'auto',
                padding: '20px',
                color: '#999'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', color: '#bbb' }}>
                  <MessageSquare size={48} />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#666' }}>Início da conversa</h3>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Mande um "olá" para puxar assunto, sô!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                {activeRoomMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        width: '100%',
                        animation: 'slideUp 0.2s ease-out'
                      }}
                    >
                      {/* Name of sender in group/support chat */}
                      {!isMe && (
                        <span style={{ fontSize: '0.65rem', color: '#888', marginBottom: '2px', marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {msg.senderRole === 'admin' || msg.senderId === 'admin' ? 'Suporte Connecta' : msg.senderName}
                          {(msg.senderRole === 'admin' || msg.senderId === 'admin') && (
                            <svg viewBox="0 0 24 24" width="12" height="12" style={{ display: 'inline-block' }}>
                              <path fill="#f9bb1a" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          )}
                        </span>
                      )}
                      
                      <div style={{
                        maxWidth: '80%',
                        backgroundColor: isMe ? '#f28d1a' : '#ffffff',
                        color: isMe ? '#ffffff' : '#2d2d2d',
                        padding: '12px 16px',
                        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        fontSize: '0.88rem',
                        lineHeight: 1.4,
                        border: isMe ? 'none' : '1px solid #f0ebdf'
                      }}>
                        {msg.text}
                      </div>

                      <span style={{ fontSize: '0.6rem', color: '#999', marginTop: '3px', marginRight: isMe ? '6px' : '0', marginLeft: isMe ? '0' : '6px' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* INPUT BAR FOR ACTIVE ROOM */}
      {activeRoom && (
        <form 
          onSubmit={handleSend}
          style={{
            height: '68px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #eaeaea',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: '8px'
          }}
        >
          <input
            type="text"
            placeholder="Digite seu trem aqui..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              flex: 1,
              height: '42px',
              borderRadius: '20px',
              border: '2px solid #eaeaea',
              padding: '0 16px',
              fontSize: '0.88rem',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f28d1a'}
            onBlur={(e) => e.target.style.borderColor = '#eaeaea'}
          />
          <button
            type="submit"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#f28d1a',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(242,141,26,0.3)',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
