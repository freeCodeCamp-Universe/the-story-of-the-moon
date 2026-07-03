# Chapter drawer navigation

The chapter drawer is the story's primary navigation surface. It replaced the
old `ChapterDropdown`/`Dropdown` (both removed). It is a slide-in panel, anchored
to the inline-end edge, that lists every chapter and its curated subsections,
highlights where the reader currently is, and scrolls to any chapter or
subsection when picked.

This doc explains how the pieces fit together and, more importantly, the
invariants a future change must preserve. The behavior looks simple from the
outside but is spread across a data model, two shared components, two hooks, a
custom-event protocol, and per-chapter scroll math.

## The moving parts

| Concern                                                   | File                                                                           |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Section model (chapters + subsections + derived id lists) | `src/data/chapters.ts`                                                         |
| Generic edge-anchored panel                               | `src/components/Drawer/Drawer.tsx`                                             |
| Shared modal behavior (focus trap, scroll lock, restore)  | `src/hooks/useModalDialog.ts`                                                  |
| The chapter list itself + active-state resolution         | `src/components/ChapterDrawer/ChapterDrawer.tsx`                               |
| Scroll-spy for the active subsection                      | `src/hooks/useActiveSection.ts`                                                |
| Section-nav claim protocol                                | `src/hooks/useKeyboardNav.ts` (`SECTION_NAV_EVENT`, `scrollToSectionId`)       |
| Trigger button, `Shift + K`, wiring                       | `src/components/NavStrip/NavStrip.tsx`                                         |
| Pinned/scrolly chapters that claim the event              | `src/components/ScrollyChapter/ScrollyChapter.tsx`, `src/chapters/Ch4/Ch4.tsx` |
| Elevation tokens, anchor scroll offset                    | `src/styles/tokens.css`, `src/styles/globals.css`                              |

## Data flow

`StoryPage` owns two pieces of navigation state and passes them down to
`NavStrip`:

- `activeChapterId` — from `useChapterFragmentSync` (existing chapter-level
  tracking, drives the URL hash).
- `activeSectionId` — from `useActiveSection` (new subsection scroll-spy).

`NavStrip` renders the trigger button and the `ChapterDrawer`, and translates a
picked chapter/section into a scroll:

- `handleSelectChapter` → `scrollToChapter(index)` (plain smooth scroll to the
  chapter's top-level id) and closes the drawer.
- `handleSelectSection` → `scrollToSectionId(id)` (the claim protocol below) and
  closes the drawer.

## The section model (`src/data/chapters.ts`)

Each chapter now carries a `sections: { id, title }[]` array. Two derived lists
are exported: `CHAPTER_IDS` and `SECTION_IDS`.

**Invariant: every `section.id` must be the `id` of a real heading element in
that chapter's DOM.** The scroll-spy (`useActiveSection`) resolves ids to
elements with `document.getElementById`; a picked section scrolls to that id.
An id with no matching element is silently inert (no highlight, no scroll).

When adding or renaming a subsection:

1. Put a stable `id` on the heading in the chapter component (e.g.
   `<h3 id="ch3-tides-heading">`). Prefer a `ch<N>-...-heading` convention.
2. Add the matching `{ id, title }` entry to that chapter's `sections` array.
   `title` is the short label shown in the drawer, not the full heading text.

Chapters with no curated subsections (Ch1, Ch7) keep `sections: []`.

## The generic `Drawer`

`Drawer` is a reusable edge-anchored panel built on the native `<dialog>`
element and the shared `useModalDialog` hook (the same hook backs `Dialog`). It
provides the focus trap, `Escape`/backdrop close, scroll lock, and focus
restore for free. `ChapterDrawer` is a thin content layer on top of it, so a
future second drawer (bookmarks, settings) should reuse `Drawer` rather than
re-implement the panel.

Two details are deliberate and load-bearing:

- **Open focus lands on the title, not the close button.** `Drawer` passes its
  `<h2>` (with `tabIndex={-1}`) as `initialFocusRef` to `useModalDialog`. Per the
  ARIA APG dialog pattern, focusing the top of a list-content dialog lets a
  screen reader read the list from the beginning instead of starting at the
  close button. `useModalDialog` falls back to the close button when no
  `initialFocusRef` is given (that is what `Dialog` does).
- **Slide animation uses `@starting-style` + `transform`.** `transform` is the
  documented exception to the logical-property rule; the slide direction is
  flipped for RTL with `:dir(rtl)`, and the whole transition is dropped under
  `prefers-reduced-motion`.

### Why `useModalDialog` locks `html`, not `body`

`globals.css` sets `overflow-x: clip` on `html`, which makes `html` the
viewport scroll container in this app. The scroll lock therefore toggles
`overflow-y` and compensates scrollbar width on `document.documentElement`.
Locking `body` would not stop the page from scrolling behind the drawer here.

## Active-state resolution (`ChapterDrawer`)

The drawer highlights exactly one row: either the active chapter or one of its
subsections. The tricky part is that the scroll-spy reports the _last heading
scrolled past_, which lingers on a previous chapter's subsection after the
reader moves into the next chapter.

The rule, implemented inline in `ChapterDrawer`:

1. Find which chapter owns `activeSectionId`.
2. Honor the active section **only while its owning chapter is also the active
   chapter** (`activeSectionOwnerId === activeChapterId`). Otherwise treat the
   current section as `null` — the stale subsection is ignored.
3. A chapter row shows the caret (`aria-current="true"`) only when it is the
   active chapter **and** no section is currently active. So the highlight moves
   chapter → subsection → next chapter cleanly, never showing two carets.

On open, the highlighted row is scrolled into view within the drawer's own
scroll area (`scrollIntoView({ block: 'nearest' })`) **without** taking focus —
focus stays on the title per the APG behavior above.

## Scroll-spy (`useActiveSection`)

Returns the id of the subsection whose heading most recently scrolled above a
reading line, or `null` above the first section. The reading line is at **50%**
of viewport height (`READING_LINE = 0.5`), chosen to match the scrollytelling
step trigger in `useScrollySteps` so the drawer's highlight agrees with the
visually-active step, including after a drawer link centers a step.

Mechanism: subsection headings are short, so a thin intersection band would
leave dead zones between headings. Instead an `IntersectionObserver` with
`rootMargin: '-50% 0px 0px 0px'` wakes the callback whenever any heading crosses
the reading line, and the callback recomputes the active section directly from
`getBoundingClientRect().top` — the last heading in document order still at or
above the line.

Two guards inside the recompute are load-bearing:

- **Elements are re-resolved from the DOM on every recompute, and the observer
  target set is refreshed to match.** A section anchor can remount after the
  hook attaches — Ch4 swaps its stacked timeline for the pinned one once the
  tablet media query resolves, remounting `ch4-missions`. A stale detached
  element reads `getBoundingClientRect().top === 0`, which sits permanently
  "above" the reading line and masks every earlier chapter's sections (this
  once silently disabled all Ch2/Ch3 highlighting). Never cache the element
  list across recomputes.
- **No section is active while the owning chapter's own header
  (`chapter-N-heading`) is still on screen** (`rect.bottom > 0`). At a
  chapter's top a short intro can leave the first heading already above the
  reading line; the reader is still in the chapter intro, so the drawer
  highlights the chapter row instead of the first subsection.

## The section-nav claim protocol

Most subsections can be reached with a plain `scrollIntoView`. Some cannot: a
pinned or scrolly chapter's section anchor is a tall stage, and a naive scroll
lands the reader mid-stage on the wrong step. The protocol lets such a chapter
take over navigation to its own sections.

`scrollToSectionId(id)` dispatches a **cancelable** `CustomEvent`
(`SECTION_NAV_EVENT = 'story:section-nav'`) on `window` with `{ id }`:

- If no listener calls `preventDefault()`, `dispatchEvent` returns `true` and
  `scrollToSectionId` falls back to a plain `scrollIntoView({ behavior: 'smooth' })`.
  Chapter visuals lazy-mount as they near the viewport and shift layout under
  the smooth scroll, so the heading can settle short of its scroll-padding
  rest position — sometimes just below the scroll-spy's reading line, leaving
  the previous section highlighted. A one-shot `scrollend` listener re-snaps
  the heading (instant) when it lands near, but not at, that rest position; a
  large drift means the reader scrolled elsewhere mid-flight and is left
  alone. Browsers without `scrollend` keep the uncorrected landing.
- A chapter that owns a tall stage adds a `window` listener, checks the id,
  calls `event.preventDefault()` to **claim** it, and runs its own scroll math.

Current claimants:

- **`ScrollyChapter`** — if the target id lives inside one of its steps
  (`[data-step-id]`), it centers the owning step (`scrollIntoView({ block:
'center' })`) so the mid-viewport step trigger fires on the right step.
- **Ch4's `PinnedTimeline`** — claims `ch4-missions` and runs `jumpTo(0)`, the
  same nav-aware jump the keyboard uses, landing on the first mission step.

**Invariant: if you add a subsection whose anchor is inside a pinned/scrolly
stage, the owning chapter must claim it.** A plain `scrollIntoView` on a pinned
stage anchor will land mid-stage.

### Ch4's `scrollend` commit

Ch4 additionally has to keep the target step visually active during a long
cross-page jump from the drawer. At the clamped rest position the naturally
centered sentinel is not always the target, so the step observer must stay
suppressed for the _whole_ scroll — a fixed timeout is too short for a long
jump. It uses the `scrollend` event (which fires exactly when motion stops) to
commit the active step, falling back to a timeout only where `scrollend` is
unavailable or no scroll will occur. `pendingScrollEndRef` is cleared alongside
the other pending-jump state so a new jump cancels a stale listener.

## Elevation and anchor offset

- `src/styles/tokens.css` defines the global z-index ladder: `--z-header: 100`
  (sticky NavStrip), `--z-overlay: 150` (modal dialogs + the drawer surface),
  `--z-skip-link: 250` (above all overlays). Use these tokens for overlay-tier
  stacking rather than literal values. Component-internal sibling ordering
  (values `1`/`2` inside an isolated stacking context) stays literal.
- `globals.css` sets `scroll-padding-top: var(--nav-height)` on `html` so an
  anchored heading scrolled to via the drawer clears the fixed nav instead of
  hiding under it.

## Tests

- `Drawer.test.tsx`, `ChapterDrawer.test.tsx` — panel behavior, focus, active-row
  resolution.
- `useActiveSection.test.tsx` — scroll-spy resolution.
- `NavStrip.test.tsx` — trigger, `Shift + K`, chapter/section selection.
- `ScrollyChapter.test.tsx` — claiming `SECTION_NAV_EVENT` and centering steps.
- `StoryPage.test.tsx` — end-to-end wiring of `activeSectionId`.
- `tests/e2e/chapterDrawer.spec.ts` — behavior across viewports (Playwright).

The per-chapter scroll math (Ch4's `scrollend` commit, clamp positions) is only
partially covered by unit tests because it depends on real layout and the
`scrollend` event, which jsdom does not run. Exercise it manually or via the
e2e layer when changing it.
