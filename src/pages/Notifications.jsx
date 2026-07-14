import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, MapPin, Clock } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, events } from '../data/store';
import { useAuth } from '../lib/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const TYPE_ICONS = {
  status_change: '🔄',
  support_milestone: '🎯',
  comment: '💬',
  escalated: '📤',
  verified: '✅',
  resolved: '🎉',
  flagged: '🚩',
};

/**
 * Notifications page — status changes, comments, verification updates.
 */
export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
    const unsub1 = events.on('notificationCreated', loadNotifications);
    const unsub2 = events.on('notificationsUpdated', loadNotifications);
    return () => { unsub1(); unsub2(); };
  }, []);

  function loadNotifications() {
    const userId = user?.id || 'user-1';
    setNotifications(getNotifications(userId));
  }

  function handleMarkAllRead() {
    markAllNotificationsRead(user?.id || 'user-1');
    loadNotifications();
  }

  function handleClick(notif) {
    if (!notif.is_read) {
      markNotificationRead(notif.id);
    }
    if (notif.related_problem_id) {
      navigate(`/problem/${notif.related_problem_id}`);
    }
    loadNotifications();
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2 className="notifications-title">
          <Bell size={22} /> Notifications
          {unreadCount > 0 && (
            <span className="notifications-unread-badge">{unreadCount}</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div
              key={notif.id}
              className={`notification-item ${notif.is_read ? '' : 'unread'}`}
              onClick={() => handleClick(notif)}
            >
              <div className="notification-icon">
                {TYPE_ICONS[notif.type] || '📢'}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notif.message}</p>
                <span className="notification-time">
                  <Clock size={10} /> {timeAgo(notif.created_at)}
                </span>
              </div>
              {!notif.is_read && <div className="notification-dot" />}
            </div>
          ))
        ) : (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">🔔</div>
            <h3>All caught up!</h3>
            <p>You'll see updates here when problems you reported or supported change status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
