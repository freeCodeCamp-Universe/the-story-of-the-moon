import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { surfaceFeatures } from '@/content';
import Ch2 from '@/chapters/Ch2/Ch2';

let reducedMotion = false;
let viewportState = {
  isNearViewport: false,
  isVisible: false,
};

const sceneHandle = {
  dispose: vi.fn(),
  getCameraLatLon: vi.fn(),
  pause: vi.fn(),
  projectFeature: vi.fn(() => ({
    x: 120,
    y: 80,
    visible: true,
  })),
  resume: vi.fn(),
  rotateBy: vi.fn(),
  setCameraTarget: vi.fn(),
};

const createMoonScene = vi.fn<
  (
    canvas: HTMLCanvasElement,
    options?: Record<string, unknown>
  ) => typeof sceneHandle
>(() => sceneHandle);
const originalDialogShowModal =
  globalThis.HTMLDialogElement?.prototype.showModal;
const originalDialogClose = globalThis.HTMLDialogElement?.prototype.close;

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => reducedMotion,
}));

vi.mock('@/hooks/useViewportActivity', () => ({
  useViewportActivity: () => ({
    targetRef: { current: null },
    ...viewportState,
  }),
}));

vi.mock('@/three/moonScene', () => ({
  createMoonScene,
}));

vi.mock('@/components/ScrollyChapter/ScrollyChapter', () => ({
  ScrollyChapter: ({
    steps,
    visual,
    visualBelow,
    ariaLabel,
    ariaLabelledBy,
  }: {
    steps: Array<{ id: string; content: React.ReactNode }>;
    visual?: React.ReactNode;
    visualBelow?: React.ReactNode;
    ariaLabel?: string;
    ariaLabelledBy?: string;
  }) => (
    <section
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {visual}
      {steps.map((step) => (
        <article key={step.id}>{step.content}</article>
      ))}
      {visualBelow}
    </section>
  ),
}));

describe('Ch2', () => {
  beforeAll(() => {
    if (
      globalThis.HTMLDialogElement &&
      typeof globalThis.HTMLDialogElement.prototype.showModal !== 'function'
    ) {
      Object.defineProperty(
        globalThis.HTMLDialogElement.prototype,
        'showModal',
        {
          configurable: true,
          value() {
            this.setAttribute('open', '');
          },
        }
      );
    }

    if (
      globalThis.HTMLDialogElement &&
      typeof globalThis.HTMLDialogElement.prototype.close !== 'function'
    ) {
      Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
        configurable: true,
        value() {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        },
      });
    }
  });

  afterAll(() => {
    if (globalThis.HTMLDialogElement) {
      if (originalDialogShowModal) {
        Object.defineProperty(
          globalThis.HTMLDialogElement.prototype,
          'showModal',
          {
            configurable: true,
            value: originalDialogShowModal,
          }
        );
      }

      if (originalDialogClose) {
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
          configurable: true,
          value: originalDialogClose,
        });
      }
    }
  });

  beforeEach(() => {
    reducedMotion = false;
    viewportState = {
      isNearViewport: false,
      isVisible: false,
    };
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: 12.3, lon: -45.6 });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the intro figures after the text and name the surface-features group from the visible heading', () => {
    render(<Ch2 />);

    const title = screen.getByRole('heading', {
      level: 3,
      name: 'Surface features of the Moon',
    });
    expect(title).toBeInTheDocument();

    const scrollyGroup = screen.getByRole('group', {
      name: 'Surface features of the Moon',
    });
    expect(
      within(scrollyGroup).getAllByRole('heading', { level: 4 })
    ).toHaveLength(surfaceFeatures.length);

    const craterSection = screen.getByRole('region', { name: 'Crater' });
    const craterParagraph = within(craterSection).getByText(
      /A crater is a bowl-shaped depression/
    );
    const craterImage = within(craterSection).getByRole('img', {
      name: /a black-and-white Lunar Reconnaissance Orbiter view looking across Aristarchus/i,
    });
    expect(
      craterParagraph.compareDocumentPosition(craterImage) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);

    const basinSection = screen.getByRole('region', { name: 'Basin' });
    const basinParagraph = within(basinSection).getByText(
      /Over time, these giant depressions are often filled/
    );
    // The comparison layers are decorative; their meaning is carried by each
    // slider's single combined description, so they are not exposed as images.
    expect(within(basinSection).queryByRole('img')).not.toBeInTheDocument();
    const basinImageElements = basinSection.querySelectorAll('img');
    expect(basinImageElements).toHaveLength(4);
    expect(
      within(basinSection).getByRole('slider', {
        name: 'Compare Hertzsprung basin original and topographic views',
      })
    ).toBeInTheDocument();
    expect(
      within(basinSection).getByRole('slider', {
        name: 'Compare Mare Orientale original and topographic views',
      })
    ).toBeInTheDocument();
    expect(
      basinParagraph.compareDocumentPosition(basinImageElements[0]) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);
  });

  it('should let the basin comparison group toggle both images when the group itself has focus', async () => {
    const user = userEvent.setup();

    render(<Ch2 />);

    const comparisonGroup = screen.getByRole('group', {
      name: 'Basin image comparisons',
    });
    const basinStatus = within(comparisonGroup).getByText(/^Hertzsprung:/);
    const sliders = within(comparisonGroup).getAllByRole('slider');

    expect(comparisonGroup).toHaveAttribute('aria-keyshortcuts', 'O T');
    expect(sliders[0]).toHaveAttribute('aria-valuenow', '50');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '50');
    expect(basinStatus).toHaveTextContent(
      'Hertzsprung: 50% original, 50% topographic. Mare Orientale: 50% original, 50% topographic.'
    );

    comparisonGroup.focus();
    await user.keyboard('t');

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '0');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '0');
    expect(basinStatus).toHaveTextContent(
      'Hertzsprung: Full topographic view. Mare Orientale: Full topographic view.'
    );

    await user.keyboard('o');

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '100');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '100');
    expect(basinStatus).toHaveTextContent(
      'Hertzsprung: Full original view. Mare Orientale: Full original view.'
    );
  });

  it('should let O and T update only the focused basin comparison slider', async () => {
    const user = userEvent.setup();

    render(<Ch2 />);

    const comparisonGroup = screen.getByRole('group', {
      name: 'Basin image comparisons',
    });
    const basinStatus = within(comparisonGroup).getByText(/^Hertzsprung:/);
    const sliders = within(comparisonGroup).getAllByRole('slider');

    sliders[0].focus();
    await user.keyboard('t');

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '0');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '50');
    expect(basinStatus).toHaveTextContent(
      'Hertzsprung: Full topographic view. Mare Orientale: 50% original, 50% topographic.'
    );

    sliders[1].focus();
    await user.keyboard('o');

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '0');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '100');
    expect(basinStatus).toHaveTextContent(
      'Hertzsprung: Full topographic view. Mare Orientale: Full original view.'
    );
  });

  it('should let each basin slider move independently with the keyboard', async () => {
    const user = userEvent.setup();

    render(<Ch2 />);

    const comparisonGroup = screen.getByRole('group', {
      name: 'Basin image comparisons',
    });
    const sliders = within(comparisonGroup).getAllByRole('slider');

    sliders[0].focus();
    await user.keyboard('{ArrowRight}{ArrowRight}');

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '52');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '50');

    sliders[1].focus();
    await user.keyboard('{PageDown}');

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '52');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '40');
  });

  it('should let O and T update the basin slider that the pointer is hovering over without requiring focus', () => {
    render(<Ch2 />);

    const comparisonGroup = screen.getByRole('group', {
      name: 'Basin image comparisons',
    });
    const sliders = within(comparisonGroup).getAllByRole('slider');

    fireEvent.pointerMove(sliders[0]);
    fireEvent.keyDown(window, { key: 'o' });

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '100');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '50');
    expect(sliders[0]).not.toHaveFocus();

    fireEvent.pointerMove(sliders[1]);
    fireEvent.keyDown(window, { key: 't' });

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '100');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '0');
    expect(sliders[1]).not.toHaveFocus();

    fireEvent.pointerLeave(comparisonGroup);
    fireEvent.keyDown(window, { key: 'o' });

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '100');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '0');
  });

  it('should keep the focused basin shortcuts available when global shortcuts are disabled', async () => {
    const user = userEvent.setup();

    render(<Ch2 shortcutsEnabled={false} />);

    const comparisonGroup = screen.getByRole('group', {
      name: 'Basin image comparisons',
    });
    const sliders = within(comparisonGroup).getAllByRole('slider');

    comparisonGroup.focus();
    await user.keyboard('t');

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '0');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '0');
  });

  it('should disable hover-triggered basin shortcuts when global shortcuts are disabled', () => {
    render(<Ch2 shortcutsEnabled={false} />);

    const comparisonGroup = screen.getByRole('group', {
      name: 'Basin image comparisons',
    });
    const sliders = within(comparisonGroup).getAllByRole('slider');

    fireEvent.pointerMove(sliders[0]);
    fireEvent.keyDown(window, { key: 'o' });

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '50');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '50');
    expect(comparisonGroup).toHaveAttribute('aria-keyshortcuts', 'O T');
  });

  it('should ignore modified O and T basin shortcuts', () => {
    render(<Ch2 />);

    const comparisonGroup = screen.getByRole('group', {
      name: 'Basin image comparisons',
    });
    const sliders = within(comparisonGroup).getAllByRole('slider');

    fireEvent.keyDown(sliders[0], { key: 't', altKey: true });
    fireEvent.keyDown(sliders[1], { key: 'o', ctrlKey: true });
    fireEvent.keyDown(sliders[1], { key: 't', metaKey: true });

    expect(sliders[0]).toHaveAttribute('aria-valuenow', '50');
    expect(sliders[1]).toHaveAttribute('aria-valuenow', '50');
  });

  it('should render the interactive sphere with reduced motion enabled instead of a static per-feature fallback', async () => {
    reducedMotion = true;
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });
    expect(createMoonScene).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ reducedMotion: true })
    );

    // Same heading hierarchy as the motion path: one h3 plus one h4 per feature.
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Surface features of the Moon',
      })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(
      surfaceFeatures.length
    );

    // The old fallback shipped one static globe image per feature; the
    // unified sphere path renders none of those.
    expect(
      screen.queryByRole('img', { name: /is located at/i })
    ).not.toBeInTheDocument();
  });

  it('should render each surface-feature description as separate paragraphs', () => {
    render(<Ch2 />);

    const mareImbriumHeading = screen.getByRole('heading', {
      level: 4,
      name: 'Mare Imbrium',
    });
    const mareImbriumArticle = mareImbriumHeading.closest('article');

    if (!mareImbriumArticle) {
      throw new Error('Expected Mare Imbrium to render inside an article.');
    }

    const descriptionParagraphs = within(mareImbriumArticle).getAllByText(
      (_, element) => element?.tagName.toLowerCase() === 'p'
    );
    expect(descriptionParagraphs).toHaveLength(
      surfaceFeatures[0].description.length
    );
    expect(descriptionParagraphs[0]).toHaveTextContent(
      'Mare Imbrium is one of the largest dark plains on the side of the Moon facing Earth, a nearly circular basin about 1,145 kilometers across, punched out by a massive impactor around 3.9 billion years ago.'
    );
    expect(descriptionParagraphs[1]).toHaveTextContent(
      "Over the next several hundred million years, lava rose from the lunar interior and flooded the basin floor, hardening into the dark basalt visible today. The basin's outer rim is preserved as a ring of mountain ranges, including the Apennines and the Alps."
    );
  });

  it('should expose the active moon feature label as a polite live region', () => {
    render(<Ch2 />);

    const visualGroup = screen.getByRole('group', {
      name: 'Interactive view of the Moon; use arrow keys to rotate, and after you stop the view re-centers on the active feature.',
    });
    const liveRegions = visualGroup.querySelectorAll('[aria-live="polite"]');
    const annotationLiveRegion = Array.from(liveRegions).find(
      (region) => !region.classList.contains('sr-only')
    );
    const rotationLiveRegion = Array.from(liveRegions).find((region) =>
      region.classList.contains('sr-only')
    );

    expect(liveRegions).toHaveLength(2);
    expect(annotationLiveRegion).not.toBeNull();
    expect(rotationLiveRegion).not.toBeNull();
    if (!annotationLiveRegion || !rotationLiveRegion) {
      throw new Error('Expected both Ch2 live regions to render.');
    }
    expect(annotationLiveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(annotationLiveRegion).not.toHaveAttribute('aria-hidden');
    expect(rotationLiveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(rotationLiveRegion.textContent).toBe('');
  });

  it('should announce a single debounced coordinate update after keyboard rotation', async () => {
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: 12.3, lon: -45.6 });

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });
    sceneHandle.setCameraTarget.mockClear();

    const visualGroup = screen.getByRole('group', {
      name: 'Interactive view of the Moon; use arrow keys to rotate, and after you stop the view re-centers on the active feature.',
    });
    const liveRegions = visualGroup.querySelectorAll('[aria-live="polite"]');
    const rotationRegion = Array.from(liveRegions).find((region) =>
      region.classList.contains('sr-only')
    );

    if (!rotationRegion) {
      throw new Error('Expected a hidden rotation live region.');
    }

    vi.useFakeTimers();
    fireEvent.keyDown(visualGroup, { key: 'ArrowRight' });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.keyDown(visualGroup, { key: 'ArrowRight' });

    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(rotationRegion.textContent).toBe('');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(sceneHandle.rotateBy).toHaveBeenCalledTimes(2);
    expect(sceneHandle.getCameraLatLon).toHaveBeenCalledTimes(1);
    expect(rotationRegion.textContent).toContain('Viewing 12.3°N 45.6°W');

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(sceneHandle.setCameraTarget).toHaveBeenCalledTimes(1);
    expect(rotationRegion.textContent).toBe('');
  });

  it('should announce a debounced coordinate update after pointer drag release', async () => {
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: -8.4, lon: 22.1 });

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });
    sceneHandle.setCameraTarget.mockClear();

    const visualGroup = screen.getByRole('group', {
      name: 'Interactive view of the Moon; use arrow keys to rotate, and after you stop the view re-centers on the active feature.',
    });
    const liveRegions = visualGroup.querySelectorAll('[aria-live="polite"]');
    const rotationRegion = Array.from(liveRegions).find((region) =>
      region.classList.contains('sr-only')
    );
    const canvas = visualGroup.querySelector('canvas');

    if (!rotationRegion || !canvas) {
      throw new Error('Expected the Ch2 visual canvas and hidden live region.');
    }

    vi.useFakeTimers();
    fireEvent.pointerDown(canvas);
    fireEvent.pointerUp(canvas);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(sceneHandle.getCameraLatLon).toHaveBeenCalledTimes(1);
    expect(rotationRegion.textContent).toContain('Viewing 8.4°S 22.1°E');
  });

  it('should render the expand button with an accessible name and keep it keyboard reachable', async () => {
    const user = userEvent.setup();
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });

    const expandButton = screen.getByRole('button', {
      name: 'Expand the Moon to full screen',
    });

    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();

    expect(expandButton).toBeInTheDocument();
    expect(expandButton).toHaveFocus();
  });

  it('should open a dialog when the expand button is activated', async () => {
    const user = userEvent.setup();
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Expand the Moon to full screen',
      })
    );

    expect(
      await screen.findByRole('dialog', { name: 'Explore the Moon' })
    ).toBeInTheDocument();
  });

  it('should seed the overlay scene with the inline camera position', async () => {
    const user = userEvent.setup();
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: 12.3, lon: -45.6 });

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Expand the Moon to full screen',
      })
    );

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(2);
    });

    const lastCall =
      createMoonScene.mock.calls[createMoonScene.mock.calls.length - 1];
    expect(lastCall).toBeDefined();
    const [, options] = lastCall;
    expect(options).toEqual(
      expect.objectContaining({
        enableOrbitControls: true,
        autoRotate: false,
        initialTarget: { lat: 12.3, lon: -45.6 },
      })
    );
  });

  it('should pause the inline scene on open and resume it on close when visible', async () => {
    const user = userEvent.setup();
    viewportState = {
      isNearViewport: true,
      isVisible: true,
    };

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });
    sceneHandle.pause.mockClear();
    sceneHandle.resume.mockClear();

    await user.click(
      screen.getByRole('button', {
        name: 'Expand the Moon to full screen',
      })
    );

    expect(sceneHandle.pause).toHaveBeenCalled();

    await user.click(
      await screen.findByRole('button', {
        name: 'Close expanded view',
      })
    );

    expect(sceneHandle.resume).toHaveBeenCalled();
  });

  it('should close on Escape and return focus to the expand button', async () => {
    const user = userEvent.setup();
    viewportState = {
      isNearViewport: true,
      isVisible: true,
    };

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });

    const expandButton = screen.getByRole('button', {
      name: 'Expand the Moon to full screen',
    });
    await user.click(expandButton);

    const dialog = await screen.findByRole('dialog', {
      name: 'Explore the Moon',
    });

    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Explore the Moon' })
      ).not.toBeInTheDocument();
    });
    expect(expandButton).toHaveFocus();
  });

  it('should close on close-button click and return focus to the expand button', async () => {
    const user = userEvent.setup();
    viewportState = {
      isNearViewport: true,
      isVisible: true,
    };

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });

    const expandButton = screen.getByRole('button', {
      name: 'Expand the Moon to full screen',
    });

    await user.click(expandButton);
    await user.click(
      await screen.findByRole('button', {
        name: 'Close expanded view',
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: 'Explore the Moon' })
      ).not.toBeInTheDocument();
    });
    expect(expandButton).toHaveFocus();
  });
});
