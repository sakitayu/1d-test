# GitHub Repository Search

Next.js 16 (App Router) で実装した GitHub リポジトリ検索アプリ。キーワード検索で公開リポジトリを横断的に探し、詳細ページで Star / Watcher / Fork / Issue を確認できる。

## クイックスタート

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

`GITHUB_TOKEN` は **任意**。設定が無くても起動する（GitHub の未認証クォータで動作）。設定する場合のみ `.env.local` を作成して PAT を貼り付ける:

```bash
cp .env.example .env.local
# GITHUB_TOKEN=ghp_xxx を貼る
```

> PAT があれば認証クォータ（5,000 req/時 core / 30 req/分 search）が使える。無い場合は未認証クォータ（60 req/時 core / 10 req/分 search）。

## 動作確認用コマンド

| コマンド | 内容 | 環境変数 |
|---|---|---|
| `pnpm dev` | 開発サーバ | `GITHUB_TOKEN` 任意 |
| `pnpm build && pnpm start` | プロダクションビルド + 起動 | `GITHUB_TOKEN` 任意 |
| `pnpm lint` | Biome lint | – |
| `pnpm typecheck` | TypeScript 型チェック | – |
| `pnpm test` | Vitest（ユニット + コンポーネント + Server Component 統合） | – |
| `pnpm test:e2e` | Playwright E2E（real GitHub API） | `GITHUB_TOKEN` 任意 |

## 動作環境

- Node.js 22+
- pnpm 9+ （`packageManager` フィールドで固定）
- Next.js 16.2.6 / React 19 / TypeScript 5

## 工夫した点・拘ったポイント

本実装で最も拘ったのは、「**プロダクション想定**」をスローガンではなく具体的な設計判断の積み重ねとして実現することだった。PAT を必須にせず未認証クォータ（60 req/時 core、10 req/分 search）でも graceful に動かす — これは公開 GitHub データを扱うクライアント（Octokit、github.com 自体）が token を opt-in 扱いにしている慣習に倣ったもので、レビュアーがクローン直後に追加設定なしでアプリを起動できる「production らしさ」を技術的に裏付ける選択にしている。検索クエリ・ページ番号・リポジトリ識別子はすべて URL の searchParams / dynamic segment に乗せて Single Source of Truth とし、状態管理ライブラリを入れずにブラウザ戻る／進む・URL シェア・ブックマーク・SEO を追加実装ゼロで成立させた。検索フォームと「戻る」リンクはネイティブ HTML（`<form action="/" method="get">`, `<a href>`）で書いて JavaScript 無効でも検索結果まで辿れるようにし、JS は progressive enhancement のレイヤとして使う方針を徹底している。GitHub PAT は Server Component の中だけで参照し `NEXT_PUBLIC_` プレフィックスを絶対使わない、フッターは「Built with Next.js」のような技術スタック誇示を排除しデータ提供元の attribution のみにする、といった細部も含めて「production の常識を守る」ことを優先した。

設計上もっとも力を入れたのは、API クライアント層とフレームワーク制御フローの分離だ。`lib/github.ts` は Next.js の制御フロー（`notFound()` / `redirect()`）を一切呼ばず、代わりに `NotFoundError` / `RateLimitError` / `GitHubApiError` というドメイン例外を throw する。Next.js への変換は route 境界（`app/page.tsx` / `app/[owner]/[repo]/page.tsx`）で行うことで、API クライアント層は CLI / 別フレームワーク / テストから再利用可能になり、ユニットテストでも Next.js 内部関数のモックが要らず `vi.spyOn(globalThis, 'fetch')` だけで完結する。さらに `RateLimitError` の `reset` / `resource` のような独自プロパティを持つエラーは Server Component → Client Component のシリアライズ境界を越えると prototype と独自プロパティが消失し `instanceof` も効かなくなるため、判別が必要なエラーは page.tsx 内で catch して inline に UI を return する設計とし、`error.tsx` は汎用フォールバックに徹する責務分割にした。この境界設計のおかげで、Playwright が Server Component の fetch を intercept できないという制約のもとでも、レート制限・404・空状態の挙動を `await Page({...})` を直接呼ぶ Vitest 統合テストで網羅できている。

GitHub API の細部にも踏み込んでいる。`watchers_count` は歴史的経緯で `stargazers_count` と同値を返すため、詳細ページの「Watcher 数」には検索 API では取れない `subscribers_count`（通知購読者数）を採用した。レート制限は Search API（30 req/分）と Core REST API（5,000 req/時）が独立した枠で管理されるため `X-RateLimit-Resource` ヘッダで判別し、リセット時刻を `HH:MM` と「あと N 分」の両形式で UI に提示して復旧見込みを伝える。検索クエリの 256 文字制限は `parseSearchParams` 純粋関数で検証して discriminated union (`'empty' | 'valid' | 'invalid'`) を返すことで page.tsx の switch を型レベルで網羅させ、超過時は API を呼ばずに UI で即フィードバックする — 結果として API クォータを構造的に節約している。一覧の表示項目は「ワイヤーフレームの最小構成 + UX 観点で独立に正当化できる場合のみ追加」という discipline で組み、description は「同名リポジトリの判別に必須」、`updated_at` は「メンテ状態のシグナル」など、項目ごとに 1 行で採用根拠を答えられる状態に保っている。

UX とアクセシビリティは後付けではなく初期設計の一部として組み込んだ。Tailwind v4 のデフォルトより少し長い 200ms ease-out を全 hover / focus interaction に統一して機械的な切り替えを排し、`group-hover` で子要素を変える箇所では子側にも `transition` を付与して親子のリズムを揃え、ローディング中のスケルトンは実コンテンツと高さを揃えて Cumulative Layout Shift をゼロに近づけ、URL から `q` を取って input にクエリを保持することで遷移時の違和感を消した。`<input type="search">` のネイティブ × ボタンを Primer の x-icon でカスタム描画して dark モード可読性を確保し、入力中の出現は `:placeholder-shown` で `opacity` をフェードさせる。詳細から戻る際は `router.back()` でスクロール位置までピクセル単位で復元し、JS 無効時は `<a href="/">` でフォールバックする。色は GitHub Primer のセマンティックトークン（accent.fg `#0969da`、dark モードの header < body < card という 3 段階サーフェス階層）に揃え、ファビコンも Primer の `mark-github` を採用してタブ・ブックマークまでブランドが一貫するようにしている。アクセシビリティ面では、heading 階層を home の sr-only `<h1>` から RepoCard `<h2>` まで連続させる、検索結果件数と 0 件状態に `role="status"`、エラーバウンダリに `role="alert"`、外部リンクに「新しいタブで開く」の sr-only 補強テキスト、`focus-visible:ring-*` を全 interactive 要素で明示、装飾アイコンの `aria-hidden`、`<form>` / `<label>` / `<search>` / `<time>` を div で代替しないセマンティック HTML、といった粒度で配慮することで、後付けでは整いにくい一貫性を担保している。

ライブラリ選定は「ドメインと規模で決める」という軸で、shadcn/ui や MSW、dayjs、Zod のような業界標準ライブラリは「便利だから」で入れず、本アプリで必要な UI は input / button / card / link 程度であり shadcn が生成する `components/ui/` 配下の 10+ ファイルを抱える正当化が無いと判断した。一方アイコンには `@primer/octicons-react` を採用 — 「再現対象が GitHub である以上、GitHub 公式の視覚言語を使うのが最も defensible」というドメイン特化の選択である。汎用 lucide-react ではなく Primer を選んだ判断に、設計の一貫性が表れている。

## AI 利用レポート

本実装は Claude Code（Sonnet / Opus）を中心に進めた。

### 進め方

1. **設計フェーズ**: 課題ページの内容と要件を AI と読み合わせ、技術スタックを Q&A 形式で 1 つずつ詰める。AI の推薦に対しては「採用根拠を 1 行で説明できるか」を基準に、根拠が弱いものは撤回させた
2. **設計判断の記録**: 設計判断と理由を別ファイル（`docs/design.md`、`.gitignore` 対象でローカルのみ保管）に全て記録
3. **実装フェーズ**: 別セッションの Claude Code に設計ドキュメントを渡して実装させ、レビューしながらコミット粒度を整えた
4. **判断の更新**: 実装中に「PAT を必須から optional に変える」設計判断のリビジョンが発生し、課題ページ原文の精読に基づいて根拠を整理した上で AI が提案・人間が承認する形で確定
5. **README の最終文面**: 人間が確認

### AI に依存しなかったこと

- 技術選定の最終判断（複数の選択肢を AI に提示させ、人間が選定）
- 評価基準への適合判断（「プロダクション想定」を満たすかどうかは人間が最終判定）
- 設計判断のリビジョン承認（PAT 必須 → optional の切り替えは AI 提案を人間が承認）

### AI を使って効率化したこと

- 型定義 / テストハーネス / CI 設定 / コンポーネントスケルトンの初期生成
- 各ライブラリの比較表作成
- 設計ドキュメント / コミットメッセージ / 本 README のドラフト

### 採用しなかった AI 提案

- shadcn/ui 採用（本課題規模に対して過剰）
- MSW 導入（同上、`vi.spyOn(globalThis, 'fetch')` で十分）
- Sentry 等の外部監視（個人アプリ規模で過剰）
- AGENTS.md / CLAUDE.md のリポジトリ commit（評価者向けの AI 利用レポートにならないため `.gitignore` 対象）
