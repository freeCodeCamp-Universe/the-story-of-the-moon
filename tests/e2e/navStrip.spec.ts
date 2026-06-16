import { test, expect } from '@playwright/test';
import { BP_DESKTOP } from '../../src/utils/breakpoints';

test('should hide keyboard-shortcut controls below 900px', async ({ page }) => {
  await page.setViewportSize({ width: BP_DESKTOP - 1, height: 800 });
  await page.goto('/');

  await expect(page.getByRole('button', { name: /show keyboard shortcuts/i })).toBeHidden();

  await page.getByRole('button', { name: /open settings/i }).click();
  await expect(page.getByRole('dialog', { name: /settings/i })).toBeVisible();

  await expect(page.getByRole('switch', { name: /enable global keyboard shortcuts/i })).toBeHidden();
  await expect(page.getByRole('switch', { name: /enable animations/i })).toBeVisible();
});

test('should show keyboard-shortcut controls at 900px and up', async ({ page }) => {
  await page.setViewportSize({ width: BP_DESKTOP, height: 900 });
  await page.goto('/');

  await expect(page.getByRole('button', { name: /show keyboard shortcuts/i })).toBeVisible();

  await page.getByRole('button', { name: /open settings/i }).click();

  await expect(page.getByRole('switch', { name: /enable global keyboard shortcuts/i })).toBeVisible();
  await expect(page.getByRole('switch', { name: /enable animations/i })).toBeVisible();
});
