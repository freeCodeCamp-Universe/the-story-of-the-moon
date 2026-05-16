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
# Optimize every raster image in public/
pnpm optimize:images

# Optimize only specific files or folders
pnpm optimize:images -- public/moon/lunar-near-side.jpg public/moon/lunar-far-side.jpg
pnpm optimize:images -- public/moon
```
