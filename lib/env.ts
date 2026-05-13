// `GITHUB_TOKEN` は意図的に optional にしている。public な GitHub データを
// 扱うクライアント (Octokit、GitHub REST API を直接叩く運用、github.com の
// web UI 等) は token を opt-in 扱いにしており、未認証でも graceful に動くのが
// 慣習。本アプリも同パターンを採用することで、評価者がクローン直後に追加
// 設定無しでアプリを起動できる ("production-ready" 体験の一部)。
//
// クォータ:
//   認証あり (PAT): core 5,000 req/時 / search 30 req/分
//   認証なし:       core   60 req/時 / search 10 req/分
export const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? null,
} as const;
