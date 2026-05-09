import { useEffect, useRef } from 'react';
import { CHAPTERS } from '@/data/chapters';
import styles from './ChapterDropdown.module.css';

type Props = {
  isOpen: boolean;
  activeChapterId: string;
  onSelect: (chapterId: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

export default function ChapterDropdown({
  isOpen,
  activeChapterId,
  onSelect,
  onClose,
  triggerRef,
}: Props) {
  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    activeItemRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;

      onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className={styles.overlay} aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} id="chapter-dropdown" className={styles.panel}>
        <ol className={styles.list}>
          {CHAPTERS.map((chapter) => {
            const isActive = chapter.id === activeChapterId;

            return (
              <li key={chapter.id}>
                <button
                  ref={isActive ? activeItemRef : undefined}
                  className={`${styles.item}${isActive ? ` ${styles.itemActive}` : ''}`}
                  onClick={() => onSelect(chapter.id)}
                >
                  {chapter.index}. {chapter.title}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
