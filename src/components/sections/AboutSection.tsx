'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import DevTerminal from '@/components/DevTerminal/DevTerminal';
import SectionHeading from './SectionHeading';
import Tilt from '@/components/Depth/Tilt';
import ParallaxLayer from '@/components/Depth/ParallaxLayer';
import {
  personalInfo, education, experience, achievements, publications, skills,
} from '@/data/profile';
import type { LanguageSlice } from '@/lib/github-activity';

// GitHub reports notebooks as their own language; for a breadth story it is
// clearer to count them as the Python work they are.
const LANG_COLORS: Record<string, string> = {
  'C++': '#f34b7d',
  Python: '#3572A5',
  'Jupyter Notebook': '#DA5B0B',
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Solidity: '#AA6746',
  C: '#555555',
  Julia: '#a270ba',
  Shell: '#89e051',
  CMake: '#DA3434',
};

const skillGroups = [
  { label: 'Languages', items: [...skills.languages, ...skills.web] },
  { label: 'Frameworks & Libraries', items: skills.frameworks },
  { label: 'Tools & Platforms', items: skills.tools },
  { label: 'AI/ML & Domains', items: skills.domains },
];

// Sections animate as they scroll into view. On a single page, mount-time
// animation would fire everything at once, long before it is reached.
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
} as const;

export default function AboutSection({ languages }: { languages: LanguageSlice[] }) {
  // Which language the pointer is on, shared by the bar and its legend.
  const [activeLang, setActiveLang] = useState<string | null>(null);

  return (
    <section className="page-section" id="about">
      <SectionHeading title="About" sub="Three ways in: the quick read, the shell, and the whole résumé." />

      {/* --- Intro: who I am, at a glance --- */}
      <Tilt max={3} lift={8}>
      <motion.div className="about-intro" {...reveal} transition={{ duration: 0.55 }}>
        <div className="about-portrait">
          <Image
            src="/pic.png"
            alt="Anirudh Tyagi"
            width={584}
            height={737}
            sizes="(max-width: 640px) 150px, 200px"
            className="about-portrait-img"
          />
        </div>

        <div className="about-intro-body">
          <h3 className="about-name">{personalInfo.name}</h3>
          <p className="about-role">{personalInfo.title}</p>
          <p className="about-summary">{personalInfo.summary}</p>

          <ul className="about-interests">
            {personalInfo.interests.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>

          <a href="/resume/Anirudh-Tyagi-Resume.pdf" download className="about-resume-btn">
            Download Resume
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        </div>
      </motion.div>
    </Tilt>

      {/* --- Breadth, measured from the repos rather than claimed --- */}
      {languages.length > 0 && (
        <Tilt max={3} lift={8}>
        <motion.div
          className={`about-stacks${activeLang ? ' is-focused' : ''}`}
          {...reveal}
          transition={{ duration: 0.55 }}
          onMouseLeave={() => setActiveLang(null)}
        >
          <div className="about-stacks-head">
            <h4>What I build with</h4>
            <span>
              {languages.reduce((n, l) => n + l.count, 0)} public repos ·{' '}
              {languages.length} languages
            </span>
          </div>

          {/* Bar and legend share one hover: pointing at either half
              highlights the language in both. */}
          <div className="about-stacks-bar">
            {languages.map((l) => (
              <span
                key={l.name}
                className={`about-stacks-seg${activeLang === l.name ? ' is-active' : ''}`}
                style={{
                  flexBasis: `${l.share * 100}%`,
                  background: LANG_COLORS[l.name] ?? 'var(--accent)',
                  color: LANG_COLORS[l.name] ?? 'var(--accent)',
                }}
                onMouseEnter={() => setActiveLang(l.name)}
                title={`${l.name}: ${l.count} repos`}
              />
            ))}
          </div>

          <ul className="about-stacks-legend">
            {languages.map((l) => (
              <li
                key={l.name}
                className={activeLang === l.name ? 'is-active' : ''}
                onMouseEnter={() => setActiveLang(l.name)}
              >
                <span
                  className="about-stacks-dot"
                  style={{
                    background: LANG_COLORS[l.name] ?? 'var(--accent)',
                    color: LANG_COLORS[l.name] ?? 'var(--accent)',
                  }}
                />
                <span className="about-stacks-name">{l.name}</span>
                <span className="about-stacks-share">{Math.round(l.share * 100)}%</span>
                <em>{l.count} repos</em>
              </li>
            ))}
          </ul>
        </motion.div>
        </Tilt>
      )}

      {/* --- Interactive shell --- */}
      <motion.div className="about-terminal-wrap" {...reveal} transition={{ duration: 0.55 }}>
        <p className="about-shell-hint">Ask it anything below. Every answer comes from the same CV.</p>
        <DevTerminal />
      </motion.div>

      <div className="about-divider"><span>not a terminal person? same story, fewer keystrokes</span></div>

      {/* --- CV: experience left, education + achievements right, skills full width --- */}
      <div className="about-cv">
        <Tilt max={4} lift={10}>
        <motion.div className="cv-card about-cv-main" {...reveal} transition={{ duration: 0.6 }}>
          <h4 className="cv-card-title cv-card-title-accent">Experience</h4>
          {experience.map((job) => (
            <div className="cv-entry" key={`${job.company}-${job.duration}`}>
              <div className="cv-entry-row">
                <h5 className="cv-entry-title">{job.company}</h5>
                <span className="cv-entry-date">{job.duration}</span>
              </div>
              <div className="cv-entry-role">{job.role} · {job.location}</div>
              <ul className="cv-entry-list">
                {job.details.map((detail) => (<li key={detail}>{detail}</li>))}
              </ul>
            </div>
          ))}
        </motion.div>
      </Tilt>

        <div className="about-cv-side">
          <Tilt max={4} lift={10}>
          <motion.div className="cv-card" {...reveal} transition={{ delay: 0.08, duration: 0.6 }}>
            <h4 className="cv-card-title">Education</h4>
            <div className="cv-entry">
              <div className="cv-entry-row">
                <h5 className="cv-entry-title">{education.school}</h5>
                <span className="cv-entry-date">{education.duration}</span>
              </div>
              <div className="cv-entry-role">{education.degree}</div>
              <div className="cv-cgpa">CGPA {education.cgpa}</div>
              <p className="cv-coursework">
                <strong>Coursework:</strong> {education.coursework.join(', ')}.
              </p>
            </div>
          </motion.div>
        </Tilt>

          <Tilt max={4} lift={10}>
          <motion.div className="cv-card" {...reveal} transition={{ delay: 0.14, duration: 0.6 }}>
            <h4 className="cv-card-title">Achievements</h4>
            {achievements.map((a) => (
              <div className="cv-entry" key={a.title}>
                <h5 className="cv-entry-title">
                  {a.title} {a.meta && <span className="cv-entry-meta">{a.meta}</span>}
                </h5>
                <p className="cv-coursework">{a.description}</p>
              </div>
            ))}
          </motion.div>
        </Tilt>

          {publications.length > 0 && (
            <Tilt max={4} lift={10}>
            <motion.div className="cv-card" {...reveal} transition={{ delay: 0.2, duration: 0.6 }}>
              <h4 className="cv-card-title">
                {publications.length > 1 ? 'Publications' : 'Publication'}
              </h4>
              <ul className="cv-pub-list">
                {publications.map((p) => (
                  <li key={p.citation}>
                    &ldquo;{p.citation}&rdquo;
                    <span className="cv-pub-status">{p.status}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </Tilt>
          )}
        </div>

        <Tilt max={4} lift={10} className="about-cv-skills">
        <motion.div className="cv-card about-cv-skills" {...reveal} transition={{ delay: 0.1, duration: 0.6 }}>
          <h4 className="cv-card-title">Skills</h4>
          <div className="cv-skills-grid">
            {skillGroups.map((group) => (
              <div className="cv-skill-group" key={group.label}>
                <h5>{group.label}</h5>
                <div className="cv-skill-tags">
                  {group.items.map((item) => (
                    <span className="cv-skill-tag" key={item}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </Tilt>
      </div>
    </section>
  );
}
