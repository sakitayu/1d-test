import { describe, expect, it } from 'vitest';
import { PAGE_MAX, parseSearchParams, Q_MAX } from './search-params';

describe('parseSearchParams', () => {
  it('returns empty when q is missing', () => {
    expect(parseSearchParams({})).toEqual({ kind: 'empty', page: 1 });
  });

  it('returns empty when q is whitespace only', () => {
    expect(parseSearchParams({ q: '   ' })).toEqual({ kind: 'empty', page: 1 });
  });

  it('trims surrounding whitespace from q', () => {
    expect(parseSearchParams({ q: '  react  ' })).toEqual({
      kind: 'valid',
      q: 'react',
      page: 1,
    });
  });

  it('accepts q at exactly 256 characters', () => {
    const q = 'a'.repeat(Q_MAX);
    expect(parseSearchParams({ q })).toEqual({ kind: 'valid', q, page: 1 });
  });

  it('rejects q at 257 characters as too_long', () => {
    const q = 'a'.repeat(Q_MAX + 1);
    expect(parseSearchParams({ q })).toEqual({
      kind: 'invalid',
      q,
      page: 1,
      error: 'too_long',
    });
  });

  it('clamps page=0 to 1', () => {
    expect(parseSearchParams({ q: 'react', page: '0' })).toMatchObject({ page: 1 });
  });

  it('clamps page beyond PAGE_MAX', () => {
    expect(parseSearchParams({ q: 'react', page: '99' })).toMatchObject({ page: PAGE_MAX });
  });

  it('falls back to page=1 for non-numeric input', () => {
    expect(parseSearchParams({ q: 'react', page: 'abc' })).toMatchObject({ page: 1 });
  });

  it('uses the first element when q arrives as string[]', () => {
    expect(parseSearchParams({ q: ['react', 'vue'] })).toMatchObject({
      kind: 'valid',
      q: 'react',
    });
  });

  it('uses the first element when page arrives as string[]', () => {
    expect(parseSearchParams({ q: 'react', page: ['2', '3'] })).toMatchObject({ page: 2 });
  });
});
