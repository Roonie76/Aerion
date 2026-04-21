import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ParallaxLayer from '../components/ParallaxLayer';
import Picture from '../components/Picture';
import Seo from '../components/Seo';
import Hero3DParallax from '../components/Hero3DParallax';

// Custom hook for scroll-in animations
function useFadeIn(threshold = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('lu-visible');
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    id: 'fl-15',
    name: 'AERION Flight-15',
    tag: 'Professional Grade',
    desc: 'Crafted with selected goose feathers and reinforced natural cork. Designed for competitive precision and refined flight control.',
    img: '/images/products/fl-15.jpg',
  },
  {
    id: 'fl-10',
    name: 'AERION Flight-10',
    tag: 'Intermediate Grade',
    desc: 'Built with quality duck feathers and natural cork. Balanced for stable flight and consistent performance.',
    img: '/images/products/fl-10.jpg',
  },
  {
    id: 'fl-05',
    name: 'AERION Flight-05',
    tag: 'Training Grade',
    desc: 'Durable duck feathers with reinforced cork. Designed for training, repetition, and skill development.',
    img: '/images/products/fl-05.jpg',
  },
];

const FEATURES = [
  { icon: '\u25CE', title: 'Precision Balance', desc: 'Micron-level weight calibration for a repeatable, accurate flight path every time.' },
  { icon: '\u25C8', title: 'Engineered Power', desc: 'Cork density optimised to transfer maximum energy from racket to shuttlecock.' },
  { icon: '\u25C7', title: 'Lightweight Construction', desc: 'Ultra-fine feather selection keeps total shuttle weight within elite tolerance.' },
  { icon: '\u25C9', title: 'Court Stability', desc: 'Aerodynamic skirt geometry delivers consistent spin and drag in all conditions.' },
];

const TESTIMONIALS = [
  {
    quote: 'The flight is noticeably more stable than what I used in the national circuit last year. It rewards clean technique - which is exactly what you want in tournament play.',
    author: 'Arjun Nair',
    role: 'National-ranked Singles Player',
  },
  {
    quote: 'Our academy has run Aerion shuttles through 14 hours of drills a day for three months. Durability is the best I have seen at this speed grade.',
    author: 'Coach Priya Sharma',
    role: 'Head Coach, Smash Academy Gurgaon',
  },
  {
    quote: 'Speed calibration is absolutely on-spec. For doubles play in dry AC halls, the Flight-15 has become our default.',
    author: 'Rohan Menon',
    role: 'District Doubles Champion 2025',
  },
];

/* Components */
function HeroSection() {
  return (
    <section className="lu-hero">
      <Hero3DParallax />
      <div className="lu-hero-noise" aria-hidden="true" />
      <div className="lu-hero-glow" aria-hidden="true" />
      <div className="lu-hero-inner">
        <p className="lu-eyebrow">Aerion &mdash; Est. 2026</p>
        <h1 className="lu-hero-headline">
          PRECISION<br />
          <span className="lu-gold">ELEVATED</span>
        </h1>
        <p className="lu-hero-sub">
          Elite Badminton Shuttlecocks, engineered for those who play above the standard.
        </p>
        <Link to="/series" className="lu-btn-primary">Explore Collection</Link>
        <p className="lu-hero-tagline">Crafted for control. Refined for performance.</p>
      </div>
      <div className="lu-hero-scroll-hint" aria-hidden="true"><span /></div>
    </section>
  );
}

function ProductCard({ product, index }) {
  const ref = useFadeIn(0.1);
  return (
    <article ref={ref} className="lu-card lu-fade-up" style={{ transitionDelay: `${index * 90}ms` }}>
      <div className="lu-card-img-wrap">
        <Picture src={product.img} alt={product.name} className="lu-card-img" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="lu-card-overlay" aria-hidden="true" />
      </div>
      <div className="lu-card-body">
        <span className="lu-tag">{product.tag}</span>
        <h3 className="lu-card-name">{product.name}</h3>
        <p className="lu-card-desc">{product.desc}</p>
        <Link to={`/product/${product.id}`} className="lu-btn-ghost">View Product</Link>
      </div>
    </article>
  );
}

function ProductSection() {
  const titleRef = useFadeIn();
  return (
    <section className="lu-section">
      <div className="lu-container">
        <div ref={titleRef} className="lu-section-header lu-fade-up">
          <p className="lu-overline">The Collection</p>
          <h2 className="lu-section-title">Flight Series</h2>
          <p className="lu-section-sub">Three tiers. One standard of excellence.</p>
        </div>
        <div className="lu-products-grid">
          {PRODUCTS.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}



function PhilosophySection() {
  const ref = useFadeIn(0.1);
  return (
    <section className="lu-section lu-section-alt lu-parallax-section">
      <ParallaxLayer speed={-0.25} className="lu-parallax-bg" aria-hidden="true">
        <div className="lu-parallax-orb" />
      </ParallaxLayer>
      <div className="lu-container">
        <ParallaxLayer speed={0.12}>
          <div ref={ref} className="lu-philosophy lu-fade-up">
            <p className="lu-overline lu-gold">The Aerion Standard</p>
            <blockquote className="lu-philosophy-text">
              Aerion exists at the intersection of precision and performance.<br />
              Every detail is engineered for control, speed, and consistency.<br />
              No excess. No compromise. Only refinement where it matters.
            </blockquote>
            <div className="lu-divider"><span /></div>
          </div>
        </ParallaxLayer>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const titleRef = useFadeIn();
  return (
    <section className="lu-section">
      <div className="lu-container">
        <div ref={titleRef} className="lu-section-header lu-fade-up">
          <p className="lu-overline">Engineering</p>
          <h2 className="lu-section-title">Built Different</h2>
        </div>
        <div className="lu-features-grid">
          {FEATURES.map((f, i) => {
            const ref = useFadeIn(0.08);
            return (
              <div key={f.title} ref={ref} className="lu-feature lu-fade-up" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="lu-feature-icon" aria-hidden="true">{f.icon}</span>
                <h4 className="lu-feature-title">{f.title}</h4>
                <p className="lu-feature-desc">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const titleRef = useFadeIn();
  return (
    <section className="lu-section" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)' }}>
      <div className="lu-container">
        <div ref={titleRef} className="lu-section-header lu-fade-up">
          <p className="lu-overline">Field Reports</p>
          <h2 className="lu-section-title">
            Trusted by Players<br />
            <span className="lu-gold">Who Measure Every Shot</span>
          </h2>
          <p className="lu-section-sub">
            What the circuit, the academy, and the club court have to say.
          </p>
        </div>

        <div className="aerion-testimonials-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '64px',
        }}>
          {TESTIMONIALS.map((t, i) => {
            const ref = useFadeIn(0.1);
            return (
              <blockquote key={t.author} ref={ref} className="lu-fade-up" style={{
                position: 'relative',
                padding: '40px 32px',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(0,0,0,0.45) 100%)',
                border: '1px solid rgba(201,168,76,0.15)',
                transitionDelay: `${i * 100}ms`,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}>
                <span aria-hidden="true" style={{
                  position: 'absolute', top: '8px', left: '20px',
                  fontSize: '5rem', fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700, color: '#c9a84c', opacity: 0.25, lineHeight: 1,
                }}>&ldquo;</span>
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.15rem', lineHeight: 1.6,
                  color: 'rgba(240,237,232,0.85)',
                  marginTop: '32px', fontStyle: 'italic',
                }}>{t.quote}</p>
                <footer style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f0ede8', letterSpacing: '0.02em' }}>{t.author}</div>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a84c', marginTop: '4px' }}>{t.role}</div>
                </footer>
              </blockquote>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const ref = useFadeIn(0.1);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setStatus('err'); return; }
    setStatus('ok');
    setEmail('');
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <section className="lu-section">
      <div className="lu-container">
        <div ref={ref} className="lu-fade-up" style={{
          position: 'relative',
          padding: 'clamp(48px, 7vw, 96px) clamp(24px, 5vw, 80px)',
          background: 'radial-gradient(ellipse at 20% 30%, rgba(201,168,76,0.12) 0%, transparent 50%), linear-gradient(145deg, #101012 0%, #050506 100%)',
          border: '1px solid rgba(201,168,76,0.25)',
          overflow: 'hidden',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, right: '-10%',
            width: '60%', height: '100%',
            background: 'radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 55%)',
            pointerEvents: 'none',
          }} />
          <div className="aerion-newsletter-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '48px', alignItems: 'center', position: 'relative',
          }}>
            <div>
              <p className="lu-overline lu-gold">Aerion Dispatch</p>
              <h2 className="lu-section-title" style={{ textAlign: 'left', marginBottom: '20px' }}>
                Drops, drills &amp;<br /><span className="lu-gold">field notes.</span>
              </h2>
              <p style={{
                color: 'rgba(240,237,232,0.6)',
                fontSize: '1rem', lineHeight: 1.8, maxWidth: '420px',
              }}>
                The quiet newsletter for badminton obsessives. Early access to
                new flight grades, tournament recaps, and notes from the
                workshop - once a fortnight.
              </p>
            </div>

            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label htmlFor="home-newsletter-email" className="sr-only">Email address</label>
              <div style={{
                display: 'flex',
                border: '1px solid rgba(201,168,76,0.35)',
                background: 'rgba(0,0,0,0.4)',
              }}>
                <input
                  id="home-newsletter-email"
                  type="email" required placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1, padding: '18px 20px',
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#f0ede8', fontSize: '0.92rem',
                    fontFamily: 'inherit', letterSpacing: '0.02em',
                  }}
                />
                <button type="submit" className="lu-btn-primary" style={{ borderRadius: 0, padding: '0 32px' }}>
                  Subscribe
                </button>
              </div>
              <p aria-live="polite" style={{
                fontSize: '0.75rem',
                color: status === 'ok' ? '#4ade80' : status === 'err' ? '#ff6b6b' : 'rgba(240,237,232,0.5)',
                letterSpacing: '0.04em',
              }}>
                {status === 'ok' && '\u2713 Welcome aboard. Watch your inbox.'}
                {status === 'err' && 'Please enter a valid email address.'}
                {status === 'idle' && 'Zero spam. Unsubscribe in one click.'}
              </p>
            </form>
          </div>

          <style>{`
            @media (max-width: 768px) {
              .aerion-newsletter-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const ref = useFadeIn(0.1);
  return (
    <section className="lu-section lu-cta-section">
      <div className="lu-cta-glow" aria-hidden="true" />
      <div className="lu-container">
        <div ref={ref} className="lu-cta-inner lu-fade-up">
          <h2 className="lu-cta-headline">Play Without Limits.</h2>
          <p className="lu-cta-sub">Experience badminton at its highest level.</p>
          <Link to="/series" className="lu-btn-primary">Shop Aerion</Link>
        </div>
      </div>
    </section>
  );
}

/* Page */
export default function Home() {
  return (
    <div className="lu-root">
      <Seo
        title="Precision Shuttlecocks Engineered in India"
        description="Tournament-grade shuttlecocks with hand-selected feathers, calibrated cork, and obsessive flight testing. Free shipping over ₹2,000."
      />
      <HeroSection />
      <ProductSection />
      <PhilosophySection />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
      <CtaSection />
    </div>
  );
}
