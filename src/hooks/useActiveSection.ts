import { useEffect, useState } from 'react';
import { SECTION_IDS } from '@/data/chapters';

/**
 * Reading line as a fraction of viewport height, measured from the top.
 * Kept at 50% to match the scrollytelling step trigger (`useScrollySteps`),
 * so the drawer's active-subsection indicator agrees with which step is
 * visually active, including after a drawer link centers its step.
 */
const READING_LINE = 0.5;

/**
 * Tracks which chapter subsection the reader is currently in, to drive the
 * active-subsection highlight in the chapter drawer. Returns the id of the
 * section whose heading most recently scrolled above a reading line at 30% of
 * the viewport height, or `null` when the reader is still above the first
 * section.
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
    const elements = SECTION_IDS.map((id) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const recompute = () => {
      const line = window.innerHeight * READING_LINE;
      let current: string | null = null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) {
          current = el.id;
        }
      }
      setActiveSectionId(current);
    };

    // Top inset of 50% puts the observer boundary on the reading line, so a
    // crossing wakes the callback; `recompute` then reads positions directly.
    const observer = new IntersectionObserver(recompute, {
      threshold: 0,
      rootMargin: '-50% 0px 0px 0px',
    });

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return activeSectionId;
}
