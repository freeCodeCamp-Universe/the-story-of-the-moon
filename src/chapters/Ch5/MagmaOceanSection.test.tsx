import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MagmaOceanSection } from './MagmaOceanSection';

const magmaOcean = [
  { id: 'molten', marker: 'Molten ocean' },
  { id: 'cooling', marker: 'Cooling' },
  { id: 'crust', marker: 'Layers form' },
  { id: 'maria', marker: 'Lava floods' },
] as const;

describe('MagmaOceanSection', () => {
  it('should render one static cross-section per step', () => {
    render(<MagmaOceanSection steps={magmaOcean} />);

    expect(
      screen.getAllByRole('img', { name: /magma ocean cross-section/i })
    ).toHaveLength(magmaOcean.length);
  });

  it('should label each stage with its marker', () => {
    render(<MagmaOceanSection steps={magmaOcean} />);

    for (const step of magmaOcean) {
      expect(screen.getByText(step.marker)).toBeInTheDocument();
    }
  });

  it('should not render any step controls', () => {
    render(<MagmaOceanSection steps={magmaOcean} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
