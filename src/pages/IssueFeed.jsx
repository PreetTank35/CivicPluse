import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Filter, Map as MapIcon, List, Plus, Search,
  ThumbsUp, MessageCircle, Share2, MapPin, Clock,
  Maximize2, Minimize2, Columns2, Image, Video, Eye, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { getAllIssues, events, getUserById, getAllLocalities, voteIssue } from '../data/store';
import { CATEGORIES } from '../data/mockData';
import { useAuth } from '../lib/AuthContext';
import MapView from '../components/MapView';
import ReportIssueModal from '../components/ReportIssueModal';
import PersonalizationQuizModal from '../components/PersonalizationQuizModal';
import ReelsFeed from '../components/ReelsFeed';
import PageTransition from '../components/PageTransition';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const STATUS_PROGRESS = {
  open: { pct: 10, color: 'var(--warning)' },
  acknowledged: { pct: 25, color: 'var(--accent)' },
  in_progress: { pct: 55, color: 'var(--primary)' },
  resolved: { pct: 85, color: 'var(--success)' },
  verified: { pct: 100, color: '#166534' },
  escalated: { pct: 40, color: 'var(--danger)' },
};

const STATUS_LABELS = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  verified: 'Verified',
  escalated: 'Escalated',
};

function InstaMediaCarousel({ issue, category, onNavigate }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const items = [];
  if (issue.video_url) items.push({ type: 'video', url: issue.video_url });
  if (issue.evidence && issue.evidence.length > 0) {
    issue.evidence.forEach(url => {
      if (!items.some(i => i.url === url)) {
        const isVid = typeof url === 'string' && (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.startsWith('data:video/'));
        items.push({ type: isVid ? 'video' : 'photo', url });
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="insta-card-media" onClick={onNavigate} style={{ cursor: 'pointer' }}>
        <div className="insta-card-media-placeholder">
          <span style={{ fontSize: '48px' }}>{category?.icon || '📍'}</span>
          <span style={{ fontSize: 'var(--text-xs)' }}>{category?.label || 'Issue'}</span>
        </div>
      </div>
    );
  }

  const activeItem = items[currentIdx] || items[0];

  return (
    <div className="insta-card-media" style={{ position: 'relative', background: '#000', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {activeItem.type === 'video' ? (
        <video
          src={activeItem.url}
          controls
          playsInline
          style={{ width: '100%', maxHeight: '520px', objectFit: 'contain' }}
        />
      ) : (
        <img
          src={activeItem.url}
          alt={issue.title}
          onClick={onNavigate}
          style={{ width: '100%', maxHeight: '520px', objectFit: 'contain', cursor: 'pointer' }}
        />
      )}

      {items.length > 1 && (
        <>
          {currentIdx > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrentIdx(c => c - 1); }}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {currentIdx < items.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrentIdx(c => c + 1); }}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
            >
              <ChevronRight size={20} />
            </button>
          )}
          <div style={{ position: 'absolute', bottom: '12px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 5 }}>
            {items.map((_, i) => (
              <span
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIdx(i); }}
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === currentIdx ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function IssueFeed() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [feedMode, setFeedMode] = useState(() => searchParams.get('view') || 'feed');
  const [mapSize, setMapSize] = useState(() => localStorage.getItem('civicpulse_map_size_pref') || 'split');
  const [mapWidthPct, setMapWidthPct] = useState(() => parseInt(localStorage.getItem('civicpulse_map_width_pct') || '50', 10));
  const [listWidthPx, setListWidthPx] = useState(420);
  const [isDraggingList, setIsDraggingList] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [userPrefs, setUserPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpulse_quiz_prefs');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const onDragList = useCallback((e) => {
    if (!isDraggingList) return;
    const newW = Math.min(Math.max(e.clientX, 240), window.innerWidth - 300);
    setListWidthPx(newW);
  }, [isDraggingList]);

  const stopDraggingList = useCallback(() => setIsDraggingList(false), []);

  useEffect(() => {
    if (isDraggingList) {
      window.addEventListener('mousemove', onDragList);
      window.addEventListener('mouseup', stopDraggingList);
    }
    return () => {
      window.removeEventListener('mousemove', onDragList);
      window.removeEventListener('mouseup', stopDraggingList);
    };
  }, [isDraggingList, onDragList, stopDraggingList]);

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam && ['feed', 'map', 'reels'].includes(viewParam)) {
      setFeedMode(viewParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setIssues(getAllIssues());
    setLocalities(getAllLocalities());

    const unbindCreated = events.on('issueCreated', () => setIssues(getAllIssues()));
    const unbindUpdated = events.on('issueUpdated', () => setIssues(getAllIssues()));
    const unbindReset = events.on('storeReset', () => setIssues(getAllIssues()));
    const unbindView = events.on('viewModeChanged', (mode) => setFeedMode(mode));
    const unbindQuiz = events.on('quizCompleted', (prefs) => {
      setUserPrefs(prefs);
      setFilter('personalized');
    });

    const handleResize = () => {};
    window.addEventListener('resize', handleResize);

    return () => {
      unbindCreated();
      unbindUpdated();
      unbindReset();
      unbindView();
      unbindQuiz();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const filteredIssues = issues.filter(issue => {
    if (filter === 'my_area') {
      const currentUser = getUserById(user?.id || 'user-1');
      if (currentUser?.locality && issue.locality !== currentUser.locality) return false;
    }
    if (search) {
      if (!issue.title.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => {
    if (filter !== 'personalized' || !userPrefs) {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
    let scoreA = 0;
    let scoreB = 0;
    if (a.locality === userPrefs.locality) scoreA += 50;
    if (b.locality === userPrefs.locality) scoreB += 50;
    if (userPrefs.interests?.includes(a.category)) scoreA += 25;
    if (userPrefs.interests?.includes(b.category)) scoreB += 25;
    const sevMap = { critical: 30, high: 20, medium: 10, low: 0 };
    scoreA += sevMap[a.severity] || 0;
    scoreB += sevMap[b.severity] || 0;
    return scoreB - scoreA;
  });

  const mapCenter = filteredIssues.length > 0
    ? [filteredIssues[0].location.lat, filteredIssues[0].location.lng]
    : [18.5204, 73.8567];

  function handleVote(e, issueId) {
    e.stopPropagation();
    voteIssue(issueId);
    setIssues(getAllIssues());
  }

  function getSeverityBadge(severity) {
    const map = {
      critical: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Critical', border: 'var(--danger-border)' },
      high: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'High', border: 'var(--warning-border)' },
      medium: { bg: 'var(--accent-bg)', color: 'var(--accent)', label: 'Medium', border: 'rgba(124,58,237,0.2)' },
      low: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Low', border: 'var(--success-border)' },
    };
    const style = map[severity] || map.low;
    return (
      <span className="badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, fontSize: '10px', padding: '2px 8px' }}>
        {style.label}
      </span>
    );
  }

  // ── Map split-view width calculation
  const mapFlexMap = {
    compact: '0 0 280px',
    split: '0 0 50%',
    full: '1',
  };

  return (
    <PageTransition>
      <div style={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column' }}>
        {/* ── Top Action Bar ── */}
        <div style={{
          padding: 'var(--space-sm) var(--space-lg)',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-md)',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          {/* Search + Filter */}
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flex: 1, maxWidth: '380px', minWidth: '200px' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search issues..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: '32px', height: '36px', fontSize: 'var(--text-sm)' }}
                />
              </div>
            </div>
            <select
              className="form-input"
              style={{ width: 'auto', height: '36px', fontSize: 'var(--text-sm)' }}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Pune</option>
              <option value="my_area">My Locality</option>
              <option value="personalized">✨ For You (Personalized)</option>
            </select>
          </div>

          {/* View Mode Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
            <div className="feed-view-tabs">
              <button
                className={`feed-view-tab ${feedMode === 'feed' ? 'active' : ''}`}
                onClick={() => setFeedMode('feed')}
              >
                <Image size={14} /> Feed
              </button>
              <button
                className={`feed-view-tab ${feedMode === 'map' ? 'active' : ''}`}
                onClick={() => setFeedMode('map')}
              >
                <MapIcon size={14} /> Map
              </button>
              <button
                className={`feed-view-tab ${feedMode === 'reels' ? 'active' : ''}`}
                onClick={() => setFeedMode('reels')}
              >
                <Video size={14} /> Reels
              </button>
            </div>

            {/* Map size controls with slider and presets */}
            {feedMode === 'map' && (
              <div className="map-size-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Map Size:</span>
                <button className={`map-size-btn ${mapSize === 'compact' ? 'active' : ''}`} onClick={() => { setMapSize('compact'); setMapWidthPct(25); localStorage.setItem('civicpulse_map_size_pref', 'compact'); localStorage.setItem('civicpulse_map_width_pct', '25'); }}>
                  25%
                </button>
                <button className={`map-size-btn ${mapSize === 'split' ? 'active' : ''}`} onClick={() => { setMapSize('split'); setMapWidthPct(50); localStorage.setItem('civicpulse_map_size_pref', 'split'); localStorage.setItem('civicpulse_map_width_pct', '50'); }}>
                  50%
                </button>
                <button className={`map-size-btn ${mapSize === 'large' ? 'active' : ''}`} onClick={() => { setMapSize('large'); setMapWidthPct(75); localStorage.setItem('civicpulse_map_size_pref', 'large'); localStorage.setItem('civicpulse_map_width_pct', '75'); }}>
                  75%
                </button>
                <button className={`map-size-btn ${mapSize === 'full' ? 'active' : ''}`} onClick={() => { setMapSize('full'); setMapWidthPct(100); localStorage.setItem('civicpulse_map_size_pref', 'full'); localStorage.setItem('civicpulse_map_width_pct', '100'); }}>
                  100%
                </button>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={mapWidthPct}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setMapWidthPct(val);
                    setMapSize(val === 100 ? 'full' : val < 35 ? 'compact' : 'split');
                    localStorage.setItem('civicpulse_map_width_pct', String(val));
                  }}
                  title={`Map Width: ${mapWidthPct}%`}
                  style={{ width: '80px', cursor: 'pointer' }}
                />
              </div>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => setIsQuizModalOpen(true)}
              style={{ height: '36px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} color="var(--primary)" /> <span className="hide-mobile">Personalize</span>
            </button>

            <button className="btn btn-primary" onClick={() => setIsReportModalOpen(true)} style={{ height: '36px', padding: '0 14px' }}>
              <Plus size={14} /> <span className="hide-mobile">Report</span>
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>

          {/* ═══ FEED MODE: Instagram-style cards ═══ */}
          {feedMode === 'feed' && (
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-page)' }}>
              <div className="insta-feed">
                {/* Multi-post Locality Banner */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-md)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} color="var(--primary)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Multi-Post Locality Feed</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Showing reported civic problems in your area</div>
                    </div>
                  </div>
                  <span className="badge" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 600 }}>
                    {filteredIssues.length} Posts
                  </span>
                </div>

                {filteredIssues.map(issue => {
                  const reporter = getUserById(issue.reporter);
                  const category = CATEGORIES.find(c => c.id === issue.category);
                  const statusInfo = STATUS_PROGRESS[issue.status] || STATUS_PROGRESS.open;
                  const isVoted = issue.voters?.includes(user?.id || 'user-1');

                  return (
                    <div key={issue.id} className="insta-card animate-fade-in">
                      {/* Header */}
                      <div className="insta-card-header">
                        <div className="insta-card-avatar">
                          {reporter?.avatar || '?'}
                        </div>
                        <div className="insta-card-user-info">
                          <div className="insta-card-username">{reporter?.name || 'Anonymous'}</div>
                          <div className="insta-card-location">
                            <MapPin size={10} /> {issue.location?.locality_name || 'Pune'}
                          </div>
                        </div>
                        <div className="insta-card-time">{timeAgo(issue.created_at)}</div>
                      </div>

                      {/* Media Carousel */}
                      <div style={{ position: 'relative' }}>
                        <InstaMediaCarousel
                          issue={issue}
                          category={category}
                          onNavigate={() => navigate(`/citizen/issue/${issue.id}`)}
                        />
                        <div className="insta-card-category-overlay" style={{ pointerEvents: 'none' }}>
                          <span className="badge" style={{
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            backdropFilter: 'blur(8px)',
                            fontSize: '10px',
                            padding: '3px 8px',
                          }}>
                            {category?.icon} {category?.label}
                          </span>
                        </div>
                        <div className="insta-card-severity-overlay" style={{ pointerEvents: 'none' }}>
                          {getSeverityBadge(issue.severity)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="insta-card-actions">
                        <button
                          className={`insta-action-btn ${isVoted ? 'voted' : ''}`}
                          onClick={(e) => handleVote(e, issue.id)}
                        >
                          <ThumbsUp size={18} /> {issue.votes}
                        </button>
                        <button className="insta-action-btn" onClick={() => navigate(`/citizen/issue/${issue.id}`)}>
                          <MessageCircle size={18} /> {issue.comments?.length || 0}
                        </button>
                        <button className="insta-action-btn">
                          <Share2 size={18} />
                        </button>
                        <div style={{ flex: 1 }} />
                        <button className="insta-action-btn" onClick={() => navigate(`/citizen/issue/${issue.id}`)}>
                          <Eye size={16} /> View
                        </button>
                      </div>

                      {/* Body */}
                      <div className="insta-card-body">
                        <div className="insta-card-title" onClick={() => navigate(`/citizen/issue/${issue.id}`)}>
                          {issue.title}
                        </div>
                        <div className="insta-card-desc">{issue.description}</div>
                      </div>

                      {/* Footer */}
                      <div className="insta-card-footer">
                        <div className="insta-card-status">
                          <span className="badge" style={{
                            background: statusInfo.color,
                            color: 'white',
                            fontSize: '10px',
                            padding: '2px 8px',
                          }}>
                            {STATUS_LABELS[issue.status]}
                          </span>
                          <div className="status-progress-bar">
                            <div className="status-progress-fill" style={{
                              width: `${statusInfo.pct}%`,
                              background: statusInfo.color,
                            }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} /> {issue.sla_deadline ? timeAgo(issue.sla_deadline) : '--'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredIssues.length === 0 && (
                  <div className="card text-center" style={{ padding: 'var(--space-xl)' }}>
                    <div style={{ fontSize: '32px', marginBottom: 'var(--space-sm)' }}>🎉</div>
                    <h3>No issues found</h3>
                    <p className="text-muted">Looks like everything is perfect here!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ MAP MODE: List + Map with size presets ═══ */}
          {feedMode === 'map' && (
            <>
              {/* List panel — hidden in full map mode */}
              {mapSize !== 'full' && (
                <div style={{
                  width: `${100 - mapWidthPct}%`,
                  minWidth: '240px',
                  flexShrink: 0,
                  overflowY: 'auto',
                  padding: 'var(--space-md)',
                  background: 'var(--bg-page)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)',
                }}>
                  {filteredIssues.map(issue => {
                    const category = CATEGORIES.find(c => c.id === issue.category);
                    const statusInfo = STATUS_PROGRESS[issue.status] || STATUS_PROGRESS.open;
                    return (
                      <div
                        key={issue.id}
                        className="card"
                        style={{ cursor: 'pointer', padding: 'var(--space-md)', transition: 'transform 0.15s' }}
                        onClick={() => navigate(`/citizen/issue/${issue.id}`)}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                          <span className="badge" style={{ background: statusInfo.color, color: 'white', fontSize: '10px', padding: '2px 8px' }}>
                            {STATUS_LABELS[issue.status]}
                          </span>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <h3 style={{ fontSize: 'var(--text-sm)', marginBottom: '4px', fontWeight: 600 }}>{issue.title}</h3>
                        <p style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-secondary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          lineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          marginBottom: 'var(--space-xs)',
                        }}>
                          {issue.description}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={10} /> {issue.location.locality_name}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span><ThumbsUp size={10} /> {issue.votes}</span>
                            <span><MessageCircle size={10} /> {issue.comments?.length || 0}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Draggable Resizing Divider */}
              {mapSize === 'split' && (
                <div
                  onMouseDown={() => setIsDraggingList(true)}
                  style={{
                    width: '6px',
                    cursor: 'col-resize',
                    background: isDraggingList ? 'var(--primary)' : 'var(--border)',
                    transition: isDraggingList ? 'none' : 'background 0.2s',
                    zIndex: 10,
                  }}
                  title="Drag to resize panels"
                />
              )}

              {/* Map panel */}
              <div style={{ width: mapSize === 'full' ? '100%' : `${mapWidthPct}%`, flex: mapSize === 'full' ? 1 : 'none', position: 'relative' }}>
                <MapView
                  issues={filteredIssues}
                  center={mapCenter}
                  onMarkerClick={(id) => navigate(`/citizen/issue/${id}`)}
                />
              </div>
            </>
          )}

          {/* ═══ REELS MODE: Vertical video-first feed ═══ */}
          {feedMode === 'reels' && (
            <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-page)' }}>
              <ReelsFeed issues={filteredIssues} onIssueClick={(id) => navigate(`/citizen/issue/${id}`)} />
            </div>
          )}
        </div>

        <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
        <PersonalizationQuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} />
      </div>
    </PageTransition>
  );
}
