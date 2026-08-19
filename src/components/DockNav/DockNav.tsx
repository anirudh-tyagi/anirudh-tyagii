'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { SECTIONS, scrollToSection } from '@/lib/scroll';
import Dock, { DockItemData } from '@/components/Dock';

// Icons for the dock
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'inherit' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const ProjectsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'inherit' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
  </svg>
);

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'inherit' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12h3.75l2.25-6 3.75 12 2.25-6h3.75" />
  </svg>
);

const AboutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'inherit' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const ContactIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ color: 'inherit' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

// Dock item size is written as an inline motion style, so it cannot be
// overridden from CSS — the breakpoint has to live here, and it has to be
// the SAME breakpoint at which the CSS flips the dock to its horizontal
// bottom layout. It was 400px, which no common phone is under (a 14 Pro is
// 393 but a Pro Max is 430), so real devices got desktop-sized items in the
// mobile bar.
const SMALL_SCREEN = '(max-width: 768px)';

function subscribeSmall(cb: () => void) {
  const mq = window.matchMedia(SMALL_SCREEN);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

export default function DockNav() {
  // Scroll-spy: whichever section is crossing the middle of the viewport
  // is the active one. The -45%/-45% inset means exactly one section
  // qualifies at a time, so there is no flicker between neighbours.
  const [active, setActive] = useState<string>('home');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const isSmall = useSyncExternalStore(
    subscribeSmall,
    () => window.matchMedia(SMALL_SCREEN).matches,
    () => false
  );

  const dockItems: DockItemData[] = [
    { icon: <HomeIcon />, label: 'Home', onClick: () => scrollToSection('home'), isActive: active === 'home' },
    { icon: <ProjectsIcon />, label: 'Projects', onClick: () => scrollToSection('projects'), isActive: active === 'projects' },
    { icon: <ActivityIcon />, label: 'Activity', onClick: () => scrollToSection('activity'), isActive: active === 'activity' },
    { icon: <AboutIcon />, label: 'About', onClick: () => scrollToSection('about'), isActive: active === 'about' },
    { icon: <ContactIcon />, label: 'Contact', onClick: () => scrollToSection('contact'), isActive: active === 'contact' },
  ];

  return (
    <Dock
      items={dockItems}
      // Magnification is a hover effect and touch devices never hover, so on
      // the mobile bar it is pinned to the base size — otherwise the spring
      // is live but unreachable, which is just wasted animation.
      magnification={isSmall ? 38 : 56}
      distance={isSmall ? 0 : 140}
      baseItemSize={isSmall ? 38 : 42}
    />
  );
}
