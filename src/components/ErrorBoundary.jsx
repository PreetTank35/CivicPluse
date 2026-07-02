import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * Global ErrorBoundary — catches unhandled React render exceptions
 * and displays a recovery UI instead of a blank white page.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console for developer debugging
    console.error('[CivicPulse ErrorBoundary] Uncaught error:', error);
    console.error('[CivicPulse ErrorBoundary] Component stack:', errorInfo?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '40px 24px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #ecfeff 100%)',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '48px 40px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(220, 38, 38, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <AlertTriangle size={32} color="#dc2626" />
            </div>

            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '12px',
            }}>
              Something went wrong
            </h2>

            <p style={{
              color: '#64748b',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}>
              An unexpected error occurred while rendering this page.
              Don't worry — your data is safe.
            </p>

            {this.state.error && (
              <details style={{
                background: '#fef2f2',
                border: '1px solid rgba(220, 38, 38, 0.15)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '24px',
                textAlign: 'left',
                fontSize: '0.75rem',
                color: '#991b1b',
                cursor: 'pointer',
              }}>
                <summary style={{ fontWeight: 600, marginBottom: '8px' }}>
                  <Bug size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Error Details
                </summary>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.7rem',
                  maxHeight: '120px',
                  overflow: 'auto',
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack?.slice(0, 500)}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0891b2, #0d9488)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 200ms',
                }}
              >
                <Home size={16} /> Go Home
              </button>
            </div>
          </div>

          <p style={{
            marginTop: '24px',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}>
            CivicPulse • If this keeps happening, try clearing your browser cache.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
