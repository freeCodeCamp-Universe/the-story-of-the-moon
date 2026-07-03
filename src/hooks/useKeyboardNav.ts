import { useEffect } from 'react';
import { CHAPTER_IDS } from '@/data/chapters';
import { shouldIgnoreTextEntryShortcutTarget } from '@/utils/keyboardShortcuts';

export function scrollToChapter(index: number) {
  const id = CHAPTER_IDS[index];
  if (!id) return;
  const section = document.getElementById(id);
  if (!section) return;
  // Move focus so screen readers announce the chapter (the section is
  // labelled by its heading); scrolling alone is silent to assistive tech.
  section.focus({ preventScroll: true });
  section.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Event a chapter can listen for to take over navigation to one of its
 * subsections. A pinned/scrolly chapter (e.g. Ch4) whose section anchor is a
 * tall stage cannot be reached with a plain `scrollIntoView` — it must run its
 * own scroll math. Such a chapter listens for this event and calls
 * `preventDefault()` to claim the target; otherwise the default scroll runs.
 */
export const SECTION_NAV_EVENT = 'story:section-nav';

export function scrollToSectionId(id: string) {
  const event = new CustomEvent<{ id: string }>(SECTION_NAV_EVENT, {
    detail: { id },
    cancelable: true,
  });
  const notClaimed = window.dispatchEvent(event);
  if (!notClaimed) return;

  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth' });

  // Chapter visuals lazy-mount as they near the viewport, shifting layout
  // under the smooth scroll, so the heading can settle short of its
  // scroll-padding rest position — sometimes just below the scroll-spy's
  // reading line, leaving the previous section highlighted in the drawer.
  // Once motion stops, re-snap if the heading landed near, but not at, its
  // rest position. A large drift means the reader scrolled elsewhere
  // mid-flight, so leave their position alone. Where `scrollend` is
  // unsupported (Safari), the uncorrected landing stands.
  if ('onscrollend' in window) {
    window.addEventListener(
      'scrollend',
      () => {
        const navOffset =
          parseFloat(
            getComputedStyle(document.documentElement).scrollPaddingTop
          ) || 0;
        const drift = Math.abs(target.getBoundingClientRect().top - navOffset);
        if (drift > 1 && drift < window.innerHeight / 2) {
          target.scrollIntoView({ behavior: 'instant' });
        }
      },
      { once: true }
    );
  }
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

export function useKeyboardNav(shortcutsEnabled = true) {
  useEffect(() => {
    if (!shortcutsEnabled) {
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (shouldIgnoreTextEntryShortcutTarget(e.target)) {
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
        const chapterOffset =
          normalizedKey === 'n' ? 1 : normalizedKey === 'p' ? -1 : 0;

        if (chapterOffset !== 0 && scrollToRelativeChapter(chapterOffset)) {
          e.preventDefault();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutsEnabled]);
}
