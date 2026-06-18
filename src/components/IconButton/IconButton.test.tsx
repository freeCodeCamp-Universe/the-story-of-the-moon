import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { IconButton } from '@/components/IconButton/IconButton';

describe('IconButton', () => {
  it('should render a button exposed by its accessible name', () => {
    render(
      <IconButton aria-label="open settings">
        <svg viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="4" />
        </svg>
      </IconButton>
    );

    expect(screen.getByRole('button', { name: 'open settings' })).toBeInTheDocument();
  });

  it('should default to type button and allow override', () => {
    const { rerender } = render(<IconButton aria-label="default type" />);

    expect(screen.getByRole('button', { name: 'default type' })).toHaveAttribute('type', 'button');

    rerender(<IconButton aria-label="submit type" type="submit" />);

    expect(screen.getByRole('button', { name: 'submit type' })).toHaveAttribute('type', 'submit');
  });

  it('should call onClick when activated', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<IconButton aria-label="activate" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'activate' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should forward a ref to the underlying button', () => {
    const ref = createRef<HTMLButtonElement>();

    render(<IconButton ref={ref} aria-label="with ref" />);

    expect(ref.current).toBe(screen.getByRole('button', { name: 'with ref' }));
  });

  it('should forward arbitrary button props', () => {
    render(<IconButton aria-label="expanded" aria-expanded="true" aria-controls="panel-a" />);

    const button = screen.getByRole('button', { name: 'expanded' });

    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', 'panel-a');
  });
});
