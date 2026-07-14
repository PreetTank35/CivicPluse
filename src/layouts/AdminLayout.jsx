import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Activity, LayoutDashboard, AlertCircle, BarChart3, Video, User,
  LogOut, Menu, ChevronLeft, ChevronRight, Shield, Scale, Users, Settings
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getRoleLabel } from '../lib/supabase';
import NotificationsMenu from '../components/NotificationsMenu';

const SIDEBAR_KEY = 'civicpulse_admin_sidebar_collapsed';

/**
 * AdminLayout — Collapsible sidebar layout for both Admin and Sub-Admin.
 * Matches the citizen sidebar pattern with hide/show toggle.
 */
export default function AdminLayout() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = role === 'admin';
  const basePath = isAdmin ? '/admin' : '/subadmin';

  const navLinks = [
    { to: basePath, label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: `${basePath}/issues`, label: 'Issues', icon: AlertCircle },
    { to: `${basePath}/statistics`, label: 'Statistics', icon: BarChart3 },
    { to: `${basePath}/reels`, label: 'Reels', icon: Video },
    ...(isAdmin ? [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/equity', label: 'Equity', icon: Scale },
    ] : []),
    { to: `${basePath}/profile`, label: 'Profile', icon: User },
  ];

  function toggleSidebar() {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  }

  async function handleLogout() {
    await signOut();
    navigate('/auth');
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [navigate]);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || (isAdmin ? 'Admin' : 'Sub-Admin');
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="citizen-layout">
      {/* Skip nav */}
      <a href="#main-content" className="skip-nav">Skip to content</a>

      {/* Mobile backdrop */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`citizen-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Activity size={22} />
          </div>
          {!collapsed && <span className="sidebar-brand-text">CivicPulse</span>}
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div style={{
            margin: '0 var(--space-md) var(--space-md)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            background: isAdmin ? 'rgba(244, 63, 94, 0.15)' : 'rgba(13, 148, 136, 0.15)',
            color: isAdmin ? 'var(--brand-coral-light)' : 'var(--brand-teal-light)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <Shield size={12} />
            {isAdmin ? 'Administrator' : 'Sub-Administrator'}
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            {!collapsed && <div className="sidebar-section-label">Management</div>}
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`
                }
                onClick={() => setMobileOpen(false)}
                title={collapsed ? link.label : undefined}
              >
                <link.icon size={18} className="sidebar-nav-icon" />
                {!collapsed && <span className="sidebar-nav-label">{link.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User card */}
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">{userInitials}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">{isAdmin ? 'Admin' : 'Sub-Admin'}</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className={`citizen-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="citizen-topbar">
          <div className="citizen-topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            {collapsed && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={toggleSidebar}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--brand-teal-50)', color: 'var(--brand-teal)', border: '1px solid var(--brand-teal-200)', borderRadius: 'var(--radius-md)' }}
                title="Expand sidebar"
              >
                <Menu size={16} />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Open Sidebar</span>
              </button>
            )}
          </div>
          <div className="citizen-topbar-right">
            <NotificationsMenu />
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out" aria-label="Sign out">
              <LogOut size={16} />
              <span className="hide-mobile">Sign Out</span>
            </button>
          </div>
        </header>

        <main id="main-content" className="citizen-page-content mesh-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
