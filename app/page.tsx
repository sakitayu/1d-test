import { formatNumber } from '@/lib/format';
import { RateLimitError, searchRepositories } from '@/lib/github';
import { parseSearchParams } from '@/lib/search-params';
import { EmptyState } from './_components/empty-state';
import { Pagination } from './_components/pagination';
import { QueryErrorBanner } from './_components/query-error-banner';
import { RateLimitBanner } from './_components/rate-limit-banner';
import { RepoCard } from './_components/repo-card';
import { SearchForm } from './_components/search-form';

type PageProps = {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
};

export default async function Page({ searchParams }: PageProps) {
  const parsed = parseSearchParams(await searchParams);

  if (parsed.kind === 'empty') {
    return (
      <Shell>
        <SearchForm />
        <Hint />
      </Shell>
    );
  }

  if (parsed.kind === 'invalid') {
    return (
      <Shell>
        <SearchForm initialQuery={parsed.q} />
        <QueryErrorBanner />
      </Shell>
    );
  }

  try {
    const { items, totalCount } = await searchRepositories(parsed.q, parsed.page);
    return (
      <Shell>
        <SearchForm initialQuery={parsed.q} />
        <ResultsHeader query={parsed.q} totalCount={totalCount} />
        {items.length === 0 ? (
          <EmptyState query={parsed.q} />
        ) : (
          <ul className="space-y-3">
            {items.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </ul>
        )}
        <Pagination q={parsed.q} currentPage={parsed.page} totalCount={totalCount} />
      </Shell>
    );
  } catch (e) {
    if (e instanceof RateLimitError) {
      return (
        <Shell>
          <SearchForm initialQuery={parsed.q} />
          <RateLimitBanner reset={e.reset} resource={e.resource} />
        </Shell>
      );
    }

    throw e;
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  // sr-only な <h1> を必ず出すことで、スクリーンリーダー利用者が
  // 「このページが何のページか」を最初に把握できる。RepoCard が <h2> を
  // 使っているため <h1> が無いと heading 階層が壊れる ("h1 が無いまま
  // h2 から始まる" は Lighthouse でも警告される代表的なアクセシビリティ違反)。
  return (
    <div className="flex flex-col gap-6">
      <h1 className="sr-only">GitHub リポジトリ検索</h1>
      {children}
    </div>
  );
}

function ResultsHeader({ query, totalCount }: { query: string; totalCount: number }) {
  // role="status" (= aria-live="polite" + aria-atomic) で結果件数の変化を
  // SR に通知。視覚ユーザーは見れば分かるが、SR ユーザーは検索結果が
  // 何件取れたか自動で announce されないと画面状態を把握しづらい。
  return (
    // biome-ignore lint/a11y/useSemanticElements: <output> の implicit role=status の announce 挙動は SR 実装間で不安定なため明示 role="status" を採用
    <p role="status" className="text-sm text-zinc-600 dark:text-zinc-400">
      <span className="font-medium text-zinc-900 dark:text-zinc-100">「{query}」</span> の検索結果:
      約 <span className="tabular-nums">{formatNumber(totalCount)}</span> 件
    </p>
  );
}

function Hint() {
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      キーワードを入力して GitHub の公開リポジトリを検索します。
    </p>
  );
}
