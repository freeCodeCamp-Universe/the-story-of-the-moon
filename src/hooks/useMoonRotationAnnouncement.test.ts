import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMoonRotationAnnouncement } from '@/hooks/useMoonRotationAnnouncement';
import type { MoonSceneHandle } from '@/three/moonScene';

function createSceneRef(getCameraLatLon: MoonSceneHandle) {
  return { current: getCameraLatLon };
}

describe('useMoonRotationAnnouncement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should announce the scene camera position after the debounce window', () => {
    const sceneRef = createSceneRef({
      getCameraLatLon: () => ({ lat: 12.3, lon: -45.6 }),
    } as unknown as MoonSceneHandle);

    const { result } = renderHook(() => useMoonRotationAnnouncement(sceneRef));

    expect(result.current.announcement).toBe('');

    act(() => {
      result.current.scheduleAnnouncement();
    });
    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(result.current.announcement).toBe('');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.announcement).toContain('Viewing 12.3°N 45.6°W');
  });

  it('should restart the debounce window on repeated scheduling', () => {
    const sceneRef = createSceneRef({
      getCameraLatLon: () => ({ lat: 0, lon: 0 }),
    } as unknown as MoonSceneHandle);

    const { result } = renderHook(() => useMoonRotationAnnouncement(sceneRef));

    act(() => {
      result.current.scheduleAnnouncement();
    });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    act(() => {
      result.current.scheduleAnnouncement();
    });
    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(result.current.announcement).toBe('');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.announcement).not.toBe('');
  });

  it('should toggle a trailing zero-width space so repeated identical text still changes', () => {
    const sceneRef = createSceneRef({
      getCameraLatLon: () => ({ lat: 0, lon: 0 }),
    } as unknown as MoonSceneHandle);

    const { result } = renderHook(() => useMoonRotationAnnouncement(sceneRef));

    act(() => {
      result.current.scheduleAnnouncement();
      vi.advanceTimersByTime(600);
    });
    const first = result.current.announcement;

    act(() => {
      result.current.scheduleAnnouncement();
      vi.advanceTimersByTime(600);
    });
    const second = result.current.announcement;

    expect(first).not.toBe(second);
    expect(first.replace('​', '')).toBe(second.replace('​', ''));
  });

  it('should cancel a pending announcement without clearing existing text', () => {
    const sceneRef = createSceneRef({
      getCameraLatLon: () => ({ lat: 5, lon: 5 }),
    } as unknown as MoonSceneHandle);

    const { result } = renderHook(() => useMoonRotationAnnouncement(sceneRef));

    act(() => {
      result.current.scheduleAnnouncement();
      vi.advanceTimersByTime(600);
    });
    expect(result.current.announcement).not.toBe('');

    act(() => {
      result.current.scheduleAnnouncement();
      result.current.cancelAnnouncement();
      vi.advanceTimersByTime(600);
    });
    expect(result.current.announcement).not.toBe('');
  });

  it('should clear both the pending timer and the announced text', () => {
    const sceneRef = createSceneRef({
      getCameraLatLon: () => ({ lat: 5, lon: 5 }),
    } as unknown as MoonSceneHandle);

    const { result } = renderHook(() => useMoonRotationAnnouncement(sceneRef));

    act(() => {
      result.current.scheduleAnnouncement();
      vi.advanceTimersByTime(600);
    });
    expect(result.current.announcement).not.toBe('');

    act(() => {
      result.current.clearAnnouncement();
    });
    expect(result.current.announcement).toBe('');
  });

  it('should do nothing when the scene handle is not ready yet', () => {
    const sceneRef = createSceneRef(null);

    const { result } = renderHook(() => useMoonRotationAnnouncement(sceneRef));

    act(() => {
      result.current.scheduleAnnouncement();
      vi.advanceTimersByTime(600);
    });
    expect(result.current.announcement).toBe('');
  });
});
