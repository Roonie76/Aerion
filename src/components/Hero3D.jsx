// UPDATED: Simplified Cinematic Hero (3D Model Removed)
import React from 'react';

export default function Hero3D() {
  return (
    <section className="hero-3d-container" style={{ height: '80vh', width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="hero-3d-overlay" style={{ position: 'relative', transform: 'none', top: 'auto', left: 'auto' }}>
        <h1 className="hero-title animate-in">Precision <br /> <span>Elevated</span></h1>
        <p className="hero-subtitle animate-in" style={{ position: 'relative', transform: 'none', left: 'auto', bottom: 'auto', marginTop: '20px' }}>
          High-performance gear for the modern athlete.
        </p>
      </div>
    </section>
  );
}
