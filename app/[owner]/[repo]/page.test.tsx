import { render, screen } from '@testing-library/react';
import * as nav from 'next/navigation';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as github from '@/lib/github';
import repoFixture from '../../../tests/fixtures/repo-detail.json';
import Page from './page';

vi.mock('@/lib/github', async () => {
  const actual = await vi.importActual<typeof github>('@/lib/github');
  return {
    ...actual,
    getRepository: vi.fn(),
  };
});

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: () => ({ back: vi.fn(), push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

function makeParams(owner: string, repo: string) {
  return Promise.resolve({ owner, repo });
}

describe('<Page /> (詳細ページ)', () => {
  it('成功時に name / description / language / 統計 / html_url リンクを描画する', async () => {
    vi.mocked(github.getRepository).mockResolvedValue({
      data: repoFixture as github.RepositoryResult['data'],
      rateLimit: null,
    });
    const ui = await Page({ params: makeParams('facebook', 'react') });
    render(ui);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('react');
    expect(screen.getByText('The library for web and native user interfaces.')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    // Watcher = subscribers_count (watchers_count ではない)
    expect(screen.getByText('6,629')).toBeInTheDocument();
    // Star 数
    expect(screen.getByText('244,917')).toBeInTheDocument();
    // GitHub への外部リンク
    const external = screen.getByRole('link', { name: /GitHub で開く/ });
    expect(external).toHaveAttribute('href', 'https://github.com/facebook/react');
  });

  it('getRepository が NotFoundError を throw した場合は notFound() を呼ぶ', async () => {
    vi.mocked(github.getRepository).mockRejectedValue(new github.NotFoundError('foo/bar'));

    await expect(Page({ params: makeParams('foo', 'bar') })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(nav.notFound).toHaveBeenCalled();
  });

  it('RateLimitError 発生時は throw せず <RateLimitBanner /> を描画する', async () => {
    vi.mocked(github.getRepository).mockRejectedValue(
      new github.RateLimitError(Math.floor(Date.now() / 1000) + 300, 'core'),
    );
    const ui = await Page({ params: makeParams('facebook', 'react') });
    render(ui);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/GitHub REST API/)).toBeInTheDocument();
  });

  it('一般的な GitHubApiError は error.tsx まで伝播させる', async () => {
    vi.mocked(github.getRepository).mockRejectedValue(new github.GitHubApiError(500, 'boom'));

    await expect(Page({ params: makeParams('facebook', 'react') })).rejects.toBeInstanceOf(
      github.GitHubApiError,
    );
  });
});
