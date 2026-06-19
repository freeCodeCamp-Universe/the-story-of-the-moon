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

Baselines are committed PNGs generated in the pinned Playwright Linux container, so they only match on Linux. Running `pnpm test:visual` on macOS or Windows intentionally fails, since locally generated screenshots would never match the committed baselines.

To regenerate baselines, dispatch the **Visual Update** GitHub Actions workflow on the branch that holds the change; it commits refreshed PNGs back to that branch. Run it once you have intentionally changed layout and Visual Tests is failing on diffs you have reviewed.

## End-to-end behavior testing

```bash
# Run the Playwright behavior tests (builds, then asserts DOM behavior)
pnpm test:e2e
```

These tests live in `tests/e2e/` and assert DOM behavior (roles, visibility) rather than pixels, so there are no baselines and they run on any host. Use them for behavior the jsdom-based unit tests can't observe, such as responsive show/hide driven by CSS media queries. CI runs them on every push and pull request.

## Images

```bash
# Optimize every managed raster image under public/
pnpm optimize:images

# Optimize only specific files or folders under public/
pnpm optimize:images -- public/moon/lunar-near-side.jpg public/moon/lunar-far-side.jpg
pnpm optimize:images -- public/moon
```

`pnpm optimize:images` re-encodes each managed `.jpg`, `.jpeg`, or `.png` source file in `public/`, then refreshes its AVIF output based on the rules in `scripts/optimize-images.mjs`.
