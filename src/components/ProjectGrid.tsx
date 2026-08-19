'use client';

import { motion } from 'motion/react';
import type { Project } from '@/lib/github';
import Tilt from '@/components/Depth/Tilt';

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
          <Tilt key={project.repo} max={5} lift={14}>
          <motion.article
            className="project-card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              delay: index * 0.07,
              duration: 0.55,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {/* Only one project has a visual worth showing. The rest are
                text-only rather than padded out with a placeholder tile. */}
            {project.image && (
              <a
                href={project.demo || project.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-image-link"
              >
                <span
                  className="project-image"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
              </a>
            )}

            <div className="project-content">
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-title-link"
              >
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
                  {project.stars > 0 && <span>{project.stars} stars</span>}
                  {updated && <span>updated {updated}</span>}
                </div>
              )}

              <p className="project-description">{project.blurb}</p>

              {project.why && (
                <p className="project-why">
                  <span className="project-why-mark" aria-hidden="true" />
                  {project.why}
                </p>
              )}

              <ul className="project-tech">
                {project.tech.map((tech) => (
                  <li key={tech} className="tech-tag">{tech}</li>
                ))}
              </ul>

              <div className="project-links">
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link-hint"
                >
                  view code <span aria-hidden="true">&rarr;</span>
                </a>
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link-hint is-demo"
                  >
                    live demo <span aria-hidden="true">&#8599;</span>
                  </a>
                )}
              </div>
            </div>
          </motion.article>
          </Tilt>
        );
      })}
    </div>
  );
}
