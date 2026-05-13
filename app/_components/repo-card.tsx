import { StarIcon } from '@primer/octicons-react';
import Link from 'next/link';
import { formatNumber, formatRelativeTime } from '@/lib/format';
import type { Repository } from '@/lib/github-types';

type Props = {
  repo: Repository;
};

export function RepoCard({ repo }: Props) {
  const updated = new Date(repo.updated_at);
  return (
    <li className="list-none">
      <Link
        href={`/${repo.owner.login}/${repo.name}`}
        className="group block rounded-lg border border-zinc-200 bg-card p-5 shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bg focus-visible:ring-offset-2 dark:border-zinc-800 dark:hover:border-zinc-700"
      >
        <div className="flex items-start gap-4">
          {/* biome-ignore lint/performance/noImgElement: avatar は GitHub の
              CDN から配信されており、サイズも一定でないため next/image による
              最適化のメリットが薄く、remotePatterns の設定コストの方が上回る */}
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            width={48}
            height={48}
            loading="lazy"
            className="h-12 w-12 flex-shrink-0 rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-zinc-900 group-hover:text-accent dark:text-zinc-100">
              {repo.full_name}
            </h2>
            {repo.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {repo.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              {repo.language ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full bg-accent-bg"
                  />
                  <span>{repo.language}</span>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <span aria-hidden="true" className="inline-flex items-center text-zinc-500">
                  <StarIcon size={14} />
                </span>
                <span className="sr-only">Star</span>
                <span className="tabular-nums">{formatNumber(repo.stargazers_count)}</span>
              </span>
              <time dateTime={repo.updated_at}>{formatRelativeTime(updated)}に更新</time>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
