import { expect, test } from '@playwright/test';

// 実 GitHub API を叩く。playwright.config.ts の webServer が
// `pnpm build && pnpm start` でアプリを起動する。.env.local に GITHUB_TOKEN を
// 設定していれば認証クォータが使われ、本テストの golden path を 1 周回す程度の
// API 消費なら問題なく収まる。

test('検索 → 一覧 → 詳細 → 戻る', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByLabel('リポジトリを検索')).toBeVisible();

  await page.getByLabel('リポジトリを検索').fill('react');
  await page.getByRole('button', { name: '検索' }).click();

  await expect(page).toHaveURL(/\?q=react/);

  // 検索結果の 1 件目のリンク
  const firstLink = page.getByRole('link').filter({ hasText: '/' }).first();
  await expect(firstLink).toBeVisible();
  await firstLink.click();

  // home の <h1 class="sr-only"> も検出されてしまうため、URL 変化を明示的に
  // 待ってから詳細ページ側の assertion を始める (Next.js App Router の
  // client-side navigation との race を避ける)
  await page.waitForURL(/\/[^/?]+\/[^/?]+$/);

  // 詳細ページに 4 つの統計ラベルが表示されることを確認。
  // RepoCard には sr-only "Star" が含まれており (Watcher/Fork/Issue は
  // RepoCard には存在せず詳細ページに集約されている)、getByText('Star')
  // だと strict mode で衝突する。一貫した書き方として 4 ラベル全てを
  // RepoStats の <dt> 要素に絞ってマッチさせる
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const label of ['Star', 'Watcher', 'Fork', 'Issue']) {
    await expect(page.locator('dt').filter({ hasText: label })).toBeVisible();
  }

  await page.goBack();

  await expect(page).toHaveURL(/\?q=react/);
});
