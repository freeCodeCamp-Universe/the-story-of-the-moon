import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MagmaOceanCrossSection } from './MagmaOceanCrossSection';

function renderCrossSection(
  props: Partial<React.ComponentProps<typeof MagmaOceanCrossSection>> = {}
) {
  return render(
    <MagmaOceanCrossSection
      step={0}
      titleId="magma-title"
      descId="magma-desc"
      {...props}
    />
  );
}

function getCrossSection() {
  return screen.getByRole('img', { name: 'Lunar magma ocean cross-section' });
}

function driftCircles(svg: Element) {
  return svg.querySelectorAll('circle');
}

// CSS-module class names are hashed in the test environment, so match the
// token as a substring (e.g. "eruption" within "_eruption_ab12").
function group(svg: Element, token: string) {
  return svg.querySelector(`g[class*="${token}"]`);
}

describe('MagmaOceanCrossSection', () => {
  it('should expose an image with the title as its name and the long-form text equivalent as its description', () => {
    renderCrossSection();

    const svg = screen.getByRole('img', {
      name: 'Lunar magma ocean cross-section',
      description:
        /vertical slice of the young Moon.+builds up from the base.+pushes up through the crust/i,
    });

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-labelledby', 'magma-title');
    expect(svg).toHaveAttribute('aria-describedby', 'magma-desc');
  });

  it('should show only the molten interior at the first step', () => {
    const { container } = renderCrossSection({ step: 0 });
    const svg = getCrossSection();

    expect(svg.querySelector('rect[class*="crust"]')).not.toHaveAttribute(
      'data-visible'
    );
    expect(screen.getByText('crust').closest('g')).not.toHaveAttribute(
      'data-visible'
    );
    expect(group(svg, 'eruption')).not.toHaveAttribute('data-visible');
    expect(group(svg, 'maria')).not.toHaveAttribute('data-visible');
    expect(driftCircles(container.querySelector('svg')!)).toHaveLength(0);
  });

  it('should cap the surface with a crust, label the regions, and drift grains at the cooling step', () => {
    const { container } = renderCrossSection({ step: 1 });
    const svg = getCrossSection();

    expect(svg.querySelector('rect[class*="crust"]')).toHaveAttribute(
      'data-visible'
    );
    expect(screen.getByText('crust').closest('g')).toHaveAttribute(
      'data-visible'
    );
    expect(screen.getByText('mantle').closest('g')).toHaveAttribute(
      'data-visible'
    );
    expect(screen.getByText('hot interior').closest('g')).toHaveAttribute(
      'data-visible'
    );

    // Three grains rise toward the crust and three settle toward the mantle,
    // only while cooling.
    expect(driftCircles(container.querySelector('svg')!)).toHaveLength(6);

    // The maria have not erupted yet.
    expect(group(svg, 'eruption')).not.toHaveAttribute('data-visible');
    expect(group(svg, 'maria')).not.toHaveAttribute('data-visible');
    expect(screen.getByText('maria').closest('g')).not.toHaveAttribute(
      'data-visible'
    );
  });

  it('should keep the crust but drop the region labels and drift once the crust has formed', () => {
    const { container } = renderCrossSection({ step: 2 });
    const svg = getCrossSection();

    // The crust rect stays, but the region labels are shown only at the cooling
    // step, so they are hidden here.
    expect(svg.querySelector('rect[class*="crust"]')).toHaveAttribute(
      'data-visible'
    );
    expect(screen.getByText('crust').closest('g')).not.toHaveAttribute(
      'data-visible'
    );
    expect(screen.getByText('mantle').closest('g')).not.toHaveAttribute(
      'data-visible'
    );
    expect(driftCircles(container.querySelector('svg')!)).toHaveLength(0);
    expect(group(svg, 'eruption')).not.toHaveAttribute('data-visible');
    expect(group(svg, 'maria')).not.toHaveAttribute('data-visible');
  });

  it('should erupt the interior through the crust and flood the surface with maria at the final step', () => {
    const { container } = renderCrossSection({ step: 3 });
    const svg = getCrossSection();

    expect(group(svg, 'eruption')).toHaveAttribute('data-visible');
    expect(group(svg, 'maria')).toHaveAttribute('data-visible');
    expect(screen.getByText('maria').closest('g')).toHaveAttribute(
      'data-visible'
    );

    // The mantle has risen to its final front, built up from the base.
    const mantle = container.querySelector('rect[class*="mantle"]');
    expect(mantle?.getAttribute('style')).toMatch(/--front-scale:\s*0\.62/);
  });

  it('should hide the purely decorative drift and maria layers from assistive tech', () => {
    const { container } = renderCrossSection({ step: 1 });
    const svg = container.querySelector('svg')!;

    const driftGroup = svg
      .querySelector('circle[class*="drift"]')
      ?.closest('g');
    expect(driftGroup).toHaveAttribute('aria-hidden', 'true');
    expect(group(svg, 'maria')).toHaveAttribute('aria-hidden', 'true');
  });
});
