import { test } from '@playwright/test';
import { BP_DESKTOP } from '../../src/utils/breakpoints';
import { VIEWPORTS, gotoStable, gotoChapter4Animated, captureSection, captureSectionTop, captureChapter4Stage } from './helpers';

const CHAPTER_IDS = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5', 'chapter-6', 'chapter-7'];

for (const viewport of VIEWPORTS) {
  for (const id of CHAPTER_IDS) {
    test(`${id} @ ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const name = `${id}-${viewport.label}.png`;

      // Ch4 at desktop widths renders an animated pinned deck. Allow motion so
      // it shows the real layout, then capture the bounded sticky stage.
      if (id === 'chapter-4' && viewport.width >= BP_DESKTOP) {
        await gotoChapter4Animated(page);
        await captureChapter4Stage(page, name);
        return;
      }

      await gotoStable(page, '/');

      // Ch4 below 900px never animates (width gate); its stacked fallback is
      // ~15k px tall, so capture its opening viewport rather than the section.
      if (id === 'chapter-4') {
        await captureSectionTop(page, id, name);
      } else {
        await captureSection(page, id, name);
      }
    });
  }
}
