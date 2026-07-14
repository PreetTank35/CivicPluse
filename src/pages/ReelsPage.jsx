import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Sparkles, Filter } from 'lucide-react';
import { getAllIssues } from '../data/store';
import ReelsFeed from '../components/ReelsFeed';
import PageTransition from '../components/PageTransition';

export default function ReelsPage() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    setIssues(getAllIssues());
  }, []);

  // Filter issues that have video or photos suitable for reels
  const reelsIssues = issues.filter(i => i.video_url || (i.evidence && i.evidence.length > 0));

  return (
    <PageTransition>
      <div style={{ height: 'calc(100vh - var(--navbar-height))', display: 'flex', flexDirection: 'column', background: '#0B1929', overflow: 'hidden' }}>
        {/* Top header bar */}
        <div style={{
          padding: '12px 24px',
          background: 'rgba(11, 25, 41, 0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Video size={20} color="var(--brand-teal-light)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0, fontFamily: 'var(--font-heading)' }}>
              Civic Reels Feed
            </h2>
            <span style={{ fontSize: '12px', background: 'rgba(13, 148, 136, 0.2)', color: 'var(--brand-teal-200)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              {reelsIssues.length || issues.length} Videos & Reports
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Scroll down for next reel 👇</span>
          </div>
        </div>

        {/* Reels container */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ReelsFeed
            issues={reelsIssues.length > 0 ? reelsIssues : issues}
            onIssueClick={(id) => navigate(`/citizen/issue/${id}`)}
          />
        </div>
      </div>
    </PageTransition>
  );
}
