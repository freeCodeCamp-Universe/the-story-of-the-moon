import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LunarSwirlScene } from './LunarSwirlScene';

describe('LunarSwirlScene', () => {
  it('should render Original first with exactly one composite image and no switch', () => {
    render(<LunarSwirlScene />);

    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(
      screen.getByRole('img', { name: /reiner gamma/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: /overlaid diagram/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('switch', { name: /magnetic field/i })
    ).not.toBeInTheDocument();
  });

  it('should show shielded annotated view with the field on and a polite consequence caption', async () => {
    const user = userEvent.setup();
    render(<LunarSwirlScene />);

    await user.click(screen.getByRole('radio', { name: 'Annotated' }));

    expect(
      screen.getByRole('switch', { name: /magnetic field/i })
    ).toBeChecked();
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(
      screen.getByRole('img', { name: /arcs loop over the swirl/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/turns the solar wind aside/i)).toBeInTheDocument();
  });

  it('should switch to unshielded and update the accessible name and caption', async () => {
    const user = userEvent.setup();
    render(<LunarSwirlScene />);

    await user.click(screen.getByRole('radio', { name: 'Annotated' }));
    await user.click(screen.getByRole('switch', { name: /magnetic field/i }));

    expect(
      screen.getByRole('switch', { name: /magnetic field/i })
    ).not.toBeChecked();
    expect(
      screen.getByRole('img', { name: /straight down onto the surface/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/reach the ground and slowly darken/i)
    ).toBeInTheDocument();
  });

  it('should restore the shielded consequence when the field is turned back on', async () => {
    const user = userEvent.setup();
    render(<LunarSwirlScene />);

    await user.click(screen.getByRole('radio', { name: 'Annotated' }));
    await user.click(screen.getByRole('switch', { name: /magnetic field/i }));
    await user.click(screen.getByRole('switch', { name: /magnetic field/i }));

    expect(
      screen.getByRole('switch', { name: /magnetic field/i })
    ).toBeChecked();
    expect(
      screen.getByRole('img', { name: /arcs loop over the swirl/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/turns the solar wind aside/i)).toBeInTheDocument();
  });
});
