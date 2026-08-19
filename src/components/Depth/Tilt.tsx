'use client';

import { useRef, type ReactNode } from 'react';
import { useTilt } from './useTilt';

/**
 * Wraps a panel in a perspective container so it can lean toward the
 * pointer.
 *
 * Two nested elements, not one: CSS perspective has to live on the *parent*
 * of the transformed element, and the child has to own the transform alone —
 * the panels inside are usually motion components, and Framer writes its own
 * inline `transform`, which would overwrite ours if we shared a node.
 */
export default function Tilt({
  children,
  max,
  lift,
  className = '',
}: {
  children: ReactNode;
  max?: number;
  lift?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, { max, lift });

  return (
    <div className={`tilt ${className}`.trim()} ref={ref}>
      <div className="tilt-in">{children}</div>
    </div>
  );
}
