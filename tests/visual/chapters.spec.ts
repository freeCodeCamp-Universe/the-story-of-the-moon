import { test } from '@playwright/test';
import { VIEWPORTS, gotoStable, captureSection } from './helpers';

const CHAPTER_IDS = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5', 'chapter-6', 'chapter-7'];

for (const viewport of VIEWPORTS) {
  for (const id of CHAPTER_IDS) {
    test(`${id} @ ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoStable(page, '/');
      await captureSection(page, id, `${id}-${viewport.label}.png`);
    });
  }
}
