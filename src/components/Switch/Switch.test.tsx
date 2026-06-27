import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from './Switch';

function ControlledSwitch({
  initial = false,
  label = 'Enable feature',
}: {
  initial?: boolean;
  label?: string;
}) {
  const [checked, setChecked] = useState(initial);
  return <Switch label={label} checked={checked} onChange={setChecked} />;
}

describe('Switch', () => {
  it('should expose a switch role with the label as its accessible name', () => {
    render(<Switch label="Highlight ice" checked={false} onChange={vi.fn()} />);

    const control = screen.getByRole('switch', { name: 'Highlight ice' });
    expect(control).not.toBeChecked();
  });

  it('should reflect the checked prop', () => {
    render(<Switch label="Highlight ice" checked onChange={vi.fn()} />);

    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('should call onChange with the next value when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Switch label="Highlight ice" checked={false} onChange={onChange} />
    );

    await user.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should toggle when operated by keyboard', async () => {
    const user = userEvent.setup();
    render(<ControlledSwitch />);

    const control = screen.getByRole('switch');
    control.focus();
    await user.keyboard(' ');

    expect(control).toBeChecked();
  });
});
