import { useState, useMemo } from 'react';

import { Activity, Mail, Phone, Eye, EyeOff, ArrowRight, Shield, User, Settings } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { detectRoleFromEmail, getRoleLabel, getRoleIcon } from '../lib/supabase';
import PageTransition from '../components/PageTransition';

const ROLES = [
  { id: 'citizen', label: 'Citizen', icon: '👤', desc: 'Report and track issues in your community', color: 'var(--primary)' },
  { id: 'sub_admin', label: 'Sub-Admin', icon: '🛡️', desc: 'Manage and moderate ward-level issues', color: 'var(--warning)' },
  { id: 'admin', label: 'Admin', icon: '⚙️', desc: 'City-wide administration and analytics', color: 'var(--accent)' },
];

export default function Auth() {
  const { signUp, signIn, signInWithPhone, verifyPhoneOTP, error, clearError, isDemoMode } = useAuth();

  const [mode, setMode] = useState('signin'); // signin | signup
  const [method, setMethod] = useState('email'); // email | phone
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Auto-detect role from email
  const detectedRole = useMemo(() => {
    if (!email || email.length < 3) return null;
    return detectRoleFromEmail(email);
  }, [email]);

  // Effective role: manual selection overrides auto-detection
  const effectiveRole = selectedRole || detectedRole || 'citizen';

  async function handleEmailSubmit(e) {
    e.preventDefault();
    clearError();
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, effectiveRole);
        // PublicRoute will auto-redirect on isAuthenticated change
      } else {
        await signIn(email, password);
        // PublicRoute will auto-redirect on isAuthenticated change
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePhoneSendOTP(e) {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      const { error: err } = await signInWithPhone(phone);
      if (!err) setOtpSent(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePhoneVerifyOTP(e) {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      await verifyPhoneOTP(phone, otp);
      // PublicRoute will auto-redirect on isAuthenticated change
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageTransition>
      <div className="auth-page">
      <div className="auth-card animate-fade-in">
        {/* Logo */}
        <div className="auth-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
            <Activity size={28} color="var(--primary)" />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--primary)' }}>
              CivicPulse
            </span>
          </div>
          <h2>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p>{mode === 'signin' ? 'Sign in to continue to your dashboard' : 'Join your community\'s civic platform'}</p>

          {isDemoMode && (
            <div style={{
              marginTop: 'var(--space-md)',
              padding: '8px 12px',
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-xs)',
              color: 'var(--warning)',
              fontWeight: 600,
            }}>
              🎮 Demo Mode — no Supabase credentials. Use any email/password.
            </div>
          )}
        </div>

        {/* Sign In / Sign Up tabs */}
        <div className="tabs" style={{ width: '100%', marginBottom: 'var(--space-lg)' }}>
          <button className={`tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => { setMode('signin'); clearError(); }} style={{ flex: 1 }}>
            Sign In
          </button>
          <button className={`tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); clearError(); }} style={{ flex: 1 }}>
            Sign Up
          </button>
        </div>

        {/* Method toggle */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
          <button
            className={`btn btn-sm ${method === 'email' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMethod('email')}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Mail size={14} /> Email
          </button>
          <button
            className={`btn btn-sm ${method === 'phone' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setMethod('phone')}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Phone size={14} /> Phone
          </button>
        </div>

        {/* Email form */}
        {method === 'email' && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {/* Role detection badge */}
              {email.length > 3 && detectedRole && (
                <div className={`role-badge-indicator role-badge-${detectedRole === 'sub_admin' ? 'subadmin' : detectedRole}`}>
                  {getRoleIcon(detectedRole)} Auto-detected: <strong>{getRoleLabel(detectedRole)}</strong>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '4px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Manual role selector (toggle) */}
            {mode === 'signup' && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-xs)', width: '100%', justifyContent: 'center' }}
                >
                  {showRoleSelector ? 'Hide role selector' : 'Choose role manually'} ▾
                </button>

                {showRoleSelector && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                    {ROLES.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-md)',
                          padding: 'var(--space-md)',
                          border: `2px solid ${effectiveRole === r.id ? r.color : 'var(--border)'}`,
                          borderRadius: 'var(--radius-lg)',
                          background: effectiveRole === r.id ? `${r.color}08` : 'var(--bg-primary)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>{r.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{r.label}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{r.desc}</div>
                        </div>
                        {effectiveRole === r.id && (
                          <div style={{ marginLeft: 'auto', color: r.color }}>✓</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {error && (
              <div style={{
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                marginBottom: 'var(--space-md)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={submitting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {submitting ? (
                <div className="loading-spinner" style={{ width: 16, height: 16 }} />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Phone form */}
        {method === 'phone' && (
          <>
            {!otpSent ? (
              <form onSubmit={handlePhoneSendOTP}>
                <div className="form-group">
                  <label className="form-label">Phone number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                  <div className="form-hint">Include country code (e.g., +91)</div>
                </div>

                {error && (
                  <div style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    background: 'var(--danger-bg)',
                    border: '1px solid var(--danger-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--danger)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    marginBottom: 'var(--space-md)',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submitting ? <div className="loading-spinner" style={{ width: 16, height: 16 }} /> : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneVerifyOTP}>
                <div className="form-group">
                  <label className="form-label">Verification code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: 'var(--text-xl)', fontWeight: 700 }}
                  />
                  <div className="form-hint">Enter the 6-digit code sent to {phone}</div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submitting ? <div className="loading-spinner" style={{ width: 16, height: 16 }} /> : 'Verify & Sign In'}
                </button>

                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setOtpSent(false); setOtp(''); }}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-sm)' }}
                >
                  Change number
                </button>
              </form>
            )}
          </>
        )}

        {/* Divider */}
        <div className="auth-divider">or</div>

        {/* Google button (UI only) */}
        <button className="auth-social-btn" type="button" onClick={() => alert('Google auth will be wired in production.')}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {mode === 'signin' ? (
            <span>Don't have an account? <button type="button" onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs)' }}>Sign up</button></span>
          ) : (
            <span>Already have an account? <button type="button" onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 'var(--text-xs)' }}>Sign in</button></span>
          )}
        </div>
        </div>
      </div>
    </PageTransition>
  );
}
