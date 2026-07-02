import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, MessageCircle, Clock } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { getUserById } from '../data/store';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function statusClass(status) {
  const map = {
    open: 'badge-open',
    acknowledged: 'badge-acknowledged',
    in_progress: 'badge-in-progress',
    resolved: 'badge-resolved',
    verified: 'badge-verified',
    escalated: 'badge-escalated',
  };
  return map[status] || 'badge-open';
}

function statusLabel(status) {
  const map = {
    open: 'Open',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    verified: 'Verified',
    escalated: 'Escalated',
  };
  return map[status] || status;
}

function priorityClass(severity) {
  return `priority-${severity || 'medium'}`;
}

export default function IssueCard({ issue }) {
  const category = CATEGORIES.find(c => c.id === issue.category);

  return (
    <Link to={`/issue/${issue.id}`} className="issue-card">
      <div className={`priority-bar ${priorityClass(issue.severity)}`} style={{ alignSelf: 'stretch' }} />
      <div className="issue-card-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span className={`badge ${statusClass(issue.status)}`}>
            {statusLabel(issue.status)}
          </span>
          {category && (
            <span className="issue-card-category">
              {category.icon} {category.label}
            </span>
          )}
        </div>
        <div className="issue-card-title">{issue.title}</div>
        <div className="issue-card-location">
          <MapPin size={12} />
          {issue.location?.address || 'Unknown location'}
        </div>
        <div className="issue-card-meta">
          <span className="issue-card-meta-item">
            <ThumbsUp size={12} /> {issue.votes}
          </span>
          <span className="issue-card-meta-item">
            <MessageCircle size={12} /> {issue.comments?.length || 0}
          </span>
          <span className="issue-card-meta-item">
            <Clock size={12} /> {timeAgo(issue.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export { timeAgo, statusClass, statusLabel };
