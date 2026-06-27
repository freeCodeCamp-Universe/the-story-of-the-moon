import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('should render its content inside a kbd element', () => {
    const { container } = render(<Kbd>Shift</Kbd>);

    expect(container.querySelector('kbd')).toBeInTheDocument();
    expect(screen.getByText('Shift')).toBeInTheDocument();
  });

  it('should render a kbd element for the muted tone', () => {
    render(<Kbd tone="muted">Shift</Kbd>);

    expect(screen.getByText('Shift', { selector: 'kbd' })).toBeInTheDocument();
  });

  it('should render arrow keys as inline SVG icons with a spoken label', () => {
    const { container } = render(
      <>
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        <Kbd>↑</Kbd>
        <Kbd>↓</Kbd>
      </>
    );

    expect(container.querySelectorAll('svg')).toHaveLength(4);
    expect(screen.getByText('Left arrow')).toBeInTheDocument();
    expect(screen.getByText('Right arrow')).toBeInTheDocument();
    expect(screen.getByText('Up arrow')).toBeInTheDocument();
    expect(screen.getByText('Down arrow')).toBeInTheDocument();
  });

  it('should announce the label while hiding the glyph for punctuation keys', () => {
    render(<Kbd label="left bracket">[</Kbd>);

    expect(screen.getByText('left bracket')).toBeInTheDocument();
    expect(screen.getByText('[')).toHaveAttribute('aria-hidden', 'true');
  });
});
