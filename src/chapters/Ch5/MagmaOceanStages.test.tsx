import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MagmaOceanStages } from './MagmaOceanStages';

const magmaOcean = [
  { id: 'molten', marker: 'Molten ocean' },
  { id: 'cooling', marker: 'Cooling' },
  { id: 'crust', marker: 'Layers form' },
  { id: 'maria', marker: 'Lava floods' },
] as const;

describe('MagmaOceanStages', () => {
  it('should render one static cross-section per step', () => {
    render(<MagmaOceanStages steps={magmaOcean} />);

    expect(
      screen.getAllByRole('img', {
        name: /molten ocean|cooling|layers form|lava floods/i,
      })
    ).toHaveLength(magmaOcean.length);
  });

  it('should label each stage with its marker', () => {
    render(<MagmaOceanStages steps={magmaOcean} />);

    for (const step of magmaOcean) {
      const caption = screen.getByText(step.marker, { selector: 'p' });
      expect(caption).toBeInTheDocument();
      expect(caption).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('should not render any step controls', () => {
    render(<MagmaOceanStages steps={magmaOcean} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
