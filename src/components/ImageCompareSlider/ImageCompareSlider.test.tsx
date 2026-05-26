import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { ImageCompareSlider } from '@/components/ImageCompareSlider/ImageCompareSlider';

function Harness() {
  const [value, setValue] = useState(50);

  return (
    <>
      <p id="compare-help">Use O for original and T for topographic.</p>
      <p className="sr-only" aria-live="polite">
        {value === 100 ? 'Full original view' : value === 0 ? 'Full topographic view' : `${value}% original, ${100 - value}% topographic`}
      </p>
      <ImageCompareSlider
        label="Compare Hertzsprung views"
        originalSrc="/ch2/hertzsprung.jpg"
        originalAlt="Original Hertzsprung basin photomosaic."
        originalLabel="Original"
        topographicSrc="/ch2/hertzsprung-topographic.jpg"
        topographicLabel="Topographic"
        describedBy="compare-help"
        value={value}
        onValueChange={setValue}
      />
    </>
  );
}

describe('ImageCompareSlider', () => {
  it('should support keyboard interaction on the slider itself', async () => {
    const user = userEvent.setup();

    render(<Harness />);

    const slider = screen.getByRole('slider', {
      name: 'Compare Hertzsprung views',
    });

    expect(slider).toHaveValue('50');
    expect(slider).toHaveAttribute('aria-valuetext', '50% original, 50% topographic');

    await user.tab();
    expect(slider).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');

    expect(slider).toHaveValue('52');
    expect(slider).toHaveAttribute('aria-valuetext', '52% original, 48% topographic');

    await user.keyboard('{PageDown}');
    expect(slider).toHaveValue('42');
    expect(slider).toHaveAttribute('aria-valuetext', '42% original, 58% topographic');
  });
});
