import { render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import MoonInterlude from '@/components/MoonInterlude';

const mockUseReducedMotion = vi.fn<() => boolean>();

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockUseReducedMotion(),
}));

beforeAll(() => {
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
  it('should render the animated SVG scene when reduced motion is off', () => {
    mockUseReducedMotion.mockReturnValue(false);

    const { container } = render(<MoonInterlude />);

    expect(
      screen.getByRole('img', {
        name: 'Animated moon illustration with softly blinking stars between chapter 6 and chapter 7.',
      })
    ).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
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
