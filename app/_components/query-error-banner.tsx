import { AlertIcon } from '@primer/octicons-react';
import { Q_MAX } from '@/lib/search-params';

export function QueryErrorBanner() {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
    >
      <span aria-hidden="true" className="mt-0.5 text-amber-600 dark:text-amber-400">
        <AlertIcon size={16} />
      </span>
      <div>
        <p className="text-sm font-semibold">検索クエリが長すぎます</p>
        <p className="mt-1 text-sm">
          GitHub の検索 API はクエリ長を {Q_MAX}{' '}
          文字までに制限しています。短いキーワードで再度お試しください。
        </p>
      </div>
    </div>
  );
}
