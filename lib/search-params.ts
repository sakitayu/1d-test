// URL searchParams (string-or-string[]) を検証済み入力に変換する純粋関数。
// Next.js / React の import を含めないため、ユニットテストや他環境での再利用が容易。
//
// GitHub Search API の制約をここに集約:
// - クエリ文字列は最大 256 文字 (演算子・修飾子を除く)
// - 検索結果は document 上「最大 1,000 件」。実 API は per_page=30 の場合
//   page=34 まで応答を返し (位置 991-1020 を含む 30 件)、page=35 以降は
//   422 "Only the first 1000 search results are available" で拒否する

export const Q_MAX = 256;
export const PER_PAGE = 30;
export const PAGE_MAX = 34; // ceil(1000 / 30) = 34。page=35 で 422 になるため、UI 側はこの値で先回りクランプ

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
