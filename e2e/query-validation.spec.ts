import { expect, test } from '@playwright/test';

// Boundary check: 257-char query must stop client-side and never
// hit the GitHub API. Catching this at parseSearchParams keeps us
// honest about API quota usage.

test('a 257-char query shows the validation banner without calling the API', async ({ page }) => {
  const longQ = 'a'.repeat(257);
  await page.goto(`/?q=${longQ}`);

  // Next.js injects its own role="alert" route announcer, so target the
  // banner by its specific copy instead of the role alone.
  await expect(page.getByText('検索クエリが長すぎます')).toBeVisible();
  await expect(page.getByText(/256 文字/)).toBeVisible();
});
