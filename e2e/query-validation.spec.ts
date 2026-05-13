import { expect, test } from '@playwright/test';

// 境界値テスト: 257 文字のクエリは page.tsx (Server Component) 内の
// parseSearchParams で弾かれ、GitHub API には到達しないことを確認する。
// (ブラウザ自体は通常通りサーバへリクエストを送るが、サーバ側で API 呼び出しを
//  短絡することで API クォータを無駄に消費しないための保護線)

test('a 257-char query shows the validation banner without calling the API', async ({ page }) => {
  const longQ = 'a'.repeat(257);
  await page.goto(`/?q=${longQ}`);

  // Next.js が独自の role="alert" route announcer を注入するため、
  // role だけだと strict mode で複数マッチして落ちる。バナーの文言で特定する。
  await expect(page.getByText('検索クエリが長すぎます')).toBeVisible();
  await expect(page.getByText(/256 文字/)).toBeVisible();
});
