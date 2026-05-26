import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useViewportActivity } from '@/hooks/useViewportActivity';

function createIntersectionEntry({
  isIntersecting,
  target,
}: {
  isIntersecting: boolean;
  target: Element;
}): IntersectionObserverEntry {
  return {
    time: 0,
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: {} as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: null,
  };
}

function HookHarness({
  rootMargin,
  threshold,
}: {
  rootMargin?: string;
  threshold?: number | number[];
}) {
  const { targetRef, isNearViewport, isVisible } = useViewportActivity<HTMLDivElement>({
    rootMargin,
    threshold,
  });

  return (
    <div
      ref={targetRef}
      data-testid='target'
      data-near-viewport={String(isNearViewport)}
      data-visible={String(isVisible)}
    />
  );
}

describe('useViewportActivity', () => {
  let callback: IntersectionObserverCallback | undefined;
  let observerOptions: IntersectionObserverInit | undefined;
  let documentHidden = false;
  const observe = vi.fn();
  const disconnect = vi.fn();
  const unobserve = vi.fn();
  const takeRecords = vi.fn<() => IntersectionObserverEntry[]>(() => []);

  beforeEach(() => {
    callback = undefined;
    observerOptions = undefined;
    documentHidden = false;
    observe.mockReset();
    disconnect.mockReset();
    unobserve.mockReset();
    takeRecords.mockReset();

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => documentHidden,
    });

    class IntersectionObserverMock {
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: ReadonlyArray<number> = [];

      constructor(cb: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
        callback = cb;
        observerOptions = options;
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

  it('should observe the target element and combine viewport and document visibility', () => {
    const { unmount } = render(<HookHarness rootMargin='200px' threshold={0.25} />);
    const target = screen.getByTestId('target');

    expect(observe).toHaveBeenCalledWith(target);
    expect(observerOptions).toEqual({
      root: null,
      rootMargin: '200px',
      threshold: 0.25,
    });
    expect(target).toHaveAttribute('data-near-viewport', 'false');
    expect(target).toHaveAttribute('data-visible', 'false');

    act(() => {
      callback?.(
        [
          createIntersectionEntry({
            isIntersecting: true,
            target,
          }),
        ],
        {} as IntersectionObserver
      );
    });

    expect(target).toHaveAttribute('data-near-viewport', 'true');
    expect(target).toHaveAttribute('data-visible', 'true');

    act(() => {
      documentHidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(target).toHaveAttribute('data-near-viewport', 'true');
    expect(target).toHaveAttribute('data-visible', 'false');

    act(() => {
      documentHidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(target).toHaveAttribute('data-visible', 'true');

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('should treat the target as near the viewport when IntersectionObserver is unavailable', () => {
    vi.unstubAllGlobals();
    documentHidden = true;

    render(<HookHarness />);

    const target = screen.getByTestId('target');

    expect(target).toHaveAttribute('data-near-viewport', 'true');
    expect(target).toHaveAttribute('data-visible', 'false');
  });
});
