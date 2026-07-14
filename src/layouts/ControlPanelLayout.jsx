import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity, LayoutDashboard, ClipboardList, Map, Building2, Users,
  Settings, LogOut, Menu, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getVisibleNavItems } from '../lib/permissions';
import { getRoleLabel } from '../lib/supabase';

const ICON_MAP = {
  LayoutDashboard, ClipboardList, Map, Building2, Users, Settings,
};

const SIDEBAR_KEY = 'civicpulse_cp_sidebar_collapsed';

/**
 * ControlPanelLayout — Unified layout for both Super Admin and Moderator.
 * Same components, different data scope based on role + assignedLocalityId.
 * Linear/Notion-style: calm, information-dense, professional.
 */
export default function ControlPanelLayout() {
  const { user, role, assignedLocalityId, signOut, switchRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getVisibleNavItems(role);

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

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="cp-layout">
      <a href="#cp-main" className="skip-nav">Skip to content</a>

      {/* Mobile backdrop */}
      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside
        className={`cp-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="Control Panel navigation"
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
          <div className="cp-role-badge" data-role={role}>
            <Shield size={12} />
            <span>{getRoleLabel(role)}</span>
            {role === 'moderator' && assignedLocalityId && (
              <span className="cp-role-locality">• {assignedLocalityId}</span>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            {!collapsed && <div className="sidebar-section-label">Management</div>}
            {navItems.map(item => {
              const IconComponent = ICON_MAP[item.icon] || LayoutDashboard;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                >
                  <IconComponent size={18} className="sidebar-nav-icon" />
                  {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User card */}
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">{userInitials}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{userName}</div>
              <div className="sidebar-user-role">{getRoleLabel(role)}</div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className={`cp-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top bar */}
        <header className="cp-topbar">
          <div className="cp-topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            {collapsed && (
              <button className="btn btn-secondary btn-sm" onClick={toggleSidebar}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                <Menu size={16} />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Menu</span>
              </button>
            )}
          </div>
          <div className="cp-topbar-right">
            {/* Role switcher for demo */}
            <select
              className="cp-role-switcher"
              value={role}
              onChange={e => {
                switchRole(e.target.value);
                if (e.target.value === 'citizen') navigate('/');
              }}
              title="Switch role (demo)"
            >
              <option value="citizen">👤 Citizen</option>
              <option value="moderator">🛡️ Moderator</option>
              <option value="super_admin">⚙️ Super Admin</option>
            </select>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
              <LogOut size={16} />
              <span className="hide-mobile">Sign Out</span>
            </button>
          </div>
        </header>

        <main id="cp-main" className="cp-page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
