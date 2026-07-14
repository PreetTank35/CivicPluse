import { useMemo } from 'react';
import { BarChart3, AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import { DonutChart, BarChartComponent, LineChartComponent } from '../../components/Charts';
import { getDashboardStats, getAllProblems } from '../../data/store';
import { MONTHLY_TRENDS, DEPT_PERFORMANCE } from '../../data/mockData';
import { useAuth } from '../../lib/AuthContext';

/**
 * CPOverview — Control Panel overview/analytics dashboard.
 * Scoped by role: super_admin sees all, moderator sees their locality only.
 */
export default function CPOverview() {
  const { role, assignedLocalityId } = useAuth();
  const localityFilter = role === 'moderator' ? assignedLocalityId : null;
  const stats = getDashboardStats(localityFilter);

  const scopeLabel = role === 'moderator'
    ? `${assignedLocalityId || 'Your Locality'}`
    : 'Platform-wide';

  const deptSLAData = useMemo(() => {
    return DEPT_PERFORMANCE.map(d => ({
      name: d.name,
      'Breach Rate': d.slaBreachRate,
    }));
  }, []);

  return (
    <div className="cp-page">
      <div className="cp-page-header">
        <div>
          <h2 className="cp-page-title">Overview</h2>
          <p className="cp-page-subtitle">{scopeLabel} analytics and metrics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="cp-stats-grid">
        <StatsCard value={stats.totalOpen} label="Open Cases" icon={AlertCircle} variant="warning" />
        <StatsCard value={stats.totalResolved} label="Resolved" icon={CheckCircle} variant="success" />
        <StatsCard value={stats.totalEscalated} label="Escalated" icon={TrendingUp} variant="danger" />
        <StatsCard value={`${stats.resolutionRate}%`} label="Resolution Rate" icon={BarChart3} variant="primary" />
      </div>

      {/* Charts */}
      <div className="cp-charts-row">
        <div className="cp-chart-card">
          <div className="cp-chart-title">Cases by Category</div>
          <DonutChart data={stats.categoryBreakdown} height={280} />
        </div>
        <div className="cp-chart-card">
          <div className="cp-chart-title">Department SLA Breach Rate</div>
          <BarChartComponent data={deptSLAData} dataKey="Breach Rate" height={280} color="#ef4444" />
        </div>
      </div>

      {/* Trends */}
      <div className="cp-chart-card" style={{ marginTop: '20px' }}>
        <div className="cp-chart-title">Issue Trends (6 Months)</div>
        <LineChartComponent
          data={MONTHLY_TRENDS}
          lines={[
            { key: 'reported', name: 'Reported' },
            { key: 'resolved', name: 'Resolved' },
          ]}
          height={300}
        />
      </div>
    </div>
  );
}
