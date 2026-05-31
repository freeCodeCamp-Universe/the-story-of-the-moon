import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { ChapterDropdown } from '@/components/ChapterDropdown/ChapterDropdown';
import { CHAPTERS } from '@/data/chapters';
import { scrollToChapter } from '@/hooks/useKeyboardNav';
import { shouldIgnoreTextEntryShortcutTarget } from '@/utils/keyboardShortcuts';
import styles from './NavStrip.module.css';

type Props = {
  activeChapterId: string;
  onNavigate: (chapterId: string) => void;
  shortcutsEnabled?: boolean;
  onShortcutsEnabledChange?: (enabled: boolean) => void;
};

const GLOBAL_SHORTCUTS = [
  { keys: 'Shift + /', action: 'Show keyboard shortcuts' },
  { keys: '1-7', action: 'Jump directly to chapters 1 through 7' },
  { keys: 'Shift + N', action: 'Go to the next chapter' },
  { keys: 'Shift + P', action: 'Go to the previous chapter' },
];

const FOCUSABLE_SELECTOR = ['a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])'].join(', ');

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => element.getAttribute('aria-hidden') !== 'true');
}

function KeyboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
      {/* Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License
      - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. */}
      <path d="M96 128C60.7 128 32 156.7 32 192L32 448C32 483.3 60.7 512 96 512L544 512C579.3 512 608 483.3 608 448L608 192C608 156.7 579.3 128 544 128L96 128zM112 192L144 192C152.8 192 160 199.2 160 208L160 240C160 248.8 152.8 256 144 256L112 256C103.2 256 96 248.8 96 240L96 208C96 199.2 103.2 192 112 192zM96 304C96 295.2 103.2 288 112 288L144 288C152.8 288 160 295.2 160 304L160 336C160 344.8 152.8 352 144 352L112 352C103.2 352 96 344.8 96 336L96 304zM208 192L240 192C248.8 192 256 199.2 256 208L256 240C256 248.8 248.8 256 240 256L208 256C199.2 256 192 248.8 192 240L192 208C192 199.2 199.2 192 208 192zM192 304C192 295.2 199.2 288 208 288L240 288C248.8 288 256 295.2 256 304L256 336C256 344.8 248.8 352 240 352L208 352C199.2 352 192 344.8 192 336L192 304zM208 384L432 384C440.8 384 448 391.2 448 400L448 432C448 440.8 440.8 448 432 448L208 448C199.2 448 192 440.8 192 432L192 400C192 391.2 199.2 384 208 384zM288 208C288 199.2 295.2 192 304 192L336 192C344.8 192 352 199.2 352 208L352 240C352 248.8 344.8 256 336 256L304 256C295.2 256 288 248.8 288 240L288 208zM304 288L336 288C344.8 288 352 295.2 352 304L352 336C352 344.8 344.8 352 336 352L304 352C295.2 352 288 344.8 288 336L288 304C288 295.2 295.2 288 304 288zM384 208C384 199.2 391.2 192 400 192L432 192C440.8 192 448 199.2 448 208L448 240C448 248.8 440.8 256 432 256L400 256C391.2 256 384 248.8 384 240L384 208zM400 288L432 288C440.8 288 448 295.2 448 304L448 336C448 344.8 440.8 352 432 352L400 352C391.2 352 384 344.8 384 336L384 304C384 295.2 391.2 288 400 288zM480 208C480 199.2 487.2 192 496 192L528 192C536.8 192 544 199.2 544 208L544 240C544 248.8 536.8 256 528 256L496 256C487.2 256 480 248.8 480 240L480 208zM496 288L528 288C536.8 288 544 295.2 544 304L544 336C544 344.8 536.8 352 528 352L496 352C487.2 352 480 344.8 480 336L480 304C480 295.2 487.2 288 496 288z" />
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

export function NavStrip({ activeChapterId, onNavigate, shortcutsEnabled = true, onShortcutsEnabledChange }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const chapterButtonRef = useRef<HTMLButtonElement | null>(null);
  const shortcutsButtonRef = useRef<HTMLButtonElement | null>(null);
  const shortcutsDialogRef = useRef<HTMLDialogElement | null>(null);
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

    const dialog = shortcutsDialogRef.current;
    if (!dialog) return;

    hasOpenedShortcutsRef.current = true;

    function handleCancel() {
      setIsShortcutsOpen(false);
    }

    dialog.addEventListener('cancel', handleCancel);

    if (!dialog.open) {
      dialog.showModal();
    }

    closeShortcutsButtonRef.current?.focus();

    return () => {
      dialog.removeEventListener('cancel', handleCancel);

      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isShortcutsOpen]);

  useEffect(() => {
    if (!shortcutsEnabled) {
      return;
    }

    function handleGlobalShortcuts(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (shouldIgnoreTextEntryShortcutTarget(event.target)) {
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        setIsShortcutsOpen(true);
      }
    }

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [shortcutsEnabled]);

  function handleShortcutsDialogKeyDown(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;

    const dialog = shortcutsDialogRef.current;
    if (!dialog) return;

    const focusableElements = getFocusableElements(dialog);
    if (focusableElements.length === 0) {
      event.preventDefault();
      closeShortcutsButtonRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;
    const isFocusInsideDialog = activeElement instanceof HTMLElement && dialog.contains(activeElement);

    if (event.shiftKey) {
      if (!isFocusInsideDialog || activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      return;
    }

    if (!isFocusInsideDialog || activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function handleShortcutsDialogClick(event: ReactMouseEvent<HTMLDialogElement>) {
    const dialog = shortcutsDialogRef.current;
    if (!dialog) return;

    if (event.target !== dialog) {
      return;
    }

    const rect = dialog.getBoundingClientRect();
    const isBackdropClick = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;

    if (isBackdropClick) {
      setIsShortcutsOpen(false);
    }
  }

  useEffect(() => {
    if (!isShortcutsOpen && hasOpenedShortcutsRef.current) {
      shortcutsButtonRef.current?.focus();
    }
  }, [isShortcutsOpen]);

  function renderShortcutKeys(keys: string) {
    return keys.split(' / ').flatMap((shortcut, shortcutIndex) => {
      const renderedShortcut = shortcut.split(' + ').flatMap((part, partIndex) => {
        if (partIndex > 0) {
          return [
            <span key={`sep-${shortcutIndex}-${partIndex}`} className={styles.shortcutSeparator}>
              {' '}
              +{' '}
            </span>,
            <kbd key={`key-${shortcutIndex}-${partIndex}`}>{part}</kbd>,
          ];
        }

        return [<kbd key={`key-${shortcutIndex}-${partIndex}`}>{part}</kbd>];
      });

      if (shortcutIndex > 0) {
        return [' / ', ...renderedShortcut];
      }

      return renderedShortcut;
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
      <header className={styles.header}>
        <h1 className={styles.brand}>The Story of the Moon</h1>
        <nav className={styles.nav} aria-label="Chapters">
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
            <KeyboardIcon />
          </button>
        </nav>
      </header>

      <ChapterDropdown isOpen={isDropdownOpen} activeChapterId={activeChapterId} onSelect={handleSelect} onClose={() => setIsDropdownOpen(false)} triggerRef={chapterButtonRef} />

      {isShortcutsOpen ? (
        <dialog ref={shortcutsDialogRef} id="keyboard-shortcuts-dialog" className={styles.modal} aria-labelledby="keyboard-shortcuts-title" onKeyDown={handleShortcutsDialogKeyDown} onClick={handleShortcutsDialogClick}>
          <div className={styles.modalHeader}>
            <h2 id="keyboard-shortcuts-title" className={styles.modalTitle}>
              Keyboard shortcuts
            </h2>
            <button ref={closeShortcutsButtonRef} autoFocus type="button" className={styles.modalCloseButton} onClick={() => setIsShortcutsOpen(false)} aria-label="close keyboard shortcuts">
              <CloseIcon />
            </button>
          </div>

          <section className={styles.shortcutSection} aria-labelledby="shortcut-settings-title">
            <h3 id="shortcut-settings-title" className={styles.sectionTitle}>
              Shortcut settings
            </h3>
            <div className={styles.preferenceCard}>
              <label className={styles.preferenceLabel}>
                <input className={styles.preferenceInput} type="checkbox" role="switch" checked={shortcutsEnabled} onChange={(event) => onShortcutsEnabledChange?.(event.currentTarget.checked)} />
                <span className={styles.preferenceToggle} aria-hidden="true">
                  <span className={styles.preferenceToggleThumb} />
                </span>
                <span className={styles.preferenceName}>Enable global keyboard shortcuts</span>
              </label>
            </div>
          </section>

          <section className={styles.shortcutSection} aria-labelledby="global-shortcuts-title">
            <h3 id="global-shortcuts-title" className={styles.sectionTitle}>
              Available global shortcuts
            </h3>
            <p className={styles.sectionNote}>{shortcutsEnabled ? 'These shortcuts work anywhere in the story unless your cursor is inside a text field.' : 'These shortcuts are currently off.'}</p>
            <dl className={styles.shortcutList}>
              {GLOBAL_SHORTCUTS.map((shortcut) => (
                <div key={shortcut.keys} className={styles.shortcutRow}>
                  <dt className={styles.shortcutKeys}>{renderShortcutKeys(shortcut.keys)}</dt>
                  <dd className={styles.shortcutAction}>{shortcut.action}</dd>
                </div>
              ))}
            </dl>
          </section>
        </dialog>
      ) : null}
    </>
  );
}
