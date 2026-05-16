import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Ch6 from './index';

describe('Ch6', () => {
  it('should render Chapter 6 as three labeled sections with imagery', () => {
    render(<Ch6 />);

    const sections = [
      'Floors in permanent shadow',
      'Tunnels under the surface',
      "Two halves that don't match",
    ].map((name) => screen.getByRole('region', { name }));

    expect(sections).toHaveLength(3);

    sections.forEach((section) => {
      expect(within(section).getByRole('img')).toBeInTheDocument();
      expect(within(section).getByText(/NASA/i)).toBeInTheDocument();
    });
  });

  it('should no longer render article cards for the chapter content', () => {
    render(<Ch6 />);

    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
