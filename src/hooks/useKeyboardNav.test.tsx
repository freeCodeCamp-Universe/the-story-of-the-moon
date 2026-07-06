import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  scrollToChapter,
  scrollToSectionId,
  useKeyboardNav,
} from '@/hooks/useKeyboardNav';

function KeyboardNavHarness({
  shortcutsEnabled = true,
}: {
  shortcutsEnabled?: boolean;
}) {
  useKeyboardNav(shortcutsEnabled);
  return null;
}

function setupChapters() {
  const scrollSpies = new Map<string, ReturnType<typeof vi.fn>>();

  for (let i = 1; i <= 9; i += 1) {
    const id = `chapter-${i}`;
    const section = document.createElement('section');
    section.id = id;
    section.tabIndex = -1;
    const scrollSpy = vi.fn();
    section.scrollIntoView = scrollSpy;
    scrollSpies.set(id, scrollSpy);
    document.body.append(section);
  }

  return scrollSpies;
}

function pressKey(
  key: string,
  target: EventTarget = document.body,
  init: KeyboardEventInit = {}
) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
}

describe('useKeyboardNav', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '#chapter-1';
  });

  afterEach(() => {
    // Cancel any settle watcher a scroll call left armed, so its timers and
    // window listeners cannot leak into the next test.
    window.dispatchEvent(new Event('wheel'));
    window.location.hash = '';
    vi.restoreAllMocks();
  });

  it('should jump to the matching chapter for keys 1-7 and ignore higher digits', () => {
    const scrollSpies = setupChapters();
    render(<KeyboardNavHarness />);

    for (let i = 1; i <= 7; i += 1) {
      pressKey(String(i));
      expect(scrollSpies.get(`chapter-${i}`)).toHaveBeenCalledWith({
        block: 'start',
        behavior: 'smooth',
      });
    }

    pressKey('8');
    pressKey('9');

    expect(scrollSpies.get('chapter-8')).not.toHaveBeenCalled();
    expect(scrollSpies.get('chapter-9')).not.toHaveBeenCalled();
  });

  it('should move focus to the target chapter so screen readers announce it', () => {
    setupChapters();
    render(<KeyboardNavHarness />);

    pressKey('3');

    expect(document.activeElement).toBe(document.getElementById('chapter-3'));

    window.location.hash = '#chapter-3';
    pressKey('N', document.body, { shiftKey: true });

    expect(document.activeElement).toBe(document.getElementById('chapter-4'));
  });

  it('should move to the next or previous chapter with shift+n and shift+p from the current hash', () => {
    const scrollSpies = setupChapters();
    render(<KeyboardNavHarness />);

    window.location.hash = '#chapter-3';
    pressKey('N', document.body, { shiftKey: true });

    window.location.hash = '#chapter-4';
    pressKey('P', document.body, { shiftKey: true });

    expect(scrollSpies.get('chapter-4')).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'smooth',
    });
    expect(scrollSpies.get('chapter-3')).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'smooth',
    });
  });

  it('should ignore shift+n and shift+p when there is no adjacent chapter', () => {
    const scrollSpies = setupChapters();
    render(<KeyboardNavHarness />);

    window.location.hash = '#chapter-1';
    pressKey('P', document.body, { shiftKey: true });

    window.location.hash = '#chapter-7';
    pressKey('N', document.body, { shiftKey: true });

    for (const spy of scrollSpies.values()) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('should not handle keys when focus is on an input', () => {
    const scrollSpies = setupChapters();
    const input = document.createElement('input');
    document.body.append(input);
    render(<KeyboardNavHarness />);

    pressKey('1', input);

    for (const spy of scrollSpies.values()) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('should handle global shortcuts when focus is on a button', () => {
    const scrollSpies = setupChapters();
    const button = document.createElement('button');
    document.body.append(button);
    render(<KeyboardNavHarness />);

    pressKey('2', button);

    window.location.hash = '#chapter-3';
    pressKey('N', button, { shiftKey: true });

    window.location.hash = '#chapter-4';
    pressKey('P', button, { shiftKey: true });

    expect(scrollSpies.get('chapter-2')).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'smooth',
    });
    expect(scrollSpies.get('chapter-4')).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'smooth',
    });
    expect(scrollSpies.get('chapter-3')).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'smooth',
    });
  });

  it('should ignore plain n and p', () => {
    const scrollSpies = setupChapters();
    render(<KeyboardNavHarness />);

    pressKey('n');
    pressKey('p');

    for (const spy of scrollSpies.values()) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('should ignore the global shortcuts when they are disabled', () => {
    const scrollSpies = setupChapters();
    render(<KeyboardNavHarness shortcutsEnabled={false} />);

    pressKey('4');
    window.location.hash = '#chapter-4';
    pressKey('N', document.body, { shiftKey: true });

    for (const spy of scrollSpies.values()) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('should ignore out-of-range indexes in scrollToChapter', () => {
    const getElementByIdSpy = vi.spyOn(document, 'getElementById');

    scrollToChapter(-1);
    scrollToChapter(9);

    expect(getElementByIdSpy).not.toHaveBeenCalled();
  });

  // Landing correction, drift guards, and reduced motion are covered by
  // settleScrollIntoView's own tests; here only the delegation is asserted.
  describe('scrollToSectionId', () => {
    function setupSection() {
      const section = document.createElement('section');
      section.id = 'ch2-basin-heading';
      const scrollSpy = vi.fn();
      section.scrollIntoView = scrollSpy;
      document.body.append(section);
      return scrollSpy;
    }

    it('should scroll the section into view when no chapter claims the event', () => {
      const scrollSpy = setupSection();

      scrollToSectionId('ch2-basin-heading');

      expect(scrollSpy).toHaveBeenCalledWith({
        block: 'start',
        behavior: 'smooth',
      });
    });

    it('should not scroll when a chapter claims the event', () => {
      const scrollSpy = setupSection();
      const claim = (event: Event) => event.preventDefault();
      window.addEventListener('story:section-nav', claim);

      scrollToSectionId('ch2-basin-heading');
      window.removeEventListener('story:section-nav', claim);

      expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('should focus the target so screen readers announce it, making it focusable first', () => {
      setupSection();

      scrollToSectionId('ch2-basin-heading');

      const target = document.getElementById('ch2-basin-heading');
      expect(target).toHaveAttribute('tabindex', '-1');
      expect(target).toHaveFocus();
    });

    it('should focus the target even when a chapter claims the scroll', () => {
      setupSection();
      const claim = (event: Event) => event.preventDefault();
      window.addEventListener('story:section-nav', claim);

      scrollToSectionId('ch2-basin-heading');
      window.removeEventListener('story:section-nav', claim);

      expect(document.getElementById('ch2-basin-heading')).toHaveFocus();
    });
  });
});
