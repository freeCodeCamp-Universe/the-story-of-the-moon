import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useKeyboardNav } from '@/hooks/useKeyboardNav';

function KeyboardNavHarness({
  shortcutsEnabled = true,
}: {
  shortcutsEnabled?: boolean;
}) {
  useKeyboardNav(shortcutsEnabled);
  return null;
}

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

describe('useKeyboardNav', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '#chapter-2';
  });

  afterEach(() => {
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('should navigate to chapters with the global keyboard shortcuts when they are enabled', () => {
    const scrollSpies = setupChapterTargets();

    render(<KeyboardNavHarness />);

    fireEvent.keyDown(window, { key: '4' });
    fireEvent.keyDown(window, { key: 'N', shiftKey: true });

    expect(scrollSpies.get('chapter-4')).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
    expect(scrollSpies.get('chapter-3')).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  it('should ignore the global printable-key shortcuts when they are disabled', () => {
    const scrollSpies = setupChapterTargets();

    render(<KeyboardNavHarness shortcutsEnabled={false} />);

    fireEvent.keyDown(window, { key: '4' });
    fireEvent.keyDown(window, { key: 'N', shiftKey: true });

    expect(scrollSpies.get('chapter-4')).not.toHaveBeenCalled();
    expect(scrollSpies.get('chapter-3')).not.toHaveBeenCalled();
  });
});
