import { fireEvent, render, screen, within } from '@testing-library/react';
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

  it('should offer one legend control per body, naming its value and detail for assistive tech', () => {
    render(<IsotopeMatchPlot />);

    const legend = screen.getByRole('list', { name: /bodies shown/i });
    expect(within(legend).getAllByRole('button')).toHaveLength(
      isotopeBodies.length
    );

    const moon = within(legend).getByRole('button', { name: /^Moon/ });
    expect(moon).toHaveAccessibleName(/approximately 0 parts per thousand/);
    expect(moon).toHaveAccessibleName(/Apollo lunar samples/);
    expect(moon).toHaveAccessibleName(/parts per million/);
  });

  it('should keep the bead clusters out of the tab order (legend is the keyboard path)', () => {
    render(<IsotopeMatchPlot />);

    // Only the four legend entries are controls; clusters are pointer-only.
    expect(screen.getAllByRole('button')).toHaveLength(isotopeBodies.length);
  });

  it('should open an info card with the activated body value and detail', () => {
    render(<IsotopeMatchPlot />);

    const mars = isotopeBodies.find((b) => b.id === 'mars');
    if (!mars) throw new Error('Expected Mars in isotope bodies.');

    // The card text is not present until a control is activated.
    expect(screen.queryAllByText(mars.detail)).toHaveLength(0);

    const legend = screen.getByRole('list', { name: /bodies shown/i });
    const button = within(legend).getByRole('button', { name: /^Mars/ });
    fireEvent.click(button);

    // Rendered twice (inline + floating copies); a media query shows one.
    expect(screen.queryAllByText(mars.detail).length).toBeGreaterThan(0);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should toggle the card closed when the same control is activated again', () => {
    render(<IsotopeMatchPlot />);

    const mars = isotopeBodies.find((b) => b.id === 'mars');
    if (!mars) throw new Error('Expected Mars in isotope bodies.');

    const legend = screen.getByRole('list', { name: /bodies shown/i });
    const button = within(legend).getByRole('button', { name: /^Mars/ });

    fireEvent.click(button);
    expect(screen.queryAllByText(mars.detail).length).toBeGreaterThan(0);

    fireEvent.click(button);
    expect(screen.queryAllByText(mars.detail)).toHaveLength(0);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });
});
