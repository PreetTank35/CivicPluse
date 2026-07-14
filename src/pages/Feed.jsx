import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Filter, Sparkles } from 'lucide-react';
import ProblemCard from '../components/ProblemCard';
import { SkeletonList } from '../components/SkeletonCard';
import { getFeedProblems, getAllLocalities, events } from '../data/store';
import { useAuth } from '../lib/AuthContext';
import { CATEGORIES } from '../data/mockData';

/**
 * Feed — Instagram-style scrollable card feed.
 * Locality-first ranking algorithm.
 */
export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const userLocality = user?.locality_id || 'kothrud';
  const localities = getAllLocalities();
  const localityName = localities.find(l => l.id === userLocality)?.name || 'Pune';
  const localityData = localities.find(l => l.id === userLocality);

  const loadFeed = useCallback(() => {
    const feed = getFeedProblems(
      userLocality,
      localityData?.center?.lat,
      localityData?.center?.lng
    );
    let filtered = feed;
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    setProblems(filtered);
    setLoading(false);
  }, [userLocality, localityData, categoryFilter, statusFilter]);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(loadFeed, 400);
    const unsub1 = events.on('problemCreated', loadFeed);
    const unsub2 = events.on('problemUpdated', loadFeed);
    const unsub3 = events.on('storeReset', loadFeed);
    return () => {
      clearTimeout(timer);
      unsub1(); unsub2(); unsub3();
    };
  }, [loadFeed]);

  return (
    <div className="feed-page">
      {/* ── Locality Header ── */}
      <div className="feed-locality-header">
        <div className="feed-locality-info">
          <MapPin size={18} className="feed-locality-icon" />
          <div>
            <div className="feed-locality-name">{localityName}</div>
            <div className="feed-locality-sub">Showing nearby civic issues</div>
          </div>
        </div>
        <div className="feed-header-actions">
          <button
            className={`feed-filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(f => !f)}
          >
            <Filter size={16} />
            <span className="hide-mobile">Filters</span>
          </button>
          <span className="feed-count-badge">{problems.length} issues</span>
        </div>
      </div>

      {/* ── Filters ── */}
      {showFilters && (
        <div className="feed-filters animate-fade-in">
          <div className="feed-filter-group">
            <label className="feed-filter-label">Category</label>
            <div className="feed-filter-chips">
              <button
                className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-chip ${categoryFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat.id)}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="feed-filter-group">
            <label className="feed-filter-label">Status</label>
            <div className="feed-filter-chips">
              {['all', 'reported', 'verified', 'escalated', 'in_progress', 'resolved'].map(s => (
                <button
                  key={s}
                  className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Feed Content ── */}
      <div className="feed-content">
        {loading ? (
          <SkeletonList count={3} type="feed" />
        ) : problems.length > 0 ? (
          problems.map(problem => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onUpdate={loadFeed}
            />
          ))
        ) : (
          <div className="feed-empty-state">
            <div className="feed-empty-illustration">🏘️</div>
            <h3>No issues reported near you yet</h3>
            <p>Be the first to make your locality better! Tap the + button to report a problem.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/post/new')}
              style={{ marginTop: '12px' }}
            >
              <Sparkles size={16} /> Report First Issue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
