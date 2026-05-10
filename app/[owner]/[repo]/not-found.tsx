import { RepoIcon } from '@primer/octicons-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950">
      <span aria-hidden="true" className="text-zinc-400">
        <RepoIcon size={32} />
      </span>
      <h1 className="mt-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        リポジトリが見つかりません
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        指定されたリポジトリは存在しないか、非公開・削除済みの可能性があります。
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        検索ページへ戻る
      </Link>
    </div>
  );
}
