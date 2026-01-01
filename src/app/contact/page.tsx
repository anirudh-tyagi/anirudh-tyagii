'use client';

import DockNav from '@/components/DockNav';
import '../terminal.css';

export default function ContactPage() {
  return (
    <main className="dark-container">

      {/* Page Title */}
      <div className="page-header">
        <h1 className="page-title">Contact</h1>
      </div>

      {/* Contact Content */}
      <div className="contact-content">
        <p className="contact-text">
          Feel free to reach out! I&apos;m always open to discussing new projects, creative ideas, or opportunities.
        </p>

        <div className="contact-links">
          <a href="mailto:anirudhtyagi188@gmail.com" className="contact-link">
            <span className="contact-icon">📧</span>
            <span>anirudhtyagi188@gmail.com</span>
          </a>
          <a href="https://twitter.com/itsanirudhtyagi" target="_blank" rel="noopener noreferrer" className="contact-link">
            <span className="contact-icon">𝕏</span>
            <span>@itsanirudhtyagi</span>
          </a>
          <a href="https://linkedin.com/in/itsanirudhtyagi" target="_blank" rel="noopener noreferrer" className="contact-link">
            <span className="contact-icon">💼</span>
            <span>LinkedIn</span>
          </a>
          <a href="https://github.com/anirudh-tyagi" target="_blank" rel="noopener noreferrer" className="contact-link">
            <span className="contact-icon">🐙</span>
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Dock Navigation */}
      <DockNav />
    </main>
  );
}