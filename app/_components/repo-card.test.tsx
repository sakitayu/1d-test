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
  it('shows owner avatar with login as alt text (a11y, not decorative)', () => {
    render(<RepoCard repo={baseRepo} />);
    const avatar = screen.getByAltText('facebook') as HTMLImageElement;
    expect(avatar.src).toContain('avatar.png');
  });

  it('renders the full_name, description, language, and formatted star count', () => {
    render(<RepoCard repo={baseRepo} />);
    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(screen.getByText('The library for web and native user interfaces.')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('244,917')).toBeInTheDocument();
  });

  it('links the entire card to /:owner/:repo (matches GitHub URL grammar)', () => {
    render(<RepoCard repo={baseRepo} />);
    const link = screen.getByRole('link', { name: /facebook\/react/i });
    expect(link.getAttribute('href')).toBe('/facebook/react');
  });

  it('does not show description when null (avoids dangling empty paragraph)', () => {
    render(<RepoCard repo={{ ...baseRepo, description: null }} />);
    expect(
      screen.queryByText('The library for web and native user interfaces.'),
    ).not.toBeInTheDocument();
  });

  it('does not render the language pill when language is null', () => {
    render(<RepoCard repo={{ ...baseRepo, language: null }} />);
    expect(screen.queryByText('JavaScript')).not.toBeInTheDocument();
  });

  it('does not surface watcher / fork / issue counts (kept for the detail page)', () => {
    render(<RepoCard repo={baseRepo} />);
    expect(screen.queryByText(String(baseRepo.forks_count))).not.toBeInTheDocument();
    expect(screen.queryByText(String(baseRepo.open_issues_count))).not.toBeInTheDocument();
  });
});
