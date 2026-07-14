import { useState, useRef, useEffect, useCallback } from 'react';
import { ThumbsUp, MessageCircle, Share2, MapPin, Video, Play, Volume2, VolumeX, AlertTriangle, Send, X } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { getUserById, voteIssue, addComment } from '../data/store';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const REEL_GRADIENTS = [
  'linear-gradient(135deg, #0B1929 0%, #132D4A 50%, #0D9488 100%)',
  'linear-gradient(135deg, #0B1929 0%, #1E3550 50%, #0F766E 100%)',
  'linear-gradient(135deg, #060F1A 0%, #0B1929 50%, #6366F1 100%)',
  'linear-gradient(135deg, #0B1929 0%, #132D4A 50%, #F43F5E 100%)',
  'linear-gradient(135deg, #060F1A 0%, #132D4A 50%, #14B8A6 100%)',
];

/**
 * Convert a base64 data URI to a Blob URL for reliable video playback.
 */
function useSafeVideoUrl(rawUrl) {
  const [safeUrl, setSafeUrl] = useState(rawUrl);
  const [error, setError] = useState(false);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    setError(false);
    if (!rawUrl) { setSafeUrl(null); return; }

    if (rawUrl.startsWith('data:video/')) {
      try {
        const [header, base64Data] = rawUrl.split(',');
        const mimeMatch = header.match(/data:(video\/\w+)/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'video/mp4';
        const byteChars = atob(base64Data);
        const byteNumbers = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        setSafeUrl(blobUrl);
      } catch (e) {
        console.error('[ReelsFeed] Failed to convert base64 to blob:', e);
        setError(true);
        setSafeUrl(null);
      }
    } else {
      setSafeUrl(rawUrl);
    }

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [rawUrl]);

  return { safeUrl, error, setError };
}

/**
 * Single reel video player with IntersectionObserver auto-play/pause.
 */
function ReelVideoPlayer({ videoUrl, isVisible }) {
  const { safeUrl, error, setError } = useSafeVideoUrl(videoUrl);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !safeUrl) return;
    if (isVisible) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isVisible, safeUrl]);

  if (error || !safeUrl) {
    return (
      <div className="reel-video-error">
        <AlertTriangle size={32} />
        <span>Video unavailable</span>
        <span style={{ fontSize: '11px', opacity: 0.5 }}>The video could not be loaded</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <video
        ref={videoRef}
        src={safeUrl}
        controls
        loop
        muted={muted}
        playsInline
        onError={() => setError(true)}
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
      />
      <button
        className="reel-mute-btn"
        onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
}

/**
 * Inline comment panel for reels — no navigation needed.
 */
function ReelCommentPanel({ issue, onClose }) {
  const [commentText, setCommentText] = useState('');
  const [, forceUpdate] = useState(0);
  const comments = issue?.comments || [];

  function handleSend() {
    if (!commentText.trim() || !issue) return;
    addComment(issue.id, commentText.trim());
    setCommentText('');
    forceUpdate(n => n + 1);
  }

  return (
    <div className="reel-comment-panel" onClick={(e) => e.stopPropagation()}>
      <div className="reel-comment-header">
        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
          Comments ({comments.length})
        </span>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px' }}>
          <X size={16} />
        </button>
      </div>
      <div className="reel-comment-list">
        {comments.length === 0 && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '16px' }}>
            No comments yet. Be the first!
          </p>
        )}
        {comments.map(comment => {
          const u = getUserById(comment.user);
          return (
            <div key={comment.id} className="reel-comment-item">
              <div className="reel-comment-avatar">{u?.avatar || '??'}</div>
              <div>
                <span className="reel-comment-author">{u?.name || 'Unknown'}</span>
                <span className="reel-comment-time">{timeAgo(comment.time)}</span>
                <div className="reel-comment-text">{comment.text}</div>
              </div>
            </div>
          );
        })}
      </div>
      <form className="reel-comment-input" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!commentText.trim()}>
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

/**
 * ReelsFeed — Vertical video-first feed with snap-scrolling,
 * full-viewport reels, auto-play via IntersectionObserver,
 * and inline comments. Responsive across all devices.
 */
export default function ReelsFeed({ issues, onIssueClick }) {
  const containerRef = useRef(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [commentOpenId, setCommentOpenId] = useState(null);
  const reelRefs = useRef([]);

  // IntersectionObserver for auto-play detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.reelIndex, 10);
            if (!isNaN(idx)) setVisibleIndex(idx);
          }
        });
      },
      { threshold: 0.6 }
    );

    reelRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [issues]);

  return (
    <div className="reels-feed" ref={containerRef}>
      {issues.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-3xl)',
          color: 'var(--text-muted)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Video size={48} style={{ margin: '0 auto var(--space-md)', opacity: 0.3 }} />
          <h3 style={{ color: 'var(--text-tertiary)' }}>No issues to show</h3>
          <p style={{ fontSize: 'var(--text-sm)' }}>Report an issue with video to see it here!</p>
        </div>
      )}

      {issues.map((issue, idx) => {
        const reporter = getUserById(issue.reporter);
        const category = CATEGORIES.find(c => c.id === issue.category);
        const gradient = REEL_GRADIENTS[idx % REEL_GRADIENTS.length];
        
        const videoUrl = issue.video_url || (issue.evidence && issue.evidence.find(url => typeof url === 'string' && (url.startsWith('data:video/') || url.includes('.mp4') || url.includes('.webm'))));
        const photoUrl = !videoUrl && issue.evidence && issue.evidence.find(url => typeof url === 'string' && (url.startsWith('data:image/') || url.startsWith('http')));

        return (
          <div
            key={issue.id}
            className="reel-card"
            ref={el => reelRefs.current[idx] = el}
            data-reel-index={idx}
            style={{ background: gradient }}
          >
            {/* Video / Photo / Placeholder */}
            <div className="reel-media-container">
              {videoUrl ? (
                <ReelVideoPlayer videoUrl={videoUrl} isVisible={visibleIndex === idx} />
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt={issue.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="reel-video-placeholder">
                  <span style={{ fontSize: '64px', marginBottom: '8px' }}>{category?.icon || '📍'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={16} />
                    <span>Civic Issue Report</span>
                  </div>
                  <span style={{ fontSize: '11px', opacity: 0.4, marginTop: '4px' }}>
                    {category?.label || 'Issue'} • {issue.location?.locality_name}
                  </span>
                </div>
              )}
            </div>

            {/* Category badge */}
            <div className="reel-category-badge">
              <span className="badge" style={{
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                backdropFilter: 'blur(8px)',
                fontSize: '10px',
                padding: '3px 10px',
              }}>
                {category?.icon} {category?.label}
              </span>
            </div>

            {/* Right sidebar actions */}
            <div className="reel-sidebar">
              <button
                className="reel-sidebar-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  voteIssue(issue.id);
                }}
              >
                <ThumbsUp size={24} />
                <span>{issue.votes}</span>
              </button>
              <button
                className="reel-sidebar-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setCommentOpenId(commentOpenId === issue.id ? null : issue.id);
                }}
              >
                <MessageCircle size={24} />
                <span>{issue.comments?.length || 0}</span>
              </button>
              <button className="reel-sidebar-btn" onClick={(e) => e.stopPropagation()}>
                <Share2 size={24} />
                <span>Share</span>
              </button>
            </div>

            {/* Bottom overlay */}
            <div className="reel-overlay">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'white',
                }}>
                  {reporter?.avatar || '?'}
                </div>
                <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                  {reporter?.name || 'Anonymous'}
                </span>
              </div>
              <div className="reel-overlay-title" onClick={() => onIssueClick(issue.id)} style={{ cursor: 'pointer' }}>
                {issue.title}
              </div>
              <div className="reel-overlay-desc">{issue.description}</div>
              <div className="reel-overlay-meta">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {issue.location?.locality_name}
                </span>
                <span>{timeAgo(issue.created_at)}</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.15)',
                  fontSize: '10px',
                }}>
                  {issue.severity}
                </span>
              </div>
            </div>

            {/* Inline comment panel */}
            {commentOpenId === issue.id && (
              <ReelCommentPanel
                issue={issue}
                onClose={() => setCommentOpenId(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
