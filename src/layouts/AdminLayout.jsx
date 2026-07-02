import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, AlertCircle, Scale, Users, Bell, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getRoleLabel, getRoleIcon } from '../lib/supabase';
import NotificationsMenu from '../components/NotificationsMenu';

export default function AdminLayout() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isAdmin = role === 'admin';

  const navLinks = [
    { to: isAdmin ? '/admin' : '/subadmin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
    { to: isAdmin ? '/admin/issues' : '/subadmin/issues', label: 'Issues', icon: <AlertCircle size={18} /> },
    ...(isAdmin ? [
      { to: '/admin/equity', label: 'Equity', icon: <Scale size={18} /> },
      { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    ] : []),
  ];

  async function handleLogout() {
    await signOut();
    navigate('/auth');
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to={isAdmin ? '/admin' : '/subadmin'} className="navbar-brand">
            <Activity size={24} />
            <span>CivicPulse</span>
          </Link>

          <div className="navbar-actions">
            <div style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: isAdmin ? 'var(--accent-bg)' : 'var(--warning-bg)',
              color: isAdmin ? 'var(--accent)' : 'var(--warning)',
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
            }}>
              {getRoleIcon(role)} {getRoleLabel(role)}
            </div>

            <NotificationsMenu />

            <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-sm)', padding: '0 var(--space-sm)' }}>
              Navigation
            </div>
            <nav className="admin-sidebar-nav">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  end={link.end}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* User info at bottom */}
          <div style={{
            position: 'absolute',
            bottom: 'var(--space-lg)',
            left: 'var(--space-md)',
            right: 'var(--space-md)',
            padding: 'var(--space-md)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin User'}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {user?.email || 'admin@civic.gov'}
            </div>
          </div>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
