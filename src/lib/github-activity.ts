// GitHub activity data for the projects page: contribution calendar,
// currently-active repos, and a recent-commit feed.
//
// Every fetch degrades gracefully — if GitHub is unreachable or the
// unauthenticated rate limit (60/hr per IP) is exhausted, each function
// returns null/[] and the UI hides that section rather than erroring.
//
// GITHUB_TOKEN is optional but recommended in production:
//   - raises the rate limit from 60/hr to 5,000/hr
//   - enables the official GraphQL contributions API, which includes
//     private-repo contributions (the public proxy fallback cannot)
// A classic PAT with no scopes (or a fine-grained token with read-only
// public access) is enough for the higher limit; `read:user` is needed
// for private contribution counts.

const GITHUB_USER = 'anirudh-tyagi';
const REVALIDATE = 1800; // 30 min

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
  days: ContributionDay[];
  total: number;
  currentStreak: number;
  longestStreak: number;
  busiestDay: ContributionDay | null;
  source: 'graphql' | 'proxy';
}

export interface ActiveRepo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  isFork: boolean;
}

export interface RecentCommit {
  sha: string;
  message: string;
  url: string;
  repo: string;
  date: string;
}

function authHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GitHub's own calendar buckets counts into 5 levels relative to the
// user's busiest day. We replicate that so the proxy and GraphQL paths
// produce visually identical heatmaps.
function levelFor(count: number, max: number): ContributionDay['level'] {
  if (count <= 0) return 0;
  if (max <= 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function computeStreaks(days: ContributionDay[]): { current: number; longest: number } {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    if (d.count > 0) {
      run += 1;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }

  // Current streak counts backwards from today. Today having no commits
  // yet doesn't break a streak — only a gap on a prior day does.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      current += 1;
    } else if (i !== days.length - 1) {
      break;
    }
  }

  return { current, longest };
}

function finalize(
  raw: { date: string; count: number }[],
  total: number,
  source: ContributionCalendar['source']
): ContributionCalendar {
  const max = raw.reduce((m, d) => (d.count > m ? d.count : m), 0);
  const days: ContributionDay[] = raw.map((d) => ({
    date: d.date,
    count: d.count,
    level: levelFor(d.count, max),
  }));
  const { current, longest } = computeStreaks(days);
  const busiestDay = days.reduce<ContributionDay | null>(
    (best, d) => (best === null || d.count > best.count ? d : best),
    null
  );

  return { days, total, currentStreak: current, longestStreak: longest, busiestDay, source };
}

async function fromGraphQL(): Promise<ContributionCalendar | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);
  from.setDate(from.getDate() + 1);

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }`;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { login: GITHUB_USER, from: from.toISOString(), to: to.toISOString() },
      }),
      next: { revalidate: REVALIDATE },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal?.weeks) return null;

    const raw = cal.weeks.flatMap(
      (w: { contributionDays: { date: string; contributionCount: number }[] }) =>
        w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
    );
    if (raw.length === 0) return null;

    return finalize(raw, cal.totalContributions ?? 0, 'graphql');
  } catch {
    return null;
  }
}

async function fromProxy(): Promise<ContributionCalendar | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`,
      { next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return null;

    const json = await res.json();
    const raw: { date: string; count: number }[] = json?.contributions ?? [];
    if (raw.length === 0) return null;

    const total =
      json?.total?.lastYear ?? raw.reduce((sum, d) => sum + d.count, 0);
    return finalize(raw, total, 'proxy');
  } catch {
    return null;
  }
}

export async function getContributions(): Promise<ContributionCalendar | null> {
  return (await fromGraphQL()) ?? (await fromProxy());
}

async function getRepos(): Promise<ActiveRepo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
      { headers: authHeaders(), next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return [];

    const repos = await res.json();
    if (!Array.isArray(repos)) return [];

    return repos.map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count ?? 0,
      pushedAt: r.pushed_at,
      isFork: Boolean(r.fork),
    }));
  } catch {
    return [];
  }
}

export interface LanguageSlice {
  name: string;
  count: number;
  share: number;
}

// Breadth of stacks, measured rather than asserted: the primary language of
// every public repo, aggregated. Uses the repo listing already fetched
// above, so it costs no extra API calls.
export async function getLanguageBreakdown(): Promise<LanguageSlice[]> {
  const repos = (await getRepos()).filter((r) => !r.isFork && r.language);
  if (repos.length === 0) return [];

  const counts = new Map<string, number>();
  for (const r of repos) {
    const key = r.language as string;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const total = repos.length;
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, share: count / total }))
    .sort((a, b) => b.count - a.count);
}

export interface CommitRhythm {
  sampled: number;
  nightShare: number;
  peakHour: number;
}

/**
 * Time-of-day rhythm across recent commits. Sampled from the five most
 * recently pushed repos rather than every repo, to keep this to five API
 * calls. Returns null below a usable sample size instead of presenting a
 * number that a handful of commits could swing.
 */
export async function getCommitRhythm(): Promise<CommitRhythm | null> {
  const repos = (await getRepos()).filter((r) => !r.isFork).slice(0, 5);
  if (repos.length === 0) return null;

  const hours: number[] = [];
  await Promise.all(
    repos.map(async (repo) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/commits?author=${GITHUB_USER}&per_page=100`,
          { headers: authHeaders(), next: { revalidate: REVALIDATE } }
        );
        if (!res.ok) return;
        const commits = await res.json();
        if (!Array.isArray(commits)) return;
        for (const c of commits) {
          const iso = c.commit?.author?.date;
          if (iso) hours.push(new Date(iso).getUTCHours());
        }
      } catch {
        // Skip this repo; a partial sample is still useful.
      }
    })
  );

  if (hours.length < 40) return null;

  const buckets = new Array(24).fill(0);
  for (const h of hours) buckets[h] += 1;

  // Commit timestamps are UTC; shift to IST, where the work happened.
  const local = buckets.map((_, h) => buckets[(h - 5 + 24) % 24]);
  const night = local.reduce((n, count, h) => (h >= 21 || h < 5 ? n + count : n), 0);

  return {
    sampled: hours.length,
    nightShare: night / hours.length,
    peakHour: local.indexOf(Math.max(...local)),
  };
}

export async function getActiveRepos(limit = 3): Promise<ActiveRepo[]> {
  const repos = await getRepos();
  return repos.filter((r) => !r.isFork).slice(0, limit);
}

// The public events API stopped including commit details in its PushEvent
// payloads, so the feed is assembled from per-repo commit listings on the
// most recently pushed repos instead.
export async function getRecentCommits(limit = 8): Promise<RecentCommit[]> {
  const repos = (await getRepos()).filter((r) => !r.isFork).slice(0, 4);
  if (repos.length === 0) return [];

  const perRepo = await Promise.all(
    repos.map(async (repo) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${GITHUB_USER}/${repo.name}/commits?author=${GITHUB_USER}&per_page=${limit}`,
          { headers: authHeaders(), next: { revalidate: REVALIDATE } }
        );
        if (!res.ok) return [];

        const commits = await res.json();
        if (!Array.isArray(commits)) return [];

        return commits.map((c): RecentCommit => ({
          sha: c.sha,
          message: (c.commit?.message ?? '').split('\n')[0],
          url: c.html_url,
          repo: repo.name,
          date: c.commit?.author?.date ?? c.commit?.committer?.date ?? '',
        }));
      } catch {
        return [];
      }
    })
  );

  return perRepo
    .flat()
    .filter((c) => c.date && c.message)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
