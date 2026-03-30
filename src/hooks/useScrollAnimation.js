// NEW: GSAP Scroll Trigger Animation Hook
import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function useScrollAnimation(ref, stagger = 0.2) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll('.animate-on-scroll');
    if (targets.length === 0) return;

    gsap.fromTo(
      targets,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true, // Animation triggers only once
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [ref, stagger]);
}
