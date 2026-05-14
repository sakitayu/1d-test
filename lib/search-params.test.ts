import { describe, expect, it } from 'vitest';
import { PAGE_MAX, parseSearchParams, Q_MAX } from './search-params';

describe('parseSearchParams', () => {
  it('q が無い場合は empty を返す', () => {
    expect(parseSearchParams({})).toEqual({ kind: 'empty', page: 1 });
  });

  it('q が空白のみの場合は empty を返す', () => {
    expect(parseSearchParams({ q: '   ' })).toEqual({ kind: 'empty', page: 1 });
  });

  it('q 前後の空白を trim する', () => {
    expect(parseSearchParams({ q: '  react  ' })).toEqual({
      kind: 'valid',
      q: 'react',
      page: 1,
    });
  });

  it('q がちょうど 256 文字なら valid として受け入れる', () => {
    const q = 'a'.repeat(Q_MAX);
    expect(parseSearchParams({ q })).toEqual({ kind: 'valid', q, page: 1 });
  });

  it('q が 257 文字なら too_long として拒否する', () => {
    const q = 'a'.repeat(Q_MAX + 1);
    expect(parseSearchParams({ q })).toEqual({
      kind: 'invalid',
      q,
      page: 1,
      error: 'too_long',
    });
  });

  it('page=0 は 1 にクランプする', () => {
    expect(parseSearchParams({ q: 'react', page: '0' })).toMatchObject({ page: 1 });
  });

  it('PAGE_MAX を超える page をクランプする', () => {
    expect(parseSearchParams({ q: 'react', page: '99' })).toMatchObject({ page: PAGE_MAX });
  });

  it('数値以外の page は 1 にフォールバックする', () => {
    expect(parseSearchParams({ q: 'react', page: 'abc' })).toMatchObject({ page: 1 });
  });

  it('q が string[] で来た場合は先頭要素を使う', () => {
    expect(parseSearchParams({ q: ['react', 'vue'] })).toMatchObject({
      kind: 'valid',
      q: 'react',
    });
  });

  it('page が string[] で来た場合は先頭要素を使う', () => {
    expect(parseSearchParams({ q: 'react', page: ['2', '3'] })).toMatchObject({ page: 2 });
  });
});
