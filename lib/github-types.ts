// Hand-written types for GitHub REST API responses. Only the fields the app
// actually consumes are listed — the API returns far more, but pulling everything
// in would create a maintenance burden without value.

export type Repository = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  // GitHub API quirk: `watchers_count` is a historical alias and returns the
  // same value as `stargazers_count`. The "real" watcher count (notification
  // subscribers) is exposed only on the detail endpoint as `subscribers_count`.
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  updated_at: string;
};

export type SearchRepositoriesResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
};

// Extra fields available only via `/repos/{owner}/{repo}`.
// `subscribers_count` is what the app surfaces as "Watcher 数" on the detail page.
export type RepositoryDetail = Repository & {
  subscribers_count: number;
};
