import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  KEYBOARD_SHORTCUTS_STORAGE_KEY,
  useKeyboardShortcutsPreference,
} from '@/hooks/useKeyboardShortcutsPreference';

function PreferenceHarness() {
  const { shortcutsEnabled, setShortcutsEnabled } =
    useKeyboardShortcutsPreference();

  return (
    <>
      <output aria-label="shortcut-state">
        {shortcutsEnabled ? 'on' : 'off'}
      </output>
      <button
        type="button"
        onClick={() => setShortcutsEnabled((current) => !current)}
      >
        Toggle shortcuts
      </button>
    </>
  );
}

describe('useKeyboardShortcutsPreference', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should read the saved preference from localStorage', () => {
    window.localStorage.setItem(KEYBOARD_SHORTCUTS_STORAGE_KEY, 'false');

    render(<PreferenceHarness />);

    expect(screen.getByLabelText('shortcut-state')).toHaveTextContent('off');
  });

  it('should persist updates to localStorage', async () => {
    const user = userEvent.setup();

    render(<PreferenceHarness />);

    await user.click(screen.getByRole('button', { name: 'Toggle shortcuts' }));

    expect(screen.getByLabelText('shortcut-state')).toHaveTextContent('off');
    expect(window.localStorage.getItem(KEYBOARD_SHORTCUTS_STORAGE_KEY)).toBe(
      'false'
    );
  });
});
