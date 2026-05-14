import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('<EmptyState />', () => {
  it('未ヒット見出しと検索クエリを表示する (何で検索したか分かるように)', () => {
    render(<EmptyState query="kubernetes-foo-bar" />);
    expect(screen.getByText('該当するリポジトリが見つかりませんでした')).toBeInTheDocument();
    expect(screen.getByText(/kubernetes-foo-bar/)).toBeInTheDocument();
  });
});
