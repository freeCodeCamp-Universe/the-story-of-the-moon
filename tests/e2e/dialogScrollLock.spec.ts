import { test, expect } from '@playwright/test';

const overflowY = () => getComputedStyle(document.documentElement).overflowY;

test('should lock and restore viewport scroll around an open dialog', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 700 });
  await page.goto('/');

  // Baseline: the viewport scrolls normally before the dialog opens.
  await expect.poll(() => page.evaluate(overflowY)).not.toBe('hidden');

  await page.getByRole('button', { name: /open settings/i }).click();
  await expect(page.getByRole('dialog', { name: /settings/i })).toBeVisible();

  // While open, the scroll container (html) is locked.
  await expect.poll(() => page.evaluate(overflowY)).toBe('hidden');

  // And wheel input does not move the page.
  const beforeScroll = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 600);
  expect(await page.evaluate(() => window.scrollY)).toBe(beforeScroll);

  await page.getByRole('button', { name: /close settings/i }).click();
  await expect(page.getByRole('dialog', { name: /settings/i })).toBeHidden();

  // After close, the lock is released.
  await expect.poll(() => page.evaluate(overflowY)).not.toBe('hidden');
});
