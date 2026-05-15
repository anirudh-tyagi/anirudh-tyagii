'use client';

import { motion } from 'motion/react';
import DockNav from '@/components/DockNav';
import PageTransition from '@/components/PageTransition';
import '../terminal.css';

export default function ProjectsPage() {
  const projects = [
    {
      title: 'Smart Home ML RL',
      description: 'Intelligent home automation system maximizing energy efficiency and thermal comfort using Deep Q-Networks (DQN) and IoT sensors.',
      tech: ['Python', 'IoT', 'TensorFlow', 'Reinforcement Learning', 'Flask'],
      link: 'https://github.com/anirudh-tyagi/smart-home-ml-rl',
      image: '/projects/smart-home.png'
    },
    {
      title: 'Ornamental Plants CNN',
      description: 'Advanced image classification system leveraging Transfer Learning (EfficientNet/ResNet) to identify ornamental plant species with 95%+ accuracy.',
      tech: ['Python', 'TensorFlow', 'Keras', 'Deep Learning'],
      link: 'https://github.com/anirudh-tyagi/Ornamental-Plants-CNN-Classification',
      image: '/projects/plants.png'
    },
    {
      title: 'Cyber Cipher',
      description: 'Professional-grade cryptographic suite featuring quantum-safe key generation, real-time stream cipher analysis, and entropy visualization.',
      tech: ['Next.js', 'TypeScript', 'Python', 'Cryptography', 'Tailwind CSS'],
      link: 'https://github.com/anirudh-tyagi/cyber-cipher',
      demo: 'https://cyber-cypher.vercel.app/',
      image: '/projects/cyber-cipher.png'
    },
    {
      title: 'Kaleidoscope',
      description: 'Interactive visualizer creating symmetrical, psychedelic patterns in real-time using algorithmic recursion.',
      tech: ['JavaScript', 'HTML5 Canvas', 'Interactive'],
      link: 'https://github.com/anirudh-tyagi/Kaleidoscope',
      image: '/projects/kaleidoscope.gif'
    },
    {
      title: 'FTIR Dashboard',
      description: 'High-performance spectroscopy analysis platform with automated peak detection, biological specimen matching, and real-time visualization.',
      tech: ['Next.js', 'FastAPI', 'Python', 'Tailwind CSS', 'Plotly'],
      link: 'https://github.com/anirudh-tyagi/FTIR-dashborad',
      image: '/projects/ftir.png'
    },
    {
      title: 'Credit Management',
      description: 'Robust financial backend architecture for credit scoring, loan validation, and transaction processing with high concurrency support.',
      tech: ['Django', 'PostgreSQL', 'Docker', 'REST API', 'Celery'],
      link: 'https://github.com/anirudh-tyagi/credit-management-backend',
      image: '/projects/credit.png'
    },
  ];

  return (
    <PageTransition>
      <main className="dark-container" style={{ justifyContent: 'flex-start', overflowY: 'auto' }}>

        {/* Page Title */}
        <div className="page-header">
          <motion.h1
            className="page-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ color: '#555', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', marginTop: '0.5rem' }}
          >
            Things I&apos;ve built and experimented with.
          </motion.p>
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {projects.map((project, index) => {
            const p = project as typeof project & { demo?: string };
            const demoLink = p.demo;
            const codeLink = p.link;

            return (
              <motion.div
                key={index}
                className="project-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + index * 0.1,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
              >
                <a
                  href={demoLink || codeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-image-link"
                  style={{ display: 'block', overflow: 'hidden' }}
                >
                  {project.image && (
                    <div
                      className="project-image"
                      style={{ backgroundImage: `url(${project.image})` }}
                    />
                  )}
                </a>

                <div className="project-content">
                  <a
                    href={codeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-title-link"
                  >
                    <h3 className="project-title">{project.title}</h3>
                  </a>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((tech, i) => (
                      <span key={i} className="tech-tag">{tech}</span>
                    ))}
                  </div>

                  <div className="project-links" style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                    <a href={codeLink} target="_blank" rel="noopener noreferrer" className="project-link-hint">
                      View Code →
                    </a>
                    {demoLink && (
                      <a href={demoLink} target="_blank" rel="noopener noreferrer" className="project-link-hint" style={{ color: '#fff' }}>
                        Live Demo ↗
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </main>
    </PageTransition>
  );
}
