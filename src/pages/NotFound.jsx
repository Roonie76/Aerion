import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="lu-cart-page">
      <div className="lu-container" style={{ textAlign: 'center', padding: '120px 0', minHeight: '60vh' }}>
        <p className="lu-overline lu-gold">Error 404</p>
        <h1
          className="lu-section-title"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(5rem, 18vw, 14rem)',
            fontWeight: 900,
            letterSpacing: '0.15em',
            lineHeight: 0.9,
            margin: '16px 0 8px',
          }}
        >
          OFF COURT
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.7 }}>
          The page you were looking for has drifted out of play. It may have moved, or the link may be mistyped.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="lu-btn-primary">Return Home</Link>
          <Link to="/series" className="lu-btn-ghost">Browse Flight Series</Link>
        </div>
      </div>
    </div>
  );
}
