import { SearchIcon } from '@primer/octicons-react';

type Props = {
  query: string;
};

export function EmptyState({ query }: Props) {
  // role="status" で 0 件結果を SR ユーザーに自動 announce する。
  // エラーではない (正常な検索結果の 1 形態) ので role="alert" は使わず、
  // polite な status region として扱う。
  return (
    // biome-ignore lint/a11y/useSemanticElements: <output> の SR 互換性が不安定なため明示 role="status" を採用 (詳細は app/page.tsx の同条件)
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-card px-6 py-16 text-center dark:border-zinc-700"
    >
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
