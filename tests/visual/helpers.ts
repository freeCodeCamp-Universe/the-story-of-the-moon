import { expect, type Page } from '@playwright/test';

export type Viewport = { label: string; width: number; height: number };

// Widths from src/utils/breakpoints.ts (320 baseline / 768 / 900 / 1800).
export const VIEWPORTS: Viewport[] = [
  { label: '320', width: 320, height: 800 },
  { label: '768', width: 768, height: 1024 },
  { label: '900', width: 900, height: 900 },
  { label: '1800', width: 1800, height: 1000 },
];

// Drive the page into a static, fully-painted state before any capture.
// OptimizedImage marks images loading="lazy" + decoding="async", so photos
// paint in *after* a screenshot starts; document.fonts.ready does not wait for
// them, and setting loading="eager" alone does not fetch already-deferred
// off-screen images. Scroll the whole page once to trigger every lazy image,
// then wait for fonts and for all images to finish loading and decoding.
async function settlePage(page: Page) {
  await page.evaluate(async () => {
    for (const img of Array.from(document.images)) {
      img.loading = 'eager';
      img.decoding = 'sync';
    }
    const step = window.innerHeight;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    }
    window.scrollTo(0, 0);
  });

  await page.evaluate(() => document.fonts.ready);

  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true });
              img.addEventListener('error', () => resolve(), { once: true });
            })
      )
    );
    await Promise.allSettled(Array.from(document.images).map((img) => img.decode()));
  });
}

export async function gotoStable(page: Page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
  await settlePage(page);
}

// Mask all canvas/WebGL regions; their pixels are not deterministic.
export function maskCanvas(page: Page) {
  return [page.locator('canvas')];
}

export async function captureViewport(page: Page, name: string) {
  await expect(page).toHaveScreenshot(name, { mask: maskCanvas(page) });
}

export async function captureSection(page: Page, id: string, name: string) {
  const section = page.locator(`#${id}`);
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveScreenshot(name, { mask: maskCanvas(page) });
}

// For chapters whose section is extremely tall (e.g. Ch4's reduced-motion
// stacked layout is ~15k px), an element screenshot of the whole section is too
// large to capture reliably. Align the section top to the viewport and capture a
// bounded viewport screenshot of its opening instead.
export async function captureSectionTop(page: Page, id: string, name: string) {
  await page.locator(`#${id}`).evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(page).toHaveScreenshot(name, { mask: maskCanvas(page) });
}
