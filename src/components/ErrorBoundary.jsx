import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DevWizard ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'var(--accent-danger-subtle, rgba(239, 68, 68, 0.12))',
            color: 'var(--accent-danger, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <AlertTriangle size={28} />
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading, inherit)',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            color: 'var(--text-primary)'
          }}>
            Something went wrong in this tool
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            maxWidth: '480px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            lineHeight: 1.5
          }}>
            {this.state.error?.message || 'An unexpected runtime error occurred. Your data is kept safe locally.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="dw-btn dw-btn-primary"
              onClick={this.handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RefreshCw size={14} />
              <span>Reload Tool</span>
            </button>
            <a
              href="/"
              className="dw-btn dw-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <Home size={14} />
              <span>Back to Dashboard</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
