import { useEffect } from 'react';
import { CHAPTER_IDS } from '@/data/chapters';

export function useChapterFragmentSync(onActiveChapterChange?: (chapterId: string) => void) {
  useEffect(() => {
    const elements = CHAPTER_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const chapterId = entry.target.id;
            history.replaceState(null, '', `#${chapterId}`);
            onActiveChapterChange?.(chapterId);
            break;
          }
        }
      },
      { threshold: 0, rootMargin: '-30% 0px -60% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onActiveChapterChange]);
}
