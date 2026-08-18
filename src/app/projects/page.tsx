import PageTransition from '@/components/PageTransition';
import ProjectGrid from '@/components/ProjectGrid';
import { getProjects } from '@/lib/github';
import '../terminal.css';

export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <PageTransition>
      <main className="dark-container" style={{ justifyContent: 'flex-start', overflowY: 'auto' }}>

        <div className="page-header">
          <h1 className="page-title">Projects</h1>
          <p style={{ color: '#555', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Things I&apos;ve built and experimented with.
          </p>
        </div>

        <ProjectGrid projects={projects} />

      </main>
    </PageTransition>
  );
}
