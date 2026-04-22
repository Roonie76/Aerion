// Luxury Golden Sparkles - Canvas 2D, vanilla, no heavy deps.
// Multi-depth parallax, per-particle twinkle, cursor spotlight, inertia easing.

import React, { useEffect, useRef } from 'react';

// ─── Tunables ────────────────────────────────────────────────
const LAYERS = [
  // Background: many small, slow, faint - moves WITH cursor (least)
  { count: 60, minR: 0.6, maxR: 1.6, minSpeed: 0.02, maxSpeed: 0.08, parallax:  8,  alpha: 0.45, blur: 1 },
  // Midground: medium size, medium speed
  { count: 35, minR: 1.4, maxR: 2.8, minSpeed: 0.05, maxSpeed: 0.14, parallax: -16, alpha: 0.70, blur: 2 },
  // Foreground: few large bokeh orbs - moves AGAINST cursor (most)
  { count: 14, minR: 2.4, maxR: 4.8, minSpeed: 0.08, maxSpeed: 0.22, parallax: -32, alpha: 0.95, blur: 4 },
];

const GOLD_TONES = [
  { r: 255, g: 215, b: 130 }, // warm gold
  { r: 226, g: 196, b: 122 }, // brand gold
  { r: 255, g: 236, b: 180 }, // pale champagne
];

export default function Hero3DParallax() {
  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const spotlight = spotlightRef.current;
    if (!canvas || !spotlight) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const ctx = canvas.getContext('2d', { alpha: true });

    // ─── Sizing ──────────────────────────────────────────────
    // Cap DPR at 1.5 on mobile, 2 on desktop - keeps fill-rate reasonable.
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    let W = 0, H = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ─── Particle System ─────────────────────────────────────
    // One flat array across all layers for cache-friendly iteration.
    // Each particle stores: x, y, r (radius), vy (upward drift), phase, speed (twinkle),
    // tone (color index), layer (index into LAYERS).
    const particles = [];

    const seed = () => {
      particles.length = 0;
      // Reduce counts on mobile - fill-rate, not GPU, is the bottleneck.
      const countMul = isMobile ? 0.45 : 1;
      LAYERS.forEach((cfg, layerIdx) => {
        const count = Math.round(cfg.count * countMul);
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: cfg.minR + Math.random() * (cfg.maxR - cfg.minR),
            vy: -(cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed)),
            phase: Math.random() * Math.PI * 2, // per-particle twinkle offset
            speed: 0.6 + Math.random() * 2.2,   // per-particle twinkle rate
            tone: GOLD_TONES[Math.floor(Math.random() * GOLD_TONES.length)],
            layer: layerIdx,
          });
        }
      });
    };
    seed();

    // ─── Input state ─────────────────────────────────────────
    // mx/my = raw mouse (-1..1), sx/sy = smoothed (eased) mouse used for parallax.
    const mouse = { mx: 0, my: 0, sx: 0, sy: 0, px: W / 2, py: H / 2, spx: W / 2, spy: H / 2 };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Parallax uses normalized [-1, 1]; spotlight uses raw pixel coords.
      mouse.mx = (x / W - 0.5) * 2;
      mouse.my = (y / H - 0.5) * 2;
      mouse.px = x;
      mouse.py = y;
    };

    // Touch: one-shot nudge so mobile still has *some* parallax response.
    const onTouch = (e) => {
      if (!e.touches[0]) return;
      const rect = canvas.getBoundingClientRect();
      mouse.mx = ((e.touches[0].clientX - rect.left) / W - 0.5) * 2;
      mouse.my = ((e.touches[0].clientY - rect.top)  / H - 0.5) * 2;
    };

    if (!prefersReduce) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('touchmove', onTouch, { passive: true });
      window.addEventListener('resize', resize);
    }

    // ─── Visibility gate ─────────────────────────────────────
    // Pause RAF when hero scrolls off-screen.
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !rafId) loop();
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    // ─── Main loop ───────────────────────────────────────────
    let rafId = null;
    let last = performance.now();

    const loop = (now = performance.now()) => {
      if (!visible) { rafId = null; return; }
      // Delta in seconds, clamped so tab-switch doesn't cause a jump.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now * 0.001;

      // Inertia easing on mouse - higher factor = snappier, lower = floatier.
      const ease = prefersReduce ? 1 : 0.06;
      mouse.sx += (mouse.mx - mouse.sx) * ease;
      mouse.sy += (mouse.my - mouse.sy) * ease;
      mouse.spx += (mouse.px - mouse.spx) * ease;
      mouse.spy += (mouse.py - mouse.spy) * ease;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; // additive - gold stacks prettily

      // ─── Draw particles ────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cfg = LAYERS[p.layer];

        // Upward drift with horizontal wobble for organic float.
        p.y += p.vy * dt * 60;
        p.x += Math.sin(t * 0.3 + p.phase) * 0.08;

        // Wrap top→bottom so field is continuous.
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;

        // Parallax offset: negative parallax = moves opposite to cursor (foreground),
        // positive = moves with cursor (background). Creates depth illusion.
        const offsetX = mouse.sx * cfg.parallax;
        const offsetY = mouse.sy * cfg.parallax;

        // Twinkle: per-particle phase + speed, mapped to 0.2..1.0 brightness and 0.8..1.3 scale.
        const tw = 0.5 + 0.5 * Math.sin(t * p.speed + p.phase);
        const alpha = cfg.alpha * (0.2 + tw * 0.8);
        const scale = 0.8 + tw * 0.5;
        const radius = p.r * scale;
        const { r: cr, g: cg, b: cb } = p.tone;

        const drawX = p.x + offsetX;
        const drawY = p.y + offsetY;

        // Soft radial gradient per particle = cheap bokeh glow.
        const grad = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, radius * 4);
        grad.addColorStop(0,   `rgba(${cr},${cg},${cb},${alpha})`);
        grad.addColorStop(0.4, `rgba(${cr},${cg},${cb},${alpha * 0.35})`);
        grad.addColorStop(1,   `rgba(${cr},${cg},${cb},0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(drawX, drawY, radius * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      rafId = requestAnimationFrame(loop);
    };

    loop();

    // ─── Cursor spotlight (CSS layer, not canvas) ────────────
    // A separate div kept in sync via transform - transform is cheap, doesn't trigger layout.
    let spotRaf = null;
    const moveSpotlight = () => {
      spotlight.style.transform = `translate3d(${mouse.spx - 300}px, ${mouse.spy - 300}px, 0)`;
      spotRaf = requestAnimationFrame(moveSpotlight);
    };
    if (!prefersReduce && !isMobile) moveSpotlight();

    // ─── Cleanup ─────────────────────────────────────────────
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (spotRaf) cancelAnimationFrame(spotRaf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Canvas - the particle field */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      {/* Cursor spotlight - soft gold glow that follows the pointer */}
      <div
        ref={spotlightRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 600,
          height: 600,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(226,196,122,0.10) 0%, rgba(226,196,122,0.04) 35%, rgba(226,196,122,0) 70%)',
          filter: 'blur(12px)',
          mixBlendMode: 'screen',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
