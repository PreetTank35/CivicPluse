import { useState, useEffect } from 'react';
import { Trophy, Target, Star, Flame, Medal } from 'lucide-react';
import { getAllUsers } from '../data/store';
import { WEEKLY_CHALLENGES, LEVELS } from '../data/mockData';
import PageTransition from '../components/PageTransition';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // Sort citizens by points descending
    const citizens = getAllUsers()
      .filter(u => u.role === 'citizen')
      .sort((a, b) => b.points - a.points);
    setUsers(citizens);
  }, []);

  const getLevelIcon = (points) => {
    const level = LEVELS.slice().reverse().find(l => points >= l.minScore) || LEVELS[0];
    return level.icon;
  };

  return (
    <PageTransition>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: 'var(--space-2xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-lg)' }}>
        <Trophy size={32} color="var(--accent)" />
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>Community Leaderboard</h1>
      </div>

      <div className="grid-3" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
        {/* Weekly Challenges */}
        <div style={{ gridColumn: 'span 3' }}>
          <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={20} color="var(--primary)" />
              Weekly Challenges
            </h2>
            <div className="grid-3" style={{ gap: 'var(--space-md)' }}>
              {WEEKLY_CHALLENGES.map(challenge => (
                <div key={challenge.id} style={{ 
                  background: 'var(--bg-primary)', 
                  padding: 'var(--space-md)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {challenge.completed && (
                    <div style={{ 
                      position: 'absolute', top: 0, right: 0, 
                      background: 'var(--success)', color: 'white', 
                      fontSize: '10px', fontWeight: 700, 
                      padding: '2px 8px', borderBottomLeftRadius: '8px'
                    }}>
                      DONE
                    </div>
                  )}
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '4px' }}>{challenge.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
                    +{challenge.points} Points
                  </div>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-value" 
                      style={{ 
                        width: `${(challenge.progress / challenge.target) * 100}%`,
                        background: challenge.completed ? 'var(--success)' : 'var(--primary)'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                    {challenge.progress} / {challenge.target}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Podium (Optional extra flair) */}
        {users.length >= 3 && (
          <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'var(--space-md)', height: '200px', marginBottom: 'var(--space-xl)' }}>
            {/* 2nd Place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥈</div>
              <div style={{ background: 'var(--bg-secondary)', width: '100%', height: '80px', borderRadius: '8px 8px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderBottom: 'none' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', textAlign: 'center' }}>{users[1].name.split(' ')[0]}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>{users[1].points} pts</span>
              </div>
            </div>
            
            {/* 1st Place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '140px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
              <div style={{ background: 'var(--primary-bg)', width: '100%', height: '110px', borderRadius: '8px 8px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary-light)', borderBottom: 'none' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--primary)' }}>{users[0].name.split(' ')[0]}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600 }}>{users[0].points} pts</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥉</div>
              <div style={{ background: 'var(--bg-secondary)', width: '100%', height: '60px', borderRadius: '8px 8px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderBottom: 'none' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', textAlign: 'center' }}>{users[2].name.split(' ')[0]}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>{users[2].points} pts</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard List */}
        <div style={{ gridColumn: 'span 3' }}>
          <div className="card">
            <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-md)' }}>Overall Rankings</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--text-xs)', width: '40px' }}>#</th>
                    <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>Citizen</th>
                    <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>Level</th>
                    <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>Badges</th>
                    <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--text-xs)', textAlign: 'right' }}>Streak</th>
                    <th style={{ padding: 'var(--space-sm) 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--text-xs)', textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: 'var(--space-sm) 0', fontWeight: 600, color: 'var(--text-muted)' }}>{idx + 1}</td>
                      <td style={{ padding: 'var(--space-sm) 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                            {user.avatar}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-sm) 0', fontSize: 'var(--text-lg)' }}>
                        {getLevelIcon(user.points)}
                      </td>
                      <td style={{ padding: 'var(--space-sm) 0' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {user.badges.slice(0, 3).map((b, i) => (
                            <span key={i} style={{ fontSize: '14px' }}>
                              {b === 'first-report' ? '🏁' : b === 'watchdog' ? '👁️' : b === 'community-hero' ? '🦸' : b === 'verifier' ? '✅' : '🌟'}
                            </span>
                          ))}
                          {user.badges.length > 3 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>+{user.badges.length - 3}</span>}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-sm) 0', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', color: 'var(--danger)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                          <Flame size={14} /> {user.streak || 0}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-sm) 0', textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                        {user.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
      </div>
    </PageTransition>
  );
}
