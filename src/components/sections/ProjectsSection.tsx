'use client';

import ProjectGrid from '@/components/ProjectGrid';
import SectionHeading from './SectionHeading';
import type { Project } from '@/lib/github';

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  return (
    <section className="page-section" id="projects">
      <SectionHeading title="Projects" sub="Six things I've built. The line under each one is why." />
      <ProjectGrid projects={projects} />
    </section>
  );
}
