import { SearchIcon } from '@primer/octicons-react';

type Props = {
  query: string;
};

export function EmptyState({ query }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-card px-6 py-16 text-center dark:border-zinc-700">
      <span aria-hidden="true" className="text-zinc-400">
        <SearchIcon size={32} />
      </span>
      <p className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        該当するリポジトリが見つかりませんでした
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        「{query}」に一致する公開リポジトリは見つかりません。キーワードを変えて再度お試しください。
      </p>
    </div>
  );
}
