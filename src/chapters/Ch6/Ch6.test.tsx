import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Ch6 from './index';

describe('Ch6', () => {
  it('should render Chapter 6 as three labeled sections with imagery', () => {
    render(<Ch6 />);

    const sectionNames = [
      'Floors in permanent shadow',
      'Tunnels under the surface',
      "Two halves that don't match",
    ] as const;
    const sections = sectionNames.map((name) => screen.getByRole('region', { name }));

    expect(sections).toHaveLength(3);

    const expectedImageCounts = [1, 1, 2];

    sections.forEach((section, index) => {
      expect(within(section).getAllByRole('img')).toHaveLength(expectedImageCounts[index]);
      expect(within(section).getAllByText(/NASA/i).length).toBeGreaterThan(0);
    });

    const halvesSection = screen.getByRole('region', { name: "Two halves that don't match" });
    expect(within(halvesSection).getAllByRole('img').map((image) => image.getAttribute('alt'))).toEqual([
      "Near side of Earth's Moon as mapped from Lunar Reconnaissance Orbiter camera data, with broad dark maria spread across the face.",
      "Far side of Earth's Moon as mapped from Lunar Reconnaissance Orbiter camera data, showing a brighter, densely cratered surface with almost no dark maria.",
    ]);
  });

  it('should no longer render article cards for the chapter content', () => {
    render(<Ch6 />);

    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
