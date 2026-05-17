import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import OptimizedImage from './index';

describe('OptimizedImage', () => {
  it('renders a webp source for jpeg inputs', () => {
    const { container } = render(<OptimizedImage src="/postcards/eclipse.jpg" alt="Eclipse" />);

    const source = container.querySelector('source');
    const image = screen.getByAltText('Eclipse');

    expect(source).not.toBeNull();
    expect(source).toHaveAttribute('srcset', '/postcards/eclipse.webp');
    expect(image).toHaveAttribute('src', '/postcards/eclipse.jpg');
    expect(image).toHaveAttribute('decoding', 'auto');
  });

  it('keeps lazy images on async decoding', () => {
    render(<OptimizedImage src="/postcards/bootprint.jpg" alt="Bootprint" loading="lazy" />);

    expect(screen.getByAltText('Bootprint')).toHaveAttribute('decoding', 'async');
  });

  it('renders a plain img for svg inputs', () => {
    const { container } = render(<OptimizedImage src="/ch3/with-moon.svg" alt="Diagram" />);

    expect(container.querySelector('source')).toBeNull();
    expect(screen.getByAltText('Diagram')).toHaveAttribute('src', '/ch3/with-moon.svg');
  });

  it('uses custom responsive webp sources when provided', () => {
    const { container } = render(
      <OptimizedImage
        src="/ch2/hertzsprung.jpg"
        webpSrcSet="/ch2/hertzsprung-800.webp 800w, /ch2/hertzsprung-1600.webp 1600w"
        sizes="(min-width: 700px) 50vw, 100vw"
        alt="Hertzsprung basin"
      />
    );

    expect(container.querySelector('source')).toHaveAttribute(
      'srcset',
      '/ch2/hertzsprung-800.webp 800w, /ch2/hertzsprung-1600.webp 1600w'
    );
    expect(container.querySelector('source')).toHaveAttribute(
      'sizes',
      '(min-width: 700px) 50vw, 100vw'
    );
  });
});
