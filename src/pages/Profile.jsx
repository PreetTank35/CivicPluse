import { useState, useEffect } from 'react';
import { User, Award, Flame, Star, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getUserById, getAllLocalities } from '../data/store';
import { BADGES_CATALOG, LEVELS } from '../data/mockData';
import PageTransition from '../components/PageTransition';

export default function Profile() {
  const { user: authUser, role } = useAuth();
  const [profile, setProfile] = useState(null);
  const localities = getAllLocalities();

  useEffect(() => {
    // Merge auth context user with mock database user and provide safe defaults
    const dbUser = getUserById(authUser?.id) || getUserById('user-1') || {};
    const normalized = {
      ...dbUser,
      points: dbUser.points ?? dbUser.impact_score ?? 450,
      badges: Array.isArray(dbUser.badges) ? dbUser.badges : ['first_report', 'supporter_10', 'resolved_5'],
      streak: dbUser.streak ?? 7,
      locality: dbUser.locality ?? dbUser.locality_id ?? 'kothrud',
      avatar: dbUser.avatar || dbUser.name?.substring(0, 2)?.toUpperCase() || 'C',
    };
    setProfile(normalized);
  }, [authUser]);

  if (!profile) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading profile...</div>;

  const currentLevel = LEVELS.slice().reverse().find(l => profile.points >= (l.minScore ?? l.minPts ?? 0)) || LEVELS[0] || { level: 1, title: 'Observer', icon: '🌱', minScore: 0 };
  const nextLevel = LEVELS.find(l => (l.minScore ?? l.minPts ?? 0) > profile.points);
  
  const curMin = currentLevel.minScore ?? currentLevel.minPts ?? 0;
  const nextMin = nextLevel ? (nextLevel.minScore ?? nextLevel.minPts ?? 1000) : curMin + 500;

  const progressPercent = nextLevel 
    ? Math.min(Math.max(((profile.points - curMin) / (nextMin - curMin)) * 100, 0), 100)
    : 100;

  const userBadges = (BADGES_CATALOG || []).filter(b => profile.badges.includes(b.id));
  const localityName = localities.find(l => l.id === profile.locality)?.name || profile.locality || 'Pune';

  return (
    <PageTransition>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: 'var(--space-2xl)' }}>
      {/* Header Profile Card */}
      <div className="card" style={{ 
        marginBottom: 'var(--space-lg)', 
        background: 'linear-gradient(135deg, var(--primary-bg), var(--bg-primary))',
        border: '1px solid var(--primary-light)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: 700,
            boxShadow: '0 4px 12px rgba(8, 145, 178, 0.2)'
          }}>
            {profile.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 'var(--text-xl)', marginBottom: '4px' }}>{profile.name}</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{profile.email}</span> • <span>{localityName}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm"><Settings size={18} /></button>
        </div>

        {/* Gamification Stats */}
        <div className="grid-3" style={{ gap: 'var(--space-md)' }}>
          <div style={{ background: 'var(--bg-primary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-2xl)', marginBottom: '4px' }}>{currentLevel.icon || '🌱'}</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{currentLevel.title || currentLevel.name || 'Observer'}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Current Level</div>
          </div>
          
          <div style={{ background: 'var(--bg-primary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--accent)', marginBottom: '4px' }}><Star size={24} style={{ margin: '0 auto' }} /></div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{profile.points}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Points</div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ color: 'var(--danger)', marginBottom: '4px' }}><Flame size={24} style={{ margin: '0 auto' }} /></div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{profile.streak} Days</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Active Streak</div>
          </div>
        </div>

        {/* Progress to next level */}
        {nextLevel && (
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '8px', fontWeight: 600 }}>
              <span>Level {currentLevel.level || 1}</span>
              <span style={{ color: 'var(--text-muted)' }}>{Math.max(nextMin - profile.points, 0)} pts to Level {nextLevel.level || 2}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-value" style={{ width: `${progressPercent}%`, background: 'var(--primary)' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} color="var(--accent)" />
          Earned Badges ({userBadges.length})
        </h2>
        
        {userBadges.length > 0 ? (
          <div className="grid-3" style={{ gap: 'var(--space-md)' }}>
            {userBadges.map(badge => (
              <div key={badge.id} style={{ 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--space-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: 'var(--bg-secondary)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{badge.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: badge.color, marginBottom: '4px' }}>{badge.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{badge.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            No badges earned yet. Start reporting and verifying issues!
          </div>
        )}
      </div>

      {/* Settings Options */}
      <div className="card">
        <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Preferences</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {['Notifications', 'Privacy & Security', 'Language Settings', 'Help & Support'].map((item, idx) => (
            <button key={item} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: 'var(--space-md) 0',
              borderBottom: idx < 3 ? '1px solid var(--border)' : 'none',
              background: 'none',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontWeight: 600
            }}>
              {item}
              <ChevronRight size={18} color="var(--text-muted)" />
            </button>
          ))}
        </div>
        </div>
      </div>
    </PageTransition>
  );
}
