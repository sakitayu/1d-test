import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import Link from 'next/link';
import { PAGE_MAX, PER_PAGE } from '@/lib/search-params';

type Props = {
  q: string;
  currentPage: number;
  totalCount: number;
};

export function Pagination({ q, currentPage, totalCount }: Props) {
  // GitHub Search API は結果を最大 1,000 件に制限しているため、最終ページを 34 にクランプ
  const lastPage = Math.min(Math.ceil(totalCount / PER_PAGE), PAGE_MAX);
  if (lastPage <= 1) return null;

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < lastPage ? currentPage + 1 : null;

  return (
    <nav aria-label="ページネーション" className="flex items-center justify-between gap-3">
      <PageLink href={hrefFor(q, prevPage)} disabled={prevPage === null}>
        <ChevronLeftIcon size={14} aria-hidden="true" />
        前へ
      </PageLink>
      <p aria-live="polite" className="text-sm text-zinc-600 tabular-nums dark:text-zinc-400">
        {currentPage} / {lastPage}
      </p>
      <PageLink href={hrefFor(q, nextPage)} disabled={nextPage === null}>
        次へ
        <ChevronRightIcon size={14} aria-hidden="true" />
      </PageLink>
    </nav>
  );
}

function hrefFor(q: string, page: number | null): string | null {
  if (page === null) return null;
  const params = new URLSearchParams({ q });
  if (page !== 1) params.set('page', String(page));
  return `/?${params.toString()}`;
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string | null;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const className =
    'inline-flex h-11 min-w-[88px] items-center justify-center gap-1.5 rounded-md border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-bg focus-visible:ring-offset-2';
  if (disabled || !href) {
    return (
      <span
        aria-disabled="true"
        className={`${className} cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${className} border-zinc-300 bg-card text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900`}
    >
      {children}
    </Link>
  );
}
