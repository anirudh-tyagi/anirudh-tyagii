'use client';

/**
 * One shared rAF loop that offsets every registered element by its distance
 * from the centre of the viewport.
 *
 * Deliberately not one useScroll per element: Framer's useScroll subscribes
 * each component separately, and a dozen of them on a smooth-scrolled page
 * means a dozen subscriptions recomputing on every frame. This walks a small
 * array once per frame and writes a CSS variable, which the compositor then
 * handles on its own.
 */

type Entry = { el: HTMLElement; speed: number };

const entries: Entry[] = [];
let frame = 0;
let enabled = true;

function tick() {
  const mid = window.innerHeight / 2;

  for (const { el, speed } of entries) {
    const box = el.getBoundingClientRect();
    // How far this element's centre sits from the viewport centre, in
    // viewport halves: -1 at the top edge, 0 centred, +1 at the bottom.
    const offset = (box.top + box.height / 2 - mid) / mid;
    el.style.setProperty('--parallax-y', `${(offset * speed * mid).toFixed(1)}px`);
  }

  frame = requestAnimationFrame(tick);
}

export function registerParallax(el: HTMLElement, speed: number): () => void {
  if (typeof window !== 'undefined' && !enabled) return () => {};

  const entry = { el, speed };
  entries.push(entry);
  if (!frame) frame = requestAnimationFrame(tick);

  return () => {
    const i = entries.indexOf(entry);
    if (i >= 0) entries.splice(i, 1);
    if (!entries.length && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
}

if (typeof window !== 'undefined') {
  enabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
