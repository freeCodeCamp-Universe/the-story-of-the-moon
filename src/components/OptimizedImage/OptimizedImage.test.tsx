import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, should } from 'vitest';

import OptimizedImage from './index';

const chaiShould = should();

describe('OptimizedImage', () => {
  it('should render a derived avif source for jpeg inputs', async () => {
    const user = userEvent.setup();
    render(<OptimizedImage src="/postcards/eclipse.jpg" alt="Eclipse" />);

    const image = screen.getByRole('img', { name: 'Eclipse' });
    const picture = image.closest('picture');
    const source = picture?.querySelector('source');

    await user.hover(image);

    chaiShould.equal(picture instanceof HTMLPictureElement, true);
    if (!(source instanceof HTMLSourceElement)) {
      throw new Error('Expected an AVIF source element.');
    }

    chaiShould.equal(source.getAttribute('srcset'), '/postcards/eclipse.avif');
    chaiShould.equal(source.getAttribute('type'), 'image/avif');
    chaiShould.equal(image.getAttribute('src'), '/postcards/eclipse.jpg');
    chaiShould.equal(image.getAttribute('decoding'), 'auto');
  });

  it('should keep lazy images on async decoding', () => {
    render(<OptimizedImage src="/postcards/bootprint.jpg" alt="Bootprint" loading="lazy" />);

    chaiShould.equal(
      screen.getByRole('img', { name: 'Bootprint' }).getAttribute('decoding'),
      'async'
    );
  });

  it('should render a plain img for svg inputs', () => {
    const { container } = render(<OptimizedImage src="/ch3/with-moon.svg" alt="Diagram" />);
    const image = screen.queryByRole('img', { name: 'Diagram' });

    chaiShould.equal(container.querySelector('source'), null);
    if (!(image instanceof HTMLImageElement)) {
      throw new Error('Expected an image element.');
    }
    chaiShould.equal(image.getAttribute('src'), '/ch3/with-moon.svg');
  });

  it('should honor a caller supplied avif srcSet', () => {
    render(
      <OptimizedImage
        src="/ch2/hertzsprung.jpg"
        avifSrcSet="/ch2/hertzsprung-800.avif 800w, /ch2/hertzsprung-1600.avif 1600w"
        sizes="(min-width: 768px) 50vw, 100vw"
        alt="Hertzsprung basin"
      />
    );

    const image = screen.getByRole('img', { name: 'Hertzsprung basin' });
    const source = image.closest('picture')?.querySelector('source');

    if (!(source instanceof HTMLSourceElement)) {
      throw new Error('Expected an AVIF source element.');
    }

    chaiShould.equal(
      source.getAttribute('srcset'),
      '/ch2/hertzsprung-800.avif 800w, /ch2/hertzsprung-1600.avif 1600w'
    );
    chaiShould.equal(source.getAttribute('sizes'), '(min-width: 768px) 50vw, 100vw');
    chaiShould.equal(source.getAttribute('type'), 'image/avif');
  });
});
