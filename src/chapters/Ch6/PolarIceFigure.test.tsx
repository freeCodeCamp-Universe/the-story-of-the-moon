import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PolarIceFigure } from './PolarIceFigure';

function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('PolarIceFigure', () => {
  describe('with motion allowed', () => {
    beforeEach(() => {
      mockMatchMedia(false);
    });

    it('should render the North pole first on initial mount', () => {
      render(<PolarIceFigure />);

      expect(screen.getByRole('radio', { name: /north pole/i })).toBeChecked();
      expect(
        screen.getByRole('img', { name: /north pole/i })
      ).toBeInTheDocument();
    });

    it('should expose the composite as exactly one image', () => {
      render(<PolarIceFigure />);

      expect(screen.getAllByRole('img')).toHaveLength(1);
      expect(
        screen.getByRole('img', { name: /north pole/i })
      ).toBeInTheDocument();
    });

    it('should update image name and credit when South is selected', async () => {
      const user = userEvent.setup();
      render(<PolarIceFigure />);

      await user.click(screen.getByRole('radio', { name: /south pole/i }));

      expect(
        screen.getByRole('img', { name: /south pole/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Surface water ice at the Moon's south pole/i)
      ).toBeInTheDocument();
    });

    it('should keep the composite image name and visible credit when Highlight ice is turned on', async () => {
      const user = userEvent.setup();
      render(<PolarIceFigure />);

      await user.click(screen.getByRole('switch', { name: /highlight ice/i }));

      expect(screen.getByRole('img')).toHaveAccessibleName(
        /highlighted in bright cyan against the dimmed relief/i
      );
      expect(screen.getByRole('img')).toHaveAccessibleName(/north pole/i);
    });

    it('should not include highlight text in the image name when Highlight ice is off', async () => {
      render(<PolarIceFigure />);

      expect(screen.getByRole('img')).toHaveAccessibleName(/north pole/i);
      expect(screen.getByRole('img')).not.toHaveAccessibleName(
        /highlighted in bright cyan against the dimmed relief/i
      );
    });
  });
});
