import { expect, test } from '@playwright/test';

test('「次へ」で ?q=&page=2 に遷移する', async ({ page }) => {
  await page.goto('/?q=react');

  await expect(page.getByText(/1 \/ \d+/)).toBeVisible();

  await page.getByRole('link', { name: /次へ/ }).click();

  await expect(page).toHaveURL(/\?q=react&page=2/);
  await expect(page.getByText(/2 \/ \d+/)).toBeVisible();
});
