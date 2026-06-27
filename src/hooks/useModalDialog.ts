import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
} from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter((element) => element.getAttribute('aria-hidden') !== 'true');
}

type Options = {
  isOpen: boolean;
  onClose: () => void;
  /** Element to return focus to after the dialog closes. */
  triggerRef: RefObject<HTMLElement | null>;
};

/**
 * Drives a native <dialog> as a modal: shows/closes it in step with `isOpen`,
 * focuses the close button on open, restores focus to the trigger on close,
 * traps Tab focus, and closes on backdrop click. Spread `dialogProps` onto the
 * <dialog> and wire `dialogRef`/`closeButtonRef` to the element and its close button.
 */
export function useModalDialog({ isOpen, onClose, triggerRef }: Options) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const hasOpenedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    hasOpenedRef.current = true;

    function handleCancel() {
      onCloseRef.current();
    }

    const root = document.documentElement;
    // html is the viewport scroll container in this app because globals.css sets
    // overflow-x: clip on html. Locking body would not prevent viewport scroll here.
    const previousOverflowY = root.style.overflowY;
    const previousPaddingInlineEnd = root.style.paddingInlineEnd;
    const scrollbarWidth = window.innerWidth - root.clientWidth;

    root.style.overflowY = 'hidden';
    if (scrollbarWidth > 0) {
      root.style.paddingInlineEnd = `${scrollbarWidth}px`;
    }

    dialog.addEventListener('cancel', handleCancel);

    if (!dialog.open) {
      dialog.showModal();
    }

    closeButtonRef.current?.focus();

    return () => {
      dialog.removeEventListener('cancel', handleCancel);

      if (dialog.open) {
        dialog.close();
      }

      root.style.overflowY = previousOverflowY;
      root.style.paddingInlineEnd = previousPaddingInlineEnd;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && hasOpenedRef.current) {
      triggerRef.current?.focus();
    }
  }, [isOpen, triggerRef]);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = getFocusableElements(dialog);
    if (focusableElements.length === 0) {
      event.preventDefault();
      closeButtonRef.current?.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;
    const isFocusInsideDialog =
      activeElement instanceof HTMLElement && dialog.contains(activeElement);

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

  function handleClick(event: ReactMouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (event.target !== dialog) {
      return;
    }

    const rect = dialog.getBoundingClientRect();
    const isBackdropClick =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (isBackdropClick) {
      onCloseRef.current();
    }
  }

  return {
    dialogRef,
    closeButtonRef,
    dialogProps: { onKeyDown: handleKeyDown, onClick: handleClick },
  };
}
