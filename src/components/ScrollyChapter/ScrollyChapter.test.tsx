import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ScrollyChapter } from '@/components/ScrollyChapter/ScrollyChapter';

vi.mock('@/hooks/useScrollySteps', () => ({
  useScrollySteps: () => 'step-1',
}));

describe('ScrollyChapter', () => {
  it('renders prose steps before the visual in DOM order', () => {
    render(
      <ScrollyChapter
        ariaLabel="Surface feature tour"
        visual={<div>Moon visual</div>}
        visualBelow={<p>Image credit</p>}
        steps={[
          {
            id: 'step-1',
            marker: '11.2°W',
            content: <h3>Tycho</h3>,
          },
        ]}
      />
    );

    const group = screen.getByRole('group', {
      name: 'Surface feature tour',
    });
    const children = Array.from(group.children);

    expect(children[0]?.tagName).toBe('OL');
    expect(children[0]).toContainElement(
      screen.getByRole('heading', { name: 'Tycho' })
    );
    expect(children[1]).toContainElement(screen.getByText('Moon visual'));
    expect(children[1]).toContainElement(screen.getByText('Image credit'));
  });
});
