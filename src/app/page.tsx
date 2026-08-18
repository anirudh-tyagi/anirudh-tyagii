'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageTransition from '@/components/PageTransition';
import Link from 'next/link';
import './terminal.css';

const roles = [
  'Software Engineer',
  'Machine Learning Engineer',
  'Full-Stack Developer'
];

export default function Home() {
  const [currentRole, setCurrentRole] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageTransition>
      <main className="dark-container home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-left">

            <motion.h1
              className="hero-name"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Anirudh Tyagi
            </motion.h1>

            {/* Animated Role Switcher */}
            <div className="hero-role-container">
              <span className="hero-role-prefix">{'>'} </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentRole}
                  className="hero-role"
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4 }}
                >
                  {roles[currentRole]}
                </motion.span>
              </AnimatePresence>
            </div>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              This is my corner of the internet — I share my work, ideas, experiments, 
              and the things I enjoy beyond code.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="hero-ctas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link href="/projects" className="cta-primary">
                <span>View Projects</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/about" className="cta-secondary">
                <span>About Me</span>
              </Link>
              <a href="/resume/Anirudh-Tyagi-Resume.pdf" download className="cta-ghost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Resume</span>
              </a>
            </motion.div>
          </div>
        </section>

      </main>
    </PageTransition>
  );
}