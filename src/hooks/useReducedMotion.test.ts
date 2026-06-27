import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ANIMATIONS_PREFERENCE_EVENT,
  ANIMATIONS_STORAGE_KEY,
} from '@/hooks/useAnimationsPreference';
import { useReducedMotion } from '@/hooks/useReducedMotion';

describe('useReducedMotion', () => {
  let matches = false;
  let listeners = new Set<(event: MediaQueryListEvent) => void>();
  let addEventListener: ReturnType<typeof vi.fn>;
  let removeEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matches = false;
    listeners = new Set();
    window.localStorage.clear();
    addEventListener = vi.fn((event, listener) => {
      if (event === 'change') {
        listeners.add(listener as (event: MediaQueryListEvent) => void);
      }
    });
    removeEventListener = vi.fn((event, listener) => {
      if (event === 'change') {
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      }
    });

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        get matches() {
          return matches;
        },
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener,
        removeEventListener,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('should read the current reduced-motion preference on the initial render', () => {
    matches = true;

    const { result } = renderHook(() => useReducedMotion());

    expect(window.matchMedia).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)'
    );
    expect(result.current).toBe(true);
  });

  it('should update when the reduced-motion media query changes', () => {
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      matches = true;

      for (const listener of listeners) {
        listener({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(true);

    act(() => {
      matches = false;

      for (const listener of listeners) {
        listener({ matches: false } as MediaQueryListEvent);
      }
    });

    expect(result.current).toBe(false);
  });

  it('should report reduced motion when the user disables animations', () => {
    window.localStorage.setItem(ANIMATIONS_STORAGE_KEY, 'false');

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('should update when the animations preference changes at runtime', () => {
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      window.localStorage.setItem(ANIMATIONS_STORAGE_KEY, 'false');
      window.dispatchEvent(new Event(ANIMATIONS_PREFERENCE_EVENT));
    });

    expect(result.current).toBe(true);

    act(() => {
      window.localStorage.setItem(ANIMATIONS_STORAGE_KEY, 'true');
      window.dispatchEvent(new Event(ANIMATIONS_PREFERENCE_EVENT));
    });

    expect(result.current).toBe(false);
  });

  it('should remove the media query listener when the hook unmounts', () => {
    const { unmount } = renderHook(() => useReducedMotion());

    expect(addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    const handler = addEventListener.mock.calls[0]?.[1];

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', handler);
  });
});
