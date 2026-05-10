import { ClockIcon } from '@primer/octicons-react';
import { formatRateLimitReset } from '@/lib/format';
import type { RateLimitResource } from '@/lib/github';

type Props = {
  reset: number;
  resource: RateLimitResource;
};

const RESOURCE_LABEL: Record<string, string> = {
  search: '検索 API',
  core: 'GitHub REST API',
  code_search: 'コード検索 API',
  graphql: 'GraphQL API',
};

export function RateLimitBanner({ reset, resource }: Props) {
  const { absolute, relativeMinutes } = formatRateLimitReset(reset);
  const label = RESOURCE_LABEL[resource] ?? `GitHub API (${resource})`;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
    >
      <span aria-hidden="true" className="mt-0.5 text-amber-600 dark:text-amber-400">
        <ClockIcon size={16} />
      </span>
      <div>
        <p className="text-sm font-semibold">{label} のレート制限に達しました</p>
        <p className="mt-1 text-sm">
          <time dateTime={new Date(reset * 1000).toISOString()}>{absolute}</time> 頃に解除されます
          {relativeMinutes > 0 ? ` (残り約 ${relativeMinutes} 分)` : ' (まもなく解除)'}。
          少し時間をおいて再度お試しください。
        </p>
      </div>
    </div>
  );
}
