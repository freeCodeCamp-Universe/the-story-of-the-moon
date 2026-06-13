import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LunarSwirlScene } from './LunarSwirlScene';

// Reduced motion is handled entirely in CSS (the overlay crossfade transitions
// are removed under prefers-reduced-motion). The DOM and the tablist behavior
// are identical either way, so there is no separate reduced-motion branch to
// test here; the control below is operable regardless of motion preference.
//
// The section heading and prose (including the Lunar Vertex line) live in Ch6,
// not in this interactive, so they are covered by Ch6's tests.

describe('LunarSwirlScene', () => {
  it('should render the real Reiner Gamma image with its credit', () => {
    render(<LunarSwirlScene />);

    expect(screen.getByRole('img', { name: /Reiner Gamma/i })).toBeInTheDocument();
    expect(screen.getByText(/NASA \/ GSFC \/ Arizona State University/i)).toBeInTheDocument();
  });

  it('should expose a tablist of three views with the original photo selected by default', () => {
    render(<LunarSwirlScene />);

    expect(screen.getByRole('tablist', { name: /Reiner Gamma views/i })).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(screen.getByRole('tab', { name: 'Original' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/bright loops lying flat/i)).toBeInTheDocument();
  });

  it('should select a view with the pointer and update the caption', async () => {
    const user = userEvent.setup();
    render(<LunarSwirlScene />);

    await user.click(screen.getByRole('tab', { name: 'With the shield' }));

    expect(screen.getByRole('tab', { name: 'With the shield' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/turns the solar wind aside/i)).toBeInTheDocument();
  });

  it('should move and select views with arrow keys, wrapping at the ends', async () => {
    const user = userEvent.setup();
    render(<LunarSwirlScene />);

    screen.getByRole('tab', { name: 'Original' }).focus();

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'With the shield' })).toHaveAttribute('aria-selected', 'true');

    // From index 1: left -> 0, left -> wraps to the last view.
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Without the shield' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Research suggests/i)).toBeInTheDocument();
  });
});
