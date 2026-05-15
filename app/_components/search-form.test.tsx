import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchForm } from './search-form';

describe('<SearchForm />', () => {
  it('GET / の form を描画する (JS 無しでもブラウザが submit を処理できる)', () => {
    const { container } = render(<SearchForm />);

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('action')).toBe('/');
    expect(form?.getAttribute('method')).toBe('get');
  });

  it('form を <search> ランドマークで包む (支援技術向け)', () => {
    const { container } = render(<SearchForm />);

    expect(container.querySelector('search > form')).not.toBeNull();
  });

  it('initialQuery を defaultValue として使う (URL 経由で submit 後も再充填される)', () => {
    render(<SearchForm initialQuery="react" />);

    const input = screen.getByLabelText('リポジトリを検索') as HTMLInputElement;
    expect(input.defaultValue).toBe('react');
    expect(input.getAttribute('name')).toBe('q');
  });

  it('input に name="q" を付与する (URL クエリのキーを q にするため)', () => {
    render(<SearchForm />);

    const input = screen.getByLabelText('リポジトリを検索');
    expect(input.getAttribute('name')).toBe('q');
  });
});
