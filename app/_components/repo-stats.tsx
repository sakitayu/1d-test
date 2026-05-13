// 詳細ページの統計値ロー。4 つの数値は意図的に視覚的な重みと色を揃えている。
// 個別に強調を付けるとデータ側に存在しない情報階層を読み手に錯覚させるため。

import { EyeIcon, IssueOpenedIcon, RepoForkedIcon, StarIcon } from '@primer/octicons-react';
import { formatNumber } from '@/lib/format';

type Props = {
  stargazers: number;
  watchers: number;
  forks: number;
  openIssues: number;
};

export function RepoStats({ stargazers, watchers, forks, openIssues }: Props) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat label="Star" value={stargazers} icon={<StarIcon size={16} aria-hidden="true" />} />
      <Stat label="Watcher" value={watchers} icon={<EyeIcon size={16} aria-hidden="true" />} />
      <Stat label="Fork" value={forks} icon={<RepoForkedIcon size={16} aria-hidden="true" />} />
      <Stat
        label="Issue"
        value={openIssues}
        icon={<IssueOpenedIcon size={16} aria-hidden="true" />}
      />
    </dl>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <span className="text-zinc-500">{icon}</span>
        <span>{label}</span>
      </dt>
      <dd className="mt-1 text-xl font-semibold text-zinc-900 tabular-nums dark:text-zinc-100">
        {formatNumber(value)}
      </dd>
    </div>
  );
}
