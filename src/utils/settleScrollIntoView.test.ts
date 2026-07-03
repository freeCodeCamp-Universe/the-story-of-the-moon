import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ANIMATIONS_STORAGE_KEY } from '@/hooks/useAnimationsPreference';
import { settleScrollIntoView } from '@/utils/settleScrollIntoView';

/**
 * Builds a target whose viewport position is controllable per test. `top`
 * simulates where layout currently places the element; an instant snap resets
 * it to the rest position (0, the scroll-padding offset jsdom reports).
 */
function setupTarget(initialTop: number) {
  const target = document.createElement('section');
  let top = initialTop;
  const scrollSpy = vi.fn((options?: ScrollIntoViewOptions) => {
    if (options?.behavior === 'instant') top = 0;
  });
  target.scrollIntoView = scrollSpy as typeof target.scrollIntoView;
  target.getBoundingClientRect = () => ({ top, height: 0 }) as DOMRect;
  document.body.append(target);

  return {
    target,
    scrollSpy,
    setTop(value: number) {
      top = value;
    },
  };
}

function instantCalls(scrollSpy: ReturnType<typeof vi.fn>) {
  return scrollSpy.mock.calls.filter(
    ([options]) => (options as ScrollIntoViewOptions)?.behavior === 'instant'
  );
}

describe('settleScrollIntoView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('innerHeight', 1000);
  });

  afterEach(() => {
    // Flush any armed watcher so its listeners and timers are removed before
    // the next test, then restore time.
    vi.runAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    window.localStorage.removeItem(ANIMATIONS_STORAGE_KEY);
    document.body.innerHTML = '';
  });

  it('should start a smooth scroll toward the target', () => {
    const { target, scrollSpy } = setupTarget(300);

    settleScrollIntoView(target);

    expect(scrollSpy).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'smooth',
    });
  });

  it('should re-snap after scrollend when the target lands off its rest position', () => {
    const { target, scrollSpy } = setupTarget(300);

    settleScrollIntoView(target);
    window.dispatchEvent(new Event('scrollend'));

    expect(instantCalls(scrollSpy)).toHaveLength(1);
  });

  it('should not re-snap when the target already rests at its position', () => {
    const { target, scrollSpy } = setupTarget(0);

    settleScrollIntoView(target);
    window.dispatchEvent(new Event('scrollend'));
    vi.runAllTimers();

    expect(instantCalls(scrollSpy)).toHaveLength(0);
  });

  it('should correct even a large landing drift from heavy lazy mounts', () => {
    const { target, scrollSpy } = setupTarget(2500);

    settleScrollIntoView(target);
    window.dispatchEvent(new Event('scrollend'));

    expect(instantCalls(scrollSpy)).toHaveLength(1);
  });

  it('should correct a layout shift that lands after the scroll ends', () => {
    const { target, scrollSpy, setTop } = setupTarget(0);

    settleScrollIntoView(target);
    window.dispatchEvent(new Event('scrollend'));

    // An image finishes mounting just after the landing and pushes the
    // heading down.
    setTop(40);
    vi.advanceTimersByTime(150);

    expect(instantCalls(scrollSpy)).toHaveLength(1);
  });

  it('should stop watching once the settle window closes', () => {
    const { target, scrollSpy, setTop } = setupTarget(0);

    settleScrollIntoView(target);
    window.dispatchEvent(new Event('scrollend'));
    vi.advanceTimersByTime(700);

    setTop(40);
    vi.advanceTimersByTime(500);

    expect(instantCalls(scrollSpy)).toHaveLength(0);
  });

  it('should fall back to a timeout when scrollend never fires', () => {
    const { target, scrollSpy } = setupTarget(300);

    settleScrollIntoView(target);
    vi.advanceTimersByTime(1300);

    expect(instantCalls(scrollSpy)).toHaveLength(1);
  });

  it('should cancel the correction when the reader takes over', () => {
    const { target, scrollSpy } = setupTarget(300);

    settleScrollIntoView(target);
    window.dispatchEvent(new Event('wheel'));
    window.dispatchEvent(new Event('scrollend'));
    vi.runAllTimers();

    expect(instantCalls(scrollSpy)).toHaveLength(0);
  });

  it('should cancel a pending correction when a newer scroll starts', () => {
    const first = setupTarget(300);
    const second = setupTarget(300);

    settleScrollIntoView(first.target);
    settleScrollIntoView(second.target);
    window.dispatchEvent(new Event('scrollend'));

    expect(instantCalls(first.scrollSpy)).toHaveLength(0);
    expect(instantCalls(second.scrollSpy)).toHaveLength(1);
  });

  it('should scroll without smooth behavior under reduced motion', () => {
    window.localStorage.setItem(ANIMATIONS_STORAGE_KEY, 'false');
    const { target, scrollSpy } = setupTarget(300);

    settleScrollIntoView(target);

    expect(scrollSpy).toHaveBeenCalledWith({
      block: 'start',
      behavior: 'auto',
    });
  });

  it('should center the target when asked and re-snap to center', () => {
    const { target, scrollSpy } = setupTarget(300);

    settleScrollIntoView(target, { block: 'center' });
    window.dispatchEvent(new Event('scrollend'));

    expect(scrollSpy).toHaveBeenCalledWith({
      block: 'center',
      behavior: 'smooth',
    });
    expect(scrollSpy).toHaveBeenCalledWith({
      block: 'center',
      behavior: 'instant',
    });
  });
});
