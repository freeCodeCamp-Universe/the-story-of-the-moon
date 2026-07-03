import { test, expect, type Page } from '@playwright/test';

// Desktop tier so Chapter 4 renders the pinned timeline with its progress rail.
test.use({ viewport: { width: 1280, height: 900 } });

// The app's scrolls honor reduced motion, so forcing it here makes drawer
// navigation land instantly (plus a short bounded settle window) instead of
// animating across the page. That removes the main timing flake vector:
// polling a long smooth scroll for stability. The claiming, landing, and
// indicator logic under test is identical in both modes; the animated path
// keeps one smoke test in its own describe below.
test.use({ reducedMotion: 'reduce' });

function openDrawer(page: Page) {
  return page.getByRole('button', { name: /open chapter list/i }).click();
}

// Even with instant scrolls, the settle watcher may re-snap the landing for a
// few hundred milliseconds while late-mounting visuals shift layout. Wait for
// scrollY to hold steady before reading the drawer indicator.
async function settleScroll(page: Page) {
  let prev = Number.NaN;
  let stableReads = 0;
  await expect
    .poll(
      async () => {
        const y = await page.evaluate(() => window.scrollY);
        if (y === prev) stableReads += 1;
        else {
          stableReads = 0;
          prev = y;
        }
        return stableReads;
      },
      { timeout: 10000, intervals: [120] }
    )
    .toBeGreaterThanOrEqual(3);
}

test('should scroll a plain section into view when its drawer item is selected', async ({
  page,
}) => {
  await page.goto('/');

  await openDrawer(page);
  await page.getByRole('button', { name: 'Crater' }).click();

  await expect(page.locator('#ch2-crater-heading')).toBeInViewport();
});

test('should land on the selected subsection in a scrollytelling chapter', async ({
  page,
}) => {
  await page.goto('/');

  await openDrawer(page);
  await page.getByRole('button', { name: 'Solar eclipse' }).click();

  await expect(page.locator('#ch3-blocked-heading')).toBeInViewport();
});

test('should navigate to the start of the timeline, not a later item', async ({
  page,
}) => {
  await page.goto('/');

  await openDrawer(page);
  await page.getByRole('button', { name: 'NASA missions' }).click();

  const ticks = page
    .getByRole('list', { name: 'Timeline progress' })
    .getByRole('button');
  await expect(ticks.first()).toHaveAttribute('aria-current', 'true');
  await expect(ticks.nth(1)).not.toHaveAttribute('aria-current', 'true');
});

test('should reflect a plain selected section in the drawer', async ({
  page,
}) => {
  await page.goto('/');

  await openDrawer(page);
  await page.getByRole('button', { name: 'Basin' }).click();
  await settleScroll(page);

  await openDrawer(page);
  await expect(page.getByRole('button', { name: 'Basin' })).toHaveAttribute(
    'aria-current',
    'true'
  );
});

test('should highlight the chapter row, not its first subsection, at the top of a chapter', async ({
  page,
}) => {
  await page.goto('/');

  // The drawer trigger's label also contains the chapter title, so scope
  // queries to the drawer itself.
  const drawer = page.locator('#chapter-drawer');

  await openDrawer(page);
  await drawer
    .getByRole('button', { name: '2. A face written by impacts' })
    .click();
  await settleScroll(page);

  await openDrawer(page);
  await expect(
    drawer.getByRole('button', { name: '2. A face written by impacts' })
  ).toHaveAttribute('aria-current', 'true');
  await expect(
    drawer.getByRole('button', { name: 'Crater' })
  ).not.toHaveAttribute('aria-current', 'true');
});

test('should reflect the selected section in the drawer', async ({ page }) => {
  await page.goto('/');

  await openDrawer(page);
  await page.getByRole('button', { name: 'NASA missions' }).click();
  await settleScroll(page);

  await openDrawer(page);
  await expect(
    page.getByRole('button', { name: 'NASA missions' })
  ).toHaveAttribute('aria-current', 'true');

  // Moving to a later chapter's section updates the indicator and releases the
  // previous one, rather than leaving it stuck on the timeline.
  await page.getByRole('button', { name: 'What came back' }).click();
  await settleScroll(page);

  await openDrawer(page);
  await expect(
    page.getByRole('button', { name: 'What came back' })
  ).toHaveAttribute('aria-current', 'true');
  await expect(
    page.getByRole('button', { name: 'NASA missions' })
  ).not.toHaveAttribute('aria-current', 'true');
});

// Regression: after visiting a scrolly chapter, navigating to a later
// chapter's section used to land the heading short of its rest position —
// visuals mounting under the scroll shifted layout after the one-shot
// correction had already run. The settle watcher now re-snaps until the
// layout stops moving, so the heading must end at the scroll-padding offset.
test('should land a later section at its rest position after visiting a scrolly chapter', async ({
  page,
}) => {
  await page.goto('/');

  await openDrawer(page);
  await page.getByRole('button', { name: 'NASA missions' }).click();
  await settleScroll(page);

  await openDrawer(page);
  await page.getByRole('button', { name: 'Water on the Moon' }).click();
  await settleScroll(page);

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const navOffset =
            parseFloat(
              getComputedStyle(document.documentElement).scrollPaddingTop
            ) || 0;
          const heading = document.getElementById('ch6-water-heading');
          if (!heading) return Number.POSITIVE_INFINITY;
          return Math.abs(heading.getBoundingClientRect().top - navOffset);
        }),
      { timeout: 5000 }
    )
    .toBeLessThanOrEqual(2);
});

// One animated-path smoke test: with real smooth scrolling, the landing may
// take seconds, so assert only through the auto-retrying toBeInViewport.
test.describe('with animated scrolling', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('should scroll a section into view under a smooth flight', async ({
    page,
  }) => {
    await page.goto('/');

    await openDrawer(page);
    await page.getByRole('button', { name: 'Water on the Moon' }).click();

    await expect(page.locator('#ch6-water-heading')).toBeInViewport();
  });
});
