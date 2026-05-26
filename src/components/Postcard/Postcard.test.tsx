import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AssetCredit, PostcardData } from '@/types/content';

vi.mock('@/content', () => ({
  getAsset: vi.fn(),
}));

import { getAsset } from '@/content';

import { Postcard } from './Postcard';

const credit: AssetCredit = {
  id: 'eclipse-photo',
  file: 'postcards/eclipse.jpg',
  alt: 'A solar eclipse seen above Earth',
  source: 'NASA',
  sourceUrl: 'https://example.com/eclipse',
  author: 'NASA',
  license: 'Public domain',
  licenseUrl: 'https://example.com/license',
  attributionText: 'NASA, 1969',
};

const postcardWithCaption: PostcardData = {
  id: 'eclipse',
  placement: { after: 'ch2' },
  image: {
    src: '/postcards/eclipse.jpg',
    alt: 'A solar eclipse seen above Earth',
    creditId: 'eclipse-photo',
  },
  caption: 'An eclipse framed the Earth and Moon together.',
};

const postcardWithoutCaption: PostcardData = {
  id: 'moon-disc',
  placement: { after: 'ch1' },
  image: {
    src: '/postcards/apollo-17-moon-disc.jpg',
    alt: 'The Moon as a full disc',
    creditId: 'apollo-17-moon-disc',
  },
  caption: '',
};

describe('Postcard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the postcard image, caption, and resolved credit', () => {
    vi.mocked(getAsset).mockReturnValue(credit);

    render(<Postcard postcard={postcardWithCaption} />);

    const image = screen.getByRole('img', {
      name: 'A solar eclipse seen above Earth',
    });
    const figure = image.closest('figure');

    expect(image).toHaveAttribute('src', '/postcards/eclipse.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(figure).not.toBeNull();

    if (!figure) {
      throw new Error('Expected the postcard image to be wrapped in a figure.');
    }

    expect(within(figure).getByText('An eclipse framed the Earth and Moon together.')).toBeInTheDocument();
    expect(within(figure).getByText('NASA, 1969')).toBeInTheDocument();
  });

  it('should leave the caption empty when both caption text and credit are missing', () => {
    vi.mocked(getAsset).mockReturnValue(undefined);

    const { container } = render(<Postcard postcard={postcardWithoutCaption} />);
    const figcaption = container.querySelector('figcaption');

    expect(figcaption).not.toBeNull();
    expect(figcaption).toBeEmptyDOMElement();
  });
});
