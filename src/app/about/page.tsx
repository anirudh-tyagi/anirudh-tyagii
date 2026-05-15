'use client';

import { motion } from 'motion/react';
import DockNav from '@/components/DockNav';
import PageTransition from '@/components/PageTransition';
import '../terminal.css';

export default function AboutPage() {
  return (
    <PageTransition>
      <main className="dark-container" style={{ alignItems: 'center', overflowY: 'auto', justifyContent: 'flex-start' }}>

        <div className="cv-grid" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>

          {/* --- LEFT COLUMN (Span 3) --- */}
          <div className="grid-col col-left">
            {/* Profile Box */}
            <motion.div
              className="cv-box span-profile"
              style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.25rem' }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="profile-img-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <img 
                  src="/pic.png" 
                  alt="Anirudh Tyagi" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '280px', 
                    borderRadius: '16px', 
                    objectFit: 'cover',
                    border: '1px solid rgba(0, 255, 159, 0.2)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                  }} 
                />
              </div>
              <div style={{ marginTop: '0', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <a href="/resume/Anirudh CAD.pdf" download style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 1rem', background: 'transparent',
                  border: '1px solid #00ff9f', color: '#00ff9f',
                  fontFamily: 'monospace', fontSize: '0.9rem',
                  textDecoration: 'none', borderRadius: '4px',
                  transition: 'all 0.2s ease', cursor: 'pointer'
                }}>
                  Download Resume
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
              </div>

            </motion.div>
          </div>

          {/* --- MIDDLE COLUMN (Span 6) --- */}
          <div className="grid-col col-mid">
            {/* Experience Box */}
            <motion.div
              className="cv-box span-experience"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <div className="cv-header-row">
                <h2 className="cv-heading" style={{ color: '#00ff9f', margin: 0, fontFamily: 'monospace', letterSpacing: '2px', textShadow: '0 0 10px rgba(0,255,159,0.3)' }}>EXPERIENCE</h2>
              </div>

              {/* Cadence - Current Role */}
              <div className="cv-item" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>Cadence Design Systems</h3>
                  <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.9rem' }}>Jan 2026 – Present</span>
                </div>
                <div style={{ color: '#00ff9f', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Software Engineer Intern — Allegro R&D Team, Noida</div>
                <ul style={{ color: '#b0b0b0', paddingLeft: '1.2rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
                  <li>Developed production-grade features for Allegro System Capture, a large-scale C++/Qt EDA application, delivering a real-time schematic world-view widget with live viewport synchronization and an overhauled docking framework with deferred state restoration.</li>
                  <li>Engineered a tamper-proof expiry validation module for early-access builds using asymmetric digital signatures and authenticated encryption, achieving &lt;10ms end-to-end validation latency.</li>
                </ul>
              </div>

              {/* Cadence - Previous Internship */}
              <div className="cv-item" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>Cadence Design Systems</h3>
                  <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.9rem' }}>June 2025 – Aug 2025</span>
                </div>
                <div style={{ color: '#00ff9f', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Software Engineer Intern — Allegro R&D Team, Noida</div>
                <ul style={{ color: '#b0b0b0', paddingLeft: '1.2rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
                  <li>Developed data acquisition pipelines and backend infrastructure using Python and Flask for scalable ML workflows.</li>
                  <li>Optimized ML model achieving 91% accuracy, ensured efficient and secure inference delivery.</li>
                </ul>
              </div>

              {/* NIOT */}
              <div className="cv-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>National Institute of Ocean Technology</h3>
                  <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.9rem' }}>July 2024 – Sept 2024</span>
                </div>
                <div style={{ color: '#00ff9f', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Research Intern, Chennai</div>
                <ul style={{ color: '#b0b0b0', paddingLeft: '1.2rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
                  <li>Processed and analyzed 18 TB of deep-sea metagenomic data through a full bioinformatics pipeline of de novo assembly, BLAST homology search, and multi-sequence alignment.</li>
                  <li>Uncovered novel microbial genes and species with potential industrial biotechnology applications.</li>
                </ul>
              </div>
            </motion.div>

          </div>

          {/* --- RIGHT COLUMN (Span 3) --- */}
          <div className="grid-col col-right">
            {/* Education Box */}
            <motion.div
              className="cv-box span-education"
              style={{ height: 'auto' }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="cv-header-row">
                <h2 className="cv-heading" style={{ color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }}>EDUCATION</h2>
              </div>
              <div className="cv-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: 'bold' }}>Sai University</h3>
                  <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.85rem' }}>2022 – 2026</span>
                </div>
                <div style={{ color: '#00ff9f', marginBottom: '0.25rem', fontSize: '0.9rem' }}>B.Tech in Computing and Data Science</div>
                <div style={{ color: '#b0b0b0', marginBottom: '0.5rem', fontSize: '0.85rem' }}>CGPA: 8.0</div>
                <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  <span style={{ color: '#fff' }}>Coursework:</span> Machine Learning, Deep Learning, Reinforcement Learning, AI, DSA, Speech &amp; Image Analysis, Bioinformatics, Software Engineering, DBMS, Data Analysis &amp; Visualization.
                </p>
              </div>
            </motion.div>

            {/* Achievements Box */}
            <motion.div
              className="cv-box span-achievements"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="cv-header-row">
                <h2 className="cv-heading" style={{ color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }}>ACHIEVEMENTS</h2>
              </div>

              <div className="cv-item" style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Cadence India Hackathon <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 'normal' }}>2025</span></h3>
                <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  Presented BLINC, a decentralized log analysis system integrating federated learning, blockchain (PoS), and IPFS.
                </p>
              </div>

              <div className="cv-item" style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Research Publication</h3>
                <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  &ldquo;Post Quantum Federated Learning and Blockchain with Resilient IPFS for Cyber logs (FABRIC)&rdquo; — under review at Journal of Network and Systems Management, Springer.
                </p>
              </div>

              <div className="cv-item" style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Sports Society President</h3>
                <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  Spearheaded organization of sports events, managed budgets, and drafted the society&apos;s constitution at Sai University (2022-2023).
                </p>
              </div>

            </motion.div>
          </div>

          {/* Skills Box - Full Bottom Strip */}
          <motion.div
            className="cv-box span-skills"
            style={{ gridColumn: '1 / -1' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            <div className="cv-header-row">
              <h2 className="cv-heading" style={{ color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }}>SKILLS</h2>
            </div>
            <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid #1a1a2e', paddingBottom: '0.25rem' }}>Languages</h3>
                <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '0.85rem' }}>
                  C++, C, Python, JavaScript, TypeScript, HTML, SQL, R, Julia, Tcl
                </p>
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid #1a1a2e', paddingBottom: '0.25rem' }}>Frameworks &amp; Libraries</h3>
                <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '0.85rem' }}>
                  Django, Flask, Node.js, React.js, PyTorch, TensorFlow, Scikit-learn, OpenCV
                </p>
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid #1a1a2e', paddingBottom: '0.25rem' }}>Tools &amp; Platforms</h3>
                <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '0.85rem' }}>
                  Git, Perforce, AWS, Docker, Hugging Face, Jupyter Notebook, PyCharm, VS Professional, Jira, RHEL
                </p>
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid #1a1a2e', paddingBottom: '0.25rem' }}>AI/ML &amp; Domains</h3>
                <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '0.85rem' }}>
                  Machine Learning, Deep Learning, NLP, Computer Vision, Reinforcement Learning, Speech &amp; Image Processing, RAG, Predictive Modeling, Statistical Analysis, Data Analytics
                </p>
              </div>
            </div>
          </motion.div>

        </div>

      </main>
    </PageTransition>
  );
}
