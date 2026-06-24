import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { SegmentedControl } from './SegmentedControl';

const OPTIONS = [
  { value: 'a', label: 'First' },
  { value: 'b', label: 'Second' },
] as const;

function Harness() {
  const [value, setValue] = useState<'a' | 'b'>('a');
  return <SegmentedControl name="test" label="Choose one" options={OPTIONS} value={value} onChange={setValue} />;
}

describe('SegmentedControl', () => {
  it('should expose a labeled radiogroup with the current option checked', () => {
    render(<Harness />);

    expect(screen.getByRole('radiogroup', { name: 'Choose one' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'First' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Second' })).not.toBeChecked();
  });

  it('should select another option when clicked', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('radio', { name: 'Second' }));

    expect(screen.getByRole('radio', { name: 'Second' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'First' })).not.toBeChecked();
  });
});
