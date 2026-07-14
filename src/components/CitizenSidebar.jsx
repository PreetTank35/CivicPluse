import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  User, AlertCircle, PlusCircle, Map as MapIcon, Trophy,
  MessageCircle, FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Activity, Video, BarChart3, Settings
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

/**
 * Navigation items in the USER-REQUESTED order:
 * 1. Profile
 * 2. Issues (feed)
 * 3. Add Issue (report)
 * 4. Speed Map & Reels (grouped)
 * 5. Leaderboard
 */
const CITIZEN_NAV = [
  { to: '/citizen/profile', label: 'Profile', icon: User },
  { to: '/citizen', label: 'Issues', icon: AlertCircle, end: true },
  { to: '/citizen/report', label: 'Add Issue', icon: PlusCircle },
  {
    label: 'Explore',
    icon: MapIcon,
    isGroup: true,
    children: [
      { to: '/citizen/map', label: 'Speed Map', icon: MapIcon },
      { to: '/citizen/reels', label: 'Reels', icon: Video },
    ],
  },
  { to: '/citizen/leaderboard', label: 'Leaderboard', icon: Trophy },
];

const CITIZEN_NAV_BOTTOM = [
  { to: '/citizen/my-issues', label: 'My Issues', icon: FileText },
  { to: '/citizen/community', label: 'Community', icon: MessageCircle },
];

/**
 * CitizenSidebar — Collapsible left navigation for the Citizen dashboard.
 *
 * - Expanded: 260px with icons + labels
 * - Collapsed: 64px with icons only + tooltips
 * - Mobile (<768px): Off-canvas overlay with backdrop
 * - Scrollable when items exceed viewport
 * - Collapse state persisted in localStorage
 * - Grouped sub-menus with smooth animations
 */
export default function CitizenSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({ Explore: true });

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Citizen';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  function toggleGroup(label) {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  }

  function isGroupActive(group) {
    return group.children.some(child => location.pathname === child.to || location.pathname.startsWith(child.to + '/'));
  }

  function renderNavItem(link) {
    if (link.isGroup) {
      const groupOpen = openGroups[link.label] && !collapsed;
      const groupActive = isGroupActive(link);

      return (
        <div key={link.label} className="sidebar-nav-group">
          <button
            className={`sidebar-nav-item sidebar-nav-group-toggle ${collapsed ? 'collapsed' : ''} ${groupActive ? 'group-active' : ''}`}
            onClick={() => {
              if (collapsed) {
                onToggle();
                setOpenGroups(prev => ({ ...prev, [link.label]: true }));
              } else {
                toggleGroup(link.label);
              }
            }}
            title={collapsed ? `${link.label} (Click to expand)` : undefined}
          >
            <link.icon size={18} className="sidebar-nav-icon" />
            {!collapsed && (
              <>
                <span className="sidebar-nav-label">{link.label}</span>
                <span className="sidebar-nav-chevron">
                  {groupOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </>
            )}
          </button>
          <div className={`sidebar-nav-children ${groupOpen ? 'open' : ''}`}>
            {link.children.map(child => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  `sidebar-nav-item sidebar-nav-child ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`
                }
                onClick={onMobileClose}
                title={collapsed ? child.label : undefined}
              >
                <child.icon size={16} className="sidebar-nav-icon" />
                {!collapsed && <span className="sidebar-nav-label">{child.label}</span>}
              </NavLink>
            ))}
          </div>
        </div>
      );
    }

    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={({ isActive }) =>
          `sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`
        }
        onClick={onMobileClose}
        title={collapsed ? link.label : undefined}
      >
        <link.icon size={18} className="sidebar-nav-icon" />
        {!collapsed && <span className="sidebar-nav-label">{link.label}</span>}
      </NavLink>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`citizen-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Activity size={22} />
          </div>
          {!collapsed && <span className="sidebar-brand-text">CivicPulse</span>}
          <button
            className="sidebar-toggle-btn"
            onClick={onToggle}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            {!collapsed && <div className="sidebar-section-label">Navigation</div>}
            {CITIZEN_NAV.map(link => renderNavItem(link))}
          </div>

          <div className="sidebar-nav-divider" />

          <div className="sidebar-nav-section">
            {!collapsed && <div className="sidebar-section-label">Account</div>}
            {CITIZEN_NAV_BOTTOM.map(link => renderNavItem(link))}
          </div>
        </nav>

        {/* User card at bottom */}
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">{userInitials}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">Citizen</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
