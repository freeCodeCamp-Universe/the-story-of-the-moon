import { render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import MoonInterlude from '@/components/MoonInterlude';

const mockUseReducedMotion = vi.fn<() => boolean>();
const mockContext = {
  clearRect: vi.fn(),
  setTransform: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  save: vi.fn(),
  clip: vi.fn(),
  restore: vi.fn(),
  fillStyle: '',
  globalAlpha: 1,
} as unknown as CanvasRenderingContext2D;

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => mockContext);

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MoonInterlude', () => {
  it('should render the animated canvas scene when reduced motion is off', () => {
    mockUseReducedMotion.mockReturnValue(false);

    const { container } = render(<MoonInterlude />);

    expect(
      screen.getByRole('img', {
        name: 'Animated moon illustration with softly blinking stars between chapter 6 and chapter 7.',
      })
    ).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render a static labeled scene when reduced motion is on', () => {
    mockUseReducedMotion.mockReturnValue(true);

    render(<MoonInterlude />);

    expect(
      screen.getByRole('img', {
        name: 'Static moon illustration with stars between chapter 6 and chapter 7.',
      })
    ).toBeInTheDocument();
  });
});
