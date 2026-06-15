import type { RefObject } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChapterDropdown } from './ChapterDropdown';

function createTriggerRef(): RefObject<HTMLElement | null> {
  const trigger = document.createElement('div');
  document.body.append(trigger);

  return { current: trigger };
}

function renderDropdown({
  isOpen = true,
  activeChapterId = 'chapter-3',
}: {
  isOpen?: boolean;
  activeChapterId?: string;
} = {}) {
  const triggerRef = createTriggerRef();
  const onSelect = vi.fn();
  const onClose = vi.fn();

  render(<ChapterDropdown isOpen={isOpen} activeChapterId={activeChapterId} onSelect={onSelect} onClose={onClose} triggerRef={triggerRef} />);

  return { triggerRef, onSelect, onClose };
}

describe('ChapterDropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render nothing while closed', () => {
    renderDropdown({ isOpen: false });

    expect(screen.queryByRole('button', { name: '1. A violent beginning, perhaps' })).not.toBeInTheDocument();
  });

  it('should render the chapter list and focus the active chapter', () => {
    renderDropdown({ activeChapterId: 'chapter-3' });

    expect(screen.getAllByRole('button')).toHaveLength(7);
    expect(screen.getByRole('button', { name: '3. A partner that steadies Earth' })).toHaveFocus();
  });

  it('should call onSelect with the clicked chapter id', async () => {
    const user = userEvent.setup();
    const { onSelect } = renderDropdown({ activeChapterId: 'chapter-2' });

    await user.click(screen.getByRole('button', { name: '5. What the rocks told us' }));

    expect(onSelect).toHaveBeenCalledWith('chapter-5');
  });

  it('should close on Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDropdown();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close on outside pointerdown but ignore the trigger and panel', async () => {
    const user = userEvent.setup();
    const { onClose, triggerRef } = renderDropdown();
    const activeChapter = screen.getByRole('button', {
      name: '3. A partner that steadies Earth',
    });

    await user.pointer({ target: activeChapter, keys: '[MouseLeft]' });
    if (!triggerRef.current) {
      throw new Error('Expected a trigger element.');
    }
    await user.pointer({ target: triggerRef.current, keys: '[MouseLeft]' });

    expect(onClose).not.toHaveBeenCalled();

    await user.pointer({ target: document.body, keys: '[MouseLeft]' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
