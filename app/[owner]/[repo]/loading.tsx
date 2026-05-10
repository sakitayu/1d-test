// Detail-page skeleton. Matches the eventual layout so users perceive the
// transition as a fill-in rather than a layout shift.

export default function Loading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <div className="h-18 w-18 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-7 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_KEYS.map((k) => (
          <div key={k} className="h-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <span className="sr-only">読み込み中</span>
    </div>
  );
}

const STAT_KEYS = ['s0', 's1', 's2', 's3'];
