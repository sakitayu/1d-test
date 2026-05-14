import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Repository } from '@/lib/github-types';
import { RepoCard } from './repo-card';

const baseRepo: Repository = {
  id: 1,
  name: 'react',
  full_name: 'facebook/react',
  owner: {
    login: 'facebook',
    avatar_url: 'https://example.test/avatar.png',
  },
  description: 'The library for web and native user interfaces.',
  language: 'JavaScript',
  stargazers_count: 244917,
  watchers_count: 244917,
  forks_count: 51011,
  open_issues_count: 1288,
  html_url: 'https://github.com/facebook/react',
  updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
};

describe('<RepoCard />', () => {
  it('owner アバターの alt に login を入れる (装飾扱いではなく a11y)', () => {
    render(<RepoCard repo={baseRepo} />);
    const avatar = screen.getByAltText('facebook') as HTMLImageElement;
    expect(avatar.src).toContain('avatar.png');
  });

  it('full_name / description / language / フォーマット済み Star 数を描画する', () => {
    render(<RepoCard repo={baseRepo} />);
    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(screen.getByText('The library for web and native user interfaces.')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('244,917')).toBeInTheDocument();
  });

  it('カード全体を /:owner/:repo にリンクする (GitHub URL 規約に合わせる)', () => {
    render(<RepoCard repo={baseRepo} />);
    const link = screen.getByRole('link', { name: /facebook\/react/i });
    expect(link.getAttribute('href')).toBe('/facebook/react');
  });

  it('description が null の場合は描画しない (空段落を残さない)', () => {
    render(<RepoCard repo={{ ...baseRepo, description: null }} />);
    expect(
      screen.queryByText('The library for web and native user interfaces.'),
    ).not.toBeInTheDocument();
  });

  it('language が null の場合は言語ピルを描画しない', () => {
    render(<RepoCard repo={{ ...baseRepo, language: null }} />);
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });

  it('Watcher / Fork / Issue 数は表示しない (詳細ページに集約)', () => {
    render(<RepoCard repo={baseRepo} />);
    expect(screen.queryByText(String(baseRepo.forks_count))).not.toBeInTheDocument();
    expect(screen.queryByText(String(baseRepo.open_issues_count))).not.toBeInTheDocument();
  });
});
