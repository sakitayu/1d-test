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

describe('<Page /> (検索ページ)', () => {
  it('q が無い場合はフォームのみ描画し API を呼ばない', async () => {
    const ui = await Page({ searchParams: makeSearchParams({}) });
    render(ui);
    expect(screen.getByLabelText('リポジトリを検索')).toBeInTheDocument();
    expect(github.searchRepositories).not.toHaveBeenCalled();
  });

  it('q が 256 文字を超える場合は QueryErrorBanner を出し API を呼ばない', async () => {
    const longQ = 'x'.repeat(300);
    const ui = await Page({ searchParams: makeSearchParams({ q: longQ }) });
    render(ui);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(github.searchRepositories).not.toHaveBeenCalled();
  });

  it('API が items を返した場合は結果一覧を描画する', async () => {
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

  it('items が空の場合は <EmptyState /> を描画する (alert ではない)', async () => {
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

  it('RateLimitError 発生時は throw せず <RateLimitBanner /> を描画する', async () => {
    vi.mocked(github.searchRepositories).mockRejectedValue(
      new github.RateLimitError(Math.floor(Date.now() / 1000) + 120, 'search'),
    );
    const ui = await Page({ searchParams: makeSearchParams({ q: 'react' }) });
    render(ui);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/検索 API/)).toBeInTheDocument();
  });

  it('RateLimitError 以外はそのまま伝播させて error.tsx に委ねる', async () => {
    vi.mocked(github.searchRepositories).mockRejectedValue(new github.GitHubApiError(500, 'boom'));
    await expect(Page({ searchParams: makeSearchParams({ q: 'react' }) })).rejects.toBeInstanceOf(
      github.GitHubApiError,
    );
  });
});
