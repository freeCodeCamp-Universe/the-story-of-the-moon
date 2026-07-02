import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useActiveSection } from '@/hooks/useActiveSection';
import { SECTION_IDS } from '@/data/chapters';

function HookHarness() {
  const activeSectionId = useActiveSection();
  return <div data-testid="active">{activeSectionId ?? ''}</div>;
}

function addSectionElements() {
  for (const id of SECTION_IDS) {
    const section = document.createElement('section');
    section.id = id;
    document.body.append(section);
  }
}

describe('useActiveSection', () => {
  let callback: IntersectionObserverCallback | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = '';
    addSectionElements();

    class IntersectionObserverMock {
      root: Element | Document | null = null;
      rootMargin = '';
      thresholds: ReadonlyArray<number> = [];

      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
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

  it('should return null before any section intersects', () => {
    render(<HookHarness />);

    expect(screen.getByTestId('active')).toHaveTextContent('');
  });

  it('should return the id of the intersecting section', () => {
    render(<HookHarness />);

    expect(callback).toBeDefined();

    act(() => {
      callback?.(
        [
          {
            isIntersecting: true,
            target: document.getElementById('ch2-crater-heading') as Element,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(screen.getByTestId('active')).toHaveTextContent(
      'ch2-crater-heading'
    );
  });

  it('should use only the first intersecting entry', () => {
    render(<HookHarness />);

    act(() => {
      callback?.(
        [
          {
            isIntersecting: true,
            target: document.getElementById('ch3-tides-heading') as Element,
          } as IntersectionObserverEntry,
          {
            isIntersecting: true,
            target: document.getElementById('ch3-tilt-heading') as Element,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    expect(screen.getByTestId('active')).toHaveTextContent('ch3-tides-heading');
  });

  it('should disconnect the observer on unmount', () => {
    const { unmount } = render(<HookHarness />);

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
