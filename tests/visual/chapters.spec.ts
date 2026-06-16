import { test } from '@playwright/test';
import { VIEWPORTS, gotoStable, captureSection, captureSectionTop } from './helpers';

const CHAPTER_IDS = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5', 'chapter-6', 'chapter-7'];

// Ch4's reduced-motion layout stacks every mission full-size (~15k px tall), too
// large for a reliable full-section screenshot. Capture its opening viewport.
const TOP_ONLY = new Set(['chapter-4']);

for (const viewport of VIEWPORTS) {
  for (const id of CHAPTER_IDS) {
    test(`${id} @ ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoStable(page, '/');
      const name = `${id}-${viewport.label}.png`;
      if (TOP_ONLY.has(id)) {
        await captureSectionTop(page, id, name);
      } else {
        await captureSection(page, id, name);
      }
    });
  }
}
