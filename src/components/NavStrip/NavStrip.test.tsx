import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NavStrip from '@/components/NavStrip';

function setupChapterTargets() {
  const scrollSpies = new Map<string, ReturnType<typeof vi.fn>>();

  for (let i = 1; i <= 7; i += 1) {
    const id = `chapter-${i}`;
    const section = document.createElement('section');
    section.id = id;
    const scrollSpy = vi.fn();
    section.scrollIntoView = scrollSpy;
    scrollSpies.set(id, scrollSpy);
    document.body.append(section);
  }

  return scrollSpies;
}

describe('NavStrip', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the story title and omits previous and next buttons', () => {
    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} />);

    expect(screen.getByText('The Story of the Moon')).toBeInTheDocument();
    expect(screen.queryByLabelText('previous chapter')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('next chapter')).not.toBeInTheDocument();
  });

  it('opens the chapter dropdown and navigates to the selected chapter', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const scrollSpies = setupChapterTargets();

    render(<NavStrip activeChapterId="chapter-2" onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: /open chapter list/i }));
    await user.click(screen.getByRole('button', { name: '3. A partner that steadies us' }));

    expect(onNavigate).toHaveBeenCalledWith('chapter-3');
    expect(scrollSpies.get('chapter-3')).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('closes the chapter dropdown when clicking elsewhere in the nav', async () => {
    const user = userEvent.setup();

    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /open chapter list/i }));
    expect(screen.getByRole('button', { name: '3. A partner that steadies us' })).toBeInTheDocument();

    await user.click(screen.getByText('The Story of the Moon'));

    expect(screen.queryByRole('button', { name: '3. A partner that steadies us' })).not.toBeInTheDocument();
  });
});
