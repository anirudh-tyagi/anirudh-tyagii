import HeroSection from '@/components/sections/HeroSection';
import NowSection from '@/components/sections/NowSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ActivitySection from '@/components/sections/ActivitySection';
import AboutSection from '@/components/sections/AboutSection';
import ContactSection from '@/components/sections/ContactSection';
import { getProjects } from '@/lib/github';
import {
  getContributions, getActiveRepos, getRecentCommits, getLanguageBreakdown, getCommitRhythm,
} from '@/lib/github-activity';
import './terminal.css';

// Bounded by the GitHub data below; the static half of the page is
// prerendered either way.
export const revalidate = 1800;

export default async function Home() {
  const [projects, calendar, activeRepos, commits, languages, rhythm] = await Promise.all([
    getProjects(),
    getContributions(),
    getActiveRepos(4),
    getRecentCommits(10),
    getLanguageBreakdown(),
    getCommitRhythm(),
  ]);

  return (
    <main className="dark-container single-page">
      <HeroSection />
      <NowSection repos={activeRepos} commits={commits} calendar={calendar} />
      <ProjectsSection projects={projects} />
      <ActivitySection
        calendar={calendar}
        activeRepos={activeRepos}
        commits={commits}
        languages={languages}
        rhythm={rhythm}
      />
      <AboutSection languages={languages} />
      <ContactSection />
    </main>
  );
}
