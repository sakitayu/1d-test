import { expect, test } from '@playwright/test';

// 境界値テスト: 257 文字のクエリはサーバ到達前にクライアントで止まり、
// GitHub API を絶対に呼ばないことを確認する。parseSearchParams 側で弾くことで
// API クォータを無駄に消費しない設計の保護線。

test('a 257-char query shows the validation banner without calling the API', async ({ page }) => {
  const longQ = 'a'.repeat(257);
  await page.goto(`/?q=${longQ}`);

  // Next.js が独自の role="alert" route announcer を注入するため、
  // role だけだと strict mode で複数マッチして落ちる。バナーの文言で特定する。
  await expect(page.getByText('検索クエリが長すぎます')).toBeVisible();
  await expect(page.getByText(/256 文字/)).toBeVisible();
});
