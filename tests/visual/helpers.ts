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
// OptimizedImage marks content images loading="lazy" + decoding="async", so they
// paint in *after* a screenshot starts and document.fonts.ready does not wait for
// them. A best-effort scroll plus a per-image timeout used to let a slow image
// (e.g. a 278 KB AVIF under parallel CI load) be captured half-loaded, collapsing
// its box and shifting the section height run-to-run. Instead we mount every
// viewport-gated scene, force every image eager, then *block* until all started
// images finish loading and the document height stops changing. There is no silent
// timeout escape hatch: a genuinely stuck image fails the wait loudly.
async function settlePage(page: Page) {
  // 1. Scroll the whole page so intersection-gated scenes mount and every lazy
  //    image is rendered, then flip all images eager so none stay deferred. Pause
  //    a couple frames per step so the mounts can fire before we scroll past.
  await page.evaluate(async () => {
    const waitFrames = (n: number) =>
      new Promise<void>((resolve) => {
        let remaining = n;
        const tick = () => (remaining-- <= 0 ? resolve() : requestAnimationFrame(tick));
        requestAnimationFrame(tick);
      });
    const step = Math.max(1, Math.floor(window.innerHeight * 0.8));
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await waitFrames(2);
    }
    window.scrollTo(0, 0);
    for (const img of Array.from(document.images)) {
      img.loading = 'eager';
      img.decoding = 'sync';
    }
    await waitFrames(2);
  });

  await page.evaluate(() => document.fonts.ready);

  // 2. Block until every image that began loading has finished. `complete` is
  //    true after both load and error, so a broken src cannot hang the wait;
  //    images that never select a source (currentSrc === '', e.g. a stacked,
  //    never-revealed Ch4 deck slot) are intentionally skipped.
  await page.waitForFunction(() => Array.from(document.images).every((img) => !img.currentSrc || img.complete), undefined, { timeout: 20_000 });

  // 3. Decode the images whose bytes arrived so the first painted frame is final.
  await page.evaluate(async () => {
    await Promise.allSettled(
      Array.from(document.images)
        .filter((img) => img.complete && img.naturalWidth > 0)
        .map((img) => img.decode())
    );
  });

  // 4. Hold until the document height is unchanged across several frames, so a
  //    late reflow (image box expanding, scene mount, font swap) cannot land
  //    after we return and be captured mid-shift.
  await page.waitForFunction(
    () => {
      const store = window as unknown as { __vrHeight?: number; __vrStable?: number };
      const height = document.documentElement.scrollHeight;
      if (store.__vrHeight === height) {
        store.__vrStable = (store.__vrStable ?? 0) + 1;
      } else {
        store.__vrHeight = height;
        store.__vrStable = 0;
      }
      return (store.__vrStable ?? 0) >= 3;
    },
    undefined,
    { polling: 'raf', timeout: 10_000 }
  );
}

// reducedMotion defaults to 'reduce' so scroll-driven scenes freeze into a
// deterministic frame. Pass { reducedMotion: false } for chapters whose
// reduced-motion branch is a different layout we don't want to baseline (Ch4).
export async function gotoStable(page: Page, path = '/', opts: { reducedMotion?: boolean } = {}) {
  const { reducedMotion = true } = opts;
  await page.emulateMedia({ reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
  await page.goto(path);
  // StoryPage is lazy-loaded behind a Suspense fallback (the LoadingState
  // spinner, see src/App.tsx), and page.goto resolves on `load` — before that
  // chunk renders. Without this wait, settlePage can measure and screenshot the
  // static spinner: it has no images and a stable height, so every settle check
  // passes trivially and the capture flakes against the real content. #main
  // exists only inside StoryPage (after Suspense resolves), so waiting for it
  // guarantees the story has mounted before we settle the page.
  await page.locator('#main').waitFor({ state: 'attached' });
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

// ScrollyChapter (Ch2, Ch3) pins its visual with position: sticky. A
// full-element screenshot of the tall section stitches that sticky visual at a
// nondeterministic vertical offset run-to-run, and because the visual is a
// masked canvas the misaligned mask becomes the entire diff (a flaky failure).
// Capture a bounded viewport with the stage scrolled to start instead, so the
// sticky visual is anchored at its `top` and no stitching happens, the same way
// captureChapter4Stage handles Ch4's pinned deck. The ScrollyChapter container
// is a role="group" whose accessible name comes from its aria-label or the
// heading it is labelled by.
export async function captureScrollyStage(page: Page, stageName: string, name: string) {
  const stage = page.getByRole('group', { name: stageName });
  await stage.scrollIntoViewIfNeeded();
  await stage.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await expect(page).toHaveScreenshot(name, { mask: maskCanvas(page) });
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
