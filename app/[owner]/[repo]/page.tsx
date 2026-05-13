import { LinkExternalIcon, MarkGithubIcon } from '@primer/octicons-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BackLink } from '@/app/_components/back-link';
import { RateLimitBanner } from '@/app/_components/rate-limit-banner';
import { RepoStats } from '@/app/_components/repo-stats';
import { formatRelativeTime } from '@/lib/format';
import { getRepository, NotFoundError, RateLimitError } from '@/lib/github';

type RouteParams = { owner: string; repo: string };

type PageProps = {
  params: Promise<RouteParams>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} — GitHub Repository Search`,
  };
}

export default async function Page({ params }: PageProps) {
  const { owner, repo } = await params;

  try {
    const { data } = await getRepository(owner, repo);
    return (
      <article className="flex flex-col gap-6">
        <BackLink className="inline-flex items-center gap-1 self-start text-sm text-accent underline decoration-transparent transition-colors hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bg focus-visible:ring-offset-2">
          ← 検索結果に戻る
        </BackLink>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* biome-ignore lint/performance/noImgElement: avatar は 72px 固定の
              小画像で、next/image による最適化メリット (WebP 変換 / srcset) が
              数 KB に留まる一方、next.config.ts の remotePatterns 設定コストが
              乗るため、本アプリ規模では引き合わないと判断 */}
          <img
            src={data.owner.avatar_url}
            alt={data.owner.login}
            width={72}
            height={72}
            className="h-18 w-18 flex-shrink-0 rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
            style={{ width: 72, height: 72 }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{data.owner.login} /</p>
            <h1 className="break-words text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {data.name}
            </h1>
            {data.description ? (
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{data.description}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              {data.language ? (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full bg-accent-bg"
                  />
                  <span>{data.language}</span>
                </span>
              ) : null}
              <time dateTime={data.updated_at}>
                最終更新: {formatRelativeTime(new Date(data.updated_at))}
              </time>
            </div>
          </div>
        </header>

        <RepoStats
          stargazers={data.stargazers_count}
          watchers={data.subscribers_count}
          forks={data.forks_count}
          openIssues={data.open_issues_count}
        />

        <a
          href={data.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 w-fit items-center gap-2 rounded-md border border-zinc-300 bg-card px-4 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bg focus-visible:ring-offset-2 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          <MarkGithubIcon size={16} aria-hidden="true" />
          GitHub で開く
          <LinkExternalIcon size={14} aria-hidden="true" />
        </a>
      </article>
    );
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    if (e instanceof RateLimitError) {
      return <RateLimitBanner reset={e.reset} resource={e.resource} />;
    }
    throw e;
  }
}
