'use client';

import dynamic from 'next/dynamic';

/**
 * The scene is ~144KB gzipped of three.js and it is purely decorative, so
 * it must not sit in the initial bundle. Loading it dynamically with SSR
 * off means the page becomes readable and interactive first, and the
 * starfield arrives a moment later behind it. Nothing on the page depends
 * on it being there.
 */
const StarWarsTerminal = dynamic(
  () => import('@/components/StarWarsTerminal/StarWarsTerminal'),
  { ssr: false }
);

export default function Background() {
  return <StarWarsTerminal />;
}
