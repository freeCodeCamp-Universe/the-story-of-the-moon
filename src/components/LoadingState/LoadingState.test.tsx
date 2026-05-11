import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LoadingState from './index';

describe('LoadingState', () => {
  it('renders an accessible status live region', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('provides visible loading text for screen readers', () => {
    render(<LoadingState />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('hides the SVG from assistive technology', () => {
    const { container } = render(<LoadingState />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
