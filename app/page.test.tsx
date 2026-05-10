import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as github from '@/lib/github';
import searchFixture from '../tests/fixtures/search-response.json';
import Page from './page';

vi.mock('@/lib/github', async () => {
  const actual = await vi.importActual<typeof github>('@/lib/github');
  return {
    ...actual,
    searchRepositories: vi.fn(),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeSearchParams(input: Record<string, string>) {
  return Promise.resolve(input);
}

describe('<Page /> (search)', () => {
  it('renders only the form when no q is provided (no API call)', async () => {
    const ui = await Page({ searchParams: makeSearchParams({}) });
    render(ui);
    expect(screen.getByLabelText('リポジトリを検索')).toBeInTheDocument();
    expect(github.searchRepositories).not.toHaveBeenCalled();
  });

  it('shows QueryErrorBanner for q > 256 chars and skips the API call', async () => {
    const longQ = 'x'.repeat(300);
    const ui = await Page({ searchParams: makeSearchParams({ q: longQ }) });
    render(ui);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(github.searchRepositories).not.toHaveBeenCalled();
  });

  it('renders the result list when the API returns items', async () => {
    vi.mocked(github.searchRepositories).mockResolvedValue({
      items: searchFixture.items as github.SearchResult['items'],
      totalCount: searchFixture.total_count,
      rateLimit: null,
    });
    const ui = await Page({ searchParams: makeSearchParams({ q: 'react' }) });
    render(ui);
    expect(screen.getAllByRole('link')).not.toHaveLength(0);
    expect(github.searchRepositories).toHaveBeenCalledWith('react', 1);
  });

  it('renders <EmptyState /> when items is empty (and not an alert)', async () => {
    vi.mocked(github.searchRepositories).mockResolvedValue({
      items: [],
      totalCount: 0,
      rateLimit: null,
    });
    const ui = await Page({ searchParams: makeSearchParams({ q: 'zzznosuchrepo' }) });
    render(ui);
    expect(screen.getByText('該当するリポジトリが見つかりませんでした')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders <RateLimitBanner /> instead of throwing when RateLimitError is raised', async () => {
    vi.mocked(github.searchRepositories).mockRejectedValue(
      new github.RateLimitError(Math.floor(Date.now() / 1000) + 120, 'search'),
    );
    const ui = await Page({ searchParams: makeSearchParams({ q: 'react' }) });
    render(ui);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/検索 API/)).toBeInTheDocument();
  });

  it('lets non-RateLimitError errors propagate so error.tsx can handle them', async () => {
    vi.mocked(github.searchRepositories).mockRejectedValue(new github.GitHubApiError(500, 'boom'));
    await expect(Page({ searchParams: makeSearchParams({ q: 'react' }) })).rejects.toBeInstanceOf(
      github.GitHubApiError,
    );
  });
});
