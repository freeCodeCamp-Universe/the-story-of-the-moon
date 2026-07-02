import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { IconButton } from '@/components/IconButton/IconButton';
import { useModalDialog } from '@/hooks/useModalDialog';
import styles from './Drawer.module.css';

/**
 * Longest transition duration (ms) declared on the element. Returns 0 when
 * nothing transitions — reduced motion (CSS sets `transition: none`) or a test
 * environment where no stylesheet is applied — so the drawer unmounts at once
 * instead of waiting on a transitionend that will never fire.
 */
function getTransitionDurationMs(element: HTMLElement): number {
  return getComputedStyle(element)
    .transitionDuration.split(',')
    .reduce((max, part) => {
      const trimmed = part.trim();
      const value = parseFloat(trimmed);
      if (!Number.isFinite(value)) return max;
      const ms = trimmed.endsWith('ms') ? value : value * 1000;
      return Math.max(max, ms);
    }, 0);
}

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
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isRendered, setIsRendered] = useState(isOpen);
  const { dialogRef, closeButtonRef, dialogProps } = useModalDialog({
    isOpen,
    onClose,
    triggerRef,
    initialFocusRef: titleRef,
  });

  // Mount synchronously the moment isOpen turns true (adjusting state during
  // render), so useModalDialog sees the <dialog> and calls showModal on the
  // same commit rather than a frame late.
  if (isOpen && !isRendered) {
    setIsRendered(true);
  }

  // Keep the <dialog> mounted through its slide-out, then unmount. Removing it
  // the instant isOpen flips false would tear it from the DOM before the exit
  // transition could play — only the enter half is covered by @starting-style.
  useEffect(() => {
    if (isOpen || !isRendered) return;

    const dialog = dialogRef.current;
    if (!dialog) {
      setIsRendered(false);
      return;
    }

    const durationMs = getTransitionDurationMs(dialog);
    if (durationMs <= 0) {
      setIsRendered(false);
      return;
    }

    let settled = false;
    const finish = (event?: TransitionEvent) => {
      // Ignore transitionend bubbling up from row children (their background /
      // color transitions); wait for the panel's own transform to land, with
      // the timeout as the backstop.
      if (
        event &&
        (event.target !== dialog || event.propertyName !== 'transform')
      ) {
        return;
      }
      if (settled) return;
      settled = true;
      setIsRendered(false);
    };

    dialog.addEventListener('transitionend', finish);
    const timeoutId = window.setTimeout(finish, durationMs + 50);

    return () => {
      dialog.removeEventListener('transitionend', finish);
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, isRendered, dialogRef]);

  if (!isRendered) return null;

  return (
    <dialog
      ref={dialogRef}
      id={id}
      className={styles.drawer}
      aria-labelledby={titleId}
      {...dialogProps}
    >
      <div className={styles.header}>
        {/* tabIndex=-1 so open focus can land on the title, letting a screen
            reader read the drawer's list content from the top (ARIA APG). */}
        <h2 ref={titleRef} id={titleId} className={styles.title} tabIndex={-1}>
          {title}
        </h2>
        <IconButton
          ref={closeButtonRef}
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
