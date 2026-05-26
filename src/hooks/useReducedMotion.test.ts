import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useReducedMotion } from '@/hooks/useReducedMotion';

describe('useReducedMotion', () => {
  let matches = false;
  let listeners = new Set<(event: MediaQueryListEvent) => void>();
  let addEventListener: ReturnType<typeof vi.fn>;
  let removeEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matches = false;
    listeners = new Set();
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
  });

  it('should read the current reduced-motion preference on the initial render', () => {
    matches = true;

    const { result } = renderHook(() => useReducedMotion());

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
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

  it('should remove the media query listener when the hook unmounts', () => {
    const { unmount } = renderHook(() => useReducedMotion());

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    const handler = addEventListener.mock.calls[0]?.[1];

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', handler);
  });
});
