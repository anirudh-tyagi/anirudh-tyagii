'use client';

import { motion } from 'motion/react';
import type { Project } from '@/lib/github';

function timeAgo(iso: string): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="projects-grid">
      {projects.map((project, index) => {
        const updated = timeAgo(project.pushedAt);

        return (
          <motion.div
            key={project.repo}
            className="project-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1 + index * 0.08,
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            whileHover={{ y: -6, transition: { duration: 0.25 } }}
          >
            <a
              href={project.demo || project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="project-image-link"
              style={{ display: 'block', overflow: 'hidden' }}
            >
              {project.image ? (
                <div className="project-image" style={{ backgroundImage: `url(${project.image})` }} />
              ) : (
                <div className="project-image-placeholder">{project.title.charAt(0)}</div>
              )}
            </a>

            <div className="project-content">
              <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="project-title-link">
                <h3 className="project-title">{project.title}</h3>
              </a>

              {(project.language || project.stars > 0 || updated) && (
                <div className="project-meta">
                  {project.language && (
                    <span className="project-meta-lang">
                      <span className="project-meta-dot" />
                      {project.language}
                    </span>
                  )}
                  {project.stars > 0 && <span>★ {project.stars}</span>}
                  {updated && <span>updated {updated}</span>}
                </div>
              )}

              <p className="project-description">{project.blurb}</p>
              <div className="project-tech">
                {project.tech.map((tech) => (
                  <span key={tech} className="tech-tag">{tech}</span>
                ))}
              </div>

              <div className="project-links" style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="project-link-hint">
                  View Code →
                </a>
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link-hint"
                    style={{ color: '#fff' }}
                  >
                    Live Demo ↗
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
