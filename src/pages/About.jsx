import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import aboutBlueprint from '../assets/about-blueprint.png';

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '0.03g', label: 'Weight Variance Tolerance' },
  { value: '99.6%', label: 'Flight Path Accuracy' },
  { value: '16', label: 'Feathers Per Shuttle' },
  { value: '±2%', label: 'Speed Consistency Range' },
];

const PILLARS = [
  { num: '01', title: 'Selection', body: 'Only feathers from the left wing of select waterfowl are used. Symmetry is non-negotiable at this level.' },
  { num: '02', title: 'Calibration', body: 'Cork density is measured per batch. Every base undergoes tensile testing before assembly begins.' },
  { num: '03', title: 'Verification', body: 'Finished shuttles are machine-launched and tracked at 120 fps. Outliers are discarded, not adjusted.' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function About() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const blueprintRef = useRef(null);
  const textBlockRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [hasScrolled, setHasScrolled] = useState(false);

  // Mouse parallax
  useEffect(() => {
    const onMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Scroll indicator
  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo('.hero-overline', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' });
      gsap.fromTo('.hero-title-word', { opacity: 0, y: 60, rotateX: -20 }, {
        opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease: 'power4.out',
        stagger: 0.08, delay: 0.5,
      });
      gsap.fromTo('.hero-sub', { opacity: 0 }, { opacity: 1, duration: 1.5, delay: 1.2 });
      gsap.fromTo('.hero-scroll-hint', { opacity: 0 }, { opacity: 1, duration: 1, delay: 2 });

      // Blueprint parallax fade on scroll
      gsap.to(blueprintRef.current, {
        opacity: 0,
        y: 80,
        scale: 0.96,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Stats
      gsap.fromTo('.stat-item', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.stats-section', start: 'top 80%' },
      });

      // Line reveal
      gsap.fromTo('.line-reveal', { scaleX: 0 }, {
        scaleX: 1, duration: 1.4, ease: 'power4.inOut',
        scrollTrigger: { trigger: '.line-reveal', start: 'top 85%' },
      });

      // Section fades
      gsap.utils.toArray('.fade-up').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });

      // Pillars stagger
      gsap.fromTo('.pillar-card', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, stagger: 0.18, ease: 'power3.out',
        scrollTrigger: { trigger: '.pillars-section', start: 'top 80%' },
      });

      // Closing quote word-by-word
      gsap.fromTo('.quote-word', { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out',
        scrollTrigger: { trigger: '.closing-section', start: 'top 75%' },
      });

      // Marquee
      gsap.fromTo('.marquee-track', { x: '0%' }, { x: '-50%', duration: 30, ease: 'none', repeat: -1 });

      // Ambient parallax
      gsap.to('.parallax-slow', {
        y: -80, ease: 'none',
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom bottom', scrub: true },
      });
      gsap.to('.parallax-fast', {
        y: -160, ease: 'none',
        scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom bottom', scrub: true },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const px = (mousePos.x - 0.5) * 20;
  const py = (mousePos.y - 0.5) * 14;

  return (
    <div ref={containerRef} className="relative bg-[#090b0f] text-white overflow-hidden" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=Barlow+Condensed:wght@300;400;600;700;800&display=swap');

        :root {
          --gold: #c9a84c;
          --gold-dim: rgba(201,168,76,0.15);
          --gold-glow: rgba(201,168,76,0.08);
          --cream: #f0ede8;
          --gray-mid: #6b6b72;
          --bg: #090b0f;
          --surface: #0f1218;
        }

        * { box-sizing: border-box; }
        .font-display { font-family: 'Barlow Condensed', sans-serif; }
        .font-serif   { font-family: 'Cormorant Garamond', serif; }
        .gold         { color: var(--gold); }
        .gold-glow    { text-shadow: 0 0 40px rgba(201,168,76,0.25), 0 0 80px rgba(201,168,76,0.08); }

        /* Grain */
        .grain::after {
          content: '';
          position: fixed;
          inset: -200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.032;
          pointer-events: none;
          z-index: 9999;
        }

        .hero-title { perspective: 800px; }

        /*
         * ── Blueprint image container ──────────────────────────────────
         *
         * Sits absolutely inside the hero section.
         *   top: 0         → flush with top of section = bottom of nav
         *   height         → measured by BlueprintZone to stop exactly
         *                    where the text block begins (via --text-top)
         *
         * The 16px gap keeps the image from visually bleeding into the overline.
         */
        .blueprint-wrap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: calc(var(--text-top, 128px) - 16px);
          min-height: 160px;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .blueprint-wrap img {
          width: 100%;
          height: 100%;
          /*
           * contain → preserves resolution and aspect ratio without stretching
           */
          object-fit: contain;
          object-position: center bottom;   /* anchor shuttle base toward text */
          mix-blend-mode: screen;
          display: block;
        }

        /* Soft bottom fade so the image dissolves into the background */
        .blueprint-wrap::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(to bottom, transparent, #090b0f);
          pointer-events: none;
        }

        /* Stat hover */
        .stat-item {
          position: relative;
          cursor: default;
          transition: border-color 0.4s;
        }
        .stat-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.5s;
        }
        .stat-item:hover::before { opacity: 1; }
        .stat-item:hover { border-color: rgba(201,168,76,0.4) !important; }

        /* Pillar card */
        .pillar-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005));
          border: 1px solid rgba(255,255,255,0.05);
          transition: border-color 0.4s, transform 0.4s;
        }
        .pillar-card:hover {
          border-color: rgba(201,168,76,0.25);
          transform: translateY(-4px);
        }

        /* Marquee */
        .marquee-wrap { overflow: hidden; white-space: nowrap; }
        .marquee-track { display: inline-block; }

        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(8px); opacity: 1; }
        }
        .scroll-bounce { animation: scrollBounce 2s ease-in-out infinite; }

        .divider-line {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent);
        }
        .line-reveal { transform-origin: left center; }
        .quote-word  { display: inline-block; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, var(--gold) 0%, #f8eaaa 50%, var(--gold) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        @keyframes spincw  { to { transform: rotate(360deg);  } }
        @keyframes spinccw { to { transform: rotate(-360deg); } }

        @media (max-width: 768px) {
          .blueprint-wrap img { object-fit: contain; object-position: center center; }
          .stat-item { padding: 28px 16px !important; }
          .pillar-card { padding: 28px 20px !important; }
        }
      `}</style>

      {/* Grain */}
      <div className="grain pointer-events-none" />

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="parallax-slow absolute rounded-full"
          style={{ width: 700, height: 700, top: '5%', left: '-15%', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="parallax-fast absolute rounded-full"
          style={{ width: 500, height: 500, top: '40%', right: '-10%', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="parallax-slow absolute rounded-full"
          style={{ width: 400, height: 400, bottom: '10%', left: '20%', background: 'radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-[65vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-16"
      >
        {/*
          BlueprintZone measures textBlockRef.offsetTop relative to heroRef
          and writes it as --text-top on the hero section element.
          .blueprint-wrap height = calc(--text-top - 16px)
          → image ends exactly 16px above the first text.
        */}
        <BlueprintZone
          blueprintRef={blueprintRef}
          heroRef={heroRef}
          textBlockRef={textBlockRef}
        />

        {/* Corner marks */}
        <span className="absolute top-12 left-12 w-8 h-8 border-l border-t opacity-20 hidden md:block" style={{ borderColor: 'var(--gold)' }} />
        <span className="absolute top-12 right-12 w-8 h-8 border-r border-t opacity-20 hidden md:block" style={{ borderColor: 'var(--gold)' }} />
        <span className="absolute bottom-12 left-12 w-8 h-8 border-l border-b opacity-20 hidden md:block" style={{ borderColor: 'var(--gold)' }} />
        <span className="absolute bottom-12 right-12 w-8 h-8 border-r border-b opacity-20 hidden md:block" style={{ borderColor: 'var(--gold)' }} />

        {/* ── Text block — measured by BlueprintZone ── */}
        <div ref={textBlockRef} className="relative z-10 flex flex-col items-center">
          <p className="hero-overline font-display text-xs tracking-[0.4em] uppercase mb-10 opacity-50">
            The Standard · Since Origin
          </p>

          <div className="hero-title mb-12" style={{ maxWidth: 900 }}>
            {'THE AERION STANDARD'.split(' ').map((word, i) => (
              <span key={i} className="hero-title-word inline-block mr-4 last:mr-0">
                <span
                  className="font-display font-black leading-none uppercase"
                  style={{
                    fontSize: 'clamp(3.5rem, 9vw, 8.5rem)',
                    letterSpacing: '-0.02em',
                    color: i === 1 ? 'transparent' : 'var(--cream)',
                    WebkitTextStroke: i === 1 ? '1px rgba(201,168,76,0.7)' : 'none',
                    display: 'block',
                    lineHeight: 0.92,
                    transition: 'transform 0.3s',
                    transform: `translateX(${px * (i % 2 === 0 ? 0.4 : -0.4)}px) translateY(${py * 0.3}px)`,
                  }}
                >
                  {word}
                </span>
              </span>
            ))}
          </div>

          <div className="hero-sub max-w-xl mx-auto" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontWeight: 300 }}>
            <p className="text-xl md:text-2xl leading-relaxed" style={{ color: 'rgba(240,237,232,0.55)' }}>
              Aerion exists to remove uncertainty from the game.
              Every product is engineered for consistent flight,
              controlled speed, and precise response.
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll-hint absolute bottom-10 flex flex-col items-center gap-3 opacity-0">
          <p className="font-display text-[10px] tracking-[0.3em] uppercase" style={{ color: 'var(--gold)', opacity: 0.6 }}>Scroll</p>
          <div className="scroll-bounce w-[1px] h-8" style={{ background: 'linear-gradient(to bottom, rgba(201,168,76,0.6), transparent)' }} />
        </div>
      </section>

      {/* ─── Marquee ticker ─────────────────────────────────────────────── */}
      <div className="relative z-10 py-6 overflow-hidden" style={{ borderTop: '1px solid rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.1)', background: 'rgba(201,168,76,0.02)' }}>
        <div className="marquee-wrap">
          <div className="marquee-track font-display font-semibold text-sm tracking-[0.3em] uppercase" style={{ color: 'rgba(201,168,76,0.4)' }}>
            {Array(8).fill('PRECISION IN MOTION · ENGINEERED FOR PERFORMANCE · ZERO VARIANCE · AERION ·').join(' ')}&nbsp;
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="stats-section relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {STATS.map((s, i) => (
              <div key={i} className="stat-item p-10 text-center" style={{ background: 'var(--bg)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <p className="shimmer-text font-display font-black mb-3" style={{ fontSize: 'clamp(2rem,4vw,3rem)', letterSpacing: '-0.02em' }}>
                  {s.value}
                </p>
                <p className="font-display text-[10px] tracking-[0.25em] uppercase" style={{ color: 'var(--gray-mid)' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Divider ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 py-4 max-w-5xl mx-auto">
        <div className="line-reveal divider-line" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          ENGINEERING — LEFT
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="fade-up">
            <p className="font-display text-[10px] tracking-[0.4em] uppercase mb-8" style={{ color: 'var(--gold)' }}>Precision Engineering</p>
            <h2 className="font-display font-black uppercase leading-none mb-10" style={{ fontSize: 'clamp(2.8rem,5.5vw,5.5rem)', letterSpacing: '-0.03em', color: 'var(--cream)' }}>
              Engineered<br /><em style={{ fontStyle: 'italic', WebkitTextStroke: '1px rgba(201,168,76,0.6)', color: 'transparent', fontFamily: 'Cormorant Garamond' }}>With Intent</em>
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Cormorant Garamond', fontWeight: 300 }}>
              From feather selection to cork density, every component is chosen with deliberate precision.
              Balance, stability, and repeatability are not targets—they are the baseline.
            </p>
            <blockquote className="py-4 pl-6 text-lg" style={{ borderLeft: '2px solid var(--gold)', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', color: 'var(--cream)', opacity: 0.8 }}>
              "Nothing is left to chance."
            </blockquote>
          </div>

          <div className="fade-up hidden md:flex items-center justify-center">
            <div className="relative" style={{ width: 320, height: 320 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="absolute rounded-full" style={{
                  inset: i * 36,
                  border: `1px solid rgba(201,168,76,${0.18 - i * 0.04})`,
                  animation: `spin${i % 2 === 0 ? 'cw' : 'ccw'} ${20 + i * 8}s linear infinite`,
                }} />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.3), rgba(201,168,76,0.05))', boxShadow: '0 0 40px rgba(201,168,76,0.2)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Divider ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 py-4 max-w-5xl mx-auto">
        <div className="line-reveal divider-line" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TESTING — RIGHT
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <div className="fade-up hidden md:flex items-center justify-center">
            <div className="relative" style={{ width: 300, height: 300 }}>
              <svg viewBox="0 0 300 300" width="300" height="300" style={{ opacity: 0.25 }}>
                {Array.from({ length: 8 }).map((_, row) =>
                  Array.from({ length: 8 }).map((__, col) => (
                    <circle key={`${row}-${col}`} cx={20 + col * 38} cy={20 + row * 38} r="1.5" fill="#c9a84c" />
                  ))
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 80 80" width="80" height="80">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(201,168,76,0.5)" strokeWidth="0.8" />
                  <circle cx="40" cy="40" r="18" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="0.8" />
                  <circle cx="40" cy="40" r="4" fill="rgba(201,168,76,0.7)" />
                  <line x1="10" y1="40" x2="30" y2="40" stroke="rgba(201,168,76,0.5)" strokeWidth="0.8" />
                  <line x1="50" y1="40" x2="70" y2="40" stroke="rgba(201,168,76,0.5)" strokeWidth="0.8" />
                  <line x1="40" y1="10" x2="40" y2="30" stroke="rgba(201,168,76,0.5)" strokeWidth="0.8" />
                  <line x1="40" y1="50" x2="40" y2="70" stroke="rgba(201,168,76,0.5)" strokeWidth="0.8" />
                </svg>
              </div>
            </div>
          </div>

          <div className="fade-up">
            <p className="font-display text-[10px] tracking-[0.4em] uppercase mb-8" style={{ color: 'var(--gold)' }}>Verification</p>
            <h2 className="font-display font-black uppercase leading-none mb-10" style={{ fontSize: 'clamp(2.8rem,5.5vw,5.5rem)', letterSpacing: '-0.03em', color: 'var(--cream)' }}>
              Tested For<br /><em style={{ fontStyle: 'italic', WebkitTextStroke: '1px rgba(201,168,76,0.6)', color: 'transparent', fontFamily: 'Cormorant Garamond' }}>Performance</em>
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: 'rgba(240,237,232,0.45)', fontFamily: 'Cormorant Garamond', fontWeight: 300 }}>
              Every Aerion shuttlecock is evaluated under controlled conditions.
              Speed consistency, flight stability, and recovery response are measured precisely—not approximated.
            </p>
            <blockquote className="py-4 pr-6 text-lg text-right" style={{ borderRight: '2px solid var(--gold)', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', color: 'var(--cream)', opacity: 0.8 }}>
              "Performance remains constant—every rally, every match."
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─── Divider ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 py-4 max-w-5xl mx-auto">
        <div className="line-reveal divider-line" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PILLARS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="pillars-section relative z-10 py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="fade-up text-center mb-20">
            <p className="font-display text-[10px] tracking-[0.4em] uppercase mb-6" style={{ color: 'var(--gold)' }}>Process</p>
            <h2 className="font-display font-black uppercase leading-none" style={{ fontSize: 'clamp(2.5rem,5vw,5rem)', letterSpacing: '-0.03em', color: 'var(--cream)' }}>
              How We Build
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.num} className="pillar-card p-10 rounded-sm">
                <p className="font-display font-black mb-6" style={{ fontSize: '3.5rem', lineHeight: 1, color: 'rgba(201,168,76,0.15)', letterSpacing: '-0.04em' }}>
                  {p.num}
                </p>
                <h3 className="font-display font-bold uppercase tracking-wider text-lg mb-4" style={{ color: 'var(--cream)', letterSpacing: '0.12em' }}>
                  {p.title}
                </h3>
                <p className="text-base leading-relaxed" style={{ fontFamily: 'Cormorant Garamond', fontWeight: 300, color: 'rgba(240,237,232,0.45)' }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BUILT FOR THOSE WHO NOTICE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-48 px-6" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.025), transparent)' }}>
        <div className="max-w-4xl mx-auto text-center fade-up">
          <h2 className="font-display font-black uppercase leading-none mb-10 gold-glow" style={{ fontSize: 'clamp(3.5rem,8vw,8rem)', letterSpacing: '-0.03em', color: 'var(--cream)', fontStyle: 'italic' }}>
            Built for Those<br />
            <span style={{ WebkitTextStroke: '1px rgba(201,168,76,0.55)', color: 'transparent' }}>Who Notice</span>
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed mx-auto" style={{ fontFamily: 'Cormorant Garamond', fontWeight: 300, fontStyle: 'italic', color: 'rgba(240,237,232,0.5)', maxWidth: 540 }}>
            For players who understand control. For those who demand precision—not just performance.
            For those who expect consistency without compromise.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CLOSING — PHILOSOPHY
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="closing-section relative z-10 py-40 px-6 text-center" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
        <span className="absolute top-12 left-12 w-6 h-6 border-l border-t opacity-15 hidden md:block" style={{ borderColor: 'var(--gold)' }} />
        <span className="absolute top-12 right-12 w-6 h-6 border-r border-t opacity-15 hidden md:block" style={{ borderColor: 'var(--gold)' }} />

        <div className="max-w-2xl mx-auto">
          <p className="font-display text-[10px] tracking-[0.4em] uppercase mb-10 opacity-30">Philosophy</p>
          <h2 className="font-display font-black uppercase mb-10" style={{ fontSize: 'clamp(1.8rem,4vw,3.5rem)', letterSpacing: '0.08em', color: 'var(--gold)' }}>
            Precision in Motion
          </h2>
          <div className="space-y-1 text-sm tracking-widest" style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', lineHeight: 2.2 }}>
            {'No excess. No compromise. Only refinement where it matters. Aerion moves with you—silently, consistently, and without error.'.split(' ').map((word, i) => (
              <span key={i} className="quote-word" style={{ color: 'rgba(240,237,232,0.35)', marginRight: '0.4em' }}>{word}</span>
            ))}
          </div>
          <div className="mt-20 flex items-center justify-center gap-6">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.25))' }} />
            <div style={{ width: 6, height: 6, background: 'var(--gold)', transform: 'rotate(45deg)', opacity: 0.6 }} />
            <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.25))' }} />
          </div>
          <p className="mt-10 font-display text-[10px] tracking-[0.4em] uppercase opacity-20">Aerion · All Rights Reserved</p>
        </div>
      </section>
    </div>
  );
}

// ─── BlueprintZone ────────────────────────────────────────────────────────────
//
// Renders the blueprint image wrapper and keeps its height pixel-accurate by
// measuring the text block's distance from the hero top on every resize.
//
// Layout logic:
//   • The hero section is `position: relative`
//   • .blueprint-wrap is `position: absolute; top: 0`
//   • Its height = textBlockRef.offsetTop - 16px  (16px breathing gap)
//   • This value is stored as --text-top on the hero element so pure CSS
//     can consume it, with a sensible fallback of 128px (= Tailwind pt-32)
//
function BlueprintZone({ blueprintRef, heroRef, textBlockRef }) {
  useEffect(() => {
    function measure() {
      if (!heroRef.current || !textBlockRef.current) return;

      // offsetTop gives distance from the nearest positioned ancestor (the hero section)
      const textTop = textBlockRef.current.offsetTop;
      heroRef.current.style.setProperty('--text-top', `${textTop}px`);
    }

    measure();

    const ro = new ResizeObserver(measure);
    if (heroRef.current) ro.observe(heroRef.current);
    if (textBlockRef.current) ro.observe(textBlockRef.current);

    // Re-measure once custom fonts are loaded (they affect layout height)
    document.fonts?.ready?.then(measure);

    return () => ro.disconnect();
  }, [heroRef, textBlockRef]);

  return (
    <div className="blueprint-wrap" ref={blueprintRef}>
      <img
        src={aboutBlueprint}
        alt="Aerion Shuttlecock Blueprint"
        style={{ opacity: 0.72 }}
      />
      {/* Subtle radial warmth behind the image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}