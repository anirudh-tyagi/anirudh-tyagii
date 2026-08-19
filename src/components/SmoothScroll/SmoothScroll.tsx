'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { setLenis } from '@/lib/scroll';

/**
 * Inertial scrolling for the whole document.
 *
 * CSS scroll-behavior only smooths programmatic jumps, not the wheel, so
 * weighted scrolling needs a rAF loop that eases the real scroll position
 * toward a target. Lenis still drives native window scroll, which keeps
 * window.scrollY, scroll events, and anchor links working — the starfield
 * and the page-turn gesture both read those and need no changes.
 *
 * Touch is left native: phones already have momentum scrolling, and
 * hijacking it makes a page feel worse, not better.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      // Higher = snappier. 0.09 keeps weight without feeling laggy.
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
    });

    setLenis(lenis);

    // A redirect from /about lands on /#about. The browser's native jump
    // happens before Lenis takes over, so re-issue it through Lenis once
    // the sections have laid out — otherwise you land near, but not at,
    // the right section.
    const hash = window.location.hash.slice(1);
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) lenis.scrollTo(el, { immediate: true });
      });
    }

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
