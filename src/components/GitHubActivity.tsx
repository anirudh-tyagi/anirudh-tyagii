'use client';

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Tilt from '@/components/Depth/Tilt';
import { motion } from 'motion/react';
import type {
  ContributionCalendar,
  ContributionDay,
  ActiveRepo,
  RecentCommit,
  LanguageSlice,
  CommitRhythm,
} from '@/lib/github-activity';
import './GitHubActivity.css';

const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function absoluteDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

// Relative timestamps are rendered only after mount. Computing them during
// SSR and again on the client produces different strings for anything
// minutes-old, which React flags as a hydration mismatch.
const subscribeToNothing = () => () => {};

function useMounted(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,  // client
    () => false  // server + first hydration pass
  );
}

interface TooltipState {
  day: ContributionDay;
  x: number;
  y: number;
}

function Heatmap({ calendar }: { calendar: ContributionCalendar }) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Pad the first column so every row lines up with a fixed weekday,
  // matching GitHub's Sunday-first calendar layout.
  const weeks = useMemo(() => {
    const days = calendar.days;
    if (days.length === 0) return [];

    const leading = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
    const cells: (ContributionDay | null)[] = [...Array(leading).fill(null), ...days];
    const out: (ContributionDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7);
      while (week.length < 7) week.push(null);
      out.push(week);
    }
    return out;
  }, [calendar.days]);

  const monthLabels = useMemo(() => {
    let lastMonth = -1;
    return weeks.map((week) => {
      const first = week.find((d): d is ContributionDay => d !== null);
      if (!first) return null;
      const month = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
      if (month !== lastMonth) {
        lastMonth = month;
        return MONTHS[month];
      }
      return null;
    });
  }, [weeks]);

  const showTooltip = (day: ContributionDay, el: HTMLElement) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const cell = el.getBoundingClientRect();
    const box = wrap.getBoundingClientRect();
    setTooltip({
      day,
      x: cell.left - box.left + cell.width / 2,
      y: cell.top - box.top,
    });
  };

  return (
    <div className="gh-heatmap-wrap" ref={wrapRef}>
      <div className="gh-heatmap-scroll">
        <div className="gh-heatmap">
          <div className="gh-months">
            {monthLabels.map((label, i) => (
              <span key={i} className="gh-month">{label}</span>
            ))}
          </div>

          <div className="gh-grid-row">
            <div className="gh-weekdays">
              {WEEKDAY_LABELS.map((label, i) => (
                <span key={i} className="gh-weekday">{label}</span>
              ))}
            </div>

            <div className="gh-weeks">
              {weeks.map((week, wi) => (
                <motion.div
                  key={wi}
                  className="gh-week"
                  initial={{ opacity: 0, scaleY: 0.3 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: wi * 0.008, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  {week.map((day, di) =>
                    day === null ? (
                      <span key={di} className="gh-cell gh-cell-empty" />
                    ) : (
                      <span
                        key={di}
                        className={`gh-cell gh-level-${day.level}`}
                        onMouseEnter={(e) => showTooltip(day, e.currentTarget)}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  )}
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {tooltip && (
        <div className="gh-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <strong>
            {tooltip.day.count === 0 ? 'No contributions' : `${tooltip.day.count} contribution${tooltip.day.count === 1 ? '' : 's'}`}
          </strong>
          <span>{absoluteDate(tooltip.day.date)}</span>
        </div>
      )}

      <div className="gh-legend">
        <span className="gh-legend-label">
          {calendar.includesPrivate ? 'Public and private contributions' : 'Public contributions'}
        </span>
        <div className="gh-legend-scale">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`gh-cell gh-level-${l}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

function StatTile({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <div className="gh-stat">
      <span className="gh-stat-value">{value}</span>
      <span className="gh-stat-label">{label}</span>
      {hint && <span className="gh-stat-hint">{hint}</span>}
    </div>
  );
}

function hour12(h: number): string {
  const suffix = h < 12 ? 'am' : 'pm';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}${suffix}`;
}

export default function GitHubActivity({
  calendar,
  activeRepos,
  commits,
  languages = [],
  rhythm = null,
}: {
  calendar: ContributionCalendar | null;
  activeRepos: ActiveRepo[];
  commits: RecentCommit[];
  languages?: LanguageSlice[];
  rhythm?: CommitRhythm | null;
}) {
  const mounted = useMounted();

  // Nothing loaded — GitHub was unreachable or rate-limited. Render nothing
  // rather than a shell of empty panels.
  if (!calendar && activeRepos.length === 0 && commits.length === 0) return null;

  return (
    <motion.section
      className="gh-activity"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="gh-section-head">
        <h2 className="gh-section-title">
          <span className="gh-live-dot" />
          Activity
        </h2>
        <a
          href="https://github.com/anirudh-tyagi"
          target="_blank"
          rel="noopener noreferrer"
          className="gh-section-link"
        >
          @anirudh-tyagi ↗
        </a>
      </div>

      {calendar && (
        <Tilt max={3} lift={8}>
        <div className="gh-panel">
          <div className="gh-stats">
              <StatTile value={String(calendar.total)} label="contributions" hint="past year" />
              <StatTile value={String(calendar.currentStreak)} label="day streak" hint="current" />
              <StatTile value={String(calendar.longestStreak)} label="day streak" hint="longest" />
              <StatTile
                value={calendar.busiestDay ? String(calendar.busiestDay.count) : '0'}
                label="busiest day"
                hint={calendar.busiestDay ? absoluteDate(calendar.busiestDay.date) : undefined}
              />
              {languages.length > 0 && (
                <StatTile
                  value={String(languages.reduce((n, l) => n + l.count, 0))}
                  label="public repos"
                  hint={`${languages.length} languages`}
                />
              )}
              {rhythm && (
                <StatTile
                  value={hour12(rhythm.peakHour)}
                  label="peak commit hour"
                  hint={`${Math.round(rhythm.nightShare * 100)}% after 9pm`}
                />
              )}
          </div>
          <Heatmap calendar={calendar} />
        </div>
        </Tilt>
      )}

      <div className="gh-columns">
        {activeRepos.length > 0 && (
          <Tilt max={3} lift={8}>
          <div className="gh-panel gh-panel-pad">
            <h3 className="gh-panel-title">Currently working on</h3>
            <ul className="gh-repo-list">
              {activeRepos.map((repo) => (
                <li key={repo.name}>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="gh-repo">
                    <div className="gh-repo-head">
                      <span className="gh-repo-name">{repo.name}</span>
                      <span className="gh-repo-time">
                        {mounted ? relativeTime(repo.pushedAt) : absoluteDate(repo.pushedAt)}
                      </span>
                    </div>
                    {repo.description && <p className="gh-repo-desc">{repo.description}</p>}
                    <div className="gh-repo-meta">
                      {repo.language && (
                        <span className="gh-repo-lang">
                          <span className="gh-lang-dot" />
                          {repo.language}
                        </span>
                      )}
                      {repo.stars > 0 && <span>★ {repo.stars}</span>}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          </Tilt>
        )}

        {commits.length > 0 && (
          <Tilt max={3} lift={8}>
          <div className="gh-panel gh-panel-pad">
            <h3 className="gh-panel-title">Latest commits</h3>
            <ul className="gh-commit-list">
              {commits.map((commit) => (
                <li key={commit.sha}>
                  <a href={commit.url} target="_blank" rel="noopener noreferrer" className="gh-commit">
                    <span className="gh-commit-sha">{commit.sha.slice(0, 7)}</span>
                    <span className="gh-commit-body">
                      <span className="gh-commit-msg">{commit.message}</span>
                      <span className="gh-commit-meta">
                        {commit.repo} · {mounted ? relativeTime(commit.date) : absoluteDate(commit.date)}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          </Tilt>
        )}
      </div>
    </motion.section>
  );
}
