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
        <p className="lu-overline mb-4">The Standard</p>
        <h1 className="lu-section-title max-w-4xl">THE AERION STANDARD</h1>
        <div className="w-12 h-[1px] bg-primary/30 my-8"></div>
        <p className="lu-section-sub max-w-2xl mx-auto leading-relaxed">
          Aerion exists to remove uncertainty from the game. <br />
          Every product is engineered for consistent flight, controlled speed, and precise response. <br />
          Because at the highest level, even the smallest inconsistency matters.
        </p>
      </section>

      <div className="lu-container px-4"><div className="h-[1px] w-full bg-white/5"></div></div>

      {/* Block 2 — ENGINEERING (Left Aligned) */}
      <section className="about-section lu-section py-32">
        <div className="lu-container px-4 grid md:grid-columns-2 gap-12 items-center">
          <div className="max-w-xl text-left">
            <p className="lu-overline mb-4 text-primary">Precision</p>
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tighter">ENGINEERED WITH INTENT</h2>
            <p className="text-[#a0a0a5] text-lg leading-relaxed mb-4">
              From feather selection to cork density, every detail is chosen with precision.
              Each component is refined to ensure balance, stability, and repeatability.
            </p>
            <p className="text-[#a0a0a5] font-medium border-l-2 border-primary/40 pl-6 py-2">
              Nothing is left to chance.
            </p>
          </div>
          <div className="hidden md:block">
            {/* Visual element placeholder or subtle shadow */}
          </div>
        </div>
      </section>

      <div className="lu-container px-4"><div className="h-[1px] w-full bg-white/5 opacity-50 ml-auto max-w-md"></div></div>

      {/* Block 3 — TESTING (Right Aligned) */}
      <section className="about-section lu-section py-32">
        <div className="lu-container px-4 flex justify-end">
          <div className="max-w-xl text-right">
            <p className="lu-overline mb-4 text-primary">Verification</p>
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tighter">TESTED FOR PERFORMANCE</h2>
            <p className="text-[#a0a0a5] text-lg leading-relaxed mb-4">
              Every Aerion shuttlecock is evaluated under controlled conditions.
              Speed consistency, flight stability, and recovery response are measured precisely.
            </p>
            <p className="text-[#a0a0a5] font-medium border-r-2 border-primary/40 pr-6 py-2">
              So performance remains constant—every rally, every match.
            </p>
          </div>
        </div>
      </section>

      <div className="lu-container px-4"><div className="h-[1px] w-full bg-white/10 my-12"></div></div>

      {/* Block 4 — PLAYER FOCUS (Centered Large Text) */}
      <section className="about-section lu-section py-40 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-transparent to-[#c9a84c05]">
        <div className="max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-black tracking-tightest mb-8 text-white uppercase italic">
            BUILT FOR THOSE <br /> WHO NOTICE
          </h2>
          <p className="text-xl md:text-2xl text-[#f0f0f0] font-light leading-relaxed max-w-3xl mx-auto opacity-80">
            Aerion is designed for players who understand control and timing.
            For those who demand precision—not just performance.
            For those who expect consistency without compromise.
          </p>
        </div>
      </section>

      {/* Block 5 — BRAND PHILOSOPHY (Minimal Closing) */}
      <section className="about-section lu-section py-32 flex flex-col items-center justify-center text-center px-4">
        <p className="lu-overline mb-8 opacity-40">Persistence</p>
        <h2 className="text-2xl md:text-3xl font-black mb-6 tracking-widest text-primary">PRECISION IN MOTION</h2>
        <div className="max-w-lg space-y-2 opacity-60 text-sm tracking-loose">
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
