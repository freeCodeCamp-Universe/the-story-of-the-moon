# AGENTS.md

This file documents the repo-wide engineering practices agents should follow when working in this project.

## Scope

These instructions apply to the whole repository unless a more specific instruction file says otherwise.

## Stack And Workflow

- Use the existing React + TypeScript + Vite patterns already present in `src/`.
- Use `pnpm` for local commands.
- Prefer small, behavior-focused changes over broad rewrites.

## Styling

- Use CSS modules for component and chapter styling.
- Keep styles colocated with the component or chapter that owns them.
- Reuse existing tokens and global styles before introducing new one-off values.
- For content width, use the `--measure-*` ladder in `src/styles/tokens.css` (`--measure-text` for reading columns, `--measure-wide` for charts beside a legend, `--measure-frame` for multi-column framed sections, `--measure-stage` for full-bleed interactive stages) and `--gutter` for the side safe-zone. Do not reintroduce one-off `max-width` rem values for content.
- For running prose, render the shared `<Prose>` component (`src/components/Prose/`) rather than re-declaring per-chapter measure + centering + gutter + `p + p` rhythm. Use `width="text|wide|frame"` for the tier and `flush` when a parent layout cell already owns the gutter.
- Do not introduce inline styles unless there is a clear technical need that matches an existing repo pattern.

## Breakpoints

- `src/utils/breakpoints.ts` is the single source of truth for viewport breakpoint values. Import the named constants (`BP_TABLET`, `BP_DESKTOP`, `BP_WIDE`, `BP_ULTRAWIDE`) in any JS/TS that needs to branch on viewport size.
- CSS cannot reference these constants natively — `@media` rules do not accept custom properties. CSS files must use the same pixel values literally (e.g. `@media (min-width: 900px)` to mean `BP_DESKTOP`). When a breakpoint value changes in the TS file, grep the old number in `*.module.css` and update each occurrence.
- The canonical tiers are: `768px` (tablet), `900px` (desktop / immersive layout), `1800px` (wide), `2400px` (ultrawide). Mobile baseline (`<768px`) needs no query.
- Do not introduce new breakpoint values. If a layout genuinely needs a new tier, add it to the constants file first and document why.

## Testing

- Add or update tests whenever behavior changes.
- Use Vitest with React Testing Library.
- Test user-observable behavior and accessibility, not implementation details.
- Prefer `getByRole`, `findByRole`, and `queryByRole` with accessible names whenever possible.
- Use `userEvent` for interaction flows instead of lower-level event helpers when practical.
- Cover keyboard behavior when a feature is interactive or navigable.

### Visual Regression

- Visual regression tests use Playwright and live in `tests/visual/`. They capture the home page and all chapters across the `320`, `768`, `900`, and `1800` viewport widths defined in `tests/visual/helpers.ts`.
- Baselines are committed PNGs under `tests/visual/**-snapshots/`, generated in the pinned Playwright Linux container so they stay consistent. The `visual-setup` project (`tests/setup/linuxGuard.setup.ts`), which the visual `chromium` project depends on, throws if `pnpm test:visual` runs on a non-Linux host, so do not run or update baselines locally on macOS or Windows.
- Keep captures deterministic: mask WebGL canvases (`maskCanvas`) and freeze scenes via reduced motion (`gotoStable`). Follow the existing helpers when adding a capture rather than calling `toHaveScreenshot` directly.
- When a change alters visual layout, expect baseline diffs. Regenerate them through CI by triggering the **Visual Update** workflow (`workflow_dispatch`, or a `/update-snapshots` comment on the PR), which commits refreshed PNGs back to the branch. Do not hand-commit locally generated screenshots.
- The **Visual Tests** workflow runs on every push and pull request; check its uploaded HTML report artifact to inspect failing diffs.

### Behavior (End-to-End)

- Behavior end-to-end tests use Playwright and live in `tests/e2e/`. They are the `e2e` project in the shared `playwright.config.ts`; run them with `pnpm test:e2e` (`playwright test --project=e2e`).
- These tests assert DOM structure, roles, and visibility, not pixels. They have no committed baselines and run on any host, including macOS, because the `e2e` project declares no dependency on the `visual-setup` Linux gate that the visual `chromium` project opts into.
- Use this layer for user-observable behavior that jsdom cannot evaluate, most commonly responsive show/hide driven by CSS `@media` queries. Vitest runs in jsdom, which does no layout and does not apply media queries, so a unit test cannot see a CSS-only `display: none`. Prefer a unit test whenever the behavior is observable in jsdom; reach for an e2e behavior test only when it is not.
- Query with `getByRole` and accessible names, the same convention as the unit tests. `toBeHidden()` passes whether the element is hidden or absent from the accessibility tree, so it correctly covers elements removed by `display: none`.
- Both projects share the single preview server (`webServer` in `playwright.config.ts`, port `4173`). CI runs these on every push to `main`, pull request, and `workflow_dispatch` via `.github/workflows/e2e-tests.yml`.

## Accessibility

- Use semantic HTML first, then add ARIA only where semantics are not enough.
- Every meaningful image must have alt text. Decorative images should use an empty alt attribute.
- Preserve or add visible or programmatic guidance for keyboard-operated interactions.
- Custom interactive regions must be focusable, operable by keyboard, and exposed with an accessible name.
- Avoid global shortcuts that interfere with typing in inputs, textareas, selects, buttons, links, or contenteditable elements.

## Images And Media

- Prefer the shared `OptimizedImage` component for raster images rendered by the app.
- For large raster images that render at multiple layout sizes, provide responsive sources and `sizes` instead of shipping a single oversized asset to every viewport.
- For content-backed images, keep alt text in `src/content/assets.json`; that file is the single source of truth used to enrich other content models.
- When adding or changing managed raster images under `public/`, run `pnpm optimize:images` so the source asset, AVIF sibling, and any configured responsive AVIF variants stay in sync with repo expectations.
- If a raster asset needs responsive variants, declare that in `scripts/optimize-images.mjs` instead of adding one-off generated files by hand.
- If you add a new content asset, update the relevant content JSON so the image, credit, and alt text remain wired together.

## Performance

- Pause canvas and Three.js animation work when the visual is off-screen or the document is hidden.
- Defer mounting or importing heavy interactive visuals until they are near the viewport.
- Keep viewport visibility logic shared between related loops so a scene renderer and any companion RAF work cannot drift out of sync.
- Prefer moving resize and measurement work out of animation frames and into observers or event-driven updates.

## Navigation And Interaction

- Ensure new chapter navigation or interactive storytelling UI supports keyboard use.
- If a component reacts to arrow keys, number keys, or custom shortcuts, add tests that verify the behavior and its guardrails.
- Keep focus behavior intentional, especially for dialogs, dropdowns, and pinned scrollytelling sections.

## Validation

- Prefer targeted validation first: run the narrowest relevant test file for the change.
- Before finishing larger changes, run `pnpm test:run` and `pnpm build` when the touched area justifies it.

## Examples In This Repo

- `src/components/OptimizedImage/index.tsx` shows the expected raster image wrapper behavior.
- `src/content/index.ts` shows how alt text is merged from `src/content/assets.json`.
- `src/hooks/useKeyboardNav.ts` shows the current chapter keyboard navigation guardrails.
