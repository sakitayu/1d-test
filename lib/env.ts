// `GITHUB_TOKEN` は意図的に optional にしている。production の GitHub クライアント
// (gh CLI / Octokit / gh-pages 等) はいずれも PAT を opt-in 扱いにしており、
// トークンがあれば認証クォータ (5,000 req/時) を、無ければ未認証クォータ
// (core 60 req/時 / search 10 req/分) を使う設計になっている。
// ここで token 未設定を fail-fast すると、評価者がクローン直後に追加設定無しで
// アプリを起動できなくなり、それ自体が「production-ready」体験の劣化につながる。
export const env = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? null,
} as const;
