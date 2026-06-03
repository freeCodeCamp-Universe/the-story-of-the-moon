import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { isotopeBodies } from '@/content';

import { IsotopeMatchPlot } from './IsotopeMatchPlot';

describe('IsotopeMatchPlot', () => {
  it('should expose the chart as an image describing the Earth-Moon match', () => {
    render(<IsotopeMatchPlot />);

    expect(
      screen.getByRole('img', {
        name: /three-isotope plot/i,
        description: /moon/i,
      })
    ).toBeInTheDocument();
  });

  it("should describe that the Moon's samples fall on Earth's line", () => {
    render(<IsotopeMatchPlot />);

    const plot = screen.getByRole('img', { name: /three-isotope plot/i });
    const descId = plot.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();

    const desc = document.getElementById(descId as string);
    expect(desc?.textContent).toMatch(/Earth's line/i);
  });

  it('should list every body in a side legend', () => {
    render(<IsotopeMatchPlot />);

    const legend = screen.getByRole('list', { name: /bodies shown/i });

    for (const body of isotopeBodies) {
      expect(within(legend).getByText(body.name)).toBeInTheDocument();
    }
  });

  it('should not render interactive controls', () => {
    render(<IsotopeMatchPlot />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
