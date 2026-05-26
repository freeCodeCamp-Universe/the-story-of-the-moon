import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { AssetCredit } from '@/types/content';

import { CreditCaption } from './CreditCaption';

const credit: AssetCredit = {
  id: 'earthrise',
  file: 'postcards/earthrise.jpg',
  alt: 'Earth rising above the lunar horizon',
  source: 'NASA',
  sourceUrl: 'https://example.com/earthrise',
  author: 'NASA',
  license: 'Public domain',
  licenseUrl: 'https://example.com/license',
  attributionText: 'NASA, Earthrise',
};

describe('CreditCaption', () => {
  it('should render the attribution text in a paragraph', () => {
    render(<CreditCaption credit={credit} />);

    expect(screen.getByText('NASA, Earthrise').tagName).toBe('P');
  });
});
