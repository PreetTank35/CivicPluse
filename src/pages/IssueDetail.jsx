import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ThumbsUp, MessageCircle, MapPin, Clock, Send,
  AlertTriangle, CheckCircle, Shield, Sparkles
} from 'lucide-react';
import { getIssueById, getUserById, getDepartmentById, getLocalityById, voteIssue, addComment, verifyResolution, getCurrentUser } from '../data/store';
import { CATEGORIES, SEVERITIES } from '../data/mockData';
import SLATimer from '../components/SLATimer';
import StatusTimeline from '../components/StatusTimeline';
import MapView from '../components/MapView';
import PageTransition from '../components/PageTransition';
import { statusClass, statusLabel, timeAgo } from '../components/IssueCard';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const [commentText, setCommentText] = useState('');

  const issue = getIssueById(id);
  if (!issue) {
    return (
      <div className="page-wrapper mesh-bg">
        <div className="container page-content">
          <div className="empty-state">
            <AlertTriangle size={48} />
            <h3>Issue not found</h3>
            <p>The issue you're looking for doesn't exist.</p>
            <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.id === issue.category);
  const severity = SEVERITIES.find(s => s.id === issue.severity);
  const reporter = getUserById(issue.reporter);
  const department = getDepartmentById(issue.department);
  const locality = getLocalityById(issue.locality);
  const currentUser = getCurrentUser();
  const hasVoted = issue.voters?.includes(currentUser?.id);
  const isResolved = issue.status === 'resolved';
  const isVerified = issue.status === 'verified';

  function handleVote() {
    voteIssue(issue.id);
    forceUpdate(n => n + 1);
  }

  function handleComment() {
    if (!commentText.trim()) return;
    addComment(issue.id, commentText.trim());
    setCommentText('');
    forceUpdate(n => n + 1);
  }

  function handleVerify(approved) {
    verifyResolution(issue.id, approved);
    forceUpdate(n => n + 1);
  }

  // Reload issue data after mutations
  const freshIssue = getIssueById(id);
  // Defensive: ensure comments and timeline are always arrays
  const comments = freshIssue?.comments || [];
  const timeline = freshIssue?.timeline || [];

  return (
    <PageTransition>
      <div className="page-wrapper mesh-bg">
        <div className="container page-content">
        {/* Back link */}
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: 'var(--space-lg)' }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="issue-detail-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <span className={`badge ${statusClass(freshIssue.status)}`}>
              {statusLabel(freshIssue.status)}
            </span>
            {category && (
              <span className="issue-card-category">
                {category.icon} {category.label}
              </span>
            )}
            <span className="badge" style={{
              background: `rgba(${severity?.id === 'critical' ? '239,68,68' : severity?.id === 'high' ? '245,158,11' : '16,185,129'}, 0.1)`,
              color: severity?.color || 'var(--text-secondary)',
              border: `1px solid ${severity?.color || 'var(--border)'}33`,
            }}>
              {severity?.label || freshIssue.severity} severity
            </span>
            {freshIssue.ai_confidence && (
              <span className="badge-ai">
                <Sparkles size={10} /> AI {Math.round(freshIssue.ai_confidence * 100)}%
              </span>
            )}
          </div>

          <h1 className="issue-detail-title">{freshIssue.title}</h1>

          <div className="issue-detail-meta">
            <span className="issue-card-meta-item">
              <MapPin size={14} /> {freshIssue.location?.address || 'Unknown location'}
            </span>
            <span className="issue-card-meta-item">
              <Clock size={14} /> {timeAgo(freshIssue.created_at)}
            </span>
            {reporter && (
              <span className="issue-card-meta-item">
                Reported by <strong>{reporter.name}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="issue-detail-grid">
          {/* Main Content */}
          <div>
            {/* Description */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h5 style={{ marginBottom: 'var(--space-md)' }}>Description</h5>
              <p style={{ lineHeight: 1.8, fontSize: 'var(--text-sm)' }}>{freshIssue.description}</p>
            </div>

            {/* Video / Evidence */}
            {freshIssue.video_url && (
              <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <h5 style={{ marginBottom: 'var(--space-md)' }}>Video Evidence</h5>
                <video
                  src={freshIssue.video_url}
                  controls
                  playsInline
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '400px', objectFit: 'contain', background: '#000' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Timeline — with null safety fix */}
            {timeline.length > 0 && (
              <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <h5 style={{ marginBottom: 'var(--space-lg)' }}>Status Timeline</h5>
                <StatusTimeline timeline={timeline} />
              </div>
            )}

            {/* Resolution Proof */}
            {freshIssue.resolution_proof && (
              <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
                <h5 style={{ marginBottom: 'var(--space-md)' }}>
                  <Shield size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', color: 'var(--success)' }} />
                  Resolution Proof
                </h5>
                <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-md)' }}>
                  {freshIssue.resolution_proof.notes}
                </p>

                {/* Verify section */}
                {isResolved && !isVerified && (
                  <div className="verify-section">
                    <div className="verify-question">
                      <CheckCircle size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
                      Has this issue been resolved satisfactorily?
                    </div>
                    <div className="verify-buttons">
                      <button className="btn btn-success" onClick={() => handleVerify(true)}>
                        <ThumbsUp size={14} /> Yes, Verified
                      </button>
                      <button className="btn btn-danger" onClick={() => handleVerify(false)}>
                        Not Resolved
                      </button>
                    </div>
                    <div className="verify-progress">
                      {freshIssue.resolution_proof.citizen_yes_votes} / {freshIssue.resolution_proof.threshold} votes needed for verification
                    </div>
                  </div>
                )}

                {isVerified && (
                  <div style={{
                    background: 'var(--success-bg)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-md)',
                    textAlign: 'center',
                    color: 'var(--success-light)',
                    fontWeight: 600,
                  }}>
                    ✅ Community Verified — {freshIssue.resolution_proof.citizen_yes_votes} citizens confirmed resolution
                  </div>
                )}
              </div>
            )}

            {/* Comments — fixed with null safety */}
            <div className="card">
              <h5 style={{ marginBottom: 'var(--space-md)' }}>
                <MessageCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                Comments ({comments.length})
              </h5>

              {comments.length === 0 && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', padding: 'var(--space-md) 0' }}>
                  No comments yet. Be the first to comment!
                </p>
              )}

              {comments.map(comment => {
                const commentUser = getUserById(comment.user);
                return (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      {commentUser?.avatar || '??'}
                    </div>
                    <div className="comment-body">
                      <span className="comment-author">{commentUser?.name || 'Unknown'}</span>
                      <span className="comment-time">{timeAgo(comment.time)}</span>
                      <div className="comment-text">{comment.text}</div>
                    </div>
                  </div>
                );
              })}

              {/* Add comment */}
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                />
                <button className="btn btn-primary" onClick={handleComment} disabled={!commentText.trim()}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Vote */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
              <button
                className={`vote-btn ${hasVoted ? 'voted' : ''}`}
                onClick={handleVote}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ThumbsUp size={18} />
                {hasVoted ? 'Supported' : 'Support this issue'}
                <span style={{ fontWeight: 800 }}>{freshIssue.votes}</span>
              </button>
            </div>

            {/* SLA Timer */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
              <h6 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-tertiary)' }}>SLA Deadline</h6>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SLATimer deadline={freshIssue.sla_deadline} size={100} />
              </div>
              {new Date(freshIssue.sla_deadline) < new Date() && !['resolved', 'verified'].includes(freshIssue.status) && (
                <div style={{
                  marginTop: 'var(--space-md)',
                  padding: 'var(--space-sm)',
                  background: 'var(--danger-bg)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--danger-light)',
                  fontWeight: 600,
                }}>
                  <AlertTriangle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  SLA BREACHED
                </div>
              )}
            </div>

            {/* Details */}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h6 style={{ marginBottom: 'var(--space-md)', color: 'var(--text-tertiary)' }}>Details</h6>
              <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Department</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>🏢 {department?.name || 'Unassigned'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Ward</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>📍 {locality?.name || 'Unknown'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Priority Score</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: freshIssue.priority_score > 80 ? 'var(--danger)' : freshIssue.priority_score > 50 ? 'var(--warning)' : 'var(--success)' }}>
                    {freshIssue.priority_score}/100
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Issue ID</div>
                  <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{freshIssue.id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}
