import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, Plus, Bell, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getUnreadNotificationCount } from '../data/store';

/**
 * BottomNav — Mobile bottom navigation bar for the Citizen App.
 * Home / Map / Post (center FAB) / Notifications / Profile
 */
export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const unreadCount = getUnreadNotificationCount(user?.id || 'user-1');

  const navItems = [
    { path: '/', icon: Home, label: 'Home', end: true },
    { path: '/map', icon: Map, label: 'Map' },
    { path: '/post/new', icon: Plus, label: 'Post', isFab: true },
    { path: '/notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {navItems.map(item => {
        const isActive = item.end
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path);

        if (item.isFab) {
          return (
            <button
              key={item.path}
              className="bottom-nav-fab"
              onClick={() => navigate(item.path)}
              aria-label="Report a problem"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="bottom-nav-icon-wrap">
              <item.icon size={20} />
              {item.badge > 0 && (
                <span className="bottom-nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
              )}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
