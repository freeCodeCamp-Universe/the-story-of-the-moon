import { test } from '@playwright/test';
import { BP_DESKTOP } from '../../src/utils/breakpoints';
import { VIEWPORTS, gotoStable, gotoChapter4Animated, captureSection, captureSectionTop, captureScrollyStage, captureChapter4Stage } from './helpers';

const CHAPTER_IDS = ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5', 'chapter-6', 'chapter-7'];

// Ch2 and Ch3 render a ScrollyChapter, whose visual is pinned position: sticky
// at every breakpoint. A full-element screenshot of the section stitches the
// sticky visual at a nondeterministic offset, so capture the bounded stage
// instead, keyed by the ScrollyChapter group's accessible name.
const SCROLLY_STAGE_NAME: Record<string, string> = {
  'chapter-2': 'Surface features of the Moon',
  'chapter-3': 'The Earth-Moon system',
};

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
      } else if (SCROLLY_STAGE_NAME[id]) {
        await captureScrollyStage(page, SCROLLY_STAGE_NAME[id], name);
      } else {
        await captureSection(page, id, name);
      }
    });
  }
}
