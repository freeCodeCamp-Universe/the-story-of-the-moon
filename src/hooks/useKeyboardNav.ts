import { useEffect } from 'react';
import { CHAPTER_IDS } from '@/data/chapters';
import { shouldIgnoreTextEntryShortcutTarget } from '@/utils/keyboardShortcuts';
import { settleScrollIntoView } from '@/utils/settleScrollIntoView';

/**
 * Move focus to a navigation target so screen readers announce the arrival;
 * scrolling alone is silent to assistive tech. Targets are plain sections and
 * headings (which carry their own accessible names), so grant programmatic
 * focusability here instead of requiring tabIndex={-1} on every registered
 * heading.
 */
function focusNavTarget(target: HTMLElement) {
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
  }
  target.focus({ preventScroll: true });
}

export function scrollToChapter(index: number) {
  const id = CHAPTER_IDS[index];
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  focusNavTarget(target);
  settleScrollIntoView(target);
}

/**
 * Event a chapter can listen for to take over navigation to one of its
 * subsections. A pinned/scrolly chapter (e.g. Ch4) whose section anchor is a
 * tall stage cannot be reached with a plain `scrollIntoView` — it must run its
 * own scroll math. Such a chapter listens for this event and calls
 * `preventDefault()` to claim the target; otherwise the default scroll runs.
 * A claiming chapter owns only the scroll: `scrollToSectionId` has already
 * focused the target for the screen-reader announcement by the time the event
 * fires.
 */
export const SECTION_NAV_EVENT = 'story:section-nav';

export function scrollToSectionId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  // Focus before dispatching: the announcement is owed no matter who scrolls,
  // so a claiming chapter only has to run its scroll math, never focus.
  focusNavTarget(target);

  const event = new CustomEvent<{ id: string }>(SECTION_NAV_EVENT, {
    detail: { id },
    cancelable: true,
  });
  const notClaimed = window.dispatchEvent(event);
  if (!notClaimed) return;

  settleScrollIntoView(target);
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
