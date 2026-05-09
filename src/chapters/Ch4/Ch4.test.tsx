import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Ch4 from '@/chapters/Ch4';

type RectInit = {
  top: number;
  bottom: number;
  left?: number;
  right?: number;
  width?: number;
};

let activeObserver: MockIntersectionObserver | null = null;
let scrollYValue = 0;
let customScrollObserver: (() => void) | null = null;

function createRect({ top, bottom, left = 0, right = 100, width = 100 }: RectInit): DOMRect {
  return {
    x: left,
    y: top,
    top,
    bottom,
    left,
    right,
    width,
    height: bottom - top,
    toJSON: () => null,
  } as DOMRect;
}

function createMatchMedia(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

class MockIntersectionObserver {
  readonly observed = new Set<Element>();
  readonly root = null;
  readonly rootMargin = '-50% 0px -50% 0px';
  readonly thresholds = [0];

  constructor(private readonly callback: IntersectionObserverCallback) {
    activeObserver = this;
  }

  observe = (element: Element) => {
    this.observed.add(element);
  };

  unobserve = (element: Element) => {
    this.observed.delete(element);
  };

  disconnect = () => {
    this.observed.clear();
  };

  takeRecords = (): IntersectionObserverEntry[] => [];

  emit(entries: Array<Pick<IntersectionObserverEntry, 'target' | 'isIntersecting'>>) {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }

  emitForViewportCenter() {
    const viewportCenter = scrollYValue + window.innerHeight / 2;
    const entries = [...this.observed]
      .map((target) => {
        const rect = target.getBoundingClientRect();
        const absoluteTop = rect.top + scrollYValue;
        const absoluteBottom = rect.bottom + scrollYValue;
        return {
          target,
          isIntersecting: viewportCenter > absoluteTop && viewportCenter <= absoluteBottom,
        };
      })
      .filter((entry) => entry.isIntersecting);

    this.emit(entries);
  }
}

function installTimelineLayout(section: HTMLElement) {
  const sentinelTrack = section.children[0] as HTMLDivElement;
  const stage = section.children[1] as HTMLDivElement;
  const sentinels = Array.from(sentinelTrack.children) as HTMLDivElement[];
  const sectionTop = 100;
  const sentinelHeight = 400;
  const sectionHeight = sentinels.length * sentinelHeight;
  const sectionBottom = sectionTop + sectionHeight;
  const stageHeight = 800;

  Object.defineProperty(section, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      createRect({
        top: sectionTop - scrollYValue,
        bottom: sectionBottom - scrollYValue,
      }),
  });

  Object.defineProperty(stage, 'getBoundingClientRect', {
    configurable: true,
    value: () => createRect({ top: 100, bottom: 100 + stageHeight }),
  });

  sentinels.forEach((sentinel, index) => {
    const absoluteTop = sectionTop + index * sentinelHeight;
    const absoluteBottom = absoluteTop + sentinelHeight;

    Object.defineProperty(sentinel, 'getBoundingClientRect', {
      configurable: true,
      value: () =>
        createRect({
          top: absoluteTop - scrollYValue,
          bottom: absoluteBottom - scrollYValue,
        }),
    });
  });

  return sentinels;
}

describe('Ch4', () => {
  beforeEach(() => {
    activeObserver = null;
    scrollYValue = 0;
    customScrollObserver = null;

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: 1000,
    });

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      get: () => scrollYValue,
    });

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn((query: string) => {
        if (query === '(prefers-reduced-motion: reduce)') return createMatchMedia(false);
        if (query === '(min-width: 900px)') return createMatchMedia(true);
        return createMatchMedia(false);
      }),
    });

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: MockIntersectionObserver,
    });

    document.documentElement.style.setProperty('--nav-height', '100px');

    vi.spyOn(window, 'scrollTo').mockImplementation(((optionsOrX?: number | ScrollToOptions, y?: number) => {
      const top = typeof optionsOrX === 'object' && optionsOrX !== null ? optionsOrX.top : y;

      scrollYValue = typeof top === 'number' ? top : 0;
      if (customScrollObserver) {
        customScrollObserver();
        return;
      }
      activeObserver?.emitForViewportCenter();
    }) as typeof window.scrollTo);
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--nav-height');
    vi.restoreAllMocks();
  });

  it('should keep the clicked mission active instead of snapping to the previous one', async () => {
    const user = userEvent.setup();

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    const sentinels = installTimelineLayout(section);
    const buttons = screen.getAllByRole('button');
    const apollo14Button = screen.getByRole('button', { name: /Apollo 14, Jan 31–Feb 9, 1971/i });
    const apollo15Button = screen.getByRole('button', { name: /Apollo 15, Jul 26–Aug 7, 1971/i });
    const apollo16Button = screen.getByRole('button', { name: /Apollo 16, Apr 16–27, 1972/i });
    const apollo16Index = buttons.indexOf(apollo16Button);

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emit([{ target: sentinels[apollo16Index], isIntersecting: true }]);

    await waitFor(() => {
      expect(apollo16Button).toHaveAttribute('aria-current', 'true');
    });

    await user.click(apollo15Button);

    await waitFor(() => {
      expect(apollo15Button).toHaveAttribute('aria-current', 'true');
      expect(apollo14Button).not.toHaveAttribute('aria-current');
    });
  });

  it('renders the keyboard hint for animated timeline mode', async () => {
    render(<Ch4 />);

    expect(await screen.findByText((content) => content.includes('Use') && content.includes('move through the timeline'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Use') && content.includes('jump to first'))).toBeInTheDocument();
  });

  it('activates arrow-key navigation while the timeline is in view', async () => {
    const user = userEvent.setup();

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    installTimelineLayout(section);
    const apollo8Button = screen.getByRole('button', { name: /Apollo 8, Dec 21–27, 1968/i });
    const apollo9Button = screen.getByRole('button', { name: /Apollo 9, Mar 3–13, 1969/i });

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emitForViewportCenter();

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
    });

    await user.keyboard('{ArrowRight}');

    await waitFor(() => {
      expect(apollo9Button).toHaveAttribute('aria-current', 'true');
    });
  });

  it('activates bracket-key jumps while the timeline is in view', async () => {
    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    installTimelineLayout(section);
    const apollo8Button = screen.getByRole('button', { name: /Apollo 8, Dec 21–27, 1968/i });
    const artemisButton = screen.getByRole('button', { name: /Artemis II, Apr 1–10, 2026/i });

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emitForViewportCenter();

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));

    await waitFor(() => {
      expect(artemisButton).toHaveAttribute('aria-current', 'true');
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '[' }));

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
    });
  });

  it('moves a single step after clicking a timeline item and then using arrow keys', async () => {
    const user = userEvent.setup();

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    installTimelineLayout(section);
    const apollo8Button = screen.getByRole('button', { name: /Apollo 8, Dec 21–27, 1968/i });
    const apollo9Button = screen.getByRole('button', { name: /Apollo 9, Mar 3–13, 1969/i });
    const apollo10Button = screen.getByRole('button', { name: /Apollo 10, May 18–26, 1969/i });

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emitForViewportCenter();

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
    });

    await user.click(apollo9Button);

    await waitFor(() => {
      expect(apollo9Button).toHaveAttribute('aria-current', 'true');
    });

    await user.keyboard('{ArrowRight}');

    await waitFor(() => {
      expect(apollo10Button).toHaveAttribute('aria-current', 'true');
      expect(apollo9Button).not.toHaveAttribute('aria-current');
    });
  });

  it('should keep Apollo 8 active when jumping back from Artemis II at the top boundary', async () => {
    const user = userEvent.setup();

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    const sentinels = installTimelineLayout(section);
    const buttons = screen.getAllByRole('button');
    const apollo8Button = screen.getByRole('button', { name: /Apollo 8, Dec 21–27, 1968/i });
    const apollo9Button = screen.getByRole('button', { name: /Apollo 9, Mar 3–13, 1969/i });
    const artemisButton = screen.getByRole('button', { name: /Artemis II, Apr 1–10, 2026/i });
    const artemisIndex = buttons.indexOf(artemisButton);

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emit([{ target: sentinels[artemisIndex], isIntersecting: true }]);

    await waitFor(() => {
      expect(artemisButton).toHaveAttribute('aria-current', 'true');
    });

    customScrollObserver = () => {
      activeObserver?.emit([{ target: sentinels[1], isIntersecting: true }]);
    };

    await user.click(apollo8Button);

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
      expect(apollo9Button).not.toHaveAttribute('aria-current');
    });
  });

  it('should advance from Apollo 8 to Apollo 9 during normal scroll near the top', async () => {
    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    installTimelineLayout(section);
    const apollo8Button = screen.getByRole('button', { name: /Apollo 8, Dec 21–27, 1968/i });
    const apollo9Button = screen.getByRole('button', { name: /Apollo 9, Mar 3–13, 1969/i });

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emitForViewportCenter();

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
    });

    scrollYValue = 1;
    activeObserver?.emitForViewportCenter();

    await waitFor(() => {
      expect(apollo9Button).toHaveAttribute('aria-current', 'true');
      expect(apollo8Button).not.toHaveAttribute('aria-current');
    });
  });
});
