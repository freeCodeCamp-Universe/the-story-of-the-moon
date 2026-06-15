import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('should render its content inside a kbd element', () => {
    const { container } = render(<Kbd>←</Kbd>);

    expect(container.querySelector('kbd')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
  });

  it('should render a kbd element for the muted tone', () => {
    render(<Kbd tone="muted">Shift</Kbd>);

    expect(screen.getByText('Shift', { selector: 'kbd' })).toBeInTheDocument();
  });

  it('should render arrow keys as inline SVG icons', () => {
    const { container } = render(
      <>
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
      </>
    );

    expect(container.querySelectorAll('svg')).toHaveLength(4);
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
  });
});
