'use client';

import dynamic from 'next/dynamic';
import TextType from '@/components/TextType';
import DockNav from '@/components/DockNav';
import './terminal.css';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import catAnimation from '../../public/cat.json';

export default function Home() {
  const welcomeText = `Hey, welcome 👋 I'm Meso :)
This is Anirudhs corner of the internet, here he share his work, his ideas, his experiments, and the things he enjoys beyond code...`;

  return (
    <main className="dark-container">
      {/* Welcome Section - Top Left */}
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="cat-animation">
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