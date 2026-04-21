// UPDATED: Smooth, lerp-damped 3D tilt with on-brand gold specular shimmer.
// Drop-in replacement for the old useTiltEffect — same call signature.
//
//   useTiltEffect(maxTilt = 10, perspective = 1000)
//
// What changed vs. the previous version:
//   - Replaced raw mousemove->transform writes with a requestAnimationFrame
//     lerp loop, eliminating the jittery feel on fast pointer motion.
//   - Removed the red box-shadow (was rgba(255,0,0,0.3)) - swapped for a
//     gold glow aligned with the brand palette.
//   - Added a CSS-variable driven radial "shimmer" that follows the cursor,
//     so cards get a specular highlight that actually reads like glass.
//   - Respects prefers-reduced-motion.
//   - Skips on touch devices (tilt on touch was always janky).

import { useEffect, useRef } from 'react';

export default function useTiltEffect(maxTilt = 10, perspective = 1000) {
  const tiltRef = useRef(null);

  useEffect(() => {
    const card = tiltRef.current;
    if (!card) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (prefersReduce || isTouch) return;

    // CSS hook so we can drive the shimmer from here
    card.classList.add('has-tilt');

    // Target vs. rendered state - lerped each frame
    const target = { rx: 0, ry: 0, mx: 50, my: 50, active: 0 };
    const current = { rx: 0, ry: 0, mx: 50, my: 50, active: 0 };
    let raf;
    let rect = card.getBoundingClientRect();

    const refreshRect = () => {
      rect = card.getBoundingClientRect();
    };
    window.addEventListener('resize', refreshRect);
    window.addEventListener('scroll', refreshRect, { passive: true });

    const onMove = (e) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      target.mx = (x / rect.width) * 100;
      target.my = (y / rect.height) * 100;
    };

    const onEnter = () => {
      refreshRect();
      target.active = 1;
    };

    const onLeave = () => {
      target.active = 0;
    };

    const LERP = 0.1; // Slightly slower for a more 'weighted' come-out feel
    const tick = () => {
      current.mx += (target.mx - current.mx) * LERP;
      current.my += (target.my - current.my) * LERP;
      current.active += (target.active - current.active) * LERP;

      // REMOVED TILT: Focused on Scaling and Lifting (coming out)
      card.style.transform = 
        `translateY(${current.active * -8}px) ` +
        `scale3d(${1 + current.active * 0.05}, ${1 + current.active * 0.05}, 1)`;

      // Aerion gold glow - becomes an "underglow" as card lifts
      const glow = current.active * 0.25;
      card.style.boxShadow =
        `0 ${10 + current.active * 20}px ${20 + current.active * 40}px rgba(0,0,0,0.5), ` +
        `0 0 ${20 + current.active * 30}px rgba(201, 168, 76, ${glow.toFixed(3)})`;

      // Drive CSS shimmer variables
      card.style.setProperty('--tilt-mx', `${current.mx.toFixed(2)}%`);
      card.style.setProperty('--tilt-my', `${current.my.toFixed(2)}%`);
      card.style.setProperty('--tilt-active', current.active.toFixed(3));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      card.removeEventListener('pointerenter', onEnter);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', refreshRect);
      window.removeEventListener('scroll', refreshRect);
      card.style.transform = '';
      card.style.boxShadow = '';
      card.classList.remove('has-tilt');
    };
  }, [maxTilt, perspective]);

  return tiltRef;
}
