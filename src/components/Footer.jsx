import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">A</span>
            <span className="brand-name">AERION</span>
          </div>
          <p className="footer-description">
            Precision badminton equipment for athletes who demand repeatable flight and elite consistency.
          </p>
        </div>

        <div>
          <h3 className="footer-title">Series</h3>
          <ul className="footer-links">
            <li>
              <Link to="/series">Training Series</Link>
            </li>
            <li>
              <Link to="/series">Club Series</Link>
            </li>
            <li>
              <Link to="/series">Tournament Series</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="footer-title">Company</h3>
          <ul className="footer-links">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-container footer-bottom">
        <p>© 2026 AERION SPORTS LABS. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
}
