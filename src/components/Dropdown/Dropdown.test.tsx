import { createRef, type RefObject } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Dropdown } from './Dropdown';

function DropdownHarness({
  isOpen = true,
  onClose = vi.fn(),
  onChildClick = vi.fn(),
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onChildClick?: () => void;
}) {
  const triggerRef = createRef<HTMLButtonElement>();
  const initialFocusRef = createRef<HTMLButtonElement>();

  return (
    <>
      <button ref={triggerRef} type="button">
        Open chapter list
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={onClose}
        triggerRef={triggerRef as RefObject<HTMLElement | null>}
        id="dropdown-panel"
        initialFocusRef={initialFocusRef as RefObject<HTMLElement | null>}
      >
        <button ref={initialFocusRef} type="button" onClick={onChildClick}>
          Active chapter
        </button>
        <button type="button">Other chapter</button>
      </Dropdown>
    </>
  );
}

describe('Dropdown', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render nothing when closed', () => {
    render(<DropdownHarness isOpen={false} />);

    expect(
      screen.queryByRole('button', { name: 'Active chapter' })
    ).not.toBeInTheDocument();
  });

  it('should render children and focus the initial focus ref when open', () => {
    render(<DropdownHarness isOpen />);

    expect(
      screen.getByRole('button', { name: 'Active chapter' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Active chapter' })
    ).toHaveFocus();
  });

  it('should call the child button handler when clicked', async () => {
    const user = userEvent.setup();
    const onChildClick = vi.fn();

    render(<DropdownHarness onChildClick={onChildClick} />);

    await user.click(screen.getByRole('button', { name: 'Active chapter' }));

    expect(onChildClick).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<DropdownHarness onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close on outside pointerdown but not on panel children or the trigger', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<DropdownHarness onClose={onClose} />);

    await user.pointer({
      target: screen.getByRole('button', { name: 'Active chapter' }),
      keys: '[MouseLeft]',
    });
    await user.pointer({
      target: screen.getByRole('button', { name: 'Open chapter list' }),
      keys: '[MouseLeft]',
    });

    expect(onClose).not.toHaveBeenCalled();

    await user.pointer({ target: document.body, keys: '[MouseLeft]' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
