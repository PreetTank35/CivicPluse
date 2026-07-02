import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, AlertCircle, Building2, Timer, BarChart3,
  FileText, Settings, Scale
} from 'lucide-react';

const ADMIN_LINKS = [
  { section: 'Overview', links: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/feed', label: 'All Issues', icon: AlertCircle },
  ]},
  { section: 'Management', links: [
    { to: '/equity', label: 'Equity Analytics', icon: Scale },
    { to: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
  ]},
  { section: 'Account', links: [
    { to: '/profile', label: 'Profile', icon: Settings },
  ]},
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {ADMIN_LINKS.map(section => (
        <div key={section.section} className="sidebar-section">
          <div className="sidebar-label">{section.section}</div>
          {section.links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
}
