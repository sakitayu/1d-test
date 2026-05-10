import { afterEach, describe, expect, it, vi } from 'vitest';
import repoFixture from '../tests/fixtures/repo-detail.json';
import searchFixture from '../tests/fixtures/search-response.json';
import {
  GitHubApiError,
  getRepository,
  NotFoundError,
  RateLimitError,
  searchRepositories,
} from './github';

function mockFetch(response: Response) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);
}

function ratelimitedHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    'content-type': 'application/json',
    'x-ratelimit-limit': '30',
    'x-ratelimit-remaining': '0',
    'x-ratelimit-reset': '1900000000',
    'x-ratelimit-resource': 'search',
    ...extra,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('searchRepositories', () => {
  it('parses items, totalCount and rate-limit headers from a successful response', async () => {
    const fetchSpy = mockFetch(
      new Response(JSON.stringify(searchFixture), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-ratelimit-limit': '30',
          'x-ratelimit-remaining': '29',
          'x-ratelimit-reset': '1900000060',
          'x-ratelimit-resource': 'search',
        },
      }),
    );
    const result = await searchRepositories('react', 1);
    expect(result.totalCount).toBe(searchFixture.total_count);
    expect(result.items.length).toBe(searchFixture.items.length);
    expect(result.rateLimit).toEqual({
      limit: 30,
      remaining: 29,
      reset: 1_900_000_060,
      resource: 'search',
    });

    const calledUrl = fetchSpy.mock.calls[0]?.[0] as URL;
    expect(calledUrl.toString()).toContain('/search/repositories');
    expect(calledUrl.searchParams.get('q')).toBe('react');
    expect(calledUrl.searchParams.get('per_page')).toBe('30');
    expect(calledUrl.searchParams.get('sort')).toBe('stars');
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit & { next?: unknown };
    expect((init.headers as Record<string, string>).Authorization).toMatch(/^Bearer /);
    expect(init.next).toEqual({ revalidate: 60 });
  });

  it('throws RateLimitError on 403 + x-ratelimit-remaining: 0', async () => {
    mockFetch(
      new Response('{"message":"rate limited"}', { status: 403, headers: ratelimitedHeaders() }),
    );
    await expect(searchRepositories('react', 1)).rejects.toBeInstanceOf(RateLimitError);
    try {
      await searchRepositories('react', 1);
    } catch (e) {
      expect((e as RateLimitError).reset).toBe(1_900_000_000);
      expect((e as RateLimitError).resource).toBe('search');
    }
  });

  it('throws GitHubApiError on 5xx', async () => {
    mockFetch(
      new Response('{"message":"server boom"}', {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(searchRepositories('react', 1)).rejects.toBeInstanceOf(GitHubApiError);
  });

  it('falls back to status text if the body is not JSON', async () => {
    mockFetch(new Response('not json at all', { status: 502 }));
    await expect(searchRepositories('react', 1)).rejects.toMatchObject({
      name: 'GitHubApiError',
      status: 502,
    });
  });

  it('omits the Authorization header when GITHUB_TOKEN is unset', async () => {
    const original = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = '';
    vi.resetModules();
    const reloaded = await import('./github');
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(searchFixture), { status: 200 }));
    await reloaded.searchRepositories('react', 1);
    const init = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
    process.env.GITHUB_TOKEN = original;
    vi.resetModules();
  });
});

describe('getRepository', () => {
  it('returns RepositoryDetail with subscribers_count', async () => {
    mockFetch(
      new Response(JSON.stringify(repoFixture), {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'x-ratelimit-limit': '5000',
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': '1900000060',
          'x-ratelimit-resource': 'core',
        },
      }),
    );
    const result = await getRepository('facebook', 'react');
    expect(result.data.full_name).toBe('facebook/react');
    expect(result.data.subscribers_count).toBe(repoFixture.subscribers_count);
    expect(result.rateLimit?.resource).toBe('core');
  });

  it('throws NotFoundError on 404', async () => {
    mockFetch(new Response('{"message":"Not Found"}', { status: 404 }));
    await expect(getRepository('nope', 'nope')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('encodes owner and repo segments', async () => {
    const fetchSpy = mockFetch(new Response(JSON.stringify(repoFixture), { status: 200 }));
    await getRepository('owner with space', 'repo/with-slash');
    const url = fetchSpy.mock.calls[0]?.[0] as URL;
    expect(url.pathname).toBe('/repos/owner%20with%20space/repo%2Fwith-slash');
  });
});
