// UPDATED: Luxury Aerion Landing Page
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/* ─────────────── Tiny scroll-in hook ─────────────── */
function useFadeIn(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lu-visible');
          obs.unobserve(entry.target);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ─────────────── Data ─────────────── */
const PRODUCTS = [
  {
    id: 'fl-15',
    name: 'AERION Flight-15',
    tag: 'Professional Grade',
    desc: 'Crafted with selected goose feathers and reinforced natural cork. Designed for competitive precision and refined flight control.',
    img: 'https://images.unsplash.com/photo-1599474924187-334a4ae593c0?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'fl-10',
    name: 'AERION Flight-10',
    tag: 'Intermediate Grade',
    desc: 'Built with quality duck feathers and natural cork. Balanced for stable flight and consistent performance.',
    img: 'https://images.unsplash.com/photo-1613919113166-2990050bc83a?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'fl-05',
    name: 'AERION Flight-05',
    tag: 'Training Grade',
    desc: 'Durable duck feathers with reinforced cork. Designed for training, repetition, and skill development.',
    img: 'https://images.unsplash.com/photo-1626225453014-49774309ba83?q=80&w=800&auto=format&fit=crop',
  },
];

const FEATURES = [
  { icon: '◎', title: 'Precision Balance', desc: 'Micron-level weight calibration for a repeatable, accurate flight path every time.' },
  { icon: '◈', title: 'Engineered Power', desc: 'Cork density optimised to transfer maximum energy from racket to shuttlecock.' },
  { icon: '◇', title: 'Lightweight Construction', desc: 'Ultra-fine feather selection keeps total shuttle weight within elite tolerance.' },
  { icon: '◉', title: 'Court Stability', desc: 'Aerodynamic skirt geometry delivers consistent spin and drag in all conditions.' },
];

/* ─────────────── Components ─────────────── */
function HeroSection() {
  return (
    <section className="lu-hero">
      <div className="lu-hero-noise" aria-hidden="true" />
      <div className="lu-hero-glow" aria-hidden="true" />
      <div className="lu-hero-inner">
        <p className="lu-eyebrow">Aerion — Est. 2026</p>
        <h1 className="lu-hero-headline">
          PRECISION.<br />
          <span className="lu-gold">ELEVATED.</span>
        </h1>
        <p className="lu-hero-sub">
          Elite Badminton Suttlecocks, Egineered for those who play above the standard.
        </p>
        <Link to="/series" className="lu-btn-primary">Explore Collection</Link>
        <p className="lu-hero-tagline">Crafted for control. Refined for performance.</p>
      </div>
      <div className="lu-hero-scroll-hint" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}

function ProductCard({ product, index }) {
  const ref = useFadeIn(0.1);
  return (
    <article
      ref={ref}
      className="lu-card lu-fade-up"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="lu-card-img-wrap">
        <img src={product.img} alt={product.name} className="lu-card-img" loading="lazy" />
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
    <section className="lu-section lu-section-alt">
      <div className="lu-container">
        <div ref={ref} className="lu-philosophy lu-fade-up">
          <p className="lu-overline lu-gold">The Aerion Standard</p>
          <blockquote className="lu-philosophy-text">
            Aerion exists at the intersection of precision and performance.<br />
            Every detail is engineered for control, speed, and consistency.<br />
            No excess. No compromise. Only refinement where it matters.
          </blockquote>
          <div className="lu-divider"><span /></div>
        </div>
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
              <div
                key={f.title}
                ref={ref}
                className="lu-feature lu-fade-up"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
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



/* ─────────────── Page ─────────────── */
export default function Home() {
  return (
    <div className="lu-root">
      <HeroSection />
      <ProductSection />
      <PhilosophySection />
      <FeaturesSection />
      <CtaSection />

    </div>
  );
}
