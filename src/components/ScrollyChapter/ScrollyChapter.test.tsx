import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollyChapter } from '@/components/ScrollyChapter/ScrollyChapter';
import { SECTION_NAV_EVENT } from '@/hooks/useKeyboardNav';

vi.mock('@/hooks/useScrollySteps', () => ({
  useScrollySteps: () => 'step-1',
}));

// Returns whether the event went unclaimed (true) or a handler took it over
// with preventDefault (false), mirroring what `scrollToSectionId` observes.
function dispatchSectionNav(id: string) {
  const event = new CustomEvent(SECTION_NAV_EVENT, {
    detail: { id },
    cancelable: true,
  });
  return { wentUnclaimed: window.dispatchEvent(event) };
}

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

  // Guards the drawer-navigation wiring: a section link inside a step must be
  // claimed and centered, since the centered landing is not observable in jsdom
  // (no layout) and only a smoke-tested "in view" check is feasible end-to-end.
  describe('section navigation', () => {
    let scrollIntoView: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // jsdom does not implement scrollIntoView; stub it so the handler can run
      // and so the call is observable.
      scrollIntoView = vi.fn();
      HTMLElement.prototype.scrollIntoView =
        scrollIntoView as unknown as typeof HTMLElement.prototype.scrollIntoView;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should claim a section nav event and center the step owning the heading', () => {
      render(
        <ScrollyChapter
          ariaLabel="Tour"
          visual={<div>Moon visual</div>}
          steps={[
            { id: 'step-1', content: <h3 id="sec-a">A</h3> },
            { id: 'step-2', content: <h3 id="sec-b">B</h3> },
          ]}
        />
      );

      const { wentUnclaimed } = dispatchSectionNav('sec-b');

      expect(wentUnclaimed).toBe(false);
      expect(scrollIntoView).toHaveBeenCalledWith({
        block: 'center',
        behavior: 'smooth',
      });
    });

    it('should ignore a section nav event for a heading outside the container', () => {
      const outside = document.createElement('h3');
      outside.id = 'sec-outside';
      document.body.append(outside);

      render(
        <ScrollyChapter
          ariaLabel="Tour"
          visual={<div>Moon visual</div>}
          steps={[{ id: 'step-1', content: <h3 id="sec-a">A</h3> }]}
        />
      );

      const { wentUnclaimed } = dispatchSectionNav('sec-outside');

      expect(wentUnclaimed).toBe(true);
      expect(scrollIntoView).not.toHaveBeenCalled();
    });
  });
});
