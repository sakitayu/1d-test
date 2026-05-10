import { env } from './env';
import type { Repository, RepositoryDetail, SearchRepositoriesResponse } from './github-types';

const API_BASE = 'https://api.github.com';
const PER_PAGE = 30;

// Cache hint is a Next.js extension; non-Next runtimes ignore it harmlessly.
// 60s strikes a balance between data freshness and being a polite API client.
const REVALIDATE_SECONDS = 60;

const COMMON_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

// Domain-level errors. The API client never calls Next.js control-flow
// helpers (`notFound()` / `redirect()`); routes translate these errors
// at the boundary so the client stays framework-agnostic.

export class NotFoundError extends Error {
  constructor(public resource: string) {
    super(`Not found: ${resource}`);
    this.name = 'NotFoundError';
  }
}

export type RateLimitResource = 'search' | 'core' | 'code_search' | 'graphql' | string;

export class RateLimitError extends Error {
  constructor(
    public reset: number,
    public resource: RateLimitResource,
  ) {
    super(`GitHub API rate limit exceeded (${resource})`);
    this.name = 'RateLimitError';
  }
}

export class GitHubApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export type RateLimitMeta = {
  limit: number;
  remaining: number;
  reset: number;
  resource: RateLimitResource;
};

export type SearchResult = {
  items: Repository[];
  totalCount: number;
  rateLimit: RateLimitMeta | null;
};

export type RepositoryResult = {
  data: RepositoryDetail;
  rateLimit: RateLimitMeta | null;
};

export async function searchRepositories(q: string, page = 1): Promise<SearchResult> {
  const url = new URL('/search/repositories', API_BASE);
  url.searchParams.set('q', q);
  url.searchParams.set('per_page', String(PER_PAGE));
  url.searchParams.set('page', String(page));
  url.searchParams.set('sort', 'stars');
  url.searchParams.set('order', 'desc');

  const res = await githubFetch(url);
  if (!res.ok) throw await toDomainError(res, `search:${q}`);
  const json = (await res.json()) as SearchRepositoriesResponse;
  return {
    items: json.items,
    totalCount: json.total_count,
    rateLimit: parseRateLimit(res.headers),
  };
}

export async function getRepository(owner: string, repo: string): Promise<RepositoryResult> {
  const url = new URL(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, API_BASE);
  const res = await githubFetch(url);
  if (!res.ok) throw await toDomainError(res, `${owner}/${repo}`);
  const data = (await res.json()) as RepositoryDetail;
  return {
    data,
    rateLimit: parseRateLimit(res.headers),
  };
}

function githubFetch(url: URL): Promise<Response> {
  const headers: Record<string, string> = { ...COMMON_HEADERS };
  if (env.GITHUB_TOKEN) {
    // Authenticated: 5,000 core req/hour, 30 search req/min.
    headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }
  // Unauthenticated fallback: 60 core req/hour, 10 search req/min.
  // The rate-limit UI surfaces both windows uniformly.
  return fetch(url, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
  } as RequestInit);
}

async function toDomainError(res: Response, resource: string): Promise<Error> {
  const remaining = res.headers.get('x-ratelimit-remaining');
  const reset = res.headers.get('x-ratelimit-reset');
  const rlResource = res.headers.get('x-ratelimit-resource') ?? 'core';

  if (res.status === 403 && remaining === '0' && reset) {
    return new RateLimitError(Number(reset), rlResource);
  }
  if (res.status === 404) {
    return new NotFoundError(resource);
  }

  // Best-effort: surface the API's own message for ops/debug, fall back
  // to status text if the body isn't JSON-shaped.
  let message = `${res.status} ${res.statusText}`;
  try {
    const body = (await res.json()) as { message?: string };
    if (body?.message) message = body.message;
  } catch {
    // ignore
  }
  return new GitHubApiError(res.status, message);
}

function parseRateLimit(headers: Headers): RateLimitMeta | null {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');
  const resource = headers.get('x-ratelimit-resource');
  if (!limit || !remaining || !reset || !resource) return null;
  return {
    limit: Number(limit),
    remaining: Number(remaining),
    reset: Number(reset),
    resource,
  };
}
