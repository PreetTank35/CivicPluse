import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, UserCheck } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { isStaff } from '../lib/permissions';
import CitizenSidebar from '../components/CitizenSidebar';
import BottomNav from '../components/BottomNav';

const SIDEBAR_KEY = 'civicpulse_sidebar_collapsed';

/**
 * CitizenLayout — Public/Citizen dashboard with collapsible left sidebar + mobile drawer/bottom nav.
 * Connects directly to CitizenSidebar with user-requested menu order.
 */
export default function CitizenLayout() {
  const { user, role, signOut, switchRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <div className="citizen-layout">
      <a href="#main-content" className="skip-nav">Skip to content</a>

      {/* Citizen Sidebar (Desktop + Mobile drawer) */}
      <CitizenSidebar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Main Content Area ── */}
      <div className={`citizen-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top bar (mobile / desktop header with role & sign out) */}
        <header className="citizen-topbar">
          <div className="citizen-topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--primary)' }} className="show-mobile">
              CivicPulse
            </span>
          </div>
          <div className="citizen-topbar-right">
            {/* Quick Role Switcher for Testing/Demonstration if desired */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                className="form-input btn-sm"
                value={role || 'citizen'}
                onChange={e => {
                  switchRole(e.target.value);
                  if (isStaff(e.target.value)) navigate('/control-panel');
                }}
                style={{ padding: '4px 8px', fontSize: '12px', height: 'auto', background: 'var(--bg-tertiary)' }}
              >
                <option value="citizen">👤 Citizen Role</option>
                <option value="moderator">🛡️ Sub-Admin (Verifier)</option>
                <option value="super_admin">🏛️ Admin (Officer)</option>
              </select>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
                <LogOut size={16} />
                <span className="hide-mobile">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main id="main-content" className="citizen-page-content">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <BottomNav />
      </div>
    </div>
  );
}
