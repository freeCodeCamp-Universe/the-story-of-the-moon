import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Ch6 from './Ch6';

beforeEach(() => {
  // Ch6 now renders motion-aware scenes (LunarSwirlScene, PolarIceFigure) that
  // read prefers-reduced-motion via window.matchMedia, which jsdom does not provide.
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
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

describe('Ch6', () => {
  it('should render Chapter 6 as three labeled sections with imagery', () => {
    render(<Ch6 />);

    const sectionNames = ['Floors in permanent shadow', 'Tunnels under the surface', "Two halves that don't match"] as const;
    const sections = sectionNames.map((name) => screen.getByRole('region', { name }));

    expect(sections).toHaveLength(3);

    const expectedImageCounts = [1, 1, 2];

    sections.forEach((section, index) => {
      expect(within(section).getAllByRole('img')).toHaveLength(expectedImageCounts[index]);
      expect(within(section).getAllByText(/NASA/i).length).toBeGreaterThan(0);
    });

    const halvesSection = screen.getByRole('region', { name: "Two halves that don't match" });
    expect(
      within(halvesSection)
        .getAllByRole('img')
        .map((image) => image.getAttribute('alt'))
    ).toEqual([
      "Near side of Earth's Moon as mapped from Lunar Reconnaissance Orbiter camera data, with broad dark maria spread across the face.",
      "Far side of Earth's Moon as mapped from Lunar Reconnaissance Orbiter camera data, showing a brighter, densely cratered surface with almost no dark maria.",
    ]);
  });

  it('should render the water-origin section with the three suspects and standoff as prose', () => {
    render(<Ch6 />);

    const waterSection = screen.getByRole('region', { name: /Water on the Moon/i });

    for (const name of ['The Sun', 'Comets and asteroids', 'Ancient Earth']) {
      expect(within(waterSection).getByText(name, { selector: 'b' })).toBeInTheDocument();
    }
    expect(within(waterSection).getByText(/A single conclusion remains out of reach/)).toBeInTheDocument();
  });

  it('should no longer render article cards for the chapter content', () => {
    render(<Ch6 />);

    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
