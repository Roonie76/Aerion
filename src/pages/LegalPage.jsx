import React from 'react';

const S = {
  page: { minHeight: '70vh', padding: '120px 0 80px' },
  container: { maxWidth: '860px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 48px)' },
  overline: {
    fontSize: '0.72rem',
    color: '#c9a84c',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  title: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 'clamp(2.4rem, 6vw, 4rem)',
    fontWeight: 900,
    letterSpacing: '0.08em',
    lineHeight: 1,
    color: '#f0ede8',
    marginBottom: '12px',
  },
  updated: {
    fontSize: '0.78rem',
    color: 'rgba(240,237,232,0.45)',
    letterSpacing: '0.05em',
    marginBottom: '48px',
  },
  body: {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '0.95rem',
    lineHeight: 1.85,
    color: 'rgba(240,237,232,0.8)',
  },
};

export default function LegalPage({ overline, title, updated, children }) {
  return (
    <div style={S.page}>
      <div style={S.container}>
        <div style={S.overline}>{overline}</div>
        <h1 style={S.title}>{title}</h1>
        {updated && <div style={S.updated}>Last updated: {updated}</div>}
        <div className="aerion-legal-body" style={S.body}>{children}</div>
      </div>
      <style>{`
        .aerion-legal-body h2 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #f0ede8;
          margin: 40px 0 16px;
        }
        .aerion-legal-body h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #c9a84c;
          letter-spacing: 0.04em;
          margin: 24px 0 10px;
        }
        .aerion-legal-body p { margin-bottom: 16px; }
        .aerion-legal-body ul { margin: 0 0 18px 24px; padding: 0; }
        .aerion-legal-body li { margin-bottom: 8px; }
        .aerion-legal-body a { color: #c9a84c; text-decoration: underline; }
        .aerion-legal-body strong { color: #f0ede8; }
      `}</style>
    </div>
  );
}
