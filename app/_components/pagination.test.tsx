import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from './pagination';

describe('<Pagination />', () => {
  it('renders nothing for a single page result', () => {
    const { container } = render(<Pagination q="react" currentPage={1} totalCount={10} />);
    expect(container.firstChild).toBeNull();
  });

  it('disables 前へ on first page and points 次へ to ?q=...&page=2', () => {
    render(<Pagination q="react" currentPage={1} totalCount={1000} />);
    expect(screen.getByText('前へ').closest('span')).toHaveAttribute('aria-disabled', 'true');
    const next = screen.getByText('次へ').closest('a');
    expect(next).not.toBeNull();
    expect(next?.getAttribute('href')).toBe('/?q=react&page=2');
  });

  it('drops page=1 from the URL on the way back to first page (cleaner sharing)', () => {
    render(<Pagination q="react" currentPage={2} totalCount={1000} />);
    const prev = screen.getByText('前へ').closest('a');
    expect(prev?.getAttribute('href')).toBe('/?q=react');
  });

  it('clamps last page to 34 when totalCount exceeds 1,000 (Search API hard cap)', () => {
    render(<Pagination q="react" currentPage={34} totalCount={6_000_000} />);
    expect(screen.getByText('34 / 34')).toBeInTheDocument();
    expect(screen.getByText('次へ').closest('span')).toHaveAttribute('aria-disabled', 'true');
  });
});
