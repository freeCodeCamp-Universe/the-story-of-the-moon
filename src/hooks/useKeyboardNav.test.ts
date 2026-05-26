import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';

import { scrollToChapter, useKeyboardNav } from '@/hooks/useKeyboardNav';

function HookHarness() {
  useKeyboardNav();
  return null;
}

function setupChapters() {
  const scrollSpies = new Map<string, ReturnType<typeof vi.fn>>();

  for (let i = 1; i <= 9; i += 1) {
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

function pressKey(key: string, target: EventTarget = document.body, init: KeyboardEventInit = {}) {
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
    vi.restoreAllMocks();
  });

  it('keys 1-7 jump to the matching chapter and higher digits are ignored', () => {
    const scrollSpies = setupChapters();
    render(createElement(HookHarness));

    for (let i = 1; i <= 7; i += 1) {
      pressKey(String(i));
      expect(scrollSpies.get(`chapter-${i}`)).toHaveBeenCalledWith({
        behavior: 'smooth',
      });
    }

    pressKey('8');
    pressKey('9');

    expect(scrollSpies.get('chapter-8')).not.toHaveBeenCalled();
    expect(scrollSpies.get('chapter-9')).not.toHaveBeenCalled();
  });

  it('shift+n and shift+p move to the next or previous chapter from the current hash', () => {
    const scrollSpies = setupChapters();
    render(createElement(HookHarness));

    window.location.hash = '#chapter-3';
    pressKey('N', document.body, { shiftKey: true });

    window.location.hash = '#chapter-4';
    pressKey('P', document.body, { shiftKey: true });

    expect(scrollSpies.get('chapter-4')).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
    expect(scrollSpies.get('chapter-3')).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  it('ignores shift+n and shift+p when there is no adjacent chapter', () => {
    const scrollSpies = setupChapters();
    render(createElement(HookHarness));

    window.location.hash = '#chapter-1';
    pressKey('P', document.body, { shiftKey: true });

    window.location.hash = '#chapter-7';
    pressKey('N', document.body, { shiftKey: true });

    for (const spy of scrollSpies.values()) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('does not handle keys when focus is on an input', () => {
    const scrollSpies = setupChapters();
    const input = document.createElement('input');
    document.body.append(input);
    render(createElement(HookHarness));

    pressKey('1', input);

    for (const spy of scrollSpies.values()) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('ignores plain n and p', () => {
    const scrollSpies = setupChapters();
    render(createElement(HookHarness));

    pressKey('n');
    pressKey('p');

    for (const spy of scrollSpies.values()) {
      expect(spy).not.toHaveBeenCalled();
    }
  });

  it('scrollToChapter ignores out-of-range indexes', () => {
    const getElementByIdSpy = vi.spyOn(document, 'getElementById');

    scrollToChapter(-1);
    scrollToChapter(9);

    expect(getElementByIdSpy).not.toHaveBeenCalled();
  });
});
