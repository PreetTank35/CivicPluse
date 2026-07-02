import { useMemo } from 'react';
import { AlertCircle, Clock, AlertTriangle, ThumbsUp, Shield, FileText, Users, Settings } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { DonutChart, BarChartComponent, LineChartComponent } from '../components/Charts';
import { getAllIssues, getDashboardStats } from '../data/store';
import { CATEGORIES, MONTHLY_TRENDS, DEPT_PERFORMANCE } from '../data/mockData';
import IssueCard from '../components/IssueCard';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../lib/AuthContext';

// Mock audit log data
const AUDIT_LOG = [
  { id: 'a1', time: new Date(Date.now() - 1800000).toISOString(), actor: 'Commissioner Singh', role: 'admin', action: 'STATUS_OVERRIDE', target: 'Issue #3 — Water main leak', details: 'Escalated to critical priority' },
  { id: 'a2', time: new Date(Date.now() - 3600000).toISOString(), actor: 'Arjun Menon', role: 'sub_admin', action: 'STATUS_CHANGE', target: 'Issue #1 — Large pothole', details: 'Changed to In Progress' },
  { id: 'a3', time: new Date(Date.now() - 7200000).toISOString(), actor: 'System', role: 'system', action: 'AUTO_ESCALATE', target: 'Issue #3 — Water main leak', details: 'SLA deadline exceeded by 18h' },
  { id: 'a4', time: new Date(Date.now() - 14400000).toISOString(), actor: 'Sneha Kulkarni', role: 'sub_admin', action: 'MEDIA_MODERATE', target: 'Issue #4 video', details: 'Approved evidence submission' },
  { id: 'a5', time: new Date(Date.now() - 28800000).toISOString(), actor: 'Commissioner Singh', role: 'admin', action: 'ROLE_CHANGE', target: 'User: Arjun Menon', details: 'Assigned sub_admin for Kothrud ward' },
  { id: 'a6', time: new Date(Date.now() - 43200000).toISOString(), actor: 'System', role: 'system', action: 'SLA_WARNING', target: 'Issue #2 — Streetlight out', details: 'Approaching SLA deadline in 6h' },
];

const RBAC_MATRIX = [
  { permission: 'View Issues', citizen: true, sub_admin: true, admin: true },
  { permission: 'Report Issues', citizen: true, sub_admin: true, admin: true },
  { permission: 'Vote on Issues', citizen: true, sub_admin: true, admin: true },
  { permission: 'Comment on Issues', citizen: true, sub_admin: true, admin: true },
  { permission: 'Change Issue Status', citizen: false, sub_admin: true, admin: true },
  { permission: 'Moderate Media Content', citizen: false, sub_admin: true, admin: true },
  { permission: 'Ward-Level Analytics', citizen: false, sub_admin: true, admin: true },
  { permission: 'City-Wide Analytics', citizen: false, sub_admin: false, admin: true },
  { permission: 'SLA Override / Escalation', citizen: false, sub_admin: false, admin: true },
  { permission: 'User Role Management', citizen: false, sub_admin: false, admin: true },
  { permission: 'Audit Log Access', citizen: false, sub_admin: false, admin: true },
  { permission: 'Equity Dashboard', citizen: false, sub_admin: false, admin: true },
  { permission: 'Delete Issues', citizen: false, sub_admin: false, admin: true },
  { permission: 'System Settings', citizen: false, sub_admin: false, admin: true },
];

function formatAuditTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60000) return 'just now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
  return `${Math.floor(diffMs / 86400000)}d ago`;
}

const ACTION_STYLES = {
  STATUS_OVERRIDE: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Override' },
  STATUS_CHANGE: { bg: 'var(--primary-bg)', color: 'var(--primary)', label: 'Status' },
  AUTO_ESCALATE: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Escalate' },
  MEDIA_MODERATE: { bg: 'var(--accent-bg)', color: 'var(--accent)', label: 'Moderate' },
  ROLE_CHANGE: { bg: 'var(--info-bg)', color: 'var(--info)', label: 'RBAC' },
  SLA_WARNING: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'SLA' },
};

export default function AdminDashboard() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const stats = getDashboardStats();
  const issues = getAllIssues();

  const categoryData = useMemo(() => {
    const counts = {};
    issues.forEach(i => {
      const cat = CATEGORIES.find(c => c.id === i.category);
      const label = cat?.label || i.category;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [issues]);

  const deptSLAData = useMemo(() => {
    return DEPT_PERFORMANCE.map(d => ({
      name: d.name,
      'Breach Rate': d.slaBreachRate,
    }));
  }, []);

  const escalatedIssues = useMemo(() => {
    return issues
      .filter(i => i.status === 'escalated' || (i.sla_deadline && new Date(i.sla_deadline) < new Date() && !['resolved', 'verified'].includes(i.status)))
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 5);
  }, [issues]);

  return (
    <PageTransition>
      <div className="container page-content">
        <div className="section-header">
          <h2 className="section-title">{isAdmin ? 'Admin' : 'Sub-Admin'} Dashboard</h2>
          <p className="section-subtitle">
            {isAdmin ? 'City-wide overview of civic issue management' : 'Ward-level issue triage and management'}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="animate-fade-in stagger-1">
            <StatsCard value={stats.totalOpen} label="Open Issues" icon={AlertCircle} variant="warning" trend={12} trendLabel="vs last month" />
          </div>
          <div className="animate-fade-in stagger-2">
            <StatsCard value={stats.totalResolved} label="Resolved" icon={ThumbsUp} variant="success" trend={8} />
          </div>
          <div className="animate-fade-in stagger-3">
            <StatsCard value={stats.slaBreachRate} label="SLA Breach Rate" icon={AlertTriangle} variant="danger" trend={-5} trendLabel="improved" />
          </div>
          <div className="animate-fade-in stagger-4">
            <StatsCard value={stats.citizenSatisfaction} label="Citizen Satisfaction" icon={Clock} variant="primary" trend={3} />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="chart-card animate-fade-in stagger-2">
            <div className="chart-title">Issues by Category</div>
            <DonutChart data={categoryData} height={280} />
          </div>
          <div className="chart-card animate-fade-in stagger-3">
            <div className="chart-title">SLA Breach Rate by Department</div>
            <BarChartComponent data={deptSLAData} dataKey="Breach Rate" height={280} color="#ef4444" />
          </div>
        </div>

        {/* Trends */}
        <div className="chart-card animate-fade-in" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="chart-title">Issue Trends (6 Months)</div>
          <LineChartComponent
            data={MONTHLY_TRENDS}
            lines={[
              { key: 'reported', name: 'Reported' },
              { key: 'resolved', name: 'Resolved' },
            ]}
            height={300}
          />
        </div>

        {/* Department Performance Table */}
        <div className="card animate-fade-in" style={{ marginBottom: 'var(--space-xl)', overflowX: 'auto' }}>
          <h5 style={{ marginBottom: 'var(--space-md)' }}>Department Performance</h5>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Department</th>
                <th style={{ padding: '10px', textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '10px', textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Resolved</th>
                <th style={{ padding: '10px', textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Avg Hours</th>
                <th style={{ padding: '10px', textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>SLA Breach</th>
              </tr>
            </thead>
            <tbody>
              {DEPT_PERFORMANCE.map((dept, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '10px', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{dept.name}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: 'var(--text-sm)' }}>{dept.totalIssues}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--success)' }}>{dept.resolved}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: 'var(--text-sm)' }}>{dept.avgHours}h</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <span style={{
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      color: dept.slaBreachRate > 25 ? 'var(--danger)' : dept.slaBreachRate > 15 ? 'var(--warning)' : 'var(--success)',
                    }}>
                      {dept.slaBreachRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Escalated / At-Risk Issues */}
        <div className="card animate-fade-in" style={{ marginBottom: 'var(--space-xl)' }}>
          <h5 style={{ marginBottom: 'var(--space-md)', color: 'var(--danger-light)' }}>
            <AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            Escalated & SLA-Breached Issues
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {escalatedIssues.length > 0 ? (
              escalatedIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))
            ) : (
              <div className="empty-state">
                <p>No escalated issues — all departments are on track! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* ═══ AUDIT LOG (Admin only) ═══ */}
        {isAdmin && (
          <div className="card animate-fade-in" style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} color="var(--accent)" /> System Audit Log
              </h5>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Last 24 hours</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {AUDIT_LOG.map(entry => {
                const actionStyle = ACTION_STYLES[entry.action] || ACTION_STYLES.STATUS_CHANGE;
                return (
                  <div key={entry.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    transition: 'background var(--transition-fast)',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-md)',
                      background: actionStyle.bg,
                      color: actionStyle.color,
                      fontSize: '10px',
                      fontWeight: 700,
                      flexShrink: 0,
                      minWidth: '64px',
                      textAlign: 'center',
                    }}>
                      {actionStyle.label}
                    </span>
                    <span style={{ fontWeight: 600, flexShrink: 0 }}>{entry.actor}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      {entry.role === 'system' ? '⚡' : entry.role === 'admin' ? '⚙️' : '🛡️'}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.target} — {entry.details}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatAuditTime(entry.time)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ RBAC PERMISSIONS MATRIX (Admin only) ═══ */}
        {isAdmin && (
          <div className="card animate-fade-in" style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
              <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} color="var(--primary)" /> Role-Based Access Control
              </h5>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--text-xs)' }}>
                <Settings size={12} /> Manage Roles
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Permission</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--primary)' }}>👤 Citizen</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--warning)' }}>🛡️ Sub-Admin</th>
                  <th style={{ padding: '10px', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)' }}>⚙️ Admin</th>
                </tr>
              </thead>
              <tbody>
                {RBAC_MATRIX.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '8px 10px', fontSize: 'var(--text-sm)' }}>{row.permission}</td>
                    {['citizen', 'sub_admin', 'admin'].map(role => (
                      <td key={role} style={{ padding: '8px 10px', textAlign: 'center' }}>
                        {row[role] ? (
                          <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>✓</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
