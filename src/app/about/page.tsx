'use client';

import PhotoCarousel from '@/components/PhotoCarousel';
import ProfileCard from '@/components/ProfileCard';
import DockNav from '@/components/DockNav';
import '../terminal.css';

export default function AboutPage() {
  return (
    <main className="dark-container" style={{ alignItems: 'center', overflowY: 'auto' }}>

      <div className="cv-grid" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>

        {/* --- LEFT COLUMN (Span 3) --- */}
        <div className="grid-col col-left">
          {/* Profile Box */}
          <div className="cv-box span-profile" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '0.25rem' }}>
            <div className="profile-card-wrapper">
              <ProfileCard
                avatarUrl="/pic.png"
                name="Anirudh"
                title="Developer"
                handle="anirudh"
                status="Online"
                contactText="Contact"
                showUserInfo={false}
                enableTilt={true}
              />
            </div>
            <div style={{ marginTop: '0', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <a href="/resume.pdf" download style={{
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

          </div>
        </div>

        {/* --- MIDDLE COLUMN (Span 6) --- */}
        <div className="grid-col col-mid">
          {/* Experience Box - Highlighted */}
          <div className="cv-box span-experience">
            <div className="cv-header-row">
              <h2 className="cv-heading" style={{ color: '#00ff9f', margin: 0, fontFamily: 'monospace', letterSpacing: '2px', textShadow: '0 0 10px rgba(0,255,159,0.3)' }}>EXPERIENCE</h2>
            </div>

            <div className="cv-item" style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>Cadence Design Systems</h3>
                <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.9rem' }}>June 2025 – Present</span>
              </div>
              <div style={{ color: '#00ff9f', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Software Development Intern - Allegro RD Team</div>
              <ul style={{ color: '#b0b0b0', paddingLeft: '1.2rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
                <li>Developing a machine learning-enabled simulator and compiler.</li>
                <li>Engineered end-to-end data flow and created Python scripts for data acquisition modules with a Flask web app.</li>
                <li>Built and optimized an ML model with 91% accuracy and handled backend infrastructure for secure inference delivery.</li>
                <li>Optimized MEAN Stack application performance.</li>
              </ul>
            </div>

            <div className="cv-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontWeight: 'bold' }}>NIOT</h3>
                <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.9rem' }}>July 2024 – Sept 2024</span>
              </div>
              <div style={{ color: '#00ff9f', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Research Intern</div>
              <ul style={{ color: '#b0b0b0', paddingLeft: '1.2rem', lineHeight: '1.5', fontSize: '0.95rem' }}>
                <li>Explored 18Tb deep-sea metagenome data using bioinformatics techniques.</li>
                <li>Identified novel genes and microbial species with industrial potential.</li>
                <li>Analyzed large, complex biological datasets.</li>
              </ul>
            </div>
          </div>

          {/* Achievements Box (Moved Here) */}
          <div className="cv-box span-achievements">
            <div className="cv-header-row">
              <h2 className="cv-heading" style={{ color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }}>ACHIEVEMENTS</h2>
            </div>

            <div className="cv-item" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Cadence India Hackathon</h3>
              <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                Built BLINC, a decentralized log analysis system integrating federated learning, blockchain, and IPFS.
              </p>
            </div>

            <div className="cv-item" style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Sports Society President</h3>
              <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                Spearheaded organization of sports events, managed budgets, and drafted the society’s constitution.
              </p>
            </div>

            <div className="cv-item">
              <h3 style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: 'bold' }}>Volunteer Swimming Instructor</h3>
              <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                Instructed over 100 individuals in water safety and lifesaving techniques.
              </p>
            </div>

          </div>
        </div>

        {/* --- RIGHT COLUMN (Span 3) --- */}
        <div className="grid-col col-right">
          {/* Education Box */}
          <div className="cv-box span-education" style={{ height: 'auto' }}>
            <div className="cv-header-row">
              <h2 className="cv-heading" style={{ color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }}>EDUCATION</h2>
            </div>
            <div className="cv-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: 'bold' }}>Sai University</h3>
                <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.85rem' }}>2022 – 2026</span>
              </div>
              <div style={{ color: '#00ff9f', marginBottom: '0.25rem', fontSize: '0.9rem' }}>B.Tech in Computing and Data Science</div>
              <div style={{ color: '#b0b0b0', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Minor: Biological Sciences</div>
              <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                <span style={{ color: '#fff' }}>Coursework:</span> AI, Deep Learning, RL, DSA, Image Analysis, Bioinformatics, Software Engineering.
              </p>
            </div>
          </div>

          {/* Photography Box - Carousel */}
          <div className="cv-box span-photography">
            <div className="cv-header-row">
              <h2 className="cv-heading" style={{ color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }}>VISUAL LOG</h2>
            </div>
            {/* Photography Content... */}
            <div style={{ padding: '0.5rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhotoCarousel images={[
                '/vsco/1.png',
                '/vsco/2.png',
                '/vsco/3.png',
                '/vsco/4.png',
                '/vsco/5.png',
                '/vsco/6.png'
              ]} />
            </div>
          </div>
        </div>

        {/* Skills Box - Full Bottom Strip */}
        <div className="cv-box span-skills" style={{ gridColumn: '1 / -1' }}>
          <div className="cv-header-row">
            <h2 className="cv-heading" style={{ color: '#fff', margin: 0, fontFamily: 'monospace', letterSpacing: '2px' }}>SKILLS</h2>
          </div>
          <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.25rem' }}>Languages</h3>
              <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '0.85rem' }}>
                C++, C, Java, Python, MySQL, JavaScript, Django, HTML, R, Julia, Node.js, Flask, TypeScript
              </p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.25rem' }}>Modelling & Analysis</h3>
              <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '0.85rem' }}>
                Machine Learning, NLP, Deep Learning, Computer Vision, Reinforcement Learning
              </p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.25rem' }}>Software/Platforms</h3>
              <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '0.85rem' }}>
                Git, VS Code, Google Colab, AWS, Jira, Notion, Jupyter Notebook, PyCharm, Hugging Face
              </p>
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.25rem' }}>Technical Skills</h3>
              <p style={{ color: '#b0b0b0', lineHeight: '1.5', fontSize: '0.85rem' }}>
                DSA, ML Algorithms, Data Analytics/Preprocessing, PyTorch, TensorFlow, Statistical Analysis, API Dev, RAG, Cloud Computing
              </p>
            </div>
          </div>
        </div>

      </div>


      <DockNav />
    </main>
  );
}
