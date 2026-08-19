'use client';

import { motion } from 'motion/react';
import type { ActiveRepo, RecentCommit, ContributionCalendar } from '@/lib/github-activity';
import Tilt from '@/components/Depth/Tilt';

/**
 * A live status band under the hero.
 *
 * Everything here is derived from GitHub, deliberately. A hand-written
 * "currently" list is stale the week after you write it; this one is
 * correct as long as the commits keep landing, with nothing to maintain.
 */

function since(iso: string): string {
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return 'minutes ago';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function weekTotal(calendar: ContributionCalendar | null): number {
  if (!calendar) return 0;
  return calendar.days.slice(-7).reduce((n, d) => n + d.count, 0);
}

export default function NowSection({
  repos,
  commits,
  calendar,
}: {
  repos: ActiveRepo[];
  commits: RecentCommit[];
  calendar: ContributionCalendar | null;
}) {
  const latest = repos[0] ?? null;
  if (!latest) return null;

  const lastCommit = commits[0] ?? null;
  const alsoActive = repos.slice(1, 3);
  const week = weekTotal(calendar);
  const activeRepoCount = new Set(commits.map((c) => c.repo)).size;

  return (
    <motion.section
      className="now-band"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Tilt max={3} lift={10}>
      <div className="now-inner">
        <div className="now-head">
          <span className="now-dot" />
          Right now
          <span className="now-live">live from github</span>
        </div>

        <a className="now-focus" href={latest.url} target="_blank" rel="noopener noreferrer">
          <span className="now-focus-label">building</span>
          <span className="now-focus-name">{latest.name}</span>
          <span className="now-focus-meta">
            {latest.language && (
              <>
                <span className="now-lang-dot" />
                {latest.language}
              </>
            )}
            <span>pushed {since(latest.pushedAt)}</span>
          </span>
        </a>

        {lastCommit && (
          <p className="now-commit">
            <span className="now-commit-sha">{lastCommit.sha.slice(0, 7)}</span>
            {lastCommit.message}
          </p>
        )}

        <div className="now-foot">
          {week > 0 && (
            <span>
              <strong>{week}</strong> contributions this week
            </span>
          )}
          {activeRepoCount > 1 && (
            <span>
              across <strong>{activeRepoCount}</strong> repos
            </span>
          )}
          {calendar && calendar.currentStreak > 1 && (
            <span>
              <strong>{calendar.currentStreak}</strong> day streak
            </span>
          )}
          {alsoActive.length > 0 && (
            <span className="now-also">
              also warm:{' '}
              {alsoActive.map((r, i) => (
                <span key={r.name}>
                  {i > 0 && ', '}
                  <a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
      </Tilt>
    </motion.section>
  );
}
