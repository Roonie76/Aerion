import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="lu-footer">
      <div className="lu-container">
        <p className="lu-footer-brand">AERION</p>
        <p className="lu-footer-tagline">Precision in Motion</p>
        <div className="lu-footer-links">
          <Link to="/">Home</Link>
          <Link to="/series">Flight Series</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <p className="lu-footer-copy">© {new Date().getFullYear()} Aerion. All rights reserved.</p>
      </div>
    </footer>
  );
}
