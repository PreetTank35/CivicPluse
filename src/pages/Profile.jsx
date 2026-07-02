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
    // Merge auth context user with mock database user
    const dbUser = getUserById(authUser?.id) || getUserById('user-1');
    setProfile(dbUser);
  }, [authUser]);

  if (!profile) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading profile...</div>;

  const currentLevel = LEVELS.slice().reverse().find(l => profile.points >= l.minScore) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minScore > profile.points);
  
  const progressPercent = nextLevel 
    ? ((profile.points - currentLevel.minScore) / (nextLevel.minScore - currentLevel.minScore)) * 100
    : 100;

  const userBadges = BADGES_CATALOG.filter(b => profile.badges.includes(b.id));
  const localityName = localities.find(l => l.id === profile.locality)?.name || 'Pune';

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
            <div style={{ fontSize: 'var(--text-2xl)', marginBottom: '4px' }}>{currentLevel.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{currentLevel.title}</div>
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
              <span>Level {currentLevel.level}</span>
              <span style={{ color: 'var(--text-muted)' }}>{nextLevel.minScore - profile.points} pts to Level {nextLevel.level}</span>
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
