import { useEffect, useRef } from 'react';

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

export function Dropdown({
  isOpen,
  onClose,
  triggerRef,
  id,
  className,
  overlayClassName,
  initialFocusRef,
  ariaLabel,
  children,
}: DropdownProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

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
  }, [isOpen, onClose, triggerRef, initialFocusRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className={overlayClassName} aria-hidden="true" onClick={onClose} />
      <div ref={panelRef} id={id} className={className} aria-label={ariaLabel}>
        {children}
      </div>
    </>
  );
}
