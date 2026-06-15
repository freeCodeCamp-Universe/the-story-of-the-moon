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

    it('should show the south pole by default with the source credit', () => {
      render(<PolarIceFigure />);

      expect(screen.getByRole('radio', { name: /south pole/i })).toBeChecked();
      expect(screen.getByRole('img', { name: /south pole/i })).toBeInTheDocument();
      expect(screen.getByText(/Moon Mineralogy Mapper \(M3\)\. NASA \/ JPL-Caltech, Li et al\. 2018/i)).toBeInTheDocument();
    });

    it('should switch the map to the north pole when its radio is chosen', async () => {
      const user = userEvent.setup();
      render(<PolarIceFigure />);

      await user.click(screen.getByRole('radio', { name: /north pole/i }));

      expect(screen.getByRole('img', { name: /north pole/i })).toBeInTheDocument();
      expect(screen.queryByRole('img', { name: /south pole/i })).not.toBeInTheDocument();
    });

    it('should toggle the ice highlight off and on', async () => {
      const user = userEvent.setup();
      render(<PolarIceFigure />);

      const highlight = screen.getByRole('switch', { name: /highlight ice/i });
      expect(highlight).not.toBeChecked();

      await user.click(highlight);
      expect(highlight).toBeChecked();

      await user.click(highlight);
      expect(highlight).not.toBeChecked();
    });
  });

  describe('with reduced motion', () => {
    beforeEach(() => {
      mockMatchMedia(true);
    });

    it('should render both poles statically without the pole or highlight controls', () => {
      render(<PolarIceFigure />);

      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.getByRole('img', { name: /south pole/i })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /north pole/i })).toBeInTheDocument();
    });
  });
});
