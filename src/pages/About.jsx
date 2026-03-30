import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.about-section');
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-[#0e1018] text-white overflow-hidden">
      {/* Block 1 — BRAND ESSENCE (Centered) */}
      <section className="about-section lu-section min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <p className="lu-overline mb-8 text-xs tracking-[0.3em] uppercase opacity-70">The Standard</p>
        <h1 className="lu-section-title text-[clamp(2.5rem,6vw,6rem)] font-black leading-[1] tracking-tighter max-w-5xl mb-12">
          THE AERION STANDARD
        </h1>
        <div className="w-12 h-[1px] bg-primary/40 my-8"></div>
        <p className="lu-section-sub text-lg md:text-xl leading-relaxed max-w-prose mx-auto font-light text-[#f0f0f0]">
          Aerion exists to remove uncertainty from the game. <br className="hidden md:block" />
          Every product is engineered for consistent flight, controlled speed, and precise response. <br className="hidden md:block" />
          Because at the highest level, even the smallest inconsistency matters.
        </p>
      </section>

      <div className="lu-container px-4"><div className="h-[1px] w-full bg-white/5"></div></div>

      {/* Block 2 — ENGINEERING (Left Aligned) */}
      <section className="about-section lu-section py-32">
        <div className="lu-container px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-left w-full pr-0 md:pr-12">
            <p className="lu-overline mb-6 text-primary tracking-[0.2em] text-xs uppercase">Precision</p>
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter leading-[1.1]">
              ENGINEERED WITH INTENT
            </h2>
            <p className="text-[#a0a0a5] text-lg leading-relaxed max-w-prose mb-8">
              From feather selection to cork density, every detail is chosen with precision.
              Each component is refined to ensure balance, stability, and repeatability.
            </p>
            <p className="text-[#d1d1d6] font-medium border-l-[3px] border-primary/60 pl-6 py-2 text-lg">
              Nothing is left to chance.
            </p>
          </div>
          <div className="hidden md:block">
            {/* Visual element space reserved perfectly on the right half */}
          </div>
        </div>
      </section>

      <div className="lu-container px-4"><div className="h-[1px] w-full bg-white/5 opacity-50 ml-auto max-w-md"></div></div>

      {/* Block 3 — TESTING (Right Aligned) */}
      <section className="about-section lu-section py-32">
        <div className="lu-container px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="hidden md:block">
             {/* Visual element space reserved on the left half */}
          </div>
          <div className="text-left md:col-start-2 pl-0 md:pl-12">
            <p className="lu-overline mb-6 text-primary tracking-[0.2em] text-xs uppercase">Verification</p>
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter leading-[1.1]">
              TESTED FOR PERFORMANCE
            </h2>
            <p className="text-[#a0a0a5] text-lg leading-relaxed max-w-prose mb-8">
              Every Aerion shuttlecock is evaluated under controlled conditions.
              Speed consistency, flight stability, and recovery response are measured precisely.
            </p>
            <p className="text-[#d1d1d6] font-medium border-l-[3px] md:border-l-0 md:border-r-[3px] border-primary/60 pl-6 md:pl-0 md:pr-6 py-2 text-lg md:text-right">
              So performance remains constant—every rally, every match.
            </p>
          </div>
        </div>
      </section>

      <div className="lu-container px-4"><div className="h-[1px] w-full bg-white/10 my-12"></div></div>

      {/* Block 4 — PLAYER FOCUS (Centered Large Text) */}
      <section className="about-section lu-section py-48 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-transparent to-[#c9a84c05]">
        <div className="max-w-5xl">
          <h2 className="text-[clamp(3rem,7vw,7rem)] font-black tracking-tightest mb-12 text-white uppercase italic leading-[0.9]">
            BUILT FOR THOSE <br /> WHO NOTICE
          </h2>
          <p className="text-xl md:text-2xl text-[#f0f0f0] font-light leading-relaxed max-w-prose mx-auto opacity-80">
            Aerion is designed for players who understand control and timing.
            For those who demand precision—not just performance.
            For those who expect consistency without compromise.
          </p>
        </div>
      </section>

      {/* Block 5 — BRAND PHILOSOPHY (Minimal Closing) */}
      <section className="about-section lu-section py-32 flex flex-col items-center justify-center text-center px-4">
        <p className="lu-overline mb-8 opacity-40 tracking-[0.3em] uppercase text-xs">Persistence</p>
        <h2 className="text-3xl md:text-4xl font-black mb-8 tracking-widest text-primary">PRECISION IN MOTION</h2>
        <div className="max-w-lg space-y-3 opacity-60 text-sm tracking-[0.15em] leading-loose">
          <p>No excess. No compromise.</p>
          <p>Only refinement where it matters.</p>
          <p>Aerion moves with you—silently, consistently, and without error.</p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .tracking-tightest { letter-spacing: -0.05em; }
        .tracking-loose { letter-spacing: 0.2em; }
      ` }} />
    </div>
  );
}
