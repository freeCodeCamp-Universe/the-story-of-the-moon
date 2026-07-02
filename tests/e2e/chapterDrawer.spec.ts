import { test, expect, type Page } from '@playwright/test';

// Desktop tier so Chapter 4 renders the pinned timeline with its progress rail.
test.use({ viewport: { width: 1280, height: 900 } });

function openDrawer(page: Page) {
  return page.getByRole('button', { name: /open chapter list/i }).click();
}

// Drawer navigation scrolls smoothly, and chapter visuals mount as they near
// the viewport, so the target's final position is only known once scrolling has
// stopped. Wait for scrollY to hold steady before reading the drawer indicator,
// which otherwise would be read against a locked, mid-flight scroll position.
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
