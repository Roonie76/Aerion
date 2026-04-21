import React from 'react';

const base = {
  display: 'block',
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 100%)',
  backgroundSize: '200% 100%',
  animation: 'aerion-shimmer 1.4s ease-in-out infinite',
};

let styleInjected = false;
function ensureKeyframes() {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.setAttribute('data-aerion-skeleton', 'true');
  style.textContent = `
    @keyframes aerion-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      [data-aerion-skel] { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
  styleInjected = true;
}

export default function Skeleton({ width = '100%', height = '1em', radius = 0, style, ...rest }) {
  ensureKeyframes();
  return (
    <span
      data-aerion-skel="true"
      aria-hidden="true"
      style={{ ...base, width, height, borderRadius: radius, ...style }}
      {...rest}
    />
  );
}

export function SkeletonCard() {
  return (
    <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
      <Skeleton height="220px" style={{ marginBottom: '16px' }} />
      <Skeleton height="14px" width="60%" style={{ marginBottom: '10px' }} />
      <Skeleton height="22px" width="85%" style={{ marginBottom: '14px' }} />
      <Skeleton height="14px" width="40%" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
