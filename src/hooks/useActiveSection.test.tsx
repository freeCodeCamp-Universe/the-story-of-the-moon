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

// Reading line sits at 50% of the viewport; with innerHeight 1000 that is 500px.
// Position each named section's top; any unlisted section sits far below.
function setSectionTops(tops: Record<string, number>) {
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const top = tops[id] ?? Number.POSITIVE_INFINITY;
    el.getBoundingClientRect = () => ({ top }) as DOMRect;
  }
}

describe('useActiveSection', () => {
  let callback: IntersectionObserverCallback | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();

  beforeEach(() => {
    document.body.innerHTML = '';
    addSectionElements();
    vi.stubGlobal('innerHeight', 1000);

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

  it('should return null before any section reaches the reading line', () => {
    render(<HookHarness />);

    expect(screen.getByTestId('active')).toHaveTextContent('');
  });

  it('should return the last section whose heading is above the reading line', () => {
    render(<HookHarness />);

    expect(callback).toBeDefined();

    // Sections are positioned in document order (crater, basin, surface).
    // Crater and basin sit above the 500px line; surface stays below it, so
    // the lower of the two above the line (basin) is the active one.
    setSectionTops({
      'ch2-crater-heading': 100,
      'ch2-basin-heading': 400,
      'ch2-surface-features-heading': 900,
    });

    act(() => {
      callback?.([], {} as IntersectionObserver);
    });

    expect(screen.getByTestId('active')).toHaveTextContent('ch2-basin-heading');
  });

  it('should ignore sections still below the reading line', () => {
    render(<HookHarness />);

    setSectionTops({ 'ch2-crater-heading': 800 });

    act(() => {
      callback?.([], {} as IntersectionObserver);
    });

    expect(screen.getByTestId('active')).toHaveTextContent('');
  });

  it('should disconnect the observer on unmount', () => {
    const { unmount } = render(<HookHarness />);

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
