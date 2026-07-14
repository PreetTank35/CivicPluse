import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, Send, Share2, Flag, MessageCircle } from 'lucide-react';
import SupportButton from '../components/SupportButton';
import StatusStepper from '../components/StatusStepper';
import { CATEGORIES } from '../data/mockData';
import {
  getProblemById, getUserById, getComments, getStatusHistory,
  hasUserSupported, toggleSupport, addComment, events, flagProblem
} from '../data/store';
import { useAuth } from '../lib/AuthContext';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : `${Math.floor(days / 7)}w ago`;
}

/**
 * ProblemDetail — full problem view with media, status stepper, comments.
 */
export default function ProblemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [comments, setComments] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [currentMedia, setCurrentMedia] = useState(0);

  useEffect(() => {
    loadData();
    const unsub = events.on('problemUpdated', loadData);
    return () => unsub();
  }, [id]);

  function loadData() {
    const p = getProblemById(id);
    if (p) {
      setProblem(p);
      setComments(getComments(id));
      setStatusHistory(getStatusHistory(id));
    }
  }

  function handleSupport() {
    toggleSupport(id);
    loadData();
  }

  function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(id, commentText.trim());
    setCommentText('');
    loadData();
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: problem.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  if (!problem) {
    return (
      <div className="detail-page" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Problem not found</h3>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to Feed</button>
      </div>
    );
  }

  const reporter = getUserById(problem.user_id);
  const category = CATEGORIES.find(c => c.id === problem.category);
  const isSupported = hasUserSupported(id, user?.id || 'user-1');
  const isOwnPost = problem.user_id === (user?.id || 'user-1');
  const mediaUrls = problem.media_urls || [];

  return (
    <div className="detail-page">
      {/* ── Header ── */}
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Back
        </button>
        <div className="detail-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleShare} title="Share">
            <Share2 size={16} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => flagProblem(id)} title="Report">
            <Flag size={16} />
          </button>
        </div>
      </div>

      {/* ── Media Gallery ── */}
      {mediaUrls.length > 0 && (
        <div className="detail-media">
          <img
            src={mediaUrls[currentMedia]}
            alt={problem.title}
            className="detail-media-img"
          />
          {mediaUrls.length > 1 && (
            <div className="detail-media-dots">
              {mediaUrls.map((_, i) => (
                <span
                  key={i}
                  className={`media-dot ${i === currentMedia ? 'active' : ''}`}
                  onClick={() => setCurrentMedia(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="detail-content">
        {/* Category + Status */}
        <div className="detail-badges">
          <span className="detail-category-badge" style={{ '--cat-color': category?.color }}>
            {category?.icon} {category?.label}
          </span>
          <span className="detail-locality-badge">
            <MapPin size={12} /> {problem.location_address || problem.locality_id}
          </span>
        </div>

        <h1 className="detail-title">{problem.title}</h1>

        {/* Reporter */}
        <div className="detail-reporter">
          <div className="detail-reporter-avatar">
            {reporter?.avatar || reporter?.name?.[0] || '?'}
          </div>
          <div>
            <div className="detail-reporter-name">{reporter?.name || 'Anonymous'}</div>
            <div className="detail-reporter-time">
              <Clock size={10} /> {timeAgo(problem.created_at)}
            </div>
          </div>
        </div>

        <p className="detail-description">{problem.description}</p>

        {/* Support + Stats */}
        <div className="detail-actions-bar">
          <SupportButton
            count={problem.support_count}
            supported={isSupported}
            ownPost={isOwnPost}
            onToggle={handleSupport}
          />
          <div className="detail-stat">
            <MessageCircle size={16} /> {comments.length} comments
          </div>
        </div>

        {/* ── Status Timeline ── */}
        <div className="detail-section">
          <h3 className="detail-section-title">Status Timeline</h3>
          <StatusStepper currentStatus={problem.status} statusHistory={statusHistory} />
        </div>

        {/* ── Comments ── */}
        <div className="detail-section">
          <h3 className="detail-section-title">Comments ({comments.length})</h3>

          {comments.length > 0 ? (
            <div className="detail-comments-list">
              {comments.map(comment => {
                const commenter = getUserById(comment.user_id);
                return (
                  <div key={comment.id} className="detail-comment">
                    <div className="detail-comment-avatar">
                      {commenter?.avatar || commenter?.name?.[0] || '?'}
                    </div>
                    <div className="detail-comment-body">
                      <div className="detail-comment-header">
                        <span className="detail-comment-name">{commenter?.name || 'Anonymous'}</span>
                        <span className="detail-comment-time">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="detail-comment-text">{comment.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted" style={{ fontSize: '13px' }}>No comments yet. Be the first to add context!</p>
          )}

          {/* Comment input */}
          <form onSubmit={handleComment} className="detail-comment-form">
            <input
              type="text"
              className="form-input"
              placeholder="Add a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!commentText.trim()}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
