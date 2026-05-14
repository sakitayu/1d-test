# GitHub Repository Search

Next.js 16 (App Router) で実装した GitHub リポジトリ検索アプリです。キーワード検索で公開リポジトリを横断的に探し、詳細ページで Star / Watcher / Fork / Issue を確認できます。

## クイックスタート

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

`GITHUB_TOKEN` は **任意** です。設定が無くても起動します（GitHub の未認証クォータで動作します）。設定する場合のみ `.env.local` を作成して PAT を貼り付けてください:

```bash
cp .env.example .env.local
# GITHUB_TOKEN=ghp_xxx を貼る
```

> PAT があれば認証クォータ（5,000 req/時 core / 30 req/分 search）が使えます。無い場合は未認証クォータ（60 req/時 core / 10 req/分 search）になります。

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

### URL を Single Source of Truth にする

本実装で最も大切にしたのは、検索クエリ・ページ番号・リポジトリ識別子といった「画面の状態」をすべて URL に乗せることでした。Zustand や Jotai のような状態管理ライブラリは導入せず、Next.js App Router の `searchParams` と dynamic segment だけで状態を表現しています。この一つの判断によって、ブラウザの戻る／進むボタン、URL の共有、ブックマーク、SEO といった Web の基本機能が **追加実装ゼロ** で自然に動くようになり、検索フォームをネイティブ HTML の `<form action="/" method="get">` で書くだけで JavaScript 無効環境でも検索結果まで辿れる構造になっています。状態をライブラリで包むほど Web プラットフォームから離れていくという感覚があり、その逆方向に意識的に舵を切ったのが本アプリの土台です。

### テストしやすさを意識したアーキテクチャ

設計面で最もこだわったのは、API クライアント層 (`lib/github.ts`) を Next.js の制御フローから切り離すことです。`notFound()` や `redirect()` といった Next.js 固有の関数は API クライアント側からは一切呼ばず、代わりに `NotFoundError` / `RateLimitError` / `GitHubApiError` というドメイン例外を throw する形にしました。Next.js への変換は route 境界 (`page.tsx`) でのみ行うため、API クライアント層は CLI や別フレームワーク、テストから再利用可能になり、ユニットテストでは `vi.spyOn(globalThis, 'fetch')` だけで完結します。Next.js 内部関数のモックが一切要らない設計です。さらに `RateLimitError` のような独自プロパティを持つエラーは Server Component → Client Component のシリアライズ境界で prototype が落ちてしまうため、判別ロジックを page.tsx 内で完結させ、`error.tsx` は汎用フォールバックに徹する責務分割にしています。Playwright の `page.route()` が Server Component の fetch を intercept できないという制約のもとでも、`await Page({...})` を直接呼ぶ Vitest 統合テストでレート制限・404・空状態を再現可能に検証できる — このテスト容易性こそが、この境界設計の最大の価値だと考えています。

### アクセシビリティを後付けではなく初期から織り込む

アクセシビリティは実装が出来上がった後に「対応する」ものではなく、最初から組み込んでおく方が結果的にコストが低いという前提で取り組みました。heading 階層を home の sr-only `<h1>` から RepoCard の `<h2>` まで連続させ、検索結果件数と 0 件状態には `role="status"`、エラーバウンダリには `role="alert"` を付与し、外部リンクには「新しいタブで開く」という sr-only 補強テキストを添えています。`focus-visible:ring-*` を全 interactive 要素で明示し、装飾アイコンには `aria-hidden`、`<form>` / `<label>` / `<search>` / `<time>` といったセマンティック要素を div で代替しないことを徹底しました。個別の配慮は小さくとも、「キーボードのみ・スクリーンリーダーのみといった限られた経路でもアプリが等しく操作できる」という一貫性は、後付けでは整いにくい性質のものだと考えています。

### interaction の細部に質感を持たせる

UX 面では「機械的な切り替えを排して、操作のリズムを統一する」ことに気を配りました。Tailwind v4 のデフォルト 150ms より少し長い 200ms ease-out を全 hover / focus interaction に統一し、`group-hover` で子要素を変える箇所では子側にも `transition` を付与して親子のリズムが同じになるようにしています。ローディング中のスケルトンは実コンテンツと高さを揃えて Cumulative Layout Shift をゼロに近づけ、URL から `q` を取って input にクエリを保持することで遷移時に入力欄が一瞬空になる違和感も消しました。検索 input のネイティブ × ボタンは WebKit のデフォルトだと dark モードで視認性が落ちるため、Primer の x-icon を mask-image でカスタム描画し、`:placeholder-shown` を使った opacity フェードまで含めて他の interaction と同じリズムで動くようにしています。一つひとつは小さい配慮ですが、「気を配って作った」という体感はこういう積み重ねから生まれると考えています。

### ライブラリ選定はドメインと規模で決める

依存ライブラリは「便利だから」では追加しないという軸を貫きました。shadcn/ui や MSW、dayjs、Zod のような業界標準ライブラリも、本アプリの規模（必要な UI が input / button / card / link 程度）に対しては過剰だと判断し、いずれも採用していません。一方でアイコンには `@primer/octicons-react` をあえて採用しています — 汎用の lucide-react ではなく Primer を選んだ理由は、「再現対象が GitHub である以上、GitHub 公式の視覚言語を使うのが最も defensible」というドメイン特化の判断です。便利さで選ぶのではなく、対象ドメインと自分のアプリの規模に対して最も適切な選択かどうかを毎回問うようにしました。

## AI 利用レポート

本実装は Claude Code（Sonnet / Opus）を中心に進めました。

### 進め方

1. **設計フェーズ**: 課題ページの内容と要件を AI と読み合わせ、技術スタックを Q&A 形式で 1 つずつ詰めました。AI の推薦に対しては「採用根拠を 1 行で説明できるか」を基準にして、根拠が弱いものは撤回させています
2. **設計判断の記録**: 設計判断と理由を別ファイル（`docs/design.md`、`.gitignore` 対象でローカルのみ保管）にすべて記録しています
3. **実装フェーズ**: 別セッションの Claude Code に設計ドキュメントを渡して実装させ、レビューしながらコミット粒度を整えました
4. **判断の更新**: 実装中に「PAT を必須から optional に変える」設計判断のリビジョンが発生し、課題ページ原文の精読に基づいて根拠を整理したうえで、AI が提案・人間が承認する形で確定しています
5. **README の最終文面**: 人間が確認しています

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
