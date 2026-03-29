import { useEffect, useRef } from 'react';

export default function useTiltEffect(maxTilt = 15, perspective = 1000) {
  const tiltRef = useRef(null);

  useEffect(() => {
    const card = tiltRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      
      // Dynamic Shadow
      const shadowX = (x - centerX) / 10;
      const shadowY = (y - centerY) / 10;
      card.style.boxShadow = `${-shadowX}px ${-shadowY}px 50px rgba(255, 0, 0, 0.3)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.boxShadow = 'none';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt, perspective]);

  return tiltRef;
}
