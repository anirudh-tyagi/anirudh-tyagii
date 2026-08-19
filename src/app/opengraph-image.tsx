import { ImageResponse } from 'next/og';
import { personalInfo } from '@/data/profile';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${personalInfo.name}, ${personalInfo.title}`;

// Generated at build time, so every shared link renders a real card instead
// of a bare URL. Deliberately uses no remote font: fetching one at build
// would make deploys depend on a third-party host being up.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0a0e14',
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(0,255,159,0.16), transparent 45%), radial-gradient(circle at 84% 78%, rgba(0,212,255,0.12), transparent 45%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: '#00ff9f' }} />
          <div style={{ fontSize: 24, color: '#00ff9f', letterSpacing: 4 }}>PORTFOLIO</div>
        </div>

        <div style={{ fontSize: 88, fontWeight: 700, color: '#ffffff', lineHeight: 1.05 }}>
          {personalInfo.name}
        </div>

        <div style={{ fontSize: 36, color: '#00ff9f', marginTop: 18 }}>
          {personalInfo.title}
        </div>

        <div style={{ fontSize: 25, color: '#b0b0b0', marginTop: 30, maxWidth: 900, lineHeight: 1.5 }}>
          Systems programming, AI/ML, and scalable backend engineering.
        </div>

        <div
          style={{
            display: 'flex',
            gap: 34,
            marginTop: 'auto',
            fontSize: 22,
            color: '#8a8a8a',
          }}
        >
          <div>anirudhtyagi.vercel.app</div>
          <div>github.com/anirudh-tyagi</div>
        </div>
      </div>
    ),
    size
  );
}
