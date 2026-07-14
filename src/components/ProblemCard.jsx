import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, Share2, ChevronLeft, ChevronRight, Clock, Flag } from 'lucide-react';
import SupportButton from './SupportButton';
import StatusStepper from './StatusStepper';
import { CATEGORIES, STATUSES } from '../data/mockData';
import { getUserById, hasUserSupported, toggleSupport } from '../data/store';
import { useAuth } from '../lib/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/**
 * ProblemCard — Instagram-style card for the feed.
 * Image-forward, locality tag, status badge, support button, comments.
 */
export default function ProblemCard({ problem, onUpdate }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [supportAnimating, setSupportAnimating] = useState(false);

  const reporter = getUserById(problem.user_id);
  const category = CATEGORIES.find(c => c.id === problem.category);
  const statusMeta = STATUSES.find(s => s.id === problem.status);
  const isSupported = hasUserSupported(problem.id, user?.id || 'user-1');
  const isOwnPost = problem.user_id === (user?.id || 'user-1');
  const locality = problem.locality_id;
  const mediaUrls = problem.media_urls || [];

  function handleSupport() {
    setSupportAnimating(true);
    toggleSupport(problem.id);
    setTimeout(() => setSupportAnimating(false), 300);
    onUpdate?.();
  }

  function handleShare(e) {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: problem.title,
        text: problem.description,
        url: `${window.location.origin}/problem/${problem.id}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/problem/${problem.id}`);
    }
  }

  const initials = reporter?.name
    ? reporter.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : reporter?.avatar || '?';

  return (
    <article className="problem-card animate-fade-in">
      {/* ── Header ── */}
      <div className="problem-card-header">
        <div className="problem-card-avatar">{initials}</div>
        <div className="problem-card-user-info">
          <div className="problem-card-username">{reporter?.name || 'Anonymous'}</div>
          <div className="problem-card-location">
            <MapPin size={10} />
            <span>{problem.location_address || locality || 'Pune'}</span>
          </div>
        </div>
        <div className="problem-card-time">
          <Clock size={10} />
          <span>{timeAgo(problem.created_at)}</span>
        </div>
      </div>

      {/* ── Media ── */}
      <div
        className="problem-card-media"
        onClick={() => navigate(`/problem/${problem.id}`)}
        style={{ cursor: 'pointer' }}
      >
        {mediaUrls.length > 0 ? (
          <>
            <img
              src={mediaUrls[currentMediaIdx]}
              alt={problem.title}
              style={{
                width: '100%',
                height: '320px',
                objectFit: 'cover',
                display: 'block',
              }}
              loading="lazy"
            />
            {/* Media nav arrows */}
            {mediaUrls.length > 1 && (
              <>
                {currentMediaIdx > 0 && (
                  <button
                    className="media-nav-btn media-nav-left"
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIdx(i => i - 1); }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {currentMediaIdx < mediaUrls.length - 1 && (
                  <button
                    className="media-nav-btn media-nav-right"
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIdx(i => i + 1); }}
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
                <div className="media-dots">
                  {mediaUrls.map((_, i) => (
                    <span
                      key={i}
                      className={`media-dot ${i === currentMediaIdx ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setCurrentMediaIdx(i); }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="problem-card-media-placeholder">
            <span style={{ fontSize: '42px' }}>{category?.icon || '📍'}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{category?.label || 'Issue'}</span>
          </div>
        )}

        {/* Category badge overlay */}
        <div className="problem-card-category-badge">
          <span>{category?.icon}</span> {category?.label}
        </div>

        {/* Status badge overlay */}
        <div
          className="problem-card-status-badge"
          style={{ '--status-color': statusMeta?.color || '#6b7280' }}
        >
          {statusMeta?.label || problem.status}
        </div>
      </div>

      {/* ── Actions Row ── */}
      <div className="problem-card-actions">
        <SupportButton
          count={problem.support_count}
          supported={isSupported}
          ownPost={isOwnPost}
          onToggle={handleSupport}
        />
        <button
          className="problem-card-action-btn"
          onClick={() => navigate(`/problem/${problem.id}`)}
        >
          <MessageCircle size={18} />
          <span>{problem.comment_count || 0}</span>
        </button>
        <button className="problem-card-action-btn" onClick={handleShare}>
          <Share2 size={18} />
        </button>
        <div style={{ flex: 1 }} />
        <StatusStepper currentStatus={problem.status} compact />
      </div>

      {/* ── Body ── */}
      <div className="problem-card-body">
        <h3
          className="problem-card-title"
          onClick={() => navigate(`/problem/${problem.id}`)}
        >
          {problem.title}
        </h3>
        <p className="problem-card-desc">{problem.description}</p>
      </div>
    </article>
  );
}
