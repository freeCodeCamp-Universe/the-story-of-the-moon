# Focus management for section navigation

Scrolling alone is silent to screen readers. Any UI that navigates the reader
somewhere — the chapter drawer, the keyboard shortcuts (`1`–`7`, `Shift+N`/`P`),
or a future TOC, footer link, or "continue reading" affordance — must also land
focus on the destination so assistive tech announces the arrival. This doc
states the rule and where it is enforced, so new navigation UI can inherit it
instead of re-solving it.

## The rule

**Every navigation that scrolls must move focus to a target that has an
accessible name.** A scroll with no focus change announces nothing; a focus
change to an unnamed element announces nothing useful.

## Where it is enforced

Both scroll entry points in `src/hooks/useKeyboardNav.ts` run a shared
`focusNavTarget` helper before scrolling:

- `scrollToChapter(index)` — chapter-level navigation.
- `scrollToSectionId(id)` — subsection navigation, including the
  `SECTION_NAV_EVENT` claim protocol (see
  [chapter-drawer.md](./chapter-drawer.md)).

The helper sets `tabindex="-1"` on the target if it is not already focusable,
then calls `focus({ preventScroll: true })`. Consequences:

- **New navigation UI should call `scrollToChapter`/`scrollToSectionId`, not
  `scrollIntoView` directly.** Anything funneled through those two functions
  gets the announcement (and the `settleScrollIntoView` landing correction) for
  free.
- **No per-heading `tabIndex` markup is needed.** Focusability is granted on
  the fly, so registering a section in `src/data/chapters.ts` requires only a
  stable heading `id`.
- **Chapters that claim `SECTION_NAV_EVENT` own only the scroll math.**
  `scrollToSectionId` focuses the target before dispatching the event, so a
  claimant (Ch4's pinned timeline, `ScrollyChapter`) never has to remember the
  focus obligation.
- **Targets must carry their own accessible name.** Headings and labelled
  `<section>` elements do; a bare `<div>` target does not. If a target is not a
  heading, give it an `aria-label` or `aria-labelledby`.

## Navigating from inside a modal dialog

A dialog or drawer that navigates on selection has two extra hazards:

1. While a modal `<dialog>` is open, the rest of the document is inert and
   **refuses focus**, so navigating before the close commit silently drops the
   focus move.
2. `useModalDialog` restores focus to the trigger on close — the right behavior
   for a plain dismissal, but it clobbers the target focus if the navigation
   already ran.

The pattern (see `handleSelectChapter`/`handleSelectSection` in
`src/components/NavStrip/NavStrip.tsx`): stash the navigation in a ref, close
the dialog, and run the navigation from an effect that fires once the dialog is
closed. Child effects run before parent effects, so the dialog close and the
trigger restore have both finished by then — the target focus lands last and
wins. A dismissal without a selection (Escape, backdrop, close button) leaves
the ref empty and keeps the normal trigger restore.

## Testing the contract

- `src/hooks/useKeyboardNav.test.tsx` — focus lands on chapter and section
  targets, non-focusable targets are granted `tabindex="-1"`, and focus still
  moves when a chapter claims the scroll.
- `src/components/NavStrip/NavStrip.test.tsx` — after a drawer selection, focus
  ends on the navigation target, not the trigger; a plain close still restores
  the trigger.

When adding navigation UI, assert where focus lands, not just that
`scrollIntoView` was called.
