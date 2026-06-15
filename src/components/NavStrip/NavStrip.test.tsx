import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { NavStrip } from '@/components/NavStrip/NavStrip';

const originalNavigatorPlatform = window.navigator.platform;
const originalDialogShowModal = globalThis.HTMLDialogElement?.prototype.showModal;
const originalDialogClose = globalThis.HTMLDialogElement?.prototype.close;

function setupChapterTargets() {
  const scrollSpies = new Map<string, ReturnType<typeof vi.fn>>();

  for (let i = 1; i <= 7; i += 1) {
    const id = `chapter-${i}`;
    const section = document.createElement('section');
    section.id = id;
    const scrollSpy = vi.fn();
    section.scrollIntoView = scrollSpy;
    scrollSpies.set(id, scrollSpy);
    document.body.append(section);
  }

  return scrollSpies;
}

function NavStripHarness() {
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  return <NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled={shortcutsEnabled} onShortcutsEnabledChange={setShortcutsEnabled} animationsEnabled={animationsEnabled} onAnimationsEnabledChange={setAnimationsEnabled} />;
}

describe('NavStrip', () => {
  beforeAll(() => {
    if (globalThis.HTMLDialogElement && typeof globalThis.HTMLDialogElement.prototype.showModal !== 'function') {
      Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'showModal', {
        configurable: true,
        value() {
          this.setAttribute('open', '');
        },
      });
    }

    if (globalThis.HTMLDialogElement && typeof globalThis.HTMLDialogElement.prototype.close !== 'function') {
      Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
        configurable: true,
        value() {
          this.removeAttribute('open');
          this.dispatchEvent(new Event('close'));
        },
      });
    }
  });

  afterAll(() => {
    if (globalThis.HTMLDialogElement) {
      if (originalDialogShowModal) {
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'showModal', {
          configurable: true,
          value: originalDialogShowModal,
        });
      } else {
        Reflect.deleteProperty(globalThis.HTMLDialogElement.prototype, 'showModal');
      }

      if (originalDialogClose) {
        Object.defineProperty(globalThis.HTMLDialogElement.prototype, 'close', {
          configurable: true,
          value: originalDialogClose,
        });
      } else {
        Reflect.deleteProperty(globalThis.HTMLDialogElement.prototype, 'close');
      }
    }
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    Object.defineProperty(window.navigator, 'platform', {
      configurable: true,
      value: originalNavigatorPlatform,
    });

    vi.restoreAllMocks();
  });

  it('should show the story title as the page heading and preserve the chapter nav landmark', () => {
    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'The Story of the Moon' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Chapters' })).toBeInTheDocument();
    expect(screen.queryByLabelText('previous chapter')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('next chapter')).not.toBeInTheDocument();
  });

  it('should open the chapter dropdown and navigate to the selected chapter', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const scrollSpies = setupChapterTargets();

    render(<NavStrip activeChapterId="chapter-2" onNavigate={onNavigate} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /open chapter list/i }));
    await user.click(screen.getByRole('button', { name: '3. A partner that steadies Earth' }));

    expect(onNavigate).toHaveBeenCalledWith('chapter-3');
    expect(scrollSpies.get('chapter-3')).toHaveBeenCalledWith({
      behavior: 'smooth',
    });
  });

  it('should close the chapter dropdown when clicking elsewhere in the header', async () => {
    const user = userEvent.setup();

    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /open chapter list/i }));
    expect(screen.getByRole('button', { name: '3. A partner that steadies Earth' })).toBeInTheDocument();

    await user.click(screen.getByText('The Story of the Moon'));

    expect(screen.queryByRole('button', { name: '3. A partner that steadies Earth' })).not.toBeInTheDocument();
  });

  it('should show next, previous, and direct chapter keyboard shortcuts', async () => {
    const user = userEvent.setup();

    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));

    const showDialogAction = screen.getByText('Show keyboard shortcuts');
    const showDialogRow = showDialogAction.closest('div');

    expect(showDialogRow).not.toBeNull();
    expect(within(showDialogRow as HTMLElement).getByText('Shift', { selector: 'kbd' })).toBeInTheDocument();
    expect(within(showDialogRow as HTMLElement).getByText('/', { selector: 'kbd' })).toBeInTheDocument();
    expect(screen.getByText('Jump directly to chapters 1 through 7')).toBeInTheDocument();
    expect(screen.getByText('Go to the next chapter')).toBeInTheDocument();
    expect(screen.getByText('Go to the previous chapter')).toBeInTheDocument();
  });

  it('should open the keyboard shortcuts dialog with the common question-mark shortcut', () => {
    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    fireEvent.keyDown(window, { key: '?', shiftKey: true });

    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument();
  });

  it('should open the keyboard shortcuts dialog when focus is on nav buttons', () => {
    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    const chapterButton = screen.getByRole('button', { name: /open chapter list/i });
    chapterButton.focus();
    fireEvent.keyDown(chapterButton, { key: '?', shiftKey: true });

    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close keyboard shortcuts/i }));

    const shortcutsButton = screen.getByRole('button', { name: /show keyboard shortcuts/i });
    shortcutsButton.focus();
    fireEvent.keyDown(shortcutsButton, { key: '?', shiftKey: true });

    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
  });

  it('should keep focus trapped inside the keyboard shortcuts dialog', async () => {
    const user = userEvent.setup();

    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));

    const closeButton = screen.getByRole('button', { name: /close keyboard shortcuts/i });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();
  });

  it('should not expose the shortcuts toggle from the keyboard shortcuts dialog', async () => {
    const user = userEvent.setup();

    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));

    expect(screen.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: /enable global keyboard shortcuts/i })).not.toBeInTheDocument();
  });

  it('should open the settings dialog from the settings button', async () => {
    const user = userEvent.setup();

    render(<NavStripHarness />);

    await user.click(screen.getByRole('button', { name: /open settings/i }));

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: /enable global keyboard shortcuts/i })).toHaveAccessibleDescription(/keyboard shortcuts anywhere in the story/i);
    expect(screen.getByRole('switch', { name: /enable animations/i })).toHaveAccessibleDescription(/motion and transitions play/i);
  });

  it('should keep focus trapped inside the settings dialog', async () => {
    const user = userEvent.setup();

    render(<NavStripHarness />);

    await user.click(screen.getByRole('button', { name: /open settings/i }));

    const closeButton = screen.getByRole('button', { name: /close settings/i });
    const shortcutsToggle = screen.getByRole('switch', { name: /enable global keyboard shortcuts/i });
    const animationsToggle = screen.getByRole('switch', { name: /enable animations/i });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(shortcutsToggle).toHaveFocus();

    await user.tab();
    expect(animationsToggle).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(animationsToggle).toHaveFocus();

    await user.tab({ shift: true });
    expect(shortcutsToggle).toHaveFocus();

    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();
  });

  it('should let the user disable animations from the settings dialog', async () => {
    const user = userEvent.setup();

    render(<NavStripHarness />);

    await user.click(screen.getByRole('button', { name: /open settings/i }));

    const toggle = screen.getByRole('switch', { name: /enable animations/i });
    expect(toggle).toBeChecked();

    await user.click(toggle);

    expect(toggle).not.toBeChecked();
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('should let the user disable global keyboard shortcuts from the settings dialog', async () => {
    const user = userEvent.setup();

    render(<NavStripHarness />);

    await user.click(screen.getByRole('button', { name: /open settings/i }));

    const toggle = screen.getByRole('switch', { name: /enable global keyboard shortcuts/i });
    expect(toggle).toBeChecked();

    await user.click(toggle);
    expect(toggle).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: /close settings/i }));
    expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();

    fireEvent.keyDown(window, { key: '?', shiftKey: true });
    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument();
  });

  it('should keep the settings dialog open when toggling shortcuts with the keyboard', async () => {
    const user = userEvent.setup();

    render(<NavStripHarness />);

    await user.click(screen.getByRole('button', { name: /open settings/i }));

    const toggle = screen.getByRole('switch', { name: /enable global keyboard shortcuts/i });

    await user.tab();
    expect(toggle).toHaveFocus();

    await user.keyboard(' ');

    expect(toggle).not.toBeChecked();
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(toggle).toHaveFocus();
  });

  it('should restore focus to the trigger when the dialog is dismissed by the browser', () => {
    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    const shortcutsButton = screen.getByRole('button', { name: /show keyboard shortcuts/i });
    fireEvent.click(shortcutsButton);

    const dialog = screen.getByRole('dialog', { name: 'Keyboard shortcuts' });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument();
    expect(shortcutsButton).toHaveFocus();
  });

  it('should close the dialog when the backdrop is clicked', () => {
    render(<NavStrip activeChapterId="chapter-2" onNavigate={vi.fn()} shortcutsEnabled onShortcutsEnabledChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /show keyboard shortcuts/i }));

    const dialog = screen.getByRole('dialog', { name: 'Keyboard shortcuts' });
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      top: 50,
      right: 250,
      bottom: 250,
      left: 50,
      toJSON: () => ({}),
    });

    fireEvent.click(dialog, { clientX: 10, clientY: 10 });

    expect(screen.queryByRole('dialog', { name: 'Keyboard shortcuts' })).not.toBeInTheDocument();
  });
});
