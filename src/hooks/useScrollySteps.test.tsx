import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';

import { useScrollySteps } from '@/hooks/useScrollySteps';

function createIntersectionEntry({
  isIntersecting,
  target,
  rootBoundsHeight = 1000,
  top = 0,
  height = 0,
}: {
  isIntersecting: boolean;
  target: Element;
  rootBoundsHeight?: number;
  top?: number;
  height?: number;
}): IntersectionObserverEntry {
  return {
    time: 0,
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: { top, height } as DOMRectReadOnly,
    intersectionRect: {} as DOMRectReadOnly,
    rootBounds: { height: rootBoundsHeight } as DOMRectReadOnly,
  };
}

function HookHarness({
  initialStepId,
  stepIds = ['step-1', 'step-2', 'step-3'],
}: {
  initialStepId?: string;
  stepIds?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStepId = useScrollySteps(containerRef, stepIds, initialStepId);

  return (
    <>
      <output data-testid="active-step">{activeStepId ?? 'null'}</output>
      <div ref={containerRef}>
        {stepIds.map((stepId) => (
          <div key={stepId} data-step-id={stepId} />
        ))}
      </div>
    </>
  );
}

describe('useScrollySteps', () => {
  let callback: IntersectionObserverCallback | undefined;
  let observerOptions: IntersectionObserverInit | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();
  const unobserve = vi.fn();
  const takeRecords = vi.fn<() => IntersectionObserverEntry[]>(() => []);

  beforeEach(() => {
    callback = undefined;
    observerOptions = undefined;
    observe.mockReset();
    disconnect.mockReset();
    unobserve.mockReset();
    takeRecords.mockReset();

    class IntersectionObserverMock {
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: ReadonlyArray<number> = [];

      constructor(
        cb: IntersectionObserverCallback,
        options: IntersectionObserverInit = {}
      ) {
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

  it('should use the provided initial step and observe each step element', () => {
    render(<HookHarness initialStepId="step-3" />);

    expect(screen.getByTestId('active-step')).toHaveTextContent('step-3');
    expect(observe).toHaveBeenCalledTimes(3);
    expect(observerOptions).toEqual({
      rootMargin: '-50% 0px -49% 0px',
      threshold: 0,
    });
  });

  it('should activate the intersecting step closest to the viewport midpoint', () => {
    const { container, unmount } = render(<HookHarness />);
    const [step1, step2, step3] = Array.from(
      container.querySelectorAll<HTMLElement>('[data-step-id]')
    );

    act(() => {
      callback?.(
        [
          createIntersectionEntry({
            isIntersecting: false,
            target: step1,
          }),
          createIntersectionEntry({
            isIntersecting: true,
            target: step2,
            top: 430,
            height: 120,
          }),
          createIntersectionEntry({
            isIntersecting: true,
            target: step3,
            top: 700,
            height: 120,
          }),
        ],
        {} as IntersectionObserver
      );
    });

    expect(screen.getByTestId('active-step')).toHaveTextContent('step-2');

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
