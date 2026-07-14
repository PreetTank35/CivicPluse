import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle, XCircle, AlertTriangle,
  ThumbsUp, MessageCircle, MapPin, ChevronRight, Filter, Search, Plus, ArrowUpRight
} from 'lucide-react';
import { getAllIssues, getAllLocalities, events, getCurrentUser } from '../data/store';
import { CATEGORIES } from '../data/mockData';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../lib/AuthContext';

const STATUS_TABS = [
  { id: 'all', label: 'All My Issues', icon: FileText, color: 'var(--brand-teal)' },
  { id: 'pending', label: 'Pending / Open', icon: Clock, color: 'var(--warning)' },
  { id: 'in_progress', label: 'In Progress', icon: AlertTriangle, color: 'var(--info)' },
  { id: 'resolved', label: 'Resolved / Verified', icon: CheckCircle, color: 'var(--success)' },
  { id: 'rejected', label: 'Escalated', icon: XCircle, color: 'var(--danger)' },
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const STATUS_STYLES = {
  open: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Open' },
  acknowledged: { bg: 'var(--accent-bg)', color: 'var(--accent)', label: 'Acknowledged' },
  in_progress: { bg: 'var(--info-bg)', color: 'var(--info)', label: 'In Progress' },
  resolved: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Resolved' },
  verified: { bg: 'var(--success-bg)', color: '#166534', label: 'Verified Authentic' },
  escalated: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Escalated' },
};

export default function MyIssues() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | votes | priority
  const [selectedLocality, setSelectedLocality] = useState('all');

  useEffect(() => {
    setIssues(getAllIssues());
    setLocalities(getAllLocalities());
    const unbind1 = events.on('issueCreated', () => setIssues(getAllIssues()));
    const unbind2 = events.on('issueUpdated', () => setIssues(getAllIssues()));
    const unbind3 = events.on('storeReset', () => setIssues(getAllIssues()));
    return () => { unbind1(); unbind2(); unbind3(); };
  }, []);

  const currentUser = getCurrentUser();
  const myIssues = issues.filter(i => i.reporter === currentUser?.id || i.reporter === (user?.id || 'user-1'));

  // Filter & Search
  const filteredIssues = myIssues.filter(issue => {
    // Status tab filter
    if (activeTab === 'pending' && !['open', 'acknowledged'].includes(issue.status)) return false;
    if (activeTab === 'in_progress' && issue.status !== 'in_progress') return false;
    if (activeTab === 'resolved' && !['resolved', 'verified'].includes(issue.status)) return false;
    if (activeTab === 'rejected' && issue.status !== 'escalated') return false;

    // Locality filter
    if (selectedLocality !== 'all' && issue.locality !== selectedLocality) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = issue.title?.toLowerCase().includes(q);
      const matchDesc = issue.description?.toLowerCase().includes(q);
      const matchLoc = issue.location?.locality_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'votes') return (b.votes || 0) - (a.votes || 0);
    if (sortBy === 'priority') return (b.priority_score || 0) - (a.priority_score || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Count per tab
  const counts = {
    all: myIssues.length,
    pending: myIssues.filter(i => ['open', 'acknowledged'].includes(i.status)).length,
    in_progress: myIssues.filter(i => i.status === 'in_progress').length,
    resolved: myIssues.filter(i => ['resolved', 'verified'].includes(i.status)).length,
    rejected: myIssues.filter(i => i.status === 'escalated').length,
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: '1020px', margin: '0 auto', paddingBottom: 'var(--space-2xl)' }}>
        {/* Header & Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h2 className="section-title" style={{ fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--brand-teal), var(--brand-teal-light))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)' }}>
                <FileText size={22} />
              </div>
              My Reported Issues
            </h2>
            <p className="section-subtitle" style={{ margin: '4px 0 0' }}>
              Easily search, track, and monitor real-time verification status of all problems you reported across Pune.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/citizen/report')}
            style={{ padding: '10px 20px', fontWeight: 700, borderRadius: 'var(--radius-full)', boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)' }}
          >
            <Plus size={18} /> Report New Issue
          </button>
        </div>

        {/* Search Bar and Filters Box */}
        <div style={{
          background: 'var(--bg-primary)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}>
          {/* Search input */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-teal)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search your issues by keywords, area or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '40px', height: '42px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', width: '100%' }}
            />
          </div>

          {/* Sort and Locality dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="var(--text-secondary)" />
              <select
                className="form-input"
                style={{ width: 'auto', height: '42px', borderRadius: 'var(--radius-lg)', margin: 0, fontSize: '13px', background: 'var(--bg-secondary)' }}
                value={selectedLocality}
                onChange={e => setSelectedLocality(e.target.value)}
              >
                <option value="all">All Localities</option>
                {localities.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <select
              className="form-input"
              style={{ width: 'auto', height: '42px', borderRadius: 'var(--radius-lg)', margin: 0, fontSize: '13px', background: 'var(--bg-secondary)', fontWeight: 600 }}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Newest First</option>
              <option value="votes">Sort: Most Voted</option>
              <option value="priority">Sort: High Priority</option>
            </select>
          </div>
        </div>

        {/* Scrollable Tab Filter */}
        <div className="my-issues-tabs-container" style={{ marginBottom: '24px', borderBottom: '2px solid var(--border)' }}>
          <div className="my-issues-tabs" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
            {STATUS_TABS.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: isActive ? `2px solid ${tab.color}` : '1px solid var(--border)',
                    background: isActive ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <tab.icon size={16} style={{ color: tab.color }} />
                  <span>{tab.label}</span>
                  <span style={{
                    background: isActive ? tab.color : 'rgba(0,0,0,0.08)',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}>
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Issues Grid / List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredIssues.length === 0 && (
            <div className="empty-state" style={{ padding: '48px 24px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', textAlign: 'center' }}>
              <FileText size={48} color="var(--brand-teal)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>No issues matching your criteria</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '6px auto 20px' }}>
                {searchQuery
                  ? `No results found for "${searchQuery}". Try clearing your search bar or filter tabs.`
                  : activeTab === 'all'
                  ? "You haven't reported any civic problems yet. Be the first to report issues in your locality!"
                  : `You have no ${STATUS_TABS.find(t => t.id === activeTab)?.label.toLowerCase()} reports at the moment.`
                }
              </p>
              {searchQuery ? (
                <button className="btn btn-secondary btn-sm" onClick={() => setSearchQuery('')}>
                  Clear Search Bar
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => navigate('/citizen/report')}>
                  <Plus size={16} /> Report A Problem Now
                </button>
              )}
            </div>
          )}

          {filteredIssues.map((issue, idx) => {
            const category = CATEGORIES.find(c => c.id === issue.category);
            const statusStyle = STATUS_STYLES[issue.status] || STATUS_STYLES.open;

            return (
              <div
                key={issue.id}
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => navigate(`/citizen/issue/${issue.id}`)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                {/* Status colored accent line on top */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: statusStyle.color }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {category?.icon || '📍'}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {category?.label || issue.category || 'General'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> Reported {timeAgo(issue.created_at)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {issue.subadmin_verified && (
                      <span style={{ background: 'var(--brand-teal-50)', color: 'var(--brand-teal)', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '14px', border: '1px solid var(--brand-teal-200)' }}>
                        ✓ Verified by Sub-Admin
                      </span>
                    )}
                    <span className="badge" style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      fontSize: '12px',
                      padding: '4px 12px',
                      fontWeight: 800,
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 8px', lineHeight: 1.3 }}>
                  {issue.title}
                </h4>

                {/* Description */}
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, lineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {issue.description}
                </p>

                {/* Footer details */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <MapPin size={14} color="var(--brand-saffron)" /> {issue.location?.locality_name || 'Pune Ward'}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--brand-teal)' }}>
                      <ThumbsUp size={14} /> {issue.votes} Votes
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <MessageCircle size={14} /> {issue.comments?.length || 0} Comments
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--primary)', fontWeight: 700 }}>
                      View Details <ArrowUpRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
