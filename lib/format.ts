// Intl-based formatters. Avoid date-fns / dayjs / numeral — `Intl` is built-in
// and covers every case the app needs.

const numberFormatter = new Intl.NumberFormat('en-US');
const relativeFormatter = new Intl.RelativeTimeFormat('ja', { numeric: 'auto' });
const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatNumber(n: number): string {
  return numberFormatter.format(n);
}

const RELATIVE_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
];

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  for (const { unit, ms } of RELATIVE_UNITS) {
    if (absMs >= ms || unit === 'second') {
      const value = Math.round(diffMs / ms);
      return relativeFormatter.format(value, unit);
    }
  }
  return relativeFormatter.format(0, 'second');
}

export type RateLimitResetFormatted = {
  absolute: string;
  relativeMinutes: number;
};

export function formatRateLimitReset(
  resetUnix: number,
  now: Date = new Date(),
): RateLimitResetFormatted {
  const reset = new Date(resetUnix * 1000);
  const diffMs = reset.getTime() - now.getTime();
  // Clamp to 0 so a stale reset timestamp doesn't surface as "あと -3 分".
  const relativeMinutes = Math.max(0, Math.ceil(diffMs / 60_000));
  return {
    absolute: timeFormatter.format(reset),
    relativeMinutes,
  };
}
