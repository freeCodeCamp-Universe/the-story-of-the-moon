import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { THEME_STORAGE_KEY, useTheme } from '@/hooks/useTheme';

describe('useTheme', () => {
  let matches = false;
  let listeners = new Set<(event: MediaQueryListEvent) => void>();
  let addEventListener: ReturnType<typeof vi.fn>;
  let removeEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matches = false;
    listeners = new Set();
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');

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
        media: '(prefers-color-scheme: dark)',
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
    document.documentElement.removeAttribute('data-theme');
  });

  it('should default to dark when system prefers dark and no localStorage value', () => {
    matches = true;

    const { result } = renderHook(() => useTheme());

    expect(result.current.darkThemeEnabled).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('should default to light when system prefers light and no localStorage value', () => {
    matches = false;

    const { result } = renderHook(() => useTheme());

    expect(result.current.darkThemeEnabled).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should read explicit dark preference from localStorage over system light', () => {
    matches = false;
    window.localStorage.setItem(THEME_STORAGE_KEY, 'true');

    const { result } = renderHook(() => useTheme());

    expect(result.current.darkThemeEnabled).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('should read explicit light preference from localStorage over system dark', () => {
    matches = true;
    window.localStorage.setItem(THEME_STORAGE_KEY, 'false');

    const { result } = renderHook(() => useTheme());

    expect(result.current.darkThemeEnabled).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should update localStorage and data-theme when the setter is called', () => {
    matches = true;
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setDarkThemeEnabled(false);
    });

    expect(result.current.darkThemeEnabled).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('false');
  });

  it('should respond to system preference changes when no explicit preference is stored', () => {
    matches = false;
    const { result } = renderHook(() => useTheme());

    expect(result.current.darkThemeEnabled).toBe(false);

    act(() => {
      matches = true;
      for (const listener of listeners) {
        listener({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current.darkThemeEnabled).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('should not respond to system preference changes when an explicit preference is stored', () => {
    matches = false;
    window.localStorage.setItem(THEME_STORAGE_KEY, 'false');

    const { result } = renderHook(() => useTheme());

    act(() => {
      matches = true;
      for (const listener of listeners) {
        listener({ matches: true } as MediaQueryListEvent);
      }
    });

    expect(result.current.darkThemeEnabled).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('should remove the media query listener when the hook unmounts', () => {
    const { unmount } = renderHook(() => useTheme());

    expect(addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    const handler = addEventListener.mock.calls[0]?.[1];

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('change', handler);
  });
});
