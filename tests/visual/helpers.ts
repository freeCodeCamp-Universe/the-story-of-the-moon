import { expect, type Page } from '@playwright/test';

export type Viewport = { label: string; width: number; height: number };

// Widths from src/utils/breakpoints.ts (320 baseline / 768 / 900 / 1800).
export const VIEWPORTS: Viewport[] = [
  { label: '320', width: 320, height: 800 },
  { label: '768', width: 768, height: 1024 },
  { label: '900', width: 900, height: 900 },
  { label: '1800', width: 1800, height: 1000 },
];

export async function gotoStable(page: Page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

export function maskCanvas(page: Page) {
  return [page.locator('canvas')];
}

export async function captureViewport(page: Page, name: string) {
  await expect(page).toHaveScreenshot(name, { mask: maskCanvas(page) });
}

export async function captureSection(page: Page, id: string, name: string) {
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  await expect(section).toHaveScreenshot(name, { mask: maskCanvas(page) });
}
