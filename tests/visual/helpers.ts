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
    // A lazy image that scrolled off-screen may never fetch even after we flip
    // it to eager, so its load/error events never fire. Bound each wait so one
    // stuck image can't hang the whole capture; in practice every image
    // resolves well under the cap, so this only guards the pathological case.
    const withTimeout = (p: Promise<unknown>, ms: number) => Promise.race([p, new Promise<void>((resolve) => setTimeout(resolve, ms))]);
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : withTimeout(
              new Promise<void>((resolve) => {
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
              }),
              10_000
            )
      )
    );
    // Decode only images whose bytes actually arrived. img.decode() on an
    // image that never fetched (e.g. a stacked, never-revealed Ch4 deck slot)
    // stays pending forever and would hang the settle.
    await Promise.allSettled(
      Array.from(document.images)
        .filter((img) => img.complete && img.naturalWidth > 0)
        .map((img) => img.decode())
    );
  });
}

// reducedMotion defaults to 'reduce' so scroll-driven scenes freeze into a
// deterministic frame. Pass { reducedMotion: false } for chapters whose
// reduced-motion branch is a different layout we don't want to baseline (Ch4).
export async function gotoStable(page: Page, path = '/', opts: { reducedMotion?: boolean } = {}) {
  const { reducedMotion = true } = opts;
  await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
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

// Render Ch4's animated pinned deck while keeping every WebGL scene frozen.
// Scenes use useReducedMotion (OS reduced-motion OR the app's localStorage
// animations preference), but Ch4 gates only on OS reduced-motion. So we leave
// OS motion ON (Ch4 animates) and disable the app preference (key
// 'story.animationsEnabled', see useAnimationsPreference.ts) so scenes paint a
// single resting frame, keeping the page as light as the reduced-motion tests.
export async function gotoChapter4Animated(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('story.animationsEnabled', 'false');
  });
  await gotoStable(page, '/', { reducedMotion: false });
}

// Ch4's animated layout (width >= 900, motion allowed) pins a single mission
// card in a sticky, viewport-bounded stage. Scrolling the timeline section to
// its start pins the stage, so a viewport screenshot captures the real
// pinned-deck experience instead of the stacked reduced-motion fallback. The
// deck cross-fades are CSS transitions, which Playwright's `animations:
// 'disabled'` snaps to their end state, so the active card is deterministic.
export async function captureChapter4Stage(page: Page, name: string) {
  const section = page.getByRole('region', { name: 'Apollo and Artemis missions' });
  await section.scrollIntoViewIfNeeded();
  await section.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(page).toHaveScreenshot(name, { mask: maskCanvas(page) });
}
