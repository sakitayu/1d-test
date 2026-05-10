'use client';

// Generic last-resort error boundary. Custom-typed errors with their own
// props (RateLimitError / NotFoundError) are caught earlier — this file
// must never `instanceof`-check, because errors from Server Components
// are serialized across the boundary and lose their prototype + extra props.

import { AlertIcon } from '@primer/octicons-react';
import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('App boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-red-300 bg-red-50 px-6 py-16 text-center dark:border-red-900 dark:bg-red-950">
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
        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
      >
        再試行
      </button>
    </div>
  );
}
