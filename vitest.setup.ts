// Vitest は `.env.local` を読まない (Next.js の env ローダは NODE_ENV=test 時に
// `.env.local` を意図的に除外する仕様)。テストでは GitHub API をモックしているため
// このダミー値が実際にネットワークに出ることはなく、`lib/github.ts` の
// 「token があれば Authorization を付ける」分岐をテストで通すためだけに値を入れる。
// `??=` を使うことで、CI / ローカルで実 token (例: `secrets.GITHUB_TOKEN`) が
// 渡されていればそちらが優先される。
process.env.GITHUB_TOKEN ??= 'test-dummy-not-used';

import '@testing-library/jest-dom/vitest';
