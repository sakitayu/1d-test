// Pure transformation: URL searchParams (string-or-string[]) → validated input.
// No Next.js / React imports so this is trivially unit-testable and reusable.
//
// GitHub Search API constraints baked in:
// - Query string max length is 256 characters (excluding operators/qualifiers)
// - Search returns at most 1,000 results (30 per page × 34 pages)

export const Q_MAX = 256;
export const PER_PAGE = 30;
export const PAGE_MAX = 34; // ceil(1000 / 30) = 34, then API rejects beyond.

export type ParsedSearchParams =
  | { kind: 'empty'; page: number }
  | { kind: 'valid'; q: string; page: number }
  | { kind: 'invalid'; q: string; page: number; error: 'too_long' };

export function parseSearchParams(input: {
  q?: string | string[];
  page?: string | string[];
}): ParsedSearchParams {
  const rawQ = pickFirst(input.q);
  const q = rawQ.trim();
  const page = clampPage(pickFirst(input.page));

  if (q === '') return { kind: 'empty', page };
  if (q.length > Q_MAX) return { kind: 'invalid', q, page, error: 'too_long' };
  return { kind: 'valid', q, page };
}

function pickFirst(value: string | string[] | undefined): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return '';
}

function clampPage(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, PAGE_MAX);
}
