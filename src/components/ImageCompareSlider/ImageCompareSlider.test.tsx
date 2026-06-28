import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ImageCompareSlider } from '@/components/ImageCompareSlider/ImageCompareSlider';

function Harness() {
  const [value, setValue] = useState(50);

  return (
    <>
      <p id="compare-help">Use O for original and T for topographic.</p>
      <p className="sr-only" aria-live="polite">
        {value === 100
          ? 'Full original view'
          : value === 0
            ? 'Full topographic view'
            : `${value}% original, ${100 - value}% topographic`}
      </p>
      <ImageCompareSlider
        label="Compare Hertzsprung views"
        originalSrc="/ch2/hertzsprung.jpg"
        originalAlt="Original Hertzsprung basin photomosaic."
        originalLabel="Original"
        topographicSrc="/ch2/hertzsprung-topographic.jpg"
        topographicAlt="Topographic elevation map of Hertzsprung basin."
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

    expect(slider).toHaveAttribute('aria-valuenow', '50');
    expect(slider).toHaveAttribute(
      'aria-valuetext',
      '50% original, 50% topographic'
    );

    await user.tab();
    expect(slider).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');

    expect(slider).toHaveAttribute('aria-valuenow', '52');
    expect(slider).toHaveAttribute(
      'aria-valuetext',
      '52% original, 48% topographic'
    );

    await user.keyboard('{PageDown}');
    expect(slider).toHaveAttribute('aria-valuenow', '42');
    expect(slider).toHaveAttribute(
      'aria-valuetext',
      '42% original, 58% topographic'
    );
  });

  it('should describe both views in one combined text alternative and hide the raw images from assistive tech', () => {
    render(<Harness />);

    // The layered images are decorative; their meaning is carried once, in
    // reading order (original then topographic), so a screen reader announces
    // the whole comparison at once rather than stepping through two images.
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    const slider = screen.getByRole('slider', {
      name: 'Compare Hertzsprung views',
    });
    expect(slider).toHaveAccessibleDescription(
      'Original Hertzsprung basin photomosaic. Topographic elevation map of Hertzsprung basin. Use O for original and T for topographic.'
    );
  });

  it('should not snap back to a drag-time value when the value changes externally during pointer interaction', () => {
    function ExternalDriver() {
      const [value, setValue] = useState(50);

      return (
        <>
          <button type="button" onClick={() => setValue(100)}>
            Force original
          </button>
          <ImageCompareSlider
            label="Compare views"
            originalSrc="/o.jpg"
            originalAlt=""
            originalLabel="Original"
            topographicSrc="/t.jpg"
            topographicAlt="Topographic view."
            topographicLabel="Topographic"
            value={value}
            onValueChange={setValue}
          />
        </>
      );
    }

    const { container } = render(<ExternalDriver />);

    const frame = container.querySelector<HTMLDivElement>('[class*="frame"]');
    expect(frame).not.toBeNull();
    if (!frame) return;

    const setCaptureSpy = vi.fn();
    const releaseCaptureSpy = vi.fn();
    const hasCaptureSpy = vi.fn().mockReturnValue(true);
    frame.setPointerCapture = setCaptureSpy;
    frame.releasePointerCapture = releaseCaptureSpy;
    frame.hasPointerCapture = hasCaptureSpy;
    frame.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 400,
      bottom: 200,
      width: 400,
      height: 200,
      toJSON: () => '',
    });

    fireEvent.pointerDown(frame, { pointerId: 7, button: 0, clientX: 240 });

    const slider = screen.getByRole('slider', { name: 'Compare views' });
    expect(slider).toHaveAttribute('aria-valuenow', '60');

    fireEvent.click(screen.getByRole('button', { name: 'Force original' }));
    expect(slider).toHaveAttribute('aria-valuenow', '100');

    fireEvent.pointerMove(frame, { pointerId: 7, clientX: 240 });
    expect(slider).toHaveAttribute('aria-valuenow', '100');

    fireEvent.pointerUp(frame, { pointerId: 7 });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
  });
});
