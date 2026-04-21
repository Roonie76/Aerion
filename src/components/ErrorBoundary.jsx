import React from 'react';

const styles = {
  wrap: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 55%), #030303',
    color: '#f0ede8',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    maxWidth: '520px',
    textAlign: 'center',
    padding: '40px 32px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(201,168,76,0.2)',
  },
  eyebrow: {
    fontSize: '0.7rem', letterSpacing: '0.3em',
    color: '#c9a84c', textTransform: 'uppercase', marginBottom: '16px',
  },
  title: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 'clamp(2rem, 4vw, 2.6rem)',
    fontWeight: 900, letterSpacing: '-0.01em',
    textTransform: 'uppercase', marginBottom: '12px',
  },
  msg: {
    color: 'rgba(240,237,232,0.6)', lineHeight: 1.7,
    fontSize: '0.95rem', marginBottom: '28px',
  },
  row: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  btn: {
    padding: '14px 22px', background: '#c9a84c', color: '#0b0b0d',
    border: 'none', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
  },
  btnGhost: {
    padding: '14px 22px', background: 'transparent', color: '#f0ede8',
    border: '1px solid rgba(240,237,232,0.25)', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
  },
  detail: {
    marginTop: '24px', padding: '12px', background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontFamily: 'Menlo, Consolas, monospace', fontSize: '0.72rem',
    color: 'rgba(240,237,232,0.55)', textAlign: 'left',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    maxHeight: '200px', overflow: 'auto',
  },
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined' && window.console) {
      console.error('[Aerion] Render crashed:', error, info);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  reload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    const isDev = import.meta.env.DEV;
    return (
      <div style={styles.wrap} role="alert">
        <div style={styles.card}>
          <div style={styles.eyebrow}>System Interruption</div>
          <h2 style={styles.title}>Something went wrong</h2>
          <p style={styles.msg}>
            We hit an unexpected error rendering this view. The engineering team has been notified.
            Try reloading, or head back to the homepage to continue browsing.
          </p>
          <div style={styles.row}>
            <button type="button" style={styles.btn} onClick={this.reload}>Reload</button>
            <a href="/" style={{ ...styles.btnGhost, textDecoration: 'none', display: 'inline-block' }}>Home</a>
          </div>
          {isDev && this.state.error && (
            <pre style={styles.detail}>{String(this.state.error.stack || this.state.error.message || this.state.error)}</pre>
          )}
        </div>
      </div>
    );
  }
}
