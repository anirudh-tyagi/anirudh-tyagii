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
  // Refreshing halfway down the page normally drops you back where you were:
  // browsers restore scroll position by default, and it happens before Lenis
  // or the section reveals have run, so you land mid-page with animations
  // already spent. This is a single-screen intro site, so every load should
  // start at the top — unless the URL names a section.
  //
  // Its own effect, deliberately: the one below bails out under reduced
  // motion, and scroll restoration is not a motion preference.
  // Scroll restoration and the fragment are handled by an inline script in
  // the document head, because both are applied by the browser during load
  // and an effect here would run too late to prevent either. Nothing to do
  // from React: correcting after the fact is what produced the visible jump
  // to a section followed by a scroll back to the top.

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

    // No fragment handling here on purpose. The effect above strips the
    // fragment and pins the page to the top, and honouring it here would
    // put the scroll straight back.

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
