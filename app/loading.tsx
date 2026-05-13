import { SearchForm } from './_components/search-form';

// Server Component が GitHub API のレスポンスを待っている間に表示する
// スケルトン。ヘッダー (検索フォーム) は表示し続けることで、ページ枠の
// レイアウトが切り替わらず体感がスムーズになる。

const SKELETON_KEYS = ['s0', 's1', 's2', 's3', 's4'];

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <SearchForm />
      <div className="space-y-3">
        {SKELETON_KEYS.map((key) => (
          <SkeletonCard key={key} />
        ))}
      </div>
      <span className="sr-only">読み込み中</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
