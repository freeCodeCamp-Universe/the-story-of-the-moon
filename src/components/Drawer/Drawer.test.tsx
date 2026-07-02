import { useRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { Drawer } from '@/components/Drawer/Drawer';

const originalDialogShowModal =
  globalThis.HTMLDialogElement?.prototype.showModal;
const originalDialogClose = globalThis.HTMLDialogElement?.prototype.close;

function DrawerHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}>
        open drawer
      </button>
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
        id="test-drawer"
        titleId="test-drawer-title"
        title="Test drawer"
        closeLabel="close test drawer"
      >
        <button type="button">first action</button>
        <button type="button">second action</button>
      </Drawer>
    </>
  );
}

describe('Drawer', () => {
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

  it('should not render the drawer while closed', () => {
    render(<DrawerHarness />);

    expect(
      screen.queryByRole('dialog', { name: 'Test drawer' })
    ).not.toBeInTheDocument();
  });

  it('should render the title and content and focus the close button when opened', async () => {
    const user = userEvent.setup();

    render(<DrawerHarness />);

    await user.click(screen.getByRole('button', { name: 'open drawer' }));

    expect(
      screen.getByRole('dialog', { name: 'Test drawer' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'first action' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /close test drawer/i })
    ).toHaveFocus();
  });

  it('should close and restore focus to the trigger when the close button is clicked', async () => {
    const user = userEvent.setup();

    render(<DrawerHarness />);

    const trigger = screen.getByRole('button', { name: 'open drawer' });
    await user.click(trigger);

    await user.click(
      screen.getByRole('button', { name: /close test drawer/i })
    );

    expect(
      screen.queryByRole('dialog', { name: 'Test drawer' })
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('should trap Tab focus within the drawer', async () => {
    const user = userEvent.setup();

    render(<DrawerHarness />);

    await user.click(screen.getByRole('button', { name: 'open drawer' }));

    const closeButton = screen.getByRole('button', {
      name: /close test drawer/i,
    });
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
    render(<DrawerHarness />);

    const trigger = screen.getByRole('button', { name: 'open drawer' });
    fireEvent.click(trigger);

    const drawer = screen.getByRole('dialog', { name: 'Test drawer' });
    fireEvent(drawer, new Event('cancel', { cancelable: true }));

    expect(
      screen.queryByRole('dialog', { name: 'Test drawer' })
    ).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('should close when the backdrop is clicked', () => {
    render(<DrawerHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'open drawer' }));

    const drawer = screen.getByRole('dialog', { name: 'Test drawer' });
    vi.spyOn(drawer, 'getBoundingClientRect').mockReturnValue({
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

    fireEvent.click(drawer, { clientX: 10, clientY: 10 });

    expect(
      screen.queryByRole('dialog', { name: 'Test drawer' })
    ).not.toBeInTheDocument();
  });
});
