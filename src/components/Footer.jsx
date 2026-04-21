import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Send,
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const YEAR = new Date().getFullYear();

const SHOP_LINKS = [
  { label: 'Flight Series',    to: '/series' },
  { label: 'Flight-15 Pro',    to: '/product/fl-15' },
  { label: 'Flight-10 Club',   to: '/product/fl-10' },
  { label: 'Flight-05 Train',  to: '/product/fl-05' },
];

const COMPANY_LINKS = [
  { label: 'About Aerion',  to: '/about' },
  { label: 'Engineering',   to: '/about' },
  { label: 'Press & Media', to: '/contact' },
  { label: 'Sponsorships',  to: '/contact' },
];

const SUPPORT_LINKS = [
  { label: 'Contact',         to: '/contact' },
  { label: 'My Account',      to: '/account' },
  { label: 'Track Order',     to: '/orders' },
  { label: 'Shipping Policy', to: '/shipping-policy' },
  { label: 'Refund Policy',   to: '/refund-policy' },
];

const LEGAL_LINKS = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms',   to: '/terms' },
  { label: 'Refunds', to: '/refund-policy' },
];

const SOCIALS = [
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com/aerionsports' },
  { label: 'YouTube',   icon: Youtube,   href: 'https://youtube.com/@aerionsports' },
  { label: 'Twitter',   icon: Twitter,   href: 'https://twitter.com/aerionsports' },
  { label: 'Facebook',  icon: Facebook,  href: 'https://facebook.com/aerionsports' },
];

const TRUST = [
  { icon: ShieldCheck, title: 'Secure Checkout',  sub: 'SSL + Razorpay vault' },
  { icon: Truck,       title: 'Free Shipping',    sub: 'On orders above INR 2,000' },
  { icon: RotateCcw,   title: '7-Day Returns',    sub: 'No questions asked' },
  { icon: Award,       title: 'Tournament Grade', sub: 'BWF-spec calibration' },
];

const S = {
  footer: {
    position: 'relative',
    marginTop: '120px',
    paddingTop: '80px',
    background: 'radial-gradient(ellipse at top, rgba(201,168,76,0.06) 0%, transparent 60%), linear-gradient(180deg, #060607 0%, #030303 100%)',
    borderTop: '1px solid rgba(201,168,76,0.15)',
    color: '#b8b5ac',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  container: { maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px)' },
  trustStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    padding: '32px 0',
    marginBottom: '64px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  trustItem: { display: 'flex', gap: '16px', alignItems: 'center' },
  trustIcon: {
    width: '44px', height: '44px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(201,168,76,0.08)',
    border: '1px solid rgba(201,168,76,0.25)',
    color: '#c9a84c',
  },
  trustTitle: { fontSize: '0.82rem', fontWeight: 700, color: '#f0ede8', letterSpacing: '0.02em', marginBottom: '4px' },
  trustSub: { fontSize: '0.72rem', opacity: 0.55, letterSpacing: '0.04em' },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.5fr',
    gap: '48px',
    paddingBottom: '72px',
  },
  brandMark: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: '1.8rem', fontWeight: 900, letterSpacing: '0.35em',
    color: '#f0ede8', marginBottom: '8px',
  },
  brandTag: { fontSize: '0.75rem', color: '#c9a84c', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '24px' },
  brandBlurb: { fontSize: '0.88rem', lineHeight: 1.8, color: 'rgba(240,237,232,0.55)', marginBottom: '28px', maxWidth: '320px' },
  contactRow: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', marginBottom: '10px', color: 'rgba(240,237,232,0.7)' },
  contactIcon: { color: '#c9a84c', flexShrink: 0 },
  colHeading: { fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '24px' },
  colLinks: { display: 'flex', flexDirection: 'column', gap: '14px' },
  colLink: { fontSize: '0.88rem', color: 'rgba(240,237,232,0.65)', textDecoration: 'none', transition: 'color 160ms ease, transform 160ms ease', display: 'inline-block' },
  newsletterForm: {
    display: 'flex', alignItems: 'stretch',
    border: '1px solid rgba(201,168,76,0.3)',
    background: 'rgba(255,255,255,0.02)',
    marginTop: '12px',
  },
  newsletterInput: {
    flex: 1, padding: '14px 16px', background: 'transparent', border: 'none', outline: 'none',
    color: '#f0ede8', fontSize: '0.85rem', letterSpacing: '0.02em', fontFamily: 'inherit',
  },
  newsletterBtn: {
    padding: '0 18px', background: '#c9a84c', color: '#0b0b0d', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase',
    transition: 'transform 160ms ease',
  },
  newsletterNote: { marginTop: '12px', fontSize: '0.72rem', opacity: 0.5, letterSpacing: '0.02em' },
  socialRow: { display: 'flex', gap: '10px', marginTop: '28px' },
  socialBtn: {
    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
    color: 'rgba(240,237,232,0.7)', transition: 'all 160ms ease', textDecoration: 'none',
  },
  bottomBar: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '28px 0 40px',
    display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
    gap: '16px',
  },
  bottomLegal: { display: 'flex', flexWrap: 'wrap', gap: '24px' },
  bottomLink: { fontSize: '0.74rem', color: 'rgba(240,237,232,0.45)', textDecoration: 'none', letterSpacing: '0.05em' },
  copy: { fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(240,237,232,0.35)', textTransform: 'uppercase' },
  payRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  payPill: {
    padding: '6px 10px', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.12em',
    color: 'rgba(240,237,232,0.55)',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)', textTransform: 'uppercase',
  },
  bigMark: {
    marginTop: '8px',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: 'clamp(5rem, 14vw, 12rem)', fontWeight: 900, letterSpacing: '0.15em',
    lineHeight: 0.85,
    background: 'linear-gradient(180deg, rgba(201,168,76,0.18) 0%, rgba(201,168,76,0) 85%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', color: 'transparent',
    textAlign: 'center', userSelect: 'none', pointerEvents: 'none',
  },
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setStatus('err'); return; }
    setStatus('ok');
    setEmail('');
    setTimeout(() => setStatus('idle'), 4000);
  };

  const hoverIn  = (e) => { e.currentTarget.style.color = '#c9a84c'; e.currentTarget.style.transform = 'translateX(4px)'; };
  const hoverOut = (e) => { e.currentTarget.style.color = 'rgba(240,237,232,0.65)'; e.currentTarget.style.transform = 'translateX(0)'; };

  return (
    <footer className="lu-footer aerion-footer" style={S.footer} aria-label="Site footer">
      <div style={S.container}>
        <div style={S.trustStrip}>
          {TRUST.map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.title} style={S.trustItem}>
                <div style={S.trustIcon}><Icon size={18} /></div>
                <div>
                  <div style={S.trustTitle}>{t.title}</div>
                  <div style={S.trustSub}>{t.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="aerion-footer-grid" style={S.grid}>
          <div>
            <div style={S.brandMark}>AERION</div>
            <div style={S.brandTag}>Precision in Motion</div>
            <p style={S.brandBlurb}>
              Tournament-grade shuttlecocks engineered in India. Hand-selected feathers,
              calibrated cork, and obsessive flight testing for players who measure their
              game in millimetres.
            </p>
            <div style={S.contactRow}><Mail size={14} style={S.contactIcon} /><span>aerionsports@gmail.com</span></div>
            <div style={S.contactRow}><Phone size={14} style={S.contactIcon} /><span>+91 99112 25445</span></div>
            <div style={S.contactRow}><MapPin size={14} style={S.contactIcon} /><span>Sector 92, Gurgaon, India</span></div>
          </div>

          <div>
            <div style={S.colHeading}>Shop</div>
            <div style={S.colLinks}>
              {SHOP_LINKS.map((l) => (
                <Link key={l.label} to={l.to} style={S.colLink} onMouseOver={hoverIn} onMouseOut={hoverOut}>{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <div style={S.colHeading}>Company</div>
            <div style={S.colLinks}>
              {COMPANY_LINKS.map((l) => (
                <Link key={l.label} to={l.to} style={S.colLink} onMouseOver={hoverIn} onMouseOut={hoverOut}>{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <div style={S.colHeading}>Support</div>
            <div style={S.colLinks}>
              {SUPPORT_LINKS.map((l) => (
                <Link key={l.label} to={l.to} style={S.colLink} onMouseOver={hoverIn} onMouseOut={hoverOut}>{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <div style={S.colHeading}>The Aerion Dispatch</div>
            <p style={{ fontSize: '0.84rem', lineHeight: 1.7, color: 'rgba(240,237,232,0.6)', marginBottom: '6px' }}>
              Early drops, tournament results, and engineering notes from the workshop.
              No spam. Unsubscribe any time.
            </p>
            <form onSubmit={handleSubscribe} style={S.newsletterForm}>
              <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
              <input
                id="footer-newsletter-email"
                type="email" required placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                style={S.newsletterInput}
              />
              <button type="submit" style={S.newsletterBtn}>Join <Send size={13} /></button>
            </form>
            <div aria-live="polite" style={{
              ...S.newsletterNote,
              color: status === 'ok' ? '#4ade80' : status === 'err' ? '#ff6b6b' : 'rgba(240,237,232,0.5)'
            }}>
              {status === 'ok'  && 'Welcome to the Dispatch. Check your inbox.'}
              {status === 'err' && 'Please enter a valid email address.'}
              {status === 'idle' && 'By joining you agree to our privacy policy.'}
            </div>
            <div style={S.socialRow}>
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={S.socialBtn}>
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div style={S.bigMark} aria-hidden="true">AERION</div>

        <div style={S.bottomBar}>
          <div style={S.copy}>&copy; {YEAR} Aerion Sports &middot; All rights reserved</div>
          <div style={S.bottomLegal}>
            {LEGAL_LINKS.map((l) => (
              <Link key={l.label} to={l.to} style={S.bottomLink}>{l.label}</Link>
            ))}
          </div>
          <div style={S.payRow}>
            <span style={S.payPill}>VISA</span>
            <span style={S.payPill}>MC</span>
            <span style={S.payPill}>UPI</span>
            <span style={S.payPill}>COD</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .aerion-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 640px) {
          .aerion-footer-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </footer>
  );
}
