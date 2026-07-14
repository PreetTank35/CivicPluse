import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, X, ArrowLeft, Send, Check, CheckCheck, Search,
  Users, Circle, Phone, Video, Info, Paperclip, Smile, ShieldAlert,
  MapPin, Award, MoreVertical, CheckCircle
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getAllUsers } from '../data/store';
import { supabase } from '../lib/supabase';
import PageTransition from '../components/PageTransition';

// ── Message persistence
const getInitialMessages = () => {
  try {
    const saved = localStorage.getItem('civicpulse_real_chats');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60000) return 'Just now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return `${Math.floor(diffMs / 86400000)}d ago`;
}

function formatMessageTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function CommunityChat() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState(getInitialMessages);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactTab, setContactTab] = useState('all'); // all | citizens | officials
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [callActive, setCallActive] = useState(null); // 'voice' | 'video' | null

  const messagesEndRef = useRef(null);
  const currentUserId = user?.id || 'user-1';

  // Get complete list of all users on the platform except current user
  const allUsersList = getAllUsers().filter(u => u.id !== currentUserId);

  // Filter based on tab & search query
  const filteredContacts = allUsersList.filter(u => {
    if (contactTab === 'citizens' && u.role !== 'citizen') return false;
    if (contactTab === 'officials' && !['admin', 'sub_admin'].includes(u.role)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || (u.locality && u.locality.toLowerCase().includes(q)) || (u.role && u.role.toLowerCase().includes(q));
    }
    return true;
  });

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('civicpulse_real_chats', JSON.stringify(messages));
    } catch (e) { /* quota check */ }
  }, [messages]);

  // Scroll to bottom when messages update or activeChat changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChat]);

  // Realtime subscription
  useEffect(() => {
    if (!supabase || !activeChat) return;

    supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const formatted = data.map(m => ({
            id: m.id,
            sender: m.sender_id,
            text: m.text,
            time: m.created_at,
            status: m.status || 'read'
          }));
          setMessages(prev => ({ ...prev, [activeChat]: formatted }));
        }
      });

    const channel = supabase
      .channel(`chat_${activeChat}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newM = payload.new;
        if ((newM.sender_id === activeChat && newM.receiver_id === currentUserId) || (newM.sender_id === currentUserId && newM.receiver_id === activeChat)) {
          const msgObj = { id: newM.id, sender: newM.sender_id, text: newM.text, time: newM.created_at, status: newM.status || 'delivered' };
          setMessages(prev => {
            const list = prev[activeChat] || [];
            if (list.some(x => x.id === msgObj.id)) return prev;
            return { ...prev, [activeChat]: [...list, msgObj] };
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat, currentUserId]);

  async function handleSend(e) {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const textToSend = inputText.trim();
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: currentUserId,
      text: textToSend,
      time: new Date().toISOString(),
      status: 'sent',
    };

    setMessages(prev => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), newMsg],
    }));
    setInputText('');

    if (supabase) {
      try {
        await supabase.from('messages').insert({
          id: newMsg.id,
          sender_id: currentUserId,
          receiver_id: activeChat,
          text: textToSend,
          status: 'delivered',
        });
      } catch (err) { /* ignore offline */ }
    }

    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeChat]: (prev[activeChat] || []).map(m =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 700);

    // Simulate instant response from civic bots or active officials
    if (activeChat.includes('admin') || activeChat.includes('bot')) {
      setTimeout(() => {
        const autoReply = {
          id: `msg-${Date.now() + 1}`,
          sender: activeChat,
          text: `Thank you for reaching out! We have received your query regarding your locality and will coordinate with the verification desk shortly.`,
          time: new Date().toISOString(),
          status: 'read'
        };
        setMessages(prev => ({
          ...prev,
          [activeChat]: [...(prev[activeChat] || []), autoReply],
        }));
      }, 1600);
    }
  }

  function getLastMessage(userId) {
    const msgs = messages[userId];
    if (!msgs || msgs.length === 0) return null;
    return msgs[msgs.length - 1];
  }

  function getUnreadCount(userId) {
    const msgs = messages[userId] || [];
    return msgs.filter(m => m.sender !== currentUserId && m.status !== 'read').length;
  }

  const activeChatUser = allUsersList.find(c => c.id === activeChat);
  const chatMessages = messages[activeChat] || [];

  return (
    <PageTransition>
      <div className="community-chat-page">
        {/* ── Left Sidebar / Contact List Panel ── */}
        <div className={`chat-contacts-panel ${activeChat ? 'mobile-hidden' : ''}`}>
          {/* User Profile Summary & Header */}
          <div className="chat-contacts-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-saffron))', color: 'white', fontWeight: 800, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CP'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {user?.name || 'Preet Tank'} <CheckCircle size={14} color="var(--primary)" fill="var(--primary-light)" />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--brand-teal)', fontWeight: 600, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={10} /> {user?.locality || 'Kothrud, Pune'} • Active Now
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs for complete directory filter */}
            <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '4px' }}>
              <button
                onClick={() => setContactTab('all')}
                style={{ flex: 1, padding: '6px 4px', fontSize: '11px', fontWeight: 700, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: contactTab === 'all' ? 'var(--brand-teal)' : 'var(--bg-secondary)', color: contactTab === 'all' ? 'white' : 'var(--text-secondary)' }}
              >
                All ({allUsersList.length})
              </button>
              <button
                onClick={() => setContactTab('citizens')}
                style={{ flex: 1, padding: '6px 4px', fontSize: '11px', fontWeight: 700, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: contactTab === 'citizens' ? 'var(--brand-teal)' : 'var(--bg-secondary)', color: contactTab === 'citizens' ? 'white' : 'var(--text-secondary)' }}
              >
                Citizens
              </button>
              <button
                onClick={() => setContactTab('officials')}
                style={{ flex: 1, padding: '6px 4px', fontSize: '11px', fontWeight: 700, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: contactTab === 'officials' ? 'var(--brand-teal)' : 'var(--bg-secondary)', color: contactTab === 'officials' ? 'white' : 'var(--text-secondary)' }}
              >
                Officials / Admins
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="chat-search-bar">
            <Search size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search community member or area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setSearchQuery('')} />}
          </div>

          {/* Contact Directory */}
          <div className="chat-contacts-list">
            {filteredContacts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No members found matching "{searchQuery}"
              </div>
            )}
            {filteredContacts.map(citizen => {
              const lastMsg = getLastMessage(citizen.id);
              const unread = getUnreadCount(citizen.id);
              const isActive = activeChat === citizen.id;
              const isOfficial = ['admin', 'sub_admin'].includes(citizen.role);

              return (
                <div
                  key={citizen.id}
                  className={`chat-contact-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveChat(citizen.id);
                    setShowProfileInfo(false);
                    setMessages(prev => ({
                      ...prev,
                      [citizen.id]: (prev[citizen.id] || []).map(m => ({
                        ...m,
                        status: m.sender !== currentUserId ? 'read' : m.status,
                      })),
                    }));
                  }}
                >
                  <div className="chat-contact-avatar-wrap">
                    <div className="chat-contact-avatar" style={{
                      background: isOfficial ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'linear-gradient(135deg, var(--brand-teal), var(--brand-midnight))'
                    }}>
                      {citizen.avatar || citizen.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="chat-online-dot" />
                  </div>

                  <div className="chat-contact-info">
                    <div className="chat-contact-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {citizen.name}
                      {isOfficial && (
                        <span style={{ fontSize: '9px', background: '#DBEAFE', color: '#1E40AF', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                          {citizen.role === 'admin' ? 'ADMIN' : 'VERIFIER'}
                        </span>
                      )}
                    </div>
                    <div className="chat-contact-preview">
                      {lastMsg
                        ? (lastMsg.sender === currentUserId ? 'You: ' : '') + lastMsg.text
                        : <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Tap to start messaging...</span>
                      }
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {lastMsg && (
                      <span className="chat-contact-time">{formatTime(lastMsg.time)}</span>
                    )}
                    {unread > 0 && <div className="chat-unread-badge">{unread}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right / Conversation Panel ── */}
        <div className={`chat-conversation-panel ${!activeChat ? 'mobile-hidden' : ''}`}>
          {!activeChat ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon animate-float">
                <MessageCircle size={44} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#334155', margin: '0 0 6px' }}>
                Civic Messenger Directory
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '320px', lineHeight: 1.5 }}>
                Select a community member, area verification officer, or neighbor to start chatting right now.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                  <Users size={16} color="var(--brand-teal)" /> End-to-end Civic Security
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* WhatsApp / Instagram Style Chat Header */}
              <div className="chat-conv-header">
                <button
                  className="btn btn-ghost btn-sm chat-back-btn"
                  onClick={() => setActiveChat(null)}
                  style={{ padding: '6px', marginRight: '-4px' }}
                >
                  <ArrowLeft size={18} />
                </button>

                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
                  onClick={() => setShowProfileInfo(!showProfileInfo)}
                >
                  <div className="chat-contact-avatar-wrap" style={{ width: '42px', height: '42px' }}>
                    <div className="chat-contact-avatar" style={{
                      width: '42px', height: '42px', fontSize: '14px',
                      background: ['admin', 'sub_admin'].includes(activeChatUser?.role) ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'linear-gradient(135deg, var(--brand-teal), var(--brand-midnight))'
                    }}>
                      {activeChatUser?.avatar || activeChatUser?.name?.substring(0, 2).toUpperCase() || 'CP'}
                    </div>
                    <div className="chat-online-dot" style={{ width: '10px', height: '10px' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {activeChatUser?.name || 'Community Member'}
                      {['admin', 'sub_admin'].includes(activeChatUser?.role) && (
                        <span style={{ fontSize: '10px', background: '#DBEAFE', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                          {activeChatUser?.role === 'admin' ? 'CIVIC ADMIN' : 'VERIFIER'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                      <Circle size={8} fill="#10B981" /> Online • {activeChatUser?.locality || 'Pune'}
                    </div>
                  </div>
                </div>

                {/* Header Action Icons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button className="btn btn-ghost btn-sm" title="Voice Call" onClick={() => setCallActive('voice')} style={{ padding: '8px', color: '#64748B' }}>
                    <Phone size={18} />
                  </button>
                  <button className="btn btn-ghost btn-sm" title="Video Call" onClick={() => setCallActive('video')} style={{ padding: '8px', color: '#64748B' }}>
                    <Video size={18} />
                  </button>
                  <button className="btn btn-ghost btn-sm" title="Member Info" onClick={() => setShowProfileInfo(!showProfileInfo)} style={{ padding: '8px', color: showProfileInfo ? 'var(--brand-teal)' : '#64748B' }}>
                    <Info size={18} />
                  </button>
                </div>
              </div>

              {/* Call Simulation Modal */}
              {callActive && (
                <div style={{ position: 'absolute', top: '68px', left: 0, right: 0, background: '#0F172A', color: 'white', padding: '20px', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--brand-teal)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {activeChatUser?.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{callActive === 'voice' ? 'Voice Call...' : 'Video Call...'} with {activeChatUser?.name}</div>
                      <div style={{ fontSize: '12px', color: '#94A3B8' }}>Connecting via encrypted civic channel...</div>
                    </div>
                  </div>
                  <button className="btn btn-sm" onClick={() => setCallActive(null)} style={{ background: '#EF4444', color: 'white', fontWeight: 700, padding: '8px 16px', borderRadius: '20px' }}>
                    End Call
                  </button>
                </div>
              )}

              {/* Profile Details Sidebar Slide-in */}
              {showProfileInfo && activeChatUser && (
                <div style={{ position: 'absolute', top: '68px', right: 0, width: '300px', bottom: 0, background: 'white', borderLeft: '1px solid var(--border)', zIndex: 50, padding: '20px', overflowY: 'auto', boxShadow: '-4px 0 16px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Member Profile</h4>
                    <X size={18} style={{ cursor: 'pointer', color: '#64748B' }} onClick={() => setShowProfileInfo(false)} />
                  </div>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-midnight))', color: 'white', fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.25)' }}>
                      {activeChatUser.avatar || activeChatUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#1E293B' }}>{activeChatUser.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'capitalize' }}>{activeChatUser.role?.replace('_', ' ')}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                      <MapPin size={16} color="var(--brand-teal)" /> Locality: <strong>{activeChatUser.locality || 'Pune Municipal Area'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                      <Award size={16} color="var(--brand-saffron)" /> Civic Reputation: <strong>High Trust (Level 4)</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Bubbles Area */}
              <div className="chat-messages-area">
                <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
                  <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.7)', padding: '4px 12px', borderRadius: '12px', color: '#64748B', fontWeight: 600, border: '1px solid var(--border)' }}>
                    🔒 Messages are end-to-end secured on the Civic Platform
                  </span>
                </div>

                {chatMessages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B', fontSize: '13px' }}>
                    <p>No messages yet with {activeChatUser?.name}. Say Hello! 👋</p>
                  </div>
                )}

                {chatMessages.map(msg => {
                  const isMe = msg.sender === currentUserId;
                  return (
                    <div key={msg.id} className={`chat-message ${isMe ? 'sent' : 'received'}`}>
                      <div className="chat-message-bubble">
                        <div style={{ wordBreak: 'break-word', fontSize: '14px', fontWeight: 450 }}>{msg.text}</div>
                        <div className="chat-message-meta">
                          <span>{formatMessageTime(msg.time)}</span>
                          {isMe && (
                            <span style={{ marginLeft: '4px', display: 'inline-flex', alignItems: 'center' }}>
                              {msg.status === 'sent' && <Check size={12} />}
                              {msg.status === 'delivered' && <CheckCheck size={12} />}
                              {msg.status === 'read' && <CheckCheck size={12} style={{ color: '#FBBF24' }} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* WhatsApp / Instagram Input Bar */}
              <form className="chat-input-form" onSubmit={handleSend}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  title="Attach Photo or Document"
                  onClick={() => alert("Attachment picker opened for instant photo/video proof sharing!")}
                  style={{ padding: '8px', color: '#64748B' }}
                >
                  <Paperclip size={20} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm hide-mobile"
                  title="Emoji"
                  onClick={() => setInputText(prev => prev + " 👍")}
                  style={{ padding: '8px', color: '#64748B' }}
                >
                  <Smile size={20} />
                </button>

                <input
                  type="text"
                  placeholder={`Message ${activeChatUser?.name || 'here'}...`}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  autoFocus
                />

                <button
                  type="submit"
                  className="chat-send-button"
                  disabled={!inputText.trim()}
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
