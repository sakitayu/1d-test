import { QuestionIcon } from '@primer/octicons-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-card px-6 py-16 text-center dark:border-zinc-700">
      <span aria-hidden="true" className="text-zinc-400">
        <QuestionIcon size={32} />
      </span>
      <h1 className="mt-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        ページが見つかりません
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        URL が誤っているか、移動・削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-accent-bg px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bg focus-visible:ring-offset-2"
      >
        検索ページへ戻る
      </Link>
    </div>
  );
}
