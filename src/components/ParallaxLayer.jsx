// NEW: Generic parallax wrapper driven by GSAP ScrollTrigger
// `speed` is a multiplier: negative moves opposite the scroll,
// positive moves with it. 0 = no parallax.
//
// Example:
//   <ParallaxLayer speed={-0.25}><Background/></ParallaxLayer>
//   <ParallaxLayer speed={0.15}><Foreground/></ParallaxLayer>

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxLayer({
  children,
  speed = 0.15,
  className = '',
  style,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) return;

    // Distance scales with viewport height × speed.
    const distance = () => window.innerHeight * speed;

    const tween = gsap.fromTo(
      el,
      { y: -distance() },
      {
        y: distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={style} {...rest}>
      {children}
    </div>
  );
}
