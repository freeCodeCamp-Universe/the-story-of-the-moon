import { render, screen, within } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import Ch6 from './index';
import styles from './Ch6.module.css';

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px)',
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

describe('Ch6', () => {
  it('should render three labeled cards with the title first in each article', () => {
    render(<Ch6 />);

    const articles = screen.getAllByRole('article');

    expect(articles).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'Floors in permanent shadow', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tunnels under the surface', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "Two halves that don't match", level: 3 })).toBeInTheDocument();

    articles.forEach((article) => {
      expect(article.firstElementChild?.tagName).toBe('DIV');
      expect(article.firstElementChild?.firstElementChild?.tagName).toBe('H3');
      expect(within(article).getByRole('img')).toBeInTheDocument();
      expect(within(article).getByText(/NASA|JAXA/i)).toBeInTheDocument();
    });
  });

  it('should use the stacked container when reduced motion is off', () => {
    const { container } = render(<Ch6 />);

    expect(container.firstElementChild).toHaveClass(styles.stack);
  });
});
