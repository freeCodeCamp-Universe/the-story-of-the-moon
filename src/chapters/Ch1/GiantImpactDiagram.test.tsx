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
        name: 'Approach',
        description:
          'On a starfield, a small grey planet labeled Theia sits at the upper left and a larger blue-and-white planet labeled Earth at the lower right. A white dashed arrow runs from Theia down toward Earth, marking its slanted collision course.',
      })
    ).toBeInTheDocument();
    expect(
      within(figure).getByRole('img', {
        name: 'Impact',
        description:
          'Theia has crossed the scene and now strikes Earth just left of center, the smaller grey planet overlapping the upper-left edge of the larger blue one. A spray of white rock fragments and dust blasts outward to the upper left, back along the path Theia came in on.',
      })
    ).toBeInTheDocument();
    expect(
      within(figure).getByRole('img', {
        name: 'Debris ring',
        description:
          'The blue Earth sits at the center, encircled by a tilted ring of grey rubble, dust, and angular chunks orbiting around it.',
      })
    ).toBeInTheDocument();
    expect(
      within(figure).getByRole('img', {
        name: 'Coalesce',
        description:
          'The debris is gone. The blue Earth sits at the right and a small grey, cratered Moon, labeled, sits at the upper left.',
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

    const approachCaption = within(figure).getByText('Approach', {
      selector: 'p',
    });
    const impactCaption = within(figure).getByText('Impact', {
      selector: 'p',
    });
    const debrisCaption = within(figure).getByText('Debris ring', {
      selector: 'p',
    });
    const coalesceCaption = within(figure).getByText('Coalesce', {
      selector: 'p',
    });

    expect(approachCaption).toBeInTheDocument();
    expect(impactCaption).toBeInTheDocument();
    expect(debrisCaption).toBeInTheDocument();
    expect(coalesceCaption).toBeInTheDocument();
    expect(approachCaption).toHaveAttribute('aria-hidden', 'true');
    expect(impactCaption).toHaveAttribute('aria-hidden', 'true');
    expect(debrisCaption).toHaveAttribute('aria-hidden', 'true');
    expect(coalesceCaption).toHaveAttribute('aria-hidden', 'true');
    expect(within(figure).getByText('Theia')).toBeInTheDocument();
    expect(within(figure).getByText('Earth')).toBeInTheDocument();
    expect(within(figure).getByText('Moon')).toBeInTheDocument();
  });
});
