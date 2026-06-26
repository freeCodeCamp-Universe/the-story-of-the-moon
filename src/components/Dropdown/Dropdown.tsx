import { useEffect, useRef } from 'react';

import styles from './Dropdown.module.css';

export type DropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  id: string;
  className?: string;
  overlayClassName?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  ariaLabel?: string;
  children: React.ReactNode;
};

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Dropdown({ isOpen, onClose, triggerRef, id, className, overlayClassName, initialFocusRef, ariaLabel, children }: DropdownProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const initialFocusTarget = initialFocusRef?.current;
    if (initialFocusTarget) {
      initialFocusTarget.focus();
    } else {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;

      onCloseRef.current();
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, triggerRef, initialFocusRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className={overlayClassName} aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} id={id} className={[styles.panel, className].filter(Boolean).join(' ')} aria-label={ariaLabel}>
        {children}
      </div>
    </>
  );
}
