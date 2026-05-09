import { useEffect, useMemo, useRef, useState } from 'react';
import ChapterDropdown from '@/components/ChapterDropdown';
import { CHAPTERS } from '@/data/chapters';
import { scrollToChapter } from '@/hooks/useKeyboardNav';
import styles from './NavStrip.module.css';

type Props = {
  activeChapterId: string;
  onNavigate: (chapterId: string) => void;
};

const GLOBAL_SHORTCUTS = [{ keys: '1-7', action: 'Jump directly to chapters 1 through 7.' }];

function InfoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true" focusable="false">
      {/* !Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. */}
      <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM224 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-8 64l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" aria-hidden="true" focusable="false">
      {/* !Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. */}
      <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" />
    </svg>
  );
}

export default function NavStrip({ activeChapterId, onNavigate }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const chapterButtonRef = useRef<HTMLButtonElement | null>(null);
  const shortcutsButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeShortcutsButtonRef = useRef<HTMLButtonElement | null>(null);
  const hasOpenedDropdownRef = useRef(false);
  const hasOpenedShortcutsRef = useRef(false);

  const activeChapterIndex = useMemo(() => CHAPTERS.findIndex((chapter) => chapter.id === activeChapterId), [activeChapterId]);
  const currentIndex = activeChapterIndex === -1 ? 0 : activeChapterIndex;
  const currentChapter = CHAPTERS[currentIndex];

  useEffect(() => {
    if (isDropdownOpen) {
      hasOpenedDropdownRef.current = true;
      return;
    }

    if (hasOpenedDropdownRef.current) {
      chapterButtonRef.current?.focus();
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isShortcutsOpen) return;

    hasOpenedShortcutsRef.current = true;
    closeShortcutsButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsShortcutsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsOpen]);

  useEffect(() => {
    if (!isShortcutsOpen && hasOpenedShortcutsRef.current) {
      shortcutsButtonRef.current?.focus();
    }
  }, [isShortcutsOpen]);

  function renderShortcutKeys(keys: string) {
    return keys.split(' / ').flatMap((part, index) => {
      if (index > 0) return [' / ', <kbd key={`key-${index}`}>{part}</kbd>];
      return [<kbd key={`key-${index}`}>{part}</kbd>];
    });
  }

  function navigateToChapter(chapterId: string) {
    const chapterIndex = CHAPTERS.findIndex((chapter) => chapter.id === chapterId);
    if (chapterIndex === -1) return;

    scrollToChapter(chapterIndex);
    onNavigate(chapterId);
  }

  function handleSelect(chapterId: string) {
    navigateToChapter(chapterId);
    setIsDropdownOpen(false);
  }

  return (
    <>
      <nav className={styles.nav} aria-label="Chapters">
        <p className={styles.brand}>The Story of the Moon</p>

        <div className={styles.centerControls}>
          <button
            ref={chapterButtonRef}
            type="button"
            className={`${styles.chapterButton}${isDropdownOpen ? ` ${styles.chapterButtonActive}` : ''}`}
            onClick={() => setIsDropdownOpen((value) => !value)}
            aria-expanded={isDropdownOpen}
            aria-controls="chapter-dropdown"
            aria-label={`open chapter list, current chapter ${currentChapter.index}: ${currentChapter.title}`}
          >
            <span className={styles.chapterDesktopText}>
              {currentChapter.index}. {currentChapter.title}
            </span>
            <span className={styles.chapterMobileText}>Chapter {currentChapter.index}</span>
          </button>
        </div>

        <button
          ref={shortcutsButtonRef}
          type="button"
          className={`${styles.shortcutsButton}${isShortcutsOpen ? ` ${styles.shortcutsButtonActive}` : ''}`}
          onClick={() => setIsShortcutsOpen(true)}
          aria-label="show keyboard shortcuts"
          aria-haspopup="dialog"
          aria-expanded={isShortcutsOpen}
          aria-controls="keyboard-shortcuts-dialog"
        >
          <InfoIcon />
        </button>
      </nav>

      <ChapterDropdown isOpen={isDropdownOpen} activeChapterId={activeChapterId} onSelect={handleSelect} onClose={() => setIsDropdownOpen(false)} triggerRef={chapterButtonRef} />

      {isShortcutsOpen ? (
        <>
          <div className={styles.modalOverlay} aria-hidden="true" onClick={() => setIsShortcutsOpen(false)} />
          <div id="keyboard-shortcuts-dialog" className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="keyboard-shortcuts-title">
            <div className={styles.modalHeader}>
              <h2 id="keyboard-shortcuts-title" className={styles.modalTitle}>
                Keyboard shortcuts
              </h2>
              <button ref={closeShortcutsButtonRef} type="button" className={styles.modalCloseButton} onClick={() => setIsShortcutsOpen(false)} aria-label="close keyboard shortcuts">
                <CloseIcon />
              </button>
            </div>

            <section className={styles.shortcutSection} aria-labelledby="global-shortcuts-title">
              <h3 id="global-shortcuts-title" className={styles.sectionTitle}>
                Available anywhere in the story
              </h3>
              <dl className={styles.shortcutList}>
                {GLOBAL_SHORTCUTS.map((shortcut) => (
                  <div key={shortcut.keys} className={styles.shortcutRow}>
                    <dt className={styles.shortcutKeys}>{renderShortcutKeys(shortcut.keys)}</dt>
                    <dd className={styles.shortcutAction}>{shortcut.action}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}
