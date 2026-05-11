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
- Do not introduce inline styles unless there is a clear technical need that matches an existing repo pattern.

## Testing

- Add or update tests whenever behavior changes.
- Use Vitest with React Testing Library.
- Test user-observable behavior and accessibility, not implementation details.
- Prefer `getByRole`, `findByRole`, and `queryByRole` with accessible names whenever possible.
- Use `userEvent` for interaction flows instead of lower-level event helpers when practical.
- Cover keyboard behavior when a feature is interactive or navigable.

## Accessibility

- Use semantic HTML first, then add ARIA only where semantics are not enough.
- Every meaningful image must have alt text. Decorative images should use an empty alt attribute.
- Preserve or add visible or programmatic guidance for keyboard-operated interactions.
- Custom interactive regions must be focusable, operable by keyboard, and exposed with an accessible name.
- Avoid global shortcuts that interfere with typing in inputs, textareas, selects, buttons, links, or contenteditable elements.

## Images And Media

- Prefer the shared `OptimizedImage` component for raster images rendered by the app.
- For content-backed images, keep alt text in `src/content/assets.json`; that file is the single source of truth used to enrich other content models.
- When adding new raster images under `public/`, run `pnpm optimize:images` so the JPEG and WebP assets stay in sync with repo expectations.
- If you add a new content asset, update the relevant content JSON so the image, credit, and alt text remain wired together.

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
