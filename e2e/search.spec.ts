import { expect, test } from '@playwright/test';

// 実 GitHub API を叩く。playwright.config.ts の webServer が
// `pnpm build && pnpm start` でアプリを起動する。.env.local に GITHUB_TOKEN を
// 設定していれば認証クォータが使われ、本テストの golden path を 1 周回す程度の
// API 消費なら問題なく収まる。

test('search → list → detail → back', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByLabel('リポジトリを検索')).toBeVisible();

  await page.getByLabel('リポジトリを検索').fill('react');
  await page.getByRole('button', { name: '検索' }).click();

  await expect(page).toHaveURL(/\?q=react/);

  // 検索結果の 1 件目のリンク
  const firstLink = page.getByRole('link').filter({ hasText: '/' }).first();
  await expect(firstLink).toBeVisible();
  await firstLink.click();

  // 詳細ページに 4 つの統計ラベルが表示されることを確認
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const label of ['Star', 'Watcher', 'Fork', 'Issue']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }

  await page.goBack();
  await expect(page).toHaveURL(/\?q=react/);
});
