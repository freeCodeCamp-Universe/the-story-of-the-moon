import { render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { getAsset, moonSamples } from '@/content';

import Ch5 from './Ch5';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('Ch5', () => {
  it('should render Chapter 5 as three headed sections around the sample comparison', () => {
    render(<Ch5 />);

    const intro = screen.getByText('Apollo astronauts brought home 382 kilograms of lunar material between 1969 and 1972, across six crewed landings.');
    const whatCameBack = screen.getByRole('heading', {
      level: 3,
      name: 'What came back',
    });
    const magmaOcean = screen.getByRole('heading', {
      level: 3,
      name: 'An ocean of molten rock',
    });
    const chemicalMatch = screen.getByRole('heading', {
      level: 3,
      name: 'A chemical match',
    });

    expect(intro).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(whatCameBack).toBeInTheDocument();
    expect(magmaOcean).toBeInTheDocument();
    expect(chemicalMatch).toBeInTheDocument();
    expect(whatCameBack.closest('section')).not.toBeNull();
    expect(magmaOcean.closest('section')).not.toBeNull();
    expect(chemicalMatch.closest('section')).not.toBeNull();
  });

  it('should render each lunar sample with an accessible image and its credit-backed caption', () => {
    render(<Ch5 />);

    // Each sample is reachable by its alt text. (The chapter also contains the
    // isotope chart, which is its own labeled image, so a global img count is
    // no longer the right invariant.)
    const sampleImages = moonSamples.map((sample) => screen.getByRole('img', { name: sample.alt }));
    expect(sampleImages).toHaveLength(moonSamples.length);

    for (const sample of moonSamples) {
      const image = screen.getByRole('img', { name: sample.alt });
      const figure = image.closest('figure');
      const credit = getAsset(sample.creditId);

      expect(figure).not.toBeNull();
      if (!figure) {
        throw new Error(`Expected a figure for sample ${sample.id}.`);
      }

      expect(within(figure).getByText(sample.marker)).toBeInTheDocument();
      expect(within(figure).getByText(sample.properties)).toBeInTheDocument();
      expect(within(figure).getByText(sample.detail)).toBeInTheDocument();

      if (!credit) {
        throw new Error(`Expected a credit asset for sample ${sample.id}.`);
      }

      expect(within(figure).getByText(credit.attributionText)).toBeInTheDocument();
    }
  });

  it('should place the sample comparison between the first and second explanatory sections', () => {
    render(<Ch5 />);

    const whatCameBack = screen.getByRole('heading', {
      level: 3,
      name: 'What came back',
    });
    const magmaOcean = screen.getByRole('heading', {
      level: 3,
      name: 'An ocean of molten rock',
    });
    const basaltSample = screen.getByRole('img', {
      name: moonSamples[0].alt,
    });
    const anorthositeSample = screen.getByRole('img', {
      name: moonSamples[1].alt,
    });

    expect(whatCameBack.compareDocumentPosition(basaltSample) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(basaltSample.compareDocumentPosition(magmaOcean) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(whatCameBack.compareDocumentPosition(anorthositeSample) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(anorthositeSample.compareDocumentPosition(magmaOcean) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  });

  it('should render the oxygen-isotope match plot after the chemical-match section', () => {
    render(<Ch5 />);

    const chemicalMatch = screen.getByRole('heading', { level: 3, name: 'A chemical match' });
    const plot = screen.getByRole('figure', { name: /oxygen isotope fingerprint/i });

    expect(plot).toBeInTheDocument();
    expect(chemicalMatch.compareDocumentPosition(plot) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  });
});
