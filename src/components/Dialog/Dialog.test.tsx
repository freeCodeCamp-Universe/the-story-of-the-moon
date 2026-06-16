import { useRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { Dialog } from '@/components/Dialog/Dialog';

const originalDialogShowModal = globalThis.HTMLDialogElement?.prototype.showModal;
const originalDialogClose = globalThis.HTMLDialogElement?.prototype.close;

type DialogHarnessProps = {
  variant?: 'default' | 'fluid';
};

function DialogHarness({ variant }: DialogHarnessProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}>
        open dialog
      </button>
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} id="test-dialog" titleId="test-dialog-title" title="Test dialog" closeLabel="close test dialog" variant={variant}>
        <button type="button">first action</button>
        <button type="button">second action</button>
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  beforeAll(() => {
    if (globalThis.HTMLDialogElement && typeof globalThis.HTMLDialogElement.prototype.showModal !== 'function') {
      Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'showModal', {
        configurable: true,
        value() {
          this.setAttribute('open', '');
        },
      });
    }

    if (globalThis.HTMLDialogElement && typeof globalThis.HTMLDialogElement.prototype.close !== 'function') {
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
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'showModal', { configurable: true, value: originalDialogShowModal });
      }

      if (originalDialogClose) {
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', { configurable: true, value: originalDialogClose });
      }
    }
  });

  it('should not render the dialog while closed', () => {
    render(<DialogHarness />);

    expect(screen.queryByRole('dialog', { name: 'Test dialog' })).not.toBeInTheDocument();
  });

  it('should render the title and content and focus the close button when opened', async () => {
    const user = userEvent.setup();

    render(<DialogHarness />);

    await user.click(screen.getByRole('button', { name: 'open dialog' }));

    expect(screen.getByRole('dialog', { name: 'Test dialog' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'first action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close test dialog/i })).toHaveFocus();
  });

  it('should close and restore focus to the trigger when the close button is clicked', async () => {
    const user = userEvent.setup();

    render(<DialogHarness />);

    const trigger = screen.getByRole('button', { name: 'open dialog' });
    await user.click(trigger);

    await user.click(screen.getByRole('button', { name: /close test dialog/i }));

    expect(screen.queryByRole('dialog', { name: 'Test dialog' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('should trap Tab focus within the dialog', async () => {
    const user = userEvent.setup();

    render(<DialogHarness />);

    await user.click(screen.getByRole('button', { name: 'open dialog' }));

    const closeButton = screen.getByRole('button', { name: /close test dialog/i });
    const firstAction = screen.getByRole('button', { name: 'first action' });
    const secondAction = screen.getByRole('button', { name: 'second action' });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(firstAction).toHaveFocus();

    await user.tab();
    expect(secondAction).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(secondAction).toHaveFocus();
  });

  it('should restore focus to the trigger when dismissed by the browser', () => {
    render(<DialogHarness />);

    const trigger = screen.getByRole('button', { name: 'open dialog' });
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Test dialog' });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    expect(screen.queryByRole('dialog', { name: 'Test dialog' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('should close when the backdrop is clicked', () => {
    render(<DialogHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'open dialog' }));

    const dialog = screen.getByRole('dialog', { name: 'Test dialog' });
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

    expect(screen.queryByRole('dialog', { name: 'Test dialog' })).not.toBeInTheDocument();
  });

  it('should keep an accessible name while visually hiding the title in the fluid variant', async () => {
    const user = userEvent.setup();

    render(<DialogHarness variant="fluid" />);

    await user.click(screen.getByRole('button', { name: 'open dialog' }));

    expect(screen.getByRole('dialog', { name: 'Test dialog' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test dialog' })).toHaveClass('sr-only');

    await user.click(screen.getByRole('button', { name: /close test dialog/i }));

    expect(screen.queryByRole('dialog', { name: 'Test dialog' })).not.toBeInTheDocument();
  });
});
