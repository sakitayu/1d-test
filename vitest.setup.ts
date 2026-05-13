// Vitest では process.env.GITHUB_TOKEN がデフォルトでは set されない。
// (Vitest は内部で Vite を使うが、Vite は .env を import.meta.env としてしか
// expose せず、VITE_ プレフィックス無しの変数を process.env に書き出さない仕様。
// dotenv 等を別途読み込まない限り .env.local の内容は process.env に乗らない)
//
// テストでは GitHub API をモックしているためこのダミー値が実際にネットワークに
// 出ることはなく、`lib/github.ts` の「token があれば Authorization を付ける」
// 分岐をテストで通すためだけに値を入れる。
//
// `??=` を使うことで、CI / ローカルで実 token (例: GitHub Actions が自動発行する
// `secrets.GITHUB_TOKEN`) が渡されていればそちらが優先される。
process.env.GITHUB_TOKEN ??= 'test-dummy-not-used';

import '@testing-library/jest-dom/vitest';
