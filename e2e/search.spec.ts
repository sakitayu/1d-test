import { expect, test } from '@playwright/test';

// Hits the real GitHub API. The webServer in playwright.config.ts boots
// `pnpm build && pnpm start`; with GITHUB_TOKEN set in .env.local the
// authenticated quota is plenty for a single golden-path run.

test('search → list → detail → back', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByLabel('リポジトリを検索')).toBeVisible();

  await page.getByLabel('リポジトリを検索').fill('react');
  await page.getByRole('button', { name: '検索' }).click();

  await expect(page).toHaveURL(/\?q=react/);

  // First repo card link
  const firstLink = page.getByRole('link').filter({ hasText: '/' }).first();
  await expect(firstLink).toBeVisible();
  await firstLink.click();

  // Detail page renders the four stats labels
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  for (const label of ['Star', 'Watcher', 'Fork', 'Issue']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }

  await page.goBack();
  await expect(page).toHaveURL(/\?q=react/);
});
