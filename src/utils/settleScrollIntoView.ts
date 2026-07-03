import { prefersReducedMotion } from '@/hooks/useReducedMotion';

/** Position changes at or below this are treated as already at rest. */
const REST_EPSILON_PX = 1;
/** How often the post-landing watcher re-checks the target's position. */
const WATCH_INTERVAL_MS = 100;
/** How long after landing the watcher keeps correcting late layout shifts. */
const WATCH_DURATION_MS = 600;
/**
 * Fallback delay before the watcher starts when `scrollend` never fires —
 * Safari without scrollend support, or a call that causes no scroll at all.
 * Long enough to outlast a cross-page smooth flight.
 */
const FLIGHT_FALLBACK_MS = 1200;
/** Reduced-motion scrolls land synchronously; start the watcher right away. */
const REDUCED_FLIGHT_FALLBACK_MS = 50;

/** Reader input that means the scroll is no longer ours to correct. */
const INTERRUPT_EVENTS = [
  'wheel',
  'touchstart',
  'keydown',
  'mousedown',
] as const;

let cancelActiveSettle: (() => void) | null = null;

type Options = {
  /** Vertical alignment for the landing, as in `scrollIntoView`. */
  block?: 'start' | 'center';
};

function navOffset() {
  return (
    parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  );
}

/**
 * `scrollIntoView` with a landing correction. Chapter visuals lazy-mount as
 * they near the viewport and shift layout while a scroll is in flight, so a
 * plain smooth `scrollIntoView` — whose destination is computed once, at call
 * time — can settle short of the target's rest position. Once motion stops
 * (`scrollend`, with a timeout fallback where it never fires), the target is
 * re-snapped instantly, and a short watcher keeps re-snapping so a mount that
 * completes just after the landing is corrected too. Any reader input (wheel,
 * touch, key, pointer) or a newer `settleScrollIntoView` call cancels the
 * correction outright, so it never fights the reader for control. Scrolls
 * instantly under reduced motion.
 */
export function settleScrollIntoView(
  target: HTMLElement,
  { block = 'start' }: Options = {}
): void {
  cancelActiveSettle?.();

  const reduced = prefersReducedMotion();
  target.scrollIntoView({ block, behavior: reduced ? 'auto' : 'smooth' });

  const snap = () => target.scrollIntoView({ block, behavior: 'instant' });

  // Distance between the target's current position and where an instant
  // scrollIntoView would rest it. `scroll-padding-top` (the fixed-nav offset)
  // insets the viewing region for both alignments. Lazy mounts under a long
  // flight can leave the landing off by more than a full viewport, so any
  // drift is corrected — reader takeover is detected by input events, not by
  // distance.
  const driftFromRest = () => {
    const rect = target.getBoundingClientRect();
    if (block === 'center') {
      const offset = navOffset();
      const restCenter = offset + (window.innerHeight - offset) / 2;
      return Math.abs(rect.top + rect.height / 2 - restCenter);
    }
    return Math.abs(rect.top - navOffset());
  };

  let flightTimeoutId: number | null = null;
  let watchIntervalId: number | null = null;
  let watchTimeoutId: number | null = null;

  const cleanup = () => {
    window.removeEventListener('scrollend', beginWatch);
    for (const type of INTERRUPT_EVENTS) {
      window.removeEventListener(type, cleanup, true);
    }
    if (flightTimeoutId !== null) window.clearTimeout(flightTimeoutId);
    if (watchIntervalId !== null) window.clearInterval(watchIntervalId);
    if (watchTimeoutId !== null) window.clearTimeout(watchTimeoutId);
    if (cancelActiveSettle === cleanup) cancelActiveSettle = null;
  };

  function beginWatch() {
    window.removeEventListener('scrollend', beginWatch);
    if (flightTimeoutId !== null) {
      window.clearTimeout(flightTimeoutId);
      flightTimeoutId = null;
    }

    if (driftFromRest() > REST_EPSILON_PX) snap();

    let restTop = target.getBoundingClientRect().top;
    watchIntervalId = window.setInterval(() => {
      const top = target.getBoundingClientRect().top;
      if (Math.abs(top - restTop) > REST_EPSILON_PX) {
        snap();
        restTop = target.getBoundingClientRect().top;
      }
    }, WATCH_INTERVAL_MS);
    watchTimeoutId = window.setTimeout(cleanup, WATCH_DURATION_MS);
  }

  cancelActiveSettle = cleanup;
  for (const type of INTERRUPT_EVENTS) {
    window.addEventListener(type, cleanup, { capture: true, passive: true });
  }
  window.addEventListener('scrollend', beginWatch);
  flightTimeoutId = window.setTimeout(
    beginWatch,
    reduced ? REDUCED_FLIGHT_FALLBACK_MS : FLIGHT_FALLBACK_MS
  );
}
