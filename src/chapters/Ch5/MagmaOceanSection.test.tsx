import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { magmaOcean } from '@/content';

import { MagmaOceanSection } from './MagmaOceanSection';

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

describe('MagmaOceanSection (animated)', () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it('should render a static cross-section, a button per step, and the first step caption', () => {
    render(<MagmaOceanSection />);

    expect(screen.getByRole('img', { name: /magma ocean cross-section/i })).toBeInTheDocument();

    for (const s of magmaOcean) {
      expect(screen.getByRole('button', { name: s.marker })).toBeInTheDocument();
    }

    expect(screen.getByText(magmaOcean[0].caption)).toBeInTheDocument();
  });

  it('should mark the first step current on load and rove tabindex to it', () => {
    render(<MagmaOceanSection />);

    const first = screen.getByRole('button', { name: magmaOcean[0].marker });
    const second = screen.getByRole('button', { name: magmaOcean[1].marker });

    expect(first).toHaveAttribute('aria-current', 'step');
    expect(first).toHaveAttribute('tabindex', '0');
    expect(second).not.toHaveAttribute('aria-current');
    expect(second).toHaveAttribute('tabindex', '-1');
  });

  it('should move between steps with the arrow keys and follow focus', async () => {
    const user = userEvent.setup();
    render(<MagmaOceanSection />);

    const first = screen.getByRole('button', { name: magmaOcean[0].marker });
    const second = screen.getByRole('button', { name: magmaOcean[1].marker });

    expect(first).toHaveAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight');

    first.focus();
    await user.keyboard('{ArrowRight}');

    expect(second).toHaveFocus();
    expect(second).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText(magmaOcean[1].caption)).toBeInTheDocument();

    await user.keyboard('{ArrowLeft}');
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute('aria-current', 'step');
  });

  it('should select a step, update the caption, and move aria-current when a step button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<MagmaOceanSection />);

    const target = magmaOcean[2];
    await user.click(screen.getByRole('button', { name: target.marker }));

    expect(screen.getByText(target.caption)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: target.marker })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('button', { name: magmaOcean[0].marker })).not.toHaveAttribute('aria-current');

    // The live region mirrors the active step for assistive tech.
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toContain(target.marker);
  });
});

describe('MagmaOceanSection (reduced motion)', () => {
  beforeEach(() => {
    mockMatchMedia(true);
  });

  it('should show every step as static text and no step controls', () => {
    render(<MagmaOceanSection />);

    expect(screen.getByRole('img', { name: /magma ocean cross-section/i })).toBeInTheDocument();

    for (const step of magmaOcean) {
      expect(screen.getByText(step.caption)).toBeInTheDocument();
    }

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
