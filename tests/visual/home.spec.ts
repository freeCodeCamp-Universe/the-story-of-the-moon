import { test } from '@playwright/test';
import { VIEWPORTS, gotoStable, captureViewport } from './helpers';

for (const viewport of VIEWPORTS) {
  test(`home @ ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await gotoStable(page, '/');
    await captureViewport(page, `home-${viewport.label}.png`);
  });
}
