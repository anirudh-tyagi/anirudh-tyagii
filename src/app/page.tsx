'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import TextType from '@/components/TextType';
import DockNav from '@/components/DockNav';
import './terminal.css';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import catAnimation from '../../public/cat.json';

export default function Home() {
  const welcomeText = `Hey, welcome 👋 I'm Anirudh
This is my corner of the internet, here I share my work, my ideas, experiments, and the things I enjoy beyond code...`;

  const [isCatHovered, setIsCatHovered] = useState(false);

  return (
    <main className="dark-container">
      {/* Welcome Section - Top Left */}
      <div className="welcome-section">
        <div className="welcome-content">
          <div
            className="cat-animation"
            style={{ position: 'relative', cursor: 'grab' }}
            onMouseEnter={() => setIsCatHovered(true)}
            onMouseLeave={() => setIsCatHovered(false)}
          >
            <AnimatePresence>
              {isCatHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '-60px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    color: '#000',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    pointerEvents: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    bottom: '-8px',
                    left: '16px',
                    width: '0',
                    height: '0',
                    borderTop: '8px solid #fff',
                    borderRight: '8px solid transparent',
                    borderLeft: '0 solid transparent'
                  }} />
                  keep the gun away from mee
                </motion.div>
              )}
            </AnimatePresence>
            <Lottie animationData={catAnimation} loop={true} />
          </div>
          <TextType
            text={welcomeText}
            typingSpeed={40}
            initialDelay={500}
            loop={false}
            showCursor={true}
            cursorCharacter="▌"
            cursorBlinkDuration={0.6}
            className="welcome-text"
          />
        </div>
      </div>

      {/* Dock Navigation */}
      <DockNav />
    </main>
  );
}