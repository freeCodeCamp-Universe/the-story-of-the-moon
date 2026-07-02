import { type ReactNode, type RefObject } from 'react';
import { IconButton } from '@/components/IconButton/IconButton';
import { useModalDialog } from '@/hooks/useModalDialog';
import styles from './Drawer.module.css';

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
      aria-hidden="true"
      focusable="false"
    >
      {/* !Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc. */}
      <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" />
    </svg>
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  /** Element to return focus to after the drawer closes. */
  triggerRef: RefObject<HTMLElement | null>;
  /** id for the <dialog> element, matched by the trigger's aria-controls. */
  id: string;
  /** id for the title heading, wired to the drawer's aria-labelledby. */
  titleId: string;
  title: string;
  /** Accessible label for the close button. */
  closeLabel: string;
  children: ReactNode;
};

/**
 * Edge-anchored panel built on the native <dialog> element. Slides in from the
 * inline-end edge and fills the viewport height. Reuses `useModalDialog` for the
 * focus trap, Escape/backdrop close, scroll lock, and focus restore.
 */
export function Drawer({
  isOpen,
  onClose,
  triggerRef,
  id,
  titleId,
  title,
  closeLabel,
  children,
}: Props) {
  const { dialogRef, closeButtonRef, dialogProps } = useModalDialog({
    isOpen,
    onClose,
    triggerRef,
  });

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={styles.drawer}
      aria-labelledby={titleId}
      {...dialogProps}
    >
      <div className={styles.header}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <IconButton
          ref={closeButtonRef}
          autoFocus
          aria-label={closeLabel}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
