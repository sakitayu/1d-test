import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RepoStats } from './repo-stats';

describe('<RepoStats />', () => {
  it('renders all four metrics with Intl.NumberFormat formatting', () => {
    render(<RepoStats stargazers={244917} watchers={6629} forks={51011} openIssues={1288} />);
    expect(screen.getByText('Star')).toBeInTheDocument();
    expect(screen.getByText('Watcher')).toBeInTheDocument();
    expect(screen.getByText('Fork')).toBeInTheDocument();
    expect(screen.getByText('Issue')).toBeInTheDocument();
    expect(screen.getByText('244,917')).toBeInTheDocument();
    expect(screen.getByText('6,629')).toBeInTheDocument();
    expect(screen.getByText('51,011')).toBeInTheDocument();
    expect(screen.getByText('1,288')).toBeInTheDocument();
  });
});
