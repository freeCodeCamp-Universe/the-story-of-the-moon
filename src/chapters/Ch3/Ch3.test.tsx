import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Ch3 from '@/chapters/Ch3';

const sceneHandle = {
  setWithMoon: vi.fn(),
  setShowEclipse: vi.fn(),
  setShowFullMoon: vi.fn(),
  setShowLunarEclipse: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

vi.mock('@/components/ScrollyChapter', () => ({
  default: ({ visual }: { visual: React.ReactNode }) => <div>{visual}</div>,
}));

vi.mock('@/three/earthMoonScene', () => ({
  createEarthMoonScene: () => sceneHandle,
}));

describe('Ch3', () => {
  it('should render a static scale note instead of the scroll-reactive status label', async () => {
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
