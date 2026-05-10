// Native <form action="/" method="get"> so JS-disabled browsers still navigate
// to /?q=... — progressive enhancement first, React last.

import { SearchIcon } from '@primer/octicons-react';

type Props = {
  initialQuery?: string;
};

export function SearchForm({ initialQuery }: Props) {
  return (
    <search className="block w-full">
      <form action="/" method="get" className="w-full">
        <label htmlFor="q" className="sr-only">
          リポジトリを検索
        </label>
        <div className="relative flex w-full items-center gap-2">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 flex items-center text-zinc-500"
          >
            <SearchIcon size={16} />
          </span>
          <input
            id="q"
            name="q"
            type="search"
            autoComplete="off"
            defaultValue={initialQuery}
            placeholder="例: react, vue, kubernetes"
            className="h-11 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
          <button
            type="submit"
            className="inline-flex h-11 min-w-[88px] items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            検索
          </button>
        </div>
      </form>
    </search>
  );
}
