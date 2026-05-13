// GitHub REST API レスポンスの手書き型定義。アプリが実際に参照するフィールドだけ
// 列挙する。API は他にも多数のフィールドを返すが、全部取り込むと保守コストだけが
// 増えて得るものが無いため最小限に絞っている。

export type Repository = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  // GitHub API の歴史的な仕様: `watchers_count` は旧 API 時代の別名で、
  // 現在は `stargazers_count` と同じ値が返る。「本当の Watcher 数」
  // (通知購読者数) は詳細エンドポイントで返る `subscribers_count` のみ。
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  updated_at: string;
};

export type SearchRepositoriesResponse = {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
};

// `/repos/{owner}/{repo}` でのみ取得できる追加フィールド。
// `subscribers_count` を詳細ページで「Watcher 数」として表示している。
export type RepositoryDetail = Repository & {
  subscribers_count: number;
};
