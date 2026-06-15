export default function globalSetup() {
  if (process.platform !== 'linux') {
    throw new Error(
      [
        'Visual regression tests run in CI inside the pinned Playwright Linux',
        'container, so baselines stay consistent. They are not meant to run on',
        `this host (detected platform: ${process.platform}).`,
        '',
        'To (re)generate baselines, trigger the "Visual Update" GitHub Actions',
        'workflow (workflow_dispatch or a `/update-snapshots` PR comment).',
      ].join('\n')
    );
  }
}
