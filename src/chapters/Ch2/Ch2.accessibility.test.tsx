import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let viewportState = {
  isNearViewport: true,
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

const createMoonScene = vi.fn(() => sceneHandle);

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
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

vi.mock('@/components/ScrollyChapter', () => ({
  default: ({
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
    <section role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
      {visual}
      {steps.map((step) => (
        <article key={step.id}>{step.content}</article>
      ))}
      {visualBelow}
    </section>
  ),
}));

describe('Ch2 accessibility', () => {
  beforeEach(() => {
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: 12.3, lon: -45.6 });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('announces a single debounced coordinate update after keyboard rotation', async () => {
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: 12.3, lon: -45.6 });

    const { default: Ch2 } = await import('@/chapters/Ch2');
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
      region.classList.contains('sr-only'),
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

  it('announces a debounced coordinate update after pointer drag release', async () => {
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: -8.4, lon: 22.1 });

    const { default: Ch2 } = await import('@/chapters/Ch2');
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
      region.classList.contains('sr-only'),
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
});
