import type Lenis from 'lenis';

// The Lenis instance is created by <SmoothScroll /> and shared here so the
// dock can hand anchor scrolling to the same easing engine that drives the
// wheel. Without this, dock clicks would jump with native behaviour while
// wheel scrolling glided, and the two would feel like different sites.
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export const SECTIONS = ['home', 'projects', 'activity', 'about', 'contact'] as const;
export type SectionId = (typeof SECTIONS)[number];

/**
 * Bring an arbitrary element into view. Routed through Lenis when it is
 * running: Lenis drives window scroll from its own rAF loop, so a native
 * scrollIntoView would be undone on the very next frame.
 */
export function scrollElementIntoView(el: HTMLElement) {
  if (instance) {
    instance.scrollTo(el, { duration: 0.5, offset: -40 });
  } else {
    el.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;

  if (instance) {
    instance.scrollTo(el, { duration: 1.15 });
  } else {
    // Reduced motion, or Lenis not running.
    el.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}
