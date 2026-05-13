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

> PAT があれば認証クォータ（5,000 req/時 core / 30 req/分 search）が使える。無い場合は未認証クォータ（60 req/時 core / 10 req/分 search）。詳細は「設計思想 §2」参照。

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

## 設計思想

レビュアーが「なぜこの構成なのか」を 1 本の軸で読み解けるよう、以下 7 つを設計の柱に置いた。

### 1. URL を Single Source of Truth にする

検索クエリ・ページ番号・リポジトリ識別子を全て URL searchParams / dynamic segment に乗せる。Zustand / Jotai 等の状態ライブラリを入れない。これでブラウザ戻る／進む・URL シェア・ブックマーク・SEO が **追加実装ゼロ** で動く。

### 2. PAT は必須ではなくオプショナルにする（プロダクション GitHub クライアントの標準パターン）

「プロダクション想定」を 12-Factor 系の `fail-fast on missing env` で読むのは internal admin tool の文脈の話。public-facing GitHub クライアント（`gh` CLI / Octokit / gh-pages / github.com 自体）は **全て token を optional 扱い** にしており、未認証で graceful degrade する。本アプリも同じパターンを採用。レビュアーがクローン直後に `pnpm dev` で即起動できることが、production らしさの一部だと判断した。

副次効果として、未認証クォータ（60 req/時 core / 10 req/分 search）の方が認証クォータより厳しく、評価セッション中にレート制限到達 UI が実際に発火しやすい。設計の見えにくい価値（リセット時刻表示）が評価者に届きやすくなる。

### 3. JavaScript が無効でも壊れない

検索フォームをネイティブ HTML `<form action="/" method="get">` で書き、ページネーションを `<a href>` で書く。React 抜きでも検索結果まで辿れる。JavaScript は progressive enhancement のレイヤとして使い、機能の前提にしない。詳細ページの「戻る」リンクも、JS 有効時は `router.back()` で履歴を巻き戻して検索結果のスクロール位置まで復元、JS 無効時は `<a href="/">` で検索トップへフォールバックする。

### 4. 秘密情報はサーバ側に閉じる

GitHub PAT を Server Component の中だけで参照し、`NEXT_PUBLIC_` プレフィックスを絶対に使わない。ブラウザバンドルに token が混入する経路を構造的に断つ。

### 5. ライブラリ選定はドメインと規模で決める

shadcn/ui / MSW / dayjs / Zod のような業界標準ライブラリは「便利だから」では入れない。本アプリで必要な UI は input / button / card / link 程度で、shadcn が生成する `components/ui/` 配下の 10+ ファイルを抱える正当化が無い。一方アイコンには `@primer/octicons-react` を選んだ — 「再現対象が GitHub である以上、GitHub 公式の視覚言語を使うのが最も defensible」というドメイン特化の判断。汎用 lucide-react ではなく Primer。

### 6. フレームワーク制御フローと API クライアントを分離する

`lib/github.ts` は **Next.js の制御フロー（`notFound()` / `redirect()`）を呼ばない**。代わりに `NotFoundError` / `RateLimitError` / `GitHubApiError` というドメイン例外を throw する。Next.js への変換は route 境界（`app/page.tsx` / `app/[owner]/[repo]/page.tsx`）で行う。これにより API クライアント層は CLI / 別フレームワーク / テストで再利用でき、ユニットテストでも `notFound()` のモックが要らない（`vi.spyOn(globalThis, 'fetch')` だけで完結）。

さらに、判別が必要なエラー（`RateLimitError` の `reset` / `resource` を UI で使う）は **Server Component のシリアライズ境界を越えさせない**。`error.tsx` に到達する時点で独自 Error クラスの prototype が落ち、独自プロパティ（`reset` / `resource`）も消失するため、判別ロジックを `error.tsx` に置くと脆くなる。判別は **page.tsx 内で完結** させ、`error.tsx` は汎用フォールバック UI のみに徹する。

### 7. アクセシビリティを最初から織り込む

セマンティック HTML（`<button>` / `<a href>` / `<form>` / `<label>` / `<search>` / `<time>` を div で代替しない）、`focus-visible:ring-*` の明示、`<label>` と `<input>` の `htmlFor`/`id` 紐付け、装飾アイコンの `aria-hidden`、avatar の `alt={owner.login}`、skip-to-content リンク、ページネーションの `aria-disabled`、ローディングの `aria-busy` / `aria-live`。public-facing なアプリでは後付けより初期から織り込む方が結果的にコストが低い、という前提で実装した。

## 工夫点・拘ったポイント

- **`watchers_count` ではなく `subscribers_count` を「Watcher 数」として表示**: GitHub API の歴史的経緯により `watchers_count` は `stargazers_count` と同値を返す。詳細ページでは検索 API では取れない `subscribers_count`（通知購読者数）を取得し、これを「Watcher 数」として表示。一覧では Star との数値重複を避けるため Watcher / Fork / Issue を出さず、詳細ページに集約
- **2 つのレート制限カテゴリを意識した UI**: Search API（30 req/分） と Core REST API（5,000 req/時） は独立したレート枠で管理されるため、`X-RateLimit-Resource` ヘッダで判別して適切なラベルでバナー表示。リセット時刻を `HH:MM` + 「あと N 分」の両方で出して復旧見込みを伝える
- **検索クエリの 256 文字バリデーション**: GitHub API の制約を `parseSearchParams` 純粋関数に切り出し、不正入力時は API を呼ばずにバナーで即フィードバック
- **discriminated union による分岐網羅**: `parseSearchParams` の戻り値が `'empty' | 'valid' | 'invalid'` の union なので、page.tsx の switch が型レベルで網羅される
- **API クライアント層が Next.js に依存しない**: `lib/github.ts` は `notFound()` を呼ばずドメイン例外を throw する。Next.js 変換は route 境界に集約。`fetch` の `next: { revalidate }` キャッシュヒントだけ Next.js 拡張だが、非対応環境では無視されるオプションのため移植性は損なわれない
- **シリアライズ境界を越えさせない**: `RateLimitError` / `NotFoundError` は page.tsx 内で catch して inline 描画。`error.tsx` で `instanceof` 判別が効かない問題を構造的に回避
- **Server Component の制御フローを統合テストで検証**: `await Page({...})` を直接呼ぶ統合テストで `vi.mock('@/lib/github')` し、レート制限 / 404 / 空状態を Server Component の単位で再現可能に検証。E2E は real GitHub API への golden path のみに絞り、責務を分離
- **fixture を実 API レスポンスからサニタイズ生成**: `tests/fixtures/*.json` は実際に `curl` で取得した結果を `jq` で必要フィールドだけに絞った。手書きが原因の型ズレを構造的に回避
- **fail-fast on missing PAT を採用しなかった**: 「プロダクション想定」の解釈を public-facing GitHub クライアントの慣習に合わせて optional 化（詳細は §2）
- **アクセシビリティ**: skip link、`<search>` / `<time>` などのセマンティック要素、`focus-visible` ring、`aria-busy` / `aria-live`、ページネーションの `aria-disabled`、avatar の意味のある alt
- **GitHub Primer 準拠のセマンティックトークン**: 中立的な zinc スケールに `accent.fg` (`#0969da`) 1 色をアクセント採用。dark モードでは header < body < card の 3 段階サーフェス階層 (`#010409` / `#0d1117` / `#161b22`) を `prefers-color-scheme` で自動切替し、Tailwind v4 の `@theme inline` 経由で `bg-canvas` / `bg-overlay` / `bg-card` / `text-accent` 等のセマンティック utility に展開。各コンポーネントから `dark:` バリアントを大幅削減した
- **ファビコンもブランド一貫性を担保**: `app/icon.svg` を Primer の `mark-github` octicon (白) + アプリのアクセント色 `#0969da` の角丸背景で構成。Next.js App Router の `app/icon.svg` 規約で自動的に `<link rel="icon" type="image/svg+xml">` として配信され、タブ・ブックマーク・ホーム画面までブランドが揃う
- **ホバー時 transition を 200ms ease-out に統一**: Tailwind v4 デフォルト 150ms linear は機械的に感じられるため、`globals.css` の `--default-transition-duration` / `--default-transition-timing-function` を global default で上書きし、全 hover / focus interaction を Material・Primer の "standard" tier に揃えて「ふわっと」した質感を出した。`group-hover:` で子要素プロパティを変える箇所では、CSS の transition が親→子に継承されない仕様を踏まえて子側にも `transition` を付与し、親 (border / shadow) と子 (title 色) が同一リズムで動くよう整合させている
- **ロード中スケルトンの高さを実コンテンツと厳密一致**: `loading.tsx` のスケルトンに、検索結果ヘッダー (`「〜」の検索結果: 約 N 件`) と同じ高さ (`text-sm` = `h-5`) のプレースホルダを `SearchForm` と `SkeletonCard` 群の間に挟むことで、ロード→結果到着時に RepoCard が縦方向にジャンプしない。Cumulative Layout Shift (CLS) を実質ゼロに近づける配慮
- **詳細から戻る時にスクロール位置・クエリ・ページを完全復元**: 詳細ページの「← 検索結果に戻る」を `BackLink` (Client Component) として切り出し、3 段階で fallback。JS 無効時は `<a href="/">` で検索トップへ遷移、JS 有効時はブラウザ履歴がある場合 `router.back()` で実ナビゲーションを巻き戻し検索結果のスクロール位置までピクセル単位で復元、履歴が無い (深いリンク・新規タブ) 場合は href の `/` にフォールバック
- **ワイヤーフレームに無い項目は UX 観点で独立に正当化できる場合のみ追加**: 例: description は「同名リポジトリの判別に必須」、updated_at は「メンテ状態のシグナル」

## アーキテクチャ概要

```
[Browser]
    ├─ GET /?q=react&page=2
    ▼
[Next.js Server Component (app/page.tsx)]
    ├─ parseSearchParams()  ← 純粋関数で discriminated union 化
    ├─ 認証 token があれば付与、無ければ未認証で fetch
    ▼
[GitHub REST API: /search/repositories | /repos/{o}/{r}]
    ├─ 200 → Repository[] / RepositoryDetail
    ├─ 403 + ratelimit-remaining 0 → RateLimitError
    └─ 404 → NotFoundError
    ▼
[page.tsx で例外を判別 → 適切な inline UI を return]
    ├─ RateLimitError → <RateLimitBanner reset resource />
    ├─ NotFoundError  → notFound()
    └─ それ以外        → throw → app/error.tsx で汎用 UI
```

| URL | 役割 |
|---|---|
| `/` | 検索フォーム（クエリ無し） |
| `/?q=react` | 検索結果 1 ページ目 |
| `/?q=react&page=2` | 検索結果 2 ページ目（最大 page=34、上限 1,000 件） |
| `/[owner]/[repo]` | リポジトリ詳細ページ（例: `/facebook/react`） |

## テスト戦略

「カバレッジ数値を追う」のではなく「**ユーザー操作と外部 API 境界が壊れたら検知される**」を到達点にした。

### 階層

| 階層 | 対象 | ツール |
|---|---|---|
| ユニット | 純粋関数の境界値（`lib/format.ts` / `lib/search-params.ts`） | Vitest |
| クライアント | API レスポンス変換と例外 throw（`lib/github.ts`） | Vitest + `vi.spyOn(globalThis, 'fetch')` |
| コンポーネント | ユーザー視点の振る舞い（`app/_components/*`） | Vitest + RTL |
| Server Component 統合 | `await Page({...})` を直接呼ぶ制御フロー検証 | Vitest + RTL + `vi.mock('@/lib/github')` |
| E2E | real GitHub API への golden path（search / pagination / 256 文字バリデーション） | Playwright |

### モック方針

- 外部依存（GitHub API）のみモック。自分のコード（コンポーネント / フォーマッタ）はモックしない
- **`lib/github.ts` 自身のテスト**: `vi.spyOn(globalThis, 'fetch')`
- **Server Component / コンポーネント**: `vi.mock('@/lib/github')`
- **E2E**: モック層なし。real GitHub API を叩く（Playwright `page.route()` は Server Component の fetch を intercept できないため、レート制限 / 404 などのエッジケースは Server Component 統合テスト側でカバー）

### あえてテストしないもの

- Tailwind のクラス名そのもの（実装詳細）
- Next.js / React 自身の挙動（フレームワークの責務）
- スナップショット（差分ノイズが大きすぎてレビューコストに合わない）

## CI

`.github/workflows/ci.yml` で **lint + typecheck + test + build** を push と PR で実行。E2E は CI 必須から外している（real GitHub API を叩くため PAT 管理コストが乗り、ブラウザインストール 5 分が push 毎に積み上がる。Server Component 統合テストでカバレッジは担保済み）。

## Vercel へのデプロイ

1. このリポジトリを Vercel に Import
2. Environment Variables に `GITHUB_TOKEN`（任意 — レート制限を緩めたい場合のみ）
3. Deploy

## AI 利用レポート

本実装は Claude Code（Sonnet / Opus）を中心に進めた。

### 進め方

1. **設計フェーズ**: 課題ページの内容と要件を AI と読み合わせ、技術スタックを Q&A 形式で 1 つずつ詰める。AI の推薦に対しては「採用根拠を 1 行で説明できるか」を基準に、根拠が弱いものは撤回させた
2. **設計判断の記録**: `docs/design.md` に判断と理由を全て記録（リポジトリには含めず、ローカルのみで保管）
3. **実装フェーズ**: 別セッションの Claude Code に設計ドキュメントを渡して実装させ、レビューしながらコミット粒度を整えた
4. **判断の更新**: 実装中に「PAT を必須から optional に変える」設計判断のリビジョンが発生し、課題ページ原文の精読に基づいて根拠を整理した上で AI が提案・人間が承認する形で確定（本 README §2 で明示）
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
