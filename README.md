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

## Images

```bash
# Optimize every managed raster image under public/
pnpm optimize:images

# Optimize only specific files or folders under public/
pnpm optimize:images -- public/moon/lunar-near-side.jpg public/moon/lunar-far-side.jpg
pnpm optimize:images -- public/moon
```

`pnpm optimize:images` re-encodes each managed `.jpg`, `.jpeg`, or `.png` source file in `public/`, then refreshes its AVIF output based on the rules in `scripts/optimize-images.mjs`.
