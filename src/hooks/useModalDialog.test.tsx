import { useRef } from 'react';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { useModalDialog } from '@/hooks/useModalDialog';

const originalDialogShowModal =
  globalThis.HTMLDialogElement?.prototype.showModal;
const originalDialogClose = globalThis.HTMLDialogElement?.prototype.close;

type HarnessProps = {
  isOpen: boolean;
  onClose: () => void;
  focusable?: boolean;
};

function Harness({ isOpen, onClose, focusable = true }: HarnessProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { dialogRef, closeButtonRef, dialogProps } = useModalDialog({
    isOpen,
    onClose,
    triggerRef,
  });

  return (
    <>
      <button ref={triggerRef} type="button">
        trigger
      </button>
      {isOpen ? (
        <dialog ref={dialogRef} aria-label="hook dialog" {...dialogProps}>
          {focusable ? (
            <>
              <button ref={closeButtonRef} type="button">
                close
              </button>
              <button type="button">middle</button>
              <button type="button">last</button>
            </>
          ) : (
            <p>no focusable elements</p>
          )}
        </dialog>
      ) : null}
    </>
  );
}

describe('useModalDialog', () => {
  beforeAll(() => {
    if (
      globalThis.HTMLDialogElement &&
      typeof globalThis.HTMLDialogElement.prototype.showModal !== 'function'
    ) {
      Object.defineProperty(
        globalThis.HTMLDialogElement.prototype,
        'showModal',
        {
          configurable: true,
          value() {
            this.setAttribute('open', '');
          },
        }
      );
    }

    if (
      globalThis.HTMLDialogElement &&
      typeof globalThis.HTMLDialogElement.prototype.close !== 'function'
    ) {
      Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
        configurable: true,
        value() {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        },
      });
    }
  });

  afterAll(() => {
    if (globalThis.HTMLDialogElement) {
      if (originalDialogShowModal) {
        Object.defineProperty(
          globalThis.HTMLDialogElement.prototype,
          'showModal',
          { configurable: true, value: originalDialogShowModal }
        );
      }

      if (originalDialogClose) {
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
          configurable: true,
          value: originalDialogClose,
        });
      }
    }
  });

  it('should open the dialog and focus the close button when isOpen becomes true', () => {
    render(<Harness isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'hook dialog' });
    expect(dialog).toHaveAttribute('open');
    expect(screen.getByRole('button', { name: 'close' })).toHaveFocus();
  });

  it('should lock viewport scroll when the dialog opens', () => {
    // jsdom does not perform layout or actual scroll locking. These assertions
    // verify the inline html styles are applied and restored, which is the
    // browser behavior we rely on in production.
    document.documentElement.style.overflowY = '';
    document.documentElement.style.paddingInlineEnd = '';

    render(<Harness isOpen onClose={vi.fn()} />);

    expect(document.documentElement.style.overflowY).toBe('hidden');
  });

  it('should restore viewport overflow and padding when the dialog closes', () => {
    document.documentElement.style.overflowY = '';
    document.documentElement.style.paddingInlineEnd = '';

    const { rerender, unmount } = render(<Harness isOpen onClose={vi.fn()} />);
    expect(document.documentElement.style.overflowY).toBe('hidden');

    rerender(<Harness isOpen={false} onClose={vi.fn()} />);

    expect(document.documentElement.style.overflowY).toBe('');
    expect(document.documentElement.style.paddingInlineEnd).toBe('');

    unmount();

    expect(document.documentElement.style.overflowY).toBe('');
    expect(document.documentElement.style.paddingInlineEnd).toBe('');
  });

  it('should close the dialog and restore focus to the trigger when isOpen becomes false', () => {
    const { rerender } = render(<Harness isOpen onClose={vi.fn()} />);

    rerender(<Harness isOpen={false} onClose={vi.fn()} />);

    expect(
      screen.queryByRole('dialog', { name: 'hook dialog' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'trigger' })).toHaveFocus();
  });

  it('should invoke onClose when the dialog emits a cancel event', () => {
    const onClose = vi.fn();
    render(<Harness isOpen onClose={onClose} />);

    fireEvent(
      screen.getByRole('dialog', { name: 'hook dialog' }),
      new Event('cancel', { cancelable: true })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should invoke onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<Harness isOpen onClose={onClose} />);

    const dialog = screen.getByRole('dialog', { name: 'hook dialog' });
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      top: 50,
      right: 250,
      bottom: 250,
      left: 50,
      toJSON: () => ({}),
    });

    fireEvent.click(dialog, { clientX: 10, clientY: 10 });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not invoke onClose when clicking the dialog content', () => {
    const onClose = vi.fn();
    render(<Harness isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'middle' }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should wrap focus to the first element when tabbing past the last', () => {
    render(<Harness isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'hook dialog' });
    const closeButton = screen.getByRole('button', { name: 'close' });
    screen.getByRole('button', { name: 'last' }).focus();

    fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(closeButton).toHaveFocus();
  });

  it('should wrap focus to the last element on shift+tab from the first', () => {
    render(<Harness isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'hook dialog' });
    const closeButton = screen.getByRole('button', { name: 'close' });
    closeButton.focus();

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
  });

  it('should pull focus into the dialog when a tab originates outside it', () => {
    render(<Harness isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'hook dialog' });
    screen.getByRole('button', { name: 'trigger' }).focus();

    fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(screen.getByRole('button', { name: 'close' })).toHaveFocus();
  });

  it('should pull focus to the last element on shift+tab from outside the dialog', () => {
    render(<Harness isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'hook dialog' });
    screen.getByRole('button', { name: 'trigger' }).focus();

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
  });

  it('should ignore keys other than Tab', () => {
    render(<Harness isOpen onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'hook dialog' });
    const closeButton = screen.getByRole('button', { name: 'close' });
    closeButton.focus();

    const event = createEvent.keyDown(dialog, { key: 'Enter' });
    fireEvent(dialog, event);

    expect(event.defaultPrevented).toBe(false);
    expect(closeButton).toHaveFocus();
  });

  it('should prevent default tabbing when the dialog has no focusable elements', () => {
    render(<Harness isOpen onClose={vi.fn()} focusable={false} />);

    const dialog = screen.getByRole('dialog', { name: 'hook dialog' });
    const event = createEvent.keyDown(dialog, { key: 'Tab' });
    fireEvent(dialog, event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('should call the latest onClose without re-running the open effect when onClose changes', () => {
    const firstOnClose = vi.fn();
    const secondOnClose = vi.fn();
    const { rerender } = render(<Harness isOpen onClose={firstOnClose} />);

    const dialog = screen.getByRole('dialog', {
      name: 'hook dialog',
    }) as HTMLDialogElement;
    const closeSpy = vi.spyOn(dialog, 'close');

    rerender(<Harness isOpen onClose={secondOnClose} />);

    expect(closeSpy).not.toHaveBeenCalled();

    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    expect(secondOnClose).toHaveBeenCalledTimes(1);
    expect(firstOnClose).not.toHaveBeenCalled();
  });
});
