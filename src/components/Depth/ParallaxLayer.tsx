'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { registerParallax } from './parallax';

/**
 * Moves its contents against the scroll, so layers separate in depth.
 *
 * `speed` is a fraction of half the viewport height: 0.05 is a barely-there
 * drift, 0.15 is noticeable. Positive values lag behind the scroll (things
 * that should feel further away); negative values lead it.
 */
export default function ParallaxLayer({
  children,
  speed = 0.06,
  className = '',
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerParallax(el, speed);
  }, [speed]);

  return (
    <div className={`parallax ${className}`.trim()} ref={ref}>
      {children}
    </div>
  );
}
