'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const roles = ['Software Engineer', 'Machine Learning Engineer', 'Full-Stack Developer'];

export default function HeroSection() {
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-section" id="home">
      <div className="hero-left">
        <motion.h1
          className="hero-name"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Anirudh Tyagi
        </motion.h1>

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
          This is my corner of the internet. I share my work, ideas, experiments,
          and the things I enjoy beyond code.
        </motion.p>

      </div>

      {/* Standing invitation to keep going — the page continues below. */}
      <motion.div
        className="hero-scroll-cue"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        aria-hidden="true"
      >
        <span>scroll</span>
        <span className="hero-scroll-line" />
      </motion.div>
    </section>
  );
}
