import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade up elements
      gsap.utils.toArray('.fade-up').forEach((el) => {
        gsap.fromTo(el, 
          { opacity: 0, y: 50 }, 
          {
            opacity: 1, 
            y: 0, 
            duration: 1.2, 
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            }
          }
        );
      });

      // Divider line animation
      gsap.utils.toArray('.line-reveal').forEach((el) => {
        gsap.fromTo(el, 
          { scaleX: 0 }, 
          {
            scaleX: 1, 
            duration: 1.5, 
            ease: 'power4.inOut',
            scrollTrigger: { trigger: el, start: 'top 85%' }
          }
        );
      });
      
      // Hero image slight parallax
      gsap.to('.hero-bg', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#090b0f] text-white min-h-screen overflow-hidden" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=Barlow+Condensed:wght@300;400;600;700;800&display=swap');
        .font-display { font-family: 'Barlow Condensed', sans-serif; }
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .gold { color: #c9a84c; }
        .cream { color: #f0ede8; }
        
        .line-reveal { transform-origin: center; }
        .divider-line {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.3), transparent);
        }
      `}</style>



      {/* 🔥 BLOCK 1 — BRAND ESSENCE (Centered) */}
      <section className="relative z-10 text-center" style={{ padding: '14rem 12vw 8rem' }}>
        <div className="fade-up">
          <p className="font-display text-[12px] tracking-[0.4em] uppercase mb-8 gold">Brand Essence</p>
          <h2 className="font-display font-black uppercase leading-none mb-12 cream" style={{ fontSize: 'clamp(3rem, 6vw, 6.5rem)', letterSpacing: '-0.02em' }}>
            The Aerion Standard
          </h2>
          <div className="text-xl md:text-2xl leading-relaxed space-y-8 mx-auto" style={{ color: 'rgba(240,237,232,0.6)', fontWeight: 300, maxWidth: '680px' }}>
            <p>Aerion exists for one purpose — to remove uncertainty from the game.</p>
            <p>Every product is designed to deliver consistent flight, controlled speed, and precise response. No distractions. No irregularities. Just performance you can rely on.</p>
            <p className="italic font-serif" style={{ color: '#c9a84c', opacity: 0.9 }}>Because at the highest level, even the smallest inconsistency matters.</p>
          </div>
        </div>
      </section>

      {/* [Divider] */}
      <div className="relative z-10 py-4" style={{ padding: '1rem 8vw' }}>
        <div className="line-reveal divider-line w-full" />
      </div>

      {/* ⚙️ BLOCK 2 — ENGINEERING PHILOSOPHY (Left Anchored) */}
      <section className="relative z-10" style={{ padding: '8rem 8vw 8rem 8vw' }}>
        <div className="fade-up" style={{ maxWidth: '520px' }}>
          <p className="font-display text-[12px] tracking-[0.4em] uppercase mb-8 gold">Engineering Philosophy</p>
          <h2 className="font-display font-black uppercase leading-none mb-10 cream" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '-0.02em' }}>
            Engineered With<br /><span className="italic font-serif font-light" style={{ WebkitTextStroke: '1px rgba(201,168,76,0.6)', color: 'transparent' }}>Intent</span>
          </h2>
          <div className="text-lg md:text-xl leading-relaxed space-y-6" style={{ color: 'rgba(240,237,232,0.5)', fontWeight: 300 }}>
            <p>From feather selection to cork density, every component is chosen with precision.</p>
            <p>Our process focuses on balance, stability, and repeatability—ensuring that each shuttle performs exactly as expected, rally after rally.</p>
            <p className="italic border-l-2 pl-6 mt-8 font-serif" style={{ borderColor: '#c9a84c', color: '#f0ede8', opacity: 0.8 }}>Nothing is left to chance.</p>
          </div>
        </div>
      </section>

      {/* 🧪 BLOCK 3 — PERFORMANCE TESTING (Right Anchored) */}
      <section className="relative z-10 flex justify-end" style={{ padding: '8rem 8vw 8rem 8vw' }}>
        <div className="fade-up text-right" style={{ maxWidth: '520px' }}>
          <p className="font-display text-[12px] tracking-[0.4em] uppercase mb-8 gold">Performance Testing</p>
          <h2 className="font-display font-black uppercase leading-none mb-10 cream" style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)', letterSpacing: '-0.02em' }}>
            Tested For<br /><span className="italic font-serif font-light" style={{ WebkitTextStroke: '1px rgba(201,168,76,0.6)', color: 'transparent' }}>Real Play</span>
          </h2>
          <div className="text-lg md:text-xl leading-relaxed space-y-6" style={{ color: 'rgba(240,237,232,0.5)', fontWeight: 300 }}>
            <p>Aerion products are developed under controlled conditions to simulate real match environments.</p>
            <p>Each batch is evaluated for speed consistency, flight stability, and recovery response—so players experience the same level of performance every time they step onto the court.</p>
          </div>
        </div>
      </section>

      {/* 🎯 BLOCK 4 — PLAYER FOCUS (Centered large text) */}
      <section className="relative z-10 py-48 px-6 text-center" style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.03), transparent)' }}>
        <div className="max-w-4xl mx-auto fade-up">
          <p className="font-display text-[12px] tracking-[0.4em] uppercase mb-10 gold">Player Focus</p>
          <h2 className="font-display font-black uppercase leading-none mb-12" style={{ fontSize: 'clamp(3rem, 7.5vw, 7rem)', letterSpacing: '-0.03em', color: '#f0ede8' }}>
            Built For Those<br />Who <span className="gold italic font-serif">Notice</span>
          </h2>
          <div className="text-xl md:text-3xl leading-relaxed space-y-6 mx-auto" style={{ color: 'rgba(240,237,232,0.4)', fontWeight: 300, maxWidth: '800px', fontStyle: 'italic' }}>
            <p>Aerion is not made for casual play.</p>
            <p>It is built for players who understand timing, control, and the difference precision makes in competition. For those who demand more from their equipment—and expect it to deliver.</p>
          </div>
        </div>
      </section>

      {/* 💎 BLOCK 5 — BRAND PHILOSOPHY (Closing Impact) */}
      <section className="relative z-10 py-40 px-6 text-center border-t border-[#c9a84c]/20">
        <div className="max-w-3xl mx-auto fade-up">
          <p className="font-display text-[12px] tracking-[0.4em] uppercase mb-12 opacity-30 gold">Brand Philosophy</p>
          <h2 className="font-display font-black uppercase tracking-widest mb-16 gold" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', letterSpacing: '0.1em' }}>
            Precision In Motion
          </h2>
          <div className="text-sm md:text-base tracking-[0.2em] leading-[3em] uppercase space-y-2" style={{ color: 'rgba(240,237,232,0.4)' }}>
            <p>No excess. No compromise.</p>
            <p>Only refinement where it matters.</p>
            <p className="mt-8 font-serif italic normal-case text-xl md:text-2xl" style={{ color: '#f0ede8', opacity: 0.8, letterSpacing: 'normal' }}>
              Aerion is designed to move with you—silently, consistently, and without error.
            </p>
          </div>
          
          <div className="mt-32 flex items-center justify-center gap-6 opacity-40">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#c9a84c]" />
            <div className="w-2 h-2 rotate-45 bg-[#c9a84c]" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#c9a84c]" />
          </div>
        </div>
      </section>
    </div>
  );
}
