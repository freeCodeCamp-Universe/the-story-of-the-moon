import { useRef, type RefObject } from 'react';
import { Dropdown } from '@/components/Dropdown/Dropdown';
import styles from './MissionDropdown.module.css';

export type JumpItem = { label: string; isInterlude: boolean };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Element to return focus to after the dropdown closes (owned by parent). */
  triggerRef: RefObject<HTMLElement | null>;
  items: JumpItem[];
  activeIndex: number;
  /** Parent handles the jump and closing. */
  onSelect: (index: number) => void;
};

export function MissionDropdown({ isOpen, onClose, triggerRef, items, activeIndex, onSelect }: Props) {
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      id="ch4-mission-dropdown"
      className={styles.panel}
      overlayClassName={styles.overlay}
      initialFocusRef={activeItemRef}
    >
      {/* No ariaLabel: the panel is role-less so aria-label is inert; the rail trigger names the control. */}
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const className = `${styles.row}${isActive ? ` ${styles.rowActive}` : ''}${item.isInterlude ? ` ${styles.rowInterlude}` : ''}`;

          return (
            <li key={index}>
              <button
                ref={isActive ? activeItemRef : undefined}
                type="button"
                className={className}
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onSelect(index)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ol>
    </Dropdown>
  );
}
