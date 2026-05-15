import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Pagination } from './pagination';

describe('<Pagination />', () => {
  it('1 ページに収まる場合は何も描画しない', () => {
    const { container } = render(<Pagination q="react" currentPage={1} totalCount={10} />);

    expect(container.firstChild).toBeNull();
  });

  it('1 ページ目では「前へ」を disabled にし、「次へ」を ?q=...&page=2 に向ける', () => {
    render(<Pagination q="react" currentPage={1} totalCount={1000} />);

    expect(screen.getByText('前へ').closest('span')).toHaveAttribute('aria-disabled', 'true');
    const next = screen.getByText('次へ').closest('a');
    expect(next).not.toBeNull();
    expect(next?.getAttribute('href')).toBe('/?q=react&page=2');
  });

  it('1 ページ目に戻る際は URL から page=1 を落とす (共有 URL を綺麗にする)', () => {
    render(<Pagination q="react" currentPage={2} totalCount={1000} />);

    const prev = screen.getByText('前へ').closest('a');
    expect(prev?.getAttribute('href')).toBe('/?q=react');
  });

  it('totalCount が 1,000 件を超える場合は最終ページを 34 で頭打ちにする (Search API hard cap)', () => {
    render(<Pagination q="react" currentPage={34} totalCount={6_000_000} />);

    expect(screen.getByText('34 / 34')).toBeInTheDocument();
    expect(screen.getByText('次へ').closest('span')).toHaveAttribute('aria-disabled', 'true');
  });
});
