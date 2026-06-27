import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';

import { useChapterFragmentSync } from '@/hooks/useChapterFragmentSync';

function HookHarness({
  onActiveChapterChange,
}: {
  onActiveChapterChange?: (chapterId: string) => void;
}) {
  useChapterFragmentSync(onActiveChapterChange);
  return null;
}

function addChapterElements() {
  for (let i = 1; i <= 6; i += 1) {
    const section = document.createElement('section');
    section.id = `chapter-${i}`;
    document.body.append(section);
  }
}

describe('useChapterFragmentSync', () => {
  let callback: IntersectionObserverCallback | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();
  const unobserve = vi.fn();
  const takeRecords = vi.fn<() => IntersectionObserverEntry[]>(() => []);

  beforeEach(() => {
    document.body.innerHTML = '';
    addChapterElements();

    class IntersectionObserverMock {
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: ReadonlyArray<number> = [];

      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = unobserve;
      takeRecords = takeRecords;
    }

    vi.stubGlobal(
      'IntersectionObserver',
      IntersectionObserverMock as unknown as typeof IntersectionObserver
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('calls history.replaceState when a chapter intersects and never calls pushState', () => {
    const onActiveChapterChange = vi.fn();
    const replaceSpy = vi.spyOn(window.history, 'replaceState');
    const pushSpy = vi.spyOn(window.history, 'pushState');

    render(createElement(HookHarness, { onActiveChapterChange }));

    expect(callback).toBeDefined();

    callback?.(
      [
        {
          isIntersecting: true,
          target: document.getElementById('chapter-2') as Element,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver
    );

    expect(replaceSpy).toHaveBeenCalledWith(null, '', '#chapter-2');
    expect(pushSpy).not.toHaveBeenCalled();
    expect(onActiveChapterChange).toHaveBeenCalledWith('chapter-2');
  });

  it('uses only the first intersecting entry for fragment updates', () => {
    const replaceSpy = vi.spyOn(window.history, 'replaceState');

    render(createElement(HookHarness));

    callback?.(
      [
        {
          isIntersecting: true,
          target: document.getElementById('chapter-3') as Element,
        } as IntersectionObserverEntry,
        {
          isIntersecting: true,
          target: document.getElementById('chapter-4') as Element,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver
    );

    expect(replaceSpy).toHaveBeenCalledTimes(1);
    expect(replaceSpy).toHaveBeenCalledWith(null, '', '#chapter-3');
  });
});
