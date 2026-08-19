'use client';

import GitHubActivity from '@/components/GitHubActivity';
import SectionHeading from './SectionHeading';
import type {
  ContributionCalendar, ActiveRepo, RecentCommit, LanguageSlice, CommitRhythm,
} from '@/lib/github-activity';

export default function ActivitySection({
  calendar, activeRepos, commits, languages, rhythm,
}: {
  calendar: ContributionCalendar | null;
  activeRepos: ActiveRepo[];
  commits: RecentCommit[];
  languages: LanguageSlice[];
  rhythm: CommitRhythm | null;
}) {
  return (
    <section className="page-section" id="activity">
      <SectionHeading title="Activity" sub="What I'm building, straight from GitHub." />
      <GitHubActivity
        calendar={calendar}
        activeRepos={activeRepos}
        commits={commits}
        languages={languages}
        rhythm={rhythm}
      />
    </section>
  );
}
