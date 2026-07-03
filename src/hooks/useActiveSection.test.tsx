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

// Chapter headers render as `<h2 id="chapter-N-heading">` (Chapter component).
function addChapterHeading(chapterId: string, bottom: number) {
  const heading = document.createElement('h2');
  heading.id = `${chapterId}-heading`;
  heading.getBoundingClientRect = () => ({ bottom }) as DOMRect;
  document.body.prepend(heading);
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

  it('should ignore a section element removed from the document after mount', () => {
    render(<HookHarness />);

    // Simulate Ch4 swapping its stacked timeline for the pinned one after
    // mount: the original ch4-missions element detaches. A detached rect
    // reads top 0, which sits permanently above the reading line and would
    // mask every earlier chapter's sections.
    document.getElementById('ch4-missions')?.remove();

    setSectionTops({
      'ch2-crater-heading': 100,
      'ch2-basin-heading': 400,
    });

    act(() => {
      callback?.([], {} as IntersectionObserver);
    });

    expect(screen.getByTestId('active')).toHaveTextContent('ch2-basin-heading');
  });

  it('should track a section element that remounts after the hook attaches', () => {
    render(<HookHarness />);

    document.getElementById('ch4-missions')?.remove();
    const remounted = document.createElement('section');
    remounted.id = 'ch4-missions';
    document.getElementById('diptych-title')?.before(remounted);

    setSectionTops({
      'ch2-crater-heading': 100,
      'ch4-missions': 300,
    });

    act(() => {
      callback?.([], {} as IntersectionObserver);
    });

    expect(screen.getByTestId('active')).toHaveTextContent('ch4-missions');
    // Future reading-line crossings of the remounted element must wake the
    // observer, so it has to be observed, not just read once. Compare by
    // identity: deep equality would also match the removed original.
    expect(observe.mock.calls.some(([el]) => el === remounted)).toBe(true);
  });

  it('should report no active section while the owning chapter header is still on screen', () => {
    // Reader clicked the chapter row: the chapter header sits at the top of
    // the viewport (bottom edge at 250px) and the short intro leaves the
    // first heading already above the 500px reading line.
    addChapterHeading('chapter-2', 250);
    render(<HookHarness />);

    setSectionTops({ 'ch2-crater-heading': 400 });

    act(() => {
      callback?.([], {} as IntersectionObserver);
    });

    expect(screen.getByTestId('active')).toBeEmptyDOMElement();
  });

  it('should report the section once the owning chapter header scrolls past the viewport top', () => {
    addChapterHeading('chapter-2', -60);
    render(<HookHarness />);

    setSectionTops({ 'ch2-crater-heading': 400 });

    act(() => {
      callback?.([], {} as IntersectionObserver);
    });

    expect(screen.getByTestId('active')).toHaveTextContent(
      'ch2-crater-heading'
    );
  });

  it('should report the section when the chapter header only peeks under the fixed nav', () => {
    // `html` carries `scroll-padding-top: var(--nav-height)`; a header sliver
    // above that line is covered by the NavStrip and must not suppress the
    // section (Ch4's timeline jump rests exactly like this).
    document.documentElement.style.scrollPaddingTop = '52px';
    addChapterHeading('chapter-2', 45);
    render(<HookHarness />);

    setSectionTops({ 'ch2-crater-heading': 400 });

    act(() => {
      callback?.([], {} as IntersectionObserver);
    });

    expect(screen.getByTestId('active')).toHaveTextContent(
      'ch2-crater-heading'
    );
    document.documentElement.style.scrollPaddingTop = '';
  });

  it('should disconnect the observer on unmount', () => {
    const { unmount } = render(<HookHarness />);

    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});
