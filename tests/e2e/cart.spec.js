import { test, expect } from '@playwright/test';

test.describe('Корзина', () => {
  test('добавление товара и переход на страницу корзины', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.getByRole('article').first();
    await firstCard.getByRole('button', { name: /в корзину/i }).click();

    await page.getByRole('link', { name: /корзина/i }).click();

    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByRole('heading', { name: /корзина/i })).toBeVisible();
  });
});
