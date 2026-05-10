import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SearchForm } from './search-form';

describe('<SearchForm />', () => {
  it('renders a form that GETs / so the browser handles submit even without JS', () => {
    const { container } = render(<SearchForm />);
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('action')).toBe('/');
    expect(form?.getAttribute('method')).toBe('get');
  });

  it('wraps the form in a <search> landmark for assistive tech', () => {
    const { container } = render(<SearchForm />);
    expect(container.querySelector('search > form')).not.toBeNull();
  });

  it('uses defaultValue from initialQuery so submit re-prefills via the URL', () => {
    render(<SearchForm initialQuery="react" />);
    const input = screen.getByLabelText('リポジトリを検索') as HTMLInputElement;
    expect(input.defaultValue).toBe('react');
    expect(input.getAttribute('name')).toBe('q');
  });

  it('submits with name="q" so the URL becomes /?q=...', () => {
    render(<SearchForm />);
    const input = screen.getByLabelText('リポジトリを検索');
    expect(input.getAttribute('name')).toBe('q');
  });
});
