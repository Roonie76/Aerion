// About Page — Aerion Brand Story
// Uses the lu-* design system for consistency with the rest of the site.
// GSAP ScrollTrigger drives all animations.

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Picture from '../components/Picture';
import Seo from '../components/Seo';

gsap.registerPlugin(ScrollTrigger);

/* ── Data ── */
const PRINCIPLES = [
  {
    number: '01',
    title: 'Feather Selection',
    body: 'Grade-A goose feathers sourced from high-altitude regions. Each feather is inspected for symmetry, curvature, and structural rigidity before it enters production.',
  },
  {
    number: '02',
    title: 'Cork Engineering',
    body: 'Triple-layer composite cork, precision-pressed at controlled humidity. Tuned for energy transfer so the shuttle responds with immediate, predictable pop.',
  },
  {
    number: '03',
    title: 'Binding Integrity',
    body: 'Proprietary cross-lacing and thermal-bonded resin maintains structural form even under sustained 400 km/h smash velocities across extended sessions.',
  },
];

const STATS = [
  { value: 'A+', label: 'Flight Stability Grade' },
  { value: '±0.2%', label: 'Speed Variance' },
  { value: '450', label: 'Rotation RPM' },
  { value: '16', label: 'Feathers Per Shuttle' },
];

const TIMELINE = [
  { year: '2024', event: 'Research phase begins. Cork density and feather geometry studies across 200+ prototypes.' },
  { year: '2025', event: 'First controlled flight tests. Aerion achieves sub-0.3% speed variance — outperforming market leaders.' },
  { year: '2026', event: 'Aerion launches. Three flight grades. One uncompromising standard.' },
];

export default function About() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Fade up on scroll ──
      gsap.utils.toArray('.ab-fade').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          }
        );
      });

      // ── Stagger children ──
      gsap.utils.toArray('.ab-stagger').forEach((parent) => {
        gsap.fromTo(parent.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
            scrollTrigger: { trigger: parent, start: 'top 85%' },
          }
        );
      });

      // ── Horizontal rule reveal ──
      gsap.utils.toArray('.ab-rule').forEach((el) => {
        gsap.fromTo(el,
          { scaleX: 0 },
          {
            scaleX: 1, duration: 1.4, ease: 'power4.inOut',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          }
        );
      });

      // ── Counter animation for stats ──
      gsap.utils.toArray('.ab-stat-value').forEach((el) => {
        const end = el.dataset.value;
        if (!isNaN(end)) {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: parseFloat(end),
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
            onUpdate: () => { el.textContent = Math.round(obj.val); },
          });
        }
      });

      // ── Parallax for hero tagline ──
      gsap.to('.ab-hero-sub', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.ab-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="lu-root">
      <Seo
        title="Our Story — Precision, Craft, Flight"
        description="Aerion is a Gurgaon-based shuttlecock maker obsessed with feather selection, cork engineering, and binding integrity. Meet the team behind the flight."
      />

      {/* ═══════════════════════════════════════════
          HERO — Full viewport, cinematic
      ═══════════════════════════════════════════ */}
      <section className="ab-hero" style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 50% at 50% 45%, #121626 0%, #05060a 100%)',
        paddingTop: 'clamp(88px, 14vw, 120px)',
      }}>
        {/* Noise texture */}
        <div className="lu-hero-noise" aria-hidden="true" />
        {/* Central glow */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          left: '50%', top: '45%', transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} aria-hidden="true" />

        <div style={{ position: 'relative', zIndex: 2, padding: '0 24px', maxWidth: '900px' }}>
          <p className="lu-eyebrow ab-fade">The Story Behind Aerion</p>
          <h1 className="ab-fade" style={{
            fontSize: 'clamp(3rem, 11vw, 8rem)',
            fontWeight: 950,
            lineHeight: 0.88,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            margin: '0 0 36px',
          }}>
            OBSESSION.<br />
            <span className="lu-gold">REFINED.</span>
          </h1>
          <p className="ab-hero-sub ab-fade" style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            maxWidth: '540px',
            lineHeight: 1.7,
            margin: '0 auto 48px',
          }}>
            Every Aerion shuttlecock begins as an obsession with flight — and ends as a product
            that professional players trust with their game.
          </p>
          <div className="ab-fade" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/series" className="lu-btn-primary">Explore Collection</Link>
            <a href="#origin" className="lu-btn-ghost">Read Our Story</a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="lu-hero-scroll-hint" aria-hidden="true"><span /></div>
      </section>

      {/* ═══════════════════════════════════════════
          ORIGIN STORY — Narrative with timeline
      ═══════════════════════════════════════════ */}
      <section id="origin" className="lu-section">
        <div className="lu-container">
          <div className="lu-section-header ab-fade">
            <p className="lu-overline lu-gold">Origin</p>
            <h2 className="lu-section-title">
              Born From<br /><span className="lu-gold">Frustration</span>
            </h2>
            <p className="lu-section-sub">
              We started because we couldn't find a shuttle that performed the same way twice.
              So we decided to build one.
            </p>
          </div>

          <div className="ab-fade aerion-about-visuals" style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 0.85fr',
            gap: '24px',
            alignItems: 'stretch',
            maxWidth: '1100px',
            margin: '0 auto 72px',
          }}>
            <figure style={{
              margin: 0,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.45) 100%)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <Picture
                src="/images/about/workshop.jpg"
                alt="Aerion shuttlecock concept art representing feather selection and precision build quality."
                loading="lazy"
                sizes="(max-width: 900px) 100vw, 60vw"
                widths={[480, 800, 1200, 1800]}
                style={{ width: '100%', aspectRatio: '16 / 11', objectFit: 'cover' }}
              />
              <figcaption style={{ padding: '18px 20px', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                Product craft starts with repeatable geometry and materials that behave the same way under pressure.
              </figcaption>
            </figure>

            <figure style={{
              margin: 0,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.45) 100%)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <Picture
                src="/images/about/blueprint.png"
                alt="Aerion blueprint graphic showing shuttlecock construction notes and flight tolerances."
                loading="lazy"
                sizes="(max-width: 900px) 100vw, 40vw"
                widths={[480, 800, 1200, 1800]}
                style={{ width: '100%', aspectRatio: '16 / 11', objectFit: 'cover' }}
              />
              <figcaption style={{ padding: '18px 20px', color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                Every launch begins as a spec sheet, not a guess: weight, spin, stability, and tolerance windows all mapped in advance.
              </figcaption>
            </figure>
          </div>

          {/* Timeline */}
          <div style={{
            position: 'relative',
            maxWidth: '720px',
            margin: '0 auto',
            paddingLeft: '40px',
          }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: '8px', top: 0, bottom: 0, width: '1px',
              background: 'linear-gradient(to bottom, var(--primary), var(--border), transparent)',
            }} aria-hidden="true" />

            <div className="ab-stagger" style={{ display: 'grid', gap: '48px' }}>
              {TIMELINE.map((t) => (
                <div key={t.year} style={{ position: 'relative' }}>
                  {/* Dot on the line */}
                  <div style={{
                    position: 'absolute', left: '-36px', top: '4px',
                    width: '10px', height: '10px',
                    border: '2px solid var(--primary)',
                    background: 'var(--bg)',
                  }} aria-hidden="true" />
                  <p style={{
                    fontSize: '0.72rem', fontWeight: 800, letterSpacing: '4px',
                    textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px',
                  }}>{t.year}</p>
                  <p style={{
                    color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7,
                  }}>{t.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CRAFTSMANSHIP — The 3-principle grid
      ═══════════════════════════════════════════ */}
      <section className="lu-section lu-section-alt">
        <div className="lu-container">
          <div className="lu-section-header ab-fade">
            <p className="lu-overline lu-gold">Craftsmanship</p>
            <h2 className="lu-section-title">
              Every Detail<br /><span className="lu-gold">Is Intentional</span>
            </h2>
            <p className="lu-section-sub">
              Three pillars define how we build. None of them are negotiable.
            </p>
          </div>

          <div className="ab-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
          }}>
            {PRINCIPLES.map((p) => (
              <article key={p.number} style={{
                padding: 'clamp(32px, 4vw, 56px)',
                background: 'var(--bg-alt)',
                transition: 'background 400ms ease',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--card-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-alt)'}
              >
                <p style={{
                  fontSize: '0.68rem', fontWeight: 800, letterSpacing: '4px',
                  color: 'var(--primary)', marginBottom: '20px',
                }}>{p.number}</p>
                <h3 style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
                  fontWeight: 900, textTransform: 'uppercase',
                  letterSpacing: '-0.02em', marginBottom: '16px',
                }}>{p.title}</h3>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7,
                }}>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PERFORMANCE — Big stat grid
      ═══════════════════════════════════════════ */}
      <section className="lu-section" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)',
      }}>
        <div className="lu-container">
          <div className="lu-section-header ab-fade">
            <p className="lu-overline lu-gold">Performance Data</p>
            <h2 className="lu-section-title">
              Numbers Don't<br /><span className="lu-gold">Lie</span>
            </h2>
          </div>

          <div className="ab-stagger" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
            maxWidth: '900px',
            margin: '0 auto',
          }}>
            {STATS.map((s) => (
              <div key={s.label} style={{
                background: 'var(--bg)',
                padding: '48px 32px',
                textAlign: 'center',
              }}>
                <p className="ab-stat-value" data-value={s.value.replace(/[^0-9.]/g, '')} style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.2rem)',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}>{s.value}</p>
                <p style={{
                  marginTop: '12px',
                  fontSize: '0.7rem', fontWeight: 700,
                  letterSpacing: '3px', textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PHILOSOPHY — Full-bleed quote
      ═══════════════════════════════════════════ */}
      <section className="lu-section lu-section-alt" style={{ position: 'relative' }}>
        {/* Parallax background orb */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} aria-hidden="true" />

        <div className="lu-container">
          <div className="ab-fade" style={{
            textAlign: 'center', maxWidth: '800px', margin: '0 auto',
            position: 'relative', zIndex: 1,
          }}>
            <p className="lu-overline lu-gold">The Aerion Standard</p>
            <blockquote style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontWeight: 300,
              fontStyle: 'italic',
              lineHeight: 1.5,
              color: 'var(--text)',
              margin: '32px 0 48px',
            }}>
              "Aerion exists at the intersection of precision and performance.
              Every detail is engineered for control, speed, and consistency.
              No excess. No compromise. Only refinement where it matters."
            </blockquote>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
            }}>
              <div style={{ height: '1px', width: '60px', background: 'var(--primary)', opacity: 0.4 }} />
              <p style={{
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '4px',
                textTransform: 'uppercase', color: 'var(--primary)',
              }}>Founding Principle</p>
              <div style={{ height: '1px', width: '60px', background: 'var(--primary)', opacity: 0.4 }} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — Close the loop
      ═══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(80px, 14vw, 160px) clamp(20px, 5vw, 24px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', bottom: '-30%', left: '50%', transform: 'translateX(-50%)',
          width: '800px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} aria-hidden="true" />

        <div className="ab-fade" style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '5px',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: '28px',
          }}>Ready?</p>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
            fontWeight: 950,
            textTransform: 'uppercase',
            letterSpacing: '-0.04em',
            lineHeight: 0.9,
            marginBottom: '48px',
          }}>
            Play Without<br /><span className="lu-gold">Limits.</span>
          </h2>
          <Link to="/series" className="lu-btn-primary">Shop the Collection</Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .aerion-about-visuals {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
