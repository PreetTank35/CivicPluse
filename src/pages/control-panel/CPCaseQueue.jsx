import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowUpRight, GitMerge, Filter, Search, MapPin, Heart, Clock } from 'lucide-react';
import { getAllProblems, updateProblemStatus, escalateProblem, mergeDuplicate, getDepartmentForCategory, generateEscalationPayload, events } from '../../data/store';
import { CATEGORIES, STATUSES } from '../../data/mockData';
import { useAuth } from '../../lib/AuthContext';

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/**
 * CPCaseQueue — Table of incoming problems with verify/reject/escalate actions.
 * Auto-filtered for moderators to their assigned locality.
 */
export default function CPCaseQueue() {
  const { role, assignedLocalityId } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('support'); // 'support' | 'recent'
  const [escalationPreview, setEscalationPreview] = useState(null);

  useEffect(() => {
    loadProblems();
    const unsub1 = events.on('problemCreated', loadProblems);
    const unsub2 = events.on('problemUpdated', loadProblems);
    return () => { unsub1(); unsub2(); };
  }, []);

  function loadProblems() {
    let all = getAllProblems();
    // Auto-filter for moderators
    if (role === 'moderator' && assignedLocalityId) {
      all = all.filter(p => p.locality_id === assignedLocalityId);
    }
    setProblems(all);
  }

  const filtered = useMemo(() => {
    let result = [...problems];
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter(p => p.category === categoryFilter);
    if (search) result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    result.sort((a, b) => {
      if (sortBy === 'support') return b.support_count - a.support_count;
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return result;
  }, [problems, statusFilter, categoryFilter, search, sortBy]);

  function handleVerify(id) {
    updateProblemStatus(id, 'verified', 'Verified by moderator');
    loadProblems();
  }

  function handleReject(id) {
    updateProblemStatus(id, 'rejected', 'Rejected by moderator — does not meet criteria');
    loadProblems();
  }

  function handleEscalate(problem) {
    const dept = getDepartmentForCategory(problem.category);
    if (dept) {
      const payload = generateEscalationPayload(problem);
      setEscalationPreview({ problem, department: dept, payload });
    } else {
      // No department found, escalate without dept
      updateProblemStatus(problem.id, 'escalated', 'Escalated — no mapped department');
      loadProblems();
    }
  }

  function confirmEscalation() {
    if (!escalationPreview) return;
    escalateProblem(escalationPreview.problem.id, escalationPreview.department.id);
    setEscalationPreview(null);
    loadProblems();
  }

  return (
    <div className="cp-page">
      <div className="cp-page-header">
        <div>
          <h2 className="cp-page-title">Case Queue</h2>
          <p className="cp-page-subtitle">
            {role === 'moderator' ? `Showing cases in ${assignedLocalityId}` : 'All localities'}
            {' — '}{filtered.length} cases
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="cp-filters-bar">
        <div className="cp-search-wrap">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="cp-search-input"
          />
        </div>

        <select className="cp-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>

        <select className="cp-filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>

        <div className="cp-sort-btns">
          <button className={`cp-sort-btn ${sortBy === 'support' ? 'active' : ''}`} onClick={() => setSortBy('support')}>
            <Heart size={12} /> Support
          </button>
          <button className={`cp-sort-btn ${sortBy === 'recent' ? 'active' : ''}`} onClick={() => setSortBy('recent')}>
            <Clock size={12} /> Recent
          </button>
        </div>
      </div>

      {/* Cases Table */}
      <div className="cp-table-wrap">
        <table className="cp-table">
          <thead>
            <tr>
              <th>Problem</th>
              <th>Category</th>
              <th>Locality</th>
              <th>Support</th>
              <th>Status</th>
              <th>Reported</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(problem => {
              const cat = CATEGORIES.find(c => c.id === problem.category);
              const status = STATUSES.find(s => s.id === problem.status);
              return (
                <tr key={problem.id}>
                  <td>
                    <div className="cp-case-title" onClick={() => navigate(`/problem/${problem.id}`)}>
                      {problem.title}
                    </div>
                  </td>
                  <td>
                    <span className="cp-category-badge">{cat?.icon} {cat?.label}</span>
                  </td>
                  <td>
                    <span className="cp-locality-tag"><MapPin size={10} /> {problem.locality_id}</span>
                  </td>
                  <td>
                    <span className="cp-support-count">{problem.support_count}</span>
                  </td>
                  <td>
                    <span className="cp-status-badge" style={{ '--status-color': status?.color }}>
                      {status?.label}
                    </span>
                  </td>
                  <td className="cp-time-cell">{timeAgo(problem.created_at)}</td>
                  <td>
                    <div className="cp-action-btns">
                      {problem.status === 'reported' && (
                        <>
                          <button className="cp-action-btn verify" onClick={() => handleVerify(problem.id)} title="Verify">
                            <CheckCircle size={14} />
                          </button>
                          <button className="cp-action-btn reject" onClick={() => handleReject(problem.id)} title="Reject">
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {['reported', 'verified'].includes(problem.status) && (
                        <button className="cp-action-btn escalate" onClick={() => handleEscalate(problem)} title="Escalate">
                          <ArrowUpRight size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="cp-empty">
            <CheckCircle size={32} style={{ opacity: 0.5 }} />
            <p>No cases matching your filters</p>
          </div>
        )}
      </div>

      {/* Escalation Preview Modal */}
      {escalationPreview && (
        <div className="cp-modal-overlay" onClick={() => setEscalationPreview(null)}>
          <div className="cp-modal" onClick={e => e.stopPropagation()}>
            <h3 className="cp-modal-title">📤 Escalation Preview</h3>
            <p className="cp-modal-desc">Review the complaint payload before sending to <strong>{escalationPreview.department.name}</strong>:</p>

            <div className="cp-escalation-payload">
              <div className="cp-payload-row"><span>Problem:</span> <strong>{escalationPreview.payload.title}</strong></div>
              <div className="cp-payload-row"><span>Category:</span> {escalationPreview.payload.category.label}</div>
              <div className="cp-payload-row"><span>Location:</span> {escalationPreview.payload.location.address}, {escalationPreview.payload.location.locality} ({escalationPreview.payload.location.ward})</div>
              <div className="cp-payload-row"><span>Supporters:</span> {escalationPreview.payload.evidence.support_count}</div>
              <div className="cp-payload-row"><span>Evidence:</span> {escalationPreview.payload.evidence.media_urls.length} media files</div>
              <div className="cp-payload-row"><span>Department:</span> {escalationPreview.department.name}</div>
              <div className="cp-payload-row"><span>Contact:</span> {escalationPreview.department.contact_email}</div>
            </div>

            <div className="cp-modal-actions">
              <button className="btn btn-secondary" onClick={() => setEscalationPreview(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmEscalation}>
                <ArrowUpRight size={14} /> Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
