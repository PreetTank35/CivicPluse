import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Brain, Users, BarChart3, Scale, Accessibility, Zap, MapPin, CheckCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const PILLARS = [
  {
    icon: <Shield size={28} />,
    title: 'Unified Reporting',
    description: 'Submit issues via form, photo, or voice. AI automatically classifies, routes, and detects duplicates.',
    color: '#0891b2',
    bg: 'rgba(8, 145, 178, 0.08)',
  },
  {
    icon: <Brain size={28} />,
    title: 'AI Classification',
    description: 'Real-time category detection, severity assessment, and intelligent department routing powered by AI.',
    color: '#7c3aed',
    bg: 'rgba(124, 58, 237, 0.08)',
  },
  {
    icon: <Users size={28} />,
    title: 'Community Collaboration',
    description: 'Vote, comment, and collaborate on issues. Community-driven verification ensures real resolution.',
    color: '#0d9488',
    bg: 'rgba(13, 148, 136, 0.08)',
  },
  {
    icon: <BarChart3 size={28} />,
    title: 'SLA Accountability',
    description: 'Automated SLA tracking with escalation chains. Every department is held to measurable timelines.',
    color: '#d97706',
    bg: 'rgba(217, 119, 6, 0.08)',
  },
  {
    icon: <Scale size={28} />,
    title: 'Equity Analytics',
    description: 'Ward-level equity dashboards expose disparities in service delivery. Transparency drives fairness.',
    color: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.08)',
  },
  {
    icon: <Accessibility size={28} />,
    title: 'Inclusive Access',
    description: 'Multilingual, voice-enabled, WCAG-compliant. Every citizen can participate regardless of ability.',
    color: '#2563eb',
    bg: 'rgba(37, 99, 235, 0.08)',
  },
];

const STEPS = [
  { step: '01', title: 'Report', desc: 'Submit an issue with location, photos, and description', icon: <MapPin size={24} /> },
  { step: '02', title: 'AI Classifies', desc: 'AI detects category, severity, and routes to the right department', icon: <Brain size={24} /> },
  { step: '03', title: 'Track Progress', desc: 'Real-time SLA tracking with automated escalation on delays', icon: <BarChart3 size={24} /> },
  { step: '04', title: 'Community Verifies', desc: 'Citizens vote to confirm resolution — closing the accountability loop', icon: <CheckCircle size={24} /> },
];

export default function Landing() {
  return (
    <PageTransition>
      <div style={{ background: 'var(--bg-page)' }}>
      {/* Minimal nav for public page */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-md) var(--space-xl)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={24} color="var(--primary)" />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--primary)' }}>
            CivicPulse
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Link to="/auth" className="btn btn-ghost">Sign In</Link>
          <Link to="/auth" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <Zap size={14} />
            AI-Powered Civic Platform
          </div>

          <h1 className="hero-title animate-fade-in stagger-1">
            Report. Track. Resolve.
            <br />
            <span className="gradient-text">Hold Your City Accountable.</span>
          </h1>

          <p className="hero-subtitle animate-fade-in stagger-2">
            CivicPulse is the community-driven platform that closes the loop on civic issues —
            from pothole reports to verified resolutions, with AI classification and SLA enforcement
            that makes accountability visible to every citizen.
          </p>

          <div className="hero-actions animate-fade-in stagger-3">
            <Link to="/auth" className="btn btn-primary btn-lg">
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              Learn More
            </a>
          </div>

          <div className="hero-stats animate-fade-in stagger-4">
            <div>
              <div className="hero-stat-value">500+</div>
              <div className="hero-stat-label">Issues Reported</div>
            </div>
            <div>
              <div className="hero-stat-value">350</div>
              <div className="hero-stat-label">Resolved</div>
            </div>
            <div>
              <div className="hero-stat-value">38h</div>
              <div className="hero-stat-label">Avg Resolution</div>
            </div>
            <div>
              <div className="hero-stat-value">15</div>
              <div className="hero-stat-label">Active Wards</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="section-header text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="section-title">How CivicPulse Works</h2>
          <p className="section-subtitle">Four steps from report to verified resolution</p>
        </div>

        <div className="grid-4" style={{ gap: 'var(--space-md)' }}>
          {STEPS.map((item, idx) => (
            <div key={idx} className="card animate-fade-in-up" style={{ animationDelay: `${0.1 * idx}s`, opacity: 0, textAlign: 'center' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-md)',
              }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>STEP {item.step}</div>
              <h4 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)' }}>{item.title}</h4>
              <p style={{ fontSize: 'var(--text-sm)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Pillars */}
      <section className="container pillar-section">
        <div className="section-header text-center" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2 className="section-title">Six Pillars of CivicPulse</h2>
          <p className="section-subtitle">A comprehensive approach to community issue management</p>
        </div>

        <div className="pillar-grid">
          {PILLARS.map((pillar, idx) => (
            <div key={idx} className="pillar-card animate-fade-in-up" style={{ animationDelay: `${0.1 * idx}s`, opacity: 0 }}>
              <div className="pillar-icon" style={{ background: pillar.bg, color: pillar.color }}>
                {pillar.icon}
              </div>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="card" style={{
          textAlign: 'center',
          padding: 'var(--space-3xl)',
          background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.04), rgba(124, 58, 237, 0.04))',
          border: '1px solid rgba(8, 145, 178, 0.12)',
        }}>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>
            Most platforms stop at reporting.
            <br />
            <span className="gradient-text">CivicPulse closes the loop.</span>
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto var(--space-xl)', fontSize: 'var(--text-base)' }}>
            With SLA enforcement, resolution proof, and an equity dashboard that makes
            accountability visible to every citizen.
          </p>
          <Link to="/auth" className="btn btn-primary btn-lg">
            Get Started — It's Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 CivicPulse — Built for the Community Issue Management Hackathon</p>
        </footer>
      </div>
    </PageTransition>
  );
}
