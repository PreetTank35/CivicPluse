import { useState, useMemo } from 'react';
import { Scale, TrendingUp, AlertTriangle, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';
import { getAllLocalities } from '../data/store';
import { LOCALITY_EQUITY_DATA } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import PageTransition from '../components/PageTransition';

export default function EquityDashboard() {
  const localities = getAllLocalities();

  const localityData = useMemo(() => {
    return LOCALITY_EQUITY_DATA.map(eq => {
      const loc = localities.find(l => l.id === eq.locality);
      return { ...eq, localityName: loc?.name || eq.locality };
    }).sort((a, b) => a.equityScore - b.equityScore);
  }, [localities]);

  // Underserved = equity score < 60
  const underserved = localityData.filter(w => w.equityScore < 60);
  const avgEquity = Math.round(localityData.reduce((s, w) => s + w.equityScore, 0) / localityData.length);

  // Radar chart for selected locality (lowest equity)
  const lowestLocality = localityData[0];
  const radarData = [
    { subject: 'Resolution Speed', A: lowestLocality?.resolvedRate * 100 || 0, fullMark: 100 },
    { subject: 'Citizen Satisfaction', A: lowestLocality?.satisfactionScore || 0, fullMark: 100 },
    { subject: 'Budget per Capita', A: (lowestLocality?.budgetPerCapita / 2000) * 100 || 0, fullMark: 100 },
    { subject: 'Reporting Rate', A: (lowestLocality?.issuesPerCapita / 0.005) * 100 || 0, fullMark: 100 },
    { subject: 'Overall Equity', A: lowestLocality?.equityScore || 0, fullMark: 100 },
  ];

  // Data for bar charts
  const resolutionData = localityData.map(w => ({
    name: w.localityName.split(' ')[0].trim(),
    hours: w.avgResolutionHours
  })).sort((a, b) => b.hours - a.hours);

  const budgetData = localityData.map(w => ({
    name: w.localityName.split(' ')[0].trim(),
    budget: w.budgetPerCapita
  })).sort((a, b) => a.budget - b.budget);

  return (
    <PageTransition>
      <div className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
        <Scale size={32} color="var(--primary)" />
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: '4px' }}>Equity Analytics</h1>
          <p className="text-muted">Analyzing civic service distribution across Pune localities.</p>
        </div>
      </div>

      <div className="grid-3" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        {/* Alert if underserved localities */}
        {underserved.length > 0 && (
          <div style={{ gridColumn: 'span 3' }}>
            <div style={{
              padding: 'var(--space-lg)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              gap: 'var(--space-lg)',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={32} color="var(--danger)" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ color: 'var(--danger)', marginBottom: 'var(--space-sm)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>
                  Equity Alert: {underserved.length} locality below fairness threshold
                </h3>
                <p style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', lineHeight: 1.6, opacity: 0.9 }}>
                  {underserved.map(w => w.localityName).join(', ')} — scoring below 60/100 on the equity index. 
                  These localities show slower resolution times, lower budgets per capita, and lower citizen satisfaction.
                </p>
                <button className="btn btn-sm" style={{ marginTop: 'var(--space-md)', background: 'var(--danger)', color: 'white' }}>
                  Investigate Disparities
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="card text-center">
          <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--primary)', marginBottom: 'var(--space-sm)' }}>
            {avgEquity}
          </div>
          <div style={{ fontWeight: 600 }}>Citywide Equity Score</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Target: &gt; 80</div>
        </div>

        <div className="card text-center">
          <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--danger)', marginBottom: 'var(--space-sm)' }}>
            {underserved.length}
          </div>
          <div style={{ fontWeight: 600 }}>Underserved Localities</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Score &lt; 60</div>
        </div>

        <div className="card text-center">
          <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--success)', marginBottom: 'var(--space-sm)' }}>
            {localityData.filter(w => w.equityScore >= 80).length}
          </div>
          <div style={{ fontWeight: 600 }}>Equitable Localities</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Score &gt;= 80</div>
        </div>

        {/* Detailed Table */}
        <div style={{ gridColumn: 'span 3' }}>
          <div className="card">
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Locality Equity Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                    <th style={{ padding: '10px' }}>Locality</th>
                    <th style={{ padding: '10px' }}>Equity Score</th>
                    <th style={{ padding: '10px' }}>Avg Resolution (Hrs)</th>
                    <th style={{ padding: '10px' }}>Budget per Capita (₹)</th>
                    <th style={{ padding: '10px' }}>Satisfaction</th>
                  </tr>
                </thead>
                <tbody>
                  {localityData.map((w, idx) => (
                    <tr key={w.locality} style={{ borderBottom: '1px solid var(--border-light)', background: w.equityScore < 60 ? 'var(--danger-bg)' : 'transparent' }}>
                      <td style={{ padding: '10px', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{w.localityName}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: w.equityScore < 60 ? 'var(--danger)' : w.equityScore < 80 ? 'var(--warning)' : 'var(--success)',
                          color: 'white'
                        }}>
                          {w.equityScore}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontSize: 'var(--text-sm)', color: w.avgResolutionHours > 48 ? 'var(--danger)' : 'inherit' }}>
                        {w.avgResolutionHours}h
                      </td>
                      <td style={{ padding: '10px', fontSize: 'var(--text-sm)' }}>₹{w.budgetPerCapita}</td>
                      <td style={{ padding: '10px', fontSize: 'var(--text-sm)' }}>{w.satisfactionScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Resolution Time Disparity Chart */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card">
            <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="var(--primary)" />
              Resolution Time Disparity (Hours)
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--bg-secondary)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {resolutionData.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={entry.hours > 48 ? 'var(--danger)' : 'var(--primary)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
              *Localities exceeding 48 hours average resolution time are marked in red.
            </p>
          </div>
        </div>

        {/* Radar chart for underserved locality */}
        <div style={{ gridColumn: 'span 1' }}>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-base)' }}>
              Equity Profile: {lowestLocality?.localityName}
            </h3>
            <div style={{ flex: 1, minHeight: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={lowestLocality?.localityName} dataKey="A" stroke="var(--danger)" fill="var(--danger)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ padding: 'var(--space-sm)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: 'var(--danger)' }} />
              Most civic platforms treat all localities equally in reporting, but service delivery is often inequitable.
            </div>
          </div>
        </div>
        </div>
      </div>
    </PageTransition>
  );
}
