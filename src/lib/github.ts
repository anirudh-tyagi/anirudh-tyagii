import { curatedProjects, type CuratedProject } from '@/data/projects';

const GITHUB_USER = 'anirudh-tyagi';

interface GithubRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  html_url: string;
}

export interface Project extends CuratedProject {
  stars: number;
  language: string | null;
  pushedAt: string;
  codeUrl: string;
}

function withFallback(overrides: Map<string, GithubRepo>): Project[] {
  return curatedProjects
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const live = overrides.get(p.repo);
      return {
        ...p,
        stars: live?.stargazers_count ?? 0,
        language: live?.language ?? null,
        pushedAt: live?.pushed_at ?? '',
        codeUrl: live?.html_url ?? `https://github.com/${GITHUB_USER}/${p.repo}`,
      };
    });
}

// Fetches live repo metadata (stars, language, last-pushed date) and merges
// it with the curated project list. If the GitHub API is unreachable or
// rate-limited, falls back to curated data alone — the grid still renders
// correctly, just without star counts.
export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return withFallback(new Map());
    }

    const repos: GithubRepo[] = await res.json();
    const byName = new Map(repos.map((r) => [r.name, r] as const));
    return withFallback(byName);
  } catch {
    return withFallback(new Map());
  }
}
