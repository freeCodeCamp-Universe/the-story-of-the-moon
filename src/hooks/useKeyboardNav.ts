import { useEffect } from 'react';
import { CHAPTER_IDS } from '@/data/chapters';

export function scrollToChapter(index: number) {
  const id = CHAPTER_IDS[index];
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function getCurrentChapterIndex() {
  const chapterId = window.location.hash.replace('#', '');
  const index = CHAPTER_IDS.indexOf(chapterId);
  return index === -1 ? 0 : index;
}

function scrollToRelativeChapter(offset: number) {
  const targetIndex = getCurrentChapterIndex() + offset;
  if (targetIndex < 0 || targetIndex >= CHAPTER_IDS.length) {
    return false;
  }

  scrollToChapter(targetIndex);
  return true;
}

export function useKeyboardNav() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.isContentEditable || target.closest('input, textarea, select')) {
        return;
      }

      const normalizedKey = e.key.toLowerCase();

      if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < CHAPTER_IDS.length) {
          e.preventDefault();
          scrollToChapter(idx);
        }

        return;
      }

      if (e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const chapterOffset = normalizedKey === 'n' ? 1 : normalizedKey === 'p' ? -1 : 0;

        if (chapterOffset !== 0 && scrollToRelativeChapter(chapterOffset)) {
          e.preventDefault();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
