import { useEffect, useState } from 'react';
import { CHAPTERS, SECTION_IDS } from '@/data/chapters';

/**
 * Reading line as a fraction of viewport height, measured from the top.
 * Kept at 50% to match the scrollytelling step trigger (`useScrollySteps`),
 * so the drawer's active-subsection indicator agrees with which step is
 * visually active, including after a drawer link centers its step.
 */
const READING_LINE = 0.5;

/**
 * Owning chapter's `<h2>` id for each section id, e.g.
 * `ch2-crater-heading` → `chapter-2-heading` (rendered by `Chapter`).
 */
const CHAPTER_HEADING_BY_SECTION: ReadonlyMap<string, string> = new Map(
  CHAPTERS.flatMap((chapter) =>
    chapter.sections.map(
      (section) => [section.id, `${chapter.id}-heading`] as const
    )
  )
);

const CHAPTER_HEADING_IDS = CHAPTERS.filter(
  (chapter) => chapter.sections.length > 0
).map((chapter) => `${chapter.id}-heading`);

/**
 * Tracks which chapter subsection the reader is currently in, to drive the
 * active-subsection highlight in the chapter drawer. Returns the id of the
 * section whose heading most recently scrolled above a reading line at 50% of
 * the viewport height, or `null` when the reader is above the first section
 * or still at the top of a chapter (its own header visible on screen).
 *
 * Unlike full-height chapters (`useChapterFragmentSync`), subsections are
 * anchored to short headings, so a thin intersection band leaves gaps between
 * headings where nothing is "active". Instead the observer wakes on each heading
 * crossing the reading line, and the active section is recomputed as the last
 * heading (in document order) still above that line.
 */
export function useActiveSection(): string | null {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    const resolveElements = () =>
      SECTION_IDS.map((id) => document.getElementById(id)).filter(
        (el): el is HTMLElement => el !== null
      );

    if (resolveElements().length === 0) return;

    const observed = new Set<HTMLElement>();

    // Section anchors can remount after this hook attaches (Ch4 swaps its
    // stacked timeline for the pinned one once the tablet media query
    // resolves). Re-resolve ids on every recompute so a detached element —
    // whose rect reads top 0, permanently "above" the reading line — can
    // never mask earlier sections, and keep the observer on live elements.
    function recompute() {
      const elements = resolveElements();
      syncObserved(elements);

      const line = window.innerHeight * READING_LINE;
      let current: HTMLElement | null = null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) {
          current = el;
        }
      }

      // At a chapter's top a short intro can leave the first heading already
      // above the reading line. While the owning chapter's own header is
      // still visible the reader is in the chapter intro, so no section is
      // active and the drawer highlights the chapter row instead. "Visible"
      // means below the fixed nav: `html` carries `scroll-padding-top:
      // var(--nav-height)`, and anything above that line is covered by the
      // NavStrip (Ch4's timeline jump rests with a sliver of header under
      // the nav, which must not suppress its section).
      if (current) {
        const headingId = CHAPTER_HEADING_BY_SECTION.get(current.id);
        const heading = headingId ? document.getElementById(headingId) : null;
        if (heading) {
          const navOffset =
            parseFloat(
              getComputedStyle(document.documentElement).scrollPaddingTop
            ) || 0;
          if (heading.getBoundingClientRect().bottom > navOffset) {
            current = null;
          }
        }
      }

      setActiveSectionId(current?.id ?? null);
    }

    // Top inset of 50% puts the observer boundary on the reading line, so a
    // crossing wakes the callback; `recompute` then reads positions directly.
    const observer = new IntersectionObserver(recompute, {
      threshold: 0,
      rootMargin: '-50% 0px 0px 0px',
    });

    function syncObserved(elements: HTMLElement[]) {
      const next = new Set(elements);
      for (const el of observed) {
        if (!next.has(el)) {
          observer.unobserve(el);
          observed.delete(el);
        }
      }
      for (const el of elements) {
        if (!observed.has(el)) {
          observer.observe(el);
          observed.add(el);
        }
      }
    }

    // The header guard's boundary is the nav's bottom edge, not the reading
    // line, so chapter headers get their own observer whose band starts at
    // the nav offset. Without it the guard is only sampled when a section
    // heading crosses the reading line — too early during a long scroll,
    // leaving a stale suppression once the header finishes tucking under
    // the nav at rest.
    const navOffset =
      parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) ||
      0;
    const headerObserver = new IntersectionObserver(recompute, {
      threshold: 0,
      rootMargin: `-${navOffset}px 0px 0px 0px`,
    });
    for (const id of CHAPTER_HEADING_IDS) {
      const heading = document.getElementById(id);
      if (heading) headerObserver.observe(heading);
    }

    syncObserved(resolveElements());
    return () => {
      observer.disconnect();
      headerObserver.disconnect();
    };
  }, []);

  return activeSectionId;
}
