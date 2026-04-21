// NEW: Soft gold custom cursor with a larger "hover" state over interactive elements.
// Skipped on touch devices and when the user prefers reduced motion.

import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(hover: none)').matches;
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReduce) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add('has-custom-cursor');

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { x: pos.x, y: pos.y };
    let hovering = 0;
    let raf;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
    };

    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, .product-card, .lu-card';
    const onOver = (e) => {
      if (e.target.closest(interactiveSelector)) hovering = 1;
    };
    const onOut = (e) => {
      if (e.target.closest(interactiveSelector)) hovering = 0;
    };

    const LERP = 0.18;
    let currentScale = 1;
    const tick = () => {
      pos.x += (target.x - pos.x) * LERP;
      pos.y += (target.y - pos.y) * LERP;
      currentScale += (hovering - currentScale + 1) * 0.15; // lerp toward 1 or 2
      const s = hovering ? 1 + (currentScale - 1) * 0.5 : 1;
      ring.style.transform =
        `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${(hovering ? 1.9 : 1).toFixed(2)})`;
      ring.style.borderColor = hovering
        ? 'rgba(201, 168, 76, 0.9)'
        : 'rgba(201, 168, 76, 0.55)';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
    </>
  );
}
