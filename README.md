# The Story of the Moon

An interactive app exploring the Moon's origin, phases, surface features, and human exploration.

_Inspired by NASA's Artemis II mission._

## Tech stack

- React + TypeScript
- Vite for bundling and dev server
- Vitest + Testing Library for tests

## Setup

**Prerequisites:** Node.js and pnpm

```bash
pnpm install
```

## Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Visual regression testing

```bash
# Run the Playwright visual tests (builds, then captures screenshots)
pnpm test:visual

# Regenerate baseline screenshots
pnpm test:visual:update
```

Visual tests live in `tests/visual/` and capture the home page plus all seven chapters across the `320`, `768`, `900`, and `1800` viewport widths. WebGL canvases are masked and scenes are frozen so screenshots stay deterministic.

Baselines are committed PNGs generated in the pinned Playwright Linux container, so they only match on Linux. `tests/visual/globalSetup.ts` intentionally throws if you run `pnpm test:visual` on macOS or Windows, since locally generated screenshots would never match the committed baselines.

To (re)generate baselines, trigger the **Visual Update** GitHub Actions workflow, either by dispatching it manually (`workflow_dispatch`) or by commenting `/update-snapshots` on a pull request (OWNER, MEMBER, or COLLABORATOR only). The workflow runs `pnpm test:visual:update` in the Linux container and commits the refreshed PNGs back to the branch. The **Visual Tests** workflow runs on every push to `main` and every pull request, uploading an HTML report artifact when screenshots differ.

## Images

```bash
# Optimize every managed raster image under public/
pnpm optimize:images

# Optimize only specific files or folders under public/
pnpm optimize:images -- public/moon/lunar-near-side.jpg public/moon/lunar-far-side.jpg
pnpm optimize:images -- public/moon
```

`pnpm optimize:images` re-encodes each managed `.jpg`, `.jpeg`, or `.png` source file in `public/`, then refreshes its AVIF output based on the rules in `scripts/optimize-images.mjs`.
