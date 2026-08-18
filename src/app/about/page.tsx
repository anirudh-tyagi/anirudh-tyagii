'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import PageTransition from '@/components/PageTransition';
import { education, experience, achievements, publications, skills } from '@/data/profile';
import '../terminal.css';

const skillGroups = [
  { label: 'Languages', items: [...skills.languages, ...skills.web] },
  { label: 'Frameworks & Libraries', items: skills.frameworks },
  { label: 'Tools & Platforms', items: skills.tools },
  { label: 'AI/ML & Domains', items: skills.domains },
];

export default function AboutPage() {
  return (
    <PageTransition>
      <main className="dark-container" style={{ alignItems: 'center', overflowY: 'auto', justifyContent: 'flex-start' }}>

        <div className="cv-grid" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>

          {/* --- LEFT COLUMN --- */}
          <div className="grid-col col-left">
            <motion.div
              className="cv-box span-profile"
              style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.25rem' }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="cv-profile-photo-wrap">
                <Image src="/pic.png" alt="Anirudh Tyagi" width={584} height={737} className="cv-profile-photo" priority />
              </div>
              <a href="/resume/Anirudh-Tyagi-Resume.pdf" download className="cv-download-btn">
                Download Resume
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* --- MIDDLE COLUMN --- */}
          <div className="grid-col col-mid">
            <motion.div
              className="cv-box span-experience"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <div className="cv-header-row">
                <h2 className="cv-heading cv-heading-accent">EXPERIENCE</h2>
              </div>

              {experience.map((job) => (
                <div className="cv-item cv-entry" key={`${job.company}-${job.duration}`}>
                  <div className="cv-entry-row">
                    <h3 className="cv-entry-title">{job.company}</h3>
                    <span className="cv-entry-date">{job.duration}</span>
                  </div>
                  <div className="cv-entry-role">{job.role} — {job.location}</div>
                  <ul className="cv-entry-list">
                    {job.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN --- */}
          <div className="grid-col col-right">
            <motion.div
              className="cv-box span-education"
              style={{ height: 'auto' }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="cv-header-row">
                <h2 className="cv-heading cv-heading-plain">EDUCATION</h2>
              </div>
              <div className="cv-item">
                <div className="cv-entry-row" style={{ marginBottom: '0.25rem' }}>
                  <h3 className="cv-entry-title" style={{ fontSize: '1rem' }}>{education.school}</h3>
                  <span className="cv-entry-date" style={{ fontSize: '0.85rem' }}>{education.duration}</span>
                </div>
                <div className="cv-entry-role">{education.degree}</div>
                <div className="cv-education-cgpa">CGPA: {education.cgpa}</div>
                <p className="cv-coursework">
                  <strong>Coursework:</strong> {education.coursework.join(', ')}.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="cv-box span-achievements"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="cv-header-row">
                <h2 className="cv-heading cv-heading-plain">ACHIEVEMENTS</h2>
              </div>

              {achievements.map((a) => (
                <div className="cv-item cv-achv-item" key={a.title}>
                  <h3 className="cv-achv-title">
                    {a.title}{' '}
                    {a.meta && <span className="cv-achv-meta">{a.meta}</span>}
                  </h3>
                  <p className="cv-coursework">{a.description}</p>
                </div>
              ))}

              {publications.length > 0 && (
                <div className="cv-item cv-achv-item">
                  <h3 className="cv-achv-title">{publications.length > 1 ? 'Publications' : 'Publication'}</h3>
                  <ul className="cv-pub-list">
                    {publications.map((p) => (
                      <li key={p.citation}>&ldquo;{p.citation}&rdquo; — {p.status}.</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Skills Box */}
          <motion.div
            className="cv-box span-skills"
            style={{ gridColumn: '1 / -1' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            <div className="cv-header-row">
              <h2 className="cv-heading cv-heading-plain">SKILLS</h2>
            </div>
            <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              {skillGroups.map((group) => (
                <div className="skills-column" key={group.label}>
                  <h3>{group.label}</h3>
                  <p>{group.items.join(', ')}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

      </main>
    </PageTransition>
  );
}
