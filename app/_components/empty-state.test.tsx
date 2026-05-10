import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('<EmptyState />', () => {
  it('shows the no-results headline and echoes the query so users know what was tried', () => {
    render(<EmptyState query="kubernetes-foo-bar" />);
    expect(screen.getByText('該当するリポジトリが見つかりませんでした')).toBeInTheDocument();
    expect(screen.getByText(/kubernetes-foo-bar/)).toBeInTheDocument();
  });
});
