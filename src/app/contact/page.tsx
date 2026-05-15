'use client';

import { motion } from 'motion/react';
import DockNav from '@/components/DockNav';
import PageTransition from '@/components/PageTransition';
import '../terminal.css';

const contactLinks = [
  {
    icon: '📧',
    label: 'Email',
    value: 'anirudhtyagi188@gmail.com',
    href: 'mailto:anirudhtyagi188@gmail.com',
    color: '#ff6b6b',
  },
  {
    icon: '𝕏',
    label: 'Twitter',
    value: '@itsanirudhtyagi',
    href: 'https://twitter.com/itsanirudhtyagi',
    color: '#1da1f2',
  },
  {
    icon: '💼',
    label: 'LinkedIn',
    value: 'itsanirudhtyagi',
    href: 'https://linkedin.com/in/itsanirudhtyagi',
    color: '#0077b5',
  },
  {
    icon: '🐙',
    label: 'GitHub',
    value: 'anirudh-tyagi',
    href: 'https://github.com/anirudh-tyagi',
    color: '#8b5cf6',
  },
];

export default function ContactPage() {
  return (
    <PageTransition>
      <main className="dark-container">

        {/* Page Title */}
        <div className="page-header" style={{ textAlign: 'center' }}>
          <motion.h1
            className="page-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Let&apos;s Connect
          </motion.h1>
        </div>

        {/* Contact Content */}
        <div className="contact-content">
          <motion.p
            className="contact-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Always open to discussing new projects, creative ideas, or opportunities.
            Feel free to reach out through any of these channels.
          </motion.p>

          {/* Terminal-style availability indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(0, 255, 159, 0.06)',
              border: '1px solid rgba(0, 255, 159, 0.2)',
              borderRadius: '20px',
              marginBottom: '2.5rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8rem',
              color: '#00ff9f',
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#00ff9f',
              boxShadow: '0 0 8px #00ff9f',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            Available for opportunities
          </motion.div>

          <div className="contact-links">
            {contactLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('mailto') ? undefined : '_blank'}
                rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="contact-link"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.5 + index * 0.1,
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{
                  y: -3,
                  borderColor: link.color,
                  boxShadow: `0 8px 30px ${link.color}15`,
                  transition: { duration: 0.25 },
                }}
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="contact-icon">{link.icon}</span>
                  <span>{link.value}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.a>
            ))}
          </div>

          {/* Quick message CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            style={{ marginTop: '2.5rem' }}
          >
            <a
              href="mailto:anirudhtyagi188@gmail.com?subject=Hello from your portfolio!"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#00ff9f',
                color: '#000',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.25s ease',
                border: '1px solid #00ff9f',
              }}
              onMouseOver={(e) => {
                const el = e.currentTarget;
                el.style.background = 'transparent';
                el.style.color = '#00ff9f';
              }}
              onMouseOut={(e) => {
                const el = e.currentTarget;
                el.style.background = '#00ff9f';
                el.style.color = '#000';
              }}
            >
              Say Hello 👋
            </a>
          </motion.div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>

      </main>
    </PageTransition>
  );
}