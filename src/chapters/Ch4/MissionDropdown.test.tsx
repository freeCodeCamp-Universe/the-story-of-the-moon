import { useRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MissionDropdown, type JumpItem } from '@/chapters/Ch4/MissionDropdown';

const items: JumpItem[] = [
  { label: 'Apollo 8 · Dec 21–27, 1968', isInterlude: false },
  { label: 'Apollo 9 · Mar 3–13, 1969', isInterlude: false },
  { label: 'Interlude', isInterlude: true },
  { label: 'Artemis II · Apr 1–10, 2026', isInterlude: false },
];

function Harness({ activeIndex = 0 }: { activeIndex?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setIsOpen(true)}>
        open menu
      </button>
      <span data-testid="selected">{selected === null ? 'none' : String(selected)}</span>
      <MissionDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} items={items} activeIndex={activeIndex} onSelect={(index) => setSelected(index)} />
    </>
  );
}

describe('MissionDropdown', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should not render any rows while closed', () => {
    render(<Harness />);

    expect(screen.queryByRole('button', { name: 'Apollo 8 · Dec 21–27, 1968' })).not.toBeInTheDocument();
  });

  it('should render one button row per item with interlude exposed as a neutral row name', async () => {
    const user = userEvent.setup();

    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'open menu' }));

    expect(screen.getByRole('button', { name: 'Apollo 8 · Dec 21–27, 1968' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apollo 9 · Mar 3–13, 1969' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Interlude' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Artemis II · Apr 1–10, 2026' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Fifty-three years pass/i })).not.toBeInTheDocument();
    expect(screen.getByText('···')).toBeInTheDocument();
  });

  it('should mark the active row with aria-current="step" and focus it', async () => {
    const user = userEvent.setup();

    render(<Harness activeIndex={1} />);
    await user.click(screen.getByRole('button', { name: 'open menu' }));

    const activeRow = screen.getByRole('button', { name: 'Apollo 9 · Mar 3–13, 1969' });
    expect(activeRow).toHaveAttribute('aria-current', 'step');
    expect(activeRow).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Apollo 8 · Dec 21–27, 1968' })).not.toHaveAttribute('aria-current');
  });

  it('should mark the interlude row as the active step when it is the active index', async () => {
    const user = userEvent.setup();

    render(<Harness activeIndex={2} />);
    await user.click(screen.getByRole('button', { name: 'open menu' }));

    const interludeRow = screen.getByRole('button', { name: 'Interlude' });
    expect(interludeRow).toHaveAttribute('aria-current', 'step');
    expect(interludeRow).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Apollo 9 · Mar 3–13, 1969' })).not.toHaveAttribute('aria-current');
  });

  it('should call onSelect with the interlude row index when that row is clicked', async () => {
    const user = userEvent.setup();

    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'open menu' }));
    await user.click(screen.getByRole('button', { name: 'Interlude' }));

    expect(screen.getByTestId('selected')).toHaveTextContent('2');
  });

  it('should close on Escape', async () => {
    const user = userEvent.setup();

    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'open menu' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('button', { name: 'Apollo 8 · Dec 21–27, 1968' })).not.toBeInTheDocument();
  });

  it('should close on outside pointerdown', async () => {
    const user = userEvent.setup();

    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'open menu' }));
    await user.pointer({ target: document.body, keys: '[MouseLeft]' });

    expect(screen.queryByRole('button', { name: 'Apollo 8 · Dec 21–27, 1968' })).not.toBeInTheDocument();
  });
});
