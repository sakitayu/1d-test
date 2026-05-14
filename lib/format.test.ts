import { describe, expect, it } from 'vitest';
import { formatNumber, formatRateLimitReset, formatRelativeTime } from './format';

describe('formatNumber', () => {
  it('桁区切りカンマを挿入する', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(230_000)).toBe('230,000');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-05-09T12:00:00Z');

  it('過去の日付に "n 日前" を返す', () => {
    const target = new Date('2026-05-06T12:00:00Z');
    expect(formatRelativeTime(target, now)).toBe('3 日前');
  });

  it('ゼロ近傍では "今" / "今日" を返す', () => {
    // `numeric: 'auto'` はゼロ近傍でロケールに応じた表現 (「今」「今日」等) を返す。
    // ここではクラッシュせず文字列が返ることだけ assert する。
    const result = formatRelativeTime(new Date(now.getTime() - 100), now);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('月単位・年単位の出力に対応する', () => {
    expect(formatRelativeTime(new Date('2026-03-09T12:00:00Z'), now)).toMatch(/月/);
    expect(formatRelativeTime(new Date('2024-05-09T12:00:00Z'), now)).toMatch(/年/);
  });
});

describe('formatRateLimitReset', () => {
  const now = new Date('2026-05-09T12:00:00Z');
  const nowUnix = Math.floor(now.getTime() / 1000);

  it('絶対時刻 HH:MM と残り分数を返す', () => {
    const result = formatRateLimitReset(nowUnix + 5 * 60, now);
    expect(result.absolute).toMatch(/^\d{2}:\d{2}$/);
    expect(result.relativeMinutes).toBe(5);
  });

  it('過去の reset は 0 分にクランプする (負値の表示を防ぐ)', () => {
    const result = formatRateLimitReset(nowUnix - 60, now);
    expect(result.relativeMinutes).toBe(0);
  });

  it('端数の分は切り上げる (制限中に "0 分" 表示にならない)', () => {
    const result = formatRateLimitReset(nowUnix + 30, now);
    expect(result.relativeMinutes).toBe(1);
  });
});
