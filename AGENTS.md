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

### SVG Text And Diagram Scaling

Keep text scale consistent across components that mix in-diagram SVG text with HTML text (captions, titles). The trap: an SVG `<text>` font size is measured in viewBox user units, so its rendered size is `token px × (render width ÷ viewBox width)`. It does **not** render at the literal token size; it swells and shrinks with the SVG's render width. HTML text always renders at the true CSS px. So sharing a token like `--text-body` between an SVG label and an HTML caption only looks consistent if you control the SVG's render width.

Apply these two rules:

- **Text that must match a token size exactly (titles, captions, anything that should read at the same size as adjacent prose): render it as an HTML sibling of the `<svg>`, not as in-SVG `<text>`.** A `<p className={styles.title}>` below the `<svg>` renders `var(--text-body)` / `var(--text-lg)` at literal px on every viewport. This is the fix when a title looks too small on phone/tablet even though it shares the prose token. Style it as HTML (`color`, `text-align`, `margin`), not SVG (`fill`, `text-anchor`).
- **Text that must stay anchored to diagram geometry (region/axis labels inside the drawing): keep it as SVG `<text>`, but stabilize the render width so it does not drift across viewports.** Cap the stage with a fixed grid track (`grid-template-columns: repeat(N, minmax(0, 15rem))` + `justify-content: center`) rather than letting a `1fr` track stretch. A stable render width keeps the viewBox scale, and therefore the rendered label size, stable. Below the row tier, cap the stacked stage (`max-width: 14rem`) so the SVG never renders so wide that labels swell or run off a phone viewport.

Ch1's `GiantImpactDiagram` and Ch5's `MagmaOceanStages` are deliberately mirrored references for this pattern; match one when building a similar staged diagram.

## Breakpoints

- `src/utils/breakpoints.ts` is the single source of truth for viewport breakpoint values. Import the named constants (`BP_SMALL_TABLET`, `BP_TABLET`, `BP_DESKTOP`, `BP_WIDE`, `BP_ULTRAWIDE`) in any JS/TS that needs to branch on viewport size.
- CSS cannot reference these constants natively — `@media` rules do not accept custom properties. CSS files must use the same pixel values literally (e.g. `@media (min-width: 900px)` to mean `BP_DESKTOP`). When a breakpoint value changes in the TS file, grep the old number in `*.module.css` and update each occurrence, including any `600px` uses.
- The canonical tiers are: `600px` (small tablet / phone boundary, `BP_SMALL_TABLET`), `768px` (tablet), `900px` (desktop / immersive layout), `1800px` (wide), `2400px` (ultrawide). Mobile baseline needs no query.
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
- When a change alters visual layout, expect baseline diffs. Run the **Visual Update** workflow when you have intentionally changed layout and the **Visual Tests** workflow is failing on diffs you have reviewed and accept. Regenerate through CI by dispatching it (`workflow_dispatch`) on the branch that holds the change; it commits refreshed PNGs back to that same branch. Do not hand-commit locally generated screenshots.
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

### Staged Diagram Alt Text

For multi-frame staged SVG diagrams, the topic and each stage are announced by different elements:

- **The figure-level `aria-label`** carries the topic.
- **Each frame's `<title>`** is the stage's short name only, with no topic prefix. It is the image's accessible name.
- **Each frame's `<desc>`** describes the exact graphic of that specific frame as a sighted reader would see it, not a gloss of the concept.
- **The visible stage caption `<p>`** repeats the `<title>` text, so it must be `aria-hidden="true"` to prevent a double screen-reader announcement.

Reference implementations: `src/chapters/Ch1/GiantImpactDiagram.tsx` and `src/chapters/Ch5/MagmaOceanCrossSection.tsx`.

### Image Comparison Slider Alt Text

For a before/after or A/B comparison slider (`ImageCompareSlider` and any diptych built on it), the meaning is the comparison of the two images, not either one alone, and the reveal is a purely visual interaction. Treat the pair as one information-dense graphic with a single text alternative, following [WAI's complex-image guidance](https://www.w3.org/WAI/tutorials/images/complex/).

- **Do not** expose the two layers as separately-navigable images. That makes a screen reader step through them one at a time, in DOM order rather than reading order.
- **Mark both `<img>` layers decorative** (`alt=""`).
- **Give the figure one combined description** that covers both views in a single pass, ordered original then derived view (e.g. the photo, then the topographic map). The component composes this from the `originalAlt` and `topographicAlt` props, exposes it once as screen-reader-only text in reading order, and links it to the slider handle via `aria-describedby`.
- **Keep the slider operable** by mouse, touch, and keyboard, but do not let its value (the percentage revealed) or any drag/key hint carry the image meaning or repeat per layer. Those describe a visual-only interaction.
- **Each per-image description** still lives in `src/content/assets.ts`, keyed to that specific image.

Reference implementation: `src/components/ImageCompareSlider/ImageCompareSlider.tsx` and its use in `src/chapters/Ch2/Ch2.tsx`.

## Images And Media

- Prefer the shared `OptimizedImage` component for raster images rendered by the app.
- For large raster images that render at multiple layout sizes, provide responsive sources and `sizes` instead of shipping a single oversized asset to every viewport.
- For content-backed images, keep alt text in `src/content/assets.ts`; that file is the single source of truth used to enrich other content models.
- Alt text must describe what is visibly in the frame — the vantage point, the composition, and the notable features a sighted reader would pick out — not merely name the subject. "Aristarchus crater" is a label, not alt text.
- Write one entry per image. When two or more images appear together (a comparison slider or diptych), every image needs its own entry and none may be left undescribed.
- When adding or changing managed raster images under `public/`, run `pnpm optimize:images` so the source asset, AVIF sibling, and any configured responsive AVIF variants stay in sync with repo expectations.
- If a raster asset needs responsive variants, declare that in `scripts/optimize-images.mjs` instead of adding one-off generated files by hand.
- If you add a new content asset, update the relevant content model in `src/content/` so the image, credit, and alt text remain wired together.

## Performance

- Pause canvas and Three.js animation work when the visual is off-screen or the document is hidden.
- Defer mounting or importing heavy interactive visuals until they are near the viewport.
- Keep viewport visibility logic shared between related loops so a scene renderer and any companion RAF work cannot drift out of sync.
- Prefer moving resize and measurement work out of animation frames and into observers or event-driven updates.

## Navigation And Interaction

- Ensure new chapter navigation or interactive storytelling UI supports keyboard use.
- If a component reacts to arrow keys, number keys, or custom shortcuts, add tests that verify the behavior and its guardrails.
- Keep focus behavior intentional, especially for dialogs, dropdowns, and pinned, scroll-driven sections (the stage stays fixed while content advances).
- Any navigation that scrolls the reader somewhere must also land focus on a named target so screen readers announce the arrival. Route new navigation through `scrollToChapter`/`scrollToSectionId` (`src/hooks/useKeyboardNav.ts`), which handle this centrally; see `docs/architecture/navigation-focus.md`, including the close-then-navigate pattern for navigating from inside a modal dialog.
- Keyboard-hint UI is a desktop-tier (`900px`) affordance. The NavStrip keyboard-shortcuts button and the "Enable global keyboard shortcuts" settings toggle are hidden below `900px` (`NavStrip.module.css`). Any visible hint that advertises keys (e.g. Ch4's timeline hint, Ch2's arrow-key rotation glyphs) must follow the same boundary: hide it below `900px` and surface touch/tap guidance instead. Match the NavStrip pattern with `@media (max-width: 899px) { display: none }`, or reveal at `@media (min-width: 900px)`. This does not gate the keyboard behavior itself (chapter-local arrow/bracket handling still works with an attached keyboard); it only governs when the hint text is shown.

### Chapter Drawer

The primary navigation UI is the chapter drawer: a slide-in `<dialog>` panel (`ChapterDrawer`, built on the generic `Drawer` + `useModalDialog`) listing every chapter and its curated subsections, with scroll-spy highlighting and section-aware scrolling. It is spread across a data model, two shared components, two hooks, and a custom-event protocol. **Read `docs/architecture/chapter-drawer.md` before changing any of it.** The load-bearing contracts:

- **Subsections live in `src/data/chapters.ts`.** Each `section.id` must be the `id` of a real heading element in that chapter's DOM (`useActiveSection` and section-scroll both resolve it via `getElementById`; a missing element is silently inert). To add one: put a stable `id` on the heading (convention: `ch<N>-...-heading`) and add the matching `{ id, title }` entry.
- **Pinned/scrolly chapters must claim their own section navigation.** `scrollToSectionId` dispatches a cancelable `SECTION_NAV_EVENT`; the settle-correcting `settleScrollIntoView` (`src/utils/settleScrollIntoView.ts`) is the fallback only if no chapter calls `preventDefault()`. A section anchor inside a tall pinned stage (Ch4) or a scrolly step (`ScrollyChapter`) lands mid-stage under the default scroll, so the owning chapter must listen, claim the event, and run its own scroll math.
- **Reuse `Drawer` for any future edge panel** rather than re-implementing the `<dialog>`. It already provides the focus trap, scroll lock, backdrop/Escape close, and focus restore, and focuses the title (not the close button) on open for list reading order.
- **Overlay stacking uses the z-index tokens** in `src/styles/tokens.css` (`--z-header`, `--z-overlay`, `--z-skip-link`), not literal values.

## Validation

- Prefer targeted validation first: run the narrowest relevant test file for the change.
- Before finishing larger changes, run `pnpm test:run` and `pnpm build` when the touched area justifies it.

## Examples In This Repo

- `src/components/OptimizedImage/index.tsx` shows the expected raster image wrapper behavior.
- `src/content/index.ts` shows how alt text is merged from `src/content/assets.ts`.
- `src/hooks/useKeyboardNav.ts` shows the current chapter keyboard navigation guardrails.
- `src/chapters/Ch5/MagmaOceanStages.{tsx,module.css}` and `src/chapters/Ch1/GiantImpactDiagram.{tsx,module.css}` show the SVG-text-vs-HTML-caption scaling pattern: HTML `<p>` titles for token-exact sizing, capped grid tracks to keep in-SVG label scale stable.
