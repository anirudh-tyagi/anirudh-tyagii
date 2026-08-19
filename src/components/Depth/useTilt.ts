'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Pointer-tracked 3D tilt.
 *
 * Writes CSS custom properties straight onto the node rather than going
 * through React state: a tilt updates on every pointermove, and re-rendering
 * a card sixty times a second to move it six degrees would be absurd.
 *
 * The element's rect is measured once on enter and reused for the whole
 * hover, so moving the pointer never forces layout.
 */
export function useTilt(
  ref: RefObject<HTMLElement | null>,
  { max = 6, lift = 12 }: { max?: number; lift?: number } = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Tilting on touch is meaningless — there is no hover, and the finger
    // covers whatever it would have revealed.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let rect: DOMRect | null = null;
    let frame = 0;
    let px = 0;
    let py = 0;

    const apply = () => {
      frame = 0;
      if (!rect) return;
      // -0.5 .. 0.5 across each axis, from the element's centre.
      const nx = (px - rect.left) / rect.width - 0.5;
      const ny = (py - rect.top) / rect.height - 0.5;
      // Y-rotation follows horizontal movement, X-rotation is inverted so
      // the card leans *toward* the pointer rather than away from it.
      el.style.setProperty('--tilt-y', `${nx * max * 2}deg`);
      el.style.setProperty('--tilt-x', `${-ny * max * 2}deg`);
      el.style.setProperty('--tilt-z', `${lift}px`);
    };

    const onEnter = () => {
      rect = el.getBoundingClientRect();
      el.dataset.tilting = '1';
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      delete el.dataset.tilting;
      el.style.setProperty('--tilt-x', '0deg');
      el.style.setProperty('--tilt-y', '0deg');
      el.style.setProperty('--tilt-z', '0px');
      rect = null;
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref, max, lift]);
}
