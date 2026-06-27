import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Ch4 from '@/chapters/Ch4/Ch4';

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

function createRect({
  top,
  bottom,
  left = 0,
  right = 100,
  width = 100,
}: RectInit): DOMRect {
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

function setViewport({
  desktop,
  reducedMotion = false,
}: {
  desktop: boolean;
  reducedMotion?: boolean;
}) {
  (window.matchMedia as unknown as ReturnType<typeof vi.fn>).mockImplementation(
    (query: string) => {
      if (query === '(prefers-reduced-motion: reduce)')
        return createMatchMedia(reducedMotion);
      if (query === '(min-width: 768px)') return createMatchMedia(desktop);
      return createMatchMedia(false);
    }
  );
}

class MockIntersectionObserver {
  readonly observed = new Set<Element>();
  readonly root = null;
  readonly rootMargin = '-50% 0px -50% 0px';
  readonly thresholds = [0];

  constructor(private readonly callback: IntersectionObserverCallback) {}

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

  emit(
    entries: Array<Pick<IntersectionObserverEntry, 'target' | 'isIntersecting'>>
  ) {
    this.callback(
      entries as IntersectionObserverEntry[],
      this as unknown as IntersectionObserver
    );
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
          isIntersecting:
            viewportCenter > absoluteTop && viewportCenter <= absoluteBottom,
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
      value: vi.fn(),
    });
    setViewport({ desktop: true, reducedMotion: false });

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      writable: true,
      value: function (
        this: IntersectionObserver,
        callback: IntersectionObserverCallback
      ) {
        const observer = new MockIntersectionObserver(callback);
        activeObserver = observer;
        return observer;
      } as unknown as typeof IntersectionObserver,
    });

    document.documentElement.style.setProperty('--nav-height', '100px');

    vi.spyOn(window, 'scrollTo').mockImplementation(((
      optionsOrX?: number | ScrollToOptions,
      y?: number
    ) => {
      const top =
        typeof optionsOrX === 'object' && optionsOrX !== null
          ? optionsOrX.top
          : y;

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

  it('should render the chapter intro and the closing diptych heading with its narrative copy', () => {
    render(<Ch4 />);

    expect(
      screen.getByText(
        /For thousands of years, reaching the Moon lived only in the human imagination\./
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'The same horizon',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /In 1968, the Apollo 8 crew was caught off guard by a striking sight: Earth rising as a fragile blue marble against the dark void\./
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Fifty-eight years later, the Artemis II crew headed for the same vantage with cameras already set up/i
      )
    ).toBeInTheDocument();
  });

  it('should always render the pinned timeline region regardless of viewport', async () => {
    render(<Ch4 />);

    expect(
      await screen.findByRole('region', {
        name: 'Apollo and Artemis missions',
      })
    ).toBeInTheDocument();

    const lists = screen.queryAllByRole('list');
    expect(
      lists.some(
        (list) => list.getAttribute('aria-label') === 'Timeline progress'
      )
    ).toBe(true);
  });

  it('should keep the clicked mission active instead of snapping to the previous one', async () => {
    const user = userEvent.setup();

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    const sentinels = installTimelineLayout(section);
    const buttons = screen.getAllByRole('button');
    const apollo14Button = screen.getByRole('button', {
      name: /Apollo 14, Jan 31–Feb 9, 1971/i,
    });
    const apollo15Button = screen.getByRole('button', {
      name: /Apollo 15, Jul 26–Aug 7, 1971/i,
    });
    const apollo16Button = screen.getByRole('button', {
      name: /Apollo 16, Apr 16–27, 1972/i,
    });
    const apollo16Index = buttons.indexOf(apollo16Button);

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emit([
      { target: sentinels[apollo16Index], isIntersecting: true },
    ]);

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

    expect(
      await screen.findByText(
        (content) =>
          content.includes('Use') &&
          content.includes('move through the timeline')
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (content) =>
          content.includes('Use') && content.includes('jump to first')
      )
    ).toBeInTheDocument();
  });

  it('activates arrow-key navigation while the timeline is in view', async () => {
    const user = userEvent.setup();

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    installTimelineLayout(section);
    const apollo8Button = screen.getByRole('button', {
      name: /Apollo 8, Dec 21–27, 1968/i,
    });
    const apollo9Button = screen.getByRole('button', {
      name: /Apollo 9, Mar 3–13, 1969/i,
    });

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
    const apollo8Button = screen.getByRole('button', {
      name: /Apollo 8, Dec 21–27, 1968/i,
    });
    const artemisButton = screen.getByRole('button', {
      name: /Artemis II, Apr 1–10, 2026/i,
    });

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

  it('should disable global bracket-key jumps when shortcuts are disabled', async () => {
    render(<Ch4 shortcutsEnabled={false} />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    installTimelineLayout(section);
    const apollo8Button = screen.getByRole('button', {
      name: /Apollo 8, Dec 21–27, 1968/i,
    });
    const artemisButton = screen.getByRole('button', {
      name: /Artemis II, Apr 1–10, 2026/i,
    });

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emitForViewportCenter();

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: ']' }));

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
      expect(artemisButton).not.toHaveAttribute('aria-current');
    });
  });

  it('should keep focused bracket-key jumps available when global shortcuts are disabled', async () => {
    render(<Ch4 shortcutsEnabled={false} />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    installTimelineLayout(section);
    const apollo8Button = screen.getByRole('button', {
      name: /Apollo 8, Dec 21–27, 1968/i,
    });
    const artemisButton = screen.getByRole('button', {
      name: /Artemis II, Apr 1–10, 2026/i,
    });

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emitForViewportCenter();

    await waitFor(() => {
      expect(apollo8Button).toHaveAttribute('aria-current', 'true');
    });

    fireEvent.keyDown(section, { key: ']' });

    await waitFor(() => {
      expect(artemisButton).toHaveAttribute('aria-current', 'true');
    });
  });

  it('moves a single step after clicking a timeline item and then using arrow keys', async () => {
    const user = userEvent.setup();

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    installTimelineLayout(section);
    const apollo8Button = screen.getByRole('button', {
      name: /Apollo 8, Dec 21–27, 1968/i,
    });
    const apollo9Button = screen.getByRole('button', {
      name: /Apollo 9, Mar 3–13, 1969/i,
    });
    const apollo10Button = screen.getByRole('button', {
      name: /Apollo 10, May 18–26, 1969/i,
    });

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
    const apollo8Button = screen.getByRole('button', {
      name: /Apollo 8, Dec 21–27, 1968/i,
    });
    const apollo9Button = screen.getByRole('button', {
      name: /Apollo 9, Mar 3–13, 1969/i,
    });
    const artemisButton = screen.getByRole('button', {
      name: /Artemis II, Apr 1–10, 2026/i,
    });
    const artemisIndex = buttons.indexOf(artemisButton);

    await waitFor(() => {
      expect(activeObserver?.observed.size ?? 0).toBeGreaterThan(0);
    });

    activeObserver?.emit([
      { target: sentinels[artemisIndex], isIntersecting: true },
    ]);

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
    const apollo8Button = screen.getByRole('button', {
      name: /Apollo 8, Dec 21–27, 1968/i,
    });
    const apollo9Button = screen.getByRole('button', {
      name: /Apollo 9, Mar 3–13, 1969/i,
    });

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

  it('should open the jump dropdown from the mobile rail trigger and reflect the active step in its name', async () => {
    const user = userEvent.setup();
    setViewport({ desktop: false });

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });
    const sentinels = installTimelineLayout(section);

    const trigger = await screen.findByRole('button', {
      name: /Jump to a mission\. Step 1 of 11/i,
    });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', 'ch4-mission-dropdown');
    expect(trigger).toHaveAccessibleName(
      /Jump to a mission\. Step 1 of 11: Apollo 8/i
    );
    expect(trigger).not.toHaveAccessibleName(/Fifty-three years pass/i);

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.queryByRole('button', { name: /Fifty-three years pass/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Interlude' })
    ).toBeInTheDocument();
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('button')).toHaveLength(sentinels.length);
    expect(
      screen.getByRole('button', { name: /Apollo 11/i })
    ).toBeInTheDocument();
  });

  it('should close the jump dropdown when the rail trigger is clicked again', async () => {
    const user = userEvent.setup();
    setViewport({ desktop: false });

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });
    installTimelineLayout(section);

    const trigger = await screen.findByRole('button', {
      name: /Jump to a mission\. Step 1 of 11/i,
    });

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'Interlude' })
    ).toBeInTheDocument();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('button', { name: 'Interlude' })
    ).not.toBeInTheDocument();
  });

  it('should jump to the interlude row and close the dropdown on mobile', async () => {
    const user = userEvent.setup();
    setViewport({ desktop: false });

    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });
    installTimelineLayout(section);

    await user.click(
      await screen.findByRole('button', {
        name: /Jump to a mission\. Step 1 of 11/i,
      })
    );
    await user.click(screen.getByRole('button', { name: 'Interlude' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Interlude' })
      ).not.toBeInTheDocument();
    });

    expect(
      await screen.findByRole('button', { name: 'Jump to a mission.' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Fifty-three years pass/i })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Fifty-three years pass.')).toBeInTheDocument();
  });

  it('should not render individual mission tick buttons on mobile', async () => {
    setViewport({ desktop: false });

    render(<Ch4 />);

    await screen.findByRole('region', { name: 'Apollo and Artemis missions' });
    const trigger = screen.getByRole('button', {
      name: /Jump to a mission\. Step 1 of 11/i,
    });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    const decorativeTicks = trigger.querySelector('[aria-hidden="true"]');
    expect(decorativeTicks).not.toBeNull();
    if (decorativeTicks) {
      expect(
        within(decorativeTicks as HTMLElement).queryAllByRole('button')
      ).toHaveLength(0);
    }
    expect(
      screen.queryByRole('button', { name: /Apollo 8, Dec 21–27, 1968/i })
    ).not.toBeInTheDocument();
  });

  it('should apply the instant-cut deck class under reduced motion', async () => {
    setViewport({ desktop: false, reducedMotion: true });

    const { container } = render(<Ch4 />);
    await screen.findByRole('region', { name: 'Apollo and Artemis missions' });

    const deck = container.querySelector('[data-deck]');
    expect(deck).not.toBeNull();
    expect(deck?.className).toContain('deckInstant');
  });

  it('should not apply the instant-cut deck class when motion is allowed', async () => {
    setViewport({ desktop: true, reducedMotion: false });

    const { container } = render(<Ch4 />);
    await screen.findByRole('region', { name: 'Apollo and Artemis missions' });

    const deck = container.querySelector('[data-deck]');
    expect(deck).not.toBeNull();
    expect(deck?.className).not.toContain('deckInstant');
  });

  it('should scroll without smooth behavior under reduced motion when jumping', async () => {
    const user = userEvent.setup();
    setViewport({ desktop: true, reducedMotion: true });

    render(<Ch4 />);
    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });
    installTimelineLayout(section);

    const scrollSpy = window.scrollTo as unknown as ReturnType<typeof vi.fn>;
    scrollSpy.mockClear();

    await user.click(
      screen.getByRole('button', { name: /Apollo 11, Jul 16–24, 1969/i })
    );

    const lastCall = scrollSpy.mock.calls[scrollSpy.mock.calls.length - 1];
    expect(lastCall?.[0]).toMatchObject({ behavior: 'auto' });
  });

  it('should size each scroll step from window.innerHeight in pixels', async () => {
    render(<Ch4 />);

    const section = await screen.findByRole('region', {
      name: 'Apollo and Artemis missions',
    });

    await waitFor(() => {
      expect(section.style.getPropertyValue('--step-length')).toBe('500px');
    });
  });
});
