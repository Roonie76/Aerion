// NEW: Gold curtain sweep on route change.
// Runs whenever `pathname` changes: covers screen L→R, then uncovers L→R.
//
// Mount once inside <Router>. Skipped for reduced-motion users.

import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

export default function PageTransition() {
  const curtainRef = useRef(null);
  const location = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render — we don't want a curtain on initial load
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const el = curtainRef.current;
    if (!el) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) return;

    const tl = gsap.timeline();
    // Cover L→R
    tl.fromTo(
      el,
      { scaleX: 0, transformOrigin: 'left center', opacity: 1 },
      { scaleX: 1, duration: 0.55, ease: 'power3.inOut' }
    );
    // Brief hold
    tl.to(el, { opacity: 1, duration: 0.05 });
    // Uncover L→R (switch origin so it sweeps off the right edge)
    tl.to(el, {
      scaleX: 0,
      transformOrigin: 'right center',
      duration: 0.55,
      ease: 'power3.inOut',
    });

    return () => tl.kill();
  }, [location.pathname]);

  return <div ref={curtainRef} className="page-transition-curtain" aria-hidden="true" />;
}
