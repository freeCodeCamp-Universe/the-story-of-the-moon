import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LunarSwirlScene } from './LunarSwirlScene';

// Reduced motion is handled entirely in CSS (the overlay crossfade transitions
// are removed under prefers-reduced-motion). The DOM and the control behavior
// are identical either way, so there is no separate reduced-motion branch here.
//
// The section heading and prose (including the Lunar Vertex line) live in Ch6,
// not in this interactive, so they are covered by Ch6's tests.

describe('LunarSwirlScene', () => {
  it('should render the real Reiner Gamma image with its credit', () => {
    render(<LunarSwirlScene />);

    expect(
      screen.getByRole('img', { name: /Reiner Gamma/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NASA \/ GSFC \/ Arizona State University/i)
    ).toBeInTheDocument();
  });

  it('should show the original photo by default, with no caption or field switch', () => {
    render(<LunarSwirlScene />);

    expect(
      screen.getByRole('radiogroup', { name: /Reiner Gamma view/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Original' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Annotated' })).not.toBeChecked();
    expect(
      screen.queryByRole('switch', { name: /magnetic field/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/turns the solar wind aside/i)
    ).not.toBeInTheDocument();
  });

  it('should reveal the shielded explanation with the field on when Annotated is chosen', async () => {
    const user = userEvent.setup();
    render(<LunarSwirlScene />);

    await user.click(screen.getByRole('radio', { name: 'Annotated' }));

    expect(
      screen.getByRole('switch', { name: /magnetic field/i })
    ).toBeChecked();
    expect(screen.getByText(/turns the solar wind aside/i)).toBeInTheDocument();
    expect(screen.getByText(/turns the solar wind aside/i)).toHaveAttribute(
      'aria-live',
      'polite'
    );
  });

  it('should switch to the unshielded explanation when the magnetic field is turned off', async () => {
    const user = userEvent.setup();
    render(<LunarSwirlScene />);

    await user.click(screen.getByRole('radio', { name: 'Annotated' }));
    await user.click(screen.getByRole('switch', { name: /magnetic field/i }));

    expect(
      screen.getByRole('switch', { name: /magnetic field/i })
    ).not.toBeChecked();
    expect(screen.getByText(/Research suggests/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/turns the solar wind aside/i)
    ).not.toBeInTheDocument();
  });

  it('should return to the bare photo when Original is reselected', async () => {
    const user = userEvent.setup();
    render(<LunarSwirlScene />);

    await user.click(screen.getByRole('radio', { name: 'Annotated' }));
    await user.click(screen.getByRole('radio', { name: 'Original' }));

    expect(
      screen.queryByRole('switch', { name: /magnetic field/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/turns the solar wind aside/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Research suggests/i)).not.toBeInTheDocument();
  });
});
