import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  // settlePage scrolls the whole page, mounting every Three.js scene; under
  // parallel load that can exceed the 30s default, so give each test headroom.
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  snapshotPathTemplate:
    '{testDir}/{testFilePath}-snapshots/{arg}-{projectName}-{platform}{ext}',
  expect: {
    timeout: 15000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 100,
      threshold: 0.2,
      stylePath: './tests/visual/screenshot.css',
    },
  },
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    {
      name: 'visual-setup',
      testDir: './tests/setup',
      testMatch: /linuxGuard\.setup\.ts/,
    },
    {
      name: 'chromium',
      testDir: './tests/visual',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['visual-setup'],
    },
    {
      name: 'e2e',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
