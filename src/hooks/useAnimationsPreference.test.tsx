import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  ANIMATIONS_STORAGE_KEY,
  REDUCED_MOTION_ATTRIBUTE,
  useAnimationsPreference,
} from '@/hooks/useAnimationsPreference';

function PreferenceHarness() {
  const { animationsEnabled, setAnimationsEnabled } = useAnimationsPreference();

  return (
    <>
      <output aria-label="animations-state">
        {animationsEnabled ? 'on' : 'off'}
      </output>
      <button
        type="button"
        onClick={() => setAnimationsEnabled((current) => !current)}
      >
        Toggle animations
      </button>
    </>
  );
}

describe('useAnimationsPreference', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute(REDUCED_MOTION_ATTRIBUTE);
  });

  afterEach(() => {
    document.documentElement.removeAttribute(REDUCED_MOTION_ATTRIBUTE);
  });

  it('should default to animations enabled with no reduced-motion attribute set', () => {
    render(<PreferenceHarness />);

    expect(screen.getByLabelText('animations-state')).toHaveTextContent('on');
    expect(
      document.documentElement.hasAttribute(REDUCED_MOTION_ATTRIBUTE)
    ).toBe(false);
  });

  it('should read the saved preference from localStorage', () => {
    window.localStorage.setItem(ANIMATIONS_STORAGE_KEY, 'false');

    render(<PreferenceHarness />);

    expect(screen.getByLabelText('animations-state')).toHaveTextContent('off');
    expect(
      document.documentElement.hasAttribute(REDUCED_MOTION_ATTRIBUTE)
    ).toBe(true);
  });

  it('should persist updates and reflect them on the document element', async () => {
    const user = userEvent.setup();

    render(<PreferenceHarness />);

    await user.click(screen.getByRole('button', { name: 'Toggle animations' }));

    expect(screen.getByLabelText('animations-state')).toHaveTextContent('off');
    expect(window.localStorage.getItem(ANIMATIONS_STORAGE_KEY)).toBe('false');
    expect(
      document.documentElement.hasAttribute(REDUCED_MOTION_ATTRIBUTE)
    ).toBe(true);
  });
});
