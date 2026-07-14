import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Map as MapIcon, Search, Filter, Layers, MapPin, ThumbsUp,
  MessageCircle, Clock, ChevronRight, AlertTriangle, CheckCircle, Plus
} from 'lucide-react';
import { getAllIssues, getAllLocalities, events } from '../data/store';
import { CATEGORIES } from '../data/mockData';
import MapView from '../components/MapView';
import PageTransition from '../components/PageTransition';

export default function MapPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [layoutMode, setLayoutMode] = useState('split'); // split | full

  useEffect(() => {
    setIssues(getAllIssues());
    setLocalities(getAllLocalities());

    const unbindCreated = events.on('issueCreated', () => setIssues(getAllIssues()));
    const unbindUpdated = events.on('issueUpdated', () => setIssues(getAllIssues()));
    return () => {
      unbindCreated();
      unbindUpdated();
    };
  }, []);

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const locId = issue.locality_id || issue.locality;
    if (selectedLocality !== 'all' && locId !== selectedLocality) return false;
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'open' && !['open', 'reported', 'acknowledged'].includes(issue.status)) return false;
      if (selectedStatus === 'in_progress' && issue.status !== 'in_progress') return false;
      if (selectedStatus === 'resolved' && !['resolved', 'verified'].includes(issue.status)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const title = (issue.title || '').toLowerCase();
      const desc = (issue.description || '').toLowerCase();
      const locName = (issue.location?.locality_name || issue.location_address || locId || '').toLowerCase();
      if (!title.includes(q) && !desc.includes(q) && !locName.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const activeIssue = issues.find(i => i.id === activeIssueId) || filteredIssues[0];
  const activeLat = activeIssue?.location_lat ?? activeIssue?.location?.lat ?? 18.5204;
  const activeLng = activeIssue?.location_lng ?? activeIssue?.location?.lng ?? 73.8567;
  const mapCenter = [activeLat, activeLng];

  function getSeverityBadge(severity) {
    const map = {
      critical: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Critical' },
      high: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'High' },
      medium: { bg: 'var(--accent-bg)', color: 'var(--accent)', label: 'Medium' },
      low: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Low' },
    };
    const style = map[severity] || map.low;
    return (
      <span className="badge" style={{ background: style.bg, color: style.color, fontSize: '11px', padding: '3px 8px', fontWeight: 700 }}>
        {style.label}
      </span>
    );
  }

  return (
    <PageTransition>
      <div style={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Control Bar */}
        <div style={{
          padding: '12px 24px',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapIcon size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--text-primary)' }}>
                Civic Speed Map
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Real-time geospatial tracking across Pune ({filteredIssues.length} issues shown)
              </p>
            </div>
          </div>

          {/* Filters & Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search map issues..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '36px', fontSize: '13px', margin: 0 }}
              />
            </div>

            <select
              className="form-input"
              style={{ width: 'auto', height: '36px', fontSize: '13px', margin: 0 }}
              value={selectedLocality}
              onChange={e => setSelectedLocality(e.target.value)}
            >
              <option value="all">All Localities</option>
              {localities.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            <select
              className="form-input"
              style={{ width: 'auto', height: '36px', fontSize: '13px', margin: 0 }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>

            <select
              className="form-input"
              style={{ width: 'auto', height: '36px', fontSize: '13px', margin: 0 }}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open / Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved / Verified</option>
            </select>

            <button
              className={`btn btn-sm ${layoutMode === 'full' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setLayoutMode(l => l === 'split' ? 'full' : 'split')}
              title="Toggle full screen map"
              style={{ height: '36px', border: '1px solid var(--border)' }}
            >
              <Layers size={14} />
              <span>{layoutMode === 'split' ? 'Full Map' : 'Split View'}</span>
            </button>
          </div>
        </div>

        {/* Main Content: Split List + Map */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Left Panel: Issue List */}
          {layoutMode === 'split' && (
            <div style={{
              width: '400px',
              borderRight: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
            }}>
              <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 5 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Issues in View ({filteredIssues.length})
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/citizen/report')}
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                >
                  <Plus size={12} /> Add Issue
                </button>
              </div>

              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredIssues.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                    <MapPin size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>No matching issues</div>
                    <div style={{ fontSize: '12px' }}>Try adjusting your locality or search filters</div>
                  </div>
                )}

                {filteredIssues.map(issue => {
                  const category = CATEGORIES.find(c => c.id === issue.category);
                  const isSelected = activeIssueId === issue.id;

                  return (
                    <div
                      key={issue.id}
                      onClick={() => setActiveIssueId(issue.id)}
                      style={{
                        background: isSelected ? 'var(--bg-primary)' : 'var(--bg-primary)',
                        border: isSelected ? '2px solid var(--brand-teal)' : '1px solid var(--border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: isSelected ? '0 4px 14px rgba(13, 148, 136, 0.15)' : 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '18px' }}>{category?.icon || '📍'}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            {category?.label || 'General'}
                          </span>
                        </div>
                        {getSeverityBadge(issue.severity)}
                      </div>

                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                        {issue.title}
                      </h4>

                      <p style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        lineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '10px',
                        lineHeight: 1.4,
                      }}>
                        {issue.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <MapPin size={12} color="var(--primary)" /> {issue.location?.locality_name || 'Pune'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <ThumbsUp size={12} /> {issue.votes}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MessageCircle size={12} /> {issue.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right/Center Panel: Map */}
          <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            <MapView
              issues={filteredIssues}
              center={mapCenter}
              zoom={13}
              onMarkerClick={(id) => {
                setActiveIssueId(id);
                // Also open detail if double clicked or clicked inside popup
              }}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
