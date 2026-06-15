import { test } from '@playwright/test';
import { VIEWPORTS, gotoStable, captureSection, captureSectionStage } from './helpers';

const CHAPTER_IDS = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5', 'chapter-6', 'chapter-7'];

// Ch4 is a bespoke scroll-driven chapter: capturing the whole tall section
// churns its sticky stage. Capture the stage in its initial state instead.
const STAGE_ONLY: Record<string, string> = {
  'chapter-4': '[data-visual-stage]',
};

for (const viewport of VIEWPORTS) {
  for (const id of CHAPTER_IDS) {
    test(`${id} @ ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoStable(page, '/');
      const name = `${id}-${viewport.label}.png`;
      const stageSelector = STAGE_ONLY[id];
      if (stageSelector) {
        await captureSectionStage(page, id, stageSelector, name);
      } else {
        await captureSection(page, id, name);
      }
    });
  }
}
