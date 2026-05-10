import { describe, expect, it } from 'vitest';
import { formatNumber, formatRateLimitReset, formatRelativeTime } from './format';

describe('formatNumber', () => {
  it('inserts thousand separators', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(230_000)).toBe('230,000');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-05-09T12:00:00Z');

  it('returns "n 日前" for past days', () => {
    const target = new Date('2026-05-06T12:00:00Z');
    expect(formatRelativeTime(target, now)).toBe('3 日前');
  });

  it('returns "今" / "今日" for tiny offsets', () => {
    // `numeric: 'auto'` produces locale-friendly strings near zero
    // (e.g. "今", "今日"); we just assert it does not blow up.
    const result = formatRelativeTime(new Date(now.getTime() - 100), now);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles months and years', () => {
    expect(formatRelativeTime(new Date('2026-03-09T12:00:00Z'), now)).toMatch(/月/);
    expect(formatRelativeTime(new Date('2024-05-09T12:00:00Z'), now)).toMatch(/年/);
  });
});

describe('formatRateLimitReset', () => {
  const now = new Date('2026-05-09T12:00:00Z');
  const nowUnix = Math.floor(now.getTime() / 1000);

  it('reports absolute HH:MM and remaining minutes', () => {
    const result = formatRateLimitReset(nowUnix + 5 * 60, now);
    expect(result.absolute).toMatch(/^\d{2}:\d{2}$/);
    expect(result.relativeMinutes).toBe(5);
  });

  it('clamps past resets to 0 minutes (avoids "-3 分")', () => {
    const result = formatRateLimitReset(nowUnix - 60, now);
    expect(result.relativeMinutes).toBe(0);
  });

  it('rounds up partial minutes so users never see "0 分" while still rate-limited', () => {
    const result = formatRateLimitReset(nowUnix + 30, now);
    expect(result.relativeMinutes).toBe(1);
  });
});
