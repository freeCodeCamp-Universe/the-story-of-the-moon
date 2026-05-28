import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Ch3 from '@/chapters/Ch3/Ch3';

let viewportState = {
  isNearViewport: false,
  isVisible: false,
};

const sceneHandle = {
  setWithMoon: vi.fn(),
  setShowEclipse: vi.fn(),
  setShowFullMoon: vi.fn(),
  setShowLunarEclipse: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('@/hooks/useViewportActivity', () => ({
  useViewportActivity: () => ({
    targetRef: { current: null },
    ...viewportState,
  }),
}));

vi.mock('@/components/ScrollyChapter/ScrollyChapter', () => ({
  ScrollyChapter: ({ visual, steps }: { visual: React.ReactNode; steps: Array<{ id: string; content: React.ReactNode }> }) => (
    <div>
      {visual}
      {steps.map((step) => (
        <article key={step.id}>{step.content}</article>
      ))}
    </div>
  ),
}));

vi.mock('@/three/earthMoonScene', () => ({
  createEarthMoonScene: () => sceneHandle,
}));

describe('Ch3', () => {
  beforeEach(() => {
    viewportState = {
      isNearViewport: false,
      isVisible: false,
    };
    vi.clearAllMocks();
  });

  it('should render the chapter intro and step headings with their explanatory copy', () => {
    render(<Ch3 />);

    expect(screen.getByText(/We can go a whole day without looking up at the Moon and never feel its absence\./)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: "Tides are the Moon's most visible signature",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'When sunlight is blocked by the Moon',
      })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(6);
    expect(screen.getByText(/A solar eclipse occurs when the Moon passes directly between Earth and the Sun\./)).toBeInTheDocument();
  });

  it('should render a static scale note instead of the scroll-reactive status label', async () => {
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };

    render(<Ch3 />);

    expect(screen.getByText('not to scale')).toBeInTheDocument();
    expect(screen.queryByText('orbit · tidal pull active')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(sceneHandle.setWithMoon).toHaveBeenCalledWith(true);
      expect(sceneHandle.setShowEclipse).toHaveBeenCalledWith(false);
      expect(sceneHandle.setShowFullMoon).toHaveBeenCalledWith(false);
      expect(sceneHandle.setShowLunarEclipse).toHaveBeenCalledWith(false);
    });
  });
});
