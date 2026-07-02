import { Outlet, NavLink, Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Activity, Home, Trophy, User, LogOut, Grid, Map as MapIcon, Video } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import NotificationsMenu from '../components/NotificationsMenu';
import ChatDrawer from '../components/ChatDrawer';
import { events } from '../data/store';

export default function CitizenLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isIssuesPage = location.pathname === '/citizen' || location.pathname === '/citizen/';
  const currentView = searchParams.get('view') || 'feed';

  const navLinks = [
    { to: '/citizen', label: 'Issues', icon: <Home size={16} />, end: true },
    { to: '/citizen/leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
    { to: '/citizen/profile', label: 'Profile', icon: <User size={16} /> },
  ];

  async function handleLogout() {
    await signOut();
    navigate('/auth');
  }

  function handleViewSwitch(mode) {
    navigate(`/citizen?view=${mode}`);
    events.emit('viewModeChanged', mode);
  }

  return (
    <>
      {/* ── Primary Top Bar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/citizen" className="navbar-brand">
            <Activity size={24} />
            <span>CivicPulse</span>
          </Link>

          {/* Desktop main links */}
          <ul className="navbar-links">
            {navLinks.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => isActive ? 'active' : ''}
                  end={link.end}
                >
                  {link.icon} {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <NotificationsMenu />
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sign out">
              <LogOut size={16} /> <span className="hide-mobile">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Always-Visible Horizontal Sub-Navbar under Logo ── */}
      <div className="citizen-horizontal-subnav">
        <div className="subnav-inner">
          {/* Main dashboard navigation items (always horizontal, scrollable on small screens) */}
          <div className="subnav-main-links">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => isActive ? 'subnav-item active' : 'subnav-item'}
                end={link.end}
              >
                {link.icon} <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Instagram-style Feed / Map / Reels Buttons */}
          <div className="subnav-insta-tabs">
            <button
              className={`insta-subnav-btn ${currentView === 'feed' && isIssuesPage ? 'active' : ''}`}
              onClick={() => handleViewSwitch('feed')}
              title="Multi-post Feed"
            >
              <Grid size={14} /> <span>Feed</span>
            </button>
            <button
              className={`insta-subnav-btn ${currentView === 'map' && isIssuesPage ? 'active' : ''}`}
              onClick={() => handleViewSwitch('map')}
              title="Map View"
            >
              <MapIcon size={14} /> <span>Map</span>
            </button>
            <button
              className={`insta-subnav-btn ${currentView === 'reels' && isIssuesPage ? 'active' : ''}`}
              onClick={() => handleViewSwitch('reels')}
              title="Reels Video Feed"
            >
              <Video size={14} /> <span>Reels</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Content Wrapper with adjusted top padding for both horizontal bars */}
      <div className="page-wrapper mesh-bg" style={{ paddingTop: 'calc(var(--navbar-height) + 50px)' }}>
        <Outlet />
      </div>

      {/* Persistent chat drawer floating action button */}
      <ChatDrawer />
    </>
  );
}
