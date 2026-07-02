import type { RefObject } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ChapterDrawer } from './ChapterDrawer';

const originalDialogShowModal =
  globalThis.HTMLDialogElement?.prototype.showModal;
const originalDialogClose = globalThis.HTMLDialogElement?.prototype.close;
// jsdom does not implement scrollIntoView; the drawer calls it to reveal the
// active row on open.
const originalScrollIntoView = globalThis.HTMLElement?.prototype.scrollIntoView;

function createTriggerRef(): RefObject<HTMLElement | null> {
  const trigger = document.createElement('button');
  document.body.append(trigger);

  return { current: trigger };
}

function renderDrawer({
  isOpen = true,
  activeChapterId = 'chapter-1',
  activeSectionId = null,
}: {
  isOpen?: boolean;
  activeChapterId?: string;
  activeSectionId?: string | null;
} = {}) {
  const triggerRef = createTriggerRef();
  const onSelectChapter = vi.fn();
  const onSelectSection = vi.fn();
  const onClose = vi.fn();

  render(
    <ChapterDrawer
      isOpen={isOpen}
      activeChapterId={activeChapterId}
      activeSectionId={activeSectionId}
      onSelectChapter={onSelectChapter}
      onSelectSection={onSelectSection}
      onClose={onClose}
      triggerRef={triggerRef}
    />
  );

  return { triggerRef, onSelectChapter, onSelectSection, onClose };
}

describe('ChapterDrawer', () => {
  beforeAll(() => {
    if (
      globalThis.HTMLDialogElement &&
      typeof globalThis.HTMLDialogElement.prototype.showModal !== 'function'
    ) {
      Object.defineProperty(
        globalThis.HTMLDialogElement.prototype,
        'showModal',
        {
          configurable: true,
          value() {
            this.setAttribute('open', '');
          },
        }
      );
    }

    if (
      globalThis.HTMLDialogElement &&
      typeof globalThis.HTMLDialogElement.prototype.close !== 'function'
    ) {
      Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
        configurable: true,
        value() {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        },
      });
    }

    globalThis.HTMLElement.prototype.scrollIntoView = () => {};
  });

  afterAll(() => {
    if (originalScrollIntoView) {
      globalThis.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    }

    if (globalThis.HTMLDialogElement) {
      if (originalDialogShowModal) {
        Object.defineProperty(
          globalThis.HTMLDialogElement.prototype,
          'showModal',
          { configurable: true, value: originalDialogShowModal }
        );
      }

      if (originalDialogClose) {
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
          configurable: true,
          value: originalDialogClose,
        });
      }
    }
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should render nothing while closed', () => {
    renderDrawer({ isOpen: false });

    expect(
      screen.queryByRole('button', { name: '1. A violent beginning, perhaps' })
    ).not.toBeInTheDocument();
  });

  it('should render every chapter and its subsections', () => {
    renderDrawer();

    expect(
      screen.getByRole('button', { name: '1. A violent beginning, perhaps' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '7. A timeless observer' })
    ).toBeInTheDocument();
    // Subsections surface as their own rows.
    expect(screen.getByRole('button', { name: 'Crater' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: "Two halves that don't match" })
    ).toBeInTheDocument();
  });

  it('should call onSelectChapter with the clicked chapter id', async () => {
    const user = userEvent.setup();
    const { onSelectChapter } = renderDrawer();

    await user.click(
      screen.getByRole('button', { name: '5. What the rocks told us' })
    );

    expect(onSelectChapter).toHaveBeenCalledWith('chapter-5');
  });

  it('should call onSelectSection with the clicked section id', async () => {
    const user = userEvent.setup();
    const { onSelectSection } = renderDrawer();

    await user.click(screen.getByRole('button', { name: 'Crater' }));

    expect(onSelectSection).toHaveBeenCalledWith('ch2-crater-heading');
  });

  it('should mark the active subsection, not its parent chapter', () => {
    renderDrawer({
      activeChapterId: 'chapter-2',
      activeSectionId: 'ch2-crater-heading',
    });

    expect(screen.getByRole('button', { name: 'Crater' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(
      screen.getByRole('button', { name: '2. A face written by impacts' })
    ).not.toHaveAttribute('aria-current');
  });

  it('should mark the active chapter when no subsection is active', () => {
    renderDrawer({ activeChapterId: 'chapter-1', activeSectionId: null });

    expect(
      screen.getByRole('button', { name: '1. A violent beginning, perhaps' })
    ).toHaveAttribute('aria-current', 'true');
  });
});
