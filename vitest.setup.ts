// Vitest では process.env.GITHUB_TOKEN がデフォルトでは set されない。
// (Vitest は内部で Vite を使う。Vite は `.env` / `.env.local` / `.env.[mode]` 等
// を **process.env に自動注入しない** 仕様で、VITE_ プレフィックス付きの変数のみ
// `import.meta.env` 経由で client コードに expose する。dotenv 等を別途読み込まない
// 限り .env.local の内容は process.env に乗らない)
//
// 参考 (Vite 公式 docs):
//   - https://vite.dev/config/#using-environment-variables-in-config
//     「variables defined in `.env`, `.env.local`, ... are **not** automatically
//     injected into `process.env`」と明記
//   - https://vite.dev/guide/env-and-mode (import.meta.env 経由の expose 仕様)
//
// テストでは GitHub API をモックしているためこのダミー値が実際にネットワークに
// 出ることはなく、`lib/github.ts` の「token があれば Authorization を付ける」
// 分岐をテストで通すためだけに値を入れる。
//
// `??=` を使うことで、CI / ローカルで実 token (例: GitHub Actions が自動発行する
// `secrets.GITHUB_TOKEN`) が渡されていればそちらが優先される。
process.env.GITHUB_TOKEN ??= 'test-dummy-not-used';

import '@testing-library/jest-dom/vitest';
