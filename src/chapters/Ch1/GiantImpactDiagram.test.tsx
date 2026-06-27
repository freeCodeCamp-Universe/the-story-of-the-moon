import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import GiantImpactDiagram from './GiantImpactDiagram';

describe('GiantImpactDiagram', () => {
  it('should expose the diagram and each stage with accessible names and descriptions', () => {
    render(<GiantImpactDiagram />);

    const figure = screen.getByRole('figure', {
      name: 'The giant-impact hypothesis in four stages.',
    });
    const stageImages = within(figure).getAllByRole('img');

    expect(stageImages).toHaveLength(4);
    expect(
      within(figure).getByRole('img', {
        name: 'Approach stage of the giant-impact hypothesis.',
        description:
          'Theia approaches the young Earth from the upper left on an angled path.',
      })
    ).toBeInTheDocument();
    expect(
      within(figure).getByRole('img', {
        name: 'Impact stage of the giant-impact hypothesis.',
        description:
          'Theia is partly swallowed by Earth during the impact, while bright fragments spray outward.',
      })
    ).toBeInTheDocument();
    expect(
      within(figure).getByRole('img', {
        name: 'Debris-ring stage of the giant-impact hypothesis.',
        description:
          'Earth sits inside a tilted debris ring, with the back half hidden behind the planet and the front half passing in front.',
      })
    ).toBeInTheDocument();
    expect(
      within(figure).getByRole('img', {
        name: 'Coalescence stage of the giant-impact hypothesis.',
        description:
          'A small moon now orbits Earth after the debris ring gathers into one body.',
      })
    ).toBeInTheDocument();
  });

  it("should keep each stage's title and description references unique", () => {
    render(<GiantImpactDiagram />);

    const stageImages = within(
      screen.getByRole('figure', {
        name: 'The giant-impact hypothesis in four stages.',
      })
    ).getAllByRole('img');

    const labelledByIds = new Set<string>();
    const describedByIds = new Set<string>();

    for (const stageImage of stageImages) {
      const labelledById = stageImage.getAttribute('aria-labelledby');
      const describedById = stageImage.getAttribute('aria-describedby');

      expect(labelledById).toBeTruthy();
      expect(describedById).toBeTruthy();

      labelledByIds.add(labelledById!);
      describedByIds.add(describedById!);

      expect(document.getElementById(labelledById!)).toBeInTheDocument();
      expect(document.getElementById(describedById!)).toBeInTheDocument();
    }

    expect(labelledByIds.size).toBe(stageImages.length);
    expect(describedByIds.size).toBe(stageImages.length);
  });

  it('should render visible captions and labels that explain the sequence', () => {
    render(<GiantImpactDiagram />);

    const figure = screen.getByRole('figure', {
      name: 'The giant-impact hypothesis in four stages.',
    });

    expect(within(figure).getByText('Approach')).toBeInTheDocument();
    expect(within(figure).getByText('Impact')).toBeInTheDocument();
    expect(within(figure).getByText('Debris ring')).toBeInTheDocument();
    expect(within(figure).getByText('Coalesce')).toBeInTheDocument();
    expect(within(figure).getByText('Theia')).toBeInTheDocument();
    expect(within(figure).getByText('Earth')).toBeInTheDocument();
    expect(within(figure).getByText('Moon')).toBeInTheDocument();
  });
});
