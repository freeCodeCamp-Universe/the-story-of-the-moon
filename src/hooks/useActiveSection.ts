import { useEffect, useState } from 'react';
import { SECTION_IDS } from '@/data/chapters';

/**
 * Tracks which chapter subsection is currently in view, mirroring the observer
 * configuration used by `useChapterFragmentSync` for chapters. Returns the id of
 * the nearest in-view section, or `null` when none is active. Used to drive the
 * active-subsection highlight in the chapter drawer.
 */
export function useActiveSection(): string | null {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    const elements = SECTION_IDS.map((id) =>
      document.getElementById(id)
    ).filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
            break;
          }
        }
      },
      { threshold: 0, rootMargin: '-30% 0px -60% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return activeSectionId;
}
