import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, MessageCircle, Info } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

const MOCK_NOTIFICATIONS = {
  citizen: [
    { id: 1, type: 'status', title: 'Issue Resolved', message: 'Your pothole report has been fixed!', time: '10 mins ago', icon: <CheckCircle size={16} color="var(--success)" />, unread: true },
    { id: 2, type: 'comment', title: 'New Comment', message: 'Sub-Admin Arjun replied to your issue.', time: '2 hours ago', icon: <MessageCircle size={16} color="var(--primary)" />, unread: true },
    { id: 3, type: 'system', title: 'Level Up!', message: 'You reached Observer level. Keep it up!', time: '1 day ago', icon: <Info size={16} color="var(--accent)" />, unread: false },
  ],
  sub_admin: [
    { id: 4, type: 'alert', title: 'SLA Warning', message: 'Water leak issue SLA expires in 2 hours.', time: '15 mins ago', icon: <AlertTriangle size={16} color="var(--warning)" />, unread: true },
    { id: 5, type: 'system', title: 'New Assignment', message: 'A critical pothole issue was assigned to you.', time: '1 hour ago', icon: <Info size={16} color="var(--primary)" />, unread: true },
  ],
  admin: [
    { id: 6, type: 'alert', title: 'SLA Breached (Escalated)', message: 'Water leak issue SLA breached in Shivajinagar.', time: 'Just now', icon: <AlertTriangle size={16} color="var(--danger)" />, unread: true },
    { id: 7, type: 'system', title: 'Equity Alert', message: 'Kothrud equity score dropped below 60.', time: '3 hours ago', icon: <AlertTriangle size={16} color="var(--danger)" />, unread: true },
  ]
};

export default function NotificationsMenu() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const notifications = MOCK_NOTIFICATIONS[role] || MOCK_NOTIFICATIONS.citizen;
  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        className="notification-btn" 
        title="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', backgroundColor: isOpen ? 'var(--bg-secondary)' : 'transparent' }}
      >
        <Bell size={20} color="var(--text-secondary)" />
        {unreadCount > 0 && (
          <span className="notification-badge" style={{ position: 'absolute', top: 6, right: 6, background: 'var(--danger)', color: 'white', fontSize: 10, fontWeight: 800, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid var(--bg-primary)' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="card animate-fade-in" style={{
          position: 'absolute',
          top: '120%',
          right: 0,
          width: '320px',
          padding: 0,
          zIndex: 'var(--z-tooltip)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)' }}>Notifications</h3>
            {unreadCount > 0 && <button className="btn btn-ghost" style={{ fontSize: '10px', padding: '2px 8px' }}>Mark all read</button>}
          </div>
          
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length > 0 ? notifications.map(notif => (
              <div key={notif.id} style={{ 
                padding: 'var(--space-md)', 
                borderBottom: '1px solid var(--border-light)',
                background: notif.unread ? 'var(--primary-bg)' : 'transparent',
                display: 'flex',
                gap: 'var(--space-sm)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={() => { setIsOpen(false); navigate(role === 'admin' ? '/admin/issues' : '/citizen'); }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>{notif.icon}</div>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: notif.unread ? 700 : 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {notif.time}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
                No notifications
              </div>
            )}
          </div>
          
          <div style={{ padding: 'var(--space-sm)', borderTop: '1px solid var(--border)', textAlign: 'center', background: 'var(--bg-secondary)' }}>
            <button className="btn btn-ghost" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>View All Settings</button>
          </div>
        </div>
      )}
    </div>
  );
}
