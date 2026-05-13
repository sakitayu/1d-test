'use client';

// 汎用のラストリゾート用エラーバウンダリ。独自プロパティを持つ Error
// (RateLimitError / NotFoundError) は page.tsx 側で先に catch しているため、
// ここでは `instanceof` 判定を絶対に行わない。Server Component で発生した
// Error は Client Component 境界でシリアライズされ、prototype と独自プロパティが
// 失われるため、判別ロジックをこのファイルに置くと壊れる。

import { AlertIcon } from '@primer/octicons-react';
import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // 最終フォールバック時のデバッグ用にエラーをコンソールへ出力
    console.error('App boundary caught:', error);
  }, [error]);

  return (
    // role="alert" でエラー発生をスクリーンリーダーに即座に通知する。
    // error.tsx は Suspense / Error boundary の fallback として現れる
    // (通常の route 遷移と異なり announce 経路が無いことがある) ため、
    // 明示的に alert region として扱う。
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-red-300 bg-red-50 px-6 py-16 text-center dark:border-red-900 dark:bg-red-950"
    >
      <span aria-hidden="true" className="text-red-600 dark:text-red-400">
        <AlertIcon size={32} />
      </span>
      <h1 className="mt-3 text-xl font-semibold text-red-900 dark:text-red-100">
        問題が発生しました
      </h1>
      <p className="mt-1 text-sm text-red-800 dark:text-red-200">
        ページを再読み込みしても解決しない場合、しばらく時間をおいて再度お試しください。
      </p>
      {error.digest ? (
        <p className="mt-2 font-mono text-xs text-red-700 dark:text-red-300">
          (id: {error.digest})
        </p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
      >
        再試行
      </button>
    </div>
  );
}
