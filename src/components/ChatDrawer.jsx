import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ArrowLeft, Send, Check, CheckCheck, Shield } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getAllUsers } from '../data/store';
import { supabase } from '../lib/supabase';

// ── Real 1:1 user messages (persisted via Supabase or localStorage)
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
  if (diffMs < 60000) return 'now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h`;
  return `${Math.floor(diffMs / 86400000)}d`;
}

function formatMessageTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * ChatDrawer — Slide-over 1:1 citizen chat
 * with contact list, message view, read receipts, and real-time DB sync.
 */
export default function ChatDrawer() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState(getInitialMessages);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUserId = user?.id || 'user-1';

  const citizens = getAllUsers().filter(u => u.role === 'citizen' && u.id !== currentUserId);

  useEffect(() => {
    try {
      localStorage.setItem('civicpulse_real_chats', JSON.stringify(messages));
    } catch (e) { /* ignore quota */ }
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChat]);

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
    }, 800);
  }

  function getUnreadCount() {
    let count = 0;
    Object.entries(messages).forEach(([userId, msgs]) => {
      count += msgs.filter(m => m.sender !== currentUserId && m.status !== 'read').length;
    });
    return count;
  }

  function getLastMessage(userId) {
    const msgs = messages[userId];
    if (!msgs || msgs.length === 0) return null;
    return msgs[msgs.length - 1];
  }

  const unreadCount = getUnreadCount();

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button className="chat-fab" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && unreadCount > 0 && (
          <span className="chat-fab-badge">{unreadCount}</span>
        )}
      </button>

      {/* ── Chat Drawer ── */}
      {isOpen && (
        <div className="chat-drawer">
          {/* Header */}
          <div className="chat-drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              {activeChat && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '4px' }}
                  onClick={() => setActiveChat(null)}
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <span className="chat-drawer-title">
                {activeChat
                  ? citizens.find(c => c.id === activeChat)?.name || 'Chat'
                  : 'Community Chat'
                }
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ padding: '4px' }} onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {!activeChat ? (
            /* ── Contact List ── */
            <div className="chat-contact-list">
              {citizens.map(citizen => {
                const lastMsg = getLastMessage(citizen.id);
                const hasUnread = lastMsg && lastMsg.sender !== currentUserId && lastMsg.status !== 'read';

                return (
                  <div
                    key={citizen.id}
                    className="chat-contact"
                    onClick={() => {
                      setActiveChat(citizen.id);
                      // Mark messages as read
                      setMessages(prev => ({
                        ...prev,
                        [citizen.id]: (prev[citizen.id] || []).map(m => ({
                          ...m,
                          status: m.sender !== currentUserId ? 'read' : m.status,
                        })),
                      }));
                    }}
                  >
                    <div className="chat-contact-avatar">{citizen.avatar}</div>
                    <div className="chat-contact-info">
                      <div className="chat-contact-name">{citizen.name}</div>
                      <div className="chat-contact-preview">
                        {lastMsg
                          ? (lastMsg.sender === currentUserId ? 'You: ' : '') + lastMsg.text
                          : 'Start a conversation...'
                        }
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {lastMsg && (
                        <span className="chat-contact-time">{formatTime(lastMsg.time)}</span>
                      )}
                      {hasUnread && <div className="chat-unread-dot" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Message View ── */
            <>
              <div className="chat-messages">
                {(messages[activeChat] || []).map(msg => (
                  <div key={msg.id} className={`chat-msg ${msg.sender === currentUserId ? 'sent' : 'received'}`}>
                    <div>{msg.text}</div>
                    <div className="chat-msg-time">
                      {formatMessageTime(msg.time)}
                      {msg.sender === currentUserId && (
                        <span style={{ marginLeft: '4px' }}>
                          {msg.status === 'sent' && <Check size={10} />}
                          {msg.status === 'delivered' && <CheckCheck size={10} />}
                          {msg.status === 'read' && <CheckCheck size={10} style={{ color: 'var(--primary-light)' }} />}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="chat-msg received" style={{ fontStyle: 'italic', opacity: 0.6, fontSize: 'var(--text-xs)' }}>
                    typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!inputText.trim()}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
