import { useState, useRef, useEffect } from 'react';
import { ThumbsUp, MessageCircle, Share2, MapPin, Video, Play } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { getUserById, voteIssue, getAllIssues } from '../data/store';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// Color gradient backgrounds for reel placeholders
const REEL_GRADIENTS = [
  'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0891b2 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2d4a5e 100%)',
  'linear-gradient(135deg, #1c1c3c 0%, #2a2a5c 50%, #3d3d8c 100%)',
  'linear-gradient(135deg, #0a1628 0%, #142740 50%, #1e4060 100%)',
];

/**
 * ReelsFeed — Vertical video-first feed with snap-scrolling
 * and overlay metadata, similar to Instagram Reels.
 */
export default function ReelsFeed({ issues, onIssueClick }) {
  const [playing, setPlaying] = useState(null);
  const containerRef = useRef(null);

  return (
    <div className="reels-feed" ref={containerRef}>
      {issues.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-3xl)',
          color: 'var(--text-muted)',
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
            style={{ background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => onIssueClick(issue.id)}
          >
            {/* Video / Photo / Placeholder */}
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
              />
            ) : photoUrl ? (
              <img
                src={photoUrl}
                alt={issue.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
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
              <button className="reel-sidebar-btn" onClick={(e) => { e.stopPropagation(); onIssueClick(issue.id); }}>
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
              <div className="reel-overlay-title">{issue.title}</div>
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
          </div>
        );
      })}
    </div>
  );
}
