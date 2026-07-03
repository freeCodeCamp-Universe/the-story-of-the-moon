import { useEffect, useMemo, useRef, useState } from 'react';
import { ChapterDrawer } from '@/components/ChapterDrawer/ChapterDrawer';
import { Dialog } from '@/components/Dialog/Dialog';
import { IconButton } from '@/components/IconButton/IconButton';
import { Kbd } from '@/components/Kbd/Kbd';
import { Switch } from '@/components/Switch/Switch';
import { CHAPTERS } from '@/data/chapters';
import { scrollToChapter, scrollToSectionId } from '@/hooks/useKeyboardNav';
import { shouldIgnoreTextEntryShortcutTarget } from '@/utils/keyboardShortcuts';
import styles from './NavStrip.module.css';

type Props = {
  activeChapterId: string;
  activeSectionId?: string | null;
  onNavigate: (chapterId: string) => void;
  shortcutsEnabled?: boolean;
  onShortcutsEnabledChange?: (enabled: boolean) => void;
  animationsEnabled?: boolean;
  onAnimationsEnabledChange?: (enabled: boolean) => void;
  darkThemeEnabled?: boolean;
  onDarkThemeEnabledChange?: (enabled: boolean) => void;
};

const GLOBAL_SHORTCUTS = [
  { keys: 'Shift + /', action: 'Show keyboard shortcuts' },
  { keys: 'Shift + K', action: 'Open the chapter list' },
  { keys: '1-7', action: 'Jump directly to chapters 1 through 7' },
  { keys: 'Shift + N', action: 'Go to the next chapter' },
  { keys: 'Shift + P', action: 'Go to the previous chapter' },
];

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      width="64"
      height="64"
      viewBox="0 0 24 24"
    >
      <g fill="none" stroke="currentColor" stroke-width="2">
        <rect
          width="20"
          height="18"
          x="2"
          y="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          rx="2"
        ></rect>
        <path d="M9 3v18"></path>
      </g>
    </svg>
  );
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

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 640"
      aria-hidden="true"
      focusable="false"
    >
      {/* !Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. */}
      <path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z" />
    </svg>
  );
}

export function NavStrip({
  activeChapterId,
  activeSectionId = null,
  onNavigate,
  shortcutsEnabled = true,
  onShortcutsEnabledChange,
  animationsEnabled = true,
  onAnimationsEnabledChange,
  darkThemeEnabled = true,
  onDarkThemeEnabledChange,
}: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const drawerButtonRef = useRef<HTMLButtonElement | null>(null);
  const shortcutsButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);

  const activeChapterIndex = useMemo(
    () => CHAPTERS.findIndex((chapter) => chapter.id === activeChapterId),
    [activeChapterId]
  );
  const currentIndex = activeChapterIndex === -1 ? 0 : activeChapterIndex;
  const currentChapter = CHAPTERS[currentIndex];

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
        return;
      }

      if (event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsDrawerOpen((open) => !open);
      }
    }

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [shortcutsEnabled]);

  function renderShortcutKeys(keys: string) {
    return keys.split(' / ').flatMap((shortcut, shortcutIndex) => {
      const renderedShortcut = shortcut
        .split(' + ')
        .flatMap((part, partIndex) => {
          if (partIndex > 0) {
            return [
              <span
                key={`sep-${shortcutIndex}-${partIndex}`}
                className={styles.shortcutSeparator}
              >
                {' '}
                +{' '}
              </span>,
              <Kbd key={`key-${shortcutIndex}-${partIndex}`}>{part}</Kbd>,
            ];
          }

          return [<Kbd key={`key-${shortcutIndex}-${partIndex}`}>{part}</Kbd>];
        });

      if (shortcutIndex > 0) {
        return [' / ', ...renderedShortcut];
      }

      return renderedShortcut;
    });
  }

  function handleSelectChapter(chapterId: string) {
    const chapterIndex = CHAPTERS.findIndex(
      (chapter) => chapter.id === chapterId
    );
    if (chapterIndex === -1) return;

    scrollToChapter(chapterIndex);
    onNavigate(chapterId);
    setIsDrawerOpen(false);
  }

  function handleSelectSection(sectionId: string) {
    scrollToSectionId(sectionId);
    setIsDrawerOpen(false);
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.brand}>The Story of the Moon</h1>
        <nav className={styles.nav} aria-label="Chapters">
          <div className={styles.endControls}>
            <IconButton
              ref={drawerButtonRef}
              active={isDrawerOpen}
              onClick={() => setIsDrawerOpen((value) => !value)}
              aria-label={`open chapter list, current chapter ${currentChapter.index}: ${currentChapter.title}`}
              aria-haspopup="dialog"
              aria-expanded={isDrawerOpen}
              aria-controls="chapter-drawer"
            >
              <MenuIcon />
            </IconButton>

            <IconButton
              ref={shortcutsButtonRef}
              className={styles.shortcutsButton}
              active={isShortcutsOpen}
              onClick={() => setIsShortcutsOpen(true)}
              aria-label="show keyboard shortcuts"
              aria-haspopup="dialog"
              aria-expanded={isShortcutsOpen}
              aria-controls="keyboard-shortcuts-dialog"
            >
              <KeyboardIcon />
            </IconButton>

            <IconButton
              ref={settingsButtonRef}
              active={isSettingsOpen}
              onClick={() => setIsSettingsOpen(true)}
              aria-label="open settings"
              aria-haspopup="dialog"
              aria-expanded={isSettingsOpen}
              aria-controls="settings-dialog"
            >
              <SettingsIcon />
            </IconButton>
          </div>
        </nav>
      </header>

      <ChapterDrawer
        isOpen={isDrawerOpen}
        activeChapterId={activeChapterId}
        activeSectionId={activeSectionId}
        onSelectChapter={handleSelectChapter}
        onSelectSection={handleSelectSection}
        onClose={() => setIsDrawerOpen(false)}
        triggerRef={drawerButtonRef}
      />

      <Dialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        triggerRef={shortcutsButtonRef}
        id="keyboard-shortcuts-dialog"
        titleId="keyboard-shortcuts-title"
        title="Keyboard shortcuts"
        closeLabel="close keyboard shortcuts"
      >
        <section
          className={styles.shortcutSection}
          aria-labelledby="global-shortcuts-title"
        >
          <p>
            {shortcutsEnabled
              ? 'These shortcuts work anywhere in the story.'
              : 'These shortcuts are currently off.'}
          </p>
          <dl className={styles.shortcutList}>
            {GLOBAL_SHORTCUTS.map((shortcut) => (
              <div key={shortcut.keys} className={styles.shortcutRow}>
                <dt className={styles.shortcutKeys}>
                  {renderShortcutKeys(shortcut.keys)}
                </dt>
                <dd className={styles.shortcutAction}>{shortcut.action}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Dialog>

      <Dialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        triggerRef={settingsButtonRef}
        id="settings-dialog"
        titleId="settings-title"
        title="Settings"
        closeLabel="close settings"
      >
        <div className={styles.preferences}>
          <div>
            <Switch
              label="Enable dark theme"
              checked={darkThemeEnabled}
              onChange={(checked) => onDarkThemeEnabledChange?.(checked)}
              describedBy="settings-dark-theme-note"
            />
            <p id="settings-dark-theme-note" className={styles.sectionNote}>
              When on, the dark theme is used.
            </p>
          </div>

          <div className={styles.shortcutsPreference}>
            <Switch
              label="Enable global keyboard shortcuts"
              checked={shortcutsEnabled}
              onChange={(checked) => onShortcutsEnabledChange?.(checked)}
              describedBy="settings-shortcuts-note"
            />
            <p id="settings-shortcuts-note" className={styles.sectionNote}>
              When on, the global keyboard shortcuts are active. Chapter
              shortcuts are unaffected.
            </p>
          </div>

          <div>
            <Switch
              label="Enable animations"
              checked={animationsEnabled}
              onChange={(checked) => onAnimationsEnabledChange?.(checked)}
              describedBy="settings-animations-note"
            />
            <p id="settings-animations-note" className={styles.sectionNote}>
              When on, motion and transitions play as you move through the
              story.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
