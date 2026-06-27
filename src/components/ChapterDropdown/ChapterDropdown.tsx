import { useRef } from 'react';
import { Dropdown } from '@/components/Dropdown/Dropdown';
import dropdownStyles from '@/components/Dropdown/Dropdown.module.css';
import { CHAPTERS } from '@/data/chapters';
import styles from './ChapterDropdown.module.css';

type Props = {
  isOpen: boolean;
  activeChapterId: string;
  onSelect: (chapterId: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

export function ChapterDropdown({
  isOpen,
  activeChapterId,
  onSelect,
  onClose,
  triggerRef,
}: Props) {
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      id="chapter-dropdown"
      className={styles.panel}
      overlayClassName={styles.overlay}
      initialFocusRef={activeItemRef}
    >
      <ol className={styles.list}>
        {CHAPTERS.map((chapter) => {
          const isActive = chapter.id === activeChapterId;

          return (
            <li key={chapter.id}>
              <button
                ref={isActive ? activeItemRef : undefined}
                className={`${dropdownStyles.item} ${styles.item}${isActive ? ` ${dropdownStyles.itemActive}` : ''}`}
                onClick={() => onSelect(chapter.id)}
              >
                {chapter.index}. {chapter.title}
              </button>
            </li>
          );
        })}
      </ol>
    </Dropdown>
  );
}
