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

  it('should render the title and content and focus the title when opened', async () => {
    const user = userEvent.setup();

    render(<DrawerHarness />);

    await user.click(screen.getByRole('button', { name: 'open drawer' }));

    expect(
      screen.getByRole('dialog', { name: 'Test drawer' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'first action' })
    ).toBeInTheDocument();
    // Focus lands on the title so the drawer's list content reads from the top.
    expect(screen.getByRole('heading', { name: 'Test drawer' })).toHaveFocus();
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

    // Opens with the title focused; the close button is the first tab stop.
    expect(screen.getByRole('heading', { name: 'Test drawer' })).toHaveFocus();

    await user.tab();
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

  it('should stay mounted through the slide-out and unmount when it ends', async () => {
    const user = userEvent.setup();

    // jsdom applies no stylesheet, so the drawer normally reports a 0s exit and
    // unmounts at once. Force a real duration to exercise the deferred path.
    const originalGetComputedStyle = window.getComputedStyle.bind(window);
    const getComputedStyleSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockImplementation((element, pseudoElement) => {
        const style = originalGetComputedStyle(element, pseudoElement);
        Object.defineProperty(style, 'transitionDuration', {
          configurable: true,
          value: '0.3s',
        });
        return style;
      });

    // jsdom's fireEvent.transitionEnd omits propertyName, so build the event by
    // hand to exercise the property/target guards the way a browser fires them.
    const transitionEnd = (target: Element, propertyName: string) => {
      const event = new Event('transitionend', { bubbles: true });
      Object.defineProperty(event, 'propertyName', { value: propertyName });
      fireEvent(target, event);
    };

    render(<DrawerHarness />);

    await user.click(screen.getByRole('button', { name: 'open drawer' }));
    const drawer = screen.getByRole('dialog', { name: 'Test drawer' });
    const childRow = screen.getByRole('button', { name: 'first action' });

    await user.click(
      screen.getByRole('button', { name: /close test drawer/i })
    );

    // Still in the DOM while the panel slides out.
    expect(drawer).toBeInTheDocument();

    // A child row's transform transition bubbling up must not cut it short.
    transitionEnd(childRow, 'transform');
    expect(drawer).toBeInTheDocument();

    // Neither should a non-transform transition on the panel itself.
    transitionEnd(drawer, 'background-color');
    expect(drawer).toBeInTheDocument();

    // The panel's own transform landing unmounts it.
    transitionEnd(drawer, 'transform');
    expect(drawer).not.toBeInTheDocument();

    getComputedStyleSpy.mockRestore();
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
