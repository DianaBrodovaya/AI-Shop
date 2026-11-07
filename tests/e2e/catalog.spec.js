import { test, expect } from '@playwright/test';

test.describe('Каталог', () => {
  test('загружается и показывает карточки товаров', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /каталог/i })).toBeVisible();

    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('фильтр по категории показывает только товары этой категории', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(/одежда/i).check();

    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();
  });
});
